
import { TextToolkit } from '@/components/TextToolkit';

export const metadata = {
    title: 'Metin Temizleyici Pro - Gravity Utils',
    description: 'Gereksiz karakterleri ve boşlukları temizleyin.',
};

export default function TextCleanerPage() {
    return <TextToolkit view="text-cleaner" onBack={() => { }} />;
}
