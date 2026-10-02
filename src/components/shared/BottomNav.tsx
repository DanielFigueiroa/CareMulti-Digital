import type { ReactNode } from 'react'

export type BottomNavItem = {
  label: string
  icon: ReactNode
  active?: boolean
  onClick: () => void
}

type BottomNavProps = {
  className: string
  items: BottomNavItem[]
}

export function BottomNav({ className, items }: BottomNavProps) {
  return (
    <nav className={className} aria-label="Navegação principal">
      {items.map(({ label, icon, active, onClick }) => (
        <button key={label} type="button" className={active ? 'active' : ''} onClick={onClick}>
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
