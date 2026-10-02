import { careStore, type CareStore } from './careStore'
import { clone, patientKey, type CareState, type CarePlans, type PatientClinical } from './state'
import type { PatientList, PatientVitals } from '../data/patients'
import type {
  CareAssessment,
  CareItem,
  ClinicalEvolution,
  ExamRequest,
  Prescription,
} from '../data/clinical'

export function nowTime(): string {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

export function todayLabel(time: string): string {
  return `${time} · Hoje`
}

let sequence = 0

export function entryId(prefix: string): string {
  sequence += 1
  return `${prefix}-${Date.now().toString(36)}-${sequence}`
}

type AnyPatient = CareState['patients'][number]

function updatePatient(state: CareState, patientId: number, recipe: (patient: AnyPatient) => AnyPatient): CareState {
  return {
    ...state,
    // `map` preserva tamanho e ordem, então a lista continua não vazia.
    patients: state.patients.map((patient) => (patient.id === patientId ? recipe(patient) : patient)) as PatientList,
  }
}

function updateClinical(
  state: CareState,
  patientId: number,
  recipe: (record: PatientClinical) => Partial<PatientClinical>,
): CareState {
  const key = patientKey(patientId)
  const record = state.clinical[key]
  if (!record) return state
  return { ...state, clinical: { ...state.clinical, [key]: { ...record, ...recipe(record) } } }
}

export type EvolutionDraft = Pick<ClinicalEvolution, 'title' | 'note' | 'area'> & { author: string; authorRole: string }

export type PrescriptionDraft = Pick<Prescription, 'drug' | 'dose' | 'route' | 'frequency' | 'author'>

export type ExamDraft = Pick<ExamRequest, 'exam' | 'detail' | 'urgency' | 'requestedBy'>

export type AssessmentDraft = Pick<CareAssessment, 'title' | 'score' | 'detail' | 'author' | 'area'>

export type CareActions = {
  recordVitals(patientId: number, reading: PatientVitals, recordedBy: string, recordedAt?: string): void
  setMedicationTaken(patientId: number, medicationId: string, taken: boolean): void
  setCareItemState(patientId: number, title: string, itemState: CareItem['state']): void
  appendCareItem(patientId: number, item: CareItem): void
  updatePatientStatus(patientId: number, status: AnyPatient['status']): void
  addEvolution(patientId: number, draft: EvolutionDraft, at?: string): void
  addPrescription(patientId: number, draft: PrescriptionDraft, at?: string): void
  setPrescriptionStatus(patientId: number, prescriptionId: string, status: Prescription['status']): void
  requestExam(patientId: number, draft: ExamDraft, at?: string): void
  addAssessment(patientId: number, draft: AssessmentDraft, at?: string): void
  setCarePlan(patientId: number, area: keyof CarePlans, text: string): void
  registerPatient(patient: AnyPatient, clinical: PatientClinical): void
}

export function createCareActions(store: CareStore): CareActions {
  return {
    recordVitals(patientId, reading, recordedBy, recordedAt = nowTime()) {
      store.updateState((state) => {
        if (!state.patients.some((patient) => patient.id === patientId)) return state
        return updatePatient(state, patientId, (patient) => ({
          ...patient,
          vitals: [...patient.vitals, { ...reading, recordedAt, recordedBy }],
        }))
      })
    },

    setMedicationTaken(patientId, medicationId, taken) {
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          patientMedications: record.patientMedications.map((medication) =>
            medication.id === medicationId ? { ...medication, taken } : medication,
          ),
        })),
      )
    },

    setCareItemState(patientId, title, itemState) {
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          careItems: record.careItems.map((item) => (item.title === title ? { ...item, state: itemState } : item)),
        })),
      )
    },

    appendCareItem(patientId, item) {
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({ careItems: [...record.careItems, item] })),
      )
    },

    updatePatientStatus(patientId, status) {
      store.updateState((state) => {
        if (!state.patients.some((patient) => patient.id === patientId)) return state
        return updatePatient(state, patientId, (patient) => ({ ...patient, status }))
      })
    },

    addEvolution(patientId, draft, at = nowTime()) {
      const entry: ClinicalEvolution = {
        id: entryId('evo'),
        time: at,
        timeLabel: todayLabel(at),
        title: draft.title,
        note: draft.note,
        author: draft.author,
        authorRole: draft.authorRole,
        area: draft.area,
      }
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({ evolutions: [entry, ...record.evolutions] })),
      )
    },

    addPrescription(patientId, draft, at = nowTime()) {
      const prescription: Prescription = {
        id: entryId('rx'),
        time: at,
        drug: draft.drug,
        dose: draft.dose,
        route: draft.route,
        frequency: draft.frequency,
        author: draft.author,
        status: 'Ativa',
      }
      const medication = {
        id: prescription.id,
        time: at,
        name: prescription.drug,
        dose: `${prescription.dose} · ${prescription.route.toLowerCase()}`,
      }
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          prescriptions: [prescription, ...record.prescriptions],
          patientMedications: [...record.patientMedications, medication],
        })),
      )
    },

    setPrescriptionStatus(patientId, prescriptionId, status) {
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          prescriptions: record.prescriptions.map((prescription) =>
            prescription.id === prescriptionId ? { ...prescription, status } : prescription,
          ),
        })),
      )
    },

    requestExam(patientId, draft, at = nowTime()) {
      const request: ExamRequest = {
        id: entryId('ex'),
        time: at,
        exam: draft.exam,
        detail: draft.detail,
        urgency: draft.urgency,
        requestedBy: draft.requestedBy,
        status: 'Solicitado',
      }
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({ examRequests: [request, ...record.examRequests] })),
      )
    },

    addAssessment(patientId, draft, at = nowTime()) {
      const assessment: CareAssessment = {
        id: entryId('as'),
        time: at,
        title: draft.title,
        score: draft.score,
        detail: draft.detail,
        author: draft.author,
        area: draft.area,
      }
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          assessments: {
            ...record.assessments,
            [draft.area]: [assessment, ...(record.assessments[draft.area] ?? [])],
          },
        })),
      )
    },

    setCarePlan(patientId, area, text) {
      store.updateState((state) =>
        updateClinical(state, patientId, (record) => ({
          carePlans: { ...record.carePlans, [area]: text },
        })),
      )
    },

    registerPatient(patient, clinical) {
      store.updateState((state) => {
        if (state.patients.some((existing) => existing.id === patient.id)) return state
        return {
          ...state,
          patients: [...state.patients, clone(patient)],
          clinical: { ...state.clinical, [patientKey(patient.id)]: clone(clinical) },
          activePatientId: patient.id,
        }
      })
    },
  }
}

export const careActions = createCareActions(careStore)
