import { useId, type ChangeEvent } from 'react'

type TextFieldProps = {
  label: string
  value: string
  onChange(value: string): void
  hint?: string
  error?: string
  placeholder?: string
  className?: string
  multiline?: boolean
  rows?: number
  autoComplete?: string
  type?: 'text' | 'date' | 'tel' | 'email'
}

/**
 * Campo de texto controlado. `className` vai para o `<label>` externo, que é o
 * item de grid dos formulários (`.form-field`, `.form-field-wide`); o controle
 * recebe `.field-control`. Centraliza `aria-invalid`/`aria-describedby`.
 */
export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  placeholder,
  className,
  multiline,
  rows,
  autoComplete = 'off',
  type = 'text',
}: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const invalid = Boolean(error)
  const wrapperClass = [className, invalid ? 'has-error' : null].filter(Boolean).join(' ') || undefined

  const shared = {
    id,
    value,
    placeholder,
    autoComplete,
    'aria-invalid': invalid ? ('true' as const) : undefined,
    'aria-describedby': [hint !== undefined ? hintId : null, error !== undefined ? errorId : null]
      .filter(Boolean)
      .join(' ') || undefined,
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(event.target.value),
  }

  return (
    <label className={wrapperClass} htmlFor={id}>
      <span>
        {label} {hint && <small>{hint}</small>}
      </span>
      {multiline ? (
        <textarea className="field-control" rows={rows} {...shared} />
      ) : (
        <input className="field-control" type={type} {...shared} />
      )}
      {hint !== undefined && (
        <em id={hintId} className="field-hint">
          {hint}
        </em>
      )}
      {error !== undefined && (
        <em id={errorId} role="alert">
          {error}
        </em>
      )}
    </label>
  )
}

type SelectFieldProps = {
  label: string
  value: string
  onChange(value: string): void
  options: readonly string[]
  hint?: string
  error?: string
  className?: string
  placeholder?: string
}

export function SelectField({ label, value, onChange, options, hint, error, className, placeholder }: SelectFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const invalid = Boolean(error)
  const wrapperClass = [className, invalid ? 'has-error' : null].filter(Boolean).join(' ') || undefined

  return (
    <label className={wrapperClass} htmlFor={id}>
      <span>
        {label} {hint && <small>{hint}</small>}
      </span>
      <select
        id={id}
        className="field-control"
        value={value}
        aria-invalid={invalid ? 'true' : undefined}
        aria-describedby={error !== undefined ? errorId : undefined}
        onChange={(event) => onChange(event.target.value)}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error !== undefined && (
        <em id={errorId} role="alert">
          {error}
        </em>
      )}
    </label>
  )
}