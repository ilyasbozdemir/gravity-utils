import React from 'react'
import { isElectron } from '../platform'

interface Props {
    href: string
    children: React.ReactNode
    className?: string
    onClick?: (e: React.MouseEvent) => void
}

export function AppLink({ href, children, className, onClick }: Props) {
    if (isElectron) {
        // Electron: react-router-dom
        const { Link } = require('react-router-dom')
        return <Link to={href} className={className} onClick={onClick}>{children}</Link>
    }
    // Next.js
    const NextLink = require('next/link').default
    return <NextLink href={href} className={className} onClick={onClick}>{children}</NextLink>
}
