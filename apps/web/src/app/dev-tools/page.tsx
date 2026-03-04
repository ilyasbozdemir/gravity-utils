import { DevTools } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Geliştirici Araçları | Gravity Utils',
    description: 'JSON formatlayıcı, kod düzenleyici ve geliştirici yardımcı araçları.',
};

export default function DevToolsPage() {
    return <DevTools />;
}
