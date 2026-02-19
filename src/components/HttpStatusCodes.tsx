'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Globe, Info, CheckCircle2, AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

const STATUS_CODES = [
    { code: 100, phrase: 'Continue', category: 'Informational', desc: 'İstemci isteğe devam etmelidir.' },
    { code: 101, phrase: 'Switching Protocols', category: 'Informational', desc: 'Sunucu protokol değiştirmeyi kabul etti.' },
    { code: 200, phrase: 'OK', category: 'Success', desc: 'İstek başarıyla tamamlandı.' },
    { code: 201, phrase: 'Created', category: 'Success', desc: 'İstek başarılı oldu ve yeni bir kaynak oluşturuldu.' },
    { code: 202, phrase: 'Accepted', category: 'Success', desc: 'İstek işlenmek üzere kabul edildi, ancak henüz tamamlanmadı.' },
    { code: 204, phrase: 'No Content', category: 'Success', desc: 'İstek başarılı ancak dönecek içerik yok.' },
    { code: 301, phrase: 'Moved Permanently', category: 'Redirection', desc: 'Kaynak kalıcı olarak başka bir URI\'ye taşındı.' },
    { code: 302, phrase: 'Found', category: 'Redirection', desc: 'Kaynak geçici olarak başka bir URI\'de bulunuyor.' },
    { code: 304, phrase: 'Not Modified', category: 'Redirection', desc: 'Kaynak son istekten beri değişmedi (Önbellek dostu).' },
    { code: 400, phrase: 'Bad Request', category: 'Client Error', desc: 'Geçersiz istek (Sunucu isteği anlayamadı).' },
    { code: 401, phrase: 'Unauthorized', category: 'Client Error', desc: 'Kimlik doğrulama gerekiyor.' },
    { code: 403, phrase: 'Forbidden', category: 'Client Error', desc: 'Erişim yasaklandı (Yetki yetersiz).' },
    { code: 404, phrase: 'Not Found', category: 'Client Error', desc: 'Kaynak bulunamadı.' },
    { code: 405, phrase: 'Method Not Allowed', category: 'Client Error', desc: 'Bu HTTP metodu (POST/GET vb.) desteklenmiyor.' },
    { code: 429, phrase: 'Too Many Requests', category: 'Client Error', desc: 'Çok fazla istek gönderildi (Hız sınırlaması).' },
    { code: 500, phrase: 'Internal Server Error', category: 'Server Error', desc: 'Sunucuda beklenmedik bir hata oluştu.' },
    { code: 502, phrase: 'Bad Gateway', category: 'Server Error', desc: 'Geçersiz yanıt (Proxy veya Gateway hatası).' },
    { code: 503, phrase: 'Service Unavailable', category: 'Server Error', desc: 'Hizmet şu an kullanılamıyor (Aşırı yük veya bakım).' },
    { code: 504, phrase: 'Gateway Timeout', category: 'Server Error', desc: 'Zaman aşımı (Proxy yanıt alamadı).' },
];

export function HttpStatusCodes({ onBack }: { onBack: () => void }) {
    const [search, setSearch] = useState('');

    const filtered = STATUS_CODES.filter(s =>
        s.code.toString().includes(search) ||
        s.phrase.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    const getIcon = (category: string) => {
        switch (category) {
            case 'Success': return <CheckCircle2 className="text-green-500" />;
            case 'Client Error': return <XCircle className="text-red-500" />;
            case 'Server Error': return <AlertCircle className="text-orange-500" />;
            case 'Redirection': return <AlertTriangle className="text-blue-500" />;
            default: return <Info className="text-slate-400" />;
        }
    };

    const getColorClass = (category: string) => {
        switch (category) {
            case 'Success': return 'border-green-200 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400';
            case 'Client Error': return 'border-red-200 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400';
            case 'Server Error': return 'border-orange-200 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400';
            case 'Redirection': return 'border-blue-200 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400';
            default: return 'border-slate-200 bg-slate-50 dark:bg-slate-900/10 text-slate-700 dark:text-slate-400';
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <Globe className="w-6 h-6 text-indigo-500" /> HTTP Durum Kodları
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">HTTP yanıt kodları ve anlamları</p>
                </div>
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Kod veya isim ara..." value={search} onChange={e => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium text-sm w-64" />
                </div>
            </div>

            <div className="md:hidden mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Kod veya isim ara..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium text-sm" />
                </div>
            </div>

            <div className="grid gap-4">
                {filtered.map((item) => (
                    <div key={item.code} className={`flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border transition-all ${getColorClass(item.category)}`}>
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-black font-mono tracking-tighter opacity-80 w-16">{item.code}</div>
                            <div className="md:hidden">{getIcon(item.category)}</div>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg leading-none mb-1">{item.phrase}</h3>
                            <p className="text-sm opacity-80">{item.desc}</p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest">
                            {getIcon(item.category)}
                            {item.category}
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center">
                    <div className="inline-flex p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Search className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold">Aradığınız kod bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
