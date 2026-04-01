'use client'
import { useState, useCallback } from 'react'
import { patients } from '@/data/patients'
import PatientView from './PatientView'

const MENU_ITEMS = [
  'CareCompass', 'Nurse View', 'Orders', 'VTE Summary', 'CarePlan',
  'Results Review', 'MAR', 'MAR Summary', 'Medication List',
  'IView / I&O', 'Histories', 'Outside Records', 'Diagnoses & Problems',
  'Allergies', 'Patient Information', 'Documentation', 'Documents', 'Form Browser',
]

export default function CernerShell() {
  const [activeMenu, setActiveMenu] = useState('Nurse View')
  // In real Cerner the patient context is set by which patient chart is open
  // For the demo we cycle through patients
  const [patientIndex, setPatientIndex] = useState(0)
  const [shiftViewOpen, setShiftViewOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const patient = patients[patientIndex]

  const openShiftView = useCallback(() => {
    setRefreshKey(k => k + 1)
    setLastRefreshed(new Date())
    setShiftViewOpen(true)
  }, [])

  const closeShiftView = useCallback(() => {
    setShiftViewOpen(false)
  }, [])

  const codeAlert = patient.codeStatus.includes('DNR') || patient.codeStatus.includes('DNI')

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#e8eef4]" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '14px' }}>

      {/* TOP HEADER */}
      <div className="bg-[#1c3d5e] text-white flex items-center px-4 py-2 gap-6 shrink-0 border-b border-[#0f2a42]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#0088cc] flex items-center justify-center text-sm font-bold border border-white/20">C</div>
          <span className="font-bold text-base tracking-wide">PowerChart</span>
        </div>
        <div className="h-5 w-px bg-white/20" />
        <span className="text-white/70 text-sm">Baptist Medical Center — ICU</span>
        <div className="ml-auto flex items-center gap-6 text-sm text-white/60">
          <span>RN: B. Tovar</span>
          <span>19:00 Shift</span>
        </div>
      </div>

      {/* MENU BAR */}
      <div className="bg-[#2a5278] text-white/80 flex items-center px-4 py-1 gap-6 text-sm shrink-0 border-b border-[#1c3d5e]">
        {['Task', 'Edit', 'View', 'Patient', 'Chart', 'Links', 'Options'].map(item => (
          <span key={item} className="hover:text-white cursor-pointer">{item}</span>
        ))}
      </div>

      {/* PATIENT BANNER — ShiftView icon lives here */}
      <div className={`${codeAlert ? 'bg-[#8b1a1a]' : 'bg-[#2d6a9f]'} text-white px-5 py-2 flex items-center gap-5 text-sm shrink-0`}>
        {/* Demo patient switcher */}
        <div className="flex items-center gap-1 mr-2">
          {patients.map((p, i) => (
            <button
              key={p.id}
              onClick={() => { setPatientIndex(i); setShiftViewOpen(false) }}
              className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                i === patientIndex ? 'bg-white text-[#1c3d5e] font-bold border-white' : 'border-white/30 text-white/70 hover:border-white/70'
              }`}
            >
              {p.room}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-white/30" />
        <span className="font-bold text-base">{patient.name.toUpperCase()}</span>
        <span className="text-white/50">|</span>
        <span>{patient.age} yrs</span>
        <span className="text-white/50">|</span>
        <span className={`font-semibold ${codeAlert ? 'text-red-200' : 'text-yellow-200'}`}>{patient.codeStatus}</span>
        <span className="text-white/50">|</span>
        <span>Dr. {patient.attending.replace('Dr. ', '')}</span>
        <span className="text-white/50">|</span>
        <span>{patient.room}</span>
        <span className="text-white/50">|</span>
        <span className="text-red-300">{patient.allergies.join(', ')}</span>

        {/* ── SHIFTVIEW ICON BUTTON ── */}
        <div className="ml-auto">
          <button
            onClick={openShiftView}
            title="Open ShiftView Handoff"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 font-semibold text-sm transition-all ${
              shiftViewOpen
                ? 'bg-yellow-400 text-yellow-900 border-yellow-300 shadow-lg'
                : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/60'
            }`}
          >
            <span className="text-lg">📋</span>
            <span>ShiftView</span>
          </button>
        </div>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <div className="w-56 bg-[#dce8f2] border-r border-[#b0c8dc] flex flex-col shrink-0 overflow-y-auto">
          <div className="bg-[#1c3d5e] text-white text-sm font-semibold px-4 py-2 shrink-0">Chart Menu</div>
          {MENU_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => { setActiveMenu(item); setShiftViewOpen(false) }}
              className={`text-left px-4 py-2 text-sm border-b border-[#c0d4e4] transition-colors ${
                activeMenu === item && !shiftViewOpen
                  ? 'bg-[#1c3d5e] text-white font-semibold'
                  : 'text-[#1a3a5c] hover:bg-[#c8dcea]'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto bg-white">
          {shiftViewOpen ? (
            <div className="flex flex-col h-full">
              {/* ShiftView header with refresh + close */}
              <div className="bg-[#1c3d5e] text-white px-6 py-2.5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-300 text-lg">📋</span>
                  <span className="font-semibold text-base">ShiftView — {patient.name}, {patient.room}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/50">
                    Refreshed {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <button
                    onClick={openShiftView}
                    className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded border border-white/20 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                  <button
                    onClick={closeShiftView}
                    className="text-white/60 hover:text-white text-lg leading-none"
                    title="Close ShiftView"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {/* Render ShiftView content inline */}
              <div className="flex-1 overflow-auto">
                <PatientView key={refreshKey} patient={patient} />
              </div>
            </div>
          ) : (
            <div className="p-10">
              <div className="bg-[#eaf2fa] border border-[#b8d4ea] rounded-lg p-6 max-w-xl">
                <div className="font-semibold text-[#1c3d5e] text-base mb-2">{activeMenu}</div>
                <div className="text-sm text-gray-500">
                  This is a standard Cerner PowerChart section.
                  Click the <strong>📋 ShiftView</strong> icon in the patient banner above to open the handoff dashboard for the current patient.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
