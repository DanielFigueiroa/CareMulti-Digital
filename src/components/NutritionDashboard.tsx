import { useState } from 'react'
import {
  Apple,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  HeartPulse,
  Scale,
  Search,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useNotice } from '../hooks/useNotice'
import { usePatientRecord } from '../hooks/usePatientRecord'
import { meals, nutritionPendingItems as pendingItems } from '../data/clinical'
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
import './NutritionDashboard.css'

const nutritionTabs = ['Resumo', 'Avaliação', 'Dieta', 'Evolução', 'Pendências'] as const
type NutritionTab = (typeof nutritionTabs)[number]
type NutritionModal = 'avaliacao' | 'plano' | 'evolucao' | null

type NutritionDashboardProps = { onBack: () => void }

function NutritionDashboard({ onBack }: NutritionDashboardProps) {
  const [activeTab, setActiveTab] = useState<NutritionTab>('Resumo')
  const [modal, setModal] = useState<NutritionModal>(null)
  const { activePatient, activePatientId, clinical, visiblePatients, counts, searchTerm, setSearchTerm, setActivePatientId, statusOf } =
    usePatientRecord('nutrition')
  const { clearNotice, showDemoNotice, showNotice, notice } = useNotice('nutrition')
  const evolutions = clinical.evolutions
  const assessments = clinical.assessments['Nutrição']
  const carePlan = clinical.carePlans.nutricional

  function changeTab(tab: NutritionTab) {
    setActiveTab(tab)
    clearNotice()
  }

  function selectPatient(patientId: number) {
    setActivePatientId(patientId)
    clearNotice()
  }

  return (
    <>
    <main className="nutrition-dashboard">
      <header className="nutrition-topbar"><Brand compact onHome={onBack} /><span className="nutrition-role-label">Nutrição</span><button className="nutrition-notifications" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}><Bell size="1.125rem" /><i>1</i></button><button className="nutrition-profile" type="button" onClick={onBack}><span><UserRound size="1.125rem" /></span><span><strong>Carla Mendes</strong><small>Nutricionista</small></span><ChevronRight size="0.9375rem" /></button></header>

      <div className="nutrition-layout">
        <aside className="nutrition-sidebar"><div className="nutrition-greeting"><span><Apple size="1.25rem" /></span><div><small>Bom dia,</small><strong>Carla Mendes</strong><small>Nutricionista · Equipe de cuidado</small></div></div><div className="nutrition-counts"><div><strong>{counts.total}</strong><small>Em cuidado</small></div><div><strong>{counts.stable}</strong><small>Avaliados</small></div><div><strong>{counts.attention}</strong><small>Pendências</small></div></div><label className="nutrition-search"><Search size="0.9375rem" /><input placeholder="Buscar paciente" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label><div className="nutrition-list-heading"><h2>Seus pacientes</h2><button type="button" onClick={() => setSearchTerm('')}>Ver todos</button></div><div className="nutrition-patient-list">{visiblePatients.map((patient) => <PatientRow key={patient.id} patient={patient} selected={patient.id === activePatientId} onSelect={selectPatient} className="nutrition-patient-row" statusClassName="status-attention" iconSize="1.0625rem" secondary={patient.diagnosis} />)}{visiblePatients.length === 0 && <p className="nutrition-empty">Nenhum paciente encontrado.</p>}</div><button className="nutrition-back" type="button" onClick={onBack}><ArrowRight size="0.875rem" />Trocar perfil</button></aside>

        <section className="nutrition-record" aria-label="Acompanhamento nutricional"><div className="nutrition-record-heading"><div><span>{activePatient.bed} · {activePatient.age} anos</span><h1>{activePatient.name}</h1><p>{activePatient.diagnosis}</p></div><span className="nutrition-status"><i />{statusOf(activePatient)}</span></div>
          <TabNav className="nutrition-tabs" ariaLabel="Seções do acompanhamento nutricional" tabs={nutritionTabs} activeTab={activeTab} onChange={changeTab} iconFor={(tab) => tab === 'Avaliação' ? <Scale size="0.875rem" /> : undefined} badgeFor={() => pendingItems.length} />

          {activeTab === 'Resumo' && <div className="nutrition-tab-content"><h2>Resumo nutricional</h2><FactGrid className="nutrition-summary-grid"><FactCard className="nutrition-fact" icon={<Scale size="1rem" />} label="Peso atual" value="68,4 kg" /><FactCard className="nutrition-fact" icon={<HeartPulse size="1rem" />} label="IMC" value="24,2 kg/m²" /><FactCard className="nutrition-fact" icon={<Apple size="1rem" />} label="Dieta prescrita" value="Branda · hipossódica" /><FactCard className="nutrition-fact" icon={<CalendarDays size="1rem" />} label="Última avaliação" value="Hoje · 09:20" /></FactGrid><AlertBanner className="nutrition-alert" icon={<CircleAlert size="1.125rem" />} title="Atenção nutricional" trailing="Hoje">Aceitação alimentar parcial no último registro. Manter acompanhamento conforme plano de cuidado.</AlertBanner><section className="nutrition-plan-preview"><SectionTitle className="nutrition-section-title" title="Plano alimentar de hoje" subtitle="Orientações da equipe de nutrição" action={<button type="button" onClick={() => changeTab('Dieta')}>Ver plano <ChevronRight size="0.875rem" /></button>} /><div className="meal-preview"><span><Apple size="1rem" /></span><div><strong>Próxima refeição · Almoço</strong><small>13:00 · Dieta branda hipossódica</small></div><span className="meal-status">Programada</span></div></section><div className="nutrition-actions"><button type="button" onClick={() => changeTab('Avaliação')}><Scale size="0.9375rem" />Registrar avaliação <ArrowRight size="0.8125rem" /></button><button type="button" onClick={() => changeTab('Evolução')}><ClipboardList size="0.9375rem" />Nova evolução <ArrowRight size="0.8125rem" /></button></div></div>}

          {activeTab === 'Avaliação' && <div className="nutrition-tab-content"><SectionTitle className="nutrition-section-title" title="Avaliação nutricional" subtitle="Registro demonstrativo · hoje às 09:20" action={<button className="nutrition-action-button" type="button" onClick={() => { clearNotice(); setModal('avaliacao') }}><Scale size="0.875rem" />Nova avaliação</button>} /><FactGrid className="nutrition-summary-grid nutrition-assessment-grid"><FactCard className="nutrition-fact" icon={<Scale size="1rem" />} label="Peso" value="68,4 kg" /><FactCard className="nutrition-fact" icon={<HeartPulse size="1rem" />} label="Altura" value="1,68 m" /><FactCard className="nutrition-fact" icon={<HeartPulse size="1rem" />} label="IMC" value="24,2 kg/m²" /><FactCard className="nutrition-fact" icon={<Apple size="1rem" />} label="Aceitação da dieta" value="Parcial · 75%" /></FactGrid><section className="nutrition-note"><h3>Observação da avaliação</h3><p>Paciente orientada sobre o plano alimentar. Manter oferta de refeições conforme dieta prescrita e acompanhar aceitação.</p><small>Carla Mendes · Nutricionista</small></section><div className="nutrition-assessment-list">{assessments.map((assessment) => <article key={assessment.id} className="nutrition-note"><h3>{assessment.title}</h3><p>{assessment.detail}</p><small>{assessment.score} · {assessment.author}</small></article>)}</div></div>}

          {activeTab === 'Dieta' && <div className="nutrition-tab-content"><SectionTitle className="nutrition-section-title" title="Plano alimentar" subtitle="Dieta branda · hipossódica · via oral" action={<button className="nutrition-action-button" type="button" onClick={() => { clearNotice(); setModal('plano') }}><ClipboardList size="0.875rem" />Editar plano</button>} /><div className="meal-list">{meals.map((meal) => <Meal key={`${meal.time}-${meal.title}`} {...meal} />)}</div><div className="nutrition-note diet-note"><h3>Orientações da dieta</h3><p>{carePlan}</p><small>Atualizado pela equipe de nutrição</small></div></div>}

          {activeTab === 'Evolução' && <div className="nutrition-tab-content"><SectionTitle className="nutrition-section-title" title="Evolução nutricional" subtitle="Registros recentes do acompanhamento" action={<button className="nutrition-action-button" type="button" onClick={() => { clearNotice(); setModal('evolucao') }}><ClipboardList size="0.875rem" />Nova evolução</button>} />{evolutions.map((evolution) => <TimelineEntry key={evolution.id} className="nutrition-evolution" time={`${evolution.time} · ${evolution.timeLabel}`} title={evolution.title} author={`${evolution.author} · ${evolution.authorRole}`}>{evolution.note}</TimelineEntry>)}{evolutions.length === 0 && <p className="nutrition-empty">Nenhuma evolução registrada para este paciente.</p>}</div>}

          {activeTab === 'Pendências' && <div className="nutrition-tab-content"><SectionTitle className="nutrition-section-title" title="Pendências do acompanhamento" subtitle="Itens para revisar com a equipe" trailing action={<span className="nutrition-pending-count">{pendingItems.length}</span>} />{pendingItems.map((item) => <PendingRow key={item.title} className="nutrition-pending" markerClassName="nutrition-pending-marker" priorityClassName="nutrition-priority" {...item} />)}</div>}
          {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
        </section>

        <aside className="nutrition-side-panel"><section className="nutrition-side-card"><div className="nutrition-side-title"><span><Apple size="1rem" /></span><div><small>Meta nutricional</small><strong>Plano em acompanhamento</strong></div></div><div className="nutrition-progress"><div><span>Aceitação registrada</span><strong>75%</strong></div><i><b /></i><small>Último registro · hoje às 09:20</small></div></section><section className="nutrition-side-card"><SectionTitle className="nutrition-section-title" title="Próximas atividades" action={<button type="button" onClick={() => showDemoNotice('Agenda nutricional')} aria-label="Ver agenda"><ChevronRight size="0.875rem" /></button>} /><ScheduleRow className="nutrition-schedule" time="13:00" title="Acompanhar almoço" detail={activePatient.bed} /><ScheduleRow className="nutrition-schedule" time="16:00" title="Revisar aceitação" detail={activePatient.bed} /></section><section className="nutrition-side-card nutrition-team"><SectionTitle className="nutrition-section-title" title="Equipe multiprofissional" action={<button type="button" onClick={() => showDemoNotice('Equipe multiprofissional')} aria-label="Ver equipe"><UsersRound size="0.875rem" /></button>} /><p>Comunicação do cuidado coordenada com enfermagem e equipe médica.</p><span><Check size="0.875rem" />Plano compartilhado</span></section><div className="nutrition-safety"><HeartPulse size="1rem" /><p>Dados fictícios para demonstração. Não substituem uma avaliação nutricional.</p></div></aside>
      </div>
      <BottomNav className="nutrition-bottom-nav" items={[
        { label: 'Início', icon: <CalendarDays size="1.0625rem" />, active: true, onClick: () => changeTab('Resumo') },
        { label: 'Pacientes', icon: <UsersRound size="1.0625rem" />, active: activeTab === 'Resumo', onClick: () => changeTab('Resumo') },
        { label: 'Plano alimentar', icon: <Apple size="1.0625rem" />, active: activeTab === 'Dieta', onClick: () => changeTab('Dieta') },
        { label: 'Avisos', icon: <Bell size="1.0625rem" />, active: activeTab === 'Pendências', onClick: () => changeTab('Pendências') },
        { label: 'Perfil', icon: <UserRound size="1.0625rem" />, onClick: onBack },
      ]} />
    </main>

      {modal === 'avaliacao' && (
        <AssessmentModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Nutrição"
          author="Carla Mendes"
          titlePlaceholder="Ex.: Avaliação nutricional"
          scorePlaceholder="Ex.: 24,2 kg/m²"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Avaliação nutricional registrada para ' + activePatient.name + '.')}
        />
      )}

      {modal === 'plano' && (
        <CarePlanModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="nutricional"
          planLabel="Plano alimentar"
          initialText={carePlan}
          author="Carla Mendes"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Plano alimentar de ' + activePatient.name + ' atualizado.')}
        />
      )}

      {modal === 'evolucao' && (
        <EvolutionModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Nutrição"
          author="Carla Mendes"
          authorRole="Nutricionista"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Evolução nutricional registrada para ' + activePatient.name + '.')}
        />
      )}
    </>
  )
}

type MealProps = { time: string; title: string; detail: string }

function Meal({ time, title, detail }: MealProps) {
  return <article className="nutrition-meal"><time>{time}</time><span><Apple size="0.9375rem" /></span><div><strong>{title}</strong><small>{detail}</small></div><ChevronRight size="0.9375rem" /></article>
}

export default NutritionDashboard
