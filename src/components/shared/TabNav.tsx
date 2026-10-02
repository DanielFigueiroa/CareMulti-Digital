import type { ReactNode } from 'react'

type TabNavProps<T extends string> = {
  className: string
  ariaLabel: string
  tabs: readonly T[]
  activeTab: T
  onChange: (tab: T) => void
  iconFor?: (tab: T) => ReactNode
  badgeFor?: (tab: T) => number | undefined
  badgeClassName?: string
  selectedClassName?: string
}

export function TabNav<T extends string>({
  className,
  ariaLabel,
  tabs,
  activeTab,
  onChange,
  iconFor,
  badgeFor,
  badgeClassName,
  selectedClassName = 'selected',
}: TabNavProps<T>) {
  return (
    <nav className={className} aria-label={ariaLabel} role="tablist">
      {tabs.map((tab) => {
        const badge = badgeFor?.(tab)
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            className={activeTab === tab ? selectedClassName : ''}
            onClick={() => onChange(tab)}
          >
            {iconFor?.(tab)}
            {tab}
            {badge !== undefined && (
              badgeClassName
                ? <span className={badgeClassName}>{badge}</span>
                : <span>{badge}</span>
            )}
          </button>
        )
      })}
    </nav>
  )
}
