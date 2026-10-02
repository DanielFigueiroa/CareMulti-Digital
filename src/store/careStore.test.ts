import { describe, expect, it } from 'vitest'
import { createCareStore, readStoredState, STORAGE_KEY, type StorageLike } from './careStore'
import { createSeedState, isCareState, patientKey, repairState, selectActivePatient, type CareState } from './state'
import { at, patientAt, recordOf } from './testHelpers'
import { createEvolutions } from '../data/clinical'
import { latestVitals, patients, type PatientList } from '../data/patients'
function fakeStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data: Record<string, string> = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
    removeItem: (key) => {
      delete data[key]
    },
  }
}

describe('estado inicial', () => {
  it('cria um estado coerente com a lista de pacientes', () => {
    const state = createSeedState()
    expect(state.patients).toHaveLength(patients.length)
    expect(selectActivePatient(state).id).toBe(state.activePatientId)
  })

  it('dá um registro clínico próprio para cada paciente', () => {
    const state = createSeedState()
    for (const patient of state.patients) {
      const record = recordOf(state, patient.id)
      expect(record).toBeDefined()
      expect(record.careItems.length).toBeGreaterThan(0)
      expect(record.meals.length).toBeGreaterThan(0)
    }
  })

  it('não compartilha referências entre o seed e o estado criado', () => {
    const first = createSeedState()
    const second = createSeedState()
    const primeiro = recordOf(first, patientAt(first, 0).id)
    const segundo = recordOf(second, patientAt(second, 0).id)
    expect(primeiro).not.toBe(segundo)
    expect(primeiro.careItems).not.toBe(segundo.careItems)
    expect(first.patients).not.toBe(second.patients)
    expect(patientAt(first, 0)).not.toBe(patientAt(second, 0))
  })

  it('não deixa o estado inicial alterar o seed original', () => {
    const before = JSON.stringify(patients)
    const state = createSeedState()
    patientAt(state, 0).vitals[0].spo2 = 12
    at(recordOf(state, patientAt(state, 0).id).careItems, 0).title = 'alterado'
    expect(JSON.stringify(patients)).toBe(before)
  })
})

describe('validação de estado', () => {
  it('aceita um estado válido', () => {
    expect(isCareState(createSeedState())).toBe(true)
  })

  it('recusa estado sem pacientes', () => {
    expect(isCareState({ ...createSeedState(), patients: [] })).toBe(false)
  })

  it('recusa estado sem histórico de sinais vitais', () => {
    const state = createSeedState()
    const broken = { ...state, patients: [{ ...patientAt(state, 0), vitals: [] }, ...state.patients.slice(1)] }
    expect(isCareState(broken)).toBe(false)
  })

  it('recusa estado com paciente sem registro clínico', () => {
    const state = createSeedState()
    const broken = { ...state, clinical: {} }
    expect(isCareState(broken)).toBe(false)
  })

  it('recusa registro clínico com lista de cuidados inválida', () => {
    const state = createSeedState()
    const alvo = patientAt(state, 0)
    const key = patientKey(alvo.id)
    const broken = { ...state, clinical: { ...state.clinical, [key]: { ...recordOf(state, alvo.id), careItems: 'nao-e-lista' } } }
    expect(isCareState(broken)).toBe(false)
  })

  it('recusa registro clínico com refeições inválidas', () => {
    const state = createSeedState()
    const alvo = patientAt(state, 1)
    const key = patientKey(alvo.id)
    const broken = { ...state, clinical: { ...state.clinical, [key]: { ...recordOf(state, alvo.id), meals: null } } }
    expect(isCareState(broken)).toBe(false)
  })

  it('recusa estado com paciente ativo de tipo inválido', () => {
    expect(isCareState({ ...createSeedState(), activePatientId: '312' })).toBe(false)
    expect(isCareState({ ...createSeedState(), activePatientId: null })).toBe(false)
  })

  it('recusa valores que não são estado', () => {
    expect(isCareState(null)).toBe(false)
    expect(isCareState('texto')).toBe(false)
    expect(isCareState(42)).toBe(false)
  })

  it('repara paciente ativo que não existe mais', () => {
    const state = createSeedState()
    const broken = { ...state, activePatientId: 99999 }
    const repaired = repairState(broken)
    expect(repaired).not.toBeNull()
    expect(repaired!.activePatientId).toBe(patientAt(state, 0).id)
  })
})

