import { useCallback, useMemo, useState } from 'react'
import { matchesPatientSearch, statusLabel, type CareArea, type Patient } from '../data/patients'
import { patientKey, requireClinical, selectActivePatient, selectCounts } from '../store/state'
import { careStore, useCareState } from '../store/careStore'

export function usePatientRecord(area: CareArea) {
  const state = useCareState()
  const [searchTerm, setSearchTerm] = useState('')

  const activePatient = selectActivePatient(state)
  const counts = useMemo(() => selectCounts(state), [state])
  const visiblePatients = useMemo(
    () => state.patients.filter((patient) => matchesPatientSearch(patient, searchTerm)),
    [state.patients, searchTerm],
  )
  const clinical = requireClinical(state, activePatient.id)
  const setActivePatientId = careStore.setActivePatient
  const clearSearch = useCallback(() => setSearchTerm(''), [])
  const statusOf = useCallback((patient: Patient) => statusLabel(patient, area), [area])

  return {
    allPatients: state.patients,
    activePatientId: state.activePatientId,
    activePatient,
    clinical,
    visiblePatients,
    counts,
    searchTerm,
    setSearchTerm,
    setActivePatientId,
    clearSearch,
    statusOf,
  }
}

export { patientKey }
