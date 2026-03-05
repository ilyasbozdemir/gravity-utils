import { CheckToolkit } from '@shared/index';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Güvenlik & Doğrulama | Gravity Utils',
    description: 'TCKN, IBAN ve E-posta güvenliğini anında kontrol edin.',
};

export default function CheckToolkitPage() {
    return <CheckToolkit />;
}
