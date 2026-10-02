import { useState } from 'react'
import {
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Heart,
  HeartPulse,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useNotice } from '../hooks/useNotice'
import { usePatientRecord } from '../hooks/usePatientRecord'
import {
  careActions,
  careGoals,
  daySchedule,
  planInterventions,
  psychologyPendingItems as pendingItems,
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
import { CarePlanModal } from './shared/CarePlanModal'
import { EvolutionModal } from './shared/EvolutionModal'
import Brand from './Brand'
import './PsychologyDashboard.css'

const psychologyTabs = ['Resumo', 'Evolução', 'Cuidados', 'Plano terapêutico', 'Pendências'] as const
type PsychologyTab = (typeof psychologyTabs)[number]
type PsychologyModal = 'plano' | 'evolucao' | null

type PsychologyDashboardProps = { onBack: () => void }

function PsychologyDashboard({ onBack }: PsychologyDashboardProps) {
  const [activeTab, setActiveTab] = useState<PsychologyTab>('Resumo')
  const [modal, setModal] = useState<PsychologyModal>(null)
  const { activePatient, activePatientId, clinical, visiblePatients, counts, searchTerm, setSearchTerm, setActivePatientId, statusOf } =
    usePatientRecord('psychology')
  const { clearNotice, showDemoNotice, showNotice, notice } = useNotice('psychology')
  const evolutions = clinical.evolutions
  const carePlan = clinical.carePlans.psicologia

  function changeTab(tab: PsychologyTab) {
    setActiveTab(tab)
    clearNotice()
  }

  function selectPatient(patientId: number) {
    setActivePatientId(patientId)
    clearNotice()
  }

  return (
    <>
    <main className="psychology-dashboard">
      <header className="psychology-topbar"><Brand compact onHome={onBack} /><span className="psychology-role-label">Psicologia</span><button className="psychology-notifications" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}><Bell size="1.125rem" /><i>1</i></button><button className="psychology-profile" type="button" onClick={onBack}><span><UserRound size="1.125rem" /></span><span><strong>Dra. Luiza Mendes</strong><small>Psicóloga</small></span><ChevronRight size="0.9375rem" /></button></header>

      <div className="psychology-layout">
        <aside className="psychology-sidebar"><div className="psychology-greeting"><span><Heart size="1.1875rem" /></span><div><small>Bom dia,</small><strong>Dra. Luiza Mendes</strong><small>Psicologia · Equipe de cuidado</small></div></div><div className="psychology-stats"><div><strong>{counts.total}</strong><small>Pacientes</small></div><div><strong>{daySchedule.length}</strong><small>Atendimentos</small></div><div><strong>{pendingItems.length}</strong><small>Pendências</small></div></div><label className="psychology-search"><Search size="0.9375rem" /><input placeholder="Buscar paciente" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label><div className="psychology-list-heading"><h2>Seus pacientes</h2><button type="button" onClick={() => setSearchTerm('')}>Ver todos</button></div><div className="psychology-patient-list">{visiblePatients.map((patient) => <PatientRow key={patient.id} patient={patient} selected={patient.id === activePatientId} onSelect={selectPatient} className="psychology-patient-row" statusClassName="psychology-status-attention" iconSize="1rem" secondary={patient.focus} />)}{visiblePatients.length === 0 && <p className="psychology-empty">Nenhum paciente encontrado.</p>}</div><button className="psychology-back" type="button" onClick={onBack}><ArrowRight size="0.875rem" />Trocar perfil</button></aside>

        <section className="psychology-record" aria-label="Acompanhamento psicológico"><div className="psychology-record-heading"><div><span>{activePatient.bed} · {activePatient.age} anos</span><h1>{activePatient.name}</h1><p>{activePatient.focus}</p></div><span className="psychology-record-status"><i />{statusOf(activePatient)}</span></div>
          <TabNav className="psychology-tabs" ariaLabel="Seções de psicologia" tabs={psychologyTabs} activeTab={activeTab} onChange={changeTab} iconFor={(tab) => tab === 'Cuidados' ? <HeartPulse size="0.8125rem" /> : undefined} badgeFor={(tab) => tab === 'Pendências' ? pendingItems.length : undefined} />

          {activeTab === 'Resumo' && <div className="psychology-tab-content"><h2>Resumo do acompanhamento</h2><FactGrid className="psychology-facts"><FactCard className="psychology-fact" icon={<HeartPulse size="1rem" />} label="Acompanhamento" value="Em andamento" /><FactCard className="psychology-fact" icon={<CalendarDays size="1rem" />} label="Última sessão" value="Hoje · 09:30" /><FactCard className="psychology-fact" icon={<ClipboardList size="1rem" />} label="Plano terapêutico" value="Ativo" /><FactCard className="psychology-fact" icon={<UsersRound size="1rem" />} label="Equipe envolvida" value="Multiprofissional" /></FactGrid><AlertBanner className="psychology-alert" icon={<CircleAlert size="1.0625rem" />} title="Atenção ao bem-estar">Acompanhamento em curso. Manter acolhimento e reavaliar conforme a evolução compartilhada pela equipe.</AlertBanner><section className="psychology-objectives"><SectionTitle className="psychology-section-heading" title="Objetivos de cuidado" subtitle={`Plano demonstrativo de ${activePatient.name}`} action={<button type="button" onClick={() => changeTab('Plano terapêutico')}>Ver plano <ChevronRight size="0.875rem" /></button>} />{careGoals.slice(0, 2).map((goal) => <Objective key={goal.title} {...goal} />)}</section><div className="psychology-actions"><button type="button" onClick={() => changeTab('Evolução')}><ClipboardList size="0.875rem" />Registrar evolução <ArrowRight size="0.8125rem" /></button><button type="button" onClick={() => changeTab('Cuidados')}><HeartPulse size="0.875rem" />Ver cuidados <ArrowRight size="0.8125rem" /></button></div></div>}

          {activeTab === 'Evolução' && <div className="psychology-tab-content"><SectionTitle className="psychology-section-heading" title="Evolução psicológica" subtitle="Registros recentes do acompanhamento" action={<button className="psychology-action-button" type="button" onClick={() => { clearNotice(); setModal('evolucao') }}><ClipboardList size="0.875rem" />Nova evolução</button>} />{evolutions.map((evolution) => <TimelineEntry key={evolution.id} className="psychology-entry" time={`${evolution.time} · ${evolution.timeLabel}`} title={evolution.title} author={`${evolution.author} · ${evolution.authorRole}`}>{evolution.note}</TimelineEntry>)}{evolutions.length === 0 && <p className="psychology-empty">Nenhuma evolução registrada para este paciente.</p>}</div>}

          {activeTab === 'Cuidados' && <div className="psychology-tab-content"><SectionTitle className="psychology-section-heading" title="Cuidados e orientações" subtitle="Ações do acompanhamento multiprofissional" action={<button className="psychology-action-button" type="button" onClick={() => showDemoNotice('Novo cuidado')}><HeartPulse size="0.875rem" />Adicionar cuidado</button>} />{careActions.map((care) => <CareRow key={care.title} {...care} />)}<div className="psychology-privacy"><ShieldCheck size="1rem" /><p>Registros de saúde mental devem ser tratados com confidencialidade e acesso adequado à equipe.</p></div></div>}

          {activeTab === 'Plano terapêutico' && <div className="psychology-tab-content"><SectionTitle className="psychology-section-heading" title="Plano terapêutico" subtitle="Objetivos e intervenções do acompanhamento" action={<button className="psychology-action-button" type="button" onClick={() => { clearNotice(); setModal('plano') }}><ClipboardList size="0.875rem" />Editar plano</button>} /><section className="psychology-plan-section"><h3>Objetivos</h3>{careGoals.map((goal) => <Objective key={goal.title} {...goal} />)}</section><section className="psychology-plan-section"><h3>Intervenções</h3>{planInterventions.map((care) => <CareRow key={care.title} {...care} />)}</section><section className="psychology-plan-section"><h3>Plano registrado</h3><p>{carePlan}</p></section><div className="psychology-frequency"><CalendarDays size="0.9375rem" /><span>Frequência</span><strong>Conforme plano individual de cuidado</strong></div></div>}

          {activeTab === 'Pendências' && <div className="psychology-tab-content"><SectionTitle className="psychology-section-heading" title="Pendências do acompanhamento" subtitle="Próximos passos de cuidado" trailing action={<span className="psychology-pending-count">{pendingItems.length}</span>} />{pendingItems.map((item) => <PendingRow key={item.title} className="psychology-pending" {...item} />)}</div>}
          {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
        </section>

        <aside className="psychology-side-panel"><section className="psychology-side-card"><div className="psychology-side-heading"><span><Heart size="1rem" /></span><div><small>Acompanhamento atual</small><strong>Cuidado em andamento</strong></div></div><div className="psychology-progress"><div><span>Objetivos acompanhados</span><strong>2 de {careGoals.length}</strong></div><i><b /></i><small>Revisão conforme avaliação profissional</small></div></section><section className="psychology-side-card"><SectionTitle className="psychology-section-heading" title="Agenda de hoje" subtitle="Próximos atendimentos" action={<button type="button" aria-label="Ver agenda" onClick={() => showDemoNotice('Agenda')}><CalendarDays size="0.875rem" /></button>} />{daySchedule.map((item) => <ScheduleRow key={item.time} className="psychology-schedule" time={item.time} title={item.title} detail={item.detail} />)}</section><section className="psychology-side-card"><SectionTitle className="psychology-section-heading" title="Equipe multiprofissional" action={<button type="button" aria-label="Ver equipe" onClick={() => showDemoNotice('Equipe multiprofissional')}><UsersRound size="0.875rem" /></button>} /><p className="psychology-team-copy">Acompanhamento compartilhado conforme plano assistencial e necessidade do paciente.</p><span className="psychology-team-status"><Check size="0.8125rem" />Plano ativo</span></section><div className="psychology-safety"><ShieldCheck size="1rem" /><p>Dados fictícios. Respeite a privacidade e o sigilo profissional.</p></div></aside>
      </div>
      <BottomNav className="psychology-bottom-nav" items={[
        { label: 'Início', icon: <CalendarDays size="1.0625rem" />, active: true, onClick: () => changeTab('Resumo') },
        { label: 'Pacientes', icon: <UsersRound size="1.0625rem" />, active: activeTab === 'Resumo', onClick: () => changeTab('Resumo') },
        { label: 'Agenda', icon: <CalendarDays size="1.0625rem" />, active: false, onClick: () => showDemoNotice('Agenda') },
        { label: 'Pendências', icon: <Bell size="1.0625rem" />, active: activeTab === 'Pendências', onClick: () => changeTab('Pendências') },
        { label: 'Perfil', icon: <UserRound size="1.0625rem" />, onClick: onBack },
      ]} />
    </main>

      {modal === 'evolucao' && (
        <EvolutionModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Psicologia"
          author="Dra. Luiza Mendes"
          authorRole="Psicóloga"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Evolução psicológica registrada para ' + activePatient.name + '.')}
        />
      )}

      {modal === 'plano' && (
        <CarePlanModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="psicologia"
          planLabel="Plano terapêutico"
          initialText={carePlan}
          author="Dra. Luiza Mendes"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Plano terapêutico de ' + activePatient.name + ' atualizado.')}
        />
      )}
    </>
  )
}

type ObjectiveProps = { title: string; state: string }

function Objective({ title, state }: ObjectiveProps) {
  return <article className="psychology-objective"><span><Check size="0.8125rem" /></span><div><strong>{title}</strong><small>{state}</small></div></article>
}

type CareRowProps = { title: string; detail: string; status: string }

function CareRow({ title, detail, status }: CareRowProps) {
  return <article className="psychology-care"><span><HeartPulse size="0.9375rem" /></span><div><strong>{title}</strong><small>{detail}</small></div><em>{status}</em></article>
}

export default PsychologyDashboard
