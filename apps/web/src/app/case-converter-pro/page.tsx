import { TextToolkit } from '@/components/TextToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Harf Durumu Değiştirici Pro | Gravity Utils',
    description: 'Büyük/küçük harf dönüşümü, başlık formatı ve daha fazlası.',
};

export default function CaseConverterPage() {
    return <TextToolkit view="case" />;
}
