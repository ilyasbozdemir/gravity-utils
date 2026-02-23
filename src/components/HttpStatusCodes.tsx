'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Globe, Info, CheckCircle2, AlertCircle, AlertTriangle, XCircle, Terminal, BookOpen, ExternalLink, HelpCircle, Lightbulb, Code2, Rocket } from 'lucide-react';

const STATUS_CODES = [
    // 1xx: Informational
    {
        code: 100, phrase: 'Continue', category: 'Informational',
        desc: 'Devam Et.',
        longDesc: 'Sunucunun isteğin başlıklarını aldığını ve gövdesini (body) almaya hazır olduğunu belirtir.',
        rootCause: 'Büyük veri yüklemeleri öncesi "Expect: 100-continue" başlığı kullanımı.',
        solution: 'İstemci gövdeyi göndermeye başlamalıdır.',
        example: '1 GB video yüklemeden önce sunucuya "Kabul eder misin?" diye soran bir client.',
        proTip: 'Düşük bant genişliği olan kullanıcılarda gereksiz veri transferini önlemek için hayati önem taşır.'
    },
    {
        code: 101, phrase: 'Switching Protocols', category: 'Informational',
        desc: 'Protokol Değiştiriliyor.',
        longDesc: 'İstemcinin Upgrade başlığındaki isteği üzerine sunucu protokol değiştiriyor (örn: HTTP -> WebSocket).',
        rootCause: 'Canlı bağlantı (Websocket) veya HTTP/2 yükseltme isteği.',
        solution: 'Bağlantı artık yeni kurallara göre yönetilir.',
        example: 'Chat uygulamasına girerken HTTP\'den WebSocket\'e geçiş.',
        proTip: 'Bu koddan sonra TCP bağlantısı kesilmez, sadece üzerindeki dil/protokol değişir.'
    },
    {
        code: 102, phrase: 'Processing', category: 'Informational',
        desc: 'İşleniyor.',
        longDesc: 'Sunucu isteği aldı ancak işlem hala devam ediyor (WebDAV).',
        rootCause: 'Arka planda süren uzun kopyalama veya silme işlemleri.',
        solution: 'Timeout yememek için istemciye "hala buradayım" sinyali gönderir.',
        example: 'Bulut depolama servisinde 10.000 dosyayı başka bir klasöre taşırken.',
        proTip: 'Sunucu tarafında "Request Timeout" oluşmasını engellemek için kullanılır.'
    },
    {
        code: 103, phrase: 'Early Hints', category: 'Informational',
        desc: 'Erken İpuçları (Performans Canavarı).',
        longDesc: 'Sunucu henüz HTML\'i hazırlamaya çalışırken, tarayıcıya "lazım olacak CSS ve JS\'leri şimdiden indir" der.',
        rootCause: 'Modern performans optimizasyonu (HTTP/2-3 Push alternatifi).',
        solution: 'Tarayıcı ana sayfa henüz inmeden kaynakları kütüphanesine çeker.',
        example: 'Link: </main.css>; rel=preload; as=style başlığı ile gönderilen bir 103 yanıtı.',
        proTip: 'Özellikle LCP (Largest Contentful Paint) metriklerini iyileştirmek için mükemmeldir. Cloudflare gibi CDN\'ler bunu destekler.'
    },

    // 2xx: Success
    {
        code: 200, phrase: 'OK', category: 'Success',
        desc: 'Başarılı.',
        longDesc: 'Her şey yolunda. İsteğin karşılığı başarıyla döndü.',
        rootCause: 'Standart API çağrısı başarısı.',
        solution: 'Veriler doğrudan sunulabilir.',
        example: 'Bir web sayfasını başarıyla açmak veya veri listelemek.',
        proTip: 'En güvenli limandır ama her şeyi 200 dönmek yerine spesifik kodları (201, 204 vb.) kullanmak sizi profesyonel yapar.'
    },
    {
        code: 201, phrase: 'Created', category: 'Success',
        desc: 'Oluşturuldu.',
        longDesc: 'İstek başarılı oldu ve sunucuda yeni bir kaynak üretildi.',
        rootCause: 'POST veya PUT istekleri sonrası veri kaydı.',
        solution: 'Yanıtta oluşturulan kaydın ID\'si veya URL\'i dönülmelidir.',
        example: 'Yeni bir tweet attığınızda sunucunun döndüğü başarı kodu.',
        proTip: 'Bu kodu döndüğünüzde "Location" headerını da ekleyip yeni kaynağın URL\'ini vermek standartlara tam uyumdur.'
    },
    {
        code: 202, phrase: 'Accepted', category: 'Success',
        desc: 'Kabul Edildi (Asenkron).',
        longDesc: 'Sunucu isteği aldı, "tamam hallederim" dedi ama henüz bitirmedi.',
        rootCause: 'Video işleme, rapor hazırlama gibi uzun işler.',
        solution: 'Kullanıcıya "İşleniyor" mesajı gösterip bir takip ID\'si verilmeli.',
        example: 'YouTube\'a video yüklediğinizde videonun işlenmeye başlanması.',
        proTip: 'Kullanıcıyı beyaz ekranla bekletmemek (UX) için en iyi yoldur.'
    },
    {
        code: 204, phrase: 'No Content', category: 'Success',
        desc: 'İçerik Yok.',
        longDesc: 'İşlem başarıyla yapıldı ancak size geri gönderecek bir "objem" yok.',
        rootCause: 'Başarılı DELETE işlemi veya veri döndürmeyen ayar güncellemeleri.',
        solution: 'Arayüzde sadece "Başarılı" bildirimi verilir.',
        example: 'Bir fotoğrafı sildiğinizde sunucu "tmm sildim, başka bir şey yok" der.',
        proTip: 'API trafiğini minimize etmek için idealdir; boş JSON ({}) dönmek yerine bu kodu kullanın.'
    },

    // 3xx: Redirection
    {
        code: 301, phrase: 'Moved Permanently', category: 'Redirection',
        desc: 'Kalıcı Taşınma.',
        longDesc: 'Bu URL artık öldü, her şey tamamen şu yeni adreste!',
        rootCause: 'Domain/URL yapısı değişikliği.',
        solution: 'SEO puanı aktarılacağı için eski linkleri sonsuza dek yönlendirin.',
        example: 'www.eski-site.com -> www.yeni-site.com.',
        proTip: 'Arama motorları bu kodu gördüğünde indeksindeki linki de günceller.'
    },
    {
        code: 302, phrase: 'Found / Temporary Redirect', category: 'Redirection',
        desc: 'Geçici Yönlendirme (Klasik).',
        longDesc: 'Şu anlık buradayım ama sonra yine eskisine döneceğim.',
        rootCause: 'Bakım, A/B testi veya kampanya sayfaları.',
        solution: 'Kısa süreli yönlendirmeler için kullanın.',
        example: 'Kullanıcı login değilse /login sayfasına geçici atmak.',
        proTip: 'Çoğu tarayıcı 302 sonrası metodu GET\'e çevirir, bu yüzden 307 daha kesin bir çözümdür.'
    },
    {
        code: 307, phrase: 'Temporary Redirect', category: 'Redirection',
        desc: 'Geçici (Metod Korumalı).',
        longDesc: '302 ile aynıdır ama bir farkla: Veri gönderiyorsan (POST) yine POST kalarak gitmelisin.',
        rootCause: 'Güvenli veri formlarının yönlendirilmesi.',
        solution: 'Metodun (POST/PUT) değişmemesi gereken yerlerde tercih edilir.',
        example: 'Bir formu gönderirken araya giren geçici bir doğrulama sayfası.',
        proTip: 'Modern API\'lerde 302 yerine mutlaka 307 tercih edilmelidir.'
    },
    {
        code: 308, phrase: 'Permanent Redirect', category: 'Redirection',
        desc: 'Kalıcı (Metod Korumalı).',
        longDesc: '301\'in metod korumalı versiyonu. Hem kalıcı hem de POST ise POST kalsın.',
        rootCause: 'Kritik API endpoint taşınmaları.',
        solution: 'Tüm gelecek istekleri aynı metodla yeni adrese yapın.',
        example: 'Bir ödeme API\'sinin v1\'den v2\'ye kalıcı geçişi.',
        proTip: 'Veri kaybını önleyen en katı kalıcı yönlendirme budur.'
    },

    // 4xx: Client Error
    {
        code: 400, phrase: 'Bad Request', category: 'Client Error',
        desc: 'Hatalı İstek.',
        longDesc: 'Sunucu "Senin ne dediğini anlamıyorum" der. Sözdizimi hatalıdır.',
        rootCause: 'Yanlış JSON, eksik zorunlu alanlar veya hatalı tipler.',
        solution: 'Gönderilen veri API dökümanıyla karşılaştırılmalı.',
        example: 'Sayı beklenen bir alana harf göndermek.',
        proTip: 'Hata mesajında kullanıcıya tam olarak hangi alanın hatalı olduğunu belirtmek profesyonelcedir.'
    },
    {
        code: 401, phrase: 'Unauthorized', category: 'Client Error',
        desc: 'Yetkisiz.',
        longDesc: 'Kim olduğunu bilmiyorum! Lütfen giriş yap.',
        rootCause: 'Eksik veya yanlış şifre/token.',
        solution: 'Login sayfasına yönlendir veya tokenı tazele.',
        example: 'Oturum açmadan profil sayfasına girmeye çalışmak.',
        proTip: 'Bu kod kimliği sormak içindir, yetkiyi sormak için 403 kullanılır.'
    },
    {
        code: 403, phrase: 'Forbidden', category: 'Client Error',
        desc: 'Erişim Yasak.',
        longDesc: 'Kim olduğun belli ama buraya girmeye gücün yetmez!',
        rootCause: 'Rol yetersizliği (örn: Üye ama Admin panele girmeye çalışıyor).',
        solution: 'Giriş izni olan bir hesapla deneyin veya izin isteyin.',
        example: 'Normal kullanıcının başka birinin verisini silmeye çalışması.',
        proTip: 'Giriş yapsan da yapmasan da bu kaynağa bakamazsın demektir.'
    },
    {
        code: 404, phrase: 'Not Found', category: 'Client Error',
        desc: 'Bulunamadı.',
        longDesc: 'Böyle bir şey burada hiç yok (ya da benden saklanıyor).',
        rootCause: 'URL hatası, silinmiş veri veya yanlış yönlendirme.',
        solution: 'Gidilen adresi ve ID\'yi kontrol edin.',
        example: 'Google\'da olmayan bir sayfa aratmak.',
        proTip: 'Güvenlik için bazen 403 yerine 404 verilir ki kaynağın varlığı bile gizlensin.'
    },
    {
        code: 418, phrase: "I'm a teapot", category: 'Client Error',
        desc: 'Ben bir çaydanlığım.',
        longDesc: 'Kahve makinesinden çay demlemesi istenince dönen neşeli bir hata.',
        rootCause: 'Kontrol dışı veya imkansız bir istek.',
        solution: 'Bir çay demleyip sakinleşin.',
        example: '1 Nisan şakası olarak sunucuya kahve makinesi muamelesi yapmak.',
        proTip: 'Geliştiriciler arasında bir "Easter Egg" olarak hala çok popülerdir.'
    },
    {
        code: 429, phrase: 'Too Many Requests', category: 'Client Error',
        desc: 'Çok Fazla İstek (Sakin Ol).',
        longDesc: 'Dakikada 1000 istek attın, sunucu "Nefes al!" diyor.',
        rootCause: 'Botlar, saldırılar veya hatalı kod deryası.',
        solution: 'Retry-After başlığındaki süre kadar bekleyip tekrar deneyin.',
        example: 'Instagram\'da bir saniyede 100 kişiyi takip etmeye çalışmak.',
        proTip: 'API\'nizi korumak için mutlaka bir Rate-Limit mekanizması kurmalısınız.'
    },

    // 5xx: Server Error
    {
        code: 500, phrase: 'Internal Server Error', category: 'Server Error',
        desc: 'Sunucu Hatası.',
        longDesc: 'Backend tarafında kıyamet koptu, bir yerlerde kod patladı.',
        rootCause: 'Handle edilmemiş hatalar, veritabanı bağlantı çökmesi.',
        solution: 'En son neyi değiştirdin? Hemen sunucu loglarını incele!',
        example: 'NULL gelen bir veriyi işlemeye çalışırken kodun çökmesi.',
        proTip: 'En kötü hata budur çünkü kullanıcıya "ne olduğunu biz de bilmiyoruz" demektir.'
    },
    {
        code: 502, phrase: 'Bad Gateway', category: 'Server Error',
        desc: 'Hatalı Geçit.',
        longDesc: 'Ben sadece elçiyim (Proxy), arkadaki asıl sunucudan (App) yanlış yanıt aldım.',
        rootCause: 'Nginx çalışıyor ama arkasındaki Node/Python servisi kapalı.',
        solution: 'Arkadaki asıl çalışan servisi kontrol et ve restart at.',
        example: 'Site açık görünüyor ama yüklenirken bu hatayı veriyor.',
        proTip: 'Üretim ortamında genellikle App Server çöktüğünde Nginx bunu verir.'
    },
    {
        code: 503, phrase: 'Service Unavailable', category: 'Server Error',
        desc: 'Hizmet Kullanılamıyor.',
        longDesc: 'Şu an meşgulüz veya tamirdeyiz, biraz sonra gel.',
        rootCause: 'Sunucu bakımı veya aşırı trafik yüklenmesi.',
        solution: 'Gereksiz yüklerden kurtulun veya kapasite artırın.',
        example: 'Bilet satışlarında binlerce kişi aynı anda sisteme yüklendiğinde.',
        proTip: 'Bakım yaparken bu kodu dönmek SEO puanınızın düşmesini engeller.'
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
            className={`cursor-pointer group flex flex-col p-6 rounded-[2.5rem] border transition-all duration-500 ${isExpanded ? 'shadow-2xl shadow-indigo-500/15 scale-[1.02] bg-white dark:bg-slate-900' : 'hover:scale-[1.01] hover:shadow-xl'} ${getColorClass(item.category)}`}
        >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative text-5xl font-black font-mono tracking-tighter opacity-90 w-24 text-left drop-shadow-sm">{item.code}</div>
                    </div>
                    <div className="md:hidden">{getIcon(item.category)}</div>
                </div>
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-2xl leading-none uppercase italic tracking-tighter text-slate-800 dark:text-white">{item.phrase}</h3>
                        {item.proTip && <Lightbulb size={18} className="text-amber-500 animate-pulse hidden md:block" />}
                    </div>
                    <p className="text-sm font-bold opacity-70 tracking-tight">{item.desc}</p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/60 dark:bg-black/30 text-[11px] font-black uppercase tracking-[0.2em] border border-black/5 dark:border-white/10 shadow-inner">
                    {getIcon(item.category)}
                    {item.category}
                </div>
                <div className={`transition-all duration-500 p-2 rounded-full bg-black/5 dark:bg-white/5 ${isExpanded ? 'rotate-180 bg-indigo-500/10' : ''}`}>
                    <HelpCircle size={24} className="opacity-40" />
                </div>
            </div>

            {isExpanded && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-black/5 dark:border-white/10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                    {/* Teknik Analiz */}
                    <div className="p-6 bg-gradient-to-br from-white/60 to-white/20 dark:from-black/40 dark:to-black/10 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm relative overflow-hidden group/box">
                        <BookOpen size={40} className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/box:rotate-12 transition-transform duration-700" />
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-3 flex items-center gap-2">
                            <Rocket size={14} className="animate-bounce" /> Teknik Derinlik
                        </p>
                        <p className="text-base font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">{item.longDesc}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kök Neden */}
                        <div className="p-6 bg-rose-500/[0.03] rounded-[2rem] border border-rose-500/10 hover:bg-rose-500/[0.05] transition-colors">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> Kök Neden
                            </p>
                            <p className="text-sm font-bold leading-tight text-slate-700 dark:text-slate-300">{item.rootCause}</p>
                        </div>
                        {/* Çözüm */}
                        <div className="p-6 bg-emerald-500/[0.03] rounded-[2rem] border border-emerald-500/10 hover:bg-emerald-500/[0.05] transition-colors">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={14} /> Çözüm Yolu
                            </p>
                            <p className="text-sm font-bold leading-tight text-slate-700 dark:text-slate-300">{item.solution}</p>
                        </div>
                    </div>

                    {/* Örnek Senaryo */}
                    <div className="p-6 bg-blue-500/[0.03] rounded-[2rem] border border-blue-500/10">
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-500 mb-3 flex items-center gap-2">
                            <Code2 size={14} /> Örnek Senaryo
                        </p>
                        <div className="p-4 bg-black/5 dark:bg-black/30 rounded-xl font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                            {item.example}
                        </div>
                    </div>

                    {/* Pro Tip */}
                    {item.proTip && (
                        <div className="p-6 bg-amber-500/[0.03] rounded-[2rem] border border-amber-500/10 relative overflow-hidden group/tip">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rotate-45 translate-x-8 -translate-y-8" />
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-amber-500 mb-2 flex items-center gap-2">
                                <Lightbulb size={14} /> Usta İşi Notu
                            </p>
                            <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300 relative z-10">{item.proTip}</p>
                        </div>
                    )}
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
        <div className="max-w-5xl mx-auto p-8 animate-in fade-in zoom-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-16">
                <div className="flex items-center gap-6 flex-1">
                    <button onClick={handleBack} title="Geri Dön" aria-label="Geri Dön"
                        className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-3xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-lg hover:shadow-indigo-500/10">
                        <ArrowLeft className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4 tracking-[ -0.05em] uppercase italic leading-none">
                            <Terminal className="w-10 h-10 text-indigo-500" /> HTTP DEV-GUIDE
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-lg tracking-widest uppercase">Versiyon 2.0</span>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2">
                                <Globe size={14} className="text-indigo-400" /> Web Protokolleri ve Derin Analizler
                            </p>
                        </div>
                    </div>
                </div>
                <div className="relative w-full lg:w-96 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        title="Kod veya isim ara"
                        placeholder="Kod, isim veya profesyonel ipucu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-14 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] outline-none focus:border-indigo-500/50 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all font-bold text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* HTTP Group Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-14">
                {[
                    { c: '1xx', t: 'Informational', cl: 'text-sky-500 bg-sky-500/5', desc: 'Süreç bildirimleri' },
                    { c: '2xx', t: 'Success', cl: 'text-emerald-500 bg-emerald-500/5', desc: 'Başarılı işlemler' },
                    { c: '3xx', t: 'Redirection', cl: 'text-indigo-500 bg-indigo-500/5', desc: 'Yol değişimleri' },
                    { c: '4xx', t: 'Client Error', cl: 'text-rose-500 bg-rose-500/5', desc: 'İstemci hataları' },
                    { c: '5xx', t: 'Server Error', cl: 'text-orange-500 bg-orange-500/5', desc: 'Sunucu krizleri' },
                ].map(g => (
                    <div key={g.c} className={`p-4 rounded-3xl border-2 border-transparent hover:border-current transition-all cursor-default group/nav ${g.cl}`}>
                        <p className="text-xl font-black mb-1 group-hover:scale-110 transition-transform">{g.c}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{g.t}</p>
                        <p className="text-[9px] font-bold opacity-60 uppercase">{g.desc}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="grid gap-8">
                {filtered.map((item) => (
                    <StatusCard key={item.code} item={item} />
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="py-24 text-center">
                    <div className="inline-flex p-8 bg-slate-100 dark:bg-slate-800 rounded-[3rem] mb-6 relative">
                        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
                        <Search className="w-14 h-14 text-slate-400 relative z-10" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-2xl font-black uppercase italic tracking-tighter">İstediğiniz veri protokollerde bulunamadı.</p>
                    <p className="text-sm text-slate-400 mt-4 font-bold">Arama kriterlerini genişletmeyi deneyin hocam.</p>
                </div>
            )}

            {/* Masterclass Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-32 pt-20 border-t-2 border-slate-100 dark:border-white/5 relative">
                <div className="absolute -top-1 px-8 py-2 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full left-1/2 -translate-x-1/2">
                    Masterclass Bilgi Paneli
                </div>

                <div className="xl:col-span-2 space-y-8">
                    <h4 className="text-3xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Rocket className="text-indigo-500" /> Profesyonel Geliştirici Taktikleri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-indigo-500/30 transition-all">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Code2 size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">Neden 103?</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "103 Early Hints, sunucu tarafında veri çekilirken geçen ('Time to First Byte') boş zamanı değerlendirmektir. CSS ve JS'leri 103 ile önceden haber verirsen, tarayıcı arka planda indirmeye başlar. Sayfa hızı %30'a kadar artabilir!"
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-emerald-500/30 transition-all">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ExternalLink size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">E-Tag Nedir? (304)</h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "Sunucu her dosyaya bir imza (E-Tag) verir. İstemci ikinci gelişinde 'Bende bu imza var, değişti mi?' der. Sunucu 'Aynı' deyip 304 döner. Dosya indirilmez, sayfa 'şak' diye açılır. Trafik tasarrufunun kralıdır."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/40">
                    <Terminal size={140} className="absolute -bottom-12 -right-12 opacity-10 group-hover:scale-125 transition-transform duration-700 -rotate-12" />
                    <h4 className="text-4xl font-black mb-8 uppercase italic tracking-tighter relative z-10 leading-none">Senior<br />Önerisi</h4>
                    <p className="text-indigo-50 text-xl font-bold leading-relaxed mb-10 relative z-10 italic">
                        "Kullanıcıya asla ama asla çıplak '500 Internal Server Error' göstermeyin. Bu, profesyonelliğin bittiği yerdir. Hataları yakalayıp 4xx kategorisine veya anlamlı 5xx mesajlarına çevirin."
                    </p>
                    <div className="flex items-center gap-5 relative z-10 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20">
                        <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg">!</div>
                        <p className="text-xs font-black uppercase tracking-widest leading-tight">İpucu: JSON yanıtlarda hata koduna ek olarak mutlaka bir 'message' ve 'error_code' alanı ekleyin.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
