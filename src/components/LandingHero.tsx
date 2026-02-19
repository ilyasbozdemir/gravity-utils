import React from 'react';
import {
    Archive, Image as ImageIcon, ShieldCheck, Zap, Star, Calculator,
    FileText, Minimize2, Hash, Code, Search, QrCode,
    Lock, Share2, MousePointer2, Settings, Smartphone, RefreshCw, Layers, Globe
} from 'lucide-react';
import { FileDropper } from './FileDropper';

type ToolView = 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt' | 'uuid' | 'yaml' | 'jwt' | 'url';

interface LandingHeroProps {
    onFileSelect: (file: File) => void;
    onToolSelect: (tool: ToolView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onFileSelect, onToolSelect }) => {
    const [searchQuery, setSearchQuery] = React.useState('');

    return (
        <div className="px-4 pb-20">
            {/* Hero Section */}
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center relative pt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(167,139,250,0.15)_0%,rgba(96,165,250,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-4 px-4 py-2 rounded-full bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10 inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                    <Star size={14} className="fill-amber-400 text-amber-400" />
                    <span>80+ Ücretsiz Araç | %100 Güvenli ve Çevrimdışı</span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 max-w-[900px] text-slate-900 dark:text-white">
                    Profesyonel <span className="text-blue-600 dark:text-blue-400">Dosya Araçları</span> <br />
                    Elinizin Altında.
                </h1>

                <div className="w-full max-w-[700px] relative z-20 mb-12">
                    <div className="p-2 rounded-3xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-none">
                        <FileDropper onFileSelect={onFileSelect} />
                    </div>
                </div>

                {/* Quick Search Mockup */}
                <div className="relative w-full max-w-md mx-auto mb-16 px-4">
                    <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Araç ara... (Örn: pdf birleştir, exif temizle)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xl shadow-slate-200/50 dark:shadow-none"
                    />
                </div>
            </div>

            {/* Categorized Tools Menu */}
            <div className="w-full max-w-[1240px] mx-auto">
                <div className="flex flex-col gap-20">

                    {/* Category: Öne Çıkanlar */}
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400"><Zap size={20} /></div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Popüler Dönüştürmeler</h3>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            <QuickAction title="Word → PDF" onClick={() => onToolSelect('convert')} icon={<FileText size={16} />} color="blue" />
                            <QuickAction title="PDF → Word" onClick={() => onToolSelect('convert')} icon={<FileText size={16} />} color="red" />
                            <QuickAction title="Resim → PDF" onClick={() => onToolSelect('convert')} icon={<ImageIcon size={16} />} color="emerald" />
                            <QuickAction title="PDF → Resim" onClick={() => onToolSelect('convert')} icon={<ImageIcon size={16} />} color="sky" />
                            <QuickAction title="PNG → JPG" onClick={() => onToolSelect('convert')} icon={<ImageIcon size={16} />} color="indigo" />
                            <QuickAction title="PDF Birleştir" onClick={() => onToolSelect('pdf')} icon={<Layers size={16} />} color="orange" />
                        </div>
                    </section>

                    {/* Category: PDF & Doküman */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-lg text-red-600 dark:text-red-400"><FileText size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">PDF & Doküman Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<RefreshCw size={20} />}
                                title="Gelişmiş Dönüştürücü"
                                desc="80+ format desteği ile hızlı çeviri."
                                color="blue"
                                onClick={() => onToolSelect('convert')}
                            />
                            <ToolItem
                                icon={<Layers size={20} />}
                                title="PDF Yönetimi"
                                desc="Sayfa birleştir, ayır, sil ve sırala."
                                color="red"
                                onClick={() => onToolSelect('pdf')}
                            />
                            <ToolItem
                                icon={<FileText size={20} />}
                                title="PDF'i Düzenlenebilir Yap"
                                desc="PDF içeriğini Word veya Metne aktarın."
                                color="amber"
                                onClick={() => onToolSelect('convert')}
                            />
                            <ToolItem
                                icon={<Search size={20} />}
                                title="Metin Analizi"
                                desc="Kelime sayımı, okuma süresi ve fazlası."
                                color="emerald"
                                onClick={() => onToolSelect('text')}
                            />
                        </div>
                    </section>

                    {/* Category: Resim & Medya */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400"><ImageIcon size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Görsel & Grafik Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Minimize2 size={20} />}
                                title="Boyut Küçültücü"
                                desc="Görsel kalitesini bozmadan optimize edin."
                                color="emerald"
                                onClick={() => onToolSelect('optimize')}
                            />
                            <ToolItem
                                icon={<Smartphone size={20} />}
                                title="Sosyal Medya Hazır"
                                desc="Instagram, X ve YouTube için tam boyutlar."
                                color="sky"
                                onClick={() => onToolSelect('social')}
                            />
                            <ToolItem
                                icon={<MousePointer2 size={20} />}
                                title="Favicon Hazırlayıcı"
                                desc="Tüm tarayıcılar için favicon paketleri üretin."
                                color="indigo"
                                onClick={() => onToolSelect('favicon')}
                            />
                            <ToolItem
                                icon={<QrCode size={20} />}
                                title="QR İşlemleri"
                                desc="QR/Barkod üretin veya görselden okuyun."
                                color="violet"
                                onClick={() => onToolSelect('qr')}
                            />
                        </div>
                    </section>

                    {/* Category: Güvenlik & Gizlilik */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400"><ShieldCheck size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Güvenlik & Gizlilik</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Lock size={20} />}
                                title="Dosya Şifreleyici"
                                desc="Şifre ile dosyalarınızı güvende tutun."
                                color="purple"
                                onClick={() => onToolSelect('encrypt')}
                            />
                            <ToolItem
                                icon={<Settings size={20} />}
                                title="Metadata Temizleyici"
                                desc="Fotoğraflardan gizli EXIF bilgilerini silin."
                                color="orange"
                                onClick={() => onToolSelect('exif')}
                            />
                            <ToolItem
                                icon={<Hash size={20} />}
                                title="Dosya Doğrulama"
                                desc="Hash (MD5, SHA2) ile dosya bütünlüğü kontrolü."
                                color="amber"
                                onClick={() => onToolSelect('hash')}
                            />
                        </div>
                    </section>

                    {/* Category: Teknik / Dev */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400"><Code size={20} /></div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Geliştirici Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Code size={20} />}
                                title="JSON Formatlayıcı"
                                desc="JSON verilerini okunabilir ve düzenli yapın."
                                color="cyan"
                                onClick={() => onToolSelect('json')}
                            />
                            <ToolItem
                                icon={<Share2 size={20} />}
                                title="Base64 Çevirici"
                                desc="Resim/Metin ile Base64 arası dönüşüm."
                                color="violet"
                                onClick={() => onToolSelect('base64')}
                            />
                            <ToolItem
                                icon={<Archive size={20} />}
                                title="Arşiv Görüntüleyici"
                                desc="ZIP içeriğini indirmeden analiz edin."
                                color="pink"
                                onClick={() => onToolSelect('inspect')}
                            />
                            <ToolItem
                                icon={<Calculator size={20} />}
                                title="Mühendislik Birimleri"
                                desc="Koordinat, alan ve finansal hesaplar."
                                color="emerald"
                                onClick={() => onToolSelect('units')}
                            />
                            <ToolItem
                                icon={<Zap size={20} />}
                                title="UUID Oluşturucu"
                                desc="Benzersiz kimlikler (v4) üretin."
                                color="indigo"
                                onClick={() => onToolSelect('uuid')}
                            />
                            <ToolItem
                                icon={<Code size={20} />}
                                title="YAML / JSON Çevirici"
                                desc="Formatlar arası güvenli dönüşüm."
                                color="amber"
                                onClick={() => onToolSelect('yaml')}
                            />
                            <ToolItem
                                icon={<ShieldCheck size={20} />}
                                title="JWT Debugger"
                                desc="Token çözümleme ve analiz."
                                color="emerald"
                                onClick={() => onToolSelect('jwt')}
                            />
                            <ToolItem
                                icon={<Globe size={20} />}
                                title="URL Encoder"
                                desc="Web adreslerini kodla ve çöz."
                                color="sky"
                                onClick={() => onToolSelect('url')}
                            />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

const ToolItem = ({ icon, title, desc, color, onClick }: { icon: React.ReactNode, title: string, desc: string, color: string, onClick: () => void }) => (
    <button
        onClick={onClick}
        className="group p-5 text-left bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl transition-all duration-300 hover:border-blue-300 dark:hover:border-white/20 hover:-translate-y-1 active:scale-95 shadow-sm hover:shadow-md dark:shadow-none"
    >
        <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
            ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
            ${color === 'red' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : ''}
            ${color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
            ${color === 'purple' ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' : ''}
            ${color === 'sky' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' : ''}
            ${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : ''}
            ${color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : ''}
            ${color === 'pink' ? 'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400' : ''}
            ${color === 'amber' ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' : ''}
            ${color === 'cyan' ? 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : ''}
            ${color === 'violet' ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400' : ''}
        `}>
            {icon}
        </div>
        <h4 className="text-sm font-bold mb-1 text-slate-800 dark:text-white transition-colors">{title}</h4>
        <p className="text-[12px] text-slate-500 leading-snug dark:group-hover:text-slate-400 transition-colors">{desc}</p>
    </button>
);

const QuickAction = ({ title, onClick, icon, color }: { title: string, onClick: () => void, icon?: React.ReactNode, color: string }) => (
    <button
        onClick={onClick}
        className="group flex items-center gap-2 p-3 bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl hover:border-blue-300 dark:hover:border-white/10 transition-all text-left shadow-sm dark:shadow-none"
    >
        <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110
            ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : ''}
            ${color === 'red' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' : ''}
            ${color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : ''}
            ${color === 'sky' ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400' : ''}
            ${color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : ''}
            ${color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' : ''}
        `}>
            {icon}
        </div>
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">{title}</span>
    </button>
);
