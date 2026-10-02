import { useCallback, useMemo, useState } from 'react'

export type Notice = {
  message: string
  className: string
}

export type NoticeTone = 'info' | 'success' | 'error'

export function useNotice(prefix: string) {
  const [message, setMessage] = useState('')
  const [tone, setTone] = useState<NoticeTone>('info')

  const notice: Notice = useMemo(
    () => ({ message, className: `${prefix}-notice ${prefix}-notice-${tone}` }),
    [message, prefix, tone],
  )

  const showDemoNotice = useCallback((action: string) => {
    setTone('info')
    setMessage(`${action} disponível apenas como demonstração. Nenhum dado foi salvo.`)
  }, [])

  const showNotice = useCallback((text: string, nextTone: NoticeTone = 'success') => {
    setTone(nextTone)
    setMessage(text)
  }, [])

  const clearNotice = useCallback(() => setMessage(''), [])

  return { message, setMessage, showNotice, clearNotice, showDemoNotice, notice }
}
