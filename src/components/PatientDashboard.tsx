import { useState, type ReactNode } from 'react'
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartPulse,
  House,
  Pill,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { defaultPatientId, latestVitals } from '../data/patients'
import { careActions, nowTime } from '../store/actions'
import { requireClinical } from '../store/state'
import { useCareState } from '../store/careStore'
import { BottomNav, type BottomNavItem } from './shared/BottomNav'
import Brand from './Brand'
import './PatientDashboard.css'

type PatientPage = 'inicio' | 'rotina' | 'medicamentos'

const patientPages: { page: PatientPage; label: string; icon: ReactNode }[] = [
  { page: 'inicio', label: 'Início', icon: <House size="1.125rem" /> },
  { page: 'rotina', label: 'Minha rotina', icon: <CalendarDays size="1.125rem" /> },
  { page: 'medicamentos', label: 'Medicamentos', icon: <Pill size="1.125rem" /> },
]

type PatientDashboardProps = {
  onBack: () => void
}

function PatientDashboard({ onBack }: PatientDashboardProps) {
  const [activePage, setActivePage] = useState<PatientPage>('inicio')
  const [notice, setNotice] = useState('')
  const state = useCareState()
  const patient = state.patients.find((entry) => entry.id === defaultPatientId) ?? state.patients[0]
  const clinical = requireClinical(state, patient.id)
  const medications = clinical.patientMedications
  const routines = clinical.routines
  const activeVitals = latestVitals(patient)
  const firstName = patient.name.split(' ')[0]

  function changePage(page: PatientPage) {
    setActivePage(page)
    setNotice('')
  }

  const navItems: BottomNavItem[] = patientPages.map(({ page, label, icon }) => ({
    label,
    icon,
    active: activePage === page,
    onClick: () => changePage(page),
  }))

  function toggleMedication(medicationId: string) {
    const alvo = medications.find((medication) => medication.id === medicationId)
    const isTaken = Boolean(alvo?.taken)
    careActions.setMedicationTaken(patient.id, medicationId, !isTaken)
    setNotice(
      isTaken
        ? `${alvo?.name ?? 'Medicamento'} marcado como ainda não tomado.`
        : `${alvo?.name ?? 'Medicamento'} marcado como tomado às ${nowTime()}.`,
    )
  }

  return (
    <main className="patient-dashboard">
      <header className="patient-topbar">
        <Brand compact />
        <span className="patient-area-label">Minha área de cuidado</span>
        <button className="patient-notification-button" type="button" aria-label="Notificações" onClick={() => setNotice('Notificações demonstrativas.')}><Bell size="1.1875rem" /><i>1</i></button>
        <button className="patient-profile-button" type="button" onClick={onBack}><span><UserRound size="1.125rem" /></span><span><strong>{patient.name}</strong><small>Paciente</small></span><ChevronRight size="1rem" /></button>
      </header>

      <nav className="patient-main-tabs" aria-label="Navegação do paciente" role="tablist">
        {patientPages.map(({ page, label }) => (
          <PatientTab key={page} active={activePage === page} label={label} onClick={() => changePage(page)}>
            {page === 'inicio' && <House size="1.0625rem" />}
            {page === 'rotina' && <CalendarDays size="1.0625rem" />}
            {page === 'medicamentos' && <Pill size="1.0625rem" />}
          </PatientTab>
        ))}
      </nav>

      <div className="patient-content">
        {activePage === 'inicio' && (
          <section aria-labelledby="patient-title">
            <div className="patient-welcome"><div><span className="patient-kicker">QUARTA-FEIRA · 10 DE SETEMBRO</span><h1 id="patient-title">Olá, {firstName}.</h1><p>Aqui está um resumo do seu cuidado de hoje.</p></div><span className="care-status"><span />Acompanhamento ativo</span></div>
            <div className="patient-overview-grid">
              <section className="patient-summary-panel">
                <div className="patient-summary-header"><span className="patient-summary-icon"><HeartPulse size="1.25rem" /></span><div><small>SEU ACOMPANHAMENTO</small><strong>Seu cuidado está em andamento</strong></div><ShieldCheck size="1.125rem" /></div>
                <p>As informações de hoje estão reunidas aqui para você e sua equipe acompanharem cada etapa.</p>
                <div className="patient-care-facts"><div><span>Equipe responsável</span><strong>Equipe de cuidado</strong></div><div><span>Próxima atividade</span><strong>Fisioterapia · 11:00</strong></div></div>
                <button className="patient-outline-action" type="button" onClick={() => changePage('rotina')}>Ver minha rotina <ArrowRightIcon /></button>
              </section>
              <section className="patient-next-panel"><div className="patient-panel-title"><div><span>PRÓXIMA ATIVIDADE</span><h2>Fisioterapia</h2></div><span className="next-time"><Clock3 size="0.875rem" />11:00</span></div><p>Sessão programada para hoje.</p><div className="appointment-location"><CalendarDays size="1rem" /><span>Hoje, às 11:00<small>Quarto do paciente</small></span></div></section>
            </div>

            <div className="patient-vitals-section"><div className="patient-section-heading"><div><h2>Últimas informações</h2><p>Atualizadas hoje às 10:42</p></div><button type="button" onClick={() => setNotice('Os sinais vitais exibidos são dados fictícios deste protótipo.')}>Sobre estes dados <ChevronRight size="0.9375rem" /></button></div><div className="patient-vitals-grid"><Vital icon={<Activity size="1.0625rem" />} label="Pressão arterial" value={activeVitals.bloodPressure} unit="mmHg" /><Vital icon={<HeartPulse size="1.0625rem" />} label="Frequência cardíaca" value={String(activeVitals.heartRate)} unit="bpm" /><Vital icon={<Activity size="1.0625rem" />} label="Temperatura" value={activeVitals.temperature} unit="°C" /><Vital icon={<HeartPulse size="1.0625rem" />} label="SpO₂" value={String(activeVitals.spo2)} unit="%" /></div></div>

            <div className="patient-lower-grid"><section className="patient-panel medication-preview"><div className="patient-section-heading"><div><h2>Medicamentos de hoje</h2><p>{medications.filter((medication) => medication.taken).length} de {medications.length} registrados nesta demonstração</p></div><button type="button" onClick={() => changePage('medicamentos')}>Ver todos <ChevronRight size="0.9375rem" /></button></div>{medications.slice(0, 2).map((medication) => <MedicationItem key={medication.id} {...medication} isTaken={Boolean(medication.taken)} onToggle={() => toggleMedication(medication.id)} compact />)}</section><section className="patient-panel team-contact"><div className="patient-section-heading"><div><h2>Sua equipe de cuidado</h2><p>Profissionais envolvidos no acompanhamento</p></div></div><div className="care-team-person"><span className="care-team-avatar">CM</span><span><strong>Dr. Carlos Mendes</strong><small>Equipe médica</small></span><span className="care-team-online" /></div><div className="care-team-person"><span className="care-team-avatar avatar-teal">AB</span><span><strong>Ana Beatriz</strong><small>Enfermagem</small></span><span className="care-team-online" /></div></section></div>
          </section>
        )}

        {activePage === 'rotina' && (
          <section aria-labelledby="routine-title"><div className="patient-welcome"><div><span className="patient-kicker">QUARTA-FEIRA · 10 DE SETEMBRO</span><h1 id="routine-title">Minha rotina</h1><p>Atividades e cuidados programados para hoje.</p></div><button className="patient-date-picker" type="button" onClick={() => setNotice('Exibindo a rotina demonstrativa de hoje.')}><CalendarDays size="1rem" />Hoje<ChevronRight size="0.9375rem" /></button></div><section className="patient-panel routine-panel"><div className="patient-section-heading"><div><h2>Agenda do dia</h2><p>5 atividades programadas</p></div><span className="routine-date-chip">Hoje</span></div><div className="routine-list">{routines.map((routine) => <RoutineItem key={`${routine.time}-${routine.title}`} {...routine} />)}</div></section></section>
        )}

        {activePage === 'medicamentos' && (
          <section aria-labelledby="medications-title"><div className="patient-welcome"><div><span className="patient-kicker">PLANO DE CUIDADO</span><h1 id="medications-title">Medicamentos</h1><p>Horários de hoje conforme o plano demonstrativo.</p></div><span className="medication-day"><CalendarDays size="0.9375rem" />Hoje</span></div><section className="patient-panel full-medication-panel"><div className="patient-section-heading"><div><h2>Cronograma de hoje</h2><p>Confirme cada horário após a orientação da sua equipe.</p></div></div><div className="patient-medication-list">{medications.map((medication) => <MedicationItem key={medication.id} {...medication} isTaken={Boolean(medication.taken)} onToggle={() => toggleMedication(medication.id)} />)}</div><div className="medication-safety"><ShieldCheck size="1.125rem" /><p>Siga sempre as orientações da sua equipe de saúde. Este cronograma é apenas demonstrativo e não substitui uma prescrição.</p></div></section></section>
        )}
        {notice && <p className="patient-notice" role="status">{notice}</p>}
      </div>

      <footer className="patient-demo-footer"><ShieldCheck size="0.9375rem" /><span>Protótipo demonstrativo · Não utilizar para decisões clínicas.</span><button type="button" onClick={onBack}>Sair</button></footer>
      <BottomNav className="patient-bottom-nav" items={navItems} />
    </main>
  )
}