describe('persistência', () => {
  it('grava no storage ao trocar o paciente ativo', () => {
    const storage = fakeStorage()
    const store = createCareStore(storage)
    const alvo = patientAt(store.getState(), 3).id
    store.setActivePatient(alvo)
    expect(store.getState().activePatientId).toBe(alvo)
    const persisted = storage.data[STORAGE_KEY]
    expect(persisted).toBeDefined()
    expect(JSON.parse(persisted as string).activePatientId).toBe(alvo)
  })

  it('relê o estado gravado em uma nova instância', () => {
    const storage = fakeStorage()
    const first = createCareStore(storage)
    const alvo = patientAt(first.getState(), 5).id
    first.setActivePatient(alvo)
    const second = createCareStore(storage)
    expect(second.getState().activePatientId).toBe(alvo)
  })

  it('ignora paciente ativo inexistente', () => {
    const store = createCareStore(fakeStorage())
    const before = store.getState().activePatientId
    store.setActivePatient(99999)
    expect(store.getState().activePatientId).toBe(before)
  })

  it('ignora json corrompido e parte do seed', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: '{nao é json' })
    const store = createCareStore(storage)
    expect(store.getState().patients).toHaveLength(patients.length)
  })

  it('ignora estado guardado com formato antigo', () => {
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify({ patients: [{ id: 1 }] }) })
    expect(readStoredState(storage)).toBeNull()
    expect(createCareStore(storage).getState().patients).toHaveLength(patients.length)
  })

  it('funciona sem storage disponível', () => {
    const store = createCareStore(null)
    expect(store.storageAvailable).toBe(false)
    const alvo = patientAt(store.getState(), 1).id
    store.setActivePatient(alvo)
    expect(store.getState().activePatientId).toBe(alvo)
  })

  it('sobrescreve o storage quando a cota lança erro', () => {
    const base = fakeStorage()
    let falhou = false
    const storage: StorageLike = {
      getItem: base.getItem,
      removeItem: base.removeItem,
      setItem: (key, value) => {
        if (!falhou) {
          falhou = true
          throw new Error('cota excedida')
        }
        base.setItem(key, value)
      },
    }
    const store = createCareStore(storage)
    expect(() => store.setActivePatient(patientAt(store.getState(), 2).id)).not.toThrow()
    expect(store.getState().activePatientId).toBe(patientAt(store.getState(), 2).id)
  })
})

describe('reset dos dados de demonstração', () => {
  it('volta ao seed e limpa o storage', () => {
    const storage = fakeStorage()
    const store = createCareStore(storage)
    const original = store.getState()
    store.setActivePatient(patientAt(original, 7).id)
    store.updateState((state) => ({
      ...state,
      patients: state.patients.map((patient) =>
        patient.id === patientAt(original, 0).id ? { ...patient, name: 'Nome Alterado' } : patient,
      ) as PatientList,
    }))
    expect(patientAt(store.getState(), 0).name).toBe('Nome Alterado')

    store.resetDemoData()

    expect(patientAt(store.getState(), 0).name).toBe(patientAt(original, 0).name)
    expect(store.getState().activePatientId).toBe(original.activePatientId)
    expect(storage.data[STORAGE_KEY]).toBeDefined()
    expect(createCareStore(storage).getState().patients[0].name).toBe(patientAt(original, 0).name)
  })
})

describe('assinaturas', () => {
  it('notifica e cancela assinaturas', () => {
    const store = createCareStore(fakeStorage())
    let chamadas = 0
    const cancelar = store.subscribe(() => {
      chamadas += 1
    })
    const alvo = patientAt(store.getState(), 1).id
    store.setActivePatient(alvo)
    expect(chamadas).toBe(1)
    store.setActivePatient(alvo)
    expect(chamadas).toBe(1)
    cancelar()
    store.setActivePatient(patientAt(store.getState(), 2).id)
    expect(chamadas).toBe(1)
  })

  it('mantém a mesma referência enquanto nada muda', () => {
    const store = createCareStore(fakeStorage())
    const antes = store.getState()
    expect(store.getState()).toBe(antes)
    store.setActivePatient(patientAt(store.getState(), 1).id)
    expect(store.getState()).not.toBe(antes)
  })

  it('preserva os demais pacientes ao editar um', () => {
    const store = createCareStore(fakeStorage())
    const seed = createSeedState()
    store.updateState((state) => ({
      ...state,
      patients: state.patients.map((patient, index) =>
        index === 0 ? { ...patient, name: 'Editado' } : patient,
      ) as PatientList,
    }))
    const depois: CareState = store.getState()
    expect(patientAt(depois, 0).name).toBe('Editado')
    expect(depois.patients.slice(1).map((patient) => patient.name)).toEqual(
      seed.patients.slice(1).map((patient) => patient.name),
    )
    expect(depois.patients.slice(1).map((patient) => patient.vitals)).toEqual(
      seed.patients.slice(1).map((patient) => patient.vitals),
    )
  })
})

