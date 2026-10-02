import { useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import './Modal.css'

type ModalProps = {
  eyebrow: ReactNode
  title: string
  subtitle?: ReactNode
  /** Classe extra no cartão, para variações como `.history-modal`. */
  cardClassName?: string
  children: ReactNode
  onClose(): void
}

/**
 * Casca de modal do projeto. Existia apenas como markup duplicado em
 * `VitalsForm` e `VitalsHistory`; agora os dois usam este componente e os
 * novos fluxos de registro seguem o mesmo padrão.
 */
export function Modal({ eyebrow, title, subtitle, cardClassName, children, onClose }: ModalProps) {
  const titleId = useId()

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={cardClassName ? `modal-card ${cardClassName}` : 'modal-card'}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-head">
          <div>
            <span className="modal-eyebrow">{eyebrow}</span>
            <h2 id={titleId}>{title}</h2>
            {subtitle !== undefined && <p>{subtitle}</p>}
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size="1.0625rem" aria-hidden="true" />
          </button>
        </header>
        {children}
      </div>
    </div>
  )
}