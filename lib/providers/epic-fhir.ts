/**
 * Epic FHIR R4 Provider
 *
 * Connect ShiftView to any Epic-based hospital system.
 *
 * Required environment variables (.env.local):
 *   DATA_PROVIDER=epic
 *   EPIC_FHIR_BASE_URL=https://your-hospital.epic.com/api/FHIR/R4
 *   EPIC_CLIENT_ID=your-client-id
 *   EPIC_CLIENT_SECRET=your-client-secret  (backend app, or omit for SMART)
 *   EPIC_ICU_WARD_ID=your-ward-or-location-id
 *
 * For SMART on FHIR (browser-based OAuth):
 *   EPIC_SMART_LAUNCH=true
 *   EPIC_REDIRECT_URI=https://your-shiftview-domain.com/api/auth/callback
 *
 * Epic FHIR docs: https://fhir.epic.com/
 * SMART on FHIR: https://smarthealthit.org/
 */

import type { PatientProvider, PatientSummary, PatientDetail, TimelineEntry } from './types'

const BASE_URL = process.env.EPIC_FHIR_BASE_URL
const CLIENT_ID = process.env.EPIC_CLIENT_ID
const CLIENT_SECRET = process.env.EPIC_CLIENT_SECRET
const WARD_ID = process.env.EPIC_ICU_WARD_ID

