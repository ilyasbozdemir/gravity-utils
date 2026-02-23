'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Globe, Info, CheckCircle2, AlertCircle, AlertTriangle, XCircle, Terminal, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

const STATUS_CODES = [
    // 1xx: Informational
    {
        code: 100, phrase: 'Continue', category: 'Informational',
        desc: 'Devam Et.',
        longDesc: 'İsteğin ilk kısmının sunucuya ulaştığını ve sunucunun henüz reddetmediğini gösterir. Genellikle büyük veri yüklemeleri öncesi "Expect: 100-continue" başlığı ile kullanılır.',
        rootCause: 'Büyük boyutlu verilerin gönderilmesi öncesi yapılan ön kontrol isteği.',
        solution: 'İstemci, asıl isteğin gövdesini (body) göndermeye devam edebilir.'
    },
    {
        code: 101, phrase: 'Switching Protocols', category: 'Informational',
        desc: 'Protokol Değişikliği.',
        longDesc: 'Sunucunun, istemcinin "Upgrade" başlığında istediği protokol değişikliğini (örn: WebSocket) kabul ettiğini belirtir.',
        rootCause: 'HTTP\'den WebSocket veya HTTP/2 gibi farklı bir protokole geçiş talebi.',
        solution: 'Bağlantı artık yeni protokol üzerinden devam edecektir.'
    },
    {
        code: 102, phrase: 'Processing', category: 'Informational',
        desc: 'İşleniyor.',
        longDesc: 'Sunucunun isteği aldığını ancak işlemin henüz tamamlanmadığını belirtir (Genellikle WebDAV için).',
        rootCause: 'Zaman alan sunucu tarafı operasyonları.',
        solution: 'İstemci, işlem tamamlanana kadar yanıt beklemeye devam etmelidir.'
    },
    {
        code: 103, phrase: 'Early Hints', category: 'Informational',
        desc: 'Erken İpuçları.',
        longDesc: 'Sunucunun asıl yanıttan önce bazı Link başlıklarını göndererek tarayıcının kaynak yüklemesini hızlandırmasını sağlar.',
        rootCause: 'Performans optimizasyonu amacıyla yapılan erken sinyalleme.',
        solution: 'Tarayıcı ana yanıtı beklerken belirtilen CSS/JS dosyalarını indirmeye başlayabilir.'
    },

    // 2xx: Success
    {
        code: 200, phrase: 'OK', category: 'Success',
        desc: 'Başarılı.',
        longDesc: 'İstek sorunsuz tamamlandı. En yaygın başarı kodudur; GET için veri, POST için işlem sonucunu döner.',
        rootCause: 'Hatasız, standart bir istemci-sunucu etkileşimi.',
        solution: 'Gelen veriler doğrudan işlenebilir, işlem başarıyla noktalandı.'
    },
    {
        code: 201, phrase: 'Created', category: 'Success',
        desc: 'Oluşturuldu.',
        longDesc: 'İstek başarılı oldu ve sunucu tarafında yeni bir kaynak (data, dosya vb.) başarıyla üretildi.',
        rootCause: 'Yeni kayıt ekleme, dosya yükleme veya kaynak oluşturma başarısı.',
        solution: 'Yeni kaynağın adresine genellikle "Location" başlığından erişilebilir.'
    },
    {
        code: 202, phrase: 'Accepted', category: 'Success',
        desc: 'Kabul Edildi.',
        longDesc: 'İstek işlenmek üzere kabul edildi ancak işlem henüz sonuçlanmadı. Asenkron işler için kullanılır.',
        rootCause: 'Video convert, toplu mail gönderimi gibi arka plan görevleri.',
        solution: 'İşlemin durumu sunucunun sağladığı takip ID\'si ile kontrol edilmelidir.'
    },
    {
        code: 204, phrase: 'No Content', category: 'Success',
        desc: 'İçerik Yok.',
        longDesc: 'İstek başarılı ancak yanıtın bir gövdesi (body) yok. Genellikle silme veya güncelleme sonrası döner.',
        rootCause: 'Veri dönmeye gerek olmayan başarılı DELETE veya PUT işlemleri.',
        solution: 'Body beklenmemeli, sadece işlemin başarılı olduğu kullanıcıya yansıtılmalıdır.'
    },
    {
        code: 206, phrase: 'Partial Content', category: 'Success',
        desc: 'Kısmi İçerik.',
        longDesc: 'İstemcinin dosyanın sadece belirli bir aralığını ("Range" header) istediği ve sunucunun buna yanıt verdiği durumdur.',
        rootCause: 'Büyük dosyaların parça parça indirilmesi veya video yayını.',
        solution: 'Gelen veri parçası mevcut veri akışına eklenmeli/oynatılmalıdır.'
    },

    // 3xx: Redirection
    {
        code: 300, phrase: 'Multiple Choices', category: 'Redirection',
        desc: 'Çoklu Seçenek.',
        longDesc: 'İstenen kaynak için birden fazla seçenek (dil, format vb.) olduğunu belirtir.',
        rootCause: 'Tek URL altında farklı dosya formatları veya dil seçenekleri sunulması.',
        solution: 'Kullanıcı veya tarayıcı sunulan seçeneklerden birini tercih edip yönlenmelidir.'
    },
    {
        code: 301, phrase: 'Moved Permanently', category: 'Redirection',
        desc: 'Kalıcı Taşınma.',
        longDesc: 'İstenen kaynak kalıcı olarak yeni bir URL\'ye taşınmıştır. SEO açısından en kritik yönlendirme budur.',
        rootCause: 'Sayfa URL yapısının değişmesi veya tamamen başka bir domain\'e geçiş.',
        solution: 'Eski URL yerine sistemdeki tüm linkler yeni URL ile güncellenmelidir.'
    },
    {
        code: 302, phrase: 'Found / Redirect', category: 'Redirection',
        desc: 'Geçici Yönlendirme.',
        longDesc: 'Kaynak geçici olarak başka bir adrestedir. Gelecekte orijinal URL kullanılmaya devam edilmelidir.',
        rootCause: 'Bakım çalışmaları veya geçici kampanya sayfaları.',
        solution: 'Orijinal URL saklanmalı, bu seferlik yeni adresten veri alınmalıdır.'
    },
    {
        code: 304, phrase: 'Not Modified', category: 'Redirection',
        desc: 'Değişiklik Yok.',
        longDesc: 'İstemcinin elindeki cache verisi sunucudaki ile aynıdır. Veri trafiği yapmadan cache kullanılır.',
        rootCause: 'ETag veya Last-Modified değerlerinin değişmemiş olması.',
        solution: 'İstemci yerel cache\'indeki veriyi doğrudan kullanmaya devam etmelidir.'
    },
    {
        code: 307, phrase: 'Temporary Redirect', category: 'Redirection',
        desc: 'Geçici Yönlendirme (Metod Korumalı).',
        longDesc: '302 gibidir ancak istemcinin HTTP metodunu (örn: POST ise yine POST kalarak) değiştirmesini şart koşar.',
        rootCause: 'Metodun (POST/PUT) korunması gereken kritik yönlendirmeler.',
        solution: 'İstek aynı metod ve verilerle otomatik olarak yeni URL\'ye yapılmalıdır.'
    },
    {
        code: 308, phrase: 'Permanent Redirect', category: 'Redirection',
        desc: 'Kalıcı Yönlendirme (Metod Korumalı).',
        longDesc: '301 gibidir ancak metodun değişmesine (örn: POST\'un GET\'e dönüşmesine) izin vermez.',
        rootCause: 'API endpoint değişikliklerinde metod koruması sağlamak.',
        solution: 'Tüm gelecek istekler aynı metodla yeni adrese yönlendirilmelidir.'
    },

    // 4xx: Client Error
    {
        code: 400, phrase: 'Bad Request', category: 'Client Error',
        desc: 'Hatalı İstek.',
        longDesc: 'Sunucu, istemcinin gönderdiği veriyi/formatı anlayamadı. Muhtemelen sözdizimi hatalıdır.',
        rootCause: 'Hatalı JSON, eksik parametre veya geçersiz karaktere sahip istek gövdesi.',
        solution: 'Payload yapısı ve zorunlu alanlar API dokümantasyonuna göre düzeltilmeli.'
    },
    {
        code: 401, phrase: 'Unauthorized', category: 'Client Error',
        desc: 'Yetkisiz Erişim.',
        longDesc: 'Oturum açılmamış veya kimlik doğrulama bilgileri geçersiz/eksik.',
        rootCause: 'Bearer Token eksikliği, yanlış şifre veya süresi dolan JWT.',
        solution: 'Kullanıcı login olmalı veya header kısmına geçerli "Authorization" eklemeli.'
    },
    {
        code: 403, phrase: 'Forbidden', category: 'Client Error',
        desc: 'Erişim Yasak.',
        longDesc: 'Kimlik doğrulansa dahi, bu işlemi yapma izni (yetki seviyesi) yok.',
        rootCause: 'Rol kısıtlamaları (örn: Admin olmayan kullanıcı), IP bazlı engelleme.',
        solution: 'Kullanıcının rolü/yetkileri kontrol edilmeli veya erişim izni talep edilmeli.'
    },
    {
        code: 404, phrase: 'Not Found', category: 'Client Error',
        desc: 'Bulunamadı.',
        longDesc: 'Sunucu istenen adreste herhangi bir kaynak eşleştiremedi.',
        rootCause: 'Yazım hatası URL, silinmiş veri, yanlış route tanımı veya ID hatası.',
        solution: 'URL yolu ve gönderilen ID parametreleri mutlaka doğrulanmalı.'
    },
    {
        code: 405, phrase: 'Method Not Allowed', category: 'Client Error',
        desc: 'Metoda İzin Yok.',
        longDesc: 'Kaynak mevcut ancak bu metod (örn: GET bekleyen yere DELETE atmak) desteklenmiyor.',
        rootCause: 'Yanlış HTTP metodu kullanımı.',
        solution: 'Söz konusu endpoint için desteklenen metod (GET, POST vb.) kullanılmalı.'
    },
    {
        code: 408, phrase: 'Request Timeout', category: 'Client Error',
        desc: 'İstek Zaman Aşımı.',
        longDesc: 'İstemci isteği tamamlamakta çok yavaş kaldı, sunucu bağlantıyı kesti.',
        rootCause: 'Çok yavaş network, timeout sürelerinin kısalığı veya yarım kalan payload.',
        solution: 'İnternet bağlantısı kontrol edilip istek daha hızlı tekrar gönderilmeli.'
    },
    {
        code: 409, phrase: 'Conflict', category: 'Client Error',
        desc: 'Çakışma.',
        longDesc: 'İstek, sunucudaki mevcut kaynakla (aynı email, aynı dosya adı vb.) çakışıyor.',
        rootCause: 'Veritabanı benzersizlik (unique) kısıtlamalarının ihlali.',
        solution: 'Veriler uniklik kontrolünden geçirilmeli, çakışan alan değiştirilmelidir.'
    },
    {
        code: 410, phrase: 'Gone', category: 'Client Error',
        desc: 'Kalıcı Olarak Yok.',
        longDesc: 'Kaynak artık bulunmuyor ve geri gelmeyeceği (silindiği) doğrulanmış durumda.',
        rootCause: 'Kalıcı olarak kapatılan mağaza sayfaları veya silinen hesaplar.',
        solution: 'Bu URL\'ye olan tüm referanslar sistemden temizlenmeli.'
    },
    {
        code: 413, phrase: 'Payload Too Large', category: 'Client Error',
        desc: 'İstek Gövdesi Çok Büyük.',
        longDesc: 'Yüklenen verinin/dosyanın boyutu sunucu limitlerinin üzerinde.',
        rootCause: 'Upload limitlerinin (Nginx client_max_body_size vb.) küçük olması.',
        solution: 'Dosya küçültülmeli veya sunucu tarafındaki limitler artırılmalıdır.'
    },
    {
        code: 415, phrase: 'Unsupported Media Type', category: 'Client Error',
        desc: 'Desteklenmeyen Medya Tipi.',
        longDesc: 'Gönderilen verinin "Content-Type" formatı sunucu tarafından tanınmıyor.',
        rootCause: 'JSON beklenen yere XML göndermek veya yanlış dosya uzantısı.',
        solution: 'Header\'daki Content-Type değeri ve veri formatı eşleştirilmelidir.'
    },
    {
        code: 418, phrase: "I'm a teapot", category: 'Client Error',
        desc: "Ben bir çaydanlığım.",
        longDesc: 'HTCPCP protokolü uyarınca (1 Nisan şakası) bir çaydanlığın kahve demlemesi reddedilince döner.',
        rootCause: 'Sistemin yapamayacağı saçma/şaka amaçlı bir istek yapılması.',
        solution: 'Mizahın tadını çıkarın ve mantıklı bir istek gönderin.'
    },
    {
        code: 422, phrase: 'Unprocessable Entity', category: 'Client Error',
        desc: 'İşlenemeyen Varlık.',
        longDesc: 'İstek sözdizimi doğru olsa da mantıksal hatalar/validasyon hataları içeriyor.',
        rootCause: 'Yaş sınırı, boş bırakılamaz alan ihlali gibi iş kuralları (business logic).',
        solution: 'Validasyon hataları kullanıcıya bildirilip veriler düzeltilmelidir.'
    },
    {
        code: 429, phrase: 'Too Many Requests', category: 'Client Error',
        desc: 'Çok Fazla İstek.',
        longDesc: 'İstemci belirlenen sürede çok fazla istek yaptı (Hız sınırı aşıldı).',
        rootCause: 'Rate Limit koruması, bot hareketleri veya kontrolsüz döngüler.',
        solution: 'İstekler seyreltilmeli, "Retry-After" header süresi beklenmelidir.'
    },

    // 5xx: Server Error
    {
        code: 500, phrase: 'Internal Server Error', category: 'Server Error',
        desc: 'Genel Sunucu Hatası.',
        longDesc: 'Sunucu tarafında her şeyi bozan ancak tipi tanımlanamayan beklenmedik bir hata oluştu.',
        rootCause: 'Backend kodundaki buglar, handle edilmemiş exception\'lar.',
        solution: 'Acil Backend log analizi yapılmalı, hata takibi devreye alınmalı.'
    },
    {
        code: 501, phrase: 'Not Implemented', category: 'Server Error',
        desc: 'Uygulanmadı.',
        longDesc: 'Sunucu bu isteği yerine getirmek için gereken fonksiyonaliteye sahip değil.',
        rootCause: 'Henüz geliştirilmemiş bir API metoduna erişmeye çalışmak.',
        solution: 'İlgili özellik sunucuya eklenmeli veya alternatif yol izlenmelidir.'
    },
    {
        code: 502, phrase: 'Bad Gateway', category: 'Server Error',
        desc: 'Hatalı Geçit.',
        longDesc: 'Proxy/Gateway sunucusu, arkasındaki asıl sunucudan geçersiz bir yanıt aldı.',
        rootCause: 'Arkadaki app serverın (Node, Python vb.) kapalı olması.',
        solution: 'Alt servislerin (App, DB) çalışıp çalışmadığı denetlenmelidir.'
    },
    {
        code: 503, phrase: 'Service Unavailable', category: 'Server Error',
        desc: 'Hizmet Kullanılamıyor.',
        longDesc: 'Sunucu şu an aşırı yük altında veya bakım aşamasında olduğu için cevap veremiyor.',
        rootCause: 'Trafik piki, veritabanı göçü (migration) veya planlı bakım.',
        solution: 'Bir süre sonra tekrar denenmeli, sunucu kaynakları (CPU/RAM) artırılmalı.'
    },
    {
        code: 504, phrase: 'Gateway Timeout', category: 'Server Error',
        desc: 'Geçit Zaman Aşımı.',
        longDesc: 'Proxy sunucusu asıl sunucudan zamanında yanıt alamadı.',
        rootCause: 'Çok uzun süren DB sorguları veya dış API\'lere erişim sorunları.',
        solution: 'İşlem süreleri optimize edilmeli, timeout limitleri gözden geçirilmelidir.'
    },
    {
        code: 505, phrase: 'HTTP Version Not Supported', category: 'Server Error',
        desc: 'HTTP Sürümü Desteklenmiyor.',
        longDesc: 'Sunucu isteğin yapıldığı HTTP protokol versiyonunu (örn: 1.0) desteklemiyor.',
        rootCause: 'Eski veya çok yeni protokol sürümlerinin uyumsuzluğu.',
        solution: 'Sunucu güncellenmeli veya istemci uygun sürüme düşürülmelidir.'
    },
    {
        code: 511, phrase: 'Network Authentication Required', category: 'Server Error',
        desc: 'Ağ Yetkilendirmesi Gerekli.',
        longDesc: 'İnternete/Ağa çıkmak için bir portal üzerinden giriş yapılması gerektiğini belirtir.',
        rootCause: 'Havaalanı/Otel Wi-Fi giriş ekranları (Captive Portal).',
        solution: 'Kullanıcı bir tarayıcı açıp oturum açma işlemini tamamlamalıdır.'
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
