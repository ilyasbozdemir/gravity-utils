import React, { useState } from 'react'
import { formatSQL } from '@gravity/utils'
import { AppHead } from '../adapters/AppHead'

export function SqlFormatterPage() {
    const [input, setInput] = useState('')
    const [output, setOutput] = useState('')
    const [dialect, setDialect] = useState<'sql' | 'mysql' | 'postgresql'>('sql')

    function handleFormat() {
        setOutput(formatSQL(input, dialect))
    }

    return (
        <>
            <AppHead title="SQL Formatter" />
            <div className="sql-formatter-page">
                <select value={dialect} onChange={(e) => setDialect(e.target.value as any)}>
                    <option value="sql">SQL</option>
                    <option value="mysql">MySQL</option>
                    <option value="postgresql">PostgreSQL</option>
                </select>
                <div className="editor-grid">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="SQL yapıştır..."
                    />
                    <textarea value={output} readOnly placeholder="Formatlanmış çıktı..." />
                </div>
                <button onClick={handleFormat}>Formatla</button>
            </div>
        </>
    )
}
