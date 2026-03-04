"use client";

import { useEffect } from 'react';

export function ElectronErrorReporting() {
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).electron) {
            const handleGlobalError = (event: ErrorEvent) => {
                const { message, filename, lineno, colno, error } = event;
                (window as any).electron.reportUIError({
                    msg: message,
                    url: filename,
                    line: lineno,
                    col: colno,
                    stack: error?.stack
                });
            };

            window.addEventListener('error', handleGlobalError);
            return () => window.removeEventListener('error', handleGlobalError);
        }
    }, []);

    return null;
}
