import type { Patient } from '../../data/patients'
import { needsAttention } from '../../data/patients'
import { UserRound } from 'lucide-react'

/**
 * Linha da lista de pacientes usada pelas áreas com barra lateral. Cada painel
 * tem seu próprio prefixo de classe, então o nomecliente e o status são
 * recebidos de fora — o mesmo acordo dos demais componentes em `shared/`.
 */
type PatientRowProps = {
  patient: Patient
  selected: boolean
  onSelect: (id: number) => void
  className: string
  statusClassName: string
  /** Tamanho do ícone, em `rem`, para escalar junto com a tipografia raiz. */
  iconSize: string
  /** Linha secundária: diagnóstico, foco assistencial, etc. */
  secondary: string
  /** Linha adicional opcional, usada pela fisioterapia. */
  tertiary?: string
}

export function PatientRow({
  patient,
  selected,
  onSelect,
  className,
  statusClassName,
  iconSize,
  secondary,
  tertiary,
}: PatientRowProps) {
  return (
    <button
      type="button"
      className={`${className}${selected ? ' selected' : ''}`}
      onClick={() => onSelect(patient.id)}
    >
      <span>
        <UserRound size={iconSize} />
      </span>
      <div>
        <strong>{patient.bed} · {patient.name}</strong>
        <small>{patient.age} anos · {secondary}</small>
        {tertiary !== undefined && <small>{tertiary}</small>}
      </div>
      <i
        className={needsAttention(patient.status) ? statusClassName : ''}
        aria-label={patient.status}
      />
    </button>
  )
}