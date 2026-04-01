/**
 * ShiftView Data Provider Interface
 *
 * Every data source (mock, Epic FHIR, Cerner, generic REST) must implement
 * this interface. The app never touches raw DB/API responses directly.
 *
 * To add a new hospital system:
 *   1. Create a file in lib/providers/ (e.g. my-hospital.ts)
 *   2. Implement the PatientProvider interface
 *   3. Register it in lib/providers/index.ts
 *   4. Set DATA_PROVIDER=my-hospital in .env.local
 */

export interface TimelineEntry {
  date: string
  event: string
  critical?: boolean
  type?: 'imaging' | 'procedure' | 'event' | 'note'
}

export interface PatientSummary {
  id: string
  name: string
  age: number
  room: string
  diagnosis: string
  attending: string
  admitDate: string
  admitSource: string
  codeStatus: string
  height: string
  weight: string
  allergies: string[]
  familyContact: string
  familyPhone: string
  handoffStatus: 'pending' | 'outgoing_confirmed' | 'complete'
  // Alert flags for dashboard
  hasPositiveCulture: boolean
  pressorCount: number
  isIntubated: boolean
  bpTrend: 'stable' | 'improving' | 'worsening'
}

export interface PatientDetail extends PatientSummary {
  pmh: string[]
  careTeam: {
    attending: { name: string; service: string; callback: string }
    consults: Array<{ service: string; name: string; callback: string }>
  }
  neuro: {
    checkFreq: string
    lastCheck: string
    lastCheckTime: string
    rass: string
    rassGoal: string
  }
  respiratory: {
    mode: string
    fio2?: string
    peep?: string
    rate?: string
    tidalVolume?: string
    o2Device?: string
    intubationDate?: string
    lastAbg?: string
  }
  cardiac: {
    hr: string
    rhythm: string
    bp: string
    bpTrend: 'stable' | 'improving' | 'worsening'
    mapGoal: string
    pressors: Array<{ name: string; rate: string }>
  }
  lines: Array<{ type: string; location: string; date: string }>
  drips: Array<{ name: string; concentration: string; rate: string }>
  labs: Array<{ name: string; value: string; unit: string; trend: '↑' | '↓' | '→'; abnormal: boolean }>
  cultures: Array<{ type: string; drawn: string; status: string; organism?: string; sensitivity?: string; abxDayOf?: string }>
  antibiotics: Array<{ name: string; day: string }>
  nutrition: { type: string; details: string; tubeAccess?: string; freeWaterFlush?: string; foleyDate: string; urineCultureSent?: boolean; urineOutput: string; lastBm: string }
  skin: Array<{ location: string; type: string; stage?: string; date: string }>
  pending: Array<{ type: 'Lab' | 'Imaging' | 'Consult' | 'Callback'; description: string }>
  timeline: TimelineEntry[]
  outgoingNote: string
}

export interface PatientProvider {
  /** Returns the name of this provider (shown in UI/logs) */
  name: string

  /** List all patients for the current unit/shift */
  listPatients(): Promise<PatientSummary[]>

  /** Get full detail for a single patient */
  getPatient(id: string): Promise<PatientDetail | null>

  /** Save outgoing nurse note */
  saveNote(patientId: string, note: string): Promise<void>

  /** Update handoff status */
  updateHandoffStatus(patientId: string, status: PatientDetail['handoffStatus']): Promise<void>
}
