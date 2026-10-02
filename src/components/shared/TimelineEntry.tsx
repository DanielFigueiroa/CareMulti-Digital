import type { ReactNode } from 'react'

type TimelineEntryProps = {
  className: string
  time: string
  title: string
  author: string
  children: ReactNode
}

export function TimelineEntry({ className, time, title, author, children }: TimelineEntryProps) {
  return (
    <article className={className}>
      <span>{time}</span>
      <h3>{title}</h3>
      <p>{children}</p>
      <small>{author}</small>
    </article>
  )
}
