import { lazy, Suspense, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  ClipboardPlus,
  HeartHandshake,
  HeartPulse,
  LockKeyhole,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import Brand from './components/Brand'
import { professionalRoles as sessionRoles } from './data/session'

/**
 * Cada painel entra em um pedaço próprio do bundle. Como o usuário só acessa um
 * perfil por sessão, isso evita baixar os oito de uma vez.
 */
const AdminDashboard = lazy(() => import('./components/AdminDashboard'))
const DoctorDashboard = lazy(() => import('./components/DoctorDashboard'))
const NurseDashboard = lazy(() => import('./components/NurseDashboard'))
const NutritionDashboard = lazy(() => import('./components/NutritionDashboard'))
const PatientDashboard = lazy(() => import('./components/PatientDashboard'))
const PhysiotherapyDashboard = lazy(() => import('./components/PhysiotherapyDashboard'))
const PsychologyDashboard = lazy(() => import('./components/PsychologyDashboard'))
const ReceptionDashboard = lazy(() => import('./components/ReceptionDashboard'))

const roleIcons: Record<string, typeof Stethoscope> = {
  'Médico': Stethoscope,
  'Enfermeiro': ClipboardPlus,
  'Técnico de Enfermagem': UserRound,
  'Nutrição': HeartHandshake,
  'Administração': ClipboardPlus,
  'Fisioterapeuta': UserRound,
  'Psicólogo': HeartPulse,
  'Recepcionista': UserRound,
}

const professionalRoles = sessionRoles.map(({ role }) => ({ name: role, icon: roleIcons[role] ?? Stethoscope }))

type AccessView = 'home' | 'professionals' | 'patient' | 'patient-dashboard' | 'login' | 'nurse' | 'reception' | 'doctor' | 'nutrition' | 'physiotherapy' | 'psychology' | 'admin'

type DashboardView = Extract<AccessView, 'nurse' | 'reception' | 'doctor' | 'nutrition' | 'physiotherapy' | 'psychology' | 'admin' | 'patient-dashboard'>

const roleDashboards: Record<string, AccessView> = {
  'Médico': 'doctor',
  'Enfermeiro': 'nurse',
  'Técnico de Enfermagem': 'nurse',
  'Nutrição': 'nutrition',
  'Administração': 'admin',
  'Fisioterapeuta': 'physiotherapy',
  'Psicólogo': 'psychology',
  'Recepcionista': 'reception',
}

/**
 * Todos os painéis recebem `onBack`; só a enfermagem usa `role`. O mapa é
 * homogêneo de propósito: `NurseDashboard` recebe `role={selectedRole}` como os
 * demais, que simplesmente o ignoram.
 */
type DashboardProps = { onBack: () => void; role: string }

const dashboardComponents = {
  nurse: NurseDashboard,
  doctor: DoctorDashboard,
  nutrition: NutritionDashboard,
  physiotherapy: PhysiotherapyDashboard,
  psychology: PsychologyDashboard,
  admin: AdminDashboard,
  reception: ReceptionDashboard,
  'patient-dashboard': PatientDashboard,
} satisfies Record<DashboardView, React.ComponentType<DashboardProps>>

function PanelFallback() {
  return (
    <main className="panel-loading" role="status" aria-live="polite">
      <span className="panel-loading-pulse" aria-hidden="true" />
      Carregando painel…
    </main>
  )
}

function App() {
  const [view, setView] = useState<AccessView>('home')
  const [selectedRole, setSelectedRole] = useState('')
  const [notice, setNotice] = useState('')
  const [credentials, setCredentials] = useState({ identifier: '', password: '' })

  function goTo(nextView: AccessView, role = '') {
    setView(nextView)
    if (role) setSelectedRole(role)
    setNotice('')
  }

  function selectProfessionalRole(role: string) {
    setSelectedRole(role)
    setCredentials({ identifier: '', password: '' })
    goTo('login', role)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const identifier = credentials.identifier.trim()
    if (identifier.length < 3) {
      setNotice('Informe um e-mail ou CPF válido para continuar.')
      return
    }
    if (credentials.password.length < 4) {
      setNotice('A senha precisa ter ao menos 4 caracteres.')
      return
    }
    if (view === 'patient') {
      setView('patient-dashboard')
      return
    }
    goTo(roleDashboards[selectedRole] ?? 'professionals', selectedRole)
  }

  if (view in dashboardComponents) {
    const Dashboard = dashboardComponents[view as DashboardView]
    // O painel do paciente volta ao início; os profissionais voltam à lista de perfis.
    const backTo = view === 'patient-dashboard' ? 'home' : 'professionals'
    return (
      <Suspense fallback={<PanelFallback />}>
        <Dashboard role={selectedRole} onBack={() => setView(backTo)} />
      </Suspense>
    )
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center">
      <section className="access-panel" aria-labelledby="page-title">
        <header className="panel-header">
          {view !== 'home' && (
            <button
              className="back-button"
              type="button"
              onClick={() => {
                setNotice('')
                setView(view === 'login' ? (selectedRole === 'Paciente / Acompanhante' ? 'patient' : 'professionals') : 'home')
              }}
              aria-label="Voltar"
            >
              <ArrowLeft size="1.1875rem" aria-hidden="true" />
              Voltar
            </button>
          )}
          <Brand compact={view !== 'home'} />
        </header>

        {view === 'home' && (
          <div className="view-content home-content">
            <div className="brand-emblem" aria-hidden="true">
              <HeartPulse size="2.375rem" strokeWidth={1.8} />
            </div>
            <p className="eyebrow">Cuidado conectado, equipe presente</p>
            <h1 id="page-title">Cuidar melhor começa com <span>conexão.</span></h1>
            <p className="intro-copy">
              Acompanhe cada etapa do cuidado em um só lugar, com clareza e proximidade.
            </p>

            <div className="access-options">
              <button className="access-option" type="button" onClick={() => setView('patient')}>
                <span className="option-icon"><HeartHandshake size="1.5rem" aria-hidden="true" /></span>
                <span className="option-copy">
                  <strong>Paciente ou acompanhante</strong>
                  <small>Acesse sua jornada de cuidado</small>
                </span>
                <ArrowRight className="option-arrow" size="1.3125rem" aria-hidden="true" />
              </button>
              <button className="access-option" type="button" onClick={() => setView('professionals')}>
                <span className="option-icon"><Stethoscope size="1.5rem" aria-hidden="true" /></span>
                <span className="option-copy">
                  <strong>Profissional de saúde</strong>
                  <small>Entre no espaço da sua equipe</small>
                </span>
                <ArrowRight className="option-arrow" size="1.3125rem" aria-hidden="true" />
              </button>
            </div>
            <p className="care-quote">“Organizar, comunicar e integrar para cuidar melhor.”</p>
          </div>
        )}

        {view === 'professionals' && (
          <div className="view-content role-content">
            <p className="eyebrow">Acesso para profissionais</p>
            <h1 id="page-title">Qual é o seu <span>perfil?</span></h1>
            <p className="intro-copy">Selecione sua área para continuar.</p>
            <div className="role-list">
              {professionalRoles.map(({ name, icon: Icon }) => (
                <button className="role-option" type="button" key={name} onClick={() => selectProfessionalRole(name)}>
                  <span className="role-icon"><Icon size="1.25rem" aria-hidden="true" /></span>
                  <span>{name}</span>
                  <ArrowRight className="option-arrow" size="1.1875rem" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {(view === 'patient' || view === 'login') && (
          <div className="view-content login-content">
            <div className="login-emblem" aria-hidden="true">
              {view === 'patient' ? <HeartHandshake size="1.8125rem" /> : <Stethoscope size="1.8125rem" />}
            </div>
            <p className="eyebrow">Acesso seguro</p>
            <h1 id="page-title">{view === 'patient' ? 'Olá, que bom ter você.' : `Olá, ${selectedRole}.`}</h1>
            <p className="intro-copy">Entre para acompanhar as informações do cuidado.</p>
            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="email">E-mail ou CPF</label>
              <input
                id="email"
                name="email"
                autoComplete="username"
                placeholder="Digite seu e-mail ou CPF"
                value={credentials.identifier}
                onChange={(event) => setCredentials((current) => ({ ...current, identifier: event.target.value }))}
                required
              />
              <label htmlFor="password">Senha</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                value={credentials.password}
                onChange={(event) => setCredentials((current) => ({ ...current, password: event.target.value }))}
                required
              />
              <button className="submit-button" type="submit">
                <LockKeyhole size="1.0625rem" aria-hidden="true" />
                Continuar
                <ArrowRight size="1.125rem" aria-hidden="true" />
              </button>
              {notice && <p className="form-notice" role="status">{notice}</p>}
            </form>
          </div>
        )}

        <footer className="panel-footer">
          <span><HeartPulse size="0.9375rem" aria-hidden="true" /> Cuidado integrado. Decisões mais seguras.</span>
          <span>CareMulti Digital</span>
        </footer>
      </section>
    </main>
  )
}

export default App
