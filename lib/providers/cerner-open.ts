/**
 * Cerner Open Sandbox Provider
 *
 * Uses Cerner's publicly accessible FHIR R4 sandbox — no auth required.
 * This is for demo/testing only. Real hospital connection requires OAuth.
 *
 * Tenant: Cerner Open Sandbox (ec2458f2-1e24-41c8-b71b-0e701af7583d)
 * Docs: https://docs.oracle.com/en/industries/health/millennium-platform-apis/
 */

import type { PatientProvider, PatientSummary, PatientDetail, TimelineEntry } from './types'

const BASE = 'https://fhir-open.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d'

// Known test patient IDs in Cerner's open sandbox with good clinical data
const TEST_PATIENT_IDS = [
  '12724069', // SMART, TIMMY
  '12724068', // SMART, Harry James  
  '12724066', // SMARTS, NANCY
  '12724070', // SMART, FREDRICK
  '12742400', // PETERS, TIM
]

// ICU room assignments for demo purposes
const ROOM_ASSIGNMENTS: Record<string, string> = {
  '12724069': 'ICU-04',
  '12724068': 'ICU-07',
  '12724066': 'ICU-11',
  '12724070': 'ICU-14',
  '12742400': 'ICU-02',
}

async function fhirGet(path: string) {
  const resp = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/fhir+json' },
    next: { revalidate: 60 }, // cache for 60s
  })
  if (!resp.ok) throw new Error(`Cerner open sandbox ${path} → ${resp.status}`)
  return resp.json()
}

function getName(patient: Record<string, unknown>): string {
  const names = patient.name as Array<Record<string, unknown>> | undefined
  if (!names?.length) return 'Unknown Patient'
  const n = names[0]
  const given = (n.given as string[] | undefined)?.join(' ') || ''
  const family = (n.family as string) || ''
  return `${family}, ${given}`
}

function getAge(patient: Record<string, unknown>): number {
  const dob = patient.birthDate as string | undefined
  if (!dob) return 0
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000)
}

function mapVitals(observations: Record<string, unknown>[]) {
  const find = (text: string) => observations.find(o =>
    ((o.code as Record<string, unknown>)?.text as string || '').toLowerCase().includes(text.toLowerCase())
  )

  const bp = find('blood pressure')
  const hr = find('heart rate') || find('pulse')
  const temp = find('temperature')
  const spo2 = find('oxygen saturation') || find('SpO2') || find('O2 Sat')

  const bpVal = bp ? (() => {
    const comp = bp.component as Array<Record<string, unknown>> | undefined
    if (comp?.length >= 2) {
      const sys = (comp[0].valueQuantity as Record<string, unknown>)?.value
      const dia = (comp[1].valueQuantity as Record<string, unknown>)?.value
      return `${sys}/${dia} mmHg`
    }
    return 'See monitor'
  })() : 'See monitor'

  const hrVal = hr ? `${(hr.valueQuantity as Record<string, unknown>)?.value} bpm` : 'See monitor'
  const spo2Val = spo2 ? `${(spo2.valueQuantity as Record<string, unknown>)?.value}%` : 'See monitor'
  const tempVal = temp ? (() => {
    const v = (temp.valueQuantity as Record<string, unknown>)?.value as number
    const u = (temp.valueQuantity as Record<string, unknown>)?.unit as string
    // Convert to F if celsius
    if (u?.includes('C') || (v && v < 50)) return `${((v * 9/5) + 32).toFixed(1)}°F`
    return `${v}°F`
  })() : null

  return { bpVal, hrVal, spo2Val, tempVal }
}

function mapConditionsToTimeline(conditions: Record<string, unknown>[], patient: Record<string, unknown>): TimelineEntry[] {
  const entries: TimelineEntry[] = []

  // Admission entry from patient record
  const admitDate = (patient.meta as Record<string, unknown>)?.lastUpdated as string
  if (admitDate) {
    entries.push({
      date: admitDate.slice(5, 10).replace('-', '/'),
      event: `Patient record active in system.`,
      type: 'event',
    })
  }

  // Conditions as timeline events
  for (const cond of conditions.slice(0, 6)) {
    const onset = cond.onsetDateTime as string || cond.recordedDate as string
    const text = (cond.code as Record<string, unknown>)?.text as string
    if (!text) continue
    entries.push({
      date: onset ? onset.slice(5, 10).replace('-', '/') : '??/??',
      event: `Dx: ${text}`,
      type: 'note',
      critical: text.toLowerCase().includes('cancer') || text.toLowerCase().includes('sepsis') || text.toLowerCase().includes('failure'),
    })
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date))
}

function mapLabsFromObservations(observations: Record<string, unknown>[]) {
  const labObs = observations.filter(o => {
    const cat = o.category as Array<Record<string, unknown>> | undefined
    return cat?.some(c => (c.coding as Array<Record<string, unknown>>)?.[0]?.code === 'laboratory')
  })

  return labObs.slice(0, 8).map(o => {
    const name = (o.code as Record<string, unknown>)?.text as string || 'Lab'
    const val = o.valueQuantity as Record<string, unknown> | undefined
    const refRange = o.referenceRange as Array<Record<string, unknown>> | undefined
    const high = refRange?.[0]?.high as Record<string, unknown> | undefined
    const low = refRange?.[0]?.low as Record<string, unknown> | undefined
    const value = val?.value as number
    const isHigh = high?.value ? value > (high.value as number) : false
    const isLow = low?.value ? value < (low.value as number) : false

    return {
      name: name.length > 20 ? name.slice(0, 20) : name,
      value: String(value || '?'),
      unit: (val?.unit as string) || '',
      trend: '→' as const,
      abnormal: isHigh || isLow,
    }
  })
}

