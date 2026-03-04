import { useState, useEffect } from 'react';
import { isDesktop as checkIsDesktop } from '@shared/index';

/**
 * Universal Environment Helper
 */
export const isElectron = (): boolean => {
    return checkIsDesktop();
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
export const getEngineName = () => isElectron() ? "Bozdemir Desktop Engine v4.0" : "Bozdemir Web Studio v4.0";
