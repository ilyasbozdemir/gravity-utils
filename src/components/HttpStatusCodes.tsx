"use client";

import React, { useState } from "react";
import {
    AlertCircle,
    AlertTriangle,
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    Code2,
    ExternalLink,
    Globe,
    HelpCircle,
    Info,
    Lightbulb,
    Rocket,
    Search,
    Sparkles,
    Terminal,
    XCircle,
} from "lucide-react";

const AxiosPlayground = ({ code, phrase }: { code: number; phrase: string }) => {
    const isError = code >= 400;
    const method = isError ? "post" : "get";

    const codeSnippet = isError
        ? `// Axios Hata Yakalama (${code})
axios.${method}('/api/resource', { data: 'test' })
  .catch(error => {
    if (error.response && error.response.status === ${code}) {
      console.error("Hata: ${phrase}");
      // Çözüm: Logları incele ve veriyi doğrula
    }
  });`
        : `// Axios Başarılı İstek (${code})
axios.${method}('/api/resource')
  .then(response => {
    if (response.status === ${code}) {
      console.log("Başarılı: ${phrase}");
      console.log(response.data);
    }
  });`;

    return (
        <div className="p-6 bg-slate-950 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group/axios">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/axios:opacity-20 transition-opacity">
                <Code2 size={60} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-400 mb-4 flex items-center gap-2">
                <Terminal size={14} className="animate-pulse" /> Axios Implementation
            </p>
            <div className="relative">
                <pre className="text-[12px] font-mono text-slate-300 overflow-x-auto selection:bg-indigo-500/30">
                    <code className="block py-2 leading-relaxed">
                        {codeSnippet}
                    </code>
                </pre>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(codeSnippet);
                    }}
                    className="absolute top-0 right-0 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-[10px] font-bold text-slate-400 uppercase"
                >
                    kopyala
                </button>
            </div>
        </div>
    );
};

