import React, { useEffect, useState } from 'react'
import { isElectron } from '../platform'

type State = 'idle' | 'available' | 'downloading' | 'ready'

export function UpdateNotifier() {
    const [state, setState] = useState<State>('idle')
    const [progress, setProgress] = useState(0)
    const [version, setVersion] = useState('')

    useEffect(() => {
        if (!isElectron) return
        const ipc = (window as any).electron.ipc
        ipc.on('update:available', (_: any, info: any) => { setVersion(info.version); setState('available') })
        ipc.on('update:progress', (_: any, p: any) => { setProgress(Math.round(p.percent)); setState('downloading') })
        ipc.on('update:downloaded', () => setState('ready'))
    }, [])

    if (state === 'idle') return null

    return (
        <div style={{ position: 'fixed', bottom: 16, right: 16, background: '#1a1a1a', color: '#fff', padding: '12px 16px', borderRadius: 8, zIndex: 9999 }}>
            {state === 'available' && (
                <div>
                    <span>v{version} mevcut </span>
                    <button onClick={() => (window as any).electron.ipc.send('update:download')}>İndir</button>
                </div>
            )}
            {state === 'downloading' && <span>İndiriliyor %{progress}...</span>}
            {state === 'ready' && (
                <div>
                    <span>Hazır — </span>
                    <button onClick={() => (window as any).electron.ipc.send('update:install')}>Yeniden Başlat</button>
                </div>
            )}
        </div>
    )
}
