import {
  careActions,
  careGoals,
  careItems,
  daySchedule,
  meals,
  nurseMedications,
  nutritionPendingItems,
  patientMedications,
  patientRoutines,
  physiotherapyPendingItems,
  planInterventions,
  psychologyPendingItems,
  sessionSchedule,
  assessmentMetrics,
  therapyGoals,
  therapyInterventions,
  therapyObjectives,
  carePlanAreas,
  createCarePlans,
  createEvolutions,
  seedAssessments,
  seedExamRequests,
  seedPrescriptions,
  type CareAction,
  type CareAssessment,
  type CareGoal,
  type CareItem,
  type CarePlanArea,
  type ClinicalEvolution,
  type EvolutionArea,
  type ExamRequest,
  type Meal,
  type Medication,
  type NutritionPendingItem,
  type PatientMedication,
  type PendingItem,
  type Prescription,
  type RoutineItem,
  type ScheduleEntry,
  type TherapyGoal,
  type TherapyRow,
  type AssessmentMetric,
} from '../data/clinical'
import { countPatients, defaultPatientId, latestVitals, patients, type Patient, type PatientCounts, type PatientList } from '../data/patients'

export type CarePlans = Record<CarePlanArea, string>

export type PatientClinical = {
  careItems: CareItem[]
  medications: Medication[]
  patientMedications: PatientMedication[]
  routines: RoutineItem[]
  meals: Meal[]
  nutritionPending: NutritionPendingItem[]
  therapyGoals: TherapyGoal[]
  therapyObjectives: TherapyRow[]
  therapyInterventions: TherapyRow[]
  assessmentMetrics: AssessmentMetric[]
  sessionSchedule: ScheduleEntry[]
  physiotherapyPending: PendingItem[]
  careGoals: CareGoal[]
  careActions: CareAction[]
  planInterventions: CareAction[]
  daySchedule: ScheduleEntry[]
  psychologyPending: PendingItem[]
  evolutions: ClinicalEvolution[]
  prescriptions: Prescription[]
  examRequests: ExamRequest[]
  assessments: Record<EvolutionArea, CareAssessment[]>
  carePlans: CarePlans
}

