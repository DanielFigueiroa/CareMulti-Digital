import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  FileBarChart,
  FilePlus2,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { appointments, weeklyAppointments } from '../data/clinical'
import { matchesPatientSearch, needsAttention, type Patient } from '../data/patients'
import { careActions } from '../store/actions'
import { useCareState } from '../store/careStore'
import {
  createAdmissionClinical,
  emptyPatientDraft,
  validatePatientDraft,
  type NewPatientDraft,
  type PatientDraftErrors,
} from '../store/enrollment'
import Brand from './Brand'
import { SelectField, TextField } from './shared/Fields'
import './ReceptionDashboard.css'

const sexOptions = ['Feminino', 'Masculino', 'Prefiro não informar'] as const
const insuranceOptions = ['Particular', 'Unimed', 'Bradesco Saúde', 'Outro'] as const

const weeklyMax = Math.max(...weeklyAppointments.map((day) => day.value))

type ReceptionPage = 'inicio' | 'novo-paciente' | 'buscar-paciente' | 'relatorios'

type ReceptionDashboardProps = {
  onBack: () => void
}

function ReceptionDashboard({ onBack }: ReceptionDashboardProps) {
  const [activePage, setActivePage] = useState<ReceptionPage>('inicio')
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')
  const state = useCareState()
  const [draft, setDraft] = useState<NewPatientDraft>(emptyPatientDraft)
  const [errors, setErrors] = useState<PatientDraftErrors>({})
  const visibleAppointments = appointments.filter((appointment) =>
    `${appointment.name} ${appointment.detail}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )
  const visiblePatients = state.patients.filter((patient) => matchesPatientSearch(patient, searchTerm))

  function changePage(page: ReceptionPage) {
    setActivePage(page)
    setNotice('')
    if (page !== 'novo-paciente') setErrors({})
  }

  function updateDraft(field: keyof NewPatientDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  function handlePatientSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validatePatientDraft(draft, state.patients)
    if (!result.ok) {
      setErrors(result.errors)
      setNotice('Revise os campos destacados antes de concluir o cadastro.')
      return
    }
    careActions.registerPatient(result.patient, createAdmissionClinical(result.patient))
    setDraft(emptyPatientDraft)
    setErrors({})
    setNotice(`${result.patient.name} foi admitido em ${result.patient.bed} e já aparece nas listas da equipe.`)
  }

  return (
    <main className="reception-dashboard">
      <header className="reception-topbar">
        <Brand compact onHome={onBack} />
        <span className="reception-role-label">Recepção</span>
        <button className="reception-icon-button" type="button" aria-label="Notificações" onClick={() => setNotice('Notificações ainda não estão conectadas.')}><Bell size="1.1875rem" /></button>
        <button className="reception-user" type="button" onClick={onBack}>
          <span className="reception-user-icon"><UserRound size="1.0625rem" /></span>
          <span><strong>Thiago Correia Melo</strong><small>Perfil de recepção</small></span>
          <ChevronRight size="1rem" />
        </button>
      </header>

      <nav className="reception-tabs" aria-label="Seções da recepção" role="tablist">
        <ReceptionTab active={activePage === 'inicio'} label="Início" onClick={() => changePage('inicio')}><CalendarDays size="1rem" /></ReceptionTab>
        <ReceptionTab active={activePage === 'novo-paciente'} label="Novo paciente" onClick={() => changePage('novo-paciente')}><FilePlus2 size="1rem" /></ReceptionTab>
        <ReceptionTab active={activePage === 'relatorios'} label="Relatórios" onClick={() => changePage('relatorios')}><FileBarChart size="1rem" /></ReceptionTab>
      </nav>

      <div className="reception-content">
        {activePage === 'inicio' && (
          <section aria-labelledby="reception-title">
            <div className="reception-welcome">
              <div><span className="reception-kicker">SEGUNDA-FEIRA · 22 DE SETEMBRO</span><h1 id="reception-title">Olá, Juliana.</h1><p>Confira os atendimentos e as atividades de hoje.</p></div>
              <button className="reception-date-button" type="button" onClick={() => setNotice('Agenda demonstrativa de hoje.')}><CalendarDays size="1.0625rem" />Hoje<ChevronRight size="0.9375rem" /></button>
            </div>
            <div className="reception-stats">
              <Stat icon={<CalendarDays size="1.125rem" />} value="12" label="Atendimentos hoje" tone="teal" />
              <Stat icon={<UsersRound size="1.125rem" />} value="8" label="Pacientes aguardando" tone="blue" />
              <Stat icon={<Clock3 size="1.125rem" />} value="5" label="Agendamentos pendentes" tone="yellow" />
              <Stat icon={<FileBarChart size="1.125rem" />} value="2" label="Cadastros para revisar" tone="red" />
            </div>
            <div className="reception-columns">
              <section className="reception-section">
                <div className="reception-section-heading"><div><h2>Agenda de hoje</h2><p>Próximos atendimentos do centro de cuidado</p></div><button type="button" onClick={() => setNotice('Agenda demonstrativa de hoje.')}>Ver agenda <ArrowRight size="0.9375rem" /></button></div>
                <label className="reception-search"><Search size="1rem" /><input aria-label="Buscar atendimento" placeholder="Buscar paciente ou profissional" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
                <div className="appointment-list">
                  {visibleAppointments.map((appointment) => <AppointmentRow key={`${appointment.time}-${appointment.name}`} {...appointment} />)}
                  {visibleAppointments.length === 0 && <p className="reception-empty">Nenhum atendimento encontrado.</p>}
                </div>
                <button className="section-footer-button" type="button" onClick={() => setNotice('Agenda demonstrativa; integração de horários será definida depois.')}>Abrir agenda completa <ArrowRight size="0.9375rem" /></button>
              </section>
              <aside className="reception-side-column">
                <section className="reception-section quick-actions-section"><div className="reception-section-heading"><div><h2>Ações rápidas</h2><p>Atalhos de atendimento</p></div></div><QuickAction icon={<FilePlus2 size="1.125rem" />} title="Novo paciente" detail="Iniciar cadastro" onClick={() => changePage('novo-paciente')} /><QuickAction icon={<Search size="1.125rem" />} title="Buscar paciente" detail="Consultar cadastro" onClick={() => changePage('buscar-paciente')} /><QuickAction icon={<FileBarChart size="1.125rem" />} title="Ver relatórios" detail="Resumo do setor" onClick={() => changePage('relatorios')} /></section>
                <section className="next-appointment"><span className="next-appointment-icon"><Clock3 size="1.0625rem" /></span><div><small>PRÓXIMO ATENDIMENTO</small><strong>Maria Silva Santos</strong><span>08:00 · Consulta médica</span></div><ArrowRight size="1rem" /></section>
                <section className="reception-section team-section"><div className="reception-section-heading"><div><h2>Equipe disponível</h2><p>Profissionais em atendimento</p></div><span className="online-count">4 online</span></div><TeamMember initials="CM" name="Dr. Carlos Mendes" specialty="Clínica médica" /><TeamMember initials="PR" name="Dra. Paula Ribeiro" specialty="Clínica geral" /></section>
              </aside>
            </div>
            {notice && <p className="reception-notice" role="status">{notice}</p>}
          </section>
        )}

        {activePage === 'buscar-paciente' && (
          <section aria-labelledby="search-patient-title">
            <div className="reception-welcome"><div><span className="reception-kicker">CONSULTA DE CADASTRO</span><h1 id="search-patient-title">Buscar paciente</h1><p>Encontre pacientes pelo nome, leito ou diagnóstico.</p></div><button className="reception-date-button" type="button" onClick={() => changePage('inicio')}><ArrowRight className="back-arrow" size="1rem" />Voltar à agenda</button></div>
            <label className="reception-search"><Search size="1rem" /><input aria-label="Buscar paciente" placeholder="Nome, leito ou diagnóstico" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
            <p className="search-summary" role="status">{visiblePatients.length} de {state.patients.length} pacientes encontrados.</p>
            <div className="patient-search-results">
              {visiblePatients.map((patient) => <PatientSearchRow key={patient.id} patient={patient} onOpen={() => setNotice(`Prontuário de ${patient.name}, ${patient.bed}. Abertura completa fica para a etapa seguinte.`)} />)}
              {visiblePatients.length === 0 && <p className="reception-empty">Nenhum paciente encontrado.</p>}
            </div>
            {notice && <p className="reception-notice" role="status">{notice}</p>}
          </section>
        )}

        {activePage === 'novo-paciente' && (
          <section className="patient-form-page" aria-labelledby="new-patient-title">
            <div className="reception-welcome"><div><span className="reception-kicker">CADASTRO</span><h1 id="new-patient-title">Novo paciente</h1><p>Preencha os dados pessoais e de contato.</p></div><button className="reception-date-button" type="button" onClick={() => changePage('inicio')}><ArrowRight className="back-arrow" size="1rem" />Voltar à agenda</button></div>
            <form className="reception-form" onSubmit={handlePatientSubmit} noValidate>
              <fieldset><legend>Dados pessoais</legend><div className="form-grid">
                <TextField className="form-field form-field-wide" label="Nome completo" value={draft.name} onChange={(value) => updateDraft('name', value)} placeholder="Nome e sobrenome" error={errors.name} autoComplete="name" />
                <TextField className="form-field" label="Data de nascimento" type="date" value={draft.birthdate} onChange={(value) => updateDraft('birthdate', value)} error={errors.birthdate} autoComplete="bday" />
                <SelectField className="form-field" label="Sexo" value={draft.sex} onChange={(value) => updateDraft('sex', value)} options={sexOptions} placeholder="Selecione" error={errors.sex} />
                <TextField className="form-field" label="Telefone" type="tel" value={draft.phone} onChange={(value) => updateDraft('phone', value)} placeholder="(00) 00000-0000" error={errors.phone} autoComplete="tel" />
                <TextField className="form-field" label="E-mail" type="email" value={draft.email} onChange={(value) => updateDraft('email', value)} placeholder="paciente@email.com" error={errors.email} autoComplete="email" />
              </div></fieldset>
              <fieldset><legend>Convênio</legend><div className="form-grid">
                <SelectField className="form-field" label="Convênio" value={draft.insurance} onChange={(value) => updateDraft('insurance', value)} options={insuranceOptions} placeholder="Selecione o convênio" />
                <TextField className="form-field" label="Número da carteirinha" value={draft.insuranceNumber} onChange={(value) => updateDraft('insuranceNumber', value)} placeholder="Número do beneficiário" error={errors.insuranceNumber} />
              </div></fieldset>
              <div className="form-actions"><p>O cadastro entra nas listas da equipe e na agenda de atendimento.</p><button className="save-patient-button" type="submit"><Check size="1.0625rem" />Cadastrar paciente</button></div>
              {notice && <p className="reception-notice" role="status">{notice}</p>}
            </form>
          </section>
        )}

        {activePage === 'relatorios' && (
          <section aria-labelledby="reports-title">
            <div className="reception-welcome"><div><span className="reception-kicker">VISÃO DO SETOR</span><h1 id="reports-title">Relatórios</h1><p>Acompanhe os indicadores de atendimento.</p></div><button className="reception-date-button" type="button" onClick={() => setNotice('Período demonstrativo: esta semana.')}><CalendarDays size="1rem" />Esta semana<ChevronRight size="0.9375rem" /></button></div>
            <div className="report-stats"><ReportStat label="Atendimentos realizados" value="84" detail="↑ 12% em relação à semana anterior" /><ReportStat label="Novos pacientes" value="23" detail="↑ 8% em relação à semana anterior" /><ReportStat label="Tempo médio de espera" value="18 min" detail="↓ 4 min em relação à semana anterior" /></div>
            <div className="reception-columns report-columns">
              <section className="reception-section"><div className="reception-section-heading"><div><h2>Atendimentos por dia</h2><p>Volume diário · últimos 7 dias</p></div><button type="button" onClick={() => setNotice('Exportação de relatório ainda não conectada.')}>Exportar <ArrowRight size="0.9375rem" /></button></div><div className="report-chart" aria-label="Gráfico demonstrativo de atendimentos por dia">{weeklyAppointments.map((report) => <div className="chart-column" key={report.day}><span>{report.value}</span><i style={{ height: `${(report.value / weeklyMax) * 100}%` }} /><small>{report.day}</small></div>)}</div></section>
              <section className="reception-section report-summary"><div className="reception-section-heading"><div><h2>Resumo de atendimentos</h2><p>Distribuição por status</p></div></div><ReportStatus label="Concluídos" value="68" percentage="81%" tone="green" /><ReportStatus label="Agendados" value="12" percentage="14%" tone="yellow" /><ReportStatus label="Cancelados" value="4" percentage="5%" tone="red" /></section>
            </div>
            {notice && <p className="reception-notice" role="status">{notice}</p>}
          </section>
        )}
      </div>

      <nav className="reception-bottom-nav" aria-label="Navegação principal">
        <ReceptionTab active={activePage === 'inicio'} label="Início" onClick={() => changePage('inicio')}><CalendarDays size="1.125rem" /></ReceptionTab>
        <ReceptionTab active={activePage === 'novo-paciente'} label="Novo paciente" onClick={() => changePage('novo-paciente')}><FilePlus2 size="1.125rem" /></ReceptionTab>
        <ReceptionTab active={activePage === 'relatorios'} label="Relatórios" onClick={() => changePage('relatorios')}><FileBarChart size="1.125rem" /></ReceptionTab>
      </nav>
    </main>
  )
}

type ReceptionTabProps = { active: boolean; label: string; onClick: () => void; children: React.ReactNode }

function ReceptionTab({ active, label, onClick, children }: ReceptionTabProps) {
  return <button type="button" role="tab" aria-selected={active} className={active ? 'is-active' : ''} onClick={onClick}>{children}{label}</button>
}

type StatProps = { icon: React.ReactNode; value: string; label: string; tone: string }

function Stat({ icon, value, label, tone }: StatProps) {
  return <article className="reception-stat"><span className={`stat-icon stat-${tone}`}>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>
}

type AppointmentRowProps = { time: string; name: string; detail: string; status: string }

function AppointmentRow({ time, name, detail, status }: AppointmentRowProps) {
  return <article className="appointment-row"><time>{time}</time><span className="appointment-avatar"><UserRound size="1.0625rem" /></span><div className="appointment-copy"><strong>{name}</strong><small>{detail}</small></div><span className={`appointment-status${status === 'Aguardando' ? ' status-waiting' : ''}`}>{status}</span><button type="button" aria-label={`Ver atendimento de ${name}`}><ChevronRight size="1rem" /></button></article>
}

type PatientSearchRowProps = { patient: Patient; onOpen: () => void }

function PatientSearchRow({ patient, onOpen }: PatientSearchRowProps) {
  return (
    <article className="patient-search-row">
      <span className="appointment-avatar"><UserRound size="1.0625rem" /></span>
      <div className="appointment-copy">
        <strong>{patient.name}</strong>
        <small>{patient.bed} · {patient.age} anos · {patient.diagnosis}</small>
      </div>
      <span className={`appointment-status${needsAttention(patient.status) ? ' status-waiting' : ''}`}>{patient.status}</span>
      <button type="button" onClick={onOpen} aria-label={`Ver prontuário de ${patient.name}`}>
        <ChevronRight size="1rem" />
      </button>
    </article>
  )
}

type QuickActionProps = { icon: React.ReactNode; title: string; detail: string; onClick: () => void }

function QuickAction({ icon, title, detail, onClick }: QuickActionProps) {
  return <button className="quick-action" type="button" onClick={onClick}><span className="quick-action-icon">{icon}</span><span><strong>{title}</strong><small>{detail}</small></span><ArrowRight size="1rem" /></button>
}

type TeamMemberProps = { initials: string; name: string; specialty: string }

function TeamMember({ initials, name, specialty }: TeamMemberProps) {
  return <div className="team-line"><span className="team-avatar">{initials}</span><span><strong>{name}</strong><small>{specialty}</small></span><i /></div>
}

type ReportStatProps = { label: string; value: string; detail: string }

function ReportStat({ label, value, detail }: ReportStatProps) {
  return <article className="report-stat"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

type ReportStatusProps = { label: string; value: string; percentage: string; tone: string }

function ReportStatus({ label, value, percentage, tone }: ReportStatusProps) {
  return <div className="report-status"><div className="report-status-row"><span className={`report-status-dot dot-${tone}`} /><span>{label}</span><strong>{value} <small>{percentage}</small></strong></div><div className={`report-meter meter-${tone}`}><i style={{ width: percentage }} /></div></div>
}

export default ReceptionDashboard