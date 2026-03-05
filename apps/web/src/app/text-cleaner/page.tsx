import { TextToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Metin Temizleyici & Düzenleyici | Gravity Utils',
    description: 'Boşlukları temizle, satırları birleştir ve gereksiz karakterleri kaldır.',
};

export default function TextCleanerPage() {
    return <TextToolkit view="text-cleaner" />;
}
