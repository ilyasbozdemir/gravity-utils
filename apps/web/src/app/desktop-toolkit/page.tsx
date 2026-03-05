import { DesktopToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Desktop Engine Paneli | Gravity Utils',
    description: 'Bozdemir Masaüstü motoru durumu ve güncellemeler.',
};

export default function DesktopToolkitPage() {
    return <DesktopToolkit />;
}
