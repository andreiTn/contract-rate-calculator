import {
  DASHBOARD_IDB_KEY,
  DASHBOARD_IDB_NAME,
  DASHBOARD_IDB_STORE,
  DASHBOARD_STORAGE_KEY,
  SETUP_DONE_KEY,
  parsePersistedDashboard,
  parsePersistedDashboardText,
  snapshotHasUserInputs,
  type PersistedDashboard,
} from './dashboardSchema'
import { idbDelete, idbGet, idbSet } from './indexedDb'
import { localGet, localRemove, localSet } from './localStore'

export type LoadStatus = 'empty' | 'ok' | 'corrupt' | 'unsupported'

export interface LoadOutcome {
  status: LoadStatus
  data?: PersistedDashboard
  version?: unknown
  /** True when IndexedDB could not be read (browser blocked it, etc.). */
  indexedDbError?: boolean
}

export interface SaveOutcome {
  localStorage: boolean
  indexedDb: boolean
}

function isUsable(result: ReturnType<typeof parsePersistedDashboard>): result is { status: 'ok'; data: PersistedDashboard } {
  return result.status === 'ok'
}

async function readIndexedDb(): Promise<{ parse: ReturnType<typeof parsePersistedDashboard>; error: boolean }> {
  try {
    const value = await idbGet<unknown>(DASHBOARD_IDB_NAME, DASHBOARD_IDB_STORE, DASHBOARD_IDB_KEY)
    if (value === undefined) return { parse: { status: 'corrupt' }, error: false }
    return { parse: parsePersistedDashboard(value), error: false }
  } catch {
    return { parse: { status: 'corrupt' }, error: true }
  }
}

/**
 * Load the dashboard snapshot.
 * Prefer a valid localStorage copy (fast). Fall back to IndexedDB and mirror it.
 * An unsupported version never clears storage.
 */
export async function loadDashboardSnapshot(): Promise<LoadOutcome> {
  const localRaw = localGet(DASHBOARD_STORAGE_KEY)
  if (localRaw != null) {
    const localParse = parsePersistedDashboardText(localRaw)
    if (isUsable(localParse)) {
      void idbSet(DASHBOARD_IDB_NAME, DASHBOARD_IDB_STORE, DASHBOARD_IDB_KEY, localParse.data).catch(() => undefined)
      return { status: 'ok', data: localParse.data }
    }
    if (localParse.status === 'unsupported') {
      return { status: 'unsupported', version: localParse.version }
    }
  }

  const indexed = await readIndexedDb()
  if (isUsable(indexed.parse)) {
    localSet(DASHBOARD_STORAGE_KEY, JSON.stringify(indexed.parse.data))
    return { status: 'ok', data: indexed.parse.data, indexedDbError: indexed.error }
  }
  if (indexed.parse.status === 'unsupported') {
    return { status: 'unsupported', version: indexed.parse.version, indexedDbError: indexed.error }
  }

  if (localRaw != null) {
    localRemove(DASHBOARD_STORAGE_KEY)
    return { status: 'corrupt', indexedDbError: indexed.error }
  }

  return { status: 'empty', indexedDbError: indexed.error }
}

/** Write to localStorage and IndexedDB. One success is enough for a soft save. */
export async function saveDashboardSnapshot(data: PersistedDashboard): Promise<SaveOutcome> {
  const payload = JSON.stringify(data)
  const localOk = localSet(DASHBOARD_STORAGE_KEY, payload)
  let indexedOk = false
  try {
    await idbSet(DASHBOARD_IDB_NAME, DASHBOARD_IDB_STORE, DASHBOARD_IDB_KEY, data)
    indexedOk = true
  } catch {
    indexedOk = false
  }
  return { localStorage: localOk, indexedDb: indexedOk }
}

export async function clearDashboardSnapshot(): Promise<void> {
  localRemove(DASHBOARD_STORAGE_KEY)
  try {
    await idbDelete(DASHBOARD_IDB_NAME, DASHBOARD_IDB_STORE, DASHBOARD_IDB_KEY)
  } catch {
    // ignore
  }
}

export function markSetupDone(): void {
  localSet(SETUP_DONE_KEY, 'done')
}

export function isSetupDone(): boolean {
  return localGet(SETUP_DONE_KEY) === 'done'
}

/** True when the user finished setup or a store already holds real inputs. */
export async function hasSavedDashboard(): Promise<boolean> {
  if (isSetupDone()) return true
  const loaded = await loadDashboardSnapshot()
  if (loaded.status !== 'ok' || !loaded.data) return false
  return snapshotHasUserInputs(loaded.data)
}

export type { PersistedDashboard }
