export type TeamMember = { name: string; role: string; initials: string }

export type CareItem = { title: string; time: string; state: 'Realizado' | 'Pendente' | 'Agendado' }

export type Medication = { name: string; dose: string; time: string; state: 'Próximo' | 'Agendado' }

export type Meal = { time: string; title: string; detail: string }

export type PendingItem = { title: string; detail: string }

export type NutritionPendingItem = PendingItem & { priority: 'Atenção' | 'Programado' }

export type TherapyGoal = { title: string; progress: string }

export type TherapyRow = { title: string; detail: string }

export type AssessmentMetric = { label: string; value: string }

export type ScheduleEntry = { time: string; title: string; detail: string }

export type CareAction = { title: string; detail: string; status: 'Programado' | 'Em andamento' | 'Contínuo' }

export type CareGoal = { title: string; state: 'Em acompanhamento' | 'Em andamento' | 'Contínuo' }

export type RoutineItem = { time: string; title: string; detail: string; state: 'Concluído' | 'Próximo' | 'Agendado' }

export type PatientMedication = { id: string; time: string; name: string; dose: string; taken?: boolean }

export type Professional = {
  name: string
  role: string
  unit: string
  state: 'Ativo' | 'Afastado'
}

export type Appointment = {
  time: string
  name: string
  detail: string
  status: 'Confirmado' | 'Aguardando'
}

export type WeeklyPoint = { day: string; value: number }

export type EvolutionArea = 'Médico' | 'Enfermagem' | 'Nutrição' | 'Fisioterapia' | 'Psicologia'

export type ClinicalEvolution = {
  id: string
  time: string
  timeLabel: string
  title: string
  note: string
  author: string
  authorRole: string
  area: EvolutionArea
}

export type Prescription = {
  id: string
  time: string
  drug: string
  dose: string
  route: string
  frequency: string
  author: string
  status: 'Ativa' | 'Suspensa'
}

export type ExamRequest = {
  id: string
  time: string
  exam: string
  detail: string
  urgency: 'Rotina' | 'Urgente'
  requestedBy: string
  status: 'Solicitado' | 'Aprovado' | 'Realizado'
}

export type CareAssessment = {
  id: string
  time: string
  title: string
  score: string
  detail: string
  author: string
  area: EvolutionArea
}

export type CarePlanArea = 'nutricional' | 'fisioterapia' | 'psicologia'

export const carePlanAreas: CarePlanArea[] = ['nutricional', 'fisioterapia', 'psicologia']

export const carePlanLabels: Record<CarePlanArea, string> = {
  nutricional: 'Plano alimentar',
  fisioterapia: 'Plano terapêutico',
  psicologia: 'Plano terapêutico',
}

export function createCarePlans(): Record<CarePlanArea, string> {
  return {
    nutricional:
      'Dieta branda hipossódica, 6 refeições/dia. Hidratação 2 L/dia. Monitorar aceitação alimentar a cada turno.',
    fisioterapia:
      'Exercícios respiratórios 2x/dia, mobilização ativa assistida e treino de transferência com 1 auxiliar.',
    psicologia:
      'Escuta ativa diária, intervenção relaxante antes do sono e alinhamento com a equipe assistencial.',
  }
}

