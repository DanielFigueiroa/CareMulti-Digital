type ScheduleRowProps = {
  className: string
  time: string
  title: string
  detail: string
}

export function ScheduleRow({ className, time, title, detail }: ScheduleRowProps) {
  return (
    <article className={className}>
      <time>{time}</time>
      <div>
        <strong>{title}</strong>
        <small>{detail}</small>
      </div>
    </article>
  )
}
