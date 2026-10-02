import { describe, expect, it } from 'vitest'
import { createCareStore, type StorageLike } from './careStore'
import { createCareActions, nowTime } from './actions'
import { classifyBloodPressure, classifyHeartRate, classifyReading, classifyRespiratoryRate, classifySpo2, classifyTemperature, draftFromReading, emptyVitalsDraft, validateVitalsDraft, worstStatus } from './vitals'
import { at, patientAt, recordOf } from './testHelpers'

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

const leitura = { bloodPressure: '120/80', heartRate: 78, respiratoryRate: 18, temperature: '36,8', spo2: 97 }

describe('classificação dos sinais vitais', () => {
  it('classifica a saturação de oxigênio', () => {
    expect(classifySpo2(98).level).toBe('normal')
    expect(classifySpo2(93).level).toBe('watch')
    expect(classifySpo2(85).level).toBe('alert')
  })

  it('classifica a frequência cardíaca', () => {
    expect(classifyHeartRate(78).level).toBe('normal')
    expect(classifyHeartRate(104).level).toBe('watch')
    expect(classifyHeartRate(130).level).toBe('alert')
    expect(classifyHeartRate(42).level).toBe('alert')
  })

  it('classifica a frequência respiratória', () => {
    expect(classifyRespiratoryRate(18).level).toBe('normal')
    expect(classifyRespiratoryRate(24).level).toBe('watch')
    expect(classifyRespiratoryRate(32).level).toBe('alert')
  })

  it('classifica a temperatura', () => {
    expect(classifyTemperature('36,8').level).toBe('normal')
    expect(classifyTemperature('37,5').level).toBe('watch')
    expect(classifyTemperature('39,2').level).toBe('alert')
  })

  it('classifica a pressão arterial', () => {
    expect(classifyBloodPressure('120/80').level).toBe('normal')
    expect(classifyBloodPressure('156/94').level).toBe('watch')
    expect(classifyBloodPressure('190/125').level).toBe('alert')
    expect(classifyBloodPressure('80/50').level).toBe('alert')
    expect(classifyBloodPressure('invalido').level).toBe('alert')
  })

  it('resume a leitura pelo pior indicador', () => {
    expect(worstStatus([classifySpo2(98), classifySpo2(93)]).level).toBe('watch')
    expect(worstStatus([classifySpo2(98), classifySpo2(85)]).level).toBe('alert')
    expect(worstStatus([classifySpo2(98), classifyHeartRate(78)]).level).toBe('normal')
  })

  it('classifica a leitura inteira', () => {
    expect(classifyReading(leitura).level).toBe('normal')
    expect(classifyReading({ ...leitura, spo2: 84 }).level).toBe('alert')
  })
})

describe('validação do formulário de sinais vitais', () => {
  const valido = { systolic: '120', diastolic: '80', heartRate: '78', respiratoryRate: '18', temperature: '36,8', spo2: '97' }

  it('aceita um formulário completo e plausível', () => {
    const result = validateVitalsDraft(valido)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.reading).toEqual(leitura)
    }
  })

  it('recusa campo vazio', () => {
    const result = validateVitalsDraft({ ...emptyVitalsDraft })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual(['diastolic', 'heartRate', 'respiratoryRate', 'spo2', 'systolic', 'temperature'])
    }
  })

  it('recusa sistólica menor ou igual à diastólica', () => {
    const result = validateVitalsDraft({ ...valido, systolic: '70', diastolic: '80' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.diastolic).toBeTruthy()
  })

  it('recusa saturação acima de 100', () => {
    const result = validateVitalsDraft({ ...valido, spo2: '120' })
    expect(result.ok).toBe(false)
  })

  it('recusa texto no lugar de número', () => {
    const result = validateVitalsDraft({ ...valido, heartRate: 'abc' })
    expect(result.ok).toBe(false)
  })

  it('recusa temperatura fora da faixa', () => {
    expect(validateVitalsDraft({ ...valido, temperature: '50' }).ok).toBe(false)
  })

  it('aceita ponto decimal e normaliza para vírgula', () => {
    const result = validateVitalsDraft({ ...valido, temperature: '36.8' })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.reading.temperature).toBe('36,8')
  })

  it('preenche o formulário a partir de uma leitura', () => {
    expect(draftFromReading(leitura)).toEqual(valido)
  })
})

