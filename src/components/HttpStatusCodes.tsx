'use client';

import React, { useState } from 'react';
import { ArrowLeft, Search, Globe, Info, CheckCircle2, AlertCircle, AlertTriangle, XCircle, Terminal, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';

const STATUS_CODES = [
    // 1xx: Informational
    { code: 100, phrase: 'Continue', category: 'Informational', desc: 'Devam Et.', longDesc: 'İsteğin ilk bölümünün sunucuya ulaştığını ve sunucunun henüz reddetmediğini gösterir.', rootCause: 'Büyük veri yüklemeleri öncesi ön kontrol.', solution: 'Gövdeyi göndermeye devam edebilirsiniz.' },
    { code: 101, phrase: 'Switching Protocols', category: 'Informational', desc: 'Protokol Değiştiriliyor.', longDesc: 'Sunucu, istemcinin protokol değişikliği talebini (örn: WebSocket) kabul etti.', rootCause: 'Farklı bir protokole geçiş talebi.', solution: 'Bağlantı yeni protokol üzerinden devam eder.' },
    { code: 102, phrase: 'Processing', category: 'Informational', desc: 'İşleniyor.', longDesc: 'Sunucu isteği aldı ancak henüz tamamlamadı (WebDAV).', rootCause: 'Uzun süren sunucu tarafı operasyonları.', solution: 'Sabırla yanıt beklenmelidir.' },
    { code: 103, phrase: 'Early Hints', category: 'Informational', desc: 'Erken İpuçları.', longDesc: 'Asıl yanıttan önce Link başlıklarını göndererek tarayıcıyı hızlandırır.', rootCause: 'Performans optimizasyonu.', solution: 'Tarayıcı kaynakları indirmeye başlayabilir.' },

    // 2xx: Success
    { code: 200, phrase: 'OK', category: 'Success', desc: 'Başarılı.', longDesc: 'İstek sorunsuz tamamlandı. Standart başarı yanıtıdır.', rootCause: 'Hatasız işlem.', solution: 'Veriler işlenebilir.' },
    { code: 201, phrase: 'Created', category: 'Success', desc: 'Oluşturuldu.', longDesc: 'İstek başarılı oldu ve yeni bir kaynak üretildi.', rootCause: 'Yeni kayıt/dosya oluşturma başarısı.', solution: 'Yeni kaynağa Location başlığından erişilebilir.' },
    { code: 202, phrase: 'Accepted', category: 'Success', desc: 'Kabul Edildi.', longDesc: 'İstek işleme alındı ancak henüz bitmedi (Asenkron).', rootCause: 'Arka plan görevleri.', solution: 'Durum ID\'si ile takip edilmeli.' },
    { code: 203, phrase: 'Non-Authoritative Info', category: 'Success', desc: 'Yetkisiz Bilgi.', longDesc: 'Dönen bilgi asıl sunucudan değil, bir kopyadan geliyor.', rootCause: 'Proxy/Cache sunucu müdahalesi.', solution: 'Veri geçerli ancak orijinal olmayabilir.' },
    { code: 204, phrase: 'No Content', category: 'Success', desc: 'İçerik Yok.', longDesc: 'İşlem başarılı ancak dönecek bir yanıt gövdesi yok.', rootCause: 'Başarılı DELETE veya PUT işlemleri.', solution: 'Body beklenmemelidir.' },
    { code: 205, phrase: 'Reset Content', category: 'Success', desc: 'İçeriği Sıfırla.', longDesc: 'Sunucu istemciden dokümanı (formu) sıfırlamasını ister.', rootCause: 'İşlem sonrası temizlik talebi.', solution: 'Giriş alanları/form sıfırlanmalıdır.' },
    { code: 206, phrase: 'Partial Content', category: 'Success', desc: 'Kısmi İçerik.', longDesc: 'Dosyanın sadece belirli bir kısmı gönderildi.', rootCause: 'Range request, video stream.', solution: 'Veri parçası mevcut akışa eklenmelidir.' },
    { code: 207, phrase: 'Multi-Status', category: 'Success', desc: 'Çoklu Durum.', longDesc: 'Birden fazla işlemin durumunu XML içinde döner (WebDAV).', rootCause: 'Toplu işlemler.', solution: 'XML içindeki her durum tek tek okunmalı.' },
    { code: 208, phrase: 'Already Reported', category: 'Success', desc: 'Zaten Bildirildi.', longDesc: 'Bir kaynağın üyeleri zaten yanıtın başında listelenmiş.', rootCause: 'WebDAV döngü engelleme.', solution: 'Veri zaten mevcut olarak değerlendirilmeli.' },
    { code: 226, phrase: 'IM Used', category: 'Success', desc: 'IM Kullanıldı.', longDesc: 'Sunucu, kaynak üzerinde bir işlem (Delta) uyguladı.', rootCause: 'Delta encoding.', solution: 'Uygulanan değişiklikler işlenmeli.' },

    // 3xx: Redirection
    { code: 300, phrase: 'Multiple Choices', category: 'Redirection', desc: 'Çoklu Seçenek.', longDesc: 'İstek için birden fazla seçenek mevcut.', rootCause: 'Farklı dil/format alternatifleri.', solution: 'Uygun seçenek tercih edilmeli.' },
    { code: 301, phrase: 'Moved Permanently', category: 'Redirection', desc: 'Kalıcı Taşınma.', longDesc: 'Kaynak kalıcı olarak yeni bir URL\'ye taşındı.', rootCause: 'Domain/URL değişikliği.', solution: 'Linkler yeni URL ile güncellenmelidir.' },
    { code: 302, phrase: 'Found', category: 'Redirection', desc: 'Geçici Yönlendirme.', longDesc: 'Kaynak geçici olarak başka bir adrestedir.', rootCause: 'Bakım veya kampanya.', solution: 'Gelecekte eski URL kullanılmaya devam edilir.' },
    { code: 303, phrase: 'See Other', category: 'Redirection', desc: 'Diğerine Bak.', longDesc: 'İstek sonucu başka bir URL\'den GET ile alınmalı.', rootCause: 'POST-Redirect-GET deseni.', solution: 'Yeni URL otomatik olarak çekilmeli.' },
    { code: 304, phrase: 'Not Modified', category: 'Redirection', desc: 'Değişmedi.', longDesc: 'İstemcideki cache hala günceldir.', rootCause: 'ETag eşleşmesi.', solution: 'Yerel önbellek kullanılmalıdır.' },
    { code: 305, phrase: 'Use Proxy', category: 'Redirection', desc: 'Proxy Kullan.', longDesc: 'Sadece proxy üzerinden erişim sağlanabilir (Güvenlik riski nedeniyle artık pek kullanılmaz).', rootCause: 'Kısıtlı erişim.', solution: 'İlgili proxy ayarları yapılmalı.' },
    { code: 307, phrase: 'Temporary Redirect', category: 'Redirection', desc: 'Geçici (Metod Korumalı).', longDesc: '302 gibidir ancak metod (POST) korunur.', rootCause: 'Form verisi kaybını önleme.', solution: 'Aynı metodla yeni URL\'ye yönlenilir.' },
    { code: 308, phrase: 'Permanent Redirect', category: 'Redirection', desc: 'Kalıcı (Metod Korumalı).', longDesc: '301 gibidir ancak metod (POST) değiştirilemez.', rootCause: 'API endpoint taşıma.', solution: 'Kalıcı olarak yeni adrese aynı metodla gidilir.' },

    // 4xx: Client Error
    { code: 400, phrase: 'Bad Request', category: 'Client Error', desc: 'Hatalı İstek.', longDesc: 'Sunucu isteği anlayamadı (Hatalı JSON vb.).', rootCause: 'Sözdizimi hataları, eksik alanlar.', solution: 'İstek formatı doğrulanmalıdır.' },
    { code: 401, phrase: 'Unauthorized', category: 'Client Error', desc: 'Yetkisiz.', longDesc: 'Kimlik doğrulama gerekiyor.', rootCause: 'Eksik/Yanlış Token/Şifre.', solution: 'Oturum açılmalıdır.' },
    { code: 402, phrase: 'Payment Required', category: 'Client Error', desc: 'Ödeme Gerekli.', longDesc: 'Gelecekte kullanım için ayrılmış ancak bazı API servislerinde ücretli üyelik için kullanılır.', rootCause: 'Ödeme yapılmamış/limit dolmuş.', solution: 'Ödeme yapılması veya paket yükseltilmesi gerekebilir.' },
    { code: 403, phrase: 'Forbidden', category: 'Client Error', desc: 'Erişim Yasak.', longDesc: 'Kimlik doğru olsa bile yetki düzeyi yetersiz.', rootCause: 'Rol kısıtlamaları.', solution: 'İzinler kontrol edilmelidir.' },
    { code: 404, phrase: 'Not Found', category: 'Client Error', desc: 'Bulunamadı.', longDesc: 'Sunucu hiçbir kaynak bulamadı.', rootCause: 'Yanlış URL, silinmiş veri.', solution: 'URL ve ID parametreleri kontrol edilmeli.' },
    { code: 405, phrase: 'Method Not Allowed', category: 'Client Error', desc: 'Metoda İzin Yok.', longDesc: 'Bu HTTP metodu kaynak için kapalı.', rootCause: 'Yanlış metod (örn: GET yerine DELETE).', solution: 'Doğru metod kullanılmalıdır.' },
    { code: 406, phrase: 'Not Acceptable', category: 'Client Error', desc: 'Kabul Edilemez.', longDesc: 'İstenen format sunucuda yok.', rootCause: 'Uyumsuz Accept headerı.', solution: 'Format (JSON, XML vb.) kontrol edilmeli.' },
    { code: 407, phrase: 'Proxy Auth Required', category: 'Client Error', desc: 'Proxy Kimlik Doğrulaması.', longDesc: 'Önce proxy sunucusunda oturum açılmalı.', rootCause: 'Proxy güvenlik kısıtı.', solution: 'Proxy yetki bilgileri girilmeli.' },
    { code: 408, phrase: 'Request Timeout', category: 'Client Error', desc: 'Zaman Aşımı.', longDesc: 'İstemci çok yavaş kaldı.', rootCause: 'Network sorunları.', solution: 'Bağlantı düzelince tekrar denenmeli.' },
    { code: 409, phrase: 'Conflict', category: 'Client Error', desc: 'Çakışma.', longDesc: 'İstek mevcut veriyle çakışıyor.', rootCause: 'Zaten var olan kayıt.', solution: 'ID/Email benzersizliği kontrol edilmeli.' },
    { code: 410, phrase: 'Gone', category: 'Client Error', desc: 'Gitti.', longDesc: 'Kaynak kalıcı olarak silindi.', rootCause: 'Süresi dolan içerikler.', solution: 'Referansı sistemden silin.' },
    { code: 411, phrase: 'Length Required', category: 'Client Error', desc: 'Uzunluk Gerekli.', longDesc: 'Content-Length başlığı eksik.', rootCause: 'Boyutu belirsiz istek.', solution: 'Boyut bilgisi headera eklenmeli.' },
    { code: 412, phrase: 'Precondition Failed', category: 'Client Error', desc: 'Önkoşul Başarısız.', longDesc: 'İstekteki şartlar (If-Match vb.) sunucuyla uyuşmuyor.', rootCause: 'Versiyon çakışması.', solution: 'Durum kontrol edilip istek yenilenmeli.' },
    { code: 413, phrase: 'Payload Too Large', category: 'Client Error', desc: 'Gövde Çok Büyük.', longDesc: 'Yüklenen veri limiti aşıyor.', rootCause: 'Dosya boyutu kısıtı.', solution: 'Daha küçük dosya yükleyin.' },
    { code: 414, phrase: 'URI Too Long', category: 'Client Error', desc: 'URL Çok Uzun.', longDesc: 'URL karakter sınırı aşıldı.', rootCause: 'Çok fazla query parametresi.', solution: 'Parametreleri body içine taşıyın.' },
    { code: 415, phrase: 'Unsupported Media Type', category: 'Client Error', desc: 'Desteklenmeyen Medya.', longDesc: 'Format tanınmıyor.', rootCause: 'Yanlış Content-Type.', solution: 'Uyumlu format gönderilmelidir.' },
    { code: 416, phrase: 'Range Not Satisfiable', category: 'Client Error', desc: 'Aralık Geçersiz.', longDesc: 'İstenen dosya parçası sınır dışında.', rootCause: 'Hatalı Range headerı.', solution: 'Dosya boyutuna uygun aralık seçilmeli.' },
    { code: 417, phrase: 'Expectation Failed', category: 'Client Error', desc: 'Beklenti Başarısız.', longDesc: 'Expect headerındaki şart sunucu tarafından karşılanamadı.', rootCause: 'Eski sunucu, yeni beklenti.', solution: 'Beklenti başlığı kontrol edilmeli.' },
    { code: 418, phrase: "I'm a teapot", category: 'Client Error', desc: 'Ben bir çaydanlığım.', longDesc: '1 Nisan şakası (RFC 2324).', rootCause: 'Kahve yerine çay demleme isteği.', solution: 'Gülümseyin.' },
    { code: 421, phrase: 'Misdirected Request', category: 'Client Error', desc: 'Yanlış Yönlendirilmiş İstek.', longDesc: 'İşleyemeyecek bir sunucuya ulaştı.', rootCause: 'Yanlış konfigüre edilmiş HTTP/2.', solution: 'Doğru host bağlantısı kurulmalı.' },
    { code: 422, phrase: 'Unprocessable Entity', category: 'Client Error', desc: 'İşlenemeyen Varlık.', longDesc: 'Sözdizimi doğru ama mantık hatalı.', rootCause: 'Validasyon hataları.', solution: 'Form verileri düzeltilmelidir.' },
    { code: 423, phrase: 'Locked', category: 'Client Error', desc: 'Kilitli.', longDesc: 'Kaynak o an kilit altında (WebDAV).', rootCause: 'Başka bir işlem kullanımı.', solution: 'Biraz beklenmeli.' },
    { code: 424, phrase: 'Failed Dependency', category: 'Client Error', desc: 'Bağımlılık Başarısız.', longDesc: 'Önceki işlem başarısız olduğu için bu da başarısızdır.', rootCause: 'Zincirleme hata.', solution: 'Ana işlem düzeltilmelidir.' },
    { code: 425, phrase: 'Too Early', category: 'Client Error', desc: 'Çok Erken.', longDesc: 'Tekrar oynatma saldırısı riski nedeniyle reddedildi.', rootCause: 'Hızlı TLS yeniden bağlantısı.', solution: 'Resmi bir bağlantı beklenmeli.' },
    { code: 426, phrase: 'Upgrade Required', category: 'Client Error', desc: 'Yükseltme Gerekli.', longDesc: 'Yeni bir protokole (örn: TLS 1.3) geçilmeli.', rootCause: 'Eski güvenli olmayan bağlantı.', solution: 'Protokol güncellenmeli.' },
    { code: 428, phrase: 'Precondition Required', category: 'Client Error', desc: 'Önkoşul Gerekli.', longDesc: 'Sunucu şart bekliyor (örn: If-Match).', rootCause: 'Kayıp güncellemeleri önleme.', solution: 'Gerekli header eklenmeli.' },
    { code: 429, phrase: 'Too Many Requests', category: 'Client Error', desc: 'Çok Fazla İstek.', longDesc: 'Rate limit aşıldı.', rootCause: 'Aşırı yoğunluk/Botlar.', solution: 'Retry-After süresi kadar beklenmeli.' },
    { code: 431, phrase: 'Header Fields Too Large', category: 'Client Error', desc: 'Başlıklar Çok Büyük.', longDesc: 'Header boyutu limiti aşıyor.', rootCause: 'Çok fazla/büyük cookie.', solution: 'Cookieler temizlenmeli.' },
    { code: 451, phrase: 'Unavailable For Legal Reasons', category: 'Client Error', desc: 'Yasal Nedenlerle Yasak.', longDesc: 'Hükümet/Telif hakkı nedeniyle erişim kapatılmış.', rootCause: 'Mahkeme kararları.', solution: 'Yasal engele uyun veya VPN deneyin (kendi riskinizde).' },

    // 5xx: Server Error
    { code: 500, phrase: 'Internal Server Error', category: 'Server Error', desc: 'Sunucu Hatası.', longDesc: 'Tanımlanamayan yazılımsal çökme.', rootCause: 'Backend bugları, exceptionlar.', solution: 'Sunucu logları incelenmeli.' },
    { code: 501, phrase: 'Not Implemented', category: 'Server Error', desc: 'Uygulanmadı.', longDesc: 'Sunucu metodu tanımıyor.', rootCause: 'Eski sunucu yazılımı.', solution: 'Servis güncellenmeli.' },
    { code: 502, phrase: 'Bad Gateway', category: 'Server Error', desc: 'Hatalı Geçit.', longDesc: 'Asıl sunucudan geçersiz yanıt alındı.', rootCause: 'App server çökmesi.', solution: 'Servis/port çalışıyor mu kontrol edin.' },
    { code: 503, phrase: 'Service Unavailable', category: 'Server Error', desc: 'Hizmet Yok.', longDesc: 'Sunucu bakımda veya aşırı yüklü.', rootCause: 'Trafik piki, deployment.', solution: 'Daha sonra tekrar deneyin.' },
    { code: 504, phrase: 'Gateway Timeout', category: 'Server Error', desc: 'Geçit Zaman Aşımı.', longDesc: 'Proxy asıl sunucudan yanıt beklerken süresi doldu.', rootCause: 'Query yavaşlığı.', solution: 'İşlem süreleri optimize edilmeli.' },
    { code: 505, phrase: 'HTTP Version Not Supported', category: 'Server Error', desc: 'HTTP Sürümü Yok.', longDesc: 'Protokol sürümü desteklenmiyor.', rootCause: 'Sürüm uyumsuzluğu.', solution: 'Uyumlu versiyon kullanılmalı.' },
    { code: 506, phrase: 'Variant Also Negotiates', category: 'Server Error', desc: 'Varyant da Pazarlık Yapıyor.', longDesc: 'Döngüsel referans hatası (Konfigürasyon hatası).', rootCause: 'Yanlış server config.', solution: 'Ayarlar kontrol edilmeli.' },
    { code: 507, phrase: 'Insufficient Storage', category: 'Server Error', desc: 'Yetersiz Depolama.', longDesc: 'Disk alanı dolmuş (WebDAV).', rootCause: 'Dolu disk/kota.', solution: 'Disk alanı açılmalı.' },
    { code: 508, phrase: 'Loop Detected', category: 'Server Error', desc: 'Döngü Saptandı.', longDesc: 'Sonsuz döngü tespit edildi.', rootCause: 'WebDAV alt klasör döngüleri.', solution: 'Klasör yapısı düzeltilmeli.' },
    { code: 510, phrase: 'Not Extended', category: 'Server Error', desc: 'Uzatılmadı.', longDesc: 'İstek için daha fazla uzantı gerekiyor.', rootCause: 'Eksik eklenti.', solution: 'İstek dökümana göre genişletilmeli.' },
    { code: 511, phrase: 'Network Auth Required', category: 'Server Error', desc: 'Ağ Yetkisi Gerekli.', longDesc: 'Ağ girişi yapılmalı.', rootCause: 'Otel/Wifi portalı.', solution: 'Tarayıcıdan oturum açılmalı.' },
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