const STATUS_CODES = [
    // 1xx: Informational
    {
        code: 100,
        phrase: "Continue",
        category: "Informational",
        desc: "Devam Et.",
        longDesc:
            "Sunucunun isteğin başlıklarını aldığını ve gövdesini (body) almaya hazır olduğunu belirtir.",
        rootCause:
            'Büyük veri yüklemeleri öncesi "Expect: 100-continue" başlığı kullanımı.',
        solution: "İstemci gövdeyi göndermeye başlamalıdır.",
        example:
            '1 GB video yüklemeden önce sunucuya "Kabul eder misin?" diye soran bir client.',
        proTip:
            "Düşük bant genişliği olan kullanıcılarda gereksiz veri transferini önlemek için hayati önem taşır.",
    },
    {
        code: 101,
        phrase: "Switching Protocols",
        category: "Informational",
        desc: "Protokol Değiştiriliyor.",
        longDesc:
            "İstemcinin Upgrade başlığındaki isteği üzerine sunucu protokol değiştiriyor (örn: HTTP -> WebSocket).",
        rootCause: "Canlı bağlantı (Websocket) geçiş isteği.",
        solution: "Bağlantı artık yeni kurallara göre yönetilir.",
        example: "Chat uygulamasına girerken HTTP'den WebSocket'e geçiş.",
        proTip:
            "Bu koddan sonra TCP bağlantısı kesilmez, sadece üzerindeki dil/protokol değişir. HTTP/2 için pratikte ALPN kullanılır.",
    },
    {
        code: 102,
        phrase: "Processing",
        category: "Informational",
        desc: "İşleniyor.",
        longDesc: "Sunucu isteği aldı ancak işlem hala devam ediyor (WebDAV).",
        rootCause: "Arka planda süren uzun kopyalama veya silme işlemleri.",
        solution:
            'Timeout yememek için istemciye "hala buradayım" sinyali gönderir.',
        example:
            "Bulut depolama servisinde 10.000 dosyayı başka bir klasöre taşırken.",
        proTip:
            'Sunucu tarafında "Request Timeout" oluşmasını engellemek için kullanılır.',
    },
    {
        code: 103,
        phrase: "Early Hints",
        category: "Informational",
        desc: "Erken İpuçları.",
        longDesc:
            "Sunucu henüz HTML'i hazırlamaya çalışırken tarayıcıya \"lazım olacak CSS ve JS'leri şimdiden indir\" der.",
        rootCause:
            "Modern performans optimizasyonu (HTTP/2-3 Push alternatifi).",
        solution:
            "Tarayıcı ana sayfa henüz inmeden kaynakları kütüphanesine çeker.",
        example:
            "Link: </main.css>; rel=preload; as=style başlığı ile gönderilen bir 103 yanıtı.",
        proTip:
            "Özellikle LCP metriklerini iyileştirmek için mükemmeldir. CDN, reverse proxy veya edge runtime desteği yoksa çalışmayabilir.",
    },
    {
        code: 105,
        phrase: "Name Not Resolved (Deprecated)",
        category: "Informational",
        desc: "Kullanımdan Kaldırıldı.",
        longDesc:
            "Eski bazı Google protokollerinde kullanılan ancak artık standartlarda yeri olmayan bir koddur.",
        rootCause: "Geçmişten kalan spesifik protokol kalıntıları.",
        solution:
            "Modern uygulamalarda bu kod yerine standart hata veya bilgi kodları kullanılmalıdır.",
        example:
            "Eski bazı proxy yapılarında DNS sorunlarını belirtmek için kullanılırdı.",
        proTip:
            'Bu kod artık "deprecated" durumdadır, yeni projelerde asla yer vermeyin.',
    },

    // 2xx: Success
    {
        code: 200,
        phrase: "OK",
        category: "Success",
        desc: "Başarılı.",
        longDesc: "Her şey yolunda. İsteğin karşılığı başarıyla döndü.",
        rootCause: "Standart API çağrısı başarısı.",
        solution: "Veriler doğrudan sunulabilir.",
        example: "Bir web sayfasını başarıyla açmak veya veri listelemek.",
        proTip:
            "En güvenli limandır ama her şeyi 200 dönmek yerine spesifik kodları (201, 204 vb.) kullanmak sizi profesyonel yapar.",
        lessonNote: "200 yanıtı 'İstek başarıyla alındı ve her şey yolunda' demektir. Ancak bir kaynak oluşturulduğunda (örneğin yeni bir kayıt) 201 Created döndürmek, sadece işlemin tamamlandığını değil, yeni bir verinin de sisteme eklendiğini açıkça belirtir. Bu tür ayrımlar API kalitesini yükseltir.",
    },
    {
        code: 201,
        phrase: "Created",
        category: "Success",
        desc: "Oluşturuldu.",
        longDesc: "İstek başarılı oldu ve sunucuda yeni bir kaynak üretildi.",
        rootCause: "POST veya PUT istekleri sonrası veri kaydı.",
        solution: "Yanıtta oluşturulan kaydın ID'si veya URL'i dönülmelidir.",
        example: "Yeni bir tweet attığınızda sunucunun döndüğü başarı kodu.",
        proTip:
            'Bu kodu döndüğünüzde "Location" headerını da ekleyip yeni kaynağın URL\'ini vermek standartlara tam uyumdur.',
    },
    {
        code: 202,
        phrase: "Accepted",
        category: "Success",
        desc: "Kabul Edildi (Asenkron).",
        longDesc:
            'Sunucu isteği aldı, "tamam hallederim" dedi ama henüz bitirmedi.',
        rootCause: "Video işleme, rapor hazırlama gibi uzun işler.",
        solution:
            'Kullanıcıya "İşleniyor" mesajı gösterip bir takip ID\'si verilmeli.',
        example:
            "YouTube'a video yüklediğinizde videonun işlenmeye başlanması.",
        proTip:
            "Kullanıcıyı beyaz ekranla bekletmemek (UX) için en iyi yoldur.",
    },
    {
        code: 203,
        phrase: "Non-Authoritative Info",
        category: "Success",
        desc: "Yetkisiz Bilgi.",
        longDesc: "Dönen bilgi asıl sunucudan değil, bir kopyadan geliyor.",
        rootCause: "Proxy/Cache sunucu müdahalesi.",
        solution: "Veri geçerli ancak orijinal olmayabilir.",
        example:
            "Bir proxy üzerinden gelen 200 yanıtının modifiye edilmiş versiyonu.",
        proTip:
            "Genellikle bir proxy sunucusu headerlar üzerinde değişiklik yaptığında döner.",
    },
    {
        code: 204,
        phrase: "No Content",
        category: "Success",
        desc: "İçerik Yok.",
        longDesc:
            'İşlem başarıyla yapıldı ancak size geri gönderecek bir "objem" yok.',
        rootCause:
            "Başarılı DELETE işlemi veya veri döndürmeyen ayar güncellemeleri.",
        solution: 'Arayüzde sadece "Başarılı" bildirimi verilir.',
        example:
            'Bir fotoğrafı sildiğinizde sunucu "tmm sildim, başka bir şey yok" der.',
        proTip:
            "API trafiğini minimize etmek için idealdir; boş JSON ({}) dönmek yerine bu kodu kullanın.",
    },
    {
        code: 205,
        phrase: "Reset Content",
        category: "Success",
        desc: "İçeriği Sıfırla.",
        longDesc: "Sunucu istemciden dokümanı veya formu sıfırlamasını ister.",
        rootCause: "İşlem sonrası temizlik talebi.",
        solution: "Giriş alanları/form temizlenmelidir.",
        example:
            "Bir form başarıyla kaydedildikten sonra formun otomatik sıfırlanması talebi.",
        proTip:
            "Frontend tarafına formun artık temizlenmesi gerektiği sinyalini net bir şekilde verir.",
    },
    {
        code: 206,
        phrase: "Partial Content",
        category: "Success",
        desc: "Kısmi İçerik.",
        longDesc: "Dosyanın sadece belirli bir kısmı (Range) gönderildi.",
        rootCause: "Video seek işlemleri veya parça parça indirme.",
        solution: "Gelen parça mevcut akışa eklenmelidir.",
        example:
            "Netflix'te videonun ortasına tıkladığınızda sadece o saniyenin verisinin gelmesi.",
        proTip: "Büyük boyutlu verileri stream etmek için hayati bir koddur.",
    },
    {
        code: 207,
        phrase: "Multi-Status",
        category: "Success",
        desc: "Çoklu Durum.",
        longDesc: "Birden fazla işlemin sonucunu içeren bir XML yanıtı döner (WebDAV).",
        rootCause: "Aynı anda birden fazla kaynağın durumunun sorgulanması.",
        solution: "Yanıttaki her bir 'status' bloğu ayrı ayrı işlenmelidir.",
        example: "Bir klasördeki 5 dosyanın 3'ü silindi, 2'si silinemedi bilgisini tek seferde dönerken.",
        proTip: "Toplu API isteklerinde (Bulk Operations) karmaşıklığı azaltmak için tasarım kalıbı olarak kullanılabilir.",
    },
    {
        code: 208,
        phrase: "Already Reported",
        category: "Success",
        desc: "Zaten Bildirildi.",
        longDesc: "Bir DAV bağlamında, kaynağın üyeleri yanıtın önceki bir bölümünde zaten numaralandırılmıştır.",
        rootCause: "Aynı verinin tekrar tekrar listelenmesini önlemek.",
        solution: "İstemci bu kısmı atlayıp mevcut referansı kullanabilir.",
        example: "Döngüsel referans içeren klasör yapılarında verinin replikasyonunu önlemek.",
        proTip: "Veritabanı dökümlerinde veya derin JSON objelerinde gereksiz şişmeyi engeller.",
    },
    {
        code: 226,
        phrase: "IM Used",
        category: "Success",
        desc: "IM Kullanıldı.",
        longDesc: "Sunucu, kaynak üzerindeki bir GET isteğini tamamladı ve yanıt, geçerli örneğe uygulanan bir veya daha fazla örneğin sonucudur.",
        rootCause: "Delta encoding (fark kodlaması) kullanımı.",
        solution: "İstemci gelen farkı mevcut kaynağına 'yama' (patch) olarak uygulamalıdır.",
        example: "Sadece değişen dosya parçalarının indirilmesi (Git diff gibi).",
        proTip: "Mobil veri kullanımını azaltmak için hardcore performans optimizasyonlarında tercih edilir.",
    },

    // 3xx: Redirection
    {
        code: 301,
        phrase: "Moved Permanently",
        category: "Redirection",
        desc: "Kalıcı Taşınma.",
        longDesc: "Bu URL artık öldü, her şey tamamen şu yeni adreste!",
        rootCause: "Domain/URL yapısı değişikliği.",
        solution:
            "SEO puanı aktarılacağı için eski linkleri sonsuza dek yönlendirin.",
        example: "www.eski-site.com -> www.yeni-site.com.",
        proTip:
            "Arama motorları bu kodu gördüğünde indeksindeki linki de günceller.",
        lessonNote: "301 yönlendirmesi 'kalıcı' bir taşınmayı ifade eder. Arama motorlarına sayfanın artık tamamen yeni bir adreste olduğunu bildirir. Bu sayede eski sayfanın kazandığı tüm SEO değeri (link juice) yeni sayfaya aktarılır. Geçici durumlar için 302 kullanılması, SEO gücünün eski sayfada kalmasına neden olabilir.",
    },
    {
        code: 302,
        phrase: "Found / Temporary Redirect",
        category: "Redirection",
        desc: "Geçici Yönlendirme (Klasik).",
        longDesc: "Şu anlık buradayım ama sonra yine eskisine döneceğim.",
        rootCause: "Bakım, A/B testi veya kampanya sayfaları.",
        solution: "Kısa süreli yönlendirmeler için kullanın.",
        example: "Kullanıcı login değilse /login sayfasına geçici atmak.",
        proTip:
            "Çoğu tarayıcı 302 sonrası metodu GET'e çevirir, bu yüzden 307 daha kesin bir çözümdür.",
    },
    {
        code: 304,
        phrase: "Not Modified",
        category: "Redirection",
        desc: "Değişmedi.",
        longDesc:
            "İstemcideki cache hala günceldir, veri transferine gerek yok.",
        rootCause: "ETag eşleşmesi sonucu verinin aynı kalması.",
        solution: "Yerel önbellek kullanılmalıdır.",
        example:
            "Logoyu her sayfa yenilemede tekrar indirmemek için kullanılır.",
        proTip:
            "Network trafiğini %90'a kadar azaltan gizli bir performans hilesidir.",
    },
    {
        code: 307,
        phrase: "Temporary Redirect",
        category: "Redirection",
        desc: "Geçici (Metod Korumalı).",
        longDesc:
            "302 ile aynıdır ama bir farkla: Veri gönderiyorsan (POST) yine POST kalarak gitmelisin.",
        rootCause: "Güvenli veri formlarının yönlendirilmesi.",
        solution:
            "Metodun (POST/PUT) değişmemesi gereken yerlerde tercih edilir.",
        example:
            "Bir formu gönderirken araya giren geçici bir doğrulama sayfası.",
        proTip: "Modern API'lerde 302 yerine mutlaka 307 tercih edilmelidir.",
    },
    {
        code: 308,
        phrase: "Permanent Redirect",
        category: "Redirection",
        desc: "Kalıcı (Metod Korumalı).",
        longDesc:
            "301'in metod korumalı versiyonu. Hem kalıcı hem de POST ise POST kalsın.",
        rootCause: "Kritik API endpoint taşınmaları.",
        solution: "Tüm gelecek istekleri aynı metodla yeni adrese yapın.",
        example: "Bir ödeme API'sinin v1'den v2'ye kalıcı geçişi.",
        proTip: "Veri kaybını önleyen en katı kalıcı yönlendirme budur.",
    },
    {
        code: 300,
        phrase: "Multiple Choices",
        category: "Redirection",
        desc: "Çoklu Seçenek.",
        longDesc: "İsteğin birden fazla olası yanıtı var. Kullanıcı veya kullanıcı aracı birini seçmelidir.",
        rootCause: "Aynı kaynağın farklı formatlarda (HTML, JSON, XML) bulunması.",
        solution: "Yanıttaki seçeneklerden biri seçilerek yeni bir istek yapılmalıdır.",
        example: "Video indirme sitesinde farklı çözünürlük seçeneklerinin sunulması.",
        proTip: "Genellikle video formatları veya dil seçenekleri arasında otomatik seçim yapamayan tarayıcılar için kullanılır.",
    },
    {
        code: 303,
        phrase: "See Other",
        category: "Redirection",
        desc: "Diğerine Bak.",
        longDesc: "İstediğiniz kaynağı GET metoduyla başka bir URL'den alabilirsiniz.",
        rootCause: "Form gönderimi (POST) sonrası kullanıcıyı başka bir sayfaya yönlendirme gereği.",
        solution: "Farklı bir URL'ye GET isteği yapın.",
        example: "Ödeme yapıldıktan sonra 'Başarılı' sayfasına yönlendirilmek.",
        proTip: "Double-Submit (formun iki kere gitmesi) sorununu çözmek için Post-Redirect-Get paterniyle kullanılır.",
    },
    {
        code: 305,
        phrase: "Use Proxy",
        category: "Redirection",
        desc: "Proxy Kullan (Güvenlik Uyarısı).",
        longDesc: "İstenen kaynağa yalnızca yanıtta belirtilen proxy üzerinden erişilebilir.",
        rootCause: "Ağ kısıtlamaları veya güvenlik duvarı protokolleri.",
        solution: "Belirtilen proxy ayarlarını tarayıcıya uygulayıp tekrar deneyin.",
        example: "Şirket içi hassas verilere sadece VPN/Proxy üzerinden bakılabilmesi durumu.",
        proTip: "Modern tarayıcılarda güvenlik (hijacking) riskleri nedeniyle pek desteklenmez, dikkatli olun.",
    },

    // 4xx: Client Error
    {
        code: 400,
        phrase: "Bad Request",
        category: "Client Error",
        desc: "Hatalı İstek.",
        longDesc:
            'Sunucu "Senin ne dediğini anlamıyorum" der. Sözdizimi hatalıdır.',
        rootCause: "Yanlış JSON, eksik zorunlu alanlar veya hatalı tipler.",
        solution: "Gönderilen veri API dökümanıyla karşılaştırılmalı.",
        example: "Sayı beklenen bir alana harf göndermek.",
        proTip:
            "Hata mesajında kullanıcıya tam olarak hangi alanın hatalı olduğunu belirtmek profesyonelcedir.",
    },
    {
        code: 401,
        phrase: "Unauthorized",
        category: "Client Error",
        desc: "Yetkisiz.",
        longDesc: "Kim olduğunu bilmiyorum! Lütfen giriş yap.",
        rootCause: "Eksik veya yanlış şifre/token.",
        solution: "Login sayfasına yönlendir veya tokenı tazele.",
        example: "Oturum açmadan profil sayfasına girmeye çalışmak.",
        proTip:
            "Bu kod kimliği sormak içindir, yetkiyi sormak için 403 kullanılır.",
    },
    {
        code: 402,
        phrase: "Payment Required",
        category: "Client Error",
        desc: "Ödeme Gerekli.",
        longDesc: "Gelecekteki kullanımlar için ayrılmış bir koddur ancak şu an SaaS sistemlerinde yaygın kullanılır.",
        rootCause: "Abonelik süresinin dolması veya limit aşımı.",
        solution: "Ödeme sayfasına yönlendirilmeli veya paket yükseltilmelidir.",
        example: "API krediniz bittiğinde dönen hata.",
        proTip: "Aslında RFC'de tam tanımlanmadı ama Stripe gibi devler bunu standart haline getirdi.",
    },
    {
        code: 403,
        phrase: "Forbidden",
        category: "Client Error",
        desc: "Erişim Yasak.",
        longDesc: "Kim olduğun belli ama buraya girmeye gücün yetmez!",
        rootCause:
            "Rol yetersizliği (örn: Üye ama Admin panele girmeye çalışıyor).",
        solution: "Giriş izni olan bir hesapla deneyin veya izin isteyin.",
        example:
            "Normal kullanıcının başka birinin verisini silmeye çalışması.",
        proTip: "Giriş yapsan da yapmasan da bu kaynağa bakamazsın demektir.",
    },
    {
        code: 404,
        phrase: "Not Found",
        category: "Client Error",
        desc: "Bulunamadı.",
        longDesc: "Böyle bir şey burada hiç yok (ya da benden saklanıyor).",
        rootCause: "URL hatası, silinmiş veri veya yanlış yönlendirme.",
        solution: "Gidilen adresi ve ID'yi kontrol edin.",
        example: "Google'da olmayan bir sayfa aratmak.",
        proTip:
            "Güvenlik için bazen 403 yerine 404 verilir ki kaynağın varlığı bile gizlensin.",
        lessonNote: "404 hatası bazen güvenlik amacıyla bilinçli olarak kullanılır. Örneğin, bir yönetici sayfasına yetkisiz erişim denendiğinde 403 (yasak) yerine 404 dönerek o sayfanın varlığı gizlenebilir. Bu yöntem, potansiyel saldırganların sistem yapısını keşfetmesini zorlaştırır.",
    },
    {
        code: 405,
        phrase: "Method Not Allowed",
        category: "Client Error",
        desc: "Metoda İzin Yok.",
        longDesc:
            "Kaynak mevcut ancak kullandığınız HTTP metodu (örn: GET) burada yasak.",
        rootCause:
            "Yanlış metod kullanımı (örn: Sadece okuma yapılan yere POST atmak).",
        solution: "Allow headerındaki izinli metodları kontrol edin.",
        example:
            "Bir kullanıcıyı silmek için GET metodunu kullanmaya çalışmak.",
        proTip:
            "API tasarlarken readonly endpointlere POST atıldığında mutlaka bu kodu dönün.",
    },
    {
        code: 406,
        phrase: "Not Acceptable",
        category: "Client Error",
        desc: "Kabul Edilemez.",
        longDesc: "Sunucu, istemcinin beklediği formatta (Accept header) veri üretemiyor.",
        rootCause: "İstemci JSON istiyor ama sunucu sadece XML biliyor.",
        solution: "Header bilgisini desteklenen formatlardan birine çekin.",
        example: "Accept: application/pdf gönderilen bir yere sadece plain text dönebilen sunucu.",
        proTip: "API'nizin Content-Type desteğini geniş tutmak bu hatayı minimize eder.",
    },
    {
        code: 407,
        phrase: "Proxy Authentication Required",
        category: "Client Error",
        desc: "Proxy Yetkisi Lazım.",
        longDesc: "Kaynağa erişmeden önce aradaki proxy sunucusuna giriş yapmalısın.",
        rootCause: "Kurumsal firewall yapılandırmaları.",
        solution: "Proxy-Authenticate başlığındaki kimlik bilgilerini doğrulayın.",
        example: "Ofis internetinde web sayfasına girmeden önce çıkan şirket login ekranı.",
        proTip: "401 ile benzerdir ama 407 sadece 'ara eleman' (proxy) içindir.",
    },
    {
        code: 408,
        phrase: "Request Timeout",
        category: "Client Error",
        desc: "İstek Zaman Aşımı.",
        longDesc: "İstemci isteği vaktinde tamamlayamadı, sunucu beklemekten vazgeçti.",
        rootCause: "Yavaş internet bağlantısı veya çok büyük dosya yükleme denemesi.",
        solution: "İnternet bağlantısını kontrol edip tekrar deneyin.",
        example: "Veri paketleri aşırı yavaş giderken sunucunun bağlantıyı kesmesi.",
        proTip: "Sunucu tarafındaki 'Idle Timeout' ayarlarıyla doğrudan ilişkilidir.",
    },
    {
        code: 409,
        phrase: "Conflict",
        category: "Client Error",
        desc: "Çakışma.",
        longDesc: "İstek sunucudaki güncel bir durumla çakışıyor.",
        rootCause:
            "Aynı ID ile tekrar kayıt açmaya çalışmak veya versiyon farkı.",
        solution: "Veriyi güncelleyip (fetch) tekrar göndermeyi deneyin.",
        example:
            "Zaten kayıtlı olan bir e-posta adresiyle tekrar üye olmaya çalışmak.",
        proTip:
            "Validation hataları için 422, veritabanı çakışmaları için 409 daha doğrudur.",
    },
    {
        code: 410,
        phrase: "Gone",
        category: "Client Error",
        desc: "Gitti / Kalıcı Olarak Silindi.",
        longDesc: "Kaynak eskiden buradaydı ama artık yok ve asla gelmeyecek.",
        rootCause:
            "Kalıcı olarak kapatılan sayfalar veya silinen reklam ilanları.",
        solution:
            "Referansı tamamen kaldırın, kullanıcıyı ana sayfaya yönlendirin.",
        example:
            "Süresi biten ve artık geçerli olmayan bir indirim kuponunun sayfası.",
        proTip:
            '404\'ten farkı, bu kodun bir "temizlik" sinyali olmasıdır; arama motorları bunu görünce indeksten hemen siler.',
    },
    {
        code: 411,
        phrase: "Length Required",
        category: "Client Error",
        desc: "Uzunluk Gerekli.",
        longDesc: "Content-Length başlığı belirtilmeden bu istek kabul edilemez.",
        rootCause: "Veri boyutu belirtilmeyen POST istekleri.",
        solution: "İsteğe Content-Length header'ı ekleyin.",
        example: "Gövdesi olan bir isteği boyut belirtmeden göndermeye çalışmak.",
        proTip: "Güvenlik için buffer overflow saldırılarını önlemede sunucular tarafından katı bir şekilde uygulanır.",
    },
    {
        code: 412,
        phrase: "Precondition Failed",
        category: "Client Error",
        desc: "Ön Koşul Sağlanamadı.",
        longDesc: "Sunucu, istemci tarafından belirtilen bir veya daha fazla ön koşulu (If-Match vb.) karşılamıyor.",
        rootCause: "ETag eşleşmemesi sonucu veri güncelleme çakışması.",
        solution: "Verinin güncel halini çekip (GET) tekrar deneyin.",
        example: "Siz veriyi düzenlerken başkası kaydettiği için ETag'in değişmiş olması.",
        proTip: "Optimistic Locking mekanizmalarının temel taşıdır.",
    },
    {
        code: 413,
        phrase: "Payload Too Large",
        category: "Client Error",
        desc: "İstek Gövdesi Çok Büyük.",
        longDesc: "Gönderdiğiniz veri sunucunun limitlerini aşıyor.",
        rootCause: "Çok büyük dosya yükleme (File Upload).",
        solution: "Dosyayı küçültün veya parçalara (multipart) bölüp yükleyin.",
        example: "10MB limit olan bir yere 50MB fotoğraf yüklemeye çalışmak.",
        proTip: "Nginx'te 'client_max_body_size' ayarını kontrol ederek bu limiti değiştirebilirsiniz.",
    },
    {
        code: 414,
        phrase: "URI Too Long",
        category: "Client Error",
        desc: "URL Çok Uzun.",
        longDesc: "URL adresi sunucunun işleyemeyeceği kadar fazla karakter içeriyor.",
        rootCause: "GET isteğine aşırı fazla parametre eklenmesi.",
        solution: "Verileri URL üzerinden değil, POST metoduyla gövde (body) içinde gönderin.",
        example: "Bir aramada binlerce kelimeyi URL parametresi yapmaya çalışmak.",
        proTip: "Genellikle 2048 karakter sonrası tehlikeli bölgedir.",
    },
    {
        code: 415,
        phrase: "Unsupported Media Type",
        category: "Client Error",
        desc: "Desteklenmeyen Medya.",
        longDesc: "Sunucu, isteğin içindeki veri formatını (Content-Type) anlamıyor.",
        rootCause: "Görüntü bekleyen yere .txt dosyası gönderilmesi.",
        solution: "İsteğin gövde formatını ve header'ını sunucunun beklentisine uydurun.",
        example: "JSON bekleyen API'ye XML veri yollamak.",
        proTip: "Postman'de 'Content-Type' ayarınızın doğruluğundan emin olun.",
    },
    {
        code: 418,
        phrase: "I'm a teapot",
        category: "Client Error",
        desc: "Ben bir çaydanlığım.",
        longDesc:
            "Kahve makinesinden çay demlemesi istenince dönen neşeli bir hata.",
        rootCause: "Kontrol dışı veya imkansız bir istek.",
        solution: "Bir çay demleyip sakinleşin.",
        example:
            "1 Nisan şakası olarak sunucuya kahve makinesi muamelesi yapmak.",
        proTip:
            'Geliştiriciler arasında bir "Easter Egg" olarak hala çok popülerdir.',
    },
    {
        code: 416,
        phrase: "Range Not Satisfiable",
        category: "Client Error",
        desc: "Aralık Uygun Değil.",
        longDesc: "Dosyanın istenen kısmı (örneğin 100-200. byte'lar arası) mevcut değil.",
        rootCause: "Video seek işlemi yapılırken dosya boyutundan büyük bir yerin istenmesi.",
        solution: "İstenen byte aralığını dosya boyutuna göre revize edin.",
        example: "1000 byte'lık dosyanın 2000. byte'ını istemek.",
        proTip: "İndirme yöneticileri (IDM vb.) bu hatayla sık karşılaşabilir.",
    },
    {
        code: 417,
        phrase: "Expectation Failed",
        category: "Client Error",
        desc: "Beklenti Karşılanamadı.",
        longDesc: "Sunucu, 'Expect' başlığındaki gereksinimleri karşılayamıyor.",
        rootCause: "İstemcinin sunduğu teknik spesifikasyonun sunucuda olmaması.",
        solution: "Expect başlığını kaldırın veya gereksinimleri basitleştirin.",
        example: "Sunucunun desteklemediği bir transfer kodlaması talep etmek.",
        proTip: "Nadiren görülür, genellikle custom proxy/gateway yapılarında karşımıza çıkar.",
    },
    {
        code: 421,
        phrase: "Misdirected Request",
        category: "Client Error",
        desc: "Yanlış Yönlendirilmiş İstek.",
        longDesc: "İstek, yanıt üretemeyen bir sunucuya gönderildi.",
        rootCause: "Bağlantı yeniden kullanımı (connection reuse) hataları.",
        solution: "DNS ayarlarını veya yönlendirme kurallarını kontrol edin.",
        example: "Yanlış yapılandırılmış bir load balancer/proxy üzerinden talep iletmek.",
        proTip: "HTTP/2 protokolünde sertifika çakışmalarında sıkça görülür.",
    },
    {
        code: 422,
        phrase: "Unprocessable Entity",
        category: "Client Error",
        desc: "İşlenemeyen Varlık.",
        longDesc:
            "İstek metni doğru ancak içindeki veriler mantığa aykırı (Validasyon Hatası).",
        rootCause: "Form verilerinin iş kurallarına (Business Logic) uymaması.",
        solution: "Hata mesajındaki alanları düzeltip tekrar gönderin.",
        example: "Kullanıcı adı alanını boş bırakmak veya negatif yaş girmek.",
        proTip:
            "Modern web API'lerinde en çok kullanılan hata kodlarından biridir.",
    },
    {
        code: 425,
        phrase: "Too Early",
        category: "Client Error",
        desc: "Çok Erken.",
        longDesc: "Sunucu, isteğin daha sonra tekrarlanabileceği (replay attack) endişesiyle işlemi reddediyor.",
        rootCause: "TLS Early Data (0-RTT) kullanımı sırasında oluşan güvenlik riski.",
        solution: "İsteği normal bir bağlantı (0-RTT olmayan) üzerinden tekrar deneyin.",
        example: "Bir banka işleminin güvenli olmayan hızlı bağlantı üzerinden yapılmasına izin verilmemesi.",
        proTip: "HTTP/3 ve TLS 1.3 ile gelen performans özelliklerini korurken güvenliği elden bırakmamak içindir.",
    },
    {
        code: 423,
        phrase: "Locked",
        category: "Client Error",
        desc: "Kilitli (İşlem Yasak).",
        longDesc: "Erişilmek istenen kaynak şu an başka bir işlem tarafından kilitlenmiş durumda.",
        rootCause: "Aynı anda aynı dosyayı düzenleyen iki farklı süreç.",
        solution: "Diğer işlemin bitmesini bekleyin veya kilidi kaldırın.",
        example: "Bir dokümanın aynı anda iki kişi tarafından 'check-out' edilmesi.",
        proTip: "WebDAV sistemlerinde dosya bütünlüğünü korumak için hayati öneme sahiptir.",
    },
    {
        code: 424,
        phrase: "Failed Dependency",
        category: "Client Error",
        desc: "Bağımsızlık Hatası.",
        longDesc: "İstek başarısız oldu çünkü bağımlı olduğu başka bir işlem hata verdi.",
        rootCause: "Zincirleme (sequential) yapılan isteklerin birinde kopukluk.",
        solution: "Önceki adımların başarıyla tamamlandığından emin olun.",
        example: "Klasör oluşturma hatası yüzünden klasöre dosya ekleme işleminin iptali.",
        proTip: "İşlem atomikliğini (atomicity) sağlamak için kullanılır.",
    },
    {
        code: 426,
        phrase: "Upgrade Required",
        category: "Client Error",
        desc: "Yükseltme Gerekli.",
        longDesc: "Sunucu bu isteği mevcut protokol ile yapmayı reddediyor, TLS/HTTP2 gibi bir yükseltme bekliyor.",
        rootCause: "Güvenli olmayan (HTTP) bağlantı üzerinden hassas veri talebi.",
        solution: "İsteği HTTPS veya daha modern bir sürümle tekrar yapın.",
        example: "Sadece TLS 1.3 destekleyen bir API'ye eski SSL ile bağlanmaya çalışmak.",
        proTip: "Güvenlik standartlarını yükseltmek için kullanılan zorlayıcı bir mekanizmadır.",
    },
    {
        code: 428,
        phrase: "Precondition Required",
        category: "Client Error",
        desc: "Ön Koşul Gerekli.",
        longDesc: "Kaynak üzerinde değişiklik yapmadan önce If-Match gibi bir koşul sunmalısın.",
        rootCause: "Kayıp Güncelleme (Lost Update) sorunlarını önlemek.",
        solution: "İsteğe verinin güncel versiyon ID'sini ekleyin.",
        example: "Sunucunun 'kimin verisiyle çakışacağımı bilmem lazım' demesi.",
        proTip: "API'lerde yanlışlıkla veri ezilmesini (overwrite) önleyen güvenli bir bariyerdir.",
    },
    {
        code: 429,
        phrase: "Too Many Requests",
        category: "Client Error",
        desc: "Çok Fazla İstek (Sakin Ol).",
        longDesc: 'Dakikada 1000 istek attın, sunucu "Nefes al!" diyor.',
        rootCause: "Botlar, saldırılar veya hatalı kod deryası.",
        solution:
            "Retry-After başlığındaki süre kadar bekleyip tekrar deneyin.",
        example: "Instagram'da bir saniyede 100 kişiyi takip etmeye çalışmak.",
        proTip:
            "API'nizi korumak için mutlaka bir Rate-Limit mekanizması kurmalısınız.",
    },
    {
        code: 431,
        phrase: "Request Header Fields Too Large",
        category: "Client Error",
        desc: "Başlıklar Çok Büyük.",
        longDesc: "HTTP header bilgileri (özellikle Cookie'ler) sunucun işleme limitini aştı.",
        rootCause: "Aşırı büyümüş tarayıcı çerezleri veya devasa JWT tokenlar.",
        solution: "Çerezleri temizleyin (Clear Cookies) veya token boyutunu optimize edin.",
        example: "Yüzlerce çerez biriktiğinde sitenin açılmaması durumu.",
        proTip: "Domain bazlı çerez temizliği yapmak genellikle sorunu anında çözer.",
    },
    {
        code: 444,
        phrase: "No Response",
        category: "Client Error",
        desc: "Yanıt Yok (Nginx Özel).",
        longDesc: "Sunucu bağlantıyı kesti ve hiçbir veri dönmedi.",
        rootCause: "Güvenlik duvarı veya anti-bot sistemi tarafından engellenme.",
        solution: "Bot gibi davranmadığınızdan emin olun, IP ban durumunu kontrol edin.",
        example: "Nginx'in saldırgan gördüğü IP'ye hiçbir şey demeden kapıyı kapatması.",
        proTip: "Loglarda bile görünmeyebilir, en sessiz ve etkili savunma kodudur.",
    },
    {
        code: 451,
        phrase: "Unavailable For Legal Reasons",
        category: "Client Error",
        desc: "Yasal Mevzuat Engeli.",
        longDesc: "Bu içerik mahkeme kararı veya sansür nedeniyle bu ülkede yasaklanmıştır.",
        rootCause: "Copyright ihlalleri veya hükümet engelleri.",
        solution: "Yasal süreci takip edin (veya VPN kullanın).",
        example: "YouTube'da bir videonun 'ülkenizde kullanılamıyor' uyarısı vermesi.",
        proTip: "Ray Bradbury'nin Fahrenheit 451 kitabına atıfta bulunarak isimlendirilmiştir.",
    },
    {
        code: 499,
        phrase: "Client Closed Request",
        category: "Client Error",
        desc: "İstemci İsteği Kapattı (Nginx Özel).",
        longDesc: "Sunucu yanıtı hazırlarken, istemci (tarayıcı) bağlantıyı kesti (vazgeçti).",
        rootCause: "Kullanıcının sayfa yüklenmeden 'X'e basması veya timeout süreleri.",
        solution: "Backend işleminin hızlandırılması veya istemci timeout süresinin artırılması.",
        example: "Büyük bir rapor inerken kullanıcının sabırsızlanıp tarayıcıyı kapatması.",
        proTip: "Backend servisiniz hala çalışıyor olabilir ama gönderecek bir istemci kalmamıştır; loglarda sık görülür.",
    },

    // 5xx: Server Error
    {
        code: 500,
        phrase: "Internal Server Error",
        category: "Server Error",
        desc: "Sunucu Hatası.",
        longDesc: "Backend tarafında kıyamet koptu, bir yerlerde kod patladı.",
        rootCause: "Handle edilmemiş hatalar, veritabanı bağlantı çökmesi.",
        solution: "En son neyi değiştirdin? Hemen sunucu loglarını incele!",
        example: "NULL gelen bir veriyi işlemeye çalışırken kodun çökmesi.",
        proTip:
            'En kötü hata budur çünkü kullanıcıya "ne olduğunu biz de bilmiyoruz" demektir.',
    },
    {
        code: 501,
        phrase: "Not Implemented",
        category: "Server Error",
        desc: "Uygulanmadı.",
        longDesc: "Sunucu, isteği yerine getirmek için gereken işlevselliğe sahip değil.",
        rootCause: "Sunucunun tanımadığı bir metod veya desteklenmeyen bir özellik talebi.",
        solution: "Sadece GET veya HEAD gibi standart metodları kullanın veya sunucu özelliklerini güncelleyin.",
        example: "Eski bir sunucuya modern bir PATCH veya TRACE isteği göndermek.",
        proTip: "API'nizde planlanan ama henüz kodlanmamış endpointler için geçici olarak dönebilirsiniz.",
    },
    {
        code: 502,
        phrase: "Bad Gateway",
        category: "Server Error",
        desc: "Hatalı Geçit.",
        longDesc:
            "Ben sadece elçiyim (Proxy), arkadaki asıl sunucudan (App) yanlış yanıt aldım.",
        rootCause:
            "Nginx çalışıyor ama arkasındaki Node/Python servisi kapalı.",
        solution: "Arkadaki asıl çalışan servisi kontrol et ve restart at.",
        example: "Site açık görünüyor ama yüklenirken bu hatayı veriyor.",
        proTip:
            "Üretim ortamında genellikle App Server çöktüğünde Nginx bunu verir.",
    },
    {
        code: 503,
        phrase: "Service Unavailable",
        category: "Server Error",
        desc: "Hizmet Kullanılamıyor.",
        longDesc: "Şu an meşgulüz veya tamirdeyiz, biraz sonra gel.",
        rootCause: "Sunucu bakımı veya aşırı trafik yüklenmesi.",
        solution: "Gereksiz yüklerden kurtulun veya kapasite artırın.",
        example:
            "Bilet satışlarında binlerce kişi aynı anda sisteme yüklendiğinde.",
        proTip:
            "Bakım yaparken bu kodu dönmek SEO puanınızın düşmesini engeller.",
    },
    {
        code: 504,
        phrase: "Gateway Timeout",
        category: "Server Error",
        desc: "Ağ Geçidi Zaman Aşımı.",
        longDesc: "Sunucu bir ağ geçidi (proxy) gibi davranırken, arkadaki asıl sunucudan zamanında yanıt alamadı.",
        rootCause: "Backend servisinin aşırı yavaş olması veya kilitlenmesi.",
        solution: "Arkadaki veritabanı sorgularını veya API servislerini optimize edin.",
        example: "Load balancer Node.js servisine sorar ama Node.js 60 saniye boyunca susar.",
        proTip: "Nginx proxy_read_timeout ayarı ile bu süreyi yönetebilirsiniz.",
    },
    {
        code: 505,
        phrase: "HTTP Version Not Supported",
        category: "Server Error",
        desc: "Sürüm Desteklenmiyor.",
        longDesc: "Sunucu, isteğin içinde belirtilen HTTP protokol sürümünü desteklemiyor.",
        rootCause: "Çok eski veya deneysel bir HTTP protokolü ile istek yapmak.",
        solution: "Standard HTTP/1.1 veya HTTP/2 sürümlerini kullanın.",
        example: "Henüz çıkmamış bir HTTP/4.0 ile veri yollamaya çalışmak.",
        proTip: "Modern tarayıcılar bunu otomatik halleder, genellikle hatalı scriptlerden kaynaklanır.",
    },
    {
        code: 506,
        phrase: "Variant Also Negotiates",
        category: "Server Error",
        desc: "Varyant Çakışması.",
        longDesc: "Sunucu yapılandırmasında bir döngü oluştu; kaynak kendi kendine referans veriyor.",
        rootCause: "Yanlış 'Content Negotiation' yapılandırması.",
        solution: "Sunucu tarafındaki yönlendirme (rewrite) kurallarını inceleyin.",
        example: "Dil seçimi yaparken sonsuz bir yönlendirme döngüsüne girmek.",
        proTip: "İçerik müzakeresi yapan Apache/Nginx ayarlarında hata arayın.",
    },
    {
        code: 507,
        phrase: "Insufficient Storage",
        category: "Server Error",
        desc: "Yetersiz Depolama.",
        longDesc: "Sunucunun isteği tamamlamak için gereken alanı (disk) kalmadı.",
        rootCause: "Dolmuş harddiskler veya kota aşımı.",
        solution: "Disk alanını temizleyin veya depolama kapasitesini artırın.",
        example: "Disk doluyken sunucuya 100MB video yüklemeye çalışmak.",
        proTip: "Monitoring araçlarıyla (Zabbix, NewRelic) disk doluluk oranını önceden takip edin.",
    },
    {
        code: 508,
        phrase: "Loop Detected",
        category: "Server Error",
        desc: "Döngü Algılandı.",
        longDesc: "Sunucu, WebDAV isteğini işlerken sonsuz bir döngü fark etti.",
        rootCause: "Birbirine bağlı dosya/link yapılarındaki mantık hatası.",
        solution: "Klasör veya link yapılandırmasındaki döngüsel referansı kırın.",
        example: "A klasörü B'yi, B klasörü A'yı içeren bir yapı oluşturmak.",
        proTip: "Web crawlerlar için ölümcül bir hata kodudur, SEO'yu bitirir.",
    },
    {
        code: 510,
        phrase: "Not Extended",
        category: "Server Error",
        desc: "Genişletilmedi.",
        longDesc: "Sunucunun isteği yerine getirebilmesi için isteğe ek uzantılar (extensions) gerekiyor.",
        rootCause: "Eksik protokol özellikleri.",
        solution: "Gerekli tüm extension başlıklarını isteğe ekleyin.",
        example: "Özel bir güvenlik katmanı gerektiren kurumsal API istekleri.",
        proTip: "RFC 2774 kapsamında tanımlanmıştır, nadir bir durumdur.",
    },
    {
        code: 511,
        phrase: "Network Authentication Required",
        category: "Server Error",
        desc: "Ağ Kimlik Doğrulaması.",
        longDesc: "İnternete erişmeden önce ağın (Wi-Fi vb.) şartlarını kabul etmeli veya giriş yapmalısınız.",
        rootCause: "Havaalanı veya kafe Wi-Fi giriş ekranları (Captive Portal).",
        solution: "Açılan portal ekranında giriş yapın veya 'Kabul Et'e basın.",
        example: "Starbucks Wi-Fi'ına bağlanınca internetin çalışmaması ve sizi bir sayfaya atması.",
        proTip: "Bu kodun 401'den farkı, hatanın API'den değil internetin kendisinden gelmesidir.",
    },
    {
        code: 599,
        phrase: "Network Connect Timeout Error",
        category: "Server Error",
        desc: "Ağ Bağlantısı Kesildi.",
        longDesc: "İstek sunucuya hiç ulaşamadı veya arada olan bir proxy bağlantıyı kesti.",
        rootCause: "Proxy ayarları veya ISP kaynaklı bağlantı kopması.",
        solution: "Ağ bağlantınızı ve internet kablonuzu kontrol edin, bağlantı kopmuş olabilir.",
        example: "VPN açıkken internetin tamamen kesilmesi ve tarayıcının çökmesi.",
        proTip: "Yine bir HTTP standardı değil, bazı HTTP client kitaplıkları tarafından uydurulmuş 'catch-all' bir hatadır.",
    },
];

