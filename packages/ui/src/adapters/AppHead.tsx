import React from 'react'
import { isElectron } from '../platform'

interface Props {
    title?: string
    description?: string
}

export function AppHead({ title, description }: Props) {
    if (isElectron) {
        if (title) document.title = title
        return null
    }
    const Head = require('next/head').default
    return (
        <Head>
            {title && <title>{title}</title>}
            {description && <meta name="description" content={description} />}
        </Head>
    )
}
