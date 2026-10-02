import { useState, type FormEvent } from 'react'
import { FlaskConical } from 'lucide-react'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'
import { SelectField, TextField } from './Fields'

type ExamModalProps = {
  patientId: number
  patientName: string
  requestedBy: string
  onClose(): void
  onSaved(): void
}

type Errors = Partial<Record<'exam' | 'detail', string>>

const urgencyOptions = ['Rotina', 'Urgente'] as const

type ExamUrgency = (typeof urgencyOptions)[number]

/**
 * Solicitação de exame. O pedido entra como "Solicitado" na lista do paciente e
 * a urgência acompanha a união restrita a "Rotina" e "Urgente" do prontuário.
 */
export function ExamModal({ patientId, patientName, requestedBy, onClose, onSaved }: ExamModalProps) {
  const [exam, setExam] = useState('')
  const [detail, setDetail] = useState('')
  const [urgency, setUrgency] = useState<ExamUrgency>(urgencyOptions[0])
  const [errors, setErrors] = useState<Errors>({})

  function clearError(field: keyof Errors) {
    setErrors((current) => (current[field] ? { ...current, [field]: undefined } : current))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (exam.trim().length < 3) next.exam = 'Informe o exame solicitado.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    careActions.requestExam(patientId, {
      exam: exam.trim(),
      detail: detail.trim(),
      urgency,
      requestedBy,
    })
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <FlaskConical size="0.875rem" aria-hidden="true" /> Exames
        </>
      }
      title="Solicitar exame"
      subtitle={patientName}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={submit} noValidate>
        <div className="entry-form-grid">
          <TextField
            className="form-field form-field-wide"
            label="Exame"
            value={exam}
            onChange={(value) => {
              setExam(value)
              clearError('exam')
            }}
            placeholder="Ex.: Hemograma completo"
            error={errors.exam}
          />
          <TextField
            className="form-field form-field-wide"
            label="Detalhe / hipótese"
            value={detail}
            onChange={(value) => {
              setDetail(value)
              clearError('detail')
            }}
            placeholder="Indique o contexto clínico do pedido."
            multiline
            rows={3}
            error={errors.detail}
          />
          <SelectField className="form-field form-field-wide" label="Urgência" value={urgency} onChange={(value) => setUrgency(value as ExamUrgency)} options={urgencyOptions} />
        </div>
        <footer className="modal-foot">
          <p>Solicitado por {requestedBy}. O pedido aparece na lista de exames do paciente.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <FlaskConical size="0.9375rem" aria-hidden="true" /> Solicitar
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}