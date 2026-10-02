export type Reading = {
  bloodPressure: string
  heartRate: number
  respiratoryRate: number
  temperature: string
  spo2: number
}

export type MetricStatus = {
  level: 'normal' | 'watch' | 'alert'
  label: string
}

function temperatureValue(temperature: string): number {
  return Number(temperature.replace(',', '.'))
}

export function classifySpo2(spo2: number): MetricStatus {
  if (spo2 < 90) return { level: 'alert', label: 'Crítico' }
  if (spo2 < 94) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Estável' }
}

export function classifyHeartRate(heartRate: number): MetricStatus {
  if (heartRate < 50 || heartRate > 120) return { level: 'alert', label: 'Crítico' }
  if (heartRate < 60 || heartRate > 100) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Dentro da meta' }
}

export function classifyRespiratoryRate(respiratoryRate: number): MetricStatus {
  if (respiratoryRate < 8 || respiratoryRate > 30) return { level: 'alert', label: 'Crítico' }
  if (respiratoryRate < 12 || respiratoryRate > 20) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Dentro da meta' }
}

export function classifyTemperature(temperature: string): MetricStatus {
  const value = temperatureValue(temperature)
  if (!Number.isFinite(value)) return { level: 'alert', label: 'Crítico' }
  if (value >= 39 || value <= 35) return { level: 'alert', label: 'Crítico' }
  if (value >= 37.3 || value < 36) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Estável' }
}

export function classifyBloodPressure(bloodPressure: string): MetricStatus {
  const match = /^(\d{2,3})\/(\d{2,3})$/.exec(bloodPressure.trim())
  if (!match) return { level: 'alert', label: 'Crítico' }
  const systolic = Number(match[1])
  const diastolic = Number(match[2])
  if (systolic >= 180 || systolic < 90 || diastolic >= 120 || diastolic < 60) return { level: 'alert', label: 'Crítico' }
  if (systolic >= 130 || diastolic >= 90) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Dentro da meta' }
}

export function worstStatus(statuses: MetricStatus[]): MetricStatus {
  if (statuses.some((status) => status.level === 'alert')) return { level: 'alert', label: 'Requer atenção' }
  if (statuses.some((status) => status.level === 'watch')) return { level: 'watch', label: 'Acompanhar' }
  return { level: 'normal', label: 'Estável' }
}

export function classifyReading(reading: Reading): MetricStatus {
  return worstStatus([
    classifyBloodPressure(reading.bloodPressure),
    classifyHeartRate(reading.heartRate),
    classifyRespiratoryRate(reading.respiratoryRate),
    classifyTemperature(reading.temperature),
    classifySpo2(reading.spo2),
  ])
}

export type VitalsDraft = {
  systolic: string
  diastolic: string
  heartRate: string
  respiratoryRate: string
  temperature: string
  spo2: string
}

export const emptyVitalsDraft: VitalsDraft = {
  systolic: '',
  diastolic: '',
  heartRate: '',
  respiratoryRate: '',
  temperature: '',
  spo2: '',
}

export function draftFromReading(reading: Reading): VitalsDraft {
  const [systolic = '', diastolic = ''] = reading.bloodPressure.split('/')
  return {
    systolic,
    diastolic,
    heartRate: String(reading.heartRate),
    respiratoryRate: String(reading.respiratoryRate),
    temperature: reading.temperature,
    spo2: String(reading.spo2),
  }
}

export type DraftResult = { ok: true; reading: Reading } | { ok: false; errors: Record<string, string> }

function numberInRange(value: string, min: number, max: number): number | null {
  const parsed = Number(value.trim().replace(',', '.'))
  if (!Number.isFinite(parsed)) return null
  if (parsed < min || parsed > max) return null
  return parsed
}

export function validateVitalsDraft(draft: VitalsDraft): DraftResult {
  const errors: Record<string, string> = {}

  const systolic = numberInRange(draft.systolic, 60, 260)
  if (systolic === null) errors.systolic = 'Informe um valor entre 60 e 260.'

  const diastolic = numberInRange(draft.diastolic, 30, 160)
  if (diastolic === null) errors.diastolic = 'Informe um valor entre 30 e 160.'

  if (systolic !== null && diastolic !== null && systolic <= diastolic) {
    errors.diastolic = 'A sistólica deve ser maior que a diastólica.'
  }

  const heartRate = numberInRange(draft.heartRate, 20, 260)
  if (heartRate === null) errors.heartRate = 'Informe um valor entre 20 e 260.'

  const respiratoryRate = numberInRange(draft.respiratoryRate, 4, 80)
  if (respiratoryRate === null) errors.respiratoryRate = 'Informe um valor entre 4 e 80.'

  const temperatureRaw = draft.temperature.trim().replace(',', '.')
  const temperature = Number(temperatureRaw)
  if (!Number.isFinite(temperature) || temperature < 30 || temperature > 45) {
    errors.temperature = 'Informe um valor entre 30 e 45.'
  }

  const spo2 = numberInRange(draft.spo2, 50, 100)
  if (spo2 === null) errors.spo2 = 'Informe um valor entre 50 e 100.'

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    reading: {
      bloodPressure: `${systolic}/${diastolic}`,
      heartRate: heartRate as number,
      respiratoryRate: respiratoryRate as number,
      temperature: temperatureRaw.replace('.', ','),
      spo2: spo2 as number,
    },
  }
}