let _token: string | null = null
let _tokenExpiry = 0

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token
  const resp = await fetch(`${BASE_URL}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'system/Patient.read system/Observation.read system/MedicationRequest.read system/DiagnosticReport.read system/DocumentReference.read',
    }),
  })
  const data = await resp.json()
  _token = data.access_token
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
  return _token!
}

async function fhirGet(path: string) {
  const token = await getToken()
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/fhir+json' },
  })
  if (!resp.ok) throw new Error(`FHIR ${path} → ${resp.status}`)
  return resp.json()
}

// ----- FHIR → ShiftView mappers -----

function mapCodeStatus(patient: Record<string, unknown>): string {
  // Epic stores code status as a condition or flag; this is a simplified read
  // from the patient extension. Real impl should query Condition?code=do-not-resuscitate
  const ext = (patient.extension as Array<Record<string, unknown>> | undefined) || []
  const codeExt = ext.find((e: Record<string, unknown>) => (e.url as string)?.includes('codeStatus'))
  return (codeExt?.valueString as string) || 'Full Code'
}

function mapTimeline(diagnosticReports: Record<string, unknown>[], docRefs: Record<string, unknown>[]): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  for (const report of diagnosticReports) {
    const category = ((report.category as Array<Record<string, unknown>>)?.[0]?.coding as Array<Record<string, unknown>>)?.[0]?.code as string
    const isImaging = category === 'RAD' || category === 'imaging'
    const conclusion = (report.conclusion as string) || (report.result as string) || 'Result pending'
    entries.push({
      date: ((report.effectiveDateTime as string) || '').slice(5, 10).replace('-', '/'),
      event: `${(report.code as Record<string, unknown>)?.text as string || 'Imaging'}: ${conclusion}`,
      type: isImaging ? 'imaging' : 'procedure',
    })
  }

  for (const doc of docRefs) {
    const type = ((doc.type as Record<string, unknown>)?.text as string) || 'Note'
    if (!type.toLowerCase().includes('progress') && !type.toLowerCase().includes('physician')) continue
    const content = ((doc.content as Array<Record<string, unknown>>)?.[0]?.attachment as Record<string, unknown>)?.data as string || ''
    const decoded = content ? Buffer.from(content, 'base64').toString('utf-8').slice(0, 200) : 'See chart'
    entries.push({
      date: ((doc.date as string) || '').slice(5, 10).replace('-', '/'),
      event: `${type}: ${decoded}`,
      type: 'note',
    })
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date))
}

export const epicFhirProvider: PatientProvider = {
  name: 'Epic FHIR R4',

  async listPatients(): Promise<PatientSummary[]> {
    const locationFilter = WARD_ID ? `&location=${WARD_ID}` : ''
    const bundle = await fhirGet(`/Encounter?status=in-progress${locationFilter}&_include=Encounter:patient`)

    const patients: PatientSummary[] = []
    for (const entry of (bundle.entry || []) as Array<Record<string, unknown>>) {
      const resource = entry.resource as Record<string, unknown>
      if ((resource.resourceType as string) !== 'Patient') continue
      patients.push({
        id: resource.id as string,
        name: `${((resource.name as Array<Record<string, unknown>>)?.[0]?.family as string)}, ${((resource.name as Array<Record<string, unknown>>)?.[0]?.given as string[])?.join(' ')}`,
        age: resource.birthDate ? Math.floor((Date.now() - new Date(resource.birthDate as string).getTime()) / 31557600000) : 0,
        room: 'TBD', // pulled from Encounter.location
        diagnosis: 'See chart',
        attending: 'See chart',
        admitDate: '',
        admitSource: '',
        codeStatus: mapCodeStatus(resource),
        allergies: [],
        familyContact: '',
        familyPhone: '',
        handoffStatus: 'pending',
        hasPositiveCulture: false,
        pressorCount: 0,
        isIntubated: false,
        bpTrend: 'stable',
      })
    }
    return patients
  },

  async getPatient(id: string): Promise<PatientDetail | null> {
    const [patient, observations, diagnosticReports, docRefs] = await Promise.all([
      fhirGet(`/Patient/${id}`),
      fhirGet(`/Observation?patient=${id}&category=vital-signs&_sort=-date&_count=50`),
      fhirGet(`/DiagnosticReport?patient=${id}&_sort=-date&_count=20`),
      fhirGet(`/DocumentReference?patient=${id}&_sort=-date&_count=20`),
    ])

    const obs = (observations.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
    const latestVital = (code: string) => obs.find((o: Record<string, unknown>) => ((o.code as Record<string, unknown>)?.coding as Array<Record<string, unknown>>)?.[0]?.code === code)

    const bp = latestVital('55284-4')
    const hr = latestVital('8867-4')

    return {
      id: patient.id,
      name: `${patient.name?.[0]?.family}, ${patient.name?.[0]?.given?.join(' ')}`,
      age: patient.birthDate ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / 31557600000) : 0,
      room: 'ICU',
      diagnosis: 'See chart',
      attending: 'See chart',
      admitDate: '',
      admitSource: '',
      codeStatus: mapCodeStatus(patient),
      allergies: [],
      familyContact: '',
      familyPhone: '',
      handoffStatus: 'pending',
      hasPositiveCulture: false,
      pressorCount: 0,
      isIntubated: false,
      bpTrend: 'stable',
      neuro: { checkFreq: 'Per orders', lastCheck: 'See flowsheet', lastCheckTime: '', rass: 'See flowsheet', rassGoal: 'Per orders', sedation: 'See MAR' },
      respiratory: { mode: 'See flowsheet', o2Device: 'See flowsheet' },
      cardiac: {
        hr: hr ? `${(hr.valueQuantity as Record<string, unknown>)?.value}/min` : 'See monitor',
        rhythm: 'See telemetry',
        bp: bp ? `${((bp.component as Array<Record<string, unknown>>)?.[0]?.valueQuantity as Record<string, unknown>)?.value}/${((bp.component as Array<Record<string, unknown>>)?.[1]?.valueQuantity as Record<string, unknown>)?.value}` : 'See monitor',
        bpTrend: 'stable',
        pressors: [],
      },
      lines: [],
      drips: [],
      labs: [],
      cultures: [],
      antibiotics: [],
      nutrition: { type: 'See orders', details: '', foleyDate: '', urineOutput: 'See flowsheet', lastBm: 'See flowsheet' },
      skin: [],
      pending: [],
      timeline: mapTimeline(
        (diagnosticReports.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>),
        (docRefs.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
      ),
      outgoingNote: '',
    }
  },

  async saveNote(patientId, note) {
    // POST a DocumentReference to Epic with the note content
    const token = await getToken()
    await fetch(`${BASE_URL}/DocumentReference`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/fhir+json',
      },
      body: JSON.stringify({
        resourceType: 'DocumentReference',
        status: 'current',
        type: { text: 'ShiftView Handoff Note' },
        subject: { reference: `Patient/${patientId}` },
        date: new Date().toISOString(),
        content: [{ attachment: { contentType: 'text/plain', data: Buffer.from(note).toString('base64') } }],
      }),
    })
  },

  async updateHandoffStatus(_patientId, _status) {
    // Store in ShiftView's own DB or as a custom Epic extension
    // Implementation depends on hospital IT policy
    console.log(`[Epic] Handoff status update: ${_patientId} → ${_status}`)
  },
}
