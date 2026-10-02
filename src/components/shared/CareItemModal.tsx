import { useState, type FormEvent } from 'react'
import { ClipboardList } from 'lucide-react'
import type { CareItem } from '../../data/clinical'
import { careActions } from '../../store/actions'
import { Modal } from './Modal'
import { SelectField, TextField } from './Fields'

type CareItemModalProps = {
  patientId: number
  patientName: string
  defaultTime: string
  onClose(): void
  onSaved(): void
}

type Errors = Partial<Record<'title', string>>

const stateOptions = ['Pendente', 'Agendado', 'Realizado'] as const

type CareState = CareItem['state']

/** Adiciona um cuidado ao plano assistencial do paciente (ações de enfermagem). */
export function CareItemModal({ patientId, patientName, defaultTime, onClose, onSaved }: CareItemModalProps) {
  const [title, setTitle] = useState('')
  const [time, setTime] = useState(defaultTime)
  const [state, setState] = useState<CareState>('Pendente')
  const [errors, setErrors] = useState<Errors>({})

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (title.trim().length < 3) {
      setErrors({ title: 'Descreva o cuidado com pelo menos 3 caracteres.' })
      return
    }
    careActions.appendCareItem(patientId, { title: title.trim(), time: time.trim() || defaultTime, state })
    onSaved()
    onClose()
  }

  return (
    <Modal
      eyebrow={
        <>
          <ClipboardList size="0.875rem" aria-hidden="true" /> Enfermagem
        </>
      }
      title="Registrar cuidado"
      subtitle={patientName}
      onClose={onClose}
    >
      <form className="entry-form" onSubmit={submit} noValidate>
        <div className="entry-form-grid">
          <TextField
            className="form-field form-field-wide"
            label="Cuidado"
            value={title}
            onChange={(value) => {
              setTitle(value)
              setErrors({})
            }}
            placeholder="Ex.: Troca de curativo"
            error={errors.title}
          />
          <TextField className="form-field" label="Horário" value={time} onChange={setTime} placeholder="Ex.: 14:00" />
          <SelectField
            className="form-field"
            label="Situação"
            value={state}
            onChange={(value) => setState(value as CareState)}
            options={stateOptions}
          />
        </div>
        <footer className="modal-foot">
          <p>O cuidado entra na lista assistencial de {patientName}.</p>
          <div>
            <button type="button" className="ghost-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-small">
              <ClipboardList size="0.9375rem" aria-hidden="true" /> Adicionar
            </button>
          </div>
        </footer>
      </form>
    </Modal>
  )
}