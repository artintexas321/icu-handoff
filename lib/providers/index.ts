/**
 * ShiftView Provider Registry
 *
 * Set DATA_PROVIDER in .env.local to switch data sources:
 *
 *   DATA_PROVIDER=mock       — local static demo data (default)
 *   DATA_PROVIDER=epic       — Epic FHIR R4
 *   DATA_PROVIDER=cerner     — Cerner FHIR R4
 *   DATA_PROVIDER=generic    — Custom REST API
 *
 * Adding a new hospital system:
 *   1. Create lib/providers/your-system.ts
 *   2. Implement PatientProvider interface
 *   3. Import and register it below
 *   4. Set DATA_PROVIDER=your-system in .env.local
 */

import type { PatientProvider } from './types'
import { mockProvider } from './mock'
import { epicFhirProvider } from './epic-fhir'
import { cernerFhirProvider } from './cerner-fhir'
import { genericRestProvider } from './generic-rest'

const providerName = process.env.DATA_PROVIDER || 'mock'

const providers: Record<string, PatientProvider> = {
  mock: mockProvider,
  epic: epicFhirProvider,
  cerner: cernerFhirProvider,
  generic: genericRestProvider,
}

const provider = providers[providerName]

if (!provider) {
  throw new Error(
    `Unknown DATA_PROVIDER: "${providerName}". Valid options: ${Object.keys(providers).join(', ')}`
  )
}

console.log(`[ShiftView] Data provider: ${provider.name}`)

export { provider }
export type { PatientProvider, PatientSummary, PatientDetail, TimelineEntry } from './types'
