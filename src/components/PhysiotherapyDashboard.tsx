import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Clock3,
  HeartPulse,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useNotice } from '../hooks/useNotice'
import { usePatientRecord } from '../hooks/usePatientRecord'
import {
  assessmentMetrics,
  physiotherapyPendingItems as pendingItems,
  sessionSchedule,
  therapyGoals,
  therapyInterventions,
  therapyObjectives,
} from '../data/clinical'
import { AlertBanner } from './shared/AlertBanner'
import { BottomNav } from './shared/BottomNav'
import { FactCard, FactGrid } from './shared/FactCard'
import { NoticeLine } from './shared/NoticeLine'
import { PatientRow } from './shared/PatientRow'
import { PendingRow } from './shared/PendingRow'
import { ScheduleRow } from './shared/ScheduleRow'
import { SectionTitle } from './shared/SectionTitle'
import { TabNav } from './shared/TabNav'
import { TimelineEntry } from './shared/TimelineEntry'
import { AssessmentModal } from './shared/AssessmentModal'
import { CarePlanModal } from './shared/CarePlanModal'
import { EvolutionModal } from './shared/EvolutionModal'
import Brand from './Brand'
import './PhysiotherapyDashboard.css'

const physiotherapyTabs = ['Resumo', 'Avaliação', 'Plano terapêutico', 'Evolução', 'Pendências'] as const
type PhysiotherapyTab = (typeof physiotherapyTabs)[number]
type PhysioModal = 'avaliacao' | 'plano' | 'evolucao' | null

type PhysiotherapyDashboardProps = { onBack: () => void }

