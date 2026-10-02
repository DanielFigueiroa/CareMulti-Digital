export type PatientStatus = 'Estável' | 'Acompanhamento' | 'Atenção' | 'Prioridade'

export type CareArea = 'nurse' | 'doctor' | 'nutrition' | 'physiotherapy' | 'psychology'

export type PatientVitals = {
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  temperature: string
  spo2: number
}

export type VitalsReading = PatientVitals & {
  recordedAt: string
  recordedBy: string
}

/**
 * Série de leituras de um paciente. O primeiro elemento é obrigatório: todo
 * paciente inadmissível tem pelo menos uma leitura, e essa garantia é o que
 * permite `latestVitals` devolver um valor sem `undefined`.
 */
export type VitalsSeries = [VitalsReading, ...VitalsReading[]]

const nurseOnShift = 'Ana Beatriz Ferreira'
const technicianOnShift = 'Marcos Vinícius Alves'

export type Patient = {
  id: number
  name: string
  age: number
  bed: string
  admittedAt: string
  diagnosis: string
  comorbidities: string
  allergies: string
  focus: string
  status: PatientStatus
  vitals: VitalsSeries
}

/**
 * Lista de pacientes sempre com pelo menos um elemento. Modelar isso no tipo
 * evita que `patients[0]` seja `Patient | undefined` em toda a aplicação.
 */
export type PatientList = [Patient, ...Patient[]]

