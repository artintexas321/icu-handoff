export type CodeStatus = 'Full Code' | 'DNR' | 'DNI' | 'DNR/DNI'
export type CultureStatus = 'Pending' | 'No Growth' | 'POSITIVE'

export interface Patient {
  id: string
  name: string
  age: number
  room: string
  diagnosis: string
  attending: string
  admitDate: string
  admitSource: string
  codeStatus: CodeStatus
  allergies: string[]
  familyContact: string
  familyPhone: string
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
  cultures: Array<{ type: string; drawn: string; status: CultureStatus; organism?: string; sensitivity?: string; abxDayOf?: string }>
  antibiotics: Array<{ name: string; day: string }>
  careTeam: {
    attending: { name: string; service: string; callback: string }
    consults: Array<{ service: string; name: string; callback: string }>
  }
  nutrition: { type: string; details: string; tubeAccess?: string; foleyDate: string; urineCultureSent?: boolean; urineOutput: string; lastBm: string }
  skin: Array<{ location: string; type: string; stage?: string; date: string }>
  pending: Array<{ type: 'Lab' | 'Imaging' | 'Consult' | 'Callback'; description: string }>
  pmh: string[]
  timeline: Array<{ date: string; event: string; critical?: boolean; type?: 'imaging' | 'procedure' | 'event' | 'note' }>
  outgoingNote: string
  handoffStatus: 'pending' | 'outgoing_confirmed' | 'complete'
}

