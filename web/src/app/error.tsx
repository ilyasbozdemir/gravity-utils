'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
            <h2 className="text-2xl font-bold mb-4">Bir şeyler ters gitti!</h2>
            <p className="text-gray-400 mb-8 max-w-md text-center">
                Uygulama beklenmedik bir hatayla karşılaştı. Lütfen tekrar deneyin.
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
            >
                Tekrar Dene
            </button>
        </div>
    );
}