describe('ações de escrita', () => {
  it('registra um sinal vital e passa a ser o mais recente', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    const antes = alvo.vitals.length
    actions.recordVitals(alvo.id, { ...leitura, spo2: 91 }, 'Ana Beatriz Ferreira', '11:05')
    const depois = store.getState().patients.find((patient) => patient.id === alvo.id)!
    expect(depois.vitals).toHaveLength(antes + 1)
    const ultima = at(depois.vitals, depois.vitals.length - 1)
    expect(ultima.spo2).toBe(91)
    expect(ultima.recordedAt).toBe('11:05')
    expect(ultima.recordedBy).toBe('Ana Beatriz Ferreira')
  })

  it('não altera os outros pacientes', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    const outro = patientAt(store.getState(), 1)
    const antes = JSON.stringify(outro.vitals)
    actions.recordVitals(alvo.id, leitura, 'Ana Beatriz Ferreira', '11:05')
    const depois = store.getState().patients.find((patient) => patient.id === outro.id)!
    expect(JSON.stringify(depois.vitals)).toBe(antes)
  })

  it('ignora registro para paciente inexistente', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const antes = JSON.stringify(store.getState())
    actions.recordVitals(99999, leitura, 'Ana Beatriz Ferreira', '11:05')
    expect(JSON.stringify(store.getState())).toBe(antes)
  })

  it('marca e desmarca medicação como tomada', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    actions.setMedicationTaken(alvo.id, 'dipirona', true)
    const meds = recordOf(store.getState(), alvo.id).patientMedications
    expect(meds.find((med) => med.id === 'dipirona')?.taken).toBe(true)
    actions.setMedicationTaken(alvo.id, 'dipirona', false)
    const meds2 = recordOf(store.getState(), alvo.id).patientMedications
    expect(meds2.find((med) => med.id === 'dipirona')?.taken).toBe(false)
  })

  it('preserva o estado inicial da omeprazol no seed', () => {
    const store = createCareStore(fakeStorage())
    const alvo = patientAt(store.getState(), 0)
    expect(recordOf(store.getState(), alvo.id).patientMedications.find((med) => med.id === 'omeprazol')?.taken).toBe(true)
  })

  it('altera o estado de um cuidado', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    const item = at(recordOf(store.getState(), alvo.id).careItems, 0)
    actions.setCareItemState(alvo.id, item.title, 'Realizado')
    const depois = recordOf(store.getState(), alvo.id).careItems
    expect(depois.find((care) => care.title === item.title)?.state).toBe('Realizado')
  })

  it('adiciona um novo cuidado', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    const antes = recordOf(store.getState(), alvo.id).careItems.length
    actions.appendCareItem(alvo.id, { title: 'Curativo novo', time: '15:00', state: 'Pendente' })
    const depois = recordOf(store.getState(), alvo.id).careItems
    expect(depois).toHaveLength(antes + 1)
    expect(at(depois, depois.length - 1).title).toBe('Curativo novo')
  })

  it('não deixa a escrita vazar para outra instância', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    const antes = recordOf(store.getState(), alvo.id).careItems.length
    actions.appendCareItem(alvo.id, { title: 'Temporário', time: '16:00', state: 'Pendente' })
    const outro = createCareStore(fakeStorage()).getState()
    expect(recordOf(outro, alvo.id).careItems).toHaveLength(antes)
  })

  it('atualiza o status do paciente', () => {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const alvo = patientAt(store.getState(), 0)
    actions.updatePatientStatus(alvo.id, 'Prioridade')
    expect(store.getState().patients.find((patient) => patient.id === alvo.id)?.status).toBe('Prioridade')
  })

  it('gera um horário no formato HH:mm', () => {
    expect(nowTime()).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)
  })
})