function PhysiotherapyDashboard({ onBack }: PhysiotherapyDashboardProps) {
  const [activeTab, setActiveTab] = useState<PhysiotherapyTab>('Resumo')
  const [modal, setModal] = useState<PhysioModal>(null)
  const { activePatient, activePatientId, clinical, visiblePatients, counts, searchTerm, setSearchTerm, setActivePatientId, statusOf } =
    usePatientRecord('physiotherapy')
  const { clearNotice, showDemoNotice, showNotice, notice } = useNotice('physio')
  const evolutions = clinical.evolutions
  const assessments = clinical.assessments['Fisioterapia']
  const carePlan = clinical.carePlans.fisioterapia

  function changeTab(tab: PhysiotherapyTab) {
    setActiveTab(tab)
    clearNotice()
  }

  function selectPatient(patientId: number) {
    setActivePatientId(patientId)
    clearNotice()
  }

  return (
    <>
    <main className="physio-dashboard">
      <header className="physio-topbar"><Brand compact onHome={onBack} /><span className="physio-role-label">Fisioterapia</span><button className="physio-notifications" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}><Bell size="1.125rem" /><i>2</i></button><button className="physio-profile" type="button" onClick={onBack}><span><UserRound size="1.125rem" /></span><span><strong>Juliana Martins</strong><small>Fisioterapeuta</small></span><ChevronRight size="0.9375rem" /></button></header>

      <div className="physio-layout">
        <aside className="physio-sidebar"><div className="physio-greeting"><span><Activity size="1.25rem" /></span><div><small>Bom dia,</small><strong>Juliana Martins</strong><small>Fisioterapia · Equipe de cuidado</small></div></div><div className="physio-stats"><div><strong>{counts.total}</strong><small>Pacientes</small></div><div><strong>{sessionSchedule.length}</strong><small>Sessões</small></div><div><strong>{pendingItems.length}</strong><small>Pendências</small></div></div><label className="physio-search"><Search size="0.9375rem" /><input placeholder="Buscar paciente" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label><div className="physio-list-heading"><h2>Seus pacientes</h2><button type="button" onClick={() => setSearchTerm('')}>Ver todos</button></div><div className="physio-patient-list">{visiblePatients.map((patient) => <PatientRow key={patient.id} patient={patient} selected={patient.id === activePatientId} onSelect={selectPatient} className="physio-patient-row" statusClassName="physio-status-attention" iconSize="1rem" secondary={patient.diagnosis} tertiary="Última sessão · hoje" />)}{visiblePatients.length === 0 && <p className="physio-empty">Nenhum paciente encontrado.</p>}</div><button className="physio-back" type="button" onClick={onBack}><ArrowRight size="0.875rem" />Trocar perfil</button></aside>

        <section className="physio-record" aria-label="Acompanhamento fisioterapêutico"><div className="physio-record-heading"><div><span>{activePatient.bed} · {activePatient.age} anos</span><h1>{activePatient.name}</h1><p>{activePatient.diagnosis}</p></div><span className="physio-record-status"><i />{statusOf(activePatient)}</span></div>
          <TabNav className="physio-tabs" ariaLabel="Seções de fisioterapia" tabs={physiotherapyTabs} activeTab={activeTab} onChange={changeTab} iconFor={(tab) => tab === 'Avaliação' ? <Activity size="0.875rem" /> : undefined} badgeFor={(tab) => tab === 'Pendências' ? pendingItems.length : undefined} />

          {activeTab === 'Resumo' && <div className="physio-tab-content"><h2>Resumo fisioterapêutico</h2><FactGrid className="physio-facts"><FactCard className="physio-fact" icon={<Activity size="1rem" />} label="Mobilidade" value="Com auxílio" /><FactCard className="physio-fact" icon={<HeartPulse size="1rem" />} label="Dor referida" value="2 / 10" /><FactCard className="physio-fact" icon={<CalendarDays size="1rem" />} label="Última avaliação" value="Hoje · 09:10" /><FactCard className="physio-fact" icon={<Clock3 size="1rem" />} label="Próxima sessão" value="Hoje · 11:00" /></FactGrid><AlertBanner className="physio-alert" icon={<CircleAlert size="1.0625rem" />} title="Acompanhamento funcional">Mobilidade reduzida durante a avaliação. Seguir plano terapêutico e reavaliar conforme evolução.</AlertBanner><section className="physio-goal-preview"><SectionTitle className="physio-section-heading" title="Objetivos atuais" subtitle="Plano de cuidado em andamento" action={<button type="button" onClick={() => changeTab('Plano terapêutico')}>Ver plano <ChevronRight size="0.875rem" /></button>} />{therapyGoals.map((goal) => <Goal key={goal.title} {...goal} />)}</section><div className="physio-actions"><button type="button" onClick={() => changeTab('Avaliação')}><Activity size="0.9375rem" />Registrar avaliação <ArrowRight size="0.8125rem" /></button><button type="button" onClick={() => changeTab('Evolução')}><ClipboardList size="0.9375rem" />Registrar evolução <ArrowRight size="0.8125rem" /></button></div></div>}

          {activeTab === 'Avaliação' && <div className="physio-tab-content"><SectionTitle className="physio-section-heading" title="Avaliação fisioterapêutica" subtitle="Registro demonstrativo · hoje às 09:10" action={<button className="physio-action-button" type="button" onClick={() => { clearNotice(); setModal('avaliacao') }}><Activity size="0.875rem" />Nova avaliação</button>} /><FactGrid className="physio-assessment-grid">{assessmentMetrics.map((metric) => <article className="physio-metric" key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></article>)}</FactGrid><section className="physio-note"><h3>Observação da avaliação</h3><p>Paciente colaborativa. Mobilidade com auxílio durante transferência; tolerou os exercícios respiratórios propostos.</p><small>Juliana Martins · Fisioterapeuta</small></section>{assessments.map((assessment) => <section key={assessment.id} className="physio-note"><h3>{assessment.title}</h3><p>{assessment.detail}</p><small>{assessment.score} · {assessment.author}</small></section>)}</div>}

          {activeTab === 'Plano terapêutico' && <div className="physio-tab-content"><SectionTitle className="physio-section-heading" title="Plano terapêutico" subtitle="Objetivos e intervenções do acompanhamento" action={<button className="physio-action-button" type="button" onClick={() => { clearNotice(); setModal('plano') }}><ClipboardList size="0.875rem" />Editar plano</button>} /><section className="therapy-block"><h3>Objetivos</h3>{therapyObjectives.map((item) => <TherapyRow key={item.title} {...item} />)}</section><section className="therapy-block"><h3>Intervenções</h3>{therapyInterventions.map((item) => <TherapyRow key={item.title} {...item} />)}</section><section className="physio-note"><h3>Plano registrado</h3><p>{carePlan}</p><small>Atualizado pela fisioterapia</small></section><div className="therapy-schedule"><span><CalendarDays size="0.9375rem" /> Frequência</span><strong>Diária · reavaliar conforme evolução</strong><span><Clock3 size="0.9375rem" /> Próxima sessão</span><strong>Hoje às 11:00</strong></div></div>}

          {activeTab === 'Evolução' && <div className="physio-tab-content"><SectionTitle className="physio-section-heading" title="Evolução fisioterapêutica" subtitle="Registros recentes do acompanhamento" action={<button className="physio-action-button" type="button" onClick={() => { clearNotice(); setModal('evolucao') }}><ClipboardList size="0.875rem" />Nova evolução</button>} />{evolutions.map((evolution) => <TimelineEntry key={evolution.id} className="physio-evolution" time={`${evolution.time} · ${evolution.timeLabel}`} title={evolution.title} author={`${evolution.author} · ${evolution.authorRole}`}>{evolution.note}</TimelineEntry>)}{evolutions.length === 0 && <p className="physio-empty">Nenhuma evolução registrada para este paciente.</p>}</div>}

          {activeTab === 'Pendências' && <div className="physio-tab-content"><SectionTitle className="physio-section-heading" title="Pendências" subtitle="Itens para o próximo acompanhamento" trailing action={<span className="physio-pending-count">{pendingItems.length}</span>} />{pendingItems.map((item) => <PendingRow key={item.title} className="physio-pending" {...item} />)}</div>}
          {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
        </section>

        <aside className="physio-side-panel"><section className="physio-side-card"><SectionTitle className="physio-section-heading" title="Agenda de hoje" subtitle="Próximos atendimentos" action={<button type="button" aria-label="Ver agenda" onClick={() => showDemoNotice('Agenda')}><CalendarDays size="0.875rem" /></button>} />{sessionSchedule.map((session) => <ScheduleRow key={`${session.time}-${session.title}`} className="physio-schedule" {...session} />)}</section><section className="physio-side-card"><SectionTitle className="physio-section-heading" title="Equipe envolvida" subtitle="Cuidado integrado" trailing action={<UsersRound size="0.9375rem" />} /><div className="physio-team-person"><span>CM</span><div><strong>Dr. Carlos Mendes</strong><small>Equipe médica</small></div><i /></div><div className="physio-team-person"><span className="team-teal">AB</span><div><strong>Ana Beatriz</strong><small>Enfermagem</small></div><i /></div></section><div className="physio-safety"><ShieldCheck size="1rem" /><p>Dados fictícios. Seguir sempre o plano definido pela equipe responsável.</p></div></aside>
      </div>
      <BottomNav className="physio-bottom-nav" items={[
        { label: 'Início', icon: <CalendarDays size="1.0625rem" />, active: true, onClick: () => changeTab('Resumo') },
        { label: 'Pacientes', icon: <UsersRound size="1.0625rem" />, active: activeTab === 'Resumo', onClick: () => changeTab('Resumo') },
        { label: 'Plano', icon: <ClipboardList size="1.0625rem" />, active: activeTab === 'Plano terapêutico', onClick: () => changeTab('Plano terapêutico') },
        { label: 'Avisos', icon: <Bell size="1.0625rem" />, active: activeTab === 'Pendências', onClick: () => changeTab('Pendências') },
        { label: 'Perfil', icon: <UserRound size="1.0625rem" />, onClick: onBack },
      ]} />
    </main>

      {modal === 'avaliacao' && (
        <AssessmentModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Fisioterapia"
          author="Juliana Martins"
          titlePlaceholder="Ex.: Avaliação funcional"
          scorePlaceholder="Ex.: mobilidade com auxílio"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Avaliação fisioterapêutica registrada para ' + activePatient.name + '.')}
        />
      )}

      {modal === 'plano' && (
        <CarePlanModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="fisioterapia"
          planLabel="Plano terapêutico"
          initialText={carePlan}
          author="Juliana Martins"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Plano terapêutico de ' + activePatient.name + ' atualizado.')}
        />
      )}

      {modal === 'evolucao' && (
        <EvolutionModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Fisioterapia"
          author="Juliana Martins"
          authorRole="Fisioterapeuta"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Evolução fisioterapêutica registrada para ' + activePatient.name + '.')}
        />
      )}
    </>
  )
}

type GoalProps = { title: string; progress: string }

function Goal({ title, progress }: GoalProps) {
  return <div className="physio-goal"><span><Check size="0.8125rem" /></span><div><strong>{title}</strong><small>{progress}</small></div></div>
}

type TherapyRowProps = { title: string; detail: string }

function TherapyRow({ title, detail }: TherapyRowProps) {
  return <article className="therapy-row"><span><Activity size="0.875rem" /></span><div><strong>{title}</strong><small>{detail}</small></div></article>
}

export default PhysiotherapyDashboard
