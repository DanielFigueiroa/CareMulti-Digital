import { carePlanAreas } from '../data/clinical'
import type { Patient, PatientVitals } from '../data/patients'
import { entryId } from './actions'
import type { PatientClinical } from './state'

export type NewPatientDraft = {
  name: string
  birthdate: string
  sex: string
  phone: string
  email: string
  insurance: string
  insuranceNumber: string
}

export const emptyPatientDraft: NewPatientDraft = {
  name: '',
  birthdate: '',
  sex: '',
  phone: '',
  email: '',
  insurance: '',
  insuranceNumber: '',
}

export type PatientDraftErrors = Partial<Record<keyof NewPatientDraft, string>>

export type PatientDraftResult =
  | { ok: true; patient: Patient }
  | { ok: false; errors: PatientDraftErrors }

/** Idade em anos completos na data de referência. */
export function ageFrom(birthdate: string, reference = new Date()): number {
  const [year = 0, month = 1, day = 1] = birthdate.split('-').map(Number)
  let age = reference.getFullYear() - year
  const monthDiff = reference.getMonth() + 1 - month
  if (monthDiff < 0 || (monthDiff === 0 && reference.getDate() < day)) age -= 1
  return age >= 0 && age <= 130 ? age : 0
}

/**
 * Primeiro leito livre da faixa 301 em diante. O prototipo não tem gestão de
 * leitos, então basta não colidir com um paciente já cadastrado.
 */
export function nextFreeBed(taken: readonly Patient[]): string {
  const used = new Set(taken.map((patient) => patient.bed))
  for (let floor = 3; floor <= 9; floor++) {
    for (let unit = 1; unit <= 40; unit++) {
      const bed = `Leito ${floor}${String(unit).padStart(2, '0')}`
      if (!used.has(bed)) return bed
    }
  }
  return `Leito ${taken.length + 1}`
}

export function nextPatientId(taken: readonly Patient[]): number {
  const max = taken.reduce((highest, patient) => Math.max(highest, patient.id), 0)
  return max + 1
}

const baselineVitals: PatientVitals = {
  bloodPressure: '120/80',
  heartRate: 78,
  respiratoryRate: 18,
  temperature: '36,6',
  spo2: 97,
}

export function validatePatientDraft(
  draft: NewPatientDraft,
  taken: readonly Patient[],
  reference = new Date(),
): PatientDraftResult {
  const errors: PatientDraftErrors = {}

  const name = draft.name.trim()
  if (name.length < 3) errors.name = 'Informe o nome completo do paciente.'

  if (!draft.birthdate) {
    errors.birthdate = 'Informe a data de nascimento.'
  } else {
    const [year = 0, month = 0, day = 0] = draft.birthdate.split('-').map(Number)
    const parsed = new Date(year, month - 1, day)
    const isRealDate =
      year > 0 && month > 0 && day > 0 &&
      parsed.getFullYear() === year && parsed.getMonth() === month - 1 && parsed.getDate() === day
    // `ageFrom` devolve 0 tanto para um recém-nascido quanto para uma data
    // inválida, então a data é conferida aqui para não recusar bebês.
    if (!isRealDate || parsed.getTime() > reference.getTime()) {
      errors.birthdate = 'Informe uma data de nascimento válida.'
    }
  }

  if (!draft.sex) errors.sex = 'Selecione o sexo.'

  const phone = draft.phone.replace(/\D/g, '')
  if (phone.length < 10) errors.phone = 'Informe um telefone com DDD.'

  const email = draft.email.trim()
  if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (draft.insurance && draft.insuranceNumber.trim().length === 0) {
    errors.insuranceNumber = 'Informe o número da carteirinha.'
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  const record: PatientVitals = { ...baselineVitals }
  return {
    ok: true,
    patient: {
      id: nextPatientId(taken),
      name,
      age: ageFrom(draft.birthdate, reference),
      bed: nextFreeBed(taken),
      admittedAt: formatToday(reference),
      diagnosis: draft.insurance.trim() ? `Convênio ${draft.insurance.trim()}` : 'Avaliação inicial',
      comorbidities: 'A confirmar',
      allergies: 'Não informado',
      focus: 'Avaliação inicial',
      status: 'Estável',
      // `VitalsSeries` exige ao menos uma leitura; o paciente entra com a
      // leitura de admissão para que `latestVitals` funcione imediatamente.
      vitals: [
        {
          ...record,
          recordedAt: nowClock(reference),
          recordedBy: 'Recepção',
        },
      ],
    },
  }
}

function formatToday(reference: Date): string {
  const day = String(reference.getDate()).padStart(2, '0')
  const month = String(reference.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${reference.getFullYear()}`
}

function nowClock(reference: Date): string {
  return `${String(reference.getHours()).padStart(2, '0')}:${String(reference.getMinutes()).padStart(2, '0')}`
}

/**
 * Prontuário mínimo para um paciente recém-admitido. Não reaproveita as listas
 * do seed porque elas citam a rotina e medicações de outras pessoas; um
 * paciente novo começa com a agenda do dia e as pendências zeradas.
 */
export function createAdmissionClinical(patient: Patient): PatientClinical {
  const at = patient.vitals[0].recordedAt

  const carePlans = {} as PatientClinical['carePlans']
  for (const area of carePlanAreas) {
    carePlans[area] = 'Plano a definir pela equipe.'
  }

  return {
    careItems: [],
    medications: [],
    patientMedications: [],
    routines: [],
    meals: [],
    nutritionPending: [],
    therapyGoals: [],
    therapyObjectives: [],
    therapyInterventions: [],
    assessmentMetrics: [],
    sessionSchedule: [],
    physiotherapyPending: [],
    careGoals: [],
    careActions: [],
    planInterventions: [],
    daySchedule: [
      {
        time: at,
        title: 'Admissão registrada',
        detail: `${patient.bed} · ${patient.diagnosis}`,
      },
    ],
    psychologyPending: [],
    evolutions: [
      {
        id: entryId('evo'),
        time: at,
        timeLabel: `${at} · Hoje`,
        title: 'Admissão registrada',
        note: `Paciente ${patient.name} admitido em ${patient.bed}. Primeiro registro criado pela recepção.`,
        author: 'Recepção',
        authorRole: 'Recepção',
        area: 'Enfermagem',
      },
    ],
    prescriptions: [],
    examRequests: [],
    assessments: {
      Médico: [],
      Enfermagem: [],
      Nutrição: [],
      Fisioterapia: [],
      Psicologia: [],
    },
    carePlans,
  }
}