import { WebToolkit } from '@/components/WebToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Web & SEO Araçları | Gravity Utils',
    description: 'Site analiz, SEO kontrol ve web geliştirici yardımcıları.',
};

export default function WebToolkitPage() {
    return <WebToolkit />;
}
