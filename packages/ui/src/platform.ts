export const isElectron =
  typeof window !== 'undefined' && !!(window as any).electron

export const platform: 'electron' | 'web' = isElectron ? 'electron' : 'web'
