import { QrClient } from './QrClient';

export const generateStaticParams = async () => {
    // Return at least one dummy param for static export to be happy
    return [{ id: 'demo' }];
};

export default function QrSharePage() {
    return <QrClient />;
}
