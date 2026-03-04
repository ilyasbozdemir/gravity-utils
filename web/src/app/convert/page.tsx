import { FileConverter } from '@/components/FileConverter';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dosya Dönüştürücü | Gravity Utils',
    description: 'Video, ses ve resim dosyalarını saniyeler içinde dönüştürün.',
};

export default function ConvertPage() {
    return <FileConverter file={null} />;
}