const StatusCard = ({ item }: { item: any }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const getIcon = (category: string) => {
        switch (category) {
            case "Success":
                return <CheckCircle2 className="text-green-500" />;
            case "Client Error":
                return <XCircle className="text-red-500" />;
            case "Server Error":
                return <AlertCircle className="text-orange-500" />;
            case "Redirection":
                return <AlertTriangle className="text-blue-500" />;
            default:
                return <Info className="text-slate-400" />;
        }
    };

    const getColorClass = (category: string) => {
        switch (category) {
            case "Success":
                return "border-green-200 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400";
            case "Client Error":
                return "border-red-200 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400";
            case "Server Error":
                return "border-orange-200 bg-orange-50 dark:bg-orange-900/10 text-orange-700 dark:text-orange-400";
            case "Redirection":
                return "border-blue-200 bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400";
            default:
                return "border-slate-200 bg-slate-50 dark:bg-slate-900/10 text-slate-700 dark:text-slate-400";
        }
    };

    return (
        <div
            onClick={() => setIsExpanded(!isExpanded)}
            className={`cursor-pointer group flex flex-col p-6 rounded-[2.5rem] border transition-all duration-500 ${isExpanded
                ? "shadow-2xl shadow-indigo-500/15 scale-[1.02] bg-white dark:bg-slate-900"
                : "hover:scale-[1.01] hover:shadow-xl"
                } ${getColorClass(item.category)}`}
        >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative text-5xl font-black font-mono tracking-tighter opacity-90 w-24 text-left drop-shadow-sm">
                            {item.code}
                        </div>
                    </div>
                    <div className="md:hidden">{getIcon(item.category)}</div>
                </div>
                <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-2xl leading-none uppercase italic tracking-tighter text-slate-800 dark:text-white">
                            {item.phrase}
                        </h3>
                        {item.proTip && (
                            <Lightbulb
                                size={18}
                                className="text-amber-500 animate-pulse hidden md:block"
                            />
                        )}
                    </div>
                    <p className="text-sm font-bold opacity-70 tracking-tight">
                        {item.desc}
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/60 dark:bg-black/30 text-[11px] font-black uppercase tracking-[0.2em] border border-black/5 dark:border-white/10 shadow-inner">
                    {getIcon(item.category)}
                    {item.category}
                </div>
                <div
                    className={`transition-all duration-500 p-2 rounded-full bg-black/5 dark:bg-white/5 ${isExpanded ? "rotate-180 bg-indigo-500/10" : ""
                        }`}
                >
                    <HelpCircle size={24} className="opacity-40" />
                </div>
            </div>

            {isExpanded && (
                <div className="mt-8 pt-8 border-t-2 border-dashed border-black/5 dark:border-white/10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 text-left">
                    {/* Teknik Analiz */}
                    <div className="p-6 bg-gradient-to-br from-white/60 to-white/20 dark:from-black/40 dark:to-black/10 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm relative overflow-hidden group/box">
                        <BookOpen
                            size={40}
                            className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover/box:rotate-12 transition-transform duration-700"
                        />
                        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-indigo-500 mb-3 flex items-center gap-2">
                            <Rocket size={14} className="animate-bounce" />{" "}
                            Teknik Derinlik
                        </p>
                        <p className="text-base font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                            {item.longDesc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kök Neden */}
                        <div className="p-6 bg-rose-500/[0.03] rounded-[2rem] border border-rose-500/10 hover:bg-rose-500/[0.05] transition-colors">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-rose-500 mb-3 flex items-center gap-2">
                                <AlertTriangle size={14} /> Kök Neden
                            </p>
                            <p className="text-sm font-bold leading-tight text-slate-700 dark:text-slate-300">
                                {item.rootCause}
                            </p>
                        </div>
                        {/* Çözüm */}
                        <div className="p-6 bg-emerald-500/[0.03] rounded-[2rem] border border-emerald-500/10 hover:bg-emerald-500/[0.05] transition-colors">
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-emerald-500 mb-3 flex items-center gap-2">
                                <CheckCircle2 size={14} /> Çözüm Yolu
                            </p>
                            <p className="text-sm font-bold leading-tight text-slate-700 dark:text-slate-300">
                                {item.solution}
                            </p>
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
                            <p className="text-sm font-bold leading-relaxed text-slate-700 dark:text-slate-300 relative z-10">
                                {item.proTip}
                            </p>
                        </div>
                    )}

                    {/* Academy Lesson Note */}
                    {(item as any).lessonNote && (
                        <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden group/academy">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover/academy:scale-110 transition-transform">
                                <BookOpen size={100} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3 flex items-center gap-2">
                                <Sparkles size={14} /> Bilgi Köşesi / Akademi Notu
                            </p>
                            <p className="text-sm font-bold leading-relaxed italic relative z-10">
                                "{(item as any).lessonNote}"
                            </p>
                        </div>
                    )}

                    {/* Axios Playground */}
                    <AxiosPlayground code={item.code} phrase={item.phrase} />
                </div>
            )}
        </div>
    );
};

