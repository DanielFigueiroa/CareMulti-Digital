import { useState, type FormEvent } from 'react'
import { FileText } from 'lucide-react'
import type { EvolutionArea } from '../../data/clinical'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'
import { TextField } from './Fields'

type EvolutionModalProps = {
  patientId: number
  patientName: string
  area: EvolutionArea
  author: string
  authorRole: string
  onClose(): void
  onSaved(): void
}

type Errors = Partial<Record<'title' | 'note', string>>

/**
 * Registro de evolução clínica. Serve a todas as áreas da equipe: o `area`,
 * o autor e o papel vêm de quem abre o modal, então o mesmo formulário atende
 * médico, enfermagem, nutrição, fisioterapia e psicologia.
 */
export function EvolutionModal({
  patientId,
  patientName,
  area,
  author,
  authorRole,
  onClose,
  onSaved,
}: EvolutionModalProps) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<Errors>({})

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next: Errors = {}
    if (title.trim().length < 3) next.title = 'Informe um título com pelo menos 3 caracteres.'
    if (note.trim().length < 10) next.note = 'Descreva a evolução com pelo menos 10 caracteres.'
    if (Object.keys(next).length > 0) {
      setErrors(next)
      return
    }
    careActions.addEvolution(patientId, { title: title.trim(), note: note.trim(), area, author, authorRole })
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <FileText size="0.875rem" aria-hidden="true" /> Evolução clínica
        </>
      }
      title="Nova evolução"
      subtitle={`${patientName} · ${area}`}
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
            placeholder="Ex.: Avaliação clínica"
            error={errors.title}
          />
          <TextField
            className="form-field form-field-wide"
            label="Registro"
            value={note}
            onChange={(value) => {
              setNote(value)
              setErrors((current) => ({ ...current, note: undefined }))
            }}
            placeholder="Descreva a conduta, as observações e a orientação à equipe."
            multiline
            rows={5}
            error={errors.note}
          />
          <p className="entry-form-context">
            Área responsável: <strong>{area}</strong> · {authorRole}
          </p>
        </div>
        <footer className="modal-foot">
          <p>
            Registrado por {author}. O horário é o do momento do registro.
          </p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <FileText size="0.9375rem" aria-hidden="true" /> Salvar evolução
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}