export type CareState = {
  patients: PatientList
  clinical: Record<string, PatientClinical>
  activePatientId: number
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function patientKey(patientId: number): string {
  return String(patientId)
}

function createClinical(patient: Patient): PatientClinical {
  return clone({
    careItems,
    medications: nurseMedications,
    patientMedications,
    routines: patientRoutines,
    meals,
    nutritionPending: nutritionPendingItems,
    therapyGoals,
    therapyObjectives,
    therapyInterventions,
    assessmentMetrics,
    sessionSchedule,
    physiotherapyPending: physiotherapyPendingItems,
    careGoals,
    careActions,
    planInterventions,
    daySchedule,
    psychologyPending: psychologyPendingItems,
    evolutions: createEvolutions(latestVitals(patient).spo2),
    prescriptions: seedPrescriptions,
    examRequests: seedExamRequests,
    assessments: seedAssessments,
    carePlans: createCarePlans(),
  })
}

export function createSeedState(): CareState {
  const seededPatients = clone(patients) as PatientList
  const clinical: Record<string, PatientClinical> = {}
  for (const patient of seededPatients) {
    clinical[patientKey(patient.id)] = createClinical(patient)
  }
  return { patients: seededPatients, clinical, activePatientId: defaultPatientId }
}

export function selectActivePatient(state: CareState): Patient {
  return state.patients.find((patient) => patient.id === state.activePatientId) ?? state.patients[0]
}

export function selectClinical(state: CareState, patientId: number): PatientClinical | undefined {
  return state.clinical[patientKey(patientId)]
}

/**
 * Invariante do store: todo paciente em `state.patients` possui prontuário.
 * `createSeedState` e `repairState` garantem isso ao montar o estado, então a
 * ausência aqui significa estado corrompido — falhar é melhor que renderizar
 * uma tela clínica com dados vazios sem sinalizar o problema.
 */
export function requireClinical(state: CareState, patientId: number): PatientClinical {
  const record = selectClinical(state, patientId)
  if (!record) throw new Error(`Prontuário ausente para o paciente ${patientId}.`)
  return record
}

export function selectCounts(state: CareState): PatientCounts {
  return countPatients(state.patients)
}

/** Coleções presentes desde o início: se faltar alguma, o estado é irrecuperável. */
const coreCollections = [
  'careItems',
  'medications',
  'patientMedications',
  'routines',
  'meals',
  'nutritionPending',
  'therapyGoals',
  'therapyObjectives',
  'therapyInterventions',
  'assessmentMetrics',
  'sessionSchedule',
  'physiotherapyPending',
  'careGoals',
  'careActions',
  'planInterventions',
  'daySchedule',
  'psychologyPending',
] as const satisfies readonly (keyof PatientClinical)[]

/** Coleções da Fase 4a-2: opcionais na leitura, completadas por `migrateClinical`. */
const addedCollections = ['evolutions', 'prescriptions', 'examRequests'] as const satisfies readonly (keyof PatientClinical)[]

const assessmentAreas: EvolutionArea[] = ['Médico', 'Enfermagem', 'Nutrição', 'Fisioterapia', 'Psicologia']

function hasNewCollections(record: PatientClinical): boolean {
  if (!addedCollections.every((key) => Array.isArray(record[key]))) return false
  if (!record.assessments || typeof record.assessments !== 'object') return false
  if (!record.carePlans || typeof record.carePlans !== 'object') return false
  return (
    assessmentAreas.every((area) => Array.isArray(record.assessments[area])) &&
    carePlanAreas.every((area) => typeof record.carePlans[area] === 'string')
  )
}

/**
 * Estados gravados antes da Fase 4a-2 não têm as coleções novas. Em vez de
 * descartar tudo e voltar ao seed, completamos apenas o que falta e
 * preserva o que o usuário já havia registrado.
 */
export function migrateClinical(record: PatientClinical, patient: Patient): PatientClinical {
  if (hasNewCollections(record)) return record
  const seed = createClinical(patient)
  const migrated: PatientClinical = { ...seed }
  for (const key of [...coreCollections, ...addedCollections] as (keyof PatientClinical)[]) {
    if (Array.isArray(record[key])) (migrated[key] as unknown[]) = record[key] as unknown[]
  }
  migrated.assessments = { ...seed.assessments }
  for (const area of assessmentAreas) {
    const existing = record.assessments?.[area]
    if (Array.isArray(existing)) migrated.assessments[area] = existing
  }
  migrated.carePlans = { ...seed.carePlans }
  for (const area of carePlanAreas) {
    const existing = record.carePlans?.[area]
    if (typeof existing === 'string' && existing.length > 0) migrated.carePlans[area] = existing
  }
  return migrated
}

export function isCareState(value: unknown): value is CareState {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<CareState>
  if (!Array.isArray(candidate.patients) || candidate.patients.length === 0) return false
  if (typeof candidate.activePatientId !== 'number') return false
  if (!candidate.clinical || typeof candidate.clinical !== 'object') return false
  const first = candidate.patients[0]
  if (!first || typeof first.id !== 'number' || !Array.isArray(first.vitals) || first.vitals.length === 0) return false
  for (const patient of candidate.patients) {
    const record = candidate.clinical[patientKey(patient.id)]
    if (!record || typeof record !== 'object') return false
    for (const collection of coreCollections) {
      if (!Array.isArray(record[collection])) return false
    }
  }
  return true
}

export function repairState(value: unknown): CareState | null {
  if (!isCareState(value)) return null
  const state = value as CareState
  const knownIds = new Set(state.patients.map((patient) => patient.id))
  const activePatientId = knownIds.has(state.activePatientId) ? state.activePatientId : defaultPatientId
  const clinical: Record<string, PatientClinical> = {}
  for (const patient of state.patients) {
    const record = selectClinical(state, patient.id)
    if (record) clinical[patientKey(patient.id)] = migrateClinical(record, patient)
  }
  return { ...state, clinical, activePatientId }
}
