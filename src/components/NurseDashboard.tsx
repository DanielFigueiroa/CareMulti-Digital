import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  HeartPulse,
  House,
  Menu,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useNotice } from '../hooks/useNotice'
import { usePatientRecord } from '../hooks/usePatientRecord'
import { needsAttention, latestVitals, vitalsTrend } from '../data/patients'
import { careActions, nowTime } from '../store/actions'
import { classifyBloodPressure, classifyHeartRate, classifyRespiratoryRate, classifySpo2 } from '../store/vitals'
import { sessionUser } from '../data/session'
import { BottomNav } from './shared/BottomNav'
import { CareItemModal } from './shared/CareItemModal'
import { EvolutionModal } from './shared/EvolutionModal'
import { NoticeLine } from './shared/NoticeLine'
import { TabNav } from './shared/TabNav'
import { TimelineEntry } from './shared/TimelineEntry'
import VitalsForm from './shared/VitalsForm'
import Brand from './Brand'
import './NurseDashboard.css'

const patientTabs = ['Resumo', 'Sinais vitais', 'Cuidados', 'Medicamentos', 'Evolução'] as const
type PatientTab = (typeof patientTabs)[number]

type NurseDashboardProps = {
  role: string
  onBack: () => void
}

function NurseDashboard({ role, onBack }: NurseDashboardProps) {
  const [activeTab, setActiveTab] = useState<PatientTab>('Resumo')
  const [vitalsOpen, setVitalsOpen] = useState(false)
  const [careOpen, setCareOpen] = useState(false)
  const [evolutionOpen, setEvolutionOpen] = useState(false)
  const { activePatient, activePatientId, clinical, visiblePatients, counts, searchTerm, setSearchTerm, setActivePatientId, statusOf } =
    usePatientRecord('nurse')
  const activeVitals = latestVitals(activePatient)
  const { clearNotice, showDemoNotice, showNotice, notice } = useNotice('nurse')
  const careItems = clinical.careItems
  const evolutions = clinical.evolutions
  const medications = clinical.medications
  const user = sessionUser(role)

  const pendingCount = needsAttention(activePatient.status) ? 2 : 1
  const nextMedication = medications[0] ? `${medications[0].name} · ${medications[0].time}` : 'Nenhuma medicação programada'

  function changeTab(tab: PatientTab) {
    setActiveTab(tab)
    clearNotice()
  }

  function selectPatient(patientId: number) {
    setActivePatientId(patientId)
    clearNotice()
  }

  return (
    <>
    <main className="nurse-dashboard">
      <header className="nurse-topbar">
        <Brand compact onHome={onBack} />
        <div className="nurse-topbar-title"><span>Área profissional</span><strong>Enfermagem</strong></div>
        <button className="nurse-icon-button" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}>
          <Bell size="1.1875rem" aria-hidden="true" /><i>2</i>
        </button>
        <button className="nurse-icon-button mobile-menu" type="button" aria-label="Menu" onClick={onBack}>
          <Menu size="1.25rem" aria-hidden="true" />
        </button>
      </header>

      <div className="nurse-layout">
        <aside className="patient-sidebar">
          <div className="nurse-greeting">
            <div className="avatar-circle"><UserRound size="1.375rem" aria-hidden="true" /></div>
            <div><span>Bom dia,</span><strong>Ana Beatriz</strong><small>{role} · Equipe de cuidado</small></div>
          </div>
          <div className="shift-summary">
            <div><strong>{counts.total}</strong><span>Pacientes</span></div>
            <div><strong className="tone-red">{counts.attention}</strong><span>Atenção</span></div>
            <div><strong className="tone-green">{careItems.filter((item) => item.state === 'Realizado').length}</strong><span>Cuidados</span></div>
          </div>
          <label className="patient-search">
            <Search size="1.0625rem" aria-hidden="true" />
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Buscar paciente" />
          </label>
          <div className="sidebar-heading"><h2>Meus pacientes</h2><button type="button" onClick={() => setSearchTerm('')}>Ver todos</button></div>
          <div className="patient-list">
            {visiblePatients.map((patient) => (
              <button
                className={`patient-list-item${activePatientId === patient.id ? ' is-selected' : ''}`}
                type="button"
                key={patient.id}
                onClick={() => selectPatient(patient.id)}
              >
                <span className="patient-avatar"><UserRound size="1.125rem" aria-hidden="true" /></span>
                <span className="patient-list-copy"><strong>{patient.bed} · {patient.name}</strong><small>{patient.age} anos · {patient.diagnosis}</small><small>Última atualização: 10:42</small></span>
                <span className={`status-dot status-${statusOf(patient).toLowerCase()}`} aria-label={statusOf(patient)} />
              </button>
            ))}
            {visiblePatients.length === 0 && <p className="empty-search">Nenhum paciente encontrado.</p>}
          </div>
          <button className="sidebar-back" type="button" onClick={onBack}><ArrowRight size="1rem" className="back-arrow" /> Trocar perfil</button>
        </aside>

        <section className="patient-workspace" aria-label="Prontuário do paciente">
          <div className="patient-heading">
            <div>
              <span className="patient-bed-label">{activePatient.bed} <i>·</i> {activePatient.age} anos</span>
              <h1>{activePatient.name}</h1>
              <p>{activePatient.diagnosis}</p>
            </div>
            <span className={`patient-status status-label-${statusOf(activePatient).toLowerCase()}`}><span />{statusOf(activePatient)}</span>
          </div>

          <TabNav className="patient-tabs" ariaLabel="Seções do prontuário" tabs={patientTabs} activeTab={activeTab} onChange={changeTab} selectedClassName="is-active" iconFor={(tab) => tab === 'Sinais vitais' ? <Activity size="0.9375rem" aria-hidden="true" /> : undefined} />

          {activeTab === 'Resumo' && (
            <div className="patient-tab-content">
              <h2>Resumo do paciente</h2>
              <div className="summary-grid">
                <article className="summary-tile"><span><HeartPulse size="1.0625rem" /></span><small>Diagnóstico principal</small><strong>{activePatient.diagnosis}</strong></article>
                <article className="summary-tile"><span><ClipboardList size="1.0625rem" /></span><small>Comorbidades</small><strong>{activePatient.comorbidities}</strong></article>
                <article className="summary-tile"><span><Pill size="1.0625rem" /></span><small>Alergias</small><strong>{activePatient.allergies}</strong></article>
                <article className="summary-tile"><span><UsersRound size="1.0625rem" /></span><small>Admissão</small><strong>{activePatient.admittedAt}</strong></article>
              </div>
              <section className="critical-alert"><CircleAlert size="1.1875rem" /><div><strong>Atenção clínica</strong><p>SpO₂ {activeVitals.spo2}% registrado. Reavaliar conforme protocolo assistencial.</p></div><span>Agora</span></section>
              <section className="latest-vitals">
                <div className="section-title-row"><div><h3>Últimos sinais vitais</h3><p>Hoje, às 10:42</p></div><button type="button" onClick={() => changeTab('Sinais vitais')}>Ver histórico <ArrowRight size="0.9375rem" /></button></div>
                <div className="vitals-grid">
                  <div><span>Pressão arterial</span><strong>{activeVitals.bloodPressure} <small>mmHg</small></strong></div>
                  <div><span>Frequência cardíaca</span><strong>{activeVitals.heartRate} <small>bpm</small></strong></div>
                  <div><span>Temperatura</span><strong>{activeVitals.temperature} <small>°C</small></strong></div>
                  <div className="spo2-value"><span>SpO₂</span><strong>{activeVitals.spo2} <small>%</small></strong></div>
                </div>
              </section>
              {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
            </div>
          )}

          {activeTab === 'Sinais vitais' && (
            <div className="patient-tab-content">
              <div className="section-title-row"><div><h2>Evolução dos sinais vitais</h2><p>Registros do plantão de hoje</p></div><button className="primary-small" type="button" onClick={() => { clearNotice(); setVitalsOpen(true) }}><Activity size="0.9375rem" /> Registrar sinal</button></div>
              <div className="vitals-grid vitals-grid-large">
                <div><span>Pressão arterial</span><strong>{activeVitals.bloodPressure} <small>mmHg</small></strong><em className={`is-${classifyBloodPressure(activeVitals.bloodPressure).level}`}>{classifyBloodPressure(activeVitals.bloodPressure).label}</em></div>
                <div><span>Frequência cardíaca</span><strong>{activeVitals.heartRate} <small>bpm</small></strong><em className={`is-${classifyHeartRate(activeVitals.heartRate).level}`}>{classifyHeartRate(activeVitals.heartRate).label}</em></div>
                <div><span>Frequência respiratória</span><strong>{activeVitals.respiratoryRate} <small>irpm</small></strong><em className={`is-${classifyRespiratoryRate(activeVitals.respiratoryRate).level}`}>{classifyRespiratoryRate(activeVitals.respiratoryRate).label}</em></div>
                <div className="spo2-value"><span>Satauração de oxigênio (SpO₂)</span><strong>{activeVitals.spo2} <small>%</small></strong><em className={`is-${classifySpo2(activeVitals.spo2).level}`}>{classifySpo2(activeVitals.spo2).label}</em></div>
              </div>
              <section className="trend-panel"><div><h3>SpO₂ ao longo do plantão</h3><span>Meta assistencial: conforme prescrição</span></div><div className="trend-values">{vitalsTrend(activePatient).map((reading, index) => <span key={`${reading.recordedAt}-${index}`}>{reading.recordedAt} <b>{reading.spo2}%</b></span>)}</div></section>
              <section className="reading-history"><h3>Histórico de leituras</h3><div className="reading-history-list">{[...activePatient.vitals].reverse().map((reading, index) => <article key={`${reading.recordedAt}-${index}`}><header><strong>{reading.recordedAt}</strong><span className={`pill-${classifySpo2(reading.spo2).level}`}>{classifySpo2(reading.spo2).label}</span></header><dl><div><dt>PA</dt><dd>{reading.bloodPressure} mmHg</dd></div><div><dt>FC</dt><dd>{reading.heartRate} bpm</dd></div><div><dt>FR</dt><dd>{reading.respiratoryRate} irpm</dd></div><div><dt>Temp</dt><dd>{reading.temperature} °C</dd></div><div><dt>SpO₂</dt><dd>{reading.spo2}%</dd></div></dl><small>Registrado por {reading.recordedBy}</small></article>)}</div></section>
              {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
            </div>
          )}

          {activeTab === 'Cuidados' && (
            <div className="patient-tab-content">
              <div className="section-title-row"><div><h2>Cuidados de hoje</h2><p>Acompanhamento do plano assistencial</p></div><button className="primary-small" type="button" onClick={() => { clearNotice(); setCareOpen(true) }}><ClipboardList size="0.9375rem" /> Registrar cuidado</button></div>
              <div className="care-list">{careItems.map((item, index) => <CareItem key={`${item.title}-${index}`} {...item} onToggle={() => careActions.setCareItemState(activePatientId, item.title, item.state === 'Realizado' ? 'Pendente' : 'Realizado')} />)}</div>
              {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
            </div>
          )}

          {activeTab === 'Medicamentos' && (
            <div className="patient-tab-content">
              <div className="section-title-row"><div><h2>Medicamentos prescritos</h2><p>Administrações previstas para hoje</p></div><button className="primary-small" type="button" onClick={() => showDemoNotice('Administração')}><Pill size="0.9375rem" /> Registrar administração</button></div>
              <div className="medication-list">{medications.map((item) => <MedicationRow key={item.name} {...item} />)}</div>
              {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
            </div>
          )}

          {activeTab === 'Evolução' && (
            <div className="patient-tab-content">
              <div className="section-title-row"><div><h2>Evolução de enfermagem</h2><p>Registros recentes do cuidado</p></div><button className="primary-small" type="button" onClick={() => { clearNotice(); setEvolutionOpen(true) }}><ClipboardList size="0.9375rem" /> Nova evolução</button></div>
              {evolutions.map((evolution) => <TimelineEntry key={evolution.id} className="evolution-entry" time={`${evolution.time} · ${evolution.timeLabel}`} title={evolution.title} author={`${evolution.author} · ${evolution.authorRole}`}>{evolution.note}</TimelineEntry>)}
              {evolutions.length === 0 && <p className="empty-search">Nenhuma evolução registrada para este paciente.</p>}
              {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
            </div>
          )}
        </section>

        <aside className="shift-sidebar">
          <div className="shift-card"><span className="shift-icon"><Stethoscope size="1.125rem" /></span><div><small>Plantão atual</small><strong>07:00 – 19:00</strong></div><ChevronDown size="1rem" /></div>
          <section className="side-section"><div className="section-title-row"><h2>Pendências do paciente</h2><span className="pending-count">{pendingCount}</span></div><div className="pending-item"><span className="pending-mark mark-red" /><div><strong>Reavaliar SpO₂</strong><small>{activePatient.bed} · agora</small></div></div><div className="pending-item"><span className="pending-mark mark-yellow" /><div><strong>Medicação programada</strong><small>{nextMedication}</small></div></div></section>
          <section className="side-section"><div className="section-title-row"><h2>Próximo plantão</h2><button type="button" aria-label="Ver detalhes" onClick={() => showDemoNotice('Passagem de plantão')}><ArrowRight size="1rem" /></button></div><ul className="handoff-list"><li>Reavaliar saturação de oxigênio</li><li>Confirmar administração prescrita</li><li>Atualizar evolução do paciente</li></ul></section>
          <div className="safety-note"><Check size="1.0625rem" /><p>As informações exibidas são de demonstração.</p></div>
        </aside>
      </div>

      <BottomNav className="nurse-bottom-nav" items={[
        { label: 'Início', icon: <House size="1.125rem" />, active: true, onClick: () => changeTab('Resumo') },
        { label: 'Pacientes', icon: <UsersRound size="1.125rem" />, active: activeTab === 'Resumo', onClick: () => changeTab('Resumo') },
        { label: 'Evolução', icon: <ClipboardList size="1.125rem" />, active: activeTab === 'Evolução', onClick: () => changeTab('Evolução') },
        { label: 'Avisos', icon: <Bell size="1.125rem" />, active: false, onClick: () => showDemoNotice('Notificações') },
        { label: 'Perfil', icon: <UserRound size="1.125rem" />, onClick: onBack },
      ]} />
    </main>

      {vitalsOpen && (
        <VitalsForm
          initial={activeVitals}
          patientName={activePatient.name}
          author={user.name}
          nowTime={nowTime}
          onClose={() => setVitalsOpen(false)}
          onSubmit={(reading, recordedAt) => {
            careActions.recordVitals(activePatientId, reading, user.name, recordedAt)
            setVitalsOpen(false)
            setActiveTab('Sinais vitais')
            showNotice(`Leitura de ${recordedAt} registrada para ${activePatient.name}.`)
          }}
        />
      )}

      {careOpen && (
        <CareItemModal
          patientId={activePatientId}
          patientName={activePatient.name}
          defaultTime={nowTime()}
          onClose={() => setCareOpen(false)}
          onSaved={() => showNotice('Cuidado adicionado ao plano de ' + activePatient.name + '.')}
        />
      )}

      {evolutionOpen && (
        <EvolutionModal
          patientId={activePatientId}
          patientName={activePatient.name}
          area="Enfermagem"
          author={user.name}
          authorRole="Enfermagem"
          onClose={() => setEvolutionOpen(false)}
          onSaved={() => showNotice('Evolução de enfermagem registrada para ' + activePatient.name + '.')}
        />
      )}
    </>
  )
}

type CareItemProps = { title: string; time: string; state: string; onToggle: () => void }

function CareItem({ title, time, state, onToggle }: CareItemProps) {
  return <div className="care-row"><button className="care-check" type="button" onClick={onToggle} aria-label={`Alternar situação de ${title}`}><Check size="0.875rem" /></button><div><strong>{title}</strong><small>{time}</small></div><span className={`row-state state-${state.toLowerCase()}`}>{state}</span></div>
}

type MedicationRowProps = { name: string; dose: string; time: string; state: string }

function MedicationRow({ name, dose, time, state }: MedicationRowProps) {
  return <div className="medication-row"><span className="medication-icon"><Pill size="1.0625rem" /></span><div><strong>{name}</strong><small>{dose}</small></div><time>{time}</time><span className={`row-state state-${state.toLowerCase()}`}>{state}</span></div>
}

export default NurseDashboard
