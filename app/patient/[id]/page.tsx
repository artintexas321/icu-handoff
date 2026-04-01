'use client'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { patients } from '@/data/patients'

function Block({ title, children, alert }: { title: string; children: React.ReactNode; alert?: boolean }) {
  return (
    <div className={`border rounded p-3 ${alert ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${alert ? 'text-red-700' : 'text-gray-400'}`}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, value, red, yellow, green }: { label: string; value: React.ReactNode; red?: boolean; yellow?: boolean; green?: boolean }) {
  const chip = red ? 'bg-red-100 text-red-800' : yellow ? 'bg-yellow-100 text-yellow-800' : green ? 'bg-green-100 text-green-800' : ''
  return (
    <div className="flex items-start gap-1 text-xs py-0.5 border-b border-gray-50 last:border-0">
      <span className="text-gray-400 w-[130px] shrink-0 leading-5">{label}</span>
      <span className={`text-gray-900 font-medium leading-5 flex-1 ${chip ? `px-1 rounded ${chip}` : ''}`}>{value}</span>
    </div>
  )
}

export default function PatientPage() {
  const { id } = useParams()
  const router = useRouter()
  const patient = patients.find(p => p.id === id)
  const [note, setNote] = useState(patient?.outgoingNote || '')
  const [handoffStep, setHandoffStep] = useState(
    patient?.handoffStatus === 'complete' ? 2 :
    patient?.handoffStatus === 'outgoing_confirmed' ? 1 : 0
  )

  if (!patient) return <div className="p-8 text-center text-gray-500">Patient not found.</div>

  const isDNR = patient.codeStatus.includes('DNR') || patient.codeStatus.includes('DNI')
  const positiveCulture = patient.cultures.find(c => c.status === 'POSITIVE')

  const calcMAP = (bp: string) => {
    const [s, d] = bp.split('/').map(Number)
    if (isNaN(s) || isNaN(d)) return '?'
    return Math.round((s + 2 * d) / 3)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-3 print:p-0 print:bg-white">
      <div className="max-w-[1400px] mx-auto bg-white shadow-sm rounded border border-gray-300 print:shadow-none print:border-0">

        {/* ── PATIENT HEADER ── */}
        <div className={`px-4 py-3 border-b-2 flex flex-wrap gap-4 items-start justify-between ${isDNR ? 'bg-red-700 border-red-800' : 'bg-blue-800 border-blue-900'}`}>
          <div className="text-white">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xl font-bold">{patient.name}</span>
              <span className="text-white/70 text-sm">{patient.age} y/o</span>
              <span className="bg-white/20 border border-white/30 text-white text-sm font-semibold px-2 py-0.5 rounded">{patient.room}</span>
              {isDNR && <span className="bg-white text-red-700 text-xs font-bold px-2 py-0.5 rounded">⚠ {patient.codeStatus}</span>}
              {!isDNR && <span className="bg-white/20 border border-white/30 text-white text-xs font-semibold px-2 py-0.5 rounded">{patient.codeStatus}</span>}
              {positiveCulture && <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded animate-pulse">🦠 POSITIVE CULTURE</span>}
            </div>
            <div className="mt-0.5 text-sm text-white/80">{patient.diagnosis}</div>
          </div>
          <div className="text-white text-xs text-right space-y-0.5">
            <div><span className="text-white/60">Attending: </span><strong>{patient.attending.replace('Dr. ', '')}</strong></div>
            <div><span className="text-white/60">Admitted: </span><strong>{patient.admitDate}</strong> · <span className="text-white/60">Source: </span><strong>{patient.admitSource}</strong></div>
            <div className="flex gap-3 justify-end mt-1">
              <span><span className="text-white/60">Ht: </span><strong>{patient.height}</strong></span>
              <span><span className="text-white/60">Wt: </span><strong>{patient.weight}</strong></span>
              <span><span className="text-white/60">Allergies: </span><strong>{patient.allergies.join(', ')}</strong></span>
            </div>
            <div><span className="text-white/60">Family: </span><strong>{patient.familyContact} — {patient.familyPhone}</strong></div>
          </div>
        </div>

        <div className="p-3 space-y-3">

          {/* ── ROW 1: CARE TEAM + PMH + TIMELINE ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* CARE TEAM */}
            <Block title="Care Team">
              <div className="text-xs mb-1.5">
                <span className="text-gray-400">Attending — </span>
                <span className="font-semibold text-gray-800">{patient.careTeam.attending.name}</span>
                <span className="text-gray-400 ml-1">({patient.careTeam.attending.service})</span>
              </div>
              {patient.careTeam.consults.map((c, i) => (
                <div key={i} className="text-xs mb-1">
                  <span className="text-gray-400">Consult ({c.service}) — </span>
                  <span className="font-semibold text-gray-800">{c.name}</span>
                </div>
              ))}
            </Block>

            {/* PMH */}
            <Block title="PMH">
              <div className="flex flex-wrap gap-1">
                {patient.pmh.map((item, i) => (
                  <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded border border-gray-200">{item}</span>
                ))}
              </div>
            </Block>

            {/* TIMELINE */}
            <Block title="Timeline">
              <div className="space-y-1">
                {patient.timeline.map((t, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${t.critical ? 'bg-red-500' : t.type === 'imaging' ? 'bg-purple-400' : t.type === 'procedure' ? 'bg-blue-400' : 'bg-gray-300'}`} />
                    <span className="text-gray-400 shrink-0 w-[70px]">{t.date}</span>
                    <span className={t.critical ? 'text-red-700 font-medium' : 'text-gray-700'}>{t.event}</span>
                  </div>
                ))}
              </div>
            </Block>
          </div>

          {/* ── ROW 2: CLINICAL SECTIONS (3-col grid) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">

            {/* NEURO */}
            <Block title="🧠 Neuro">
              <Field label="Check freq" value={patient.neuro.checkFreq} />
              <Field label="Last check" value={`${patient.neuro.lastCheck} (${patient.neuro.lastCheckTime})`} />
              <Field label="RASS" value={`${patient.neuro.rass} (goal ${patient.neuro.rassGoal})`} />
            </Block>

            {/* RESPIRATORY */}
            <Block title="🫁 Respiratory">
              {patient.respiratory.intubationDate ? (
                <>
                  <Field label="Mode" value={patient.respiratory.mode} />
                  <Field label="PEEP" value={patient.respiratory.peep!} />
                  <Field label="Tidal Volume" value={patient.respiratory.tidalVolume!} />
                  <Field label="Rate" value={patient.respiratory.rate!} />
                  <Field label="FiO2" value={patient.respiratory.fio2!} />
                  <Field label="Intubated" value={patient.respiratory.intubationDate} yellow />
                  {patient.respiratory.lastAbg && <Field label="Last ABG" value={patient.respiratory.lastAbg} />}
                </>
              ) : (
                <>
                  <Field label="O2" value={patient.respiratory.o2Device!} />
                  {patient.respiratory.lastAbg && patient.respiratory.lastAbg !== 'Not indicated' && (
                    <Field label="Last ABG" value={patient.respiratory.lastAbg} />
                  )}
                </>
              )}
            </Block>

            {/* CARDIAC */}
            <Block title="❤️ Cardiac">
              <Field label="HR / Rhythm" value={`${patient.cardiac.hr} — ${patient.cardiac.rhythm}`} />
              <Field
                label="BP / MAP"
                value={`${patient.cardiac.bp} — MAP ${calcMAP(patient.cardiac.bp)} (goal ${patient.cardiac.mapGoal})`}
                red={patient.cardiac.bpTrend === 'worsening'}
              />
              {patient.cardiac.pressors.length > 0
                ? patient.cardiac.pressors.map((p, i) => (
                    <Field key={i} label={i === 0 ? 'Pressors' : ''} value={`${p.name} @ ${p.rate}`} yellow />
                  ))
                : <Field label="Pressors" value="None" green />
              }
            </Block>

            {/* GI / GU */}
            <Block title="🍽️ GI / GU / Nutrition">
              <Field label="Diet / Nutrition" value={`${patient.nutrition.type} — ${patient.nutrition.details}`} />
              {patient.nutrition.tubeAccess && <Field label="Tube" value={patient.nutrition.tubeAccess} />}
              {patient.nutrition.freeWaterFlush && <Field label="FWF" value={patient.nutrition.freeWaterFlush} />}
              <Field
                label="Foley"
                value={
                  <span className="flex items-center gap-2">
                    {patient.nutrition.foleyDate}
                    {patient.nutrition.urineCultureSent === true && <span className="text-green-600 font-semibold text-xs">✓ UA sent</span>}
                    {patient.nutrition.urineCultureSent === false && <span className="text-red-500 font-semibold text-xs">⚠ UA not sent</span>}
                  </span>
                }
              />
              <Field
                label="Urine Output"
                value={patient.nutrition.urineOutput}
                red={patient.nutrition.urineOutput.toLowerCase().includes('low')}
              />
              <Field label="Last BM" value={patient.nutrition.lastBm} />
            </Block>

            {/* SKIN */}
            <Block title="🩹 Skin / Access Site">
              {patient.skin.length === 0 && !patient.accessSite ? (
                <div className="text-xs text-green-700 font-medium">✓ No wounds or pressure injuries</div>
              ) : (
                <>
                  {patient.accessSite && (
                    <Field
                      label="Access Site"
                      value={`${patient.accessSite.location} — ${patient.accessSite.notes} (${patient.accessSite.date})`}
                      yellow
                    />
                  )}
                  {patient.skin.map((s, i) => (
                    <Field key={i} label={s.location} value={`${s.type}${s.stage ? ' — ' + s.stage : ''} (${s.date})`} yellow />
                  ))}
                </>
              )}
            </Block>

            {/* LINES */}
            <Block title="💉 Lines / Access">
              {patient.lines.map((l, i) => (
                <Field key={i} label={`Line ${i + 1}`} value={`${l.type} — ${l.location} (${l.date})`} />
              ))}
            </Block>

            {/* DRIPS */}
            <Block title="💊 Active Drips">
              {patient.drips.length === 0
                ? <div className="text-xs text-gray-400">No active drips</div>
                : patient.drips.map((d, i) => (
                    <Field key={i} label={d.name} value={`${d.concentration} @ ${d.rate}`} />
                  ))
              }
            </Block>

            {/* CULTURES */}
            <Block title="🦠 Cultures / ID" alert={!!positiveCulture}>
              {patient.cultures.length === 0 ? (
                <div className="text-xs text-gray-400">No cultures drawn</div>
              ) : patient.cultures.map((c, i) => (
                <div key={i}>
                  <Field
                    label={c.type}
                    value={c.status}
                    red={c.status === 'POSITIVE'}
                    green={c.status === 'No Growth'}
                    yellow={c.status === 'Pending'}
                  />
                  {c.organism && <Field label="Organism" value={`${c.organism} — ${c.sensitivity}`} red />}
                  {c.abxDayOf && <Field label="Abx day" value={c.abxDayOf} />}
                </div>
              ))}
              {patient.antibiotics.map((a, i) => (
                <Field key={i} label="Active Abx" value={`${a.name} — ${a.day}`} />
              ))}
            </Block>

          </div>

          {/* ── LABS ── */}
          <Block title="🧪 Labs — 24hr Trend">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5">
              {patient.labs.map((l, i) => (
                <div key={i} className={`p-2 rounded border text-xs ${l.abnormal ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="text-gray-400 truncate">{l.name}</div>
                  <div className={`font-bold text-sm leading-tight ${l.abnormal ? 'text-red-700' : 'text-gray-900'}`}>
                    {l.value}<span className="font-normal text-xs ml-0.5">{l.unit}</span> {l.trend}
                  </div>
                </div>
              ))}
            </div>
          </Block>

          {/* ── PENDING ── */}
          <Block title="⏳ Pending / Outstanding">
            {patient.pending.length === 0 ? (
              <div className="text-xs text-gray-400">Nothing outstanding</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {patient.pending.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span className={`font-semibold px-1.5 py-0.5 rounded text-xs ${
                      p.type === 'Lab' ? 'bg-blue-100 text-blue-700' :
                      p.type === 'Imaging' ? 'bg-purple-100 text-purple-700' :
                      p.type === 'Consult' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{p.type}</span>
                    <span className="text-gray-700">{p.description}</span>
                  </div>
                ))}
              </div>
            )}
          </Block>

          {/* ── NURSE NOTE + SIGN-OFF (side by side) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

            <Block title="📝 Outgoing Nurse Note">
              <textarea
                className="w-full bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-800 min-h-[80px] resize-y focus:outline-none focus:ring-1 focus:ring-blue-400"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add anything not in the chart — what you're watching, family context, pending physician callbacks..."
              />
            </Block>

            <Block title="🤝 Shift Handoff Sign-Off">
              {handoffStep === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500">Outgoing nurse: confirm all information above is accurate and note is complete.</p>
                  <button
                    onClick={() => setHandoffStep(1)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
                  >
                    ✓ Confirm accuracy — Outgoing Nurse
                  </button>
                </div>
              )}
              {handoffStep === 1 && (
                <div className="space-y-2">
                  <div className="text-xs text-green-700 font-medium">✓ Outgoing confirmed at {new Date().toLocaleTimeString()}</div>
                  <p className="text-xs text-gray-500">Incoming nurse: review all sections and accept this patient.</p>
                  <button
                    onClick={() => setHandoffStep(2)}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-4 rounded transition-colors"
                  >
                    ✓ Accept patient — Incoming Nurse
                  </button>
                </div>
              )}
              {handoffStep === 2 && (
                <div className="text-center py-3">
                  <div className="text-2xl mb-1">✅</div>
                  <div className="text-sm font-bold text-green-700">Handoff Complete</div>
                  <div className="text-xs text-gray-400 mt-0.5">Both nurses signed off at {new Date().toLocaleTimeString()}</div>
                </div>
              )}
            </Block>

          </div>

        </div>
      </div>

      <button onClick={() => router.push('/')} className="mt-3 text-xs text-blue-600 hover:underline block text-center">
        ← Back to Patient List
      </button>
    </div>
  )
}
