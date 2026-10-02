import { professionals } from './clinical'
import type { CareArea } from './patients'

export type SessionUser = {
  role: string
  name: string
  shortName: string
  area: CareArea
}

const users: Record<string, SessionUser> = {
  'Médico': { role: 'Médico', name: 'Dr. Carlos Mendes', shortName: 'Carlos', area: 'doctor' },
  'Enfermeiro': { role: 'Enfermeiro', name: 'Ana Beatriz Ferreira', shortName: 'Ana Beatriz', area: 'nurse' },
  'Técnico de Enfermagem': { role: 'Técnico de Enfermagem', name: 'Marcos Vinícius Alves', shortName: 'Marcos', area: 'nurse' },
  'Nutrição': { role: 'Nutrição', name: 'Carla Mendes', shortName: 'Carla', area: 'nutrition' },
  'Administração': { role: 'Administração', name: 'Rafael Costa', shortName: 'Rafael', area: 'doctor' },
  'Fisioterapeuta': { role: 'Fisioterapeuta', name: 'Juliana Martins', shortName: 'Juliana', area: 'physiotherapy' },
  'Psicólogo': { role: 'Psicólogo', name: 'Dra. Luiza Mendes', shortName: 'Luiza', area: 'psychology' },
  'Recepcionista': { role: 'Recepcionista', name: 'Thiago Correia Melo', shortName: 'Thiago', area: 'doctor' },
}

export const professionalRoles: { role: string; area: CareArea }[] = Object.values(users).map((user) => ({
  role: user.role,
  area: user.area,
}))

const fallback: SessionUser = { role: 'Profissional', name: 'Equipe de cuidado', shortName: 'Equipe', area: 'doctor' }

export function sessionUser(role: string): SessionUser {
  return users[role] ?? fallback
}

export function sessionRoles(): string[] {
  return Object.keys(users)
}

export function sessionNames(): string[] {
  return Object.values(users).map((user) => user.name)
}

export function rosterNames(): string[] {
  return professionals.map((professional) => professional.name)
}
