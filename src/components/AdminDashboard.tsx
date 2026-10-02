import { useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  FileBarChart,
  Search,
  ShieldCheck,
  Stethoscope,
  UserCog,
  UsersRound,
} from 'lucide-react'
import { patients } from '../data/patients'
import { professionals, weeklyAttendance } from '../data/clinical'
import { NoticeLine } from './shared/NoticeLine'
import { TabNav } from './shared/TabNav'
import { BottomNav } from './shared/BottomNav'
import Brand from './Brand'
import './AdminDashboard.css'

type BedState = 'Ocupado' | 'Disponível' | 'Limpeza'

type Bed = {
  code: string
  unit: string
  patient: string
  state: BedState
}

const units = ['Clínica médica', 'Recuperação'] as const

const unitCapacity: Record<(typeof units)[number], number> = {
  'Clínica médica': 16,
  Recuperação: 8,
}

function buildBeds(): Bed[] {
  const beds: Bed[] = []
  units.forEach((unit, unitIndex) => {
    for (let index = 1; index <= unitCapacity[unit]; index += 1) {
      const occupant = patients[beds.length]
      const state: BedState = occupant
        ? 'Ocupado'
        : beds.length % 7 === 0
          ? 'Limpeza'
          : 'Disponível'
      beds.push({
        code: `${unitIndex === 0 ? 'A' : 'B'}-${String(index).padStart(2, '0')}`,
        unit,
        patient: occupant ? occupant.name : '',
        state,
      })
    }
  })
  return beds
}

const beds = buildBeds()

const bedFilters = ['Todos', 'Ocupado', 'Disponível', 'Limpeza'] as const

const weeklyMax = Math.max(...weeklyAttendance.map((day) => day.value))

const adminTabs = ['Visão geral', 'Leitos', 'Equipe', 'Relatórios'] as const
type AdminTab = (typeof adminTabs)[number]

type AdminDashboardProps = { onBack: () => void }

