# Gravity Utils - Proje Yetenekleri ve Sistem Özeti

Bu belge, "Gravity Utils" projesinin mevcut yeteneklerini, mimarisini ve içerdiği araçları detaylı bir şekilde listeler. Sistem, tamamen tarayıcı tabanlı (client-side) çalışan, sunucuya veri göndermeden güvenli işlem yapan bir "Hepsi Bir Arada" araç setidir.

## 🏗️ Proje Mimarisi

*   **Temel Framework:** React (Vite ile oluşturulmuş)
*   **Programlama Dili:** TypeScript
*   **Stil Kütüphanesi:** Tailwind CSS (v4) + Özel CSS (Glassmorphism efektleri)
*   **Tema Desteği:** Tam Uyumlu Aydınlık (Light) ve Karanlık (Dark) Mod
*   **Navigasyon:** State tabanlı özel yönlendirme (SPA, sayfa yenilemeden geçiş)
*   **Güvenlik Prensibi:** Tüm işlemler tarayıcıda gerçekleşir, sunucuya dosya yüklenmez (Kısmi istisnalar hariç simüle edilir veya client-side kütüphaneler kullanılır).

---

## 🚀 Mevcut Araçlar ve Özellikler

Proje, aşağıdaki kategoriler altında toplanmış geniş bir araç yelpazesine sahiptir:

### 1. 📂 Dosya ve PDF Araçları

*   **Office Tools (Ofis Araçları):**
    *   `src/components/OfficeTools.tsx`
    *   **Word ↔ PDF:** Dönüştürme simülasyonu ve arayüzü.
    *   **Excel ↔ PDF:** Dönüştürme simülasyonu ve arayüzü.
    *   **PowerPoint ↔ PDF:** Dönüştürme simülasyonu ve arayüzü.
    *   **Resim ↔ PDF:** `pdf-lib` kullanılarak gerçek istemci tabanlı dönüşüm.
*   **PDF Manager (Gelişmiş PDF Yönetimi):**
    *   `src/components/PdfManager.tsx`
    *   **Birleştirme (Merge):** Birden fazla PDF'i tek dosyada birleştirme.
    *   **Ayırma (Split):** PDF'ten sayfa çıkarma.
    *   **Sıkıştırma (Compress):** PDF dosya boyutunu küçültme (canvas render yöntemiyle).
    *   **Filigran (Watermark):** PDF üzerine metin veya resim filigranı ekleme.
    *   **Sıralama:** Sürükle-bırak veya butonlarla sayfa sıralaması değiştirme.
*   **Zip/Arşiv İnceleyici:**
    *   `src/components/ZipInspector.tsx`
    *   Dosyaları çıkarmadan (unzip yapmadan) arşiv içeriğini görüntüleme.
    *   ZIP, DOCX, XLSX gibi paketli formatların iç yapısını gezme.
    *   Dosya önizleme (Görsel, Metin, Kod).
*   **Dosya Dönüştürücü (Genel):**
    *   `src/components/FileConverter.tsx` (Legacy/Genel amaçlı dönüşümler).

### 2. 🖼️ Görsel ve Medya Araçları

*   **Resim Optimizasyonu:**
    *   `src/components/ImageOptimizer.tsx`
    *   Resim sıkıştırma, format değiştirme (PNG, JPG, WEBP).
    *   Kalite ayarı ve boyutlandırma.
*   **Sosyal Medya Boyutlandırıcı:**
    *   `src/components/SocialResizer.tsx`
    *   Görselleri Instagram, Twitter, LinkedIn vb. platformların standartlarına göre otomatik kırpma/boyutlandırma.
*   **Favicon Oluşturucu:**
    *   `src/components/FaviconGenerator.tsx`
    *   Yüklenen görselden farklı boyutlarda (16x16, 32x32 vb.) ikon setleri oluşturma.
*   **QR Kod Yönetimi:**
    *   `src/components/QrManager.tsx`
    *   Metin/URL'den QR kod oluşturma.
    *   Görselden QR kod tarama/okuma.
