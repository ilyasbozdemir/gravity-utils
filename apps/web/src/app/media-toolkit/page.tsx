import { MediaToolkit } from '@/components/MediaToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Medya & Resim İşleme | Gravity Utils',
    description: 'Resim optimizasyonu, boyutlandırma ve medya dönüştürme araçları.',
};

export default function MediaToolkitPage() {
    return <MediaToolkit />;
}
