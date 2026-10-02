import { describe, expect, it } from 'vitest'
import { patients } from '../data/patients'
import { createCareActions } from './actions'
import { createCareStore, type StorageLike } from './careStore'
import {
  createAdmissionClinical,
  emptyPatientDraft,
  nextFreeBed,
  nextPatientId,
  validatePatientDraft,
  type NewPatientDraft,
} from './enrollment'
import { recordOf } from './testHelpers'

/** Data fixa para que idade, leito e horário sejam determinísticos nos testes. */
const reference = new Date(2026, 0, 15, 14, 30)

function fakeStorage(): StorageLike {
  const data: Record<string, string> = {}
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

function draft(overrides: Partial<NewPatientDraft> = {}): NewPatientDraft {
  return {
    ...emptyPatientDraft,
    name: 'Helena Duarte',
    birthdate: '1984-03-12',
    sex: 'Feminino',
    phone: '(11) 98765-4321',
    ...overrides,
  }
}

describe('validação do cadastro de paciente', () => {
  it('recusa o rascunho vazio com erro por campo', () => {
    const result = validatePatientDraft(emptyPatientDraft, [], reference)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(Object.keys(result.errors).sort()).toEqual(['birthdate', 'name', 'phone', 'sex'])
  })

  it('recusa telefone sem DDD e e-mail inválido', () => {
    const result = validatePatientDraft(draft({ phone: '1234', email: 'sem-arroba' }), [], reference)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.phone).toBeTruthy()
    expect(result.errors.email).toBeTruthy()
  })

  it('exige número da carteirinha quando há convênio', () => {
    const result = validatePatientDraft(draft({ insurance: 'Unimed' }), [], reference)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.insuranceNumber).toBeTruthy()
  })

  it('aceita o rascunho válido e monta um paciente com leitura de admissão', () => {
    const result = validatePatientDraft(draft({ insurance: 'Unimed', insuranceNumber: '123456' }), [], reference)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.patient.name).toBe('Helena Duarte')
    expect(result.patient.age).toBe(41)
    expect(result.patient.status).toBe('Estável')
    expect(result.patient.vitals).toHaveLength(1)
    expect(result.patient.vitals[0]?.recordedAt).toBe('14:30')
    expect(result.patient.diagnosis).toContain('Unimed')
  })

  it('aceita recém-nascido com idade 0', () => {
    const result = validatePatientDraft(draft({ birthdate: '2026-01-10' }), [], reference)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.patient.age).toBe(0)
  })

  it('recusa data de nascimento no futuro', () => {
    const result = validatePatientDraft(draft({ birthdate: '2026-01-16' }), [], reference)

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.birthdate).toBeTruthy()
  })
})

describe('escolha de leito e identificador', () => {
  it('escolhe um leito que não colide com nenhum paciente existente', () => {
    const bed = nextFreeBed(patients)

    expect(patients.some((patient) => patient.bed === bed)).toBe(false)
    expect(bed).toMatch(/^Leito \d{3}$/)
  })

  it('usa o maior identificador mais um', () => {
    const next = nextPatientId(patients)
    const highest = patients.reduce((max, patient) => Math.max(max, patient.id), 0)

    expect(next).toBe(highest + 1)
    expect(patients.every((patient) => patient.id < next)).toBe(true)
  })
})

describe('prontuário de admissão', () => {
  it('começa sem listas pendentes e com os planos de todas as áreas', () => {
    const validated = validatePatientDraft(draft(), [], reference)
    expect(validated.ok).toBe(true)
    if (!validated.ok) return

    const clinical = createAdmissionClinical(validated.patient)

    expect(clinical.evolutions).toHaveLength(1)
    expect(clinical.evolutions[0]?.authorRole).toBe('Recepção')
    expect(clinical.prescriptions).toHaveLength(0)
    expect(clinical.examRequests).toHaveLength(0)
    expect(clinical.careItems).toHaveLength(0)
    expect(clinical.daySchedule).toHaveLength(1)
    for (const plan of Object.values(clinical.carePlans)) {
      expect(plan.length).toBeGreaterThan(0)
    }
    for (const list of Object.values(clinical.assessments)) {
      expect(list).toHaveLength(0)
    }
  })
})

describe('cadastro de paciente no store', () => {
  it('registra o paciente e cria o prontuário correspondente', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const before = store.getState().patients.length

    const validated = validatePatientDraft(draft(), store.getState().patients, reference)
    expect(validated.ok).toBe(true)
    if (!validated.ok) return

    actions.registerPatient(validated.patient, createAdmissionClinical(validated.patient))

    const state = store.getState()
    expect(state.patients).toHaveLength(before + 1)
    const clinical = recordOf(state, validated.patient.id)
    expect(clinical.evolutions).toHaveLength(1)
  })

  it('ignora ids repetidos sem duplicar o paciente', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const validated = validatePatientDraft(draft(), store.getState().patients, reference)
    expect(validated.ok).toBe(true)
    if (!validated.ok) return

    const clinical = createAdmissionClinical(validated.patient)
    actions.registerPatient(validated.patient, clinical)
    const after = store.getState().patients.length
    actions.registerPatient(validated.patient, clinical)

    expect(store.getState().patients).toHaveLength(after)
  })
})