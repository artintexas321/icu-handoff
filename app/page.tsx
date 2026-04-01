'use client'
import Link from 'next/link'
import { patients } from '@/data/patients'

export default function Home() {
  const isDNR = (cs: string) => cs.includes('DNR') || cs.includes('DNI')

  const handoffBadge = (status: string) => {
    if (status === 'complete') return <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded font-medium">✓ Complete</span>
    if (status === 'outgoing_confirmed') return <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded font-medium">⏳ Awaiting Incoming</span>
    return <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded font-medium">Pending</span>
  }

  const hasAlert = (p: typeof patients[0]) =>
    p.cultures.some(c => c.status === 'POSITIVE') || isDNR(p.codeStatus) || p.cardiac.bpTrend === 'worsening'

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen bg-gray-100 p-3">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="bg-blue-800 text-white rounded border border-blue-900 px-4 py-3 mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">📋 ShiftView</span>
              <span className="text-white/60 text-sm">— Medical Intensive Care Unit</span>
            </div>
            <div className="text-white/60 text-xs mt-0.5">Shift handoff report · Click any patient to open</div>
          </div>
          <div className="text-right text-xs text-white/70">
            <div className="font-semibold text-white">Shift Change: 19:00</div>
            <div>{dateStr}</div>
          </div>
        </div>

        {/* Patient list */}
        <div className="bg-white rounded border border-gray-300 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-400 uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-16">Room</th>
                <th className="px-3 py-2 text-left">Patient</th>
                <th className="px-3 py-2 text-left">Diagnosis</th>
                <th className="px-3 py-2 text-left">Attending</th>
                <th className="px-3 py-2 text-left">Admitted</th>
                <th className="px-3 py-2 text-left">Code</th>
                <th className="px-3 py-2 text-left">Alerts</th>
                <th className="px-3 py-2 text-left">Handoff</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p, idx) => (
                <Link key={p.id} href={`/patient/${p.id}`} legacyBehavior>
                  <tr className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-blue-50 transition-colors ${hasAlert(p) ? 'bg-red-50 hover:bg-red-100' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-3 py-2.5">
                      <span className="bg-blue-700 text-white text-xs font-bold px-2 py-1 rounded">{p.room.replace('ICU-', '')}</span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900">{p.name}</span>
                        <span className="text-base" title="Open ShiftView report">📋</span>
                      </div>
                      <div className="text-xs text-gray-400">{p.age} y/o</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-700 max-w-[200px]">
                      <div className="truncate">{p.diagnosis}</div>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600 text-xs">{p.attending.replace('Dr. ', '')}</td>
                    <td className="px-3 py-2.5 text-gray-500 text-xs whitespace-nowrap">{p.admitDate}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${isDNR(p.codeStatus) ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-green-100 text-green-700 border border-green-200'}`}>
                        {p.codeStatus}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {p.cultures.some(c => c.status === 'POSITIVE') && (
                          <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded font-medium">🦠 Culture+</span>
                        )}
                        {p.cardiac.pressors.length > 0 && (
                          <span className="text-xs bg-orange-100 text-orange-700 border border-orange-200 px-1.5 py-0.5 rounded font-medium">💊 Pressor</span>
                        )}
                        {p.respiratory.intubationDate && (
                          <span className="text-xs bg-purple-100 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-medium">🫁 Intubated</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">{handoffBadge(p.handoffStatus)}</td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-2 text-xs text-gray-400 text-center">
          ShiftView · {patients.length} patients · Data auto-pulled from Cerner
        </div>
      </div>
    </div>
  )
}
