'use client';

import React from 'react';
import { PlatformProvider } from '@shared/index';
import { webAdapter } from '../adapters/web-adapter';

export const WebPlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <PlatformProvider adapter={webAdapter}>
            {children}
        </PlatformProvider>
    );
};