export function HttpStatusCodes({ onBack }: { onBack?: () => void }) {
    const handleBack = onBack || (() => {
        window.location.hash = "";
    });
    const [search, setSearch] = useState("");

    const filtered = STATUS_CODES.filter((s) =>
        s.code.toString().includes(search) ||
        s.phrase.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-5xl mx-auto p-8 animate-in fade-in zoom-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-8 mb-16">
                <div className="flex items-center gap-6 flex-1">
                    <button
                        onClick={handleBack}
                        title="Geri Dön"
                        aria-label="Geri Dön"
                        className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-3xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10 shadow-lg hover:shadow-indigo-500/10"
                    >
                        <ArrowLeft className="w-8 h-8 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 dark:text-white flex items-center gap-4 tracking-[ -0.05em] uppercase italic leading-none">
                            <Terminal className="w-10 h-10 text-indigo-500" />
                            {" "}
                            HTTP DEV-GUIDE
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-500 text-[10px] font-black rounded-lg tracking-widest uppercase">
                                Versiyon 2.1
                            </span>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold flex items-center gap-2">
                                <Globe size={14} className="text-indigo-400" />
                                {" "}
                                Web Protokolleri ve Derin Analizler
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
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-8 py-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] outline-none focus:border-indigo-500/50 shadow-2xl shadow-slate-200/40 dark:shadow-none transition-all font-bold text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* HTTP Group Quick Navigation */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-14">
                {[
                    {
                        c: "1xx",
                        t: "Informational",
                        cl: "text-sky-500 bg-sky-500/5",
                        desc: "Süreç bildirimleri",
                    },
                    {
                        c: "2xx",
                        t: "Success",
                        cl: "text-emerald-500 bg-emerald-500/5",
                        desc: "Başarılı işlemler",
                    },
                    {
                        c: "3xx",
                        t: "Redirection",
                        cl: "text-indigo-500 bg-indigo-500/5",
                        desc: "Yol değişimleri",
                    },
                    {
                        c: "4xx",
                        t: "Client Error",
                        cl: "text-rose-500 bg-rose-500/5",
                        desc: "İstemci hataları",
                    },
                    {
                        c: "5xx",
                        t: "Server Error",
                        cl: "text-orange-500 bg-orange-500/5",
                        desc: "Sunucu krizleri",
                    },
                ].map((g) => (
                    <div
                        key={g.c}
                        className={`p-4 rounded-3xl border-2 border-transparent hover:border-current transition-all cursor-default group/nav ${g.cl}`}
                    >
                        <p className="text-xl font-black mb-1 group-hover:scale-110 transition-transform">
                            {g.c}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                            {g.t}
                        </p>
                        <p className="text-[9px] font-bold opacity-60 uppercase">
                            {g.desc}
                        </p>
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
                    <p className="text-slate-500 dark:text-slate-400 text-2xl font-black uppercase italic tracking-tighter">
                        İstediğiniz veri protokollerde bulunamadı.
                    </p>
                    <p className="text-sm text-slate-400 mt-4 font-bold">
                        Arama kriterlerini genişletmeyi veya farklı bir kategori seçmeyi deneyin.
                    </p>
                </div>
            )}

            {/* Masterclass Section */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-32 pt-20 border-t-2 border-slate-100 dark:border-white/5 relative">
                <div className="absolute -top-1 px-8 py-2 bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-full left-1/2 -translate-x-1/2">
                    Masterclass Bilgi Paneli
                </div>

                <div className="xl:col-span-2 space-y-8">
                    <h4 className="text-3xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Rocket className="text-indigo-500" />{" "}
                        Profesyonel Geliştirici Taktikleri
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-indigo-500/30 transition-all">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                <Code2 size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">
                                    Neden 103?
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "103 Early Hints, sunucu tarafında veri
                                    çekilirken geçen boş zamanı
                                    değerlendirmektir. CDN, reverse proxy veya
                                    edge runtime desteği yoksa çalışmayabilir!"
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-emerald-500/30 transition-all">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <ExternalLink size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">
                                    E-Tag Nedir? (304)
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "Sunucu her dosyaya bir imza (E-Tag) verir.
                                    İstemci ikinci gelişinde 'Bende bu imza var,
                                    değişti mi?' der. Sunucu 'Aynı' deyip 304
                                    döner. Trafik tasarrufunun kralıdır."
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-rose-500/30 transition-all">
                            <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <Search size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">
                                    410 vs 404 (SEO)
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "Googlebot 404 gördüğünde sayfayı hemen silmez, 'belki teknik hatadır' deyip döner. Ama 410 Gone görürse sayfayı direkt indeksten şutlar. Temizlik için 410 candır."
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-5 items-start p-8 bg-white dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group hover:border-sky-500/30 transition-all">
                            <div className="p-4 bg-sky-500/10 rounded-2xl text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                <Globe size={24} />
                            </div>
                            <div>
                                <h5 className="font-black text-slate-800 dark:text-slate-100 mb-2 uppercase tracking-tight italic">
                                    301 vs 302 (Link Juice)
                                </h5>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic">
                                    "301 tüm SEO gücünü yeni sayfaya aktarır. 302 ise geçicidir ve SEO gücü eski sayfada kalır. Kalıcı taşınmalarda 302 kullanmak SEO intiharıdır."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[3.5rem] p-12 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/40">
                    <Terminal
                        size={140}
                        className="absolute -bottom-12 -right-12 opacity-10 group-hover:scale-125 transition-transform duration-700 -rotate-12"
                    />
                    <h4 className="text-4xl font-black mb-8 uppercase italic tracking-tighter relative z-10 leading-none">
                        Senior<br />Önerisi
                    </h4>
                    <p className="text-indigo-50 text-xl font-bold leading-relaxed mb-10 relative z-10 italic">
                        "Kullanıcıya asla ama asla çıplak '500 Internal Server
                        Error' göstermeyin. Bu, profesyonelliğin bittiği yerdir.
                        Hataları yakalayıp 4xx kategorisine veya anlamlı 5xx
                        mesajlarına çevirin."
                    </p>
                    <div className="flex items-center gap-5 relative z-10 bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/20">
                        <div className="w-14 h-14 rounded-full bg-white text-indigo-600 flex items-center justify-center font-black text-2xl shadow-lg">
                            !
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest leading-tight">
                            İpucu: JSON yanıtlarda hata koduna ek olarak mutlaka
                            bir 'message' ve 'error_code' alanı ekleyin.
                        </p>
                    </div>
                </div>
            </div>

            {/* Debugging & Tools Section */}
            <div className="mt-20 p-12 bg-slate-100 dark:bg-white/[0.02] rounded-[3.5rem] border-2 border-dashed border-slate-200 dark:border-white/10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                            <Terminal className="text-indigo-500" /> Analiz Araçları
                        </h4>
                        <div className="space-y-6">
                            {[
                                { t: "Browser DevTools", d: "Ağ (Network) sekmesi, her isteğin durum kodunu, boyutunu ve zamanlamasını anlık gösterir." },
                                { t: "Curl -I", d: "Terminalden 'curl -I https://site.com' yazarak sadece header bilgilerini ve status kodunu hızlıca alabilirsiniz." },
                                { t: "WebSniffer", d: "Online araçlar ile Googlebot gibi davranıp farklı crawlerların sitenizi nasıl gördüğünü test edin." }
                            ].map((tool, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                                    <div>
                                        <p className="font-black text-sm uppercase italic text-slate-700 dark:text-slate-200">{tool.t}</p>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{tool.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-8 flex items-center gap-3 text-slate-800 dark:text-white">
                            <Rocket className="text-emerald-500" /> Metod Eşleşmeleri
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { m: "GET", s: "200 OK / 404" },
                                { m: "POST", s: "201 Created" },
                                { m: "PUT", s: "200 / 204" },
                                { m: "DELETE", s: "204 No Content" }
                            ].map((met, idx) => (
                                <div key={idx} className="p-4 bg-white dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
                                    <p className="text-xs font-black text-indigo-500 mb-1">{met.m}</p>
                                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 italic">Genelde: {met.s}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
