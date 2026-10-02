import type { ReactNode } from 'react'

type FactCardProps = {
  className: string
  icon: ReactNode
  label: string
  value: string
}

export function FactCard({ className, icon, label, value }: FactCardProps) {
  return (
    <article className={className}>
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

type FactGridProps = {
  className: string
  children: ReactNode
}

export function FactGrid({ className, children }: FactGridProps) {
  return <div className={className}>{children}</div>
}
