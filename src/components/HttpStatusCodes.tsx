'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Globe, Info, CheckCircle2, AlertCircle, AlertTriangle, XCircle, Terminal, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

const STATUS_CODES = [
    // 1xx: Informational
    {
        code: 100, phrase: 'Continue', category: 'Informational',
        desc: 'İstemci isteğe devam etmelidir.',
        longDesc: 'Sunucu, isteğin ilk kısmını aldığını ve henüz geri çevrilmediğini belirtir. Büyük yüklemelerden önce "Expect: 100-continue" başlığı ile kullanılır.',
        rootCause: 'Büyük boyutlu verilerin gönderilmesi öncesi yapılan ön kontrol.',
        solution: 'İstemci, asıl veri gövdesini (body) göndermeye devam edebilir.'
    },
    {
        code: 101, phrase: 'Switching Protocols', category: 'Informational',
        desc: 'Protokol değişikliği (Örn: WebSocket).',
        longDesc: 'Sunucu, istemcinin "Upgrade" başlığında belirttiği protokol değişikliğini kabul ettiğini bildirir.',
        rootCause: 'HTTP\'den WebSocket\'e veya HTTP/2\'ye geçiş isteği.',
        solution: 'Bağlantı artık yeni protokol üzerinden devam edecektir.'
    },

    // 2xx: Success
    {
        code: 200, phrase: 'OK', category: 'Success',
        desc: 'İstek başarıyla tamamlandı.',
        longDesc: 'En yaygın başarı kodudur. Yanıtın içeriği kullanılan metoda bağlıdır (GET için kaynak, POST için işlem sonucu).',
        rootCause: 'Standart başarılı işlem.',
        solution: 'İşlem tamam, alınan veriler kullanılabilir.'
    },
    {
        code: 201, phrase: 'Created', category: 'Success',
        desc: 'Yeni bir kaynak oluşturuldu.',
        longDesc: 'İstek başarılı oldu ve bir veya daha fazla yeni kaynak üretildi. Genellikle POST istekleri sonrası döner.',
        rootCause: 'Yeni kayıt/dosya oluşturma başarısı.',
        solution: 'Yeni kaynağa genellikle "Location" başlığındaki URL üzerinden erişilebilir.'
    },
    {
        code: 204, phrase: 'No Content', category: 'Success',
        desc: 'İçerik yok (Başarılı).',
        longDesc: 'İstek başarılı ancak yanıtın gövdesi (body) boştur. Genellikle başarılı metin güncellemeleri veya silme (DELETE) işlemleri sonrası kullanılır.',
        rootCause: 'Veri dönmeye gerek olmayan başarılı işlem.',
        solution: 'Arayüzde sadece başarı bildirimi gösterilebilir, veri beklenmemelidir.'
    },

    // 3xx: Redirection
    {
        code: 301, phrase: 'Moved Permanently', category: 'Redirection',
        desc: 'Kalıcı olarak taşındı.',
        longDesc: 'İstenen kaynak kalıcı olarak yeni bir URI\'ye taşınmıştır. Arama motorları ve istemciler bu yeni adresi hafızaya almalıdır.',
        rootCause: 'URL yapısı değişikliği, domain taşıma.',
        solution: 'Eski URL yerine yeni URL kullanılmalı (SEO için kritiktir).'
    },
    {
        code: 304, phrase: 'Not Modified', category: 'Redirection',
        desc: 'Değişiklik yok (Önbellek).',
        longDesc: 'İstemciye, elindeki önbelleğe alınmış versiyonun hala güncel olduğu söylenir. Veri trafiği tasarrufu sağlar.',
        rootCause: 'E-Tag veya Last-Modified kontrolü sonucu kaynağın aynı kalması.',
        solution: 'Yerel önbellekteki (cache) veri kullanılmaya devam edilmelidir.'
    },

    // 4xx: Client Error
    {
        code: 400, phrase: 'Bad Request', category: 'Client Error',
        desc: 'Geçersiz istek (Sözdizimi hatası).',
        longDesc: 'Sunucu, gelen isteği yanlış format, hatalı JSON yapısı veya geçersiz parametreler nedeniyle anlayamadı.',
        rootCause: 'Hatalı client-side kodu, eksik zorunlu alanlar, yanlış JSON formatı.',
        solution: 'Gönderilen veri yapısı (Body, Params) API dökümanına göre kontrol edilmeli.'
    },
    {
        code: 401, phrase: 'Unauthorized', category: 'Client Error',
        desc: 'Kimlik doğrulama gerekiyor.',
        longDesc: 'İstek için geçerli kimlik doğrulama bilgilerinin bulunmadığını veya yetersiz olduğunu belirtir.',
        rootCause: 'Eksik Token (JWT), yanlış kullanıcı adı/şifre, süresi dolmuş oturum.',
        solution: 'Kullanıcı giriş yapmalı veya Bearer Token başlığa eklenmeli.'
    },
    {
        code: 403, phrase: 'Forbidden', category: 'Client Error',
        desc: 'Erişim yasaklandı.',
        longDesc: 'Kimlik doğrulanmış olabilir ancak kullanıcının bu işlemi yapmaya yetkisi yoktur (Örn: Admin paneline girmeye çalışan normal kullanıcı).',
        rootCause: 'Yetersiz kullanıcı rolü, erişim izni (CORS) sorunları.',
        solution: 'Kullanıcı yetkileri kontrol edilmeli veya erişim izinleri düzenlenmeli.'
    },
    {
        code: 404, phrase: 'Not Found', category: 'Client Error',
        desc: 'Kaynak bulunamadı.',
        longDesc: 'Sunucu istenen adreste bir içerik bulamadı. Hatalı URL veya silinmiş içerik durumunda döner.',
        rootCause: 'Yanlış URL yolu, silinmiş veritabanı kaydı, ID hatası.',
        solution: 'Endpoint adresi ve ID parametreleri kontrol edilmeli.'
    },
    {
        code: 429, phrase: 'Too Many Requests', category: 'Client Error',
        desc: 'Çok fazla istek (Rate Limit).',
        longDesc: 'İstemci belirlenen zaman dilimi içinde çok fazla istek gönderdi. Bir güvenlik ve performans önlemidir.',
        rootCause: 'Botlar, kontrolsüz döngüler, paylaşılan IP üzerinden aşırı kullanım.',
        solution: 'İstekler arası süre artırılmalı veya Retry-After başlığındaki süre beklenmeli.'
    },

    // 5xx: Server Error
    {
        code: 500, phrase: 'Internal Server Error', category: 'Server Error',
        desc: 'Sunucu hatası.',
        longDesc: 'Sunucu tarafında kodsal bir çökme veya beklenmedik bir durum oluştuğunu belirten genel hata kodudur.',
        rootCause: 'Handle edilmemiş exception\'lar, veritabanı bağlantı hataları, config sorunları.',
        solution: 'Sunucu logları (error logs) incelenmeli, try-catch blokları kontrol edilmeli.'
    },
    {
        code: 502, phrase: 'Bad Gateway', category: 'Server Error',
        desc: 'Geçersiz yanıt (Proxy hatası).',
        longDesc: 'Ağ geçidi (Proxy) görevi gören sunucu, arkasındaki asıl sunucudan geçersiz bir yanıt aldı.',
        rootCause: 'Nginx/Apache\'nin arkasındaki uygulamanın (Node, Python vb.) kapalı olması.',
        solution: 'Arkadaki asıl uygulama servisinin çalışıp çalışmadığı kontrol edilmeli.'
    },
    {
        code: 503, phrase: 'Service Unavailable', category: 'Server Error',
        desc: 'Hizmet kullanılamıyor.',
        longDesc: 'Sunucu şu anda isteği işleyemiyor. Genellikle bakım çalışması veya aşırı yüklenme nedeniyle olur.',
        rootCause: 'Sunucu bakımı, kapasite aşımı, servis çökmesi.',
        solution: 'Bir süre bekleyip tekrar denenmeli, sunucu kapasitesi artırılmalı.'
    },
    {
        code: 504, phrase: 'Gateway Timeout', category: 'Server Error',
        desc: 'Zaman aşımı (Proxy).',
        longDesc: 'Ağ geçidi sunucusu, asıl sunucudan zamanında yanıt alamadı. Uzun süren işlemler nedeniyle olur.',
        rootCause: 'Çok yavaş çalışan veritabanı sorguları, dış servislerin geç yanıt vermesi.',
        solution: 'İşlem süreleri optimize edilmeli, proxy timeout süreleri artırılmalı.'
    },
];

