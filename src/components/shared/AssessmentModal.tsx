import { useState, type FormEvent } from 'react'
import { Scale } from 'lucide-react'
import type { EvolutionArea } from '../../data/clinical'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'
import { TextField } from './Fields'

type AssessmentModalProps = {
  patientId: number
  patientName: string
  area: EvolutionArea
  author: string
  titlePlaceholder?: string
  scorePlaceholder?: string
  onClose(): void
  onSaved(): void
}

type Errors = Partial<Record<'title' | 'score', string>>

/**
 * Avaliação de uma área assistencial (nutrição, fisioterapia, psicologia).
 * A área e o autor são fixados por quem abre o modal; o registro entra em
 * `assessments[area]` no prontuário.
 */
export function AssessmentModal({
  patientId,
  patientName,
  area,
  author,
  titlePlaceholder = 'Ex.: Avaliação da área',
  scorePlaceholder = 'Ex.: resultado principal',
  onClose,
  onSaved,
}: AssessmentModalProps) {
  const [title, setTitle] = useState('')
  const [score, setScore] = useState('')
  const [detail, setDetail] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (title.trim().length < 3) next.title = 'Informe o título da avaliação.'
    if (score.trim().length < 1) next.score = 'Informe o resultado da avaliação.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    careActions.addAssessment(patientId, {
      title: title.trim(),
      score: score.trim(),
      detail: detail.trim(),
      author,
      area,
    })
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <Scale size="0.875rem" aria-hidden="true" /> {area}
        </>
      }
      title="Nova avaliação"
      subtitle={patientName}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={submit} noValidate>
        <div className="entry-form-grid">
          <TextField
            className="form-field form-field-wide"
            label="Título"
            value={title}
            onChange={(value) => {
              setTitle(value)
              setErrors((current) => ({ ...current, title: undefined }))
            }}
            placeholder={titlePlaceholder}
            error={errors.title}
          />
          <TextField
            className="form-field form-field-wide"
            label="Resultado"
            value={score}
            onChange={(value) => {
              setScore(value)
              setErrors((current) => ({ ...current, score: undefined }))
            }}
            placeholder={scorePlaceholder}
            error={errors.score}
          />
          <TextField
            className="form-field form-field-wide"
            label="Observação"
            value={detail}
            onChange={setDetail}
            placeholder="Descreva os achados e as orientações."
            multiline
            rows={4}
          />
        </div>
        <footer className="modal-foot">
          <p>Registrado por {author} · {area}.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <Scale size="0.9375rem" aria-hidden="true" /> Salvar avaliação
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}