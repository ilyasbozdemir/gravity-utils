import { DataToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Veri İşleme & Analiz | Gravity Utils',
    description: 'JSON, CSV, XML dönüşümleri ve veri analitiği araçları.',
};

export default function DataToolkitPage() {
    return <DataToolkit />;
}
