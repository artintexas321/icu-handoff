'use client'
import { useState } from 'react'
import { patients } from '@/data/patients'
import Link from 'next/link'

const MENU_ITEMS = [
  'CareCompass',
  'Nurse View',
  'Orders',
  'VTE Summary',
  'CarePlan',
  'Results Review',
  'MAR',
  'MAR Summary',
  'Medication List',
  'IView / I&O',
  'Histories',
  'Outside Records',
  'Diagnoses & Problems',
  'Allergies',
  'Patient Information',
  'Documentation',
  'Documents',
  'Form Browser',
]

const SHIFTVIEW_ITEM = '⚡ ShiftView Handoff'

export default function CernerShell() {
  const [activeMenu, setActiveMenu] = useState(SHIFTVIEW_ITEM)

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

      {/* PATIENT BANNER */}
      <div className="bg-[#2d6a9f] text-white px-5 py-2 flex items-center gap-6 text-sm shrink-0">
        <span className="font-bold text-base">DEMO, PATIENT</span>
        <span className="text-white/50">|</span>
        <span>DOB: 01/15/1958 · 68 yrs</span>
        <span className="text-white/50">|</span>
        <span className="text-yellow-200 font-semibold">Full Code</span>
        <span className="text-white/50">|</span>
        <span>Attending: Dr. Patel</span>
        <span className="text-white/50">|</span>
        <span>Room: ICU-04</span>
        <span className="text-white/50">|</span>
        <span className="text-red-300">Allergies: Penicillin, Sulfa</span>
      </div>

      {/* MAIN AREA */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR — wider, more breathing room */}
        <div className="w-56 bg-[#dce8f2] border-r border-[#b0c8dc] flex flex-col shrink-0 overflow-y-auto">
          <div className="bg-[#1c3d5e] text-white text-sm font-semibold px-4 py-2 shrink-0">
            Chart Menu
          </div>
          {MENU_ITEMS.map(item => (
            <button
              key={item}
              onClick={() => setActiveMenu(item)}
              className={`text-left px-4 py-2 text-sm border-b border-[#c0d4e4] transition-colors ${
                activeMenu === item
                  ? 'bg-[#1c3d5e] text-white font-semibold'
                  : 'text-[#1a3a5c] hover:bg-[#c8dcea]'
              }`}
            >
              {item}
            </button>
          ))}
          {/* ShiftView — visually distinct */}
          <button
            onClick={() => setActiveMenu(SHIFTVIEW_ITEM)}
            className={`text-left px-4 py-2.5 text-sm border-b border-[#c0d4e4] font-semibold transition-colors ${
              activeMenu === SHIFTVIEW_ITEM
                ? 'bg-[#1c3d5e] text-white'
                : 'bg-[#eaf4ea] text-[#1a5c2a] hover:bg-[#d4ecd4]'
            }`}
          >
            {SHIFTVIEW_ITEM}
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 overflow-auto bg-white">
          {activeMenu === SHIFTVIEW_ITEM ? (
            <div className="h-full flex flex-col">
              {/* ShiftView panel header */}
              <div className="bg-[#1c3d5e] text-white px-6 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 text-base">⚡</span>
                  <span className="font-semibold text-base">ShiftView — Shift Handoff</span>
                </div>
                <span className="text-sm text-white/60">19:00 handoff · Tue 03/31/2026</span>
              </div>

              {/* Patient list */}
              <div className="p-6 flex-1 overflow-auto">
                <p className="text-sm text-gray-400 mb-5">Select a patient to view their handoff dashboard</p>
                <div className="grid gap-4 max-w-4xl">
                  {patients.map(p => {
                    const codeAlert = p.codeStatus.includes('DNR') || p.codeStatus.includes('DNI')
                    const hasPositive = p.cultures.some(c => c.status === 'POSITIVE')
                    return (
                      <Link
                        key={p.id}
                        href={`/patient/${p.id}`}
                        className="block border rounded-lg p-5 hover:shadow-md transition-all bg-white border-gray-200 hover:border-[#2d6a9f]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-bold text-base text-[#1c3d5e]">{p.room}</span>
                              <span className="text-gray-800 font-medium text-base">{p.name}, {p.age}</span>
                              {codeAlert && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded">{p.codeStatus}</span>
                              )}
                              {hasPositive && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded">🦠 + Culture</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{p.diagnosis}</div>
                            <div className="text-sm text-gray-400 mt-0.5">Dr. {p.attending.replace('Dr. ', '')} · Admitted {p.admitDate}</div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.cardiac.pressors.length > 0 && (
                              <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded">Pressors</span>
                            )}
                            {p.respiratory.intubationDate && (
                              <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded">Vented</span>
                            )}
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                              p.handoffStatus === 'complete' ? 'bg-green-100 text-green-700' :
                              p.handoffStatus === 'outgoing_confirmed' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {p.handoffStatus === 'complete' ? '✓ Complete' :
                               p.handoffStatus === 'outgoing_confirmed' ? 'In Progress' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10">
              <div className="bg-[#eaf2fa] border border-[#b8d4ea] rounded-lg p-6 max-w-xl">
                <div className="font-semibold text-[#1c3d5e] text-base mb-2">{activeMenu}</div>
                <div className="text-sm text-gray-500">This is a standard Cerner PowerChart section. ShiftView adds the <strong>⚡ ShiftView Handoff</strong> option to the existing menu — nurses access it without leaving their normal workflow.</div>
              </div>
              <div className="mt-5 text-sm text-gray-400">← Click "⚡ ShiftView Handoff" in the menu to see the handoff dashboard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
