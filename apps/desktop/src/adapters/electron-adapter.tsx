import React from 'react';
import { Link, useNavigate as useRRNavigate } from 'react-router-dom';
import { PlatformAdapter } from '@shared/index';

export const electronAdapter: PlatformAdapter = {
    Link: ({ href, children, className }) => (
        <Link to={href} className={className}>{children}</Link>
    ),
    useNavigate: () => {
        const navigate = useRRNavigate();
        return (path: string) => navigate(path);
    },
    getEnv: (key: string) => import.meta.env[`VITE_${key}`],
    apiCall: async (endpoint: string, options?: RequestInit) => {
        // Basic IPC mapping for API calls inside Electron
        if ((window as any).electronAPI && (window as any).electronAPI.apiCall) {
            return (window as any).electronAPI.apiCall(endpoint, options);
        }
        throw new Error('electronAPI.apiCall not implemented');
    },
};
