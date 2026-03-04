import React, { useContext } from 'react';

export interface PlatformAdapter {
    Link: React.ComponentType<{ href: string; children: React.ReactNode; className?: string }>;
    useNavigate: () => (path: string) => void;
    getEnv: (key: string) => string | undefined;
    apiCall: <T>(endpoint: string, options?: RequestInit) => Promise<T>;
}

export const PlatformContext = React.createContext<PlatformAdapter | null>(null);

export const usePlatform = () => {
    const context = useContext(PlatformContext);
    if (!context) {
        throw new Error('usePlatform must be used within a PlatformProvider');
    }
    return context;
};

export const PlatformProvider: React.FC<{ adapter: PlatformAdapter; children: React.ReactNode }> = ({ adapter, children }) => {
    return (
        <PlatformContext.Provider value={adapter}>
            {children}
        </PlatformContext.Provider>
    );
};