export function createEvolutions(spo2: number): ClinicalEvolution[] {
  return [
    {
      id: 'evo-med-1042',
      time: '10:42',
      timeLabel: '10:42 · Hoje',
      title: 'Acompanhamento respiratório',
      note: `Paciente consciente e orientada. SpO₂ ${spo2}% em ar ambiente. Mantida observação clínica e equipe assistencial comunicada.`,
      author: 'Dr. Carlos Mendes',
      authorRole: 'Médico',
      area: 'Médico',
    },
    {
      id: 'evo-med-0820',
      time: '08:20',
      timeLabel: '08:20 · Hoje',
      title: 'Avaliação médica',
      note: 'Refere melhora do desconforto respiratório. Ausculta pulmonar com crepitações bibasais. Conduta mantida conforme plano terapêutico.',
      author: 'Dr. Carlos Mendes',
      authorRole: 'Médico',
      area: 'Médico',
    },
    {
      id: 'evo-nur-1042',
      time: '10:42',
      timeLabel: '10:42 · Hoje',
      title: 'Paciente em acompanhamento',
      note: `Consciente e orientada. SpO₂ ${spo2}% em ar ambiente; mantida observação e equipe responsável comunicada.`,
      author: 'Ana Beatriz Ferreira',
      authorRole: 'Enfermagem',
      area: 'Enfermagem',
    },
    {
      id: 'evo-nur-0815',
      time: '08:15',
      timeLabel: '08:15 · Hoje',
      title: 'Avaliação do início do plantão',
      note: 'Refere conforto no momento. Sinais vitais verificados e cuidados programados para o turno.',
      author: 'Ana Beatriz Ferreira',
      authorRole: 'Enfermagem',
      area: 'Enfermagem',
    },
    {
      id: 'evo-nut-0920',
      time: '09:20',
      timeLabel: '09:20 · Hoje',
      title: 'Avaliação de aceitação alimentar',
      note: 'Aceitação parcial da dieta ofertada. Paciente orientada quanto ao plano nutricional; equipe assistencial informada.',
      author: 'Carla Mendes',
      authorRole: 'Nutricionista',
      area: 'Nutrição',
    },
    {
      id: 'evo-nut-1610',
      time: '16:10',
      timeLabel: 'Ontem · 16:10',
      title: 'Acompanhamento nutricional',
      note: 'Mantida dieta branda hipossódica conforme avaliação. Hidratação acompanhada pela equipe.',
      author: 'Carla Mendes',
      authorRole: 'Nutricionista',
      area: 'Nutrição',
    },
    {
      id: 'evo-fis-0910',
      time: '09:10',
      timeLabel: '09:10 · Hoje',
      title: 'Sessão de fisioterapia',
      note: 'Realizados exercícios respiratórios e treino de transferência com auxílio. Paciente colaborativa, sem intercorrências durante a sessão.',
      author: 'Juliana Martins',
      authorRole: 'Fisioterapeuta',
      area: 'Fisioterapia',
    },
    {
      id: 'evo-fis-1430',
      time: '14:30',
      timeLabel: 'Ontem · 14:30',
      title: 'Mobilização funcional',
      note: 'Realizada mobilização ativa assistida em leito e orientação de posicionamento. Tolerância adequada conforme avaliação.',
      author: 'Juliana Martins',
      authorRole: 'Fisioterapeuta',
      area: 'Fisioterapia',
    },
    {
      id: 'evo-psi-0930',
      time: '09:30',
      timeLabel: '09:30 · Hoje',
      title: 'Acolhimento e escuta',
      note: 'Realizado acolhimento, com escuta das necessidades relatadas pela paciente e alinhamento de continuidade do acompanhamento.',
      author: 'Dra. Luiza Mendes',
      authorRole: 'Psicóloga',
      area: 'Psicologia',
    },
    {
      id: 'evo-psi-1500',
      time: '15:00',
      timeLabel: 'Ontem · 15:00',
      title: 'Acompanhamento emocional',
      note: 'Paciente acompanhada pela equipe. Mantida proposta de cuidado compartilhado conforme avaliação profissional.',
      author: 'Dra. Luiza Mendes',
      authorRole: 'Psicóloga',
      area: 'Psicologia',
    },
  ]
}

export const seedPrescriptions: Prescription[] = [
  { id: 'rx-1', time: '08:00', drug: 'Omeprazol', dose: '40 mg', route: 'Via oral', frequency: '1x ao dia', author: 'Dr. Carlos Mendes', status: 'Ativa' },
  { id: 'rx-2', time: '12:00', drug: 'Dipirona', dose: '1 g', route: 'Via oral', frequency: 'SOS se dor', author: 'Dr. Carlos Mendes', status: 'Ativa' },
  { id: 'rx-3', time: '20:00', drug: 'Enoxaparina', dose: '40 mg', route: 'Subcutânea', frequency: '1x ao dia', author: 'Dr. Carlos Mendes', status: 'Ativa' },
]

