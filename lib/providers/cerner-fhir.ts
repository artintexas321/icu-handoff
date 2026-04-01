/**
 * Cerner FHIR R4 Provider
 *
 * Connect ShiftView to any Cerner Millennium-based hospital system.
 *
 * Required environment variables (.env.local):
 *   DATA_PROVIDER=cerner
 *   CERNER_FHIR_BASE_URL=https://fhir-ehr.cerner.com/r4/your-tenant-id
 *   CERNER_CLIENT_ID=your-client-id
 *   CERNER_CLIENT_SECRET=your-client-secret
 *   CERNER_ICU_LOCATION_ID=your-location-fhir-id
 *
 * Cerner FHIR docs: https://fhir.cerner.com/
 */

import type { PatientProvider, PatientSummary, PatientDetail } from './types'

const BASE_URL = process.env.CERNER_FHIR_BASE_URL
const CLIENT_ID = process.env.CERNER_CLIENT_ID
const CLIENT_SECRET = process.env.CERNER_CLIENT_SECRET
const LOCATION_ID = process.env.CERNER_ICU_LOCATION_ID

let _token: string | null = null
let _tokenExpiry = 0

async function getToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token
  const authUrl = `${BASE_URL?.replace('/r4/', '/oauth2/')}/token`
  const resp = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
      scope: 'system/Patient.read system/Observation.read system/MedicationRequest.read',
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
  if (!resp.ok) throw new Error(`Cerner FHIR ${path} → ${resp.status}`)
  return resp.json()
}

export const cernerFhirProvider: PatientProvider = {
  name: 'Cerner FHIR R4',

  async listPatients(): Promise<PatientSummary[]> {
    const locationFilter = LOCATION_ID ? `&location=${LOCATION_ID}` : ''
    const bundle = await fhirGet(`/Encounter?status=in-progress${locationFilter}&_include=Encounter:patient`)

    return ((bundle.entry || []) as Array<Record<string, unknown>>)
      .map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
      .filter((r: Record<string, unknown>) => r.resourceType === 'Patient')
      .map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: `${((p.name as Array<Record<string, unknown>>)?.[0]?.family as string)}, ${((p.name as Array<Record<string, unknown>>)?.[0]?.given as string[])?.join(' ')}`,
        age: p.birthDate ? Math.floor((Date.now() - new Date(p.birthDate as string).getTime()) / 31557600000) : 0,
        room: 'ICU',
        diagnosis: 'See chart',
        attending: 'See chart',
        admitDate: '',
        admitSource: '',
        codeStatus: 'Full Code',
        allergies: [],
        familyContact: '',
        familyPhone: '',
        handoffStatus: 'pending' as const,
        hasPositiveCulture: false,
        pressorCount: 0,
        isIntubated: false,
        bpTrend: 'stable' as const,
      }))
  },

  async getPatient(id: string): Promise<PatientDetail | null> {
    const patient = await fhirGet(`/Patient/${id}`)
    return {
      id: patient.id,
      name: `${patient.name?.[0]?.family}, ${patient.name?.[0]?.given?.join(' ')}`,
      age: patient.birthDate ? Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / 31557600000) : 0,
      room: 'ICU',
      diagnosis: 'See chart',
      attending: 'See chart',
      admitDate: '',
      admitSource: '',
      codeStatus: 'Full Code',
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
      cardiac: { hr: 'See monitor', rhythm: 'See telemetry', bp: 'See monitor', bpTrend: 'stable', pressors: [] },
      lines: [],
      drips: [],
      labs: [],
      cultures: [],
      antibiotics: [],
      nutrition: { type: 'See orders', details: '', foleyDate: '', urineOutput: 'See flowsheet', lastBm: 'See flowsheet' },
      skin: [],
      pending: [],
      timeline: [],
      pmh: [],
    careTeam: {
      attending: { name: 'See Cerner', service: 'ICU', callback: '' },
      consults: [],
    },
      outgoingNote: '',
    }
  },

  async saveNote(_patientId, _note) {
    console.log(`[Cerner] Note save for ${_patientId} — implement DocumentReference POST`)
  },

  async updateHandoffStatus(_patientId, _status) {
    console.log(`[Cerner] Handoff status: ${_patientId} → ${_status}`)
  },
}
