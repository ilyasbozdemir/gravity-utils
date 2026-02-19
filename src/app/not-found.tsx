import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white p-4">
            <h1 className="text-4xl font-bold mb-4 text-cyan-500">404</h1>
            <h2 className="text-2xl font-bold mb-4">Sayfa Bulunamadı</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                Aradığınız sayfa mevcut değil veya taşınmış olabilir.
            </p>
            <Link
                href="/"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium border border-white/10"
            >
                <ArrowLeft size={18} />
                Ana Sayfaya Dön
            </Link>
        </div>
    );
}