async function buildPatientDetail(id: string): Promise<PatientDetail> {
  const [patient, vitalsBundle, conditionsBundle, medsBundle, labsBundle] = await Promise.all([
    fhirGet(`/Patient/${id}`),
    fhirGet(`/Observation?patient=${id}&category=vital-signs&_count=20&_sort=-date`),
    fhirGet(`/Condition?patient=${id}&_count=15`),
    fhirGet(`/MedicationRequest?patient=${id}&status=active&_count=15`),
    fhirGet(`/Observation?patient=${id}&category=laboratory&_count=20&_sort=-date`),
  ])

  const vitals = (vitalsBundle.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
  const conditions = (conditionsBundle.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
  const meds = (medsBundle.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)
  const labs = (labsBundle.entry || []).map((e: Record<string, unknown>) => e.resource as Record<string, unknown>)

  const { bpVal, hrVal, spo2Val, tempVal } = mapVitals(vitals)

  // Map active meds to drips (IV meds) vs oral
  const activeMeds = meds.filter(m => m.status === 'active')
  const ivMeds = activeMeds.filter(m => {
    const route = (m.dosageInstruction as Array<Record<string, unknown>>)?.[0]?.route as Record<string, unknown>
    return (route?.text as string || '').toLowerCase().includes('iv') ||
           (route?.text as string || '').toLowerCase().includes('intravenous')
  })
  const drips = ivMeds.slice(0, 6).map(m => ({
    name: (m.medicationCodeableConcept as Record<string, unknown>)?.text as string || 'IV Med',
    concentration: 'Per pharmacy',
    rate: (m.dosageInstruction as Array<Record<string, unknown>>)?.[0]?.text as string || 'Per orders',
  }))

  const primaryDx = conditions[0] ? (conditions[0].code as Record<string, unknown>)?.text as string : 'See chart'

  return {
    id,
    name: getName(patient),
    age: getAge(patient),
    room: ROOM_ASSIGNMENTS[id] || 'ICU',
    diagnosis: primaryDx,
    attending: 'See chart',
    admitDate: (patient.meta as Record<string, unknown>)?.lastUpdated
      ? new Date((patient.meta as Record<string, unknown>).lastUpdated as string).toLocaleDateString()
      : 'See chart',
    admitSource: 'Cerner Sandbox',
    codeStatus: 'Full Code',
    allergies: [],
    familyContact: '',
    familyPhone: '',
    handoffStatus: 'pending',
    hasPositiveCulture: false,
    pressorCount: 0,
    isIntubated: false,
    bpTrend: 'stable',
    neuro: {
      checkFreq: 'Q4h',
      lastCheck: 'See flowsheet',
      lastCheckTime: '',
      rass: 'See flowsheet',
      rassGoal: 'Per orders',
      sedation: 'See MAR',
    },
    respiratory: {
      mode: 'See flowsheet',
      o2Device: spo2Val ? `SpO2 ${spo2Val}` : 'See flowsheet',
    },
    cardiac: {
      hr: hrVal,
      rhythm: 'See telemetry',
      bp: bpVal,
      bpTrend: 'stable',
      pressors: [],
    },
    lines: [],
    drips: drips.length > 0 ? drips : [{ name: 'No active IV meds', concentration: '', rate: '' }],
    labs: mapLabsFromObservations([...vitals, ...labs]),
    cultures: [],
    antibiotics: activeMeds
      .filter(m => {
        const name = ((m.medicationCodeableConcept as Record<string, unknown>)?.text as string || '').toLowerCase()
        return name.includes('cillin') || name.includes('mycin') || name.includes('cycline') ||
               name.includes('floxacin') || name.includes('azole') || name.includes('vanco')
      })
      .slice(0, 3)
      .map(m => ({
        name: (m.medicationCodeableConcept as Record<string, unknown>)?.text as string || 'Antibiotic',
        day: 'See MAR',
      })),
    nutrition: {
      type: 'See orders',
      details: tempVal ? `Temp: ${tempVal}` : '',
      foleyDate: 'See flowsheet',
      urineOutput: 'See flowsheet',
      lastBm: 'See flowsheet',
    },
    skin: [],
    pending: [],
    timeline: mapConditionsToTimeline(conditions, patient),
    outgoingNote: '',
  }
}

// In-memory note/handoff state
const notes: Record<string, string> = {}
const statuses: Record<string, PatientDetail['handoffStatus']> = {}

export const cernerOpenProvider: PatientProvider = {
  name: 'Cerner Open Sandbox (Demo)',

  async listPatients(): Promise<PatientSummary[]> {
    const results = await Promise.allSettled(
      TEST_PATIENT_IDS.map(id => buildPatientDetail(id))
    )
    return results
      .filter((r): r is PromiseFulfilledResult<PatientDetail> => r.status === 'fulfilled')
      .map(r => r.value)
  },

  async getPatient(id: string): Promise<PatientDetail | null> {
    if (!TEST_PATIENT_IDS.includes(id)) return null
    try {
      const detail = await buildPatientDetail(id)
      if (notes[id] !== undefined) detail.outgoingNote = notes[id]
      if (statuses[id]) detail.handoffStatus = statuses[id]
      return detail
    } catch {
      return null
    }
  },

  async saveNote(patientId, note) {
    notes[patientId] = note
  },

  async updateHandoffStatus(patientId, status) {
    statuses[patientId] = status
  },
}
