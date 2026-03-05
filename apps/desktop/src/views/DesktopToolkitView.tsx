import React from 'react';
import { DesktopToolkit } from '@shared/index';

const DesktopToolkitView: React.FC = () => {
    return <DesktopToolkit onBack={() => window.history.back()} />;
};

export default DesktopToolkitView;
