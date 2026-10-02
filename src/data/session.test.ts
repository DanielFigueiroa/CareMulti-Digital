import { describe, expect, it } from 'vitest'
import { professionalRoles, rosterNames, sessionNames, sessionRoles, sessionUser } from './session'
import { careTeam } from './clinical'

describe('sessão por perfil', () => {
  it('devolve o usuário de cada perfil offered no login', () => {
    for (const { role } of professionalRoles) {
      const user = sessionUser(role)
      expect(user.name).not.toBe('Equipe de cuidado')
      expect(user.name.trim()).not.toBe('')
    }
  })

  it('usa o mesmo nome para o mesmo perfil', () => {
    expect(sessionUser('Enfermeiro').name).toBe(sessionUser('Enfermeiro').name)
  })

  it('não repete o mesmo nome entre dois perfis', () => {
    const nomes = sessionNames()
    expect(new Set(nomes).size).toBe(nomes.length)
  })

  it('usa nomes que existem no quadro de profissionais', () => {
    const roster = rosterNames()
    for (const name of sessionNames()) {
      expect(roster).toContain(name)
    }
  })

  it('não repete nome no quadro de profissionais', () => {
    const roster = rosterNames()
    expect(new Set(roster).size).toBe(roster.length)
  })

  it('inclui a equipe de cuidado do paciente no roster', () => {
    const roster = rosterNames()
    for (const member of careTeam) {
      expect(roster).toContain(member.name)
    }
  })

  it('não repete o mesmo nome dentro da equipe de cuidado', () => {
    const nomes = careTeam.map((member) => member.name)
    expect(new Set(nomes).size).toBe(nomes.length)
  })

  it('usa o mesmo nome na equipe e na sessão para a enfermagem', () => {
    const enfermeira = careTeam.find((member) => member.role === 'Enfermeira')
    expect(sessionUser('Enfermeiro').name).toBe(enfermeira?.name)
  })

  it('cai para um usuário genérico em perfil desconhecido', () => {
    expect(sessionUser('Perfil Inexistente').name).toBe('Equipe de cuidado')
  })

  it('cobre todos os perfis de profissional', () => {
    for (const { role } of professionalRoles) {
      expect(sessionRoles()).toContain(role)
    }
  })

  it('usa o nome do roster nas autorias registradas nos painéis', () => {
    const sources = import.meta.glob('../components/*Dashboard.tsx', {
      query: '?raw',
      import: 'default',
      eager: true,
    }) as Record<string, string>

    const roster = rosterNames()
    let verificadas = 0
    for (const [file, source] of Object.entries(sources)) {
      for (const match of source.matchAll(/author="([^"]+)"/g)) {
        const who = (match[1] ?? '').split('·')[0]!.trim()
        if (who === '' || who === 'Enfermagem') continue
        expect(roster, `${file}: ${who}`).toContain(who)
        verificadas += 1
      }
    }
    expect(verificadas).toBeGreaterThan(0)
  })
})
