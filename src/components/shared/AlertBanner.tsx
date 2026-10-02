import type { ReactNode } from 'react'

type AlertBannerProps = {
  className: string
  icon: ReactNode
  title: string
  trailing?: string
  children: ReactNode
}

export function AlertBanner({ className, icon, title, trailing, children }: AlertBannerProps) {
  return (
    <div className={className}>
      {icon}
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
      {trailing && <span>{trailing}</span>}
    </div>
  )
}
