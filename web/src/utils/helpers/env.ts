import { useState, useEffect } from 'react';

export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && (window as any).electron !== undefined;
};

/**
 * Hydration Safe Hook for Electron Detection
 * Prevents "Application error: a client-side exception has occurred"
 */
export const useIsElectron = () => {
    const [isApp, setIsApp] = useState(false);
    
    useEffect(() => {
        setIsApp(isElectron());
    }, []);
    
    return isApp;
};

export const getSystemInfo = async () => {
  if (isElectron()) {
    return await (window as any).electron.getSystemInfo();
  }
  return null;
};

export const getDeveloperName = () => "Ilyas Bozdemir";
export const getEngineName = () => "Bozdemir Desktop Engine v2.0";