export const seedExamRequests: ExamRequest[] = [
  { id: 'ex-1', time: '08:20', exam: 'Hemograma completo', detail: 'Coleta venosa no primeiro turno', urgency: 'Rotina', requestedBy: 'Dr. Carlos Mendes', status: 'Solicitado' },
  { id: 'ex-2', time: '09:05', exam: 'Gasometria arterial', detail: 'Monitorização de oxygenação', urgency: 'Urgente', requestedBy: 'Dr. Carlos Mendes', status: 'Aprovado' },
  { id: 'ex-3', time: 'Ontem · 18:40', exam: 'Raio de tórax', detail: 'Controle de expansão pulmonar', urgency: 'Rotina', requestedBy: 'Dr. Carlos Mendes', status: 'Realizado' },
]

export const seedAssessments: Record<EvolutionArea, CareAssessment[]> = {
  Médico: [
    { id: 'as-med-1', time: '08:20', title: 'Avaliação médica inicial', score: '8/10', detail: 'Consciência e orientação preservadas', author: 'Dr. Carlos Mendes', area: 'Médico' },
  ],
  Enfermagem: [],
  Nutrição: [
    { id: 'as-nut-1', time: '09:20', title: 'Aceitação alimentar', score: '70%', detail: 'Dieta parcialmente aceita', author: 'Carla Mendes', area: 'Nutrição' },
  ],
  Fisioterapia: [
    { id: 'as-fis-1', time: '09:10', title: 'Mobilidade articular', score: '3/5', detail: 'Transferência com um auxiliar', author: 'Juliana Martins', area: 'Fisioterapia' },
  ],
  Psicologia: [
    { id: 'as-psi-1', time: '09:30', title: 'Escala de bem-estar', score: '7/10', detail: 'Ansemia moderada relatada', author: 'Dra. Luiza Mendes', area: 'Psicologia' },
  ],
}

export const careTeam: TeamMember[] = [
  { name: 'Ana Beatriz Ferreira', role: 'Enfermeira', initials: 'AB' },
  { name: 'Carla Mendes', role: 'Nutricionista', initials: 'CM' },
  { name: 'Juliana Martins', role: 'Fisioterapeuta', initials: 'JM' },
  { name: 'Dra. Luiza Mendes', role: 'Psicóloga', initials: 'LM' },
]

export const careItems: CareItem[] = [
  { title: 'Banho no leito', time: '08:00', state: 'Realizado' },
  { title: 'Higiene oral', time: '09:30', state: 'Realizado' },
  { title: 'Mudança de decúbito', time: '12:00', state: 'Pendente' },
  { title: 'Curativo', time: '14:00', state: 'Agendado' },
]

export const nurseMedications: Medication[] = [
  { name: 'Dipirona', dose: '1 g · via oral', time: '12:00', state: 'Próximo' },
  { name: 'Omeprazol', dose: '40 mg · via oral', time: '14:00', state: 'Agendado' },
  { name: 'Enoxaparina', dose: '40 mg · subcutânea', time: '20:00', state: 'Agendado' },
]

export const patientMedications: PatientMedication[] = [
  { id: 'omeprazol', time: '08:00', name: 'Omeprazol', dose: '40 mg · via oral', taken: true },
  { id: 'dipirona', time: '12:00', name: 'Dipirona', dose: '1 g · via oral' },
  { id: 'enoxaparina', time: '20:00', name: 'Enoxaparina', dose: '40 mg · conforme prescrição' },
]

export const patientRoutines: RoutineItem[] = [
  { time: '08:00', title: 'Café da manhã', detail: 'Dieta conforme orientação nutricional', state: 'Concluído' },
  { time: '09:00', title: 'Avaliação de enfermagem', detail: 'Sinais vitais e cuidados do período', state: 'Concluído' },
  { time: '11:00', title: 'Fisioterapia', detail: 'Sessão no quarto', state: 'Próximo' },
  { time: '13:00', title: 'Almoço', detail: 'Dieta conforme orientação nutricional', state: 'Agendado' },
  { time: '15:00', title: 'Visita médica', detail: 'Dr. Carlos Mendes', state: 'Agendado' },
]

export const meals: Meal[] = [
  { time: '08:00', title: 'Café da manhã', detail: 'Leite com baixo teor de gordura · pão macio · fruta' },
  { time: '10:00', title: 'Lanche da manhã', detail: 'Fruta da estação · água' },
  { time: '13:00', title: 'Almoço', detail: 'Arroz · proteína magra · legumes cozidos · fruta' },
  { time: '16:00', title: 'Lanche da tarde', detail: 'Iogurte natural · fruta amassada' },
  { time: '19:00', title: 'Jantar', detail: 'Sopa de legumes com proteína · conforme aceitação' },
]