export const patients: PatientList = [
  {
    id: 312,
    name: 'Maria Silva Santos',
    age: 72,
    bed: 'Leito 312',
    admittedAt: '10/09/2025',
    diagnosis: 'Pneumonia',
    comorbidities: 'HAS, DM2',
    allergies: 'Nenhuma registrada',
    focus: 'Acompanhamento emocional',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '118/78', heartRate: 76, respiratoryRate: 17, temperature: '37,2', spo2: 95 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '119/79', heartRate: 77, respiratoryRate: 18, temperature: '37,0', spo2: 94 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '120/79', heartRate: 78, respiratoryRate: 18, temperature: '36,9', spo2: 94 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '120/80', heartRate: 78, respiratoryRate: 18, temperature: '36,8', spo2: 93 },
    ],
  },
  {
    id: 315,
    name: 'João Santos',
    age: 64,
    bed: 'Leito 315',
    admittedAt: '08/09/2025',
    diagnosis: 'Pós-operatório',
    comorbidities: 'Negadas',
    allergies: 'Nenhuma registrada',
    focus: 'Acolhimento inicial',
    status: 'Atenção',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '120/82', heartRate: 85, respiratoryRate: 19, temperature: '37,4', spo2: 93 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '126/83', heartRate: 86, respiratoryRate: 20, temperature: '37,3', spo2: 94 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '130/84', heartRate: 87, respiratoryRate: 20, temperature: '37,2', spo2: 95 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '132/84', heartRate: 88, respiratoryRate: 20, temperature: '37,2', spo2: 95 },
    ],
  },
  {
    id: 320,
    name: 'Ana Oliveira',
    age: 58,
    bed: 'Leito 320',
    admittedAt: '05/09/2025',
    diagnosis: 'DM2 · HAS',
    comorbidities: 'Obesidade',
    allergies: 'Nenhuma registrada',
    focus: 'Orientação alimentar',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '126/80', heartRate: 76, respiratoryRate: 18, temperature: '36,8', spo2: 95 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '127/81', heartRate: 75, respiratoryRate: 17, temperature: '36,7', spo2: 96 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '128/82', heartRate: 74, respiratoryRate: 17, temperature: '36,6', spo2: 97 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '128/82', heartRate: 74, respiratoryRate: 17, temperature: '36,5', spo2: 97 },
    ],
  },
  {
    id: 327,
    name: 'Carlos Lima',
    age: 81,
    bed: 'Leito 327',
    admittedAt: '02/09/2025',
    diagnosis: 'Insuficiência cardíaca',
    comorbidities: 'HAS, DPOC',
    allergies: 'Dipirona',
    focus: 'Suporte emocional',
    status: 'Prioridade',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '142/88', heartRate: 92, respiratoryRate: 22, temperature: '37,0', spo2: 94 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '144/90', heartRate: 94, respiratoryRate: 23, temperature: '36,9', spo2: 93 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '145/91', heartRate: 95, respiratoryRate: 24, temperature: '36,9', spo2: 92 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '146/92', heartRate: 96, respiratoryRate: 24, temperature: '36,9', spo2: 91 },
    ],
  },
  {
    id: 301,
    name: 'Paulo Henrique Rocha',
    age: 55,
    bed: 'Leito 301',
    admittedAt: '01/09/2025',
    diagnosis: 'Doença renal crônica',
    comorbidities: 'HAS, hipercalemia',
    allergies: 'Contraste iodado',
    focus: 'Autonomia no autocuidado',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '136/84', heartRate: 74, respiratoryRate: 17, temperature: '36,8', spo2: 94 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '137/85', heartRate: 73, respiratoryRate: 16, temperature: '36,7', spo2: 95 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '138/86', heartRate: 72, respiratoryRate: 16, temperature: '36,6', spo2: 96 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '138/86', heartRate: 72, respiratoryRate: 16, temperature: '36,6', spo2: 96 },
    ],
  },
  {
    id: 305,
    name: 'Rosa Fernandes Lima',
    age: 79,
    bed: 'Leito 305',
    admittedAt: '28/08/2025',
    diagnosis: 'AVC isquêmico recente',
    comorbidities: 'HAS, DM2, disfagia',
    allergies: 'Penicilina',
    focus: 'Reeducação da deglutição',
    status: 'Atenção',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '162/98', heartRate: 88, respiratoryRate: 21, temperature: '37,3', spo2: 92 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '159/96', heartRate: 86, respiratoryRate: 20, temperature: '37,1', spo2: 93 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '157/95', heartRate: 85, respiratoryRate: 19, temperature: '37,0', spo2: 94 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '156/94', heartRate: 84, respiratoryRate: 19, temperature: '37,0', spo2: 94 },
    ],
  },
  {
    id: 308,
    name: 'Luiz Fernando Dias',
    age: 47,
    bed: 'Leito 308',
    admittedAt: '04/09/2025',
    diagnosis: 'Lesão por esforço repetitivo',
    comorbidities: 'Negadas',
    allergies: 'Nenhuma registrada',
    focus: 'Retorno gradual à atividade',
    status: 'Estável',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '120/78', heartRate: 72, respiratoryRate: 16, temperature: '36,6', spo2: 97 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '119/77', heartRate: 71, respiratoryRate: 15, temperature: '36,5', spo2: 98 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '118/76', heartRate: 70, respiratoryRate: 15, temperature: '36,4', spo2: 98 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '118/76', heartRate: 70, respiratoryRate: 15, temperature: '36,4', spo2: 98 },
    ],
  },
  {
    id: 310,
    name: 'Beatriz Nogueira',
    age: 33,
    bed: 'Leito 310',
    admittedAt: '09/09/2025',
    diagnosis: 'Gestação de alto risco',
    comorbidities: 'Negadas',
    allergies: 'Nenhuma registrada',
    focus: 'Acolhimento e vínculo com a equipe',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '112/70', heartRate: 86, respiratoryRate: 19, temperature: '36,8', spo2: 97 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '113/71', heartRate: 84, respiratoryRate: 18, temperature: '36,7', spo2: 98 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '114/72', heartRate: 83, respiratoryRate: 18, temperature: '36,7', spo2: 98 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '114/72', heartRate: 82, respiratoryRate: 18, temperature: '36,7', spo2: 98 },
    ],
  },
  {
    id: 318,
    name: 'Sônia Aparecida Reis',
    age: 68,
    bed: 'Leito 318',
    admittedAt: '06/09/2025',
    diagnosis: 'DPOC',
    comorbidities: 'HAS, insuficiência cardíaca',
    allergies: 'Nenhuma registrada',
    focus: 'Reeducação respiratória',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '128/78', heartRate: 78, respiratoryRate: 20, temperature: '36,9', spo2: 95 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '129/79', heartRate: 79, respiratoryRate: 21, temperature: '36,8', spo2: 94 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '130/80', heartRate: 80, respiratoryRate: 22, temperature: '36,8', spo2: 93 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '130/80', heartRate: 80, respiratoryRate: 22, temperature: '36,8', spo2: 92 },
    ],
  },
  {
    id: 322,
    name: 'Gustavo Henrique Sá',
    age: 52,
    bed: 'Leito 322',
    admittedAt: '11/09/2025',
    diagnosis: 'Pancreatite aguda',
    comorbidities: 'Alcoolismo, HAS',
    allergies: 'Nenhuma registrada',
    focus: 'Manejo da dor e abstinência',
    status: 'Atenção',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '118/76', heartRate: 112, respiratoryRate: 24, temperature: '37,6', spo2: 93 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '115/73', heartRate: 109, respiratoryRate: 23, temperature: '37,5', spo2: 94 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '113/71', heartRate: 106, respiratoryRate: 22, temperature: '37,4', spo2: 95 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '112/70', heartRate: 104, respiratoryRate: 22, temperature: '37,4', spo2: 95 },
    ],
  },
  {
    id: 324,
    name: 'Márcia Tavares Luz',
    age: 61,
    bed: 'Leito 324',
    admittedAt: '07/09/2025',
    diagnosis: 'Pós-mastectomia',
    comorbidities: 'HAS, linfedema',
    allergies: 'Nenhuma registrada',
    focus: 'Adaptação e apoio emocional',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '124/78', heartRate: 78, respiratoryRate: 17, temperature: '36,8', spo2: 96 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '125/79', heartRate: 77, respiratoryRate: 17, temperature: '36,7', spo2: 97 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '126/80', heartRate: 76, respiratoryRate: 16, temperature: '36,6', spo2: 97 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '126/80', heartRate: 76, respiratoryRate: 16, temperature: '36,6', spo2: 97 },
    ],
  },
  {
    id: 330,
    name: 'Raimundo Alves Pinto',
    age: 74,
    bed: 'Leito 330',
    admittedAt: '03/09/2025',
    diagnosis: 'Fratura de fêmur',
    comorbidities: 'HAS, osteoporose',
    allergies: 'Nenhuma registrada',
    focus: 'Mobilização e prevenção de quedas',
    status: 'Acompanhamento',
    vitals: [
      { recordedAt: '08:00', recordedBy: nurseOnShift, bloodPressure: '132/80', heartRate: 80, respiratoryRate: 18, temperature: '36,9', spo2: 95 },
      { recordedAt: '09:00', recordedBy: nurseOnShift, bloodPressure: '133/81', heartRate: 79, respiratoryRate: 17, temperature: '36,8', spo2: 96 },
      { recordedAt: '10:00', recordedBy: technicianOnShift, bloodPressure: '134/82', heartRate: 78, respiratoryRate: 17, temperature: '36,7', spo2: 96 },
      { recordedAt: '10:42', recordedBy: nurseOnShift, bloodPressure: '134/82', heartRate: 78, respiratoryRate: 17, temperature: '36,7', spo2: 96 },
    ],
  },
]

