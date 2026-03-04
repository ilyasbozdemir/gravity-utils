import { NetworkToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Ağ & Network Araçları | Gravity Utils',
    description: 'IP hesaplayıcı, subnet maskesi ve network analiz araçları.',
};

export default function NetworkToolkitPage() {
    return <NetworkToolkit />;
}
