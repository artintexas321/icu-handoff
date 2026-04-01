'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { patients, Patient } from '@/data/patients'

function Section({ title, children, alert }: { title: string; children: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${alert ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <h3 className={`text-sm font-semibold uppercase tracking-wide mb-3 ${alert ? 'text-red-700' : 'text-gray-500'}`}>{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: 'red' | 'yellow' | 'green' }) {
  const bg = highlight === 'red' ? 'bg-red-100 text-red-800 rounded px-1' :
             highlight === 'yellow' ? 'bg-yellow-100 text-yellow-800 rounded px-1' :
             highlight === 'green' ? 'bg-green-100 text-green-800 rounded px-1' : ''
  return (
    <div className="flex items-start gap-2 text-sm py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 min-w-[140px] shrink-0">{label}</span>
      <span className={`text-gray-900 font-medium ${bg}`}>{value}</span>
    </div>
  )
}

export default function PatientPage() {
  const { id } = useParams()
  const router = useRouter()
  const patient = patients.find(p => p.id === id)
  const [note, setNote] = useState(patient?.outgoingNote || '')
  const [handoffStep, setHandoffStep] = useState(patient?.handoffStatus === 'complete' ? 2 : patient?.handoffStatus === 'outgoing_confirmed' ? 1 : 0)

  if (!patient) return <div className="p-8 text-center text-gray-500">Patient not found.</div>

  const codeAlert = patient.codeStatus.includes('DNR') || patient.codeStatus.includes('DNI')
  const positiveCulture = patient.cultures.find(c => c.status === 'POSITIVE')

  return (
    <main className="max-w-6xl mx-auto p-4 pb-16">

      {/* ── 1. PATIENT INFO TOP STRIP ── */}
      <div className={`rounded-xl p-5 mb-4 ${codeAlert ? 'bg-red-700 text-white' : 'bg-blue-700 text-white'}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{patient.name}, {patient.age}</h1>
              <span className="bg-white/20 text-white border border-white/30 text-sm font-semibold px-3 py-1 rounded-full">
                {patient.room}
              </span>
            </div>
            <div className="mt-1 text-lg opacity-90">{patient.diagnosis}</div>
            <div className="mt-1 text-sm opacity-75">Dr. {patient.attending.replace('Dr. ', '')} · Admitted {patient.admitDate} · Source: {patient.admitSource}</div>
          </div>
          <div className="flex flex-col gap-2 text-right">
            <div className={`font-bold text-lg px-3 py-1 rounded-lg ${codeAlert ? 'bg-white text-red-700' : 'bg-white/20 text-white'}`}>
              ⚠️ {patient.codeStatus}
            </div>
            {positiveCulture && (
              <div className="bg-yellow-400 text-yellow-900 font-bold text-sm px-3 py-1 rounded-lg animate-pulse">
                🦠 POSITIVE CULTURE
              </div>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div><span className="opacity-75">Ht: </span><strong>{patient.height}</strong></div>
          <div><span className="opacity-75">Wt: </span><strong>{patient.weight}</strong></div>
          <div><span className="opacity-75">Allergies: </span><strong>{patient.allergies.join(', ')}</strong></div>
          <div><span className="opacity-75">Family: </span><strong>{patient.familyContact} — {patient.familyPhone}</strong></div>
        </div>
      </div>

      {/* ── 2. CARE TEAM ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">👨‍⚕️ Care Team</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 min-w-[180px]">
            <div>
              <div className="text-xs text-blue-500 font-semibold uppercase tracking-wide">Attending</div>
              <div className="font-semibold text-gray-900">{patient.careTeam.attending.name}</div>
              <div className="text-sm text-gray-600">{patient.careTeam.attending.service}</div>
            </div>
          </div>
          {patient.careTeam.consults.map((c, i) => (
            <div key={i} className="flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 min-w-[180px]">
              <div>
                <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Consult — {c.service}</div>
                <div className="font-semibold text-gray-900">{c.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. PAST MEDICAL HISTORY ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">📋 Past Medical History (PMH)</h3>
        <div className="flex flex-wrap gap-2">
          {patient.pmh.map((item, i) => (
            <span key={i} className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full border border-gray-200">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. PATIENT TIMELINE ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">📅 Patient Timeline</h3>
          <div className="flex gap-3 text-xs text-gray-400">
            <span>⚠ Critical</span>
            <span className="text-purple-500">🩻 Imaging</span>
            <span className="text-blue-500">⚕ Procedure</span>
            <span>📋 Note</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          {patient.timeline.map((t, i) => {
            const icon = t.critical ? '⚠' : t.type === 'imaging' ? '🩻' : t.type === 'procedure' ? '⚕' : t.type === 'note' ? '📋' : '•'
            const dotClass = t.critical
              ? 'bg-red-100 text-red-700 border-2 border-red-300'
              : t.type === 'imaging'
              ? 'bg-purple-100 text-purple-700 border-2 border-purple-200'
              : t.type === 'procedure'
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
              : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
            return (
              <div key={i} className="relative flex gap-4 mb-3 last:mb-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 z-10 ${dotClass}`}>
                  {icon}
                </div>
                <div className="pt-1">
                  <span className="text-xs font-semibold text-gray-400 mr-2">{t.date}</span>
                  <span className={`text-sm ${t.critical ? 'text-red-800 font-medium' : t.type === 'imaging' ? 'text-purple-800' : 'text-gray-700'}`}>{t.event}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 4. CLINICAL SECTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* NEURO */}
        <Section title="🧠 Neuro">
          <Row label="Check frequency" value={patient.neuro.checkFreq} />
          <Row label="Last check" value={`${patient.neuro.lastCheck} (${patient.neuro.lastCheckTime})`} />
          <Row label="RASS" value={`${patient.neuro.rass} (goal ${patient.neuro.rassGoal})`} />
        </Section>

        {/* RESPIRATORY */}
        <Section title="🫁 Respiratory">
          {patient.respiratory.intubationDate ? (
            <>
              <Row label="Mode" value={patient.respiratory.mode} />
              <Row label="PEEP" value={patient.respiratory.peep!} />
              <Row label="Tidal Volume" value={patient.respiratory.tidalVolume!} />
              <Row label="Rate" value={patient.respiratory.rate!} />
              <Row label="FiO2" value={patient.respiratory.fio2!} />
              <Row label="Intubated" value={patient.respiratory.intubationDate} highlight="yellow" />
              <Row label="Last ABG" value={patient.respiratory.lastAbg!} />
            </>
          ) : (
            <>
              <Row label="O2" value={patient.respiratory.o2Device!} />
              {patient.respiratory.lastAbg && patient.respiratory.lastAbg !== 'Not indicated' && (
                <Row label="Last ABG" value={patient.respiratory.lastAbg} />
              )}
            </>
          )}
        </Section>

        {/* CARDIAC */}
        <Section title="❤️ Cardiac">
          <Row label="HR / Rhythm" value={`${patient.cardiac.hr} — ${patient.cardiac.rhythm}`} />
          <Row
            label="BP / MAP"
            value={(() => {
              const parts = patient.cardiac.bp.split('/')
              const sys = parseInt(parts[0]), dia = parseInt(parts[1])
              const map = isNaN(sys) || isNaN(dia) ? '?' : Math.round((sys + 2 * dia) / 3)
              return `${patient.cardiac.bp}  —  MAP ${map}  (goal ${patient.cardiac.mapGoal})`
            })()}
            highlight={patient.cardiac.bpTrend === 'worsening' ? 'red' : patient.cardiac.bpTrend === 'improving' ? 'green' : undefined}
          />
          {patient.cardiac.pressors.length > 0 ? (
            patient.cardiac.pressors.map((p, i) => (
              <Row key={i} label={i === 0 ? 'Pressors' : ''} value={`${p.name} @ ${p.rate}`} highlight="yellow" />
            ))
          ) : (
            <Row label="Pressors" value="None" highlight="green" />
          )}
        </Section>

        {/* GI / GU / NUTRITION */}
        <Section title="🍽️ GI / GU / Nutrition">
          <Row label="Diet / Nutrition" value={patient.nutrition.type + ' — ' + patient.nutrition.details} />
          {patient.nutrition.tubeAccess && <Row label="Tube" value={patient.nutrition.tubeAccess} />}
          {patient.nutrition.freeWaterFlush && <Row label="FWF" value={patient.nutrition.freeWaterFlush} />}
          <Row
            label="Foley"
            value={
              <span className="flex items-center gap-2">
                {patient.nutrition.foleyDate}
                {patient.nutrition.urineCultureSent === true && (
                  <span className="text-green-600 font-semibold text-xs">✓ UA sent</span>
                )}
                {patient.nutrition.urineCultureSent === false && (
                  <span className="text-red-500 font-semibold text-xs">⚠ UA not sent</span>
                )}
              </span>
            }
          />
          <Row
            label="Urine Output"
            value={patient.nutrition.urineOutput}
            highlight={patient.nutrition.urineOutput.toLowerCase().includes('low') ? 'red' : undefined}
          />
          <Row label="Last BM" value={patient.nutrition.lastBm} />
        </Section>

        {/* SKIN */}
        <Section title="🩹 Skin">
          {patient.skin.length === 0 ? (
            <div className="text-sm text-green-700 font-medium">✓ No wounds or pressure injuries</div>
          ) : patient.skin.map((s, i) => (
            <Row key={i} label={s.location} value={`${s.type}${s.stage ? ' — ' + s.stage : ''} (noted ${s.date})`} highlight="yellow" />
          ))}
        </Section>

        {/* LINES / ACCESS */}
        <Section title="💉 Lines / Access">
          {patient.lines.map((l, i) => (
            <Row key={i} label={`Line ${i + 1}`} value={`${l.type} — ${l.location} (${l.date})`} />
          ))}
          {patient.accessSite && (
            <Row
              label="Access Site"
              value={`${patient.accessSite.location} — ${patient.accessSite.notes} (${patient.accessSite.date})`}
              highlight="yellow"
            />
          )}
        </Section>

        {/* ACTIVE DRIPS */}
        <Section title="💊 Active Drips">
          {patient.drips.map((d, i) => (
            <Row key={i} label={d.name} value={`${d.concentration} @ ${d.rate}`} />
          ))}
        </Section>

        {/* CULTURES / ID */}
        <Section title="🦠 Cultures" alert={!!positiveCulture}>
          {patient.cultures.length === 0 ? (
            <div className="text-sm text-gray-500">No cultures drawn</div>
          ) : patient.cultures.map((c, i) => (
            <div key={i} className="mb-2">
              <Row
                label={c.type}
                value={c.status}
                highlight={c.status === 'POSITIVE' ? 'red' : c.status === 'No Growth' ? 'green' : 'yellow'}
              />
              {c.organism && <Row label="Organism" value={`${c.organism} — ${c.sensitivity}`} highlight="red" />}
              {c.abxDayOf && <Row label="Abx day" value={c.abxDayOf} />}
            </div>
          ))}
          {patient.antibiotics.map((a, i) => (
            <Row key={i} label="Active Abx" value={a.name + ' — ' + a.day} />
          ))}
        </Section>

      </div>

      {/* ── 5. LABS ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">🧪 Labs — 24hr Trend</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {patient.labs.map((l, i) => (
            <div key={i} className={`p-2 rounded-lg border text-sm ${l.abnormal ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
              <div className="text-gray-500 text-xs">{l.name}</div>
              <div className={`font-bold text-base ${l.abnormal ? 'text-red-700' : 'text-gray-900'}`}>
                {l.value} <span className="text-sm">{l.unit}</span> <span>{l.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 6. PENDING / OUTSTANDING ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">⏳ Pending / Outstanding</h3>
        {patient.pending.length === 0 ? (
          <div className="text-sm text-gray-500">Nothing outstanding</div>
        ) : patient.pending.map((p, i) => (
          <div key={i} className="flex items-start gap-2 text-sm py-1 border-b border-gray-100 last:border-0">
            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
              p.type === 'Lab' ? 'bg-blue-100 text-blue-700' :
              p.type === 'Imaging' ? 'bg-purple-100 text-purple-700' :
              p.type === 'Consult' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>{p.type}</span>
            <span className="text-gray-800">{p.description}</span>
          </div>
        ))}
      </div>

      {/* ── 7. OUTGOING NURSE NOTE ── */}
      <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5 mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-yellow-700 mb-3">📝 Outgoing Nurse Note</h3>
        <textarea
          className="w-full bg-white border border-yellow-200 rounded-lg p-3 text-sm text-gray-800 min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-yellow-400"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add anything not in the chart — what you're watching, family context, pending physician callbacks..."
        />
      </div>

      {/* ── 8. HANDOFF SIGN-OFF ── */}
      <div className="bg-white rounded-xl border-2 border-blue-200 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-700 mb-4">🤝 Shift Handoff Sign-Off</h3>
        {handoffStep === 0 && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-gray-600">Outgoing nurse: confirm all information above is accurate and note is complete.</p>
            <button
              onClick={() => setHandoffStep(1)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
            >
              ✓ I confirm this information is accurate — Outgoing Nurse
            </button>
          </div>
        )}
        {handoffStep === 1 && (
          <div className="flex flex-col gap-3">
            <div className="text-sm text-green-700 font-medium">✓ Outgoing nurse confirmed at {new Date().toLocaleTimeString()}</div>
            <p className="text-sm text-gray-600">Incoming nurse: review all sections and accept this patient.</p>
            <button
              onClick={() => setHandoffStep(2)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors w-full sm:w-auto"
            >
              ✓ I have reviewed and accept this patient — Incoming Nurse
            </button>
          </div>
        )}
        {handoffStep === 2 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <div className="text-lg font-bold text-green-700">Handoff Complete</div>
            <div className="text-sm text-gray-500 mt-1">Both nurses signed off at {new Date().toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      <button onClick={() => router.push('/')} className="mt-6 text-sm text-blue-600 hover:underline">
        ← Back to Patient List
      </button>
    </main>
  )
}