export const nutritionPendingItems: NutritionPendingItem[] = [
  { title: 'Reavaliar aceitação da dieta', detail: 'Paciente · próximo acompanhamento', priority: 'Atenção' },
  { title: 'Atualizar avaliação antropométrica', detail: 'Peso e medidas · acompanhamento semanal', priority: 'Programado' },
  { title: 'Revisar plano alimentar', detail: 'Em conjunto com equipe assistencial', priority: 'Programado' },
]

export const therapyGoals: TherapyGoal[] = [
  { title: 'Transferência leito-poltrona', progress: 'Em andamento' },
  { title: 'Exercícios respiratórios', progress: 'Programado' },
]

export const therapyObjectives: TherapyRow[] = [
  { title: 'Manter mobilidade funcional', detail: 'Progredir transferências conforme tolerância' },
  { title: 'Apoiar função respiratória', detail: 'Exercícios respiratórios conforme avaliação' },
]

export const therapyInterventions: TherapyRow[] = [
  { title: 'Exercícios respiratórios', detail: 'Sessão orientada · conforme tolerância' },
  { title: 'Treino de transferência', detail: 'Leito para poltrona · com auxílio' },
  { title: 'Mobilização ativa', detail: 'Membros superiores e inferiores' },
]

export const assessmentMetrics: AssessmentMetric[] = [
  { label: 'Amplitude de movimento', value: 'Reduzida' },
  { label: 'Força muscular', value: 'Grau 4 / 5' },
  { label: 'Dor referida', value: '2 / 10' },
  { label: 'Mobilidade funcional', value: 'Com auxílio' },
]

export const sessionSchedule: ScheduleEntry[] = [
  { time: '11:00', title: 'Maria Silva Santos', detail: 'Sessão no quarto' },
  { time: '13:30', title: 'João Santos', detail: 'Avaliação funcional' },
  { time: '15:00', title: 'Ana Oliveira', detail: 'Mobilidade' },
]

export const physiotherapyPendingItems: PendingItem[] = [
  { title: 'Reavaliar mobilidade funcional', detail: 'Próxima sessão · hoje às 11:00' },
  { title: 'Atualizar evolução após sessão', detail: 'Acompanhamento fisioterapêutico' },
  { title: 'Revisar tolerância aos exercícios', detail: 'Conforme plano terapêutico' },
]

export const careGoals: CareGoal[] = [
  { title: 'Promover escuta e acolhimento', state: 'Em acompanhamento' },
  { title: 'Apoiar estratégias de enfrentamento', state: 'Em andamento' },
  { title: 'Apoiar comunicação das necessidades de cuidado', state: 'Contínuo' },
]

export const careActions: CareAction[] = [
  { title: 'Acolhimento individual', detail: 'Sessão conforme agenda de hoje', status: 'Programado' },
  { title: 'Escuta ativa', detail: 'Registrar necessidades relatadas durante atendimento', status: 'Em andamento' },
  { title: 'Articulação com a equipe', detail: 'Compartilhar informações necessárias ao plano de cuidado', status: 'Contínuo' },
]

export const planInterventions: CareAction[] = [
  { title: 'Atendimento individual', detail: 'Conforme agenda e avaliação profissional', status: 'Programado' },
  { title: 'Articulação multiprofissional', detail: 'Compartilhamento conforme necessidade assistencial', status: 'Contínuo' },
]

export const daySchedule: ScheduleEntry[] = [
  { time: '09:30', title: 'Acolhimento individual', detail: 'Concluído' },
  { time: '14:00', title: 'Sessão de acompanhamento', detail: 'Programado' },
]

export const psychologyPendingItems: PendingItem[] = [
  { title: 'Realizar sessão de acompanhamento', detail: 'Agenda de hoje · 14:00' },
  { title: 'Revisar objetivos do plano', detail: 'Na próxima avaliação' },
  { title: 'Registrar evolução do atendimento', detail: 'Após sessão individual' },
]

