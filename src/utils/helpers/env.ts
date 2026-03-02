export const isElectron = (): boolean => {
    return typeof window !== 'undefined' && (window as any).electron !== undefined;
};

export const getSystemInfo = async () => {
  if (isElectron()) {
    return await (window as any).electron.getSystemInfo();
  }
  return null;
};

export const getDeveloperName = () => "Ilyas Bozdemir";
export const getEngineName = () => "Bozdemir Desktop Engine v1.0";