*   **Exif Temizleyici:**
    *   `src/components/ExifCleaner.tsx`
    *   Fotoğraflardaki meta verileri (konum, kamera bilgisi vb.) görüntüleme ve silme.

### 3. 👨‍💻 Geliştirici Araçları (DevTools)

*   **JSON Formatlayıcı:**
    *   `src/components/JsonFormatter.tsx`
    *   JSON doğrulama, formatlama (beautify) ve sıkıştırma (minify).
*   **YAML ↔ JSON Çevirici:**
    *   `src/components/YamlConverter.tsx`
    *   YAML ve JSON formatları arasında çift yönlü dönüşüm.
*   **JWT Debugger:**
    *   `src/components/JwtDebugger.tsx`
    *   JSON Web Token çözme ve içeriğini (header, payload) görüntüleme.
*   **Base64 Araçları:**
    *   `src/components/Base64Viewer.tsx`
    *   Dosya veya metni Base64'e çevirme / Base64'ü dosyaya çevirme.
*   **URL Encoder / Decoder:**
    *   `src/components/UrlEncoder.tsx`
*   **UUID Oluşturucu:**
    *   `src/components/UuidGenerator.tsx` (V1, V4 vb. UUID üretimi).

### 4. 🔒 Güvenlik Araçları

*   **Dosya Şifreleyici:**
    *   `src/components/FileEncryptor.tsx`
    *   AES-GCM algoritması ile tarayıcı tabanlı dosya şifreleme ve şifre çözme.
*   **Hash Oluşturucu:**
    *   `src/components/HashGenerator.tsx`
    *   Dosya veya metin için MD5, SHA-1, SHA-256, SHA-512 özetleri oluşturma.

### 5. 🛠️ Genel ve Metin Araçları

*   **Birim Çevirici:**
    *   `src/components/UnitConverter.tsx`
    *   Uzunluk, ağırlık, sıcaklık vb. birim dönüşümleri.
*   **Metin Analizi:**
    *   `src/components/TextAnalyzer.tsx`
    *   Kelime, karakter, cümle sayısı, okuma süresi hesaplama.
*   **Harf Çevirici (Case Converter):**
    *   `src/components/CaseConverter.tsx`
    *   Büyük harf, küçük harf, Title Case, camelCase, snake_case dönüşümleri.
*   **Metin Müfettişi (String Inspector):**
    *   `src/components/StringInspector.tsx`
    *   Regex testi, metin arama/değiştirme işlemleri.

---

<<<<<<< HEAD
=======
## 🎨 UI/UX ve Tasarım Bileşenleri

*   **Sidebar (Kenar Çubuğu):**
    *   `src/components/Sidebar.tsx`
    *   Kategorize edilmiş menü yapısı.
    *   Arama fonksiyonu (Araçları filtreleme).
    *   Mobil uyumlu (Hamburger menü, overlay).
*   **Tema Yönetimi:**
    *   `src/context/ThemeContext.tsx`
    *   Global tema state yönetimi.
    *   LocalStorage ile tercih kaydetme.
*   **Landing Hero:**
    *   `src/components/LandingHero.tsx`
    *   Ana sayfa karşılama ekranı.
    *   Öne çıkan araçlara hızlı erişim.
*   **Action Panel:**
    *   `src/components/ActionPanel.tsx`
    *   Dosya yüklendiğinde kullanıcının ne yapmak istediğini seçtiği ara katman.

## 📦 Kullanılan Önemli Kütüphaneler

*   `lucide-react`: İkon seti.
*   `pdf-lib`: PDF oluşturma ve düzenleme.
*   `pdfjs-dist`: PDF okuma ve render etme.
*   `jszip`: Arşiv dosyalarını işleme.
*   `js-yaml`: YAML/JSON işlemleri.
*   `file-saver`: Dosya indirme işlemleri.
*   `framer-motion` veya CSS Animasyonları: Geçiş efektleri.

---

>>>>>>> c86cfe207d4ad800119debb27f3d676457d5d078
Bu belge, sistemi Next.js veya başka bir mimariye taşırken hangi bileşenlerin ve fonksiyonların taşınması gerektiğine dair eksiksiz bir yol haritası sunar.
