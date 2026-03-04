import { DocumentToolkit } from '@/components/DocumentToolkit';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'PDF & Ofis Merkezi | Gravity Utils',
    description: 'PDF dönüştürme, birleştirme, bölme ve ofis belgesi araçları.',
};

export default function DocumentToolkitPage() {
    return <DocumentToolkit />;
}