export const professionals: Professional[] = [
  { name: 'Dr. Carlos Mendes', role: 'Médico · Clínica médica', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Ana Beatriz Ferreira', role: 'Enfermeira', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Carla Mendes', role: 'Nutricionista', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Juliana Martins', role: 'Fisioterapeuta', unit: 'Reabilitação', state: 'Ativo' },
  { name: 'Dra. Luiza Mendes', role: 'Psicóloga', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Marcos Vinícius Alves', role: 'Técnico de enfermagem', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Renata Duarte', role: 'Enfermeira', unit: 'Recuperação', state: 'Ativo' },
  { name: 'Sérgio Antônio Rocha', role: 'Fisioterapeuta', unit: 'Reabilitação', state: 'Afastado' },
  { name: 'Helena Campos', role: 'Nutricionista', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Thiago Correia Melo', role: 'Recepcionista', unit: 'Recepção', state: 'Ativo' },
  { name: 'Priscila Farias', role: 'Psicóloga', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Otávio Ramos', role: 'Médico · Clínica médica', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Beatriz Aguiar', role: 'Enfermeira', unit: 'Recuperação', state: 'Afastado' },
  { name: 'Wagner Lopes', role: 'Técnico de enfermagem', unit: 'Recuperação', state: 'Ativo' },
  { name: 'Eliane Souza', role: 'Médico · Recuperação', unit: 'Recuperação', state: 'Ativo' },
  { name: 'Nilton Barbosa', role: 'Fisioterapeuta', unit: 'Reabilitação', state: 'Ativo' },
  { name: 'Camila Restrepo', role: 'Nutricionista', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Adriana Peixoto', role: 'Recepcionista', unit: 'Recepção', state: 'Ativo' },
  { name: 'Fábio Nogueira', role: 'Médico · Clínica médica', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Letícia Fontes', role: 'Enfermeira', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Rogério Tavares', role: 'Técnico de enfermagem', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Sabrina Mattos', role: 'Psicóloga', unit: 'Equipe multiprofissional', state: 'Afastado' },
  { name: 'Ivanilde Correia', role: 'Fisioterapeuta', unit: 'Reabilitação', state: 'Ativo' },
  { name: 'Denise Valadão', role: 'Nutricionista', unit: 'Equipe multiprofissional', state: 'Ativo' },
  { name: 'Márcia Beltrão', role: 'Recepcionista', unit: 'Recepção', state: 'Ativo' },
  { name: 'Cláudio Bertoldi', role: 'Médico · Recuperação', unit: 'Recuperação', state: 'Ativo' },
  { name: 'Tatiane Menezes', role: 'Enfermeira', unit: 'Clínica médica', state: 'Ativo' },
  { name: 'Rafael Costa', role: 'Administrador', unit: 'Administração', state: 'Ativo' },
]

export const weeklyAttendance: WeeklyPoint[] = [
  { day: 'Seg', value: 68 },
  { day: 'Ter', value: 82 },
  { day: 'Qua', value: 72 },
  { day: 'Qui', value: 94 },
  { day: 'Sex', value: 100 },
  { day: 'Sáb', value: 54 },
  { day: 'Dom', value: 35 },
]

export const appointments: Appointment[] = [
  { time: '08:00', name: 'Maria Silva Santos', detail: 'Consulta médica · Dr. Carlos Mendes', status: 'Confirmado' },
  { time: '09:30', name: 'Fernando Lima', detail: 'Retorno · Dra. Paula Ribeiro', status: 'Confirmado' },
  { time: '10:00', name: 'Roberta Alves', detail: 'Consulta · Nutrição', status: 'Aguardando' },
  { time: '11:30', name: 'João Vitor Souza', detail: 'Avaliação · Fisioterapia', status: 'Confirmado' },
  { time: '13:00', name: 'Ana Costa', detail: 'Consulta · Psicologia', status: 'Aguardando' },
]

export const weeklyAppointments: WeeklyPoint[] = [
  { day: 'Seg', value: 72 },
  { day: 'Ter', value: 92 },
  { day: 'Qua', value: 63 },
  { day: 'Qui', value: 83 },
  { day: 'Sex', value: 100 },
  { day: 'Sáb', value: 45 },
  { day: 'Dom', value: 27 },
]
