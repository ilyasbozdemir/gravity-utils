import React from 'react'
import { isElectron } from '../platform'

interface Props {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
}

export function AppImage({ src, alt, width, height, className }: Props) {
    if (isElectron) {
        return <img src={src} alt={alt} width={width} height={height} className={className} />
    }
    const NextImage = require('next/image').default
    return <NextImage src={src} alt={alt} width={width ?? 100} height={height ?? 100} className={className} />
}
