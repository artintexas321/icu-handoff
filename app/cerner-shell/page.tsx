'use client'
import { useState } from 'react'
import Link from 'next/link'

// Cerner PowerChart shell — mimics the Baptist/Tenet Cerner layout
// so nurses immediately recognize the interface context

const MENU_ITEMS = [
  { label: 'Nurse View', active: false },
  { label: 'Orders', active: false },
  { label: 'VTE Summary', active: false },
  { label: 'CarePlan Summary', active: false },
  { label: 'Results Review', active: false },
  { label: 'MAR', active: false },
  { label: 'Omnicell', active: false },
  { label: 'Medication Requests', active: false },
  { label: 'MAR Summary', active: false },
  { label: 'Medication List', active: false },
  { label: 'IView/I&O', active: false },
  { label: 'Histories', active: false },
  { label: 'Outside Records', active: false },
  { label: 'Diagnoses and Problems', active: false },
  { label: 'Allergies', active: false },
  { label: 'Patient Information', active: false },
  { label: 'Documentation', active: false },
  { label: 'Documents', active: false },
  { label: 'Form Browser', active: false },
  { label: '⚡ ShiftView Handoff', active: true, highlight: true },
]

export default function CernerShell() {
  const [activeMenu, setActiveMenu] = useState('⚡ ShiftView Handoff')

  return (
    <div className="min-h-screen bg-gray-300 font-sans text-sm" style={{fontFamily: 'Arial, sans-serif'}}>

      {/* TOP HEADER — Cerner navy style */}
      <div className="bg-[#1a3a5c] text-white px-3 py-1.5 flex items-center justify-between border-b-2 border-[#0d2a45]">
        <div className="flex items-center gap-3">
          {/* Cerner logo circle */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00a0d6] to-[#0060a0] flex items-center justify-center text-xs font-bold border border-white/30">
            C
          </div>
          <span className="font-bold text-lg tracking-wide">PATIENT, DEMO</span>
          <span className="text-xs text-blue-200 ml-2">MRN: 00123456</span>
        </div>
        <div className="text-xs text-blue-200">eTenant — Baptist Medical Center</div>
      </div>

      {/* SECOND TOOLBAR */}
      <div className="bg-[#2a4a6c] text-white px-2 py-0.5 flex items-center gap-4 text-xs border-b border-[#1a3a5c]">
        {['Task', 'Edit', 'View', 'Patient', 'Chart', 'Links', 'Options', 'Documentation'].map(item => (
          <span key={item} className="hover:underline cursor-pointer">{item}</span>
        ))}
      </div>

      {/* QUICK TOOLBAR */}
      <div className="bg-[#c8d8e8] px-2 py-0.5 flex items-center gap-2 text-xs border-b border-gray-400 flex-wrap">
        {['CareCompass', 'Patient List', 'eCoach', '♥ Cardiovascular', 'Qual'].map(item => (
          <span key={item} className="flex items-center gap-1 px-1.5 py-0.5 bg-[#dce8f0] border border-gray-400 rounded-sm hover:bg-[#c0d4e8] cursor-pointer">
            {item}
          </span>
        ))}
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#dce8f0] border border-gray-400 rounded-sm hover:bg-[#c0d4e8] cursor-pointer">
          Tear Off
        </span>
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#dce8f0] border border-gray-400 rounded-sm hover:bg-[#c0d4e8] cursor-pointer">
          Calculator
        </span>
        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#dce8f0] border border-gray-400 rounded-sm hover:bg-[#c0d4e8] cursor-pointer">
          Lexicomp
        </span>
      </div>

      {/* PATIENT BANNER */}
      <div className="bg-[#3a5a7c] text-white px-3 py-1 flex items-center gap-6 text-xs">
        <span className="font-semibold">PATIENT, DEMO</span>
        <span>DOB: 01/15/1958 (68 yrs)</span>
        <span className="text-yellow-200 font-semibold">Code Status: Full Code</span>
        <span className="text-red-200">Allergies: Penicillin, Sulfa</span>
        <span>Attending: Dr. Patel</span>
        <span>Room: ICU-04</span>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex" style={{height: 'calc(100vh - 120px)'}}>

        {/* LEFT SIDEBAR MENU */}
        <div className="w-52 bg-[#dce8f0] border-r border-gray-400 flex flex-col shrink-0 overflow-y-auto">
          <div className="bg-[#1a3a5c] text-white px-2 py-1 text-xs font-bold flex items-center justify-between">
            <span>Menu</span>
            <span className="text-gray-300">📌</span>
          </div>
          {MENU_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`text-left px-3 py-1.5 text-xs border-b border-gray-300 hover:bg-[#b8d0e8] transition-colors ${
                activeMenu === item.label
                  ? 'bg-[#1a3a5c] text-white font-semibold'
                  : item.highlight
                  ? 'bg-[#e8f4e8] text-green-800 font-semibold'
                  : 'text-gray-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* MAIN PANEL */}
        <div className="flex-1 overflow-auto bg-white">
          {activeMenu === '⚡ ShiftView Handoff' ? (
            <div className="h-full">
              {/* ShiftView header inside Cerner panel */}
              <div className="bg-[#1a3a5c] text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-300 font-bold">⚡</span>
                  <span className="font-bold text-sm">ShiftView — Shift Handoff Dashboard</span>
                </div>
                <span className="text-xs text-blue-200">Shift Change: 19:00 · Tue 03/31/2026</span>
              </div>

              {/* Embedded ShiftView content */}
              <iframe
                src="/"
                className="w-full border-0"
                style={{height: 'calc(100% - 40px)'}}
                title="ShiftView Handoff"
              />
            </div>
          ) : (
            <div className="p-6 text-gray-500">
              <div className="bg-[#dce8f0] border border-gray-400 p-4 rounded">
                <div className="font-semibold text-gray-700 mb-1">{activeMenu}</div>
                <div className="text-xs text-gray-500">This section is part of standard Cerner PowerChart. ShiftView adds the "⚡ ShiftView Handoff" option to the existing menu — nurses never leave their normal workflow.</div>
              </div>
              <div className="mt-4 text-xs text-gray-400">← Click "⚡ ShiftView Handoff" in the menu to see the handoff dashboard</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
