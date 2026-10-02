import { describe, expect, it } from 'vitest'
import {
  countPatients,
  defaultPatientId,
  findPatient,
  latestVitals,
  matchesPatientSearch,
  needsAttention,
  patients,
  statusLabel,
  vitalsTrend,
  type CareArea,
  type PatientStatus,
} from './patients'

const allStatuses: PatientStatus[] = ['Estável', 'Acompanhamento', 'Atenção', 'Prioridade']
const allAreas: CareArea[] = ['nurse', 'doctor', 'nutrition', 'physiotherapy', 'psychology']

describe('integridade da lista de pacientes', () => {
  it('não repete id nem leito', () => {
    expect(new Set(patients.map((p) => p.id)).size).toBe(patients.length)
    expect(new Set(patients.map((p) => p.bed)).size).toBe(patients.length)
    expect(new Set(patients.map((p) => p.name)).size).toBe(patients.length)
  })

  it('mantém o leito alinhado com o id', () => {
    for (const patient of patients) {
      expect(patient.bed).toBe(`Leito ${patient.id}`)
    }
  })

  it('não usa a palavra "Negadas" no campo de alergias', () => {
    for (const patient of patients) {
      expect(patient.allergies.toLowerCase()).not.toContain('negada')
    }
  })

  it('mantém sinais vitais dentro de faixa plausível', () => {
    for (const patient of patients) {
      for (const reading of patient.vitals) {
        expect(reading.spo2).toBeGreaterThan(70)
        expect(reading.spo2).toBeLessThanOrEqual(100)
        expect(reading.heartRate).toBeGreaterThan(30)
        expect(reading.heartRate).toBeLessThan(200)
        expect(reading.respiratoryRate).toBeGreaterThan(5)
        expect(reading.respiratoryRate).toBeLessThan(40)
        expect(reading.bloodPressure).toMatch(/^\d{2,3}\/\d{2,3}$/)
        expect(reading.temperature).toMatch(/^\d{2},\d$/)
      }
    }
  })

  it('registra o histórico de sinais vitais em ordem cronológica', () => {
    for (const patient of patients) {
      expect(patient.vitals.length).toBeGreaterThan(1)
      const times = patient.vitals.map((reading) => reading.recordedAt)
      expect(times).toEqual([...times].sort())
      expect(new Set(times).size).toBe(times.length)
    }
  })

  it('identifica quem registrou cada leitura de sinais vitais', () => {
    for (const patient of patients) {
      for (const reading of patient.vitals) {
        expect(reading.recordedBy.trim()).not.toBe('')
      }
    }
  })

  it('devolve a leitura mais recente como sinais vitais atuais', () => {
    for (const patient of patients) {
      const latest = latestVitals(patient)
      expect(latest).toBe(patient.vitals[patient.vitals.length - 1])
      expect(vitalsTrend(patient)).toBe(patient.vitals)
    }
  })
})

describe('findPatient', () => {
  it('encontra um paciente existente', () => {
    expect(findPatient(327).name).toBe('Carlos Lima')
  })

  it('cai no primeiro paciente quando o id não existe', () => {
    expect(findPatient(9999)).toBe(patients[0])
  })

  it('o paciente padrão existe na lista', () => {
    expect(patients.some((patient) => patient.id === defaultPatientId)).toBe(true)
  })
})

describe('needsAttention', () => {
  it('marca apenas Atenção e Prioridade', () => {
    expect(needsAttention('Atenção')).toBe(true)
    expect(needsAttention('Prioridade')).toBe(true)
    expect(needsAttention('Estável')).toBe(false)
    expect(needsAttention('Acompanhamento')).toBe(false)
  })
})

describe('countPatients', () => {
  const counts = countPatients()

  it('total bate com o tamanho da lista', () => {
    expect(counts.total).toBe(patients.length)
  })

  it('atenção mais estáveis fecha com o total', () => {
    expect(counts.attention + counts.stable).toBe(counts.total)
  })

  it('conta só quem precisa de atenção', () => {
    const expected = patients.filter((p) => needsAttention(p.status)).length
    expect(counts.attention).toBe(expected)
  })

  it('aceita uma lista própria', () => {
    const onlyMaria = [findPatient(defaultPatientId)]
    const partial = countPatients(onlyMaria)
    expect(partial.total).toBe(1)
    expect(partial.attention + partial.stable).toBe(1)
  })
})

describe('statusLabel', () => {
  it('devolve um rótulo para toda combinação de área e status', () => {
    for (const area of allAreas) {
      for (const status of allStatuses) {
        const label = statusLabel({ status } as never, area)
        expect(label, `${area}/${status}`).toBeTruthy()
      }
    }
  })

  it('a enfermagem nunca esconde um paciente que exige atenção', () => {
    for (const status of allStatuses) {
      const label = statusLabel({ status } as never, 'nurse')
      if (needsAttention(status)) expect(label).not.toBe('Estável')
    }
  })
})

describe('matchesPatientSearch', () => {
  const maria = findPatient(defaultPatientId)

  it('busca vazia devolve todos', () => {
    expect(patients.filter((p) => matchesPatientSearch(p, '')).length).toBe(patients.length)
  })

  it('ignora maiúsculas e espaços em volta', () => {
    expect(matchesPatientSearch(maria, '  MARIA  ')).toBe(true)
  })

  it('encontra por nome, leito, diagnóstico e foco', () => {
    expect(matchesPatientSearch(maria, 'maria silva')).toBe(true)
    expect(matchesPatientSearch(maria, 'leito 312')).toBe(true)
    expect(matchesPatientSearch(maria, 'pneumonia')).toBe(true)
    expect(matchesPatientSearch(maria, 'emocional')).toBe(true)
  })

  it('não casa com termo inexistente', () => {
    expect(matchesPatientSearch(maria, 'zzzz')).toBe(false)
  })
})
