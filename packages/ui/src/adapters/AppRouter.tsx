import React from 'react'
import { isElectron } from '../platform'

export function AppRouter({ children }: { children: React.ReactNode }) {
    if (isElectron) {
        const { BrowserRouter } = require('react-router-dom')
        return <BrowserRouter>{children}</BrowserRouter>
    }
    // Next.js kendi router'ını inject eder, sarmalama gereksiz
    return <>{children}</>
}
