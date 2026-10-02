import { useState, type FormEvent } from 'react'
import { Pill } from 'lucide-react'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'
import { SelectField, TextField } from './Fields'

type PrescriptionModalProps = {
  patientId: number
  patientName: string
  author: string
  onClose(): void
  onSaved(): void
}

type Errors = Partial<Record<'drug' | 'dose' | 'frequency', string>>

const routeOptions = ['Via oral', 'Subcutânea', 'Intramuscular', 'Endovenosa', 'Tópica'] as const
const frequencyOptions = [
  'A cada 4 horas',
  'A cada 6 horas',
  'A cada 8 horas',
  'A cada 12 horas',
  'Uma vez ao dia',
  'Duas vezes ao dia',
  'Se necessário',
] as const

/**
 * Nova prescrição. Além de gravar a prescrição, a ação `addPrescription` cria a
 * medicação correspondente no prontuário do paciente, então o item aparece
 * automaticamente na rotina dele.
 */
export function PrescriptionModal({ patientId, patientName, author, onClose, onSaved }: PrescriptionModalProps) {
  const [drug, setDrug] = useState('')
  const [dose, setDose] = useState('')
  const [route, setRoute] = useState<string>(routeOptions[0])
  const [frequency, setFrequency] = useState<string>(frequencyOptions[0])
  const [errors, setErrors] = useState<Errors>({})

  function clearError(field: keyof Errors) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (drug.trim().length < 2) next.drug = 'Informe o medicamento.'
    if (dose.trim().length < 1) next.dose = 'Informe a dose.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    careActions.addPrescription(patientId, {
      drug: drug.trim(),
      dose: dose.trim(),
      route,
      frequency,
      author,
    })
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <Pill size="0.875rem" aria-hidden="true" /> Prescrição
        </>
      }
      title="Nova prescrição"
      subtitle={patientName}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={submit} noValidate>
        <div className="entry-form-grid">
          <TextField
            className="form-field form-field-wide"
            label="Medicamento"
            value={drug}
            onChange={(value) => {
              setDrug(value)
              clearError('drug')
            }}
            placeholder="Ex.: Dipirona"
            error={errors.drug}
          />
          <TextField
            className="form-field"
            label="Dose"
            value={dose}
            onChange={(value) => {
              setDose(value)
              clearError('dose')
            }}
            placeholder="Ex.: 1 g"
            error={errors.dose}
          />
          <SelectField className="form-field" label="Via" value={route} onChange={setRoute} options={routeOptions} />
          <SelectField
            className="form-field form-field-wide"
            label="Frequência"
            value={frequency}
            onChange={setFrequency}
            options={frequencyOptions}
            error={errors.frequency}
          />
        </div>
        <footer className="modal-foot">
          <p>A medicação entra na rotina de {patientName} no mesmo registro.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <Pill size="0.9375rem" aria-hidden="true" /> Prescrever
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}