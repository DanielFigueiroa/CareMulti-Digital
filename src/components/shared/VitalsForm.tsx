import { useState } from 'react'
import { Activity } from 'lucide-react'
import {
  draftFromReading,
  emptyVitalsDraft,
  validateVitalsDraft,
  type Reading,
  type VitalsDraft,
} from '../../store/vitals'
import { Modal } from './Modal'

type VitalsFormProps = {
  initial: Reading
  patientName: string
  author: string
  onSubmit(reading: Reading, recordedAt: string): void
  onClose(): void
  nowTime(): string
}

const fields: { key: keyof VitalsDraft; label: string; unit: string; placeholder: string }[] = [
  { key: 'systolic', label: 'Sistólica', unit: 'mmHg', placeholder: '120' },
  { key: 'diastolic', label: 'Diastólica', unit: 'mmHg', placeholder: '80' },
  { key: 'heartRate', label: 'Freq. cardíaca', unit: 'bpm', placeholder: '78' },
  { key: 'respiratoryRate', label: 'Freq. respiratória', unit: 'irpm', placeholder: '18' },
  { key: 'temperature', label: 'Temperatura', unit: '°C', placeholder: '36,8' },
  { key: 'spo2', label: 'SpO₂', unit: '%', placeholder: '97' },
]

export default function VitalsForm({ initial, patientName, author, onSubmit, onClose, nowTime }: VitalsFormProps) {
  const [draft, setDraft] = useState<VitalsDraft>(() => draftFromReading(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})

  function update(key: keyof VitalsDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = validateVitalsDraft(draft)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    onSubmit(result.reading, nowTime())
    setDraft(emptyVitalsDraft)
    setErrors({})
  }

  return (
    <Modal
      eyebrow={
        <>
          <Activity size="0.875rem" aria-hidden="true" /> Sinais vitais
        </>
      }
      title="Registrar medição"
      subtitle={patientName}
      cardClassName="vitals-modal"
      onClose={onClose}
    >
      <form className="vitals-form" onSubmit={submit} noValidate>
        <div className="vitals-form-grid">
          {fields.map((field) => (
            <label key={field.key} className={errors[field.key] ? 'has-error' : undefined}>
              <span>
                {field.label} <small>{field.unit}</small>
              </span>
              <input
                inputMode="decimal"
                autoComplete="off"
                placeholder={field.placeholder}
                value={draft[field.key]}
                onChange={(event) => update(field.key, event.target.value)}
                aria-invalid={errors[field.key] ? 'true' : undefined}
                aria-describedby={errors[field.key] ? `${field.key}-error` : undefined}
              />
              {errors[field.key] && (
                <em id={`${field.key}-error`} role="alert">
                  {errors[field.key]}
                </em>
              )}
            </label>
          ))}
        </div>

        <footer className="modal-foot">
          <p>Registrado por {author}. O horário é o do momento do registro.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <Activity size="0.9375rem" aria-hidden="true" /> Salvar leitura
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}
