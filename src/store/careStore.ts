import { useSyncExternalStore } from 'react'
import { createSeedState, patientKey, repairState, type CareState } from './state'

export const STORAGE_KEY = 'caremulti:state:v1'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export type CareStore = {
  getState(): CareState
  subscribe(listener: () => void): () => void
  setActivePatient(patientId: number): void
  updateState(recipe: (state: CareState) => CareState): void
  resetDemoData(): void
  storageAvailable: boolean
}

export function browserStorage(): StorageLike | null {
  try {
    if (typeof globalThis === 'undefined') return null
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage
    if (!candidate) return null
    const probe = '__caremulti_probe__'
    candidate.setItem(probe, '1')
    candidate.removeItem(probe)
    return candidate
  } catch {
    return null
  }
}

export function readStoredState(storage: StorageLike | null): CareState | null {
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return null
    return repairState(JSON.parse(raw))
  } catch {
    return null
  }
}

export function createCareStore(storage: StorageLike | null = browserStorage()): CareStore {
  let state = readStoredState(storage) ?? createSeedState()
  const listeners = new Set<() => void>()

  function persist() {
    if (!storage) return
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      return
    }
  }

  function emit() {
    for (const listener of listeners) listener()
  }

  function commit(next: CareState) {
    state = next
    persist()
    emit()
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    setActivePatient(patientId) {
      if (!state.patients.some((patient) => patient.id === patientId)) return
      if (patientId === state.activePatientId) return
      commit({ ...state, activePatientId: patientId })
    },
    updateState(recipe) {
      commit(recipe(state))
    },
    resetDemoData() {
      if (storage) {
        try {
          storage.removeItem(STORAGE_KEY)
        } catch {
          storage = null
        }
      }
      commit(createSeedState())
    },
    storageAvailable: storage !== null,
  }
}

export const careStore = createCareStore()

export function useCareState(): CareState {
  return useSyncExternalStore(careStore.subscribe, careStore.getState, careStore.getState)
}

export { patientKey }
