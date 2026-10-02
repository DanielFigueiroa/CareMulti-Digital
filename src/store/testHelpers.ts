import type { Patient } from '../data/patients'
import { selectClinical, type CareState, type PatientClinical } from './state'

/**
 * Auxiliares para os testes falharem com uma mensagem clara quando um índice ou
 * uma chave não existe, em vez de estourar um `TypeError` dentro do expect.
 */

export function patientAt(state: CareState, index: number): Patient {
  const patient = state.patients[index]
  if (!patient) throw new Error(`Paciente no índice ${index} não existe.`)
  return patient
}

export function recordAt(state: CareState, index: number): PatientClinical {
  return recordOf(state, patientAt(state, index).id)
}

export function recordOf(state: CareState, patientId: number): PatientClinical {
  const record = selectClinical(state, patientId)
  if (!record) throw new Error(`Prontuário do paciente ${patientId} não existe.`)
  return record
}

export function at<T>(list: readonly T[], index: number): T {
  const item = list[index]
  if (item === undefined) throw new Error(`Item no índice ${index} não existe (lista com ${list.length}).`)
  return item
}