export const patients: Patient[] = [
  {
    id: '1',
    name: 'Robert Martinez',
    age: 67,
    room: 'ICU-04',
    diagnosis: 'Septic Shock / Pneumonia',
    attending: 'Dr. Patel',
    admitDate: '03/27/2026',
    admitSource: 'ED',
    codeStatus: 'Full Code',
    allergies: ['Penicillin', 'Sulfa'],
    familyContact: 'Maria Martinez (wife)',
    familyPhone: '(210) 555-0142',
    neuro: {
      checkFreq: 'Q4h',
      lastCheck: 'Follows commands, pupils equal/reactive',
      lastCheckTime: '17:15',
      rass: '-1',
      rassGoal: '-1 to 0',
    },
    respiratory: {
      mode: 'AC/VC',
      fio2: '50%',
      peep: '8',
      rate: '16',
      tidalVolume: '450 mL',
      intubationDate: '03/27/2026 03:42',
      lastAbg: '03/31 06:00 — pH 7.38, PaO2 88, PaCO2 42'
    },
    cardiac: {
      hr: '98',
      rhythm: 'Sinus Tachycardia',
      bp: '102/64',
      bpTrend: 'improving',
      mapGoal: '≥65',
      pressors: [
        { name: 'Norepinephrine', rate: '0.08 mcg/kg/min' },
        { name: 'Vasopressin', rate: '0.03 units/min' }
      ]
    },
    lines: [
      { type: 'Central Line (RIJ, triple lumen)', location: 'Right Internal Jugular', date: '03/27/2026' },
      { type: 'Arterial Line', location: 'Left Radial', date: '03/27/2026' },
      { type: 'Peripheral IV', location: 'Right AC', date: '03/29/2026' }
    ],
    drips: [
      { name: 'Norepinephrine', concentration: '4 mg/250 mL NS', rate: '12 mL/hr' },
      { name: 'Vasopressin', concentration: '20 units/100 mL NS', rate: '9 mL/hr' },
      { name: 'Propofol', concentration: '10 mg/mL', rate: '22 mL/hr' },
      { name: 'Heparin', concentration: '25,000 units/250 mL', rate: '18 mL/hr' }
    ],
    labs: [
      { name: 'WBC', value: '18.4', unit: 'K/uL', trend: '↓', abnormal: true },
      { name: 'Lactate', value: '2.8', unit: 'mmol/L', trend: '↓', abnormal: true },
      { name: 'Creatinine', value: '1.9', unit: 'mg/dL', trend: '↑', abnormal: true },
      { name: 'Hgb', value: '8.2', unit: 'g/dL', trend: '→', abnormal: true },
      { name: 'Plt', value: '142', unit: 'K/uL', trend: '↓', abnormal: false },
      { name: 'Na', value: '138', unit: 'mEq/L', trend: '→', abnormal: false }
    ],
    cultures: [
      { type: 'Blood Culture x2', drawn: '03/27/2026', status: 'POSITIVE', organism: 'Klebsiella pneumoniae', sensitivity: 'Sensitive to meropenem', abxDayOf: 'Day 4' }
    ],
    antibiotics: [
      { name: 'Meropenem 1g IV Q8h', day: 'Day 4' }
    ],
    careTeam: {
      attending: { name: 'Dr. Patel', service: 'MICU', callback: '(210) 555-1100' },
      consults: [
        { service: 'Infectious Disease', name: 'Dr. Rodriguez', callback: '(210) 555-2210' },
        { service: 'Nephrology', name: 'Dr. Kim', callback: '(210) 555-3340' }
      ]
    },
    nutrition: {
      type: 'Tube Feed',
      details: 'Osmolite 1.5 @ 55 mL/hr (goal 60 mL/hr)',
      tubeAccess: 'OG tube — 70 cm @ lip',
      foleyDate: '03/27/2026',
      urineCultureSent: true,
      urineOutput: '304 mL (07:00–15:00 shift)',
      lastBm: '03/30/2026'
    },
    skin: [
      { location: 'Coccyx', type: 'Pressure Injury', stage: 'Stage 1', date: '03/29/2026' }
    ],
    pending: [
      { type: 'Lab', description: 'Repeat lactate at 20:00' },
      { type: 'Imaging', description: 'CXR ordered — not yet read' },
      { type: 'Consult', description: 'Infectious Disease — pending response' },
      { type: 'Callback', description: 'Dr. Patel re: vasopressin wean plan' }
    ],
    timeline: [
      { date: '03/27', event: 'BIB EMS from home with 3-day history of fever, chills, confusion. Found hypotensive (BP 74/40), temp 103.8°F, O2 82% on RA.', type: 'event' },
      { date: '03/27', event: 'CXR: Dense left lower lobe consolidation consistent with pneumonia. No pneumothorax.', type: 'imaging' },
      { date: '03/27', event: 'Intubated in ED at 03:42 for hypoxic respiratory failure.', critical: true, type: 'procedure' },
      { date: '03/27', event: 'CT Chest: Multifocal pneumonia, no PE, no effusion.', type: 'imaging' },
      { date: '03/27', event: 'Transferred to MICU. Central line (RIJ) and arterial line (L radial) placed.', type: 'procedure' },
      { date: '03/28', event: 'Blood culture POSITIVE — Klebsiella pneumoniae, sensitive to meropenem.', critical: true, type: 'note' },
      { date: '03/28', event: 'CXR: ET tube in good position. Continued LLL consolidation.', type: 'imaging' },
      { date: '03/29', event: 'ID consult placed. Meropenem continued per sensitivity report.', type: 'note' },
      { date: '03/31', event: 'CXR: Slight improvement in LLL consolidation. ET tube remains well-positioned.', type: 'imaging' },
      { date: '03/31', event: 'Renal function worsening — creatinine 1.9 (up from 1.2 on admission). Nephrology aware.', critical: true, type: 'note' }
    ],
    pmh: ['HTN', 'T2DM', 'CKD Stage 2', 'COPD', 'Former smoker (40 pack-year)'],
    outgoingNote: 'Pressors slowly weaning — MAP staying above 65 without changes. Wife is at bedside, very anxious, wants update from Dr. Patel tonight. Watch UO this shift — may need lasix if it drops below 30 mL/hr. Coccyx redness noted on assessment, turn Q2h.',
    handoffStatus: 'pending'
  },
  {
    id: '2',
    name: 'Dorothy Chen',
    age: 74,
    room: 'ICU-07',
    diagnosis: 'STEMI — Post-PCI',
    attending: 'Dr. Williams',
    admitDate: '03/30/2026',
    admitSource: 'Cath Lab (direct)',
    codeStatus: 'DNR',
    allergies: ['Contrast dye (mild reaction)'],
    familyContact: 'James Chen (son)',
    familyPhone: '(210) 555-0287',
    neuro: {
      checkFreq: 'Q4h',
      lastCheck: 'Alert, oriented x4',
      lastCheckTime: '18:00',
      rass: '0',
      rassGoal: '0',
    },
    respiratory: {
      mode: 'Nasal Cannula',
      o2Device: '2L NC — SpO2 96%',
      lastAbg: 'Not indicated'
    },
    cardiac: {
      hr: '72',
      rhythm: 'Normal Sinus Rhythm',
      bp: '118/72',
      bpTrend: 'stable',
      mapGoal: '≥65',
      pressors: []
    },
    lines: [
      { type: 'Peripheral IV', location: 'Left AC', date: '03/30/2026' },
      { type: 'Peripheral IV', location: 'Right Forearm', date: '03/30/2026' }
    ],
    drips: [
      { name: 'Heparin', concentration: '25,000 units/250 mL', rate: '20 mL/hr' },
      { name: 'Nitroglycerin', concentration: '100 mcg/mL', rate: '5 mL/hr' }
    ],
    labs: [
      { name: 'Troponin', value: '12.4', unit: 'ng/mL', trend: '↓', abnormal: true },
      { name: 'BNP', value: '890', unit: 'pg/mL', trend: '↓', abnormal: true },
      { name: 'Hgb', value: '10.1', unit: 'g/dL', trend: '→', abnormal: true },
      { name: 'Cr', value: '1.1', unit: 'mg/dL', trend: '→', abnormal: false },
      { name: 'K', value: '3.8', unit: 'mEq/L', trend: '→', abnormal: false }
    ],
    cultures: [],
    antibiotics: [],
    careTeam: {
      attending: { name: 'Dr. Williams', service: 'Cardiology', callback: '(210) 555-1210' },
      consults: [
        { service: 'Cardiac Surgery', name: 'Dr. Reyes', callback: '(210) 555-4450' }
      ]
    },
    nutrition: {
      type: 'Cardiac Diet',
      details: 'Low sodium, eating well',
      foleyDate: '03/30/2026',
      urineCultureSent: true,
      urineOutput: '520 mL (07:00–15:00 shift)',
      lastBm: '03/31/2026'
    },
    skin: [],
    pending: [
      { type: 'Lab', description: 'Serial troponin at 22:00' },
      { type: 'Imaging', description: 'Echo scheduled 04/01 AM' }
    ],
    timeline: [
      { date: '03/30', event: 'Called 911 with sudden onset crushing chest pain radiating to left arm, diaphoretic. EMS EKG: inferior STEMI. Direct activation of cath lab.', critical: true, type: 'event' },
      { date: '03/30', event: 'CXR (pre-cath): Mild cardiomegaly. No acute pulmonary edema.', type: 'imaging' },
      { date: '03/30', event: 'Cardiac Cath: RCA 95% occlusion — thrombectomy + drug-eluting stent placed. TIMI 3 flow restored.', critical: true, type: 'procedure' },
      { date: '03/30', event: 'Transferred to MICU post-PCI for hemodynamic monitoring.', type: 'event' },
      { date: '03/31', event: 'CXR: Mild vascular congestion. No new effusion. Sternal wires intact.', type: 'imaging' },
      { date: '03/31', event: 'DNR status confirmed and documented. Patient clearly stated wishes to son James.', type: 'note' },
      { date: '03/31', event: 'Echo ordered for 04/01 to assess post-MI wall motion and EF.', type: 'note' }
    ],
    pmh: ['CAD', 'HTN', 'HFrEF (EF 35%)', 'T2DM', 'Afib (on anticoag prior to admission)', 'CKD Stage 3'],
    outgoingNote: 'Very pleasant lady, doing well post-PCI. Troponin trending down nicely. Son James was here all day — good family support. DNR was confirmed today, she is clear about her wishes. Watch for any chest pain or rhythm changes overnight.',
    handoffStatus: 'outgoing_confirmed'
  },
  {
    id: '3',
    name: 'Marcus Thompson',
    age: 52,
    room: 'ICU-11',
    diagnosis: 'DKA / Acute Pancreatitis',
    attending: 'Dr. Nguyen',
    admitDate: '03/31/2026',
    admitSource: 'ED',
    codeStatus: 'Full Code',
    allergies: ['NKDA'],
    familyContact: 'Sandra Thompson (wife)',
    familyPhone: '(210) 555-0391',
    neuro: {
      checkFreq: 'Q4h',
      lastCheck: 'Alert, oriented x3 (confused to date)',
      lastCheckTime: '17:30',
      rass: '0',
      rassGoal: '0',
    },
    respiratory: {
      mode: 'Room Air',
      o2Device: 'RA — SpO2 98%',
    },
    cardiac: {
      hr: '112',
      rhythm: 'Sinus Tachycardia',
      bp: '128/78',
      bpTrend: 'stable',
      mapGoal: '≥65',
      pressors: []
    },
    lines: [
      { type: 'Peripheral IV', location: 'Right AC (18g)', date: '03/31/2026' },
      { type: 'Peripheral IV', location: 'Left Forearm (20g)', date: '03/31/2026' }
    ],
    drips: [
      { name: 'Regular Insulin', concentration: '100 units/100 mL NS', rate: '8 units/hr' },
      { name: 'LR (IVF)', concentration: '1000 mL LR', rate: '250 mL/hr' }
    ],
    labs: [
      { name: 'Glucose', value: '342', unit: 'mg/dL', trend: '↓', abnormal: true },
      { name: 'Bicarb', value: '14', unit: 'mEq/L', trend: '↑', abnormal: true },
      { name: 'Anion Gap', value: '22', unit: '', trend: '↓', abnormal: true },
      { name: 'Lipase', value: '1840', unit: 'U/L', trend: '→', abnormal: true },
      { name: 'K', value: '3.2', unit: 'mEq/L', trend: '↓', abnormal: true },
      { name: 'Cr', value: '1.4', unit: 'mg/dL', trend: '↓', abnormal: true }
    ],
    cultures: [
      { type: 'Blood Culture x2', drawn: '03/31/2026', status: 'Pending' }
    ],
    antibiotics: [],
    careTeam: {
      attending: { name: 'Dr. Nguyen', service: 'MICU', callback: '(210) 555-1102' },
      consults: [
        { service: 'Endocrine', name: 'Dr. Pham', callback: '(210) 555-5560' },
        { service: 'GI', name: 'Dr. Castillo', callback: '(210) 555-6670' }
      ]
    },
    nutrition: {
      type: 'NPO',
      details: 'NPO — pancreatitis, pain management with morphine PRN',
      foleyDate: '03/31/2026',
      urineCultureSent: false,
      urineOutput: '440 mL (07:00–15:00 shift)',
      lastBm: 'None this admission'
    },
    skin: [],
    pending: [
      { type: 'Lab', description: 'Q2h glucose checks — next at 19:30' },
      { type: 'Lab', description: 'BMP at 20:00' },
      { type: 'Imaging', description: 'CT Abdomen/Pelvis — ordered, not yet done' },
      { type: 'Callback', description: 'Endocrine consult — called, awaiting callback' }
    ],
    timeline: [
      { date: '03/31', event: 'BIB EMS from home with 12-hr history of severe epigastric/abdominal pain, nausea, vomiting x8. Known T2DM, non-compliant with insulin. Glucose 580 in field.', critical: true, type: 'event' },
      { date: '03/31', event: 'CXR: No acute cardiopulmonary process. No free air.', type: 'imaging' },
      { date: '03/31', event: 'CT Abdomen/Pelvis with contrast: Peripancreatic fat stranding consistent with acute interstitial pancreatitis. No necrosis. No abscess. No free air.', type: 'imaging' },
      { date: '03/31', event: 'DKA and acute pancreatitis diagnoses confirmed. Insulin drip and aggressive IVF started.', type: 'procedure' },
      { date: '03/31', event: 'Transferred to MICU for insulin drip management and close monitoring.', type: 'event' },
      { date: '03/31', event: 'Endocrine consult placed. Awaiting callback.', type: 'note' }
    ],
    pmh: ['T2DM (insulin-dependent)', 'Hypertriglyceridemia', 'Obesity (BMI 38)', 'Prior episode pancreatitis (2022)', 'OSA'],
    outgoingNote: 'Gap closing slowly, glucose coming down. Very uncomfortable — give morphine PRN for abdominal pain before turning/moving him. Wife called twice — update her when glucose is under 250. Do NOT let him eat anything, still strict NPO. K is low, make sure repletion order is in.',
    handoffStatus: 'pending'
  },
  {
    id: '4',
    name: 'Helen Kowalski',
    age: 81,
    room: 'ICU-14',
    diagnosis: 'GI Bleed / Hypovolemic Shock',
    attending: 'Dr. Okafor',
    admitDate: '03/29/2026',
    admitSource: 'Transfer — Methodist Hospital',
    codeStatus: 'DNR/DNI',
    allergies: ['Aspirin', 'NSAIDs'],
    familyContact: 'Paul Kowalski (son)',
    familyPhone: '(210) 555-0504',
    neuro: {
      checkFreq: 'Q4h',
      lastCheck: 'Alert, oriented x2 (person/place)',
      lastCheckTime: '16:45',
      rass: '0',
      rassGoal: '0',
    },
    respiratory: {
      mode: 'Nasal Cannula',
      o2Device: '3L NC — SpO2 94%',
    },
    cardiac: {
      hr: '88',
      rhythm: 'Atrial Fibrillation',
      bp: '96/58',
      bpTrend: 'worsening',
      mapGoal: '≥70',
      pressors: [
        { name: 'Norepinephrine', rate: '0.05 mcg/kg/min' }
      ]
    },
    lines: [
      { type: 'Central Line (LIJV, double lumen)', location: 'Left Internal Jugular', date: '03/29/2026' },
      { type: 'Peripheral IV', location: 'Right AC (16g)', date: '03/29/2026' }
    ],
    drips: [
      { name: 'Norepinephrine', concentration: '4 mg/250 mL NS', rate: '7 mL/hr' },
      { name: 'Pantoprazole', concentration: '40 mg/100 mL NS', rate: 'continuous 8 mg/hr' }
    ],
    labs: [
      { name: 'Hgb', value: '6.8', unit: 'g/dL', trend: '↓', abnormal: true },
      { name: 'Hct', value: '21', unit: '%', trend: '↓', abnormal: true },
      { name: 'INR', value: '2.4', unit: '', trend: '↑', abnormal: true },
      { name: 'Plt', value: '88', unit: 'K/uL', trend: '↓', abnormal: true },
      { name: 'BUN', value: '68', unit: 'mg/dL', trend: '↑', abnormal: true },
      { name: 'Cr', value: '2.1', unit: 'mg/dL', trend: '↑', abnormal: true }
    ],
    cultures: [
      { type: 'Blood Culture x2', drawn: '03/29/2026', status: 'No Growth' }
    ],
    antibiotics: [],
    careTeam: {
      attending: { name: 'Dr. Okafor', service: 'MICU', callback: '(210) 555-1104' },
      consults: [
        { service: 'GI', name: 'Dr. Castillo', callback: '(210) 555-6670' },
        { service: 'Hematology', name: 'Dr. Singh', callback: '(210) 555-7780' }
      ]
    },
    nutrition: {
      type: 'NPO',
      details: 'NPO pre-repeat EGD',
      foleyDate: '03/29/2026',
      urineCultureSent: true,
      urineOutput: '176 mL (07:00–15:00 shift) ⚠ Low',
      lastBm: 'Melena 03/31 at 14:00'
    },
    skin: [
      { location: 'Right heel', type: 'Pressure Injury', stage: 'Stage 2', date: '03/29/2026 (present on transfer)' }
    ],
    pending: [
      { type: 'Lab', description: 'Repeat CBC at 20:00 — likely needs transfusion' },
      { type: 'Imaging', description: 'Repeat EGD scheduled 04/01 07:00' },
      { type: 'Callback', description: 'GI team — called re: transfusion threshold' },
      { type: 'Callback', description: 'Family meeting requested by son Paul — goals of care' }
    ],
    timeline: [
      { date: '03/28', event: 'Presented to Methodist ED with hematemesis x2 episodes at home. Family found her confused. Hgb 9.2, BP 88/50 on arrival.', critical: true, type: 'event' },
      { date: '03/28', event: 'CXR (Methodist): Cardiomegaly, no acute pulmonary edema.', type: 'imaging' },
      { date: '03/29', event: 'EGD at Methodist: Duodenal ulcer with active spurting — clipped x2. Hemostasis achieved.', type: 'procedure' },
      { date: '03/29', event: 'Transfer to MICU for higher level of care due to hemodynamic instability despite procedure.', critical: true, type: 'event' },
      { date: '03/29', event: 'CXR (on transfer): ET tube not placed. Mild bilateral atelectasis. No effusion.', type: 'imaging' },
      { date: '03/30', event: 'Hgb dropped 8.1 → 6.8 — rebleeding suspected. 2 units pRBC transfused.', critical: true, type: 'procedure' },
      { date: '03/31', event: 'Melena noted at 14:00. GI re-consulted. Repeat EGD planned for 04/01 at 07:00.', critical: true, type: 'note' },
      { date: '03/31', event: 'DNR/DNI confirmed with patient and son Paul. Goals of care discussion initiated — not yet complete.', type: 'note' }
    ],
    pmh: ['PUD (duodenal ulcer, h/o prior GI bleed 2019)', 'Afib (on warfarin)', 'HTN', 'CKD Stage 3', 'Osteoporosis', 'Hypothyroidism'],
    outgoingNote: 'Actively rebleeding — do not be surprised if Hgb drops again on repeat labs. Transfusion threshold is Hgb < 7 per GI. Son Paul is very involved and upset — be patient with him. Goals of care conversation was started today but not completed. Dr. Okafor wants to have a family meeting tomorrow before EGD. UO is concerning, mentioned to Dr. Okafor — watching.',
    handoffStatus: 'pending'
  }
]
