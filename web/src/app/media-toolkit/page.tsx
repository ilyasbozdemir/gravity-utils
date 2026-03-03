import { MediaToolkit } from '@/components/MediaToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Görsel & Medya Atölyesi | Gravity Utils',
    description: 'EXIF temizleme, resim optimizasyonu ve sosyal medya araçları.',
};

export default function MediaToolkitPage() {
    return <MediaToolkit view="exif-viewer" onBack={() => { }} />;
}