function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('Visão geral')
  const [bedFilter, setBedFilter] = useState<(typeof bedFilters)[number]>('Todos')
  const [searchTerm, setSearchTerm] = useState('')
  const [notice, setNotice] = useState('')
  const noticeClassName = 'admin-notice'
  const visibleBeds = beds.filter((bed) => (bedFilter === 'Todos' || bed.state === bedFilter) && `${bed.code} ${bed.unit} ${bed.patient}`.toLowerCase().includes(searchTerm.toLowerCase()))
  const visibleProfessionals = professionals.filter((professional) => `${professional.name} ${professional.role} ${professional.unit}`.toLowerCase().includes(searchTerm.toLowerCase()))

  const occupiedBeds = beds.filter((bed) => bed.state === 'Ocupado').length
  const availableBeds = beds.filter((bed) => bed.state === 'Disponível').length
  const cleaningBeds = beds.filter((bed) => bed.state === 'Limpeza').length
  const totalBeds = beds.length
  const occupancyRate = Math.round((occupiedBeds / totalBeds) * 100)
  const activeProfessionals = professionals.filter((professional) => professional.state === 'Ativo').length
  const todayAttendance = weeklyAttendance.find((day) => day.day === 'Qua')!.value
  const totalPending = patients.filter((patient) => patient.status === 'Atenção' || patient.status === 'Prioridade').length
  const priorityPending = patients.filter((patient) => patient.status === 'Prioridade').length

  const unitOccupancy = units.map((unit) => {
    const unitBeds = beds.filter((bed) => bed.unit === unit)
    const unitOccupied = unitBeds.filter((bed) => bed.state === 'Ocupado').length
    return {
      unit,
      occupied: unitOccupied,
      total: unitBeds.length,
      rate: Math.round((unitOccupied / unitBeds.length) * 100),
    }
  })

  function changeTab(tab: AdminTab) {
    setActiveTab(tab)
    setNotice('')
    setSearchTerm('')
  }

  function showDemoNotice(action: string) {
    setNotice(`${action} é demonstrativo. Nenhum dado operacional foi alterado.`)
  }

  return (
    <main className="admin-dashboard">
      <header className="admin-topbar"><Brand compact onHome={onBack} /><span className="admin-role-label">Administração</span><button className="admin-notifications" type="button" aria-label="Notificações" onClick={() => showDemoNotice('Notificações')}><Bell size="1.125rem" /><i>3</i></button><button className="admin-profile" type="button" onClick={onBack}><span><UserCog size="1.125rem" /></span><span><strong>Rafael Costa</strong><small>Administrador</small></span><ChevronRight size="0.9375rem" /></button></header>

      <TabNav className="admin-tabs" ariaLabel="Seções da administração" tabs={adminTabs} activeTab={activeTab} onChange={changeTab} iconFor={tabIcon} />

      <div className="admin-content">
        {activeTab === 'Visão geral' && <section aria-labelledby="admin-overview-title"><div className="admin-welcome"><div><span className="admin-kicker">VISÃO OPERACIONAL · HOJE</span><h1 id="admin-overview-title">Bom dia, Rafael.</h1><p>Resumo da operação do CareMulti Digital.</p></div><button className="admin-period-button" type="button" onClick={() => showDemoNotice('Período atual')}>Hoje <ChevronRight size="0.875rem" /></button></div><div className="admin-metrics"><Metric icon={<CalendarDays size="1.0625rem" />} label="Atendimentos hoje" value={`${todayAttendance}`} change="↑ 12%" tone="teal" /><Metric icon={<UsersRound size="1.0625rem" />} label="Profissionais ativos" value={`${activeProfessionals} / ${professionals.length}`} change="4 áreas" tone="blue" /><Metric icon={<DoorOpen size="1.0625rem" />} label="Leitos ocupados" value={`${occupiedBeds} / ${totalBeds}`} change={`${occupancyRate}%`} tone="green" /><Metric icon={<ClipboardList size="1.0625rem" />} label="Pendências operacionais" value={String(totalPending)} change={`${priorityPending} prioritárias`} tone="yellow" /></div><div className="admin-overview-grid"><section className="admin-panel admin-occupancy-panel"><div className="admin-panel-heading"><div><h2>Ocupação de leitos</h2><p>Visão demonstrativa por unidade</p></div><button type="button" onClick={() => changeTab('Leitos')}>Ver leitos <ArrowRight size="0.875rem" /></button></div><div className="occupancy-summary"><div><strong>{occupancyRate}%</strong><span>ocupação geral</span></div><div className="occupancy-bar"><i style={{ width: `${occupancyRate}%` }} /></div><div className="occupancy-legend"><span><i className="legend-occupied" />{occupiedBeds} ocupados</span><span><i className="legend-free" />{availableBeds} disponíveis</span><span><i className="legend-cleaning" />{cleaningBeds} em limpeza</span></div></div><div className="unit-occupancy">{unitOccupancy.map(({ unit, occupied, total, rate }, index) => <div key={unit}><div><span>{unit}</span><strong>{occupied} / {total} <small>leitos</small></strong></div><div className={`unit-meter${index === 1 ? ' unit-blue' : ''}`}><i style={{ width: `${rate}%` }} /></div></div>)}</div></section><section className="admin-panel admin-activity-panel"><div className="admin-panel-heading"><div><h2>Atividade da semana</h2><p>Atendimentos registrados</p></div><Activity size="1rem" /></div><div className="admin-chart" aria-label="Gráfico demonstrativo da atividade semanal">{weeklyAttendance.map((day) => <div className="admin-chart-column" key={day.day}><i style={{ height: `${day.value}%` }} /><small>{day.day}</small></div>)}</div></section></div><div className="admin-lower-grid"><section className="admin-panel"><div className="admin-panel-heading"><div><h2>Alertas operacionais</h2><p>Itens para acompanhamento</p></div><span className="admin-alert-count">3</span></div><AdminAlert title="Leito aguardando higienização" detail="Unidade de recuperação · B-01" tone="yellow" /><AdminAlert title="Cadastro para revisar" detail="Recepção · 1 registro pendente" tone="blue" /><AdminAlert title="Cobertura de equipe" detail="Clínica médica · próximo plantão" tone="red" /></section><section className="admin-panel admin-team-panel"><div className="admin-panel-heading"><div><h2>Equipe por área</h2><p>Profissionais ativos na demonstração</p></div><button type="button" onClick={() => changeTab('Equipe')}>Ver equipe <ArrowRight size="0.875rem" /></button></div><div className="area-summary"><span><Stethoscope size="1rem" /></span><div><strong>Clínica médica</strong><small>8 profissionais</small></div><i>Ativa</i></div><div className="area-summary"><span><UsersRound size="1rem" /></span><div><strong>Equipe multiprofissional</strong><small>10 profissionais</small></div><i>Ativa</i></div><div className="area-summary"><span><Building2 size="1rem" /></span><div><strong>Recepção</strong><small>4 profissionais</small></div><i>Ativa</i></div></section></div>{notice && <NoticeLine className={noticeClassName}>{notice}</NoticeLine>}</section>}

        {activeTab === 'Leitos' && <section aria-labelledby="admin-beds-title"><div className="admin-welcome"><div><span className="admin-kicker">CAPACIDADE ASSISTENCIAL</span><h1 id="admin-beds-title">Leitos e ocupação</h1><p>Disponibilidade demonstrativa por unidade.</p></div><span className="beds-capacity"><Building2 size="1rem" />{totalBeds} leitos no total</span></div><div className="admin-filter-row"><label className="admin-search"><Search size="0.9375rem" /><input placeholder="Buscar leito, unidade ou paciente" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label><label className="admin-select-label">Status<select value={bedFilter} onChange={(event) => setBedFilter(event.target.value as (typeof bedFilters)[number])}>{bedFilters.map((filter) => <option key={filter}>{filter}</option>)}</select></label></div><div className="bed-grid">{visibleBeds.map((bed) => <article className="bed-card" key={bed.code}><div className="bed-card-heading"><span><Building2 size="1rem" /></span><strong>{bed.code}</strong><span className={`bed-state state-${bed.state.toLowerCase()}`}>{bed.state}</span></div><small>{bed.unit}</small><p>{bed.patient || 'Sem paciente vinculado'}</p><span className="demo-readonly"><ShieldCheck size="0.75rem" />Visualização demonstrativa</span></article>)}{visibleBeds.length === 0 && <p className="admin-empty">Nenhum leito encontrado.</p>}</div>{notice && <NoticeLine className={noticeClassName}>{notice}</NoticeLine>}</section>}

        {activeTab === 'Equipe' && <section aria-labelledby="admin-team-title"><div className="admin-welcome"><div><span className="admin-kicker">GESTÃO DE ACESSOS</span><h1 id="admin-team-title">Equipe e perfis</h1><p>Visão demonstrativa das áreas profissionais.</p></div><span className="team-capacity"><UsersRound size="1rem" />{professionals.length} profissionais</span></div><label className="admin-search team-search"><Search size="0.9375rem" /><input placeholder="Buscar nome, perfil ou área" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} /></label><div className="team-table"><div className="team-table-header"><span>Profissional</span><span>Perfil</span><span>Área</span><span>Status</span></div>{visibleProfessionals.map((professional) => <article className="team-table-row" key={professional.name}><span className="team-person"><i>{professional.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><strong>{professional.name}</strong></span><span>{professional.role}</span><span>{professional.unit}</span><span className="team-active"><i />{professional.state}</span></article>)}{visibleProfessionals.length === 0 && <p className="admin-empty">Nenhum profissional encontrado.</p>}</div>{notice && <NoticeLine className={noticeClassName}>{notice}</NoticeLine>}</section>}

        {activeTab === 'Relatórios' && <section aria-labelledby="admin-reports-title"><div className="admin-welcome"><div><span className="admin-kicker">ANÁLISE OPERACIONAL</span><h1 id="admin-reports-title">Relatórios</h1><p>Indicadores demonstrativos do período.</p></div><button className="admin-period-button" type="button" onClick={() => showDemoNotice('Período selecionado')}>Esta semana <ChevronRight size="0.875rem" /></button></div><div className="report-metrics"><ReportMetric label="Atendimentos na semana" value={String(weeklyAttendance.reduce((total, day) => total + day.value, 0))} detail="↑ 12% vs. período anterior" /><ReportMetric label="Taxa de ocupação" value={`${occupancyRate}%`} detail={`${occupiedBeds} de ${totalBeds} leitos`} /><ReportMetric label="Tempo médio de espera" value="18 min" detail="↓ 4 min vs. período anterior" /><ReportMetric label="Pendências" value={String(totalPending)} detail={`${priorityPending} prioritárias`} /></div><section className="admin-panel reports-chart-panel"><div className="admin-panel-heading"><div><h2>Atividade por dia</h2><p>Atendimentos registrados · últimos sete dias</p></div><button type="button" onClick={() => showDemoNotice('Exportação')}>Exportar <ArrowRight size="0.875rem" /></button></div><div className="admin-chart admin-chart-large" aria-label="Gráfico demonstrativo da atividade semanal">{weeklyAttendance.map((day) => <div className="admin-chart-column" key={day.day}><span>{day.value}</span><i style={{ height: `${(day.value / weeklyMax) * 100}%` }} /><small>{day.day}</small></div>)}</div></section>{notice && <NoticeLine className={noticeClassName}>{notice}</NoticeLine>}</section>}
      </div>

      <footer className="admin-footer"><ShieldCheck size="0.875rem" /><span>Indicadores fictícios para demonstração · Somente leitura</span></footer>
      <BottomNav className="admin-bottom-nav" items={[
        ...adminTabs.map((tab) => ({ label: tab === 'Visão geral' ? 'Início' : tab, icon: tabIcon(tab), active: activeTab === tab, onClick: () => changeTab(tab) })),
        { label: 'Perfil', icon: <UserCog size="1.0625rem" />, onClick: onBack },
      ]} />
    </main>
  )
}

function tabIcon(tab: AdminTab) {
  if (tab === 'Visão geral') return <BarChart3 size="0.9375rem" />
  if (tab === 'Leitos') return <Building2 size="0.9375rem" />
  if (tab === 'Equipe') return <UsersRound size="0.9375rem" />
  return <FileBarChart size="0.9375rem" />
}

type MetricProps = { icon: React.ReactNode; label: string; value: string; change: string; tone: string }

function Metric({ icon, label, value, change, tone }: MetricProps) {
  return <article className="admin-metric"><span className={`metric-icon metric-${tone}`}>{icon}</span><div><small>{label}</small><strong>{value}</strong></div><em>{change}</em></article>
}

type AdminAlertProps = { title: string; detail: string; tone: string }

function AdminAlert({ title, detail, tone }: AdminAlertProps) {
  return <article className="admin-alert-row"><span className={`alert-indicator alert-${tone}`} /><div><strong>{title}</strong><small>{detail}</small></div><ChevronRight size="0.9375rem" /></article>
}

type ReportMetricProps = { label: string; value: string; detail: string }

function ReportMetric({ label, value, detail }: ReportMetricProps) {
  return <article className="report-metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

export default AdminDashboard