type PatientTabProps = { active: boolean; label: string; onClick: () => void; children: React.ReactNode }

function PatientTab({ active, label, onClick, children }: PatientTabProps) {
  return <button type="button" role="tab" aria-selected={active} className={active ? 'is-active' : ''} onClick={onClick}>{children}{label}</button>
}

type VitalProps = { icon: React.ReactNode; label: string; value: string; unit: string }

function Vital({ icon, label, value, unit }: VitalProps) {
  return <article className="patient-vital"><span>{icon}</span><small>{label}</small><strong>{value}<i>{unit}</i></strong></article>
}

type RoutineItemProps = { time: string; title: string; detail: string; state: string }

function RoutineItem({ time, title, detail, state }: RoutineItemProps) {
  return <article className="routine-item"><time>{time}</time><span className={`routine-marker${state === 'Concluído' ? ' marker-done' : ''}`} /> <div><strong>{title}</strong><small>{detail}</small></div><span className={`routine-state${state === 'Próximo' ? ' routine-state-next' : ''}`}>{state}</span></article>
}

type MedicationItemProps = { id: string; time: string; name: string; dose: string; isTaken: boolean; onToggle: () => void; compact?: boolean }

function MedicationItem({ time, name, dose, isTaken, onToggle, compact = false }: MedicationItemProps) {
  return <article className={`patient-medication-item${compact ? ' medication-compact' : ''}`}><span className="patient-pill-icon"><Pill size="1.0625rem" /></span><time>{time}</time><div><strong>{name}</strong><small>{dose}</small></div>{isTaken ? <span className="taken-state"><CheckCircle2 size="0.9375rem" />Tomado</span> : <button type="button" onClick={onToggle}>Marcar como tomado</button>}</article>
}

function ArrowRightIcon() {
  return <ChevronRight size="1rem" aria-hidden="true" />
}

export default PatientDashboard