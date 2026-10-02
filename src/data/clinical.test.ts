import { describe, expect, it } from 'vitest'
import { patients } from './patients'
import {
  appointments,
  careActions,
  careGoals,
  careItems,
  careTeam,
  daySchedule,
  meals,
  nutritionPendingItems,
  nurseMedications,
  patientMedications,
  patientRoutines,
  professionals,
  physiotherapyPendingItems,
  psychologyPendingItems,
  sessionSchedule,
  therapyGoals,
  therapyInterventions,
  therapyObjectives,
  weeklyAppointments,
  weeklyAttendance,
} from './clinical'

/** Minutos desde a meia-noite, para comparar horários `HH:MM` em ordem. */
function minutesOf(time: string): number {
  const [hour = 0, minute = 0] = time.split(':').map(Number)
  return hour * 60 + minute
}

describe('equipe', () => {
  it('não repete nome de profissional', () => {
    const names = professionals.map((professional) => professional.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('nenhum nome tem ponto fora de um título honorífico', () => {
    for (const professional of professionals) {
      const withoutHonorific = professional.name.replace(/^(Dra?\.|Sr(a)?\.|Doutor(a)?)\s*/g, '')
      expect(withoutHonorific, professional.name).not.toContain('.')
    }
  })

  it('toda pessoa da equipe assistencial tem iniciais e perfil', () => {
    for (const member of careTeam) {
      expect(member.initials).toMatch(/^[A-Z]{2}$/)
      expect(member.role.length).toBeGreaterThan(2)
    }
  })
})

describe('planos clínicos', () => {
  it('nenhum registro tem título ou horário em branco', () => {
    const titled = [
      ...careItems.map((item) => ({ rotulo: 'careItem', ...item })),
      ...nutritionPendingItems,
      ...physiotherapyPendingItems,
      ...psychologyPendingItems,
      ...meals,
      ...patientRoutines,
      ...daySchedule,
      ...sessionSchedule,
    ]
    for (const item of titled) {
      const rotulo = 'rotulo' in item ? String(item.rotulo) : 'registro'
      expect(String(item.title).trim(), rotulo).not.toBe('')
    }
    for (const item of [...careItems, ...meals, ...patientRoutines, ...daySchedule, ...sessionSchedule]) {
      expect(item.time, 'horario em branco').toMatch(/^\d{2}:\d{2}$/)
    }
  })

  it('nenhuma pendência de nutrição fica sem prioridade', () => {
    for (const item of nutritionPendingItems) {
      expect(['Atenção', 'Programado']).toContain(item.priority)
    }
  })

  it('refeições seguem ordem cronológica ao longo do dia', () => {
    const minutes = meals.map((meal) => minutesOf(meal.time))
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes)
  })

  it('rotina do paciente também está em ordem cronológica', () => {
    const minutes = patientRoutines.map((item) => minutesOf(item.time))
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes)
  })

  it('medicamentos do paciente têm id único para o toggle', () => {
    const ids = patientMedications.map((medication) => medication.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('agenda da fisioterapia cita pacientes que existem na lista', () => {
    const known = new Set(patients.map((patient) => patient.name))
    for (const session of sessionSchedule) {
      expect(known, session.title).toContain(session.title)
    }
  })

  it('listas de objetivo e intervenção não ficam vazias', () => {
    for (const list of [therapyGoals, therapyObjectives, therapyInterventions, careGoals, careActions]) {
      expect(list.length).toBeGreaterThan(0)
      for (const entry of list) expect(entry.title.trim()).toBeTruthy()
    }
  })

  it('cuidados e medicações da enfermagem têm estado conhecido', () => {
    for (const item of careItems) {
      expect(['Realizado', 'Pendente', 'Agendado']).toContain(item.state)
    }
    for (const item of nurseMedications) {
      expect(['Próximo', 'Agendado']).toContain(item.state)
    }
  })
})

describe('agenda e relatórios', () => {
  it('agenda da recepção está em ordem cronológica', () => {
    const minutes = appointments.map((appointment) => minutesOf(appointment.time))
    expect([...minutes].sort((a, b) => a - b)).toEqual(minutes)
  })

  it('todo agendamento tem status válido', () => {
    for (const appointment of appointments) {
      expect(['Confirmado', 'Aguardando']).toContain(appointment.status)
    }
  })

  it('séries semanais têm sete dias e valores dentro de 0 a 100', () => {
    for (const series of [weeklyAttendance, weeklyAppointments]) {
      expect(series).toHaveLength(7)
      for (const point of series) {
        expect(point.value).toBeGreaterThan(0)
        expect(point.value).toBeLessThanOrEqual(100)
      }
    }
  })

  it('a série tem variação, senão o gráfico não comunica nada', () => {
    for (const series of [weeklyAttendance, weeklyAppointments]) {
      const values = series.map((point) => point.value)
      expect(new Set(values).size, series === weeklyAttendance ? 'weeklyAttendance' : 'weeklyAppointments').toBeGreaterThan(1)
    }
  })

  it('o maior valor é único, para que a barra mais alta não seja ambígua', () => {
    for (const series of [weeklyAttendance, weeklyAppointments]) {
      const max = Math.max(...series.map((point) => point.value))
      expect(series.filter((point) => point.value === max)).toHaveLength(1)
    }
  })
})
