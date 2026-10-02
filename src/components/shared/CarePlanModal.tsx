import { useState, type FormEvent } from 'react'
import { ClipboardList } from 'lucide-react'
import type { CarePlanArea } from '../../data/clinical'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'

type CarePlanModalProps = {
  patientId: number
  patientName: string
  area: CarePlanArea
  planLabel: string
  initialText: string
  author: string
  onClose(): void
  onSaved(): void
}

/** Edita o plano de cuidado da área (`carePlans[area]`) do paciente. */
export function CarePlanModal({
  patientId,
  patientName,
  area,
  planLabel,
  initialText,
  author,
  onClose,
  onSaved,
}: CarePlanModalProps) {
  const [text, setText] = useState(initialText)
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (text.trim().length < 5) {
      setError('Descreva o plano com pelo menos 5 caracteres.')
      return
    }
    careActions.setCarePlan(patientId, area, text.trim())
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <ClipboardList size="0.875rem" aria-hidden="true" /> {planLabel}
        </>
      }
      title="Editar plano de cuidado"
      subtitle={patientName}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={submit} noValidate>
        <div className="entry-form-grid">
          <label className={error ? 'form-field form-field-wide has-error' : 'form-field form-field-wide'}>
            <span>{planLabel}</span>
            <textarea
              className="field-control"
              rows={6}
              value={text}
              placeholder="Descreva objetivos, frequência e orientações do plano."
              onChange={(event) => {
                setText(event.target.value)
                setError('')
              }}
            />
            {error && <em role="alert">{error}</em>}
          </label>
        </div>
        <footer className="modal-foot">
          <p>Plano atualizado por {author}.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <ClipboardList size="0.9375rem" aria-hidden="true" /> Salvar plano
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}