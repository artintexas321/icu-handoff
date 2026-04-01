import { NextResponse } from 'next/server'
import { provider } from '@/lib/providers'

export async function GET() {
  try {
    const patients = await provider.listPatients()
    return NextResponse.json(patients)
  } catch (err) {
    console.error('[/api/patients]', err)
    return NextResponse.json({ error: 'Failed to load patients' }, { status: 500 })
  }
}
