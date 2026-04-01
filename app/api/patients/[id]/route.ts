import { NextResponse } from 'next/server'
import { provider } from '@/lib/providers'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await provider.getPatient(params.id)
    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(patient)
  } catch (err) {
    console.error(`[/api/patients/${params.id}]`, err)
    return NextResponse.json({ error: 'Failed to load patient' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    if (body.note !== undefined) await provider.saveNote(params.id, body.note)
    if (body.handoffStatus !== undefined) await provider.updateHandoffStatus(params.id, body.handoffStatus)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(`[PATCH /api/patients/${params.id}]`, err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
