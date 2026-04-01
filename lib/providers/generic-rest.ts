/**
 * Generic REST Provider
 *
 * For hospital systems that expose a custom REST API (not standard FHIR).
 * Configure your own endpoint and field mappings here.
 *
 * Required environment variables (.env.local):
 *   DATA_PROVIDER=generic
 *   GENERIC_API_BASE_URL=https://your-hospital-api.com/v1
 *   GENERIC_API_KEY=your-api-key
 *   GENERIC_UNIT_ID=ICU-A   (optional, filter by unit)
 *
 * Expected API shape (customize mapPatient() below to match your schema):
 *   GET /patients?unit=ICU-A  → array of patients
 *   GET /patients/:id         → single patient detail
 *   PUT /patients/:id/note    → { note: string }
 *   PUT /patients/:id/handoff → { status: string }
 */

import type { PatientProvider, PatientSummary, PatientDetail } from './types'

const BASE_URL = process.env.GENERIC_API_BASE_URL
const API_KEY = process.env.GENERIC_API_KEY
const UNIT_ID = process.env.GENERIC_UNIT_ID

async function apiGet(path: string) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-API-Key': API_KEY || '', Accept: 'application/json' },
  })
  if (!resp.ok) throw new Error(`Generic API ${path} → ${resp.status}`)
  return resp.json()
}

// ---- Customize these mappers to match your hospital's API schema ----

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSummary(p: any): PatientSummary {
  return {
    id: p.id || p.patient_id,
    name: p.name || `${p.last_name}, ${p.first_name}`,
    age: p.age,
    room: p.room || p.bed || p.location,
    diagnosis: p.diagnosis || p.primary_dx,
    attending: p.attending || p.physician,
    admitDate: p.admit_date || p.admission_date,
    admitSource: p.admit_source || p.source,
    codeStatus: p.code_status || p.codeStatus || 'Unknown',
    height: p.height || '',
    weight: p.weight || '',
    // codeStatus_REPLACED || 'Full Code',
    allergies: p.allergies || [],
    familyContact: p.family_contact || '',
    familyPhone: p.family_phone || '',
    handoffStatus: p.handoff_status || 'pending',
    hasPositiveCulture: p.positive_culture || false,
    pressorCount: p.pressor_count || (p.pressors || []).length,
    isIntubated: p.intubated || false,
    bpTrend: p.bp_trend || 'stable',
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDetail(p: any): PatientDetail {
  return {
    ...mapSummary(p),
    neuro: p.neuro || { checkFreq: 'Per orders', lastCheck: 'See flowsheet', lastCheckTime: '', rass: 'See flowsheet', rassGoal: 'Per orders', sedation: 'See MAR' },
    respiratory: p.respiratory || { mode: 'See flowsheet' },
    cardiac: p.cardiac || { hr: 'See monitor', rhythm: 'See telemetry', bp: 'See monitor', bpTrend: 'stable', pressors: [] },
    lines: p.lines || [],
    drips: p.drips || [],
    labs: p.labs || [],
    cultures: p.cultures || [],
    antibiotics: p.antibiotics || [],
    nutrition: p.nutrition || { type: 'See orders', details: '', foleyDate: '', urineOutput: 'See flowsheet', lastBm: 'See flowsheet' },
    skin: p.skin || [],
    pending: p.pending || [],
    timeline: p.timeline || [],
    pmh: p.pmh || [],
    careTeam: p.careTeam || { attending: { name: 'See system', service: '', callback: '' }, consults: [] },
    outgoingNote: p.outgoing_note || p.outgoingNote || '',
  }
}

export const genericRestProvider: PatientProvider = {
  name: 'Generic REST API',

  async listPatients() {
    const unitFilter = UNIT_ID ? `?unit=${UNIT_ID}` : ''
    const data = await apiGet(`/patients${unitFilter}`)
    return (Array.isArray(data) ? data : data.patients || []).map(mapSummary)
  },

  async getPatient(id) {
    const data = await apiGet(`/patients/${id}`)
    return mapDetail(data)
  },

  async saveNote(patientId, note) {
    await fetch(`${BASE_URL}/patients/${patientId}/note`, {
      method: 'PUT',
      headers: { 'X-API-Key': API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    })
  },

  async updateHandoffStatus(patientId, status) {
    await fetch(`${BASE_URL}/patients/${patientId}/handoff`, {
      method: 'PUT',
      headers: { 'X-API-Key': API_KEY || '', 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
  },
}
