import { TextToolkit } from '@/components/TextToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Metin & İçerik Uzmanı | Gravity Utils',
    description: 'Metin temizleme, vaka dönüştürme ve içerik üretimi araçları.',
};

export default function TextToolkitPage() {
    return <TextToolkit />;
}