describe('migração de estados gravados antes da fase 4a-2', () => {
  function legacyState(): CareState {
    const state = createSeedState()
    const record = recordOf(state, patientAt(state, 0).id)
    delete (record as unknown as Record<string, unknown>).evolutions
    delete (record as unknown as Record<string, unknown>).prescriptions
    delete (record as unknown as Record<string, unknown>).examRequests
    delete (record as unknown as Record<string, unknown>).assessments
    delete (record as unknown as Record<string, unknown>).carePlans
    return state
  }

  it('preenche as coleções novas em vez de descartar o estado', () => {
    const seed = createSeedState()
    const legacy = legacyState()
    const repaired = repairState(JSON.parse(JSON.stringify(legacy)))
    expect(repaired).not.toBeNull()
    const record = recordOf(repaired!, patientAt(seed, 0).id)
    expect(record.evolutions.length).toBeGreaterThan(0)
    expect(record.prescriptions.length).toBeGreaterThan(0)
    expect(record.examRequests.length).toBeGreaterThan(0)
    expect(record.carePlans.nutricional.length).toBeGreaterThan(0)
  })

  it('preserva o que o usuário já havia gravado', () => {
    const seed = createSeedState()
    const legacy = legacyState()
        recordOf(legacy, patientAt(seed, 0).id).careItems = [{ title: 'Curativo meu', time: '15:00', state: 'Pendente' }]
    recordOf(legacy, patientAt(seed, 0).id).patientMedications = [
      { id: 'rx-9', time: '09:00', name: 'Meu remédio', dose: '5 mg · oral', taken: true },
    ]
    const repaired = repairState(JSON.parse(JSON.stringify(legacy)))!
    const record = recordOf(repaired, patientAt(seed, 0).id)
    expect(record.careItems).toEqual([{ title: 'Curativo meu', time: '15:00', state: 'Pendente' }])
    expect(record.patientMedications).toEqual([
      { id: 'rx-9', time: '09:00', name: 'Meu remédio', dose: '5 mg · oral', taken: true },
    ])
  })

  it('mantém um plano de cuidado já personalizado em vez de voltar ao seed', () => {
    const seed = createSeedState()
    const legacy = legacyState()
        const partial = recordOf(legacy, patientAt(seed, 0).id) as unknown as { carePlans: Record<string, string> }
    partial.carePlans = { nutricional: 'Dieta pastosa', fisioterapia: '', psicologia: '' }
    const repaired = repairState(JSON.parse(JSON.stringify(legacy)))!
    const record = recordOf(repaired, patientAt(seed, 0).id)
    expect(record.carePlans.nutricional).toBe('Dieta pastosa')
    expect(record.carePlans.fisioterapia).not.toBe('')
    expect(record.carePlans.psicologia).not.toBe('')
  })

  it('o store carrega o estado antigo migrado em vez do seed', () => {
    const seed = createSeedState()
    const legacy = legacyState()
        recordOf(legacy, patientAt(seed, 0).id).careItems = [{ title: 'Curativo meu', time: '15:00', state: 'Pendente' }]
    const storage = fakeStorage({ [STORAGE_KEY]: JSON.stringify(legacy) })
    const store = createCareStore(storage)
    const record = recordOf(store.getState(), patientAt(seed, 0).id)
    expect(at(record.careItems, 0).title).toBe('Curativo meu')
    expect(record.evolutions.length).toBeGreaterThan(0)
  })
})

describe('evoluções citam a saturação do próprio paciente', () => {
  it('usa o SpO₂ da última leitura de cada paciente', () => {
    const state = createSeedState()
    for (const patient of state.patients) {
      const spo2 = String(latestVitals(patient).spo2)
      const respiratorio = recordOf(state, patient.id).evolutions.find(
        (entry) => entry.id === 'evo-med-1042',
      )
      expect(respiratorio?.note).toContain(`SpO₂ ${spo2}%`)
      const enfermagem = recordOf(state, patient.id).evolutions.find((entry) => entry.id === 'evo-nur-1042')
      expect(enfermagem?.note).toContain(`SpO₂ ${spo2}%`)
    }
  })

  it('troca a saturação cited quando o valor muda', () => {
    expect(at(createEvolutions(91), 0).note).toContain('SpO₂ 91%')
    expect(at(createEvolutions(97), 0).note).toContain('SpO₂ 97%')
    expect(at(createEvolutions(91), 0).note).not.toContain('97%')
  })

  it('não deixa as evoluções do seed compartilharem o mesmo objeto', () => {
    const state = createSeedState()
    const primeiro = patientAt(state, 0)
    const segundo = patientAt(state, 1)
    recordOf(state, primeiro.id).evolutions.push({
      id: 'x',
      time: '10:00',
      timeLabel: '10:00 · Hoje',
      title: 'Local',
      note: 'Local',
      author: 'x',
      authorRole: 'x',
      area: 'Médico',
    })
    expect(recordOf(state, segundo.id).evolutions.some((entry) => entry.id === 'x')).toBe(false)
  })
})