export const defaultPatientId = 312

const areaStatusLabels: Record<CareArea, Record<PatientStatus, string>> = {
  nurse: { Estável: 'Estável', Acompanhamento: 'Estável', Atenção: 'Atenção', Prioridade: 'Prioridade' },
  doctor: { Estável: 'Acompanhamento', Acompanhamento: 'Acompanhamento', Atenção: 'Atenção', Prioridade: 'Prioridade' },
  nutrition: { Estável: 'Acompanhamento', Acompanhamento: 'Acompanhamento', Atenção: 'Atenção', Prioridade: 'Atenção' },
  physiotherapy: { Estável: 'Acompanhamento', Acompanhamento: 'Acompanhamento', Atenção: 'Atenção', Prioridade: 'Atenção' },
  psychology: { Estável: 'Acompanhamento', Acompanhamento: 'Acompanhamento', Atenção: 'Atenção', Prioridade: 'Atenção' },
}

export function statusLabel(patient: Patient, area: CareArea): string {
  return areaStatusLabels[area][patient.status]
}

export function needsAttention(status: PatientStatus): boolean {
  return status === 'Atenção' || status === 'Prioridade'
}

export function findPatient(patientId: number): Patient {
  return patients.find((patient) => patient.id === patientId) ?? patients[0]
}

/**
 * `VitalsSeries` garante ao menos uma leitura, então o resultado nunca é
 * `undefined`. O `?? patients[0]` cobre apenas o lado da lista.
 */
export function latestVitals(patient: Patient): VitalsReading {
  return patient.vitals[patient.vitals.length - 1] ?? patient.vitals[0]
}

export function vitalsTrend(patient: Patient): VitalsSeries {
  return patient.vitals
}

export type PatientCounts = {
  total: number
  attention: number
  stable: number
}

export function countPatients(list: readonly Patient[] = patients): PatientCounts {
  const attention = list.filter((patient) => needsAttention(patient.status)).length
  return {
    total: list.length,
    attention,
    stable: list.length - attention,
  }
}

export function matchesPatientSearch(patient: Patient, term: string): boolean {
  const haystack = `${patient.name} ${patient.bed} ${patient.diagnosis} ${patient.focus}`.toLowerCase()
  return haystack.includes(term.trim().toLowerCase())
}
