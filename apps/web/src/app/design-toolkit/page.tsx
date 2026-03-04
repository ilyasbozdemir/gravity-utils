import { DesignToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tasarım & UI Araçları | Gravity Utils',
    description: 'Renk paleti, Figma araçları ve UI tasarım yardımcıları.',
};

export default function DesignToolkitPage() {
    return <DesignToolkit />;
}