describe('registros clínicos gravados', () => {
  function setup() {
    const store = createCareStore(fakeStorage())
    const actions = createCareActions(store)
    const patient = patientAt(store.getState(), 0)
    return { store, actions, patient, clinical: () => recordOf(store.getState(), patient.id) }
  }

  it('soma uma evolução no topo da linha do tempo', () => {
    const { actions, patient, clinical } = setup()
    const antes = clinical().evolutions.length
    actions.addEvolution(patient.id, { title: 'Nova evolução', note: 'Paciente estável', area: 'Médico', author: 'Dr. Carlos Mendes', authorRole: 'Médico' }, '14:05')
    const evolutions = clinical().evolutions
    expect(evolutions).toHaveLength(antes + 1)
    expect(at(evolutions, 0).title).toBe('Nova evolução')
    expect(at(evolutions, 0).timeLabel).toBe('14:05 · Hoje')
    expect(at(evolutions, 0).area).toBe('Médico')
  })

  it('não mistura evoluções de áreas diferentes', () => {
    const { actions, patient, clinical } = setup()
    actions.addEvolution(patient.id, { title: 'Sessão', note: 'Sem intercorrências', area: 'Fisioterapia', author: 'Juliana Martins', authorRole: 'Fisioterapeuta' }, '15:00')
    const evolutions = clinical().evolutions
    expect(at(evolutions, 0).area).toBe('Fisioterapia')
    expect(evolutions.filter((entry) => entry.area === 'Médico')).not.toContain(evolutions[0])
  })

  it('prescrever medicamento também cria a medicação para o paciente', () => {
    const { actions, patient, clinical } = setup()
    const antesMeds = clinical().patientMedications.length
    const antesRx = clinical().prescriptions.length
    actions.addPrescription(patient.id, { drug: 'Azitromicina', dose: '500 mg', route: 'Via oral', frequency: '1x ao dia', author: 'Dr. Carlos Mendes' }, '11:00')
    const record = clinical()
    expect(record.prescriptions).toHaveLength(antesRx + 1)
    expect(at(record.prescriptions, 0).status).toBe('Ativa')
    expect(record.patientMedications).toHaveLength(antesMeds + 1)
    expect(record.patientMedications.at(-1)?.name).toBe('Azitromicina')
    expect(record.patientMedications.at(-1)?.taken).toBeUndefined()
  })

  it('suspende uma prescrição sem tocar nas demais', () => {
    const { actions, patient, clinical } = setup()
    const alvo = at(clinical().prescriptions, 0)
    actions.setPrescriptionStatus(patient.id, alvo.id, 'Suspensa')
    const alterada = clinical().prescriptions.find((item) => item.id === alvo.id)
    expect(alterada?.status).toBe('Suspensa')
    expect(clinical().prescriptions.filter((item) => item.status === 'Ativa')).toHaveLength(clinical().prescriptions.length - 1)
  })

  it('registra solicitação de exame como pendente', () => {
    const { actions, patient, clinical } = setup()
    const antes = clinical().examRequests.length
    actions.requestExam(patient.id, { exam: 'Tomografia de tórax', detail: 'Hipótese de consolidação', urgency: 'Urgente', requestedBy: 'Dr. Carlos Mendes' }, '13:20')
    const requests = clinical().examRequests
    expect(requests).toHaveLength(antes + 1)
    expect(at(requests, 0).exam).toBe('Tomografia de tórax')
    expect(at(requests, 0).urgency).toBe('Urgente')
    expect(at(requests, 0).status).toBe('Solicitado')
  })

  it('guarda a avaliação na área correspondente', () => {
    const { actions, patient, clinical } = setup()
    const antesNutricao = clinical().assessments.Nutrição.length
    const antesFisio = clinical().assessments.Fisioterapia.length
    actions.addAssessment(patient.id, { title: 'Nova avaliação', score: '80%', detail: 'Aceitação melhorada', area: 'Nutrição', author: 'Carla Mendes' }, '12:00')
    expect(clinical().assessments.Nutrição).toHaveLength(antesNutricao + 1)
    expect(at(clinical().assessments.Nutrição, 0).score).toBe('80%')
    expect(clinical().assessments.Fisioterapia).toHaveLength(antesFisio)
  })

  it('atualiza o plano de cuidado da área', () => {
    const { actions, patient, clinical } = setup()
    actions.setCarePlan(patient.id, 'nutricional', 'Dieta pastosa hipossódica')
    expect(clinical().carePlans.nutricional).toBe('Dieta pastosa hipossódica')
    expect(clinical().carePlans.fisioterapia).not.toBe('Dieta pastosa hipossódica')
  })

  it('cadastra um paciente e o torna o ativo', () => {
    const { store, actions, patient, clinical } = setup()
    const antes = store.getState().patients.length
    actions.registerPatient({ ...patient, id: 9999, name: 'Novo Paciente' }, clinical())
    const state = store.getState()
    expect(state.patients).toHaveLength(antes + 1)
    expect(state.patients.some((item) => item.id === 9999)).toBe(true)
    expect(state.activePatientId).toBe(9999)
    expect(recordOf(state, 9999).evolutions.length).toBe(clinical().evolutions.length)
  })

  it('ignora cadastro com id já existente', () => {
    const { store, actions, patient, clinical } = setup()
    const antes = store.getState().patients.length
    actions.registerPatient(patient, clinical())
    expect(store.getState().patients).toHaveLength(antes)
  })

  it('ignora escrita para paciente inexistente', () => {
    const { store, actions } = setup()
    const antes = JSON.stringify(store.getState())
    actions.addEvolution(9999, { title: 'Fantasma', note: 'x', area: 'Médico', author: 'y', authorRole: 'Médico' })
    actions.addPrescription(9999, { drug: 'x', dose: '1', route: 'oral', frequency: '1x', author: 'y' })
    actions.requestExam(9999, { exam: 'x', detail: '', urgency: 'Rotina', requestedBy: 'y' })
    actions.addAssessment(9999, { title: 'x', score: '1', detail: '', area: 'Médico', author: 'y' })
    actions.setCarePlan(9999, 'nutricional', 'x')
    expect(JSON.stringify(store.getState())).toBe(antes)
  })
})
