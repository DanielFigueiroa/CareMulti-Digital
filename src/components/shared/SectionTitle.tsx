import type { ReactNode } from 'react'

type SectionTitleProps = {
  className: string
  title: string
  subtitle?: string
  trailing?: ReactNode
  action?: ReactNode
}

export function SectionTitle({ className, title, subtitle, trailing, action }: SectionTitleProps) {
  return (
    <div className={className}>
      {trailing ? (
        <>
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action}
        </>
      ) : (
        <>
          <h2>{title}</h2>
          {action}
        </>
      )}
    </div>
  )
}
