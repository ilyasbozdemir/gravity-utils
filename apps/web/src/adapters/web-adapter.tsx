'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlatformAdapter } from '@shared/index';

export const webAdapter: PlatformAdapter = {
    Link: ({ href, children, className }) => (
        <Link href={href} className={className}>{children}</Link>
    ),
    useNavigate: () => {
        const r = useRouter();
        return (path: string) => r.push(path);
    },
    getEnv: (key: string) => process.env[`NEXT_PUBLIC_${key}`],
    apiCall: async (endpoint: string, options?: RequestInit) => {
        const res = await fetch(`/api${endpoint}`, options);
        if (!res.ok) throw new Error('API Request Failed');
        return res.json();
    },
};
