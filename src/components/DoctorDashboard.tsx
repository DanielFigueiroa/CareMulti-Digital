import { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  FileText,
  FlaskConical,
  HeartPulse,
  Pill,
  Search,
  Stethoscope,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { useNotice } from '../hooks/useNotice'
import { usePatientRecord } from '../hooks/usePatientRecord'
import { careTeam } from '../data/clinical'
import { type Patient, type PatientStatus, latestVitals } from '../data/patients'
import { careActions } from '../store/actions'
import { AlertBanner } from './shared/AlertBanner'
import { BottomNav } from './shared/BottomNav'
import { EvolutionModal } from './shared/EvolutionModal'
import { ExamModal } from './shared/ExamModal'
import { FactCard, FactGrid } from './shared/FactCard'
import { NoticeLine } from './shared/NoticeLine'
import { PrescriptionModal } from './shared/PrescriptionModal'
import { SectionTitle } from './shared/SectionTitle'
import { TabNav } from './shared/TabNav'
import { TimelineEntry } from './shared/TimelineEntry'
import VitalsHistory from './shared/VitalsHistory'
import Brand from './Brand'
import './DoctorDashboard.css'

const doctorTabs = ['Resumo', 'Evolução', 'Prescrição', 'Exames', 'Equipe'] as const
type DoctorTab = (typeof doctorTabs)[number]

const statusOptions: PatientStatus[] = ['Estável', 'Acompanhamento', 'Atenção', 'Prioridade']

type DoctorDashboardProps = { onBack: () => void }

type PendingModal = 'evolucao' | 'prescricao' | 'exame' | null

function DoctorDashboard({ onBack }: DoctorDashboardProps) {
  const [activeTab, setActiveTab] = useState<DoctorTab>('Resumo')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [modal, setModal] = useState<PendingModal>(null)
  const { activePatient, activePatientId, visiblePatients, counts, searchTerm, setSearchTerm, setActivePatientId, statusOf, clinical } =
    usePatientRecord('doctor')
  const activeVitals = latestVitals(activePatient)
  const { clearNotice, showNotice, showDemoNotice, notice } = useNotice('doctor')
  const evolutions = clinical.evolutions
  const prescriptions = clinical.prescriptions
  const examRequests = clinical.examRequests
  const pendingExams = examRequests.filter((request) => request.status === 'Solicitado').length

  function changeTab(tab: DoctorTab) {
    setActiveTab(tab)
    clearNotice()
  }

  function selectPatient(patientId: number) {
    setActivePatientId(patientId)
    clearNotice()
  }

  function changeStatus(status: PatientStatus) {
    careActions.updatePatientStatus(activePatientId, status)
    showNotice(`Status de ${activePatient.name} atualizado para ${status}.`)
  }

  return (
    <>
    <main className="doctor-dashboard">
      <header className="doctor-topbar"><Brand compact onHome={onBack} /><span className="doctor-role-label">Área médica</span><button className="doctor-notifications" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}><Bell size="1.1875rem" /><i>2</i></button><button className="doctor-profile" type="button" onClick={onBack}><span><UserRound size="1.125rem" /></span><span><strong>Dr. Carlos Mendes</strong><small>Médico</small></span><ChevronRight size="1rem" /></button></header>

      <div className="doctor-layout">
        <aside className="doctor-patient-sidebar">
          <div className="doctor-greeting"><span className="doctor-avatar"><Stethoscope size="1.25rem" /></span><div><small>Bom dia,</small><strong>Dr. Carlos</strong><span>Clínica médica</span></div></div>
          <div className="doctor-overview-counts"><div><strong>{counts.total}</strong><span>Pacientes</span></div><div><strong>{counts.attention}</strong><span>Atenção</span></div><div><strong>{counts.stable}</strong><span>Estáveis</span></div></div>
          <label className="doctor-search"><Search size="1rem" /><input placeholder="Buscar paciente" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label>
          <div className="doctor-list-heading"><h2>Meus pacientes</h2><span>{visiblePatients.length} de {counts.total}</span></div>
          <div className="doctor-patient-list">{visiblePatients.map((patient) => <PatientRow key={patient.id} patient={patient} selected={patient.id === activePatientId} status={statusOf(patient)} onSelect={selectPatient} />)}</div>
          <button className="doctor-back-button" type="button" onClick={onBack}><ArrowRight size="0.9375rem" /> Trocar perfil</button>
        </aside>

        <section className="doctor-record" aria-label="Prontuário médico">
          <div className="doctor-record-heading"><div><span>{activePatient.bed} · {activePatient.age} anos</span><h1>{activePatient.name}</h1><p>{activePatient.diagnosis}</p></div><span className="doctor-record-status"><i />{statusOf(activePatient)}</span><label className="doctor-status-control"><span>Atualizar status</span><select value={activePatient.status} onChange={(event) => changeStatus(event.target.value as PatientStatus)}>{statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div>
          <TabNav
            className="doctor-tabs"
            ariaLabel="Seções do prontuário"
            tabs={doctorTabs}
            activeTab={activeTab}
            onChange={changeTab}
            iconFor={(tab) => tab === 'Exames' ? <FlaskConical size="0.875rem" /> : undefined}
            badgeFor={(tab) => tab === 'Exames' ? pendingExams || undefined : undefined}
            badgeClassName="exam-count"
          />

          {activeTab === 'Resumo' && <div className="doctor-tab-content"><h2>Resumo do paciente</h2><FactGrid className="doctor-facts"><FactCard className="doctor-fact" icon={<HeartPulse size="1rem" />} label="Diagnóstico principal" value={activePatient.diagnosis} /><FactCard className="doctor-fact" icon={<Activity size="1rem" />} label="Comorbidades" value={activePatient.comorbidities} /><FactCard className="doctor-fact" icon={<AlertTriangle size="1rem" />} label="Alergias" value={activePatient.allergies} /><FactCard className="doctor-fact" icon={<CalendarDays size="1rem" />} label="Data de internação" value={activePatient.admittedAt} /></FactGrid><AlertBanner className="doctor-alert" icon={<AlertTriangle size="1.125rem" />} title="Alerta clínico" trailing="10:42">SpO₂ {activeVitals.spo2}% em ar ambiente. Acompanhar evolução e reavaliar conforme protocolo clínico.</AlertBanner><div className="doctor-vital-row"><SectionTitle className="doctor-section-title" title="Últimos sinais vitais" subtitle="Registrados hoje às 10:42" action={<button type="button" onClick={() => { clearNotice(); setHistoryOpen(true) }}>Ver histórico <ChevronRight size="0.875rem" /></button>} /><div className="doctor-vitals"><Vital label="Pressão arterial" value={activeVitals.bloodPressure} unit="mmHg" /><Vital label="Frequência cardíaca" value={String(activeVitals.heartRate)} unit="bpm" /><Vital label="Frequência respiratória" value={String(activeVitals.respiratoryRate)} unit="irpm" /><Vital label="SpO₂" value={String(activeVitals.spo2)} unit="%" highlighted /></div></div><div className="doctor-shortcuts"><button type="button" onClick={() => changeTab('Evolução')}><ClipboardList size="1rem" />Nova evolução <ArrowRight size="0.875rem" /></button><button type="button" onClick={() => changeTab('Prescrição')}><Pill size="1rem" />Prescrever medicamento <ArrowRight size="0.875rem" /></button></div></div>}

          {activeTab === 'Evolução' && <div className="doctor-tab-content"><SectionTitle className="doctor-section-title" title="Evolução clínica" subtitle="Registros recentes da equipe assistencial" action={<button className="doctor-primary-action" type="button" onClick={() => setModal('evolucao')}><FileText size="0.9375rem" />Nova evolução</button>} /><div className="doctor-evolution-list">{evolutions.map((evolution) => <TimelineEntry key={evolution.id} className="doctor-evolution-entry" time={`${evolution.time} · ${evolution.timeLabel}`} title={evolution.title} author={`${evolution.author} · ${evolution.authorRole}`}>{evolution.note}</TimelineEntry>)}{evolutions.length === 0 && <p className="reception-empty">Nenhuma evolução registrada para este paciente.</p>}</div></div>}

          {activeTab === 'Prescrição' && <div className="doctor-tab-content"><SectionTitle className="doctor-section-title" title="Prescrição atual" subtitle="Plano terapêutico registrado pela equipe médica" action={<button className="doctor-primary-action" type="button" onClick={() => setModal('prescricao')}><Pill size="0.9375rem" />Nova prescrição</button>} /><div className="prescription-list">{prescriptions.map((prescription) => <Prescription key={prescription.id} name={prescription.drug} detail={`${prescription.dose} · ${prescription.route} · ${prescription.frequency}`} schedule={`${prescription.time} · ${prescription.status}`} />)}{prescriptions.length === 0 && <p className="reception-empty">Nenhuma prescrição ativa para este paciente.</p>}</div><div className="doctor-diet-note"><strong>Orientação nutricional</strong><span>Dieta conforme avaliação da equipe de nutrição.</span></div></div>}

          {activeTab === 'Exames' && <div className="doctor-tab-content"><SectionTitle className="doctor-section-title" title="Exames solicitados" subtitle="Pedidos e resultados do paciente" action={<button className="doctor-primary-action" type="button" onClick={() => setModal('exame')}><FlaskConical size="0.9375rem" />Solicitar exame</button>} /><div className="exam-list">{examRequests.map((request) => <Exam key={request.id} name={request.exam} date={`${request.time} · ${request.urgency}`} status={request.status} />)}{examRequests.length === 0 && <p className="reception-empty">Nenhum exame solicitado para este paciente.</p>}</div></div>}

          {activeTab === 'Equipe' && <div className="doctor-tab-content"><SectionTitle className="doctor-section-title" title="Equipe multiprofissional" subtitle={`Profissionais envolvidos no cuidado de ${activePatient.name}`} /><div className="doctor-team-list">{careTeam.map((member) => <Team key={member.name} {...member} />)}</div></div>}
          {notice.message && <NoticeLine className={notice.className}>{notice.message}</NoticeLine>}
        </section>

        <aside className="doctor-side-panel"><section className="doctor-side-card"><div className="doctor-side-heading"><h2>Prioridades</h2><span className="priority-count">{counts.attention}</span></div><div className="doctor-priority"><span className="priority-marker marker-high" /><div><strong>Reavaliar SpO₂</strong><small>{activePatient.bed} · agora</small></div></div><div className="doctor-priority"><span className="priority-marker marker-medium" /><div><strong>Revisar exame</strong><small>Hemograma · disponível</small></div></div></section><section className="doctor-side-card"><div className="doctor-side-heading"><h2>Atividade recente</h2><button type="button" onClick={() => changeTab('Evolução')}>Ver tudo <ChevronRight size="0.8125rem" /></button></div><div className="recent-activity"><span><ClipboardList size="0.9375rem" /></span><div><strong>Nova evolução</strong><small>Enfermagem · 10:42</small></div></div><div className="recent-activity"><span><FlaskConical size="0.9375rem" /></span><div><strong>Resultado de exame</strong><small>Hemograma · 09:15</small></div></div></section><section className="doctor-safety"><HeartPulse size="1.125rem" /><p>Dados fictícios para demonstração. Não representam um prontuário real.</p></section></aside>
      </div>
      <BottomNav
        className="doctor-bottom-nav"
        items={[
          { label: 'Início', icon: <CalendarDays size="1.0625rem" />, active: true, onClick: () => changeTab('Resumo') },
          { label: 'Pacientes', icon: <UsersRound size="1.0625rem" />, active: activeTab === 'Resumo', onClick: () => changeTab('Resumo') },
          { label: 'Prescrições', icon: <Pill size="1.0625rem" />, active: activeTab === 'Prescrição', onClick: () => changeTab('Prescrição') },
          { label: 'Exames', icon: <FlaskConical size="1.0625rem" />, active: activeTab === 'Exames', onClick: () => changeTab('Exames') },
          { label: 'Perfil', icon: <UserRound size="1.0625rem" />, onClick: onBack },
        ]}
      />
    </main>

      {historyOpen && (
        <VitalsHistory readings={activePatient.vitals} patientName={activePatient.name} onClose={() => setHistoryOpen(false)} />
      )}

      {modal === 'evolucao' && (
        <EvolutionModal
          patientId={activePatient.id}
          patientName={activePatient.name}
          area="Médico"
          author="Dr. Carlos Mendes"
          authorRole="Médico"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Evolução registrada no prontuário de ' + activePatient.name + '.')}
        />
      )}

      {modal === 'prescricao' && (
        <PrescriptionModal
          patientId={activePatient.id}
          patientName={activePatient.name}
          author="Dr. Carlos Mendes"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Prescrição registrada na rotina de ' + activePatient.name + '.')}
        />
      )}

      {modal === 'exame' && (
        <ExamModal
          patientId={activePatient.id}
          patientName={activePatient.name}
          requestedBy="Dr. Carlos Mendes"
          onClose={() => setModal(null)}
          onSaved={() => showNotice('Exame solicitado para ' + activePatient.name + '.')}
        />
      )}
    </>
  )
}

type PatientRowProps = { patient: Patient; selected: boolean; status: string; onSelect: (id: number) => void }

function PatientRow({ patient, selected, status, onSelect }: PatientRowProps) {
  const dotClass = patient.status === 'Atenção' ? 'dot-attention' : patient.status === 'Prioridade' ? 'dot-priority' : ''
  return (
    <button type="button" className={`doctor-patient-row${selected ? ' selected' : ''}`} onClick={() => onSelect(patient.id)}>
      <span className="doctor-patient-avatar"><UserRound size="1.0625rem" /></span>
      <span><strong>{patient.bed} · {patient.name}</strong><small>{patient.age} anos · {patient.diagnosis}</small></span>
      <i className={`doctor-status-dot ${dotClass}`} aria-label={status} />
    </button>
  )
}

type VitalProps = { label: string; value: string; unit: string; highlighted?: boolean }

function Vital({ label, value, unit, highlighted = false }: VitalProps) {
  return <div className={`doctor-vital${highlighted ? ' vital-highlight' : ''}`}><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>
}

type PrescriptionProps = { name: string; detail: string; schedule: string }

function Prescription({ name, detail, schedule }: PrescriptionProps) {
  return <article className="prescription-row"><span><Pill size="1.0625rem" /></span><div><strong>{name}</strong><small>{detail}</small></div><em>{schedule}</em></article>
}

type ExamProps = { name: string; date: string; status: string }

function Exam({ name, date, status }: ExamProps) {
  return <article className="exam-row"><span><FlaskConical size="1.0625rem" /></span><div><strong>{name}</strong><small>{date}</small></div><em className={status === 'Solicitado' ? 'exam-pending' : ''}>{status}</em><ChevronRight size="0.9375rem" /></article>
}

type TeamProps = { name: string; role: string; initials: string }

function Team({ name, role, initials }: TeamProps) {
  return <article className="doctor-team-person"><span>{initials}</span><div><strong>{name}</strong><small>{role}</small></div><i /></article>
}

export default DoctorDashboard
