import React, { useState, useRef } from 'react'
import { extractTextWithProgress } from '@gravity/utils'
import { AppHead } from '../adapters/AppHead'

export function OcrPage() {
    const [text, setText] = useState('')
    const [progress, setProgress] = useState(0)
    const [loading, setLoading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    async function handleFile(file: File) {
        setLoading(true)
        setText('')
        const result = await extractTextWithProgress(file, setProgress)
        setText(result)
        setLoading(false)
    }

    return (
        <>
            <AppHead title="OCR — Görüntüden Metin" />
            <div className="ocr-page">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {loading && <div className="progress-bar" style={{ width: `${progress}%` }} />}
                {text && <textarea value={text} readOnly />}
            </div>
        </>
    )
}
