type NoticeLineProps = {
  className: string
  children: string
}

export function NoticeLine({ className, children }: NoticeLineProps) {
  return <p className={className} role="status">{children}</p>
}
