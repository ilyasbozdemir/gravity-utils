import { useState, useEffect } from 'react'
import { isElectron } from '../platform'

export function useAppFetch<T>(endpoint: string, payload?: unknown) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  async function fetchData() {
    setLoading(true)
    try {
      let result: T
      if (isElectron) {
        // Electron: IPC üzerinden
        result = await (window as any).electron.ipc.invoke(endpoint, payload)
      } else {
        // Next.js: HTTP fetch
        const res = await fetch(`/api/${endpoint}`, {
          method: payload ? 'POST' : 'GET',
          headers: { 'Content-Type': 'application/json' },
          body: payload ? JSON.stringify(payload) : undefined,
        })
        result = await res.json()
      }
      setData(result)
    } catch (e) {
      setError(e as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [endpoint])

  return { data, loading, error, refetch: fetchData }
}
