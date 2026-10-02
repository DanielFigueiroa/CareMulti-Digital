type PendingRowProps = {
  className: string
  markerClassName?: string
  title: string
  detail: string
  priority?: string
  priorityClassName?: string
}

export function PendingRow({
  className,
  markerClassName,
  title,
  detail,
  priority,
  priorityClassName,
}: PendingRowProps) {
  return (
    <article className={className}>
      {markerClassName ? <span className={markerClassName} /> : <span />}
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
      {priority && <span className={priorityClassName}>{priority}</span>}
    </article>
  )
}
