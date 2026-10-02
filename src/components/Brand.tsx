import { HeartPulse } from 'lucide-react'

type BrandProps = {
  compact?: boolean
  onHome?: () => void
}

function Brand({ compact = false, onHome }: BrandProps) {
  const label = 'CareMulti check'

  const content = (
    <>
      <span className="brand-mark"><HeartPulse size="1.375rem" strokeWidth={2.1} aria-hidden="true" /></span>
      <span className="brand-name">CareMulti <b>check</b></span>
    </>
  )

  if (!onHome) {
    return <span className={`brand-lockup${compact ? ' brand-lockup-compact' : ''}`} aria-label={label}>{content}</span>
  }

  return (
    <button
      type="button"
      className={`brand-lockup${compact ? ' brand-lockup-compact' : ''}`}
      aria-label={`${label}, voltar ao início`}
      onClick={onHome}
    >
      {content}
    </button>
  )
}

export default Brand
