/**
 * Mock Provider — uses local static data
 * Active when DATA_PROVIDER=mock (default)
 */

import { patients as rawPatients } from '@/data/patients'
import type { PatientProvider, PatientSummary, PatientDetail } from './types'

function toSummary(p: typeof rawPatients[0]): PatientSummary {
  return {
    id: p.id,
    name: p.name,
    age: p.age,
    room: p.room,
    diagnosis: p.diagnosis,
    attending: p.attending,
    admitDate: p.admitDate,
    admitSource: p.admitSource,
    codeStatus: p.codeStatus,
    allergies: p.allergies,
    familyContact: p.familyContact,
    familyPhone: p.familyPhone,
    handoffStatus: p.handoffStatus,
    hasPositiveCulture: p.cultures.some(c => c.status === 'POSITIVE'),
    pressorCount: p.cardiac.pressors.length,
    isIntubated: !!p.respiratory.intubationDate,
    bpTrend: p.cardiac.bpTrend,
  }
}

function toDetail(p: typeof rawPatients[0]): PatientDetail {
  return {
    ...toSummary(p),
    neuro: p.neuro,
    respiratory: p.respiratory,
    cardiac: p.cardiac,
    lines: p.lines,
    drips: p.drips,
    labs: p.labs,
    cultures: p.cultures,
    antibiotics: p.antibiotics,
    nutrition: p.nutrition,
    skin: p.skin,
    pending: p.pending,
    timeline: p.timeline,
    outgoingNote: p.outgoingNote,
  }
}

// In-memory state for note + handoff changes during session
const notes: Record<string, string> = {}
const handoffStatuses: Record<string, PatientDetail['handoffStatus']> = {}

export const mockProvider: PatientProvider = {
  name: 'Mock (local data)',

  async listPatients() {
    return rawPatients.map(toSummary)
  },

  async getPatient(id: string) {
    const p = rawPatients.find(p => p.id === id)
    if (!p) return null
    const detail = toDetail(p)
    if (notes[id] !== undefined) detail.outgoingNote = notes[id]
    if (handoffStatuses[id]) detail.handoffStatus = handoffStatuses[id]
    return detail
  },

  async saveNote(patientId, note) {
    notes[patientId] = note
  },

  async updateHandoffStatus(patientId, status) {
    handoffStatuses[patientId] = status
  },
}