const StatusCard = ({ item }: { item: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`cursor-pointer group flex flex-col p-6 rounded-[2rem] border transition-all duration-300 ${isExpanded ? 'shadow-2xl shadow-indigo-500/10 scale-[1.01]' : 'hover:scale-[1.005]'} ${getColorClass(item.category)}`}
        >
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-4xl font-black font-mono tracking-tighter opacity-80 w-20">{item.code}</div>
                    <div className="md:hidden">{getIcon(item.category)}</div>
                </div>
                <div className="flex-1 text-left">
                    <h3 className="font-black text-xl leading-none mb-1 uppercase italic tracking-tight">{item.phrase}</h3>
                    <p className="text-sm font-medium opacity-80">{item.desc}</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 dark:bg-black/20 text-[10px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5">
                    {getIcon(item.category)}
                    {item.category}
                </div>
                <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <HelpCircle size={20} className="opacity-40" />
                </div>
            </div>

            {isExpanded && (
                <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 text-left">
                    <div className="p-5 bg-white/40 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-2">
                            <BookOpen size={12} /> Detaylı Teknik Analiz
                        </p>
                        <p className="text-sm font-medium leading-relaxed italic">{item.longDesc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-2">
                                <AlertTriangle size={12} /> Neden Olur?
                            </p>
                            <p className="text-sm font-bold leading-tight">{item.rootCause}</p>
                        </div>
                        <div className="p-5 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-2">
                                <CheckCircle2 size={12} /> Nasıl Çözülür?
                            </p>
                            <p className="text-sm font-bold leading-tight">{item.solution}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export function HttpStatusCodes() {
    const handleBack = () => { window.location.hash = ''; };
    const [search, setSearch] = useState('');

    const filtered = STATUS_CODES.filter(s =>
        s.code.toString().includes(search) ||
        s.phrase.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-4xl mx-auto p-6 animate-in fade-in zoom-in duration-300 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4 flex-1">
                    <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                        className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-sm">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3 tracking-tighter uppercase italic">
                            <Terminal className="w-8 h-8 text-indigo-500" /> HTTP DURUM REHBERİ
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2">
                            <Globe size={14} className="text-indigo-400" /> Web iletişiminin evrensel alfabesi
                        </p>
                    </div>
                </div>
                <div className="relative w-full md:w-72 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        title="Kod veya isim ara"
                        placeholder="Kod, isim veya kategori..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] outline-none focus:border-indigo-500/50 shadow-lg shadow-slate-200/20 dark:shadow-none transition-all font-bold text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* HTTP Group Info */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
                {[
                    { c: '1xx', t: 'Bilgi', cl: 'text-slate-400 bg-slate-400/5' },
                    { c: '2xx', t: 'Başarı', cl: 'text-emerald-500 bg-emerald-500/5' },
                    { c: '3xx', t: 'Yönlendirme', cl: 'text-blue-500 bg-blue-500/5' },
                    { c: '4xx', t: 'İstemci Hatası', cl: 'text-rose-500 bg-rose-500/5' },
                    { c: '5xx', t: 'Sunucu Hatası', cl: 'text-orange-500 bg-orange-500/5' },
                ].map(g => (
                    <div key={g.c} className={`p-3 rounded-2xl border border-current opacity-20 hover:opacity-100 transition-opacity text-center ${g.cl}`}>
                        <p className="text-xs font-black">{g.c}</p>
                        <p className="text-[10px] font-bold uppercase">{g.t}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="grid gap-6">
                {filtered.map((item) => (
                    <StatusCard key={item.code} item={item} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center">
                    <div className="inline-flex p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xl font-black">Aradığınız kod deryada bulunamadı.</p>
                    <p className="text-sm text-slate-400 mt-2">Başka bir anahtar kelime denemeye ne dersiniz?</p>
                </div>
            )}

            {/* Education Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20 pt-16 border-t-4 border-slate-100 dark:border-white/5">
                <div className="space-y-6">
                    <h4 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter">Biliyor musunuz?</h4>
                    <div className="space-y-4">
                        <div className="flex gap-4 items-start p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/30 transition-colors">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                <HelpCircle size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-700 dark:text-slate-200 mb-1">Durum kodları neden 3 haneli?</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">İlk hane (1-5) genel kategoriyi, diğer iki hane ise spesifik hata/durum detayını belirtir. Bu sayede tarayıcılar, kodu tam tanımasa bile genel kategoriye göre hareket edebilir.</p>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start p-5 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm group hover:border-indigo-500/30 transition-colors">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                <ExternalLink size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-700 dark:text-slate-200 mb-1">RESTful Standartları</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">Kaliteli bir API, her zaman en spesifik kodu dönmeli. "400 Bad Request" kolaya kaçmaktır; hakiki bir geliştirici veri yoksa "404", yetki yoksa "403" kullanır.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-600 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                    <Terminal size={120} className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-500" />
                    <h4 className="text-3xl font-black mb-6 uppercase italic tracking-tighter relative z-10">Usta İşi Notu</h4>
                    <p className="text-indigo-50 text-lg font-medium leading-relaxed mb-8 relative z-10">
                        "HTTP kodlarını sadece hata mesajı olarak değil, uygulamanızın konuşma dili olarak görün. 201 yerine 200 dönmek hata değildir ama 201 dönmek profesyonelliktir."
                    </p>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-black">!</div>
                        <p className="text-sm font-bold leading-tight">İpucu: Network sekmesini her zaman açık tutun, hata kodlarını canlı izlemek en iyi öğretmendir.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
