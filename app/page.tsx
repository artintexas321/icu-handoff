'use client'
import Link from 'next/link'
import { patients } from '@/data/patients'

export default function Home() {
  const statusColor = (cs: string) => {
    if (cs.includes('DNR') || cs.includes('DNI')) return 'bg-red-100 text-red-800 border border-red-300'
    return 'bg-green-100 text-green-800 border border-green-300'
  }

  const handoffBadge = (status: string) => {
    if (status === 'complete') return <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">✓ Complete</span>
    if (status === 'outgoing_confirmed') return <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">⏳ Awaiting Incoming</span>
    return <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">Pending</span>
  }

  const hasAlert = (p: typeof patients[0]) =>
    p.cultures.some(c => c.status === 'POSITIVE') ||
    p.codeStatus.includes('DNR') ||
    p.cardiac.bpTrend === 'worsening'

  return (
    <main className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICU Handoff</h1>
          <p className="text-gray-500 mt-1">Medical Intensive Care Unit — Shift Change Dashboard</p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <div className="font-medium text-gray-700">Shift Change: 19:00</div>
          <div>Tuesday, March 31, 2026</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {patients.map(p => (
          <Link key={p.id} href={`/patient/${p.id}`}>
            <div className={`bg-white rounded-xl border-2 p-5 hover:shadow-md transition-all cursor-pointer ${hasAlert(p) ? 'border-red-200' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white rounded-lg px-3 py-2 text-center min-w-[64px]">
                    <div className="text-xs font-medium opacity-80">ROOM</div>
                    <div className="text-lg font-bold">{p.room.replace('ICU-', '')}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{p.name}, {p.age}</h2>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor(p.codeStatus)}`}>
                        {p.codeStatus}
                      </span>
                      {p.cultures.some(c => c.status === 'POSITIVE') && (
                        <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse">⚠ POSITIVE CULTURE</span>
                      )}
                    </div>
                    <div className="text-gray-600 mt-0.5">{p.diagnosis}</div>
                    <div className="text-sm text-gray-400 mt-1">Dr. {p.attending.replace('Dr. ', '')} · Admitted {p.admitDate} from {p.admitSource}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {handoffBadge(p.handoffStatus)}
                  {p.cardiac.pressors.length > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full">
                      💊 {p.cardiac.pressors.length} pressor{p.cardiac.pressors.length > 1 ? 's' : ''}
                    </span>
                  )}
                  {p.respiratory.intubationDate && (
                    <span className="text-xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                      🫁 Intubated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200 text-sm text-blue-700">
        <strong>Shift Handoff Protocol:</strong> Outgoing nurse reviews each patient dashboard → confirms accuracy → incoming nurse accepts → both sign off. Report any discrepancies to charge nurse.
      </div>
    </main>
  )
}
