import { DesignToolkit } from '@/components/DesignToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tasarım & UI Laboratuvarı | Gravity Utils',
    description: 'Renk paleti, QR kodu ve tasarım prototipleme araçları.',
};

export default function DesignToolkitPage() {
    return <DesignToolkit />;
}
