import React from 'react';
import {
    Archive, Image as ImageIcon, ShieldCheck, Zap, Star, Calculator,
    FileText, Minimize2, Hash, Code, Search, QrCode,
    Lock, Share2, MousePointer2, Settings, Smartphone, RefreshCw, Layers
} from 'lucide-react';
import { FileDropper } from './FileDropper';

type ToolView = 'convert' | 'inspect' | 'base64' | 'optimize' | 'hash' | 'json' | 'text' | 'pdf' | 'exif' | 'qr' | 'social' | 'favicon' | 'units' | 'encrypt';

interface LandingHeroProps {
    onFileSelect: (file: File) => void;
    onToolSelect: (tool: ToolView) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onFileSelect, onToolSelect }) => {
    return (
        <div className="px-4 pb-20">
            {/* Hero Section */}
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center relative pt-12">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(167,139,250,0.15)_0%,rgba(96,165,250,0.05)_40%,transparent_70%)] -z-10 pointer-events-none"></div>

                <div className="mb-4 px-4 py-2 rounded-full bg-white/5 border border-white/10 inline-flex items-center gap-2 text-sm text-slate-400">
                    <Star size={14} fill="#fbbf24" color="#fbbf24" />
                    <span>Tüm Araçlar %100 Ücretsiz ve Güvenli</span>
                </div>

                <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold leading-[1.1] tracking-tighter mb-6 max-w-[900px] bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">
                    Dosya İşlemleriniz İçin <br />
                    <span className="text-blue-400">Hepsi Bir Arada Panel.</span>
                </h1>

                <p className="text-[clamp(1rem,2vw,1.25rem)] text-slate-400 max-w-[600px] mb-12 leading-relaxed">
                    Dosyalarınızı sunucuya yüklemeden tarayıcınızda işleyin.
                    Hızlı, güvenli ve profesyonel sonuçlar.
                </p>

                <div className="w-full max-w-[650px] relative z-10">
                    <div className="p-2 rounded-3xl bg-slate-800/40 backdrop-blur-xl border border-white/10 shadow-2xl">
                        <FileDropper onFileSelect={onFileSelect} />
                    </div>
                </div>

                <div className="mt-12 flex gap-8 justify-center opacity-60">
                    <div className="flex items-center gap-2 text-sm"><ShieldCheck size={18} /> Sunucusuz (Client-side)</div>
                    <div className="flex items-center gap-2 text-sm"><Zap size={18} /> Yerel Hız</div>
                </div>
            </div>

            {/* Categorized Tools Menu */}
            <div className="w-full max-w-[1200px] mx-auto mt-24">
                <div className="flex flex-col gap-16">

                    {/* Category: PDF & Dokument */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><FileText size={20} /></div>
                            <h3 className="text-xl font-bold">PDF & Doküman Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<RefreshCw size={20} />}
                                title="Dosya Dönüştürücü"
                                desc="Word, PDF, Resim ve Metin arası çeviriler."
                                color="blue"
                                onClick={() => onToolSelect('convert')}
                            />
                            <ToolItem
                                icon={<Layers size={20} />}
                                title="PDF Birleştir & Düzenle"
                                desc="Sayfa ekle, çıkar ve yeniden sırala."
                                color="red"
                                onClick={() => onToolSelect('pdf')}
                            />
                            <ToolItem
                                icon={<Lock size={20} />}
                                title="Dosya Şifreleme"
                                desc="Askeri düzey AES-256 güvenliği."
                                color="purple"
                                onClick={() => onToolSelect('encrypt')}
                            />
                            <ToolItem
                                icon={<Search size={20} />}
                                title="Metin Analizi"
                                desc="Kelime sayımı ve metin istatistikleri."
                                color="emerald"
                                onClick={() => onToolSelect('text')}
                            />
                        </div>
                    </section>

                    {/* Category: Resim & Medya */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><ImageIcon size={20} /></div>
                            <h3 className="text-xl font-bold">Resim & Medya Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Minimize2 size={20} />}
                                title="Resim Optimizer"
                                desc="Kalite kaybı olmadan boyutu küçültün."
                                color="emerald"
                                onClick={() => onToolSelect('optimize')}
                            />
                            <ToolItem
                                icon={<Smartphone size={20} />}
                                title="Sosyal Medya Boyut"
                                desc="Instagram, X, LinkedIn hazır şablonları."
                                color="sky"
                                onClick={() => onToolSelect('social')}
                            />
                            <ToolItem
                                icon={<MousePointer2 size={20} />}
                                title="Favicon Oluşturucu"
                                desc="Resimden fav ve app icon setleri."
                                color="indigo"
                                onClick={() => onToolSelect('favicon')}
                            />
                            <ToolItem
                                icon={<Settings size={20} />}
                                title="EXIF Temizleyici"
                                desc="Görsellerden konum ve kamera bilgilerini siler."
                                color="orange"
                                onClick={() => onToolSelect('exif')}
                            />
                        </div>
                    </section>

                    {/* Category: Teknik & Geliştirici */}
                    <section>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Code size={20} /></div>
                            <h3 className="text-xl font-bold">Veri & Geliştirici Araçları</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Archive size={20} />}
                                title="Arşiv İnceleyici"
                                desc="Zip dosyalarının içeriğine göz atın."
                                color="pink"
                                onClick={() => onToolSelect('inspect')}
                            />
                            <ToolItem
                                icon={<Hash size={20} />}
                                title="Hash Üretici"
                                desc="MD5, SHA-1, SHA-256 imza doğrulama."
                                color="amber"
                                onClick={() => onToolSelect('hash')}
                            />
                            <ToolItem
                                icon={<Code size={20} />}
                                title="JSON Formatlayıcı"
                                desc="Hatalı JSON verilerini düzeltin ve güzelleştirin."
                                color="cyan"
                                onClick={() => onToolSelect('json')}
                            />
                            <ToolItem
                                icon={<Share2 size={20} />}
                                title="Base64 Metin/Resim"
                                desc="Verileri Base64 formatına encode/decode yapın."
                                color="violet"
                                onClick={() => onToolSelect('base64')}
                            />
                        </div>
                    </section>

                    {/* Category: Diğer */}
                    <section className="pb-12">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><Zap size={20} /></div>
                            <h3 className="text-xl font-bold">Hesaplama & Diğer</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ToolItem
                                icon={<Calculator size={20} />}
                                title="Birim Çevirici"
                                desc="Mühendislik ve teknik birim dönüşümleri."
                                color="orange"
                                onClick={() => onToolSelect('units')}
                            />
                            <ToolItem
                                icon={<QrCode size={20} />}
                                title="QR & Barkod"
                                desc="Hızlı QR kod üretici ve okuyucu."
                                color="emerald"
                                onClick={() => onToolSelect('qr')}
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
        className="group p-5 text-left bg-white/[0.03] border border-white/5 rounded-2xl transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 active:scale-95"
    >
        <div className={`mb-4 w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110
            ${color === 'blue' ? 'bg-blue-500/10 text-blue-400' : ''}
            ${color === 'red' ? 'bg-red-500/10 text-red-400' : ''}
            ${color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400' : ''}
            ${color === 'purple' ? 'bg-purple-500/10 text-purple-400' : ''}
            ${color === 'sky' ? 'bg-sky-500/10 text-sky-400' : ''}
            ${color === 'indigo' ? 'bg-indigo-500/10 text-indigo-400' : ''}
            ${color === 'orange' ? 'bg-orange-500/10 text-orange-400' : ''}
            ${color === 'pink' ? 'bg-pink-500/10 text-pink-400' : ''}
            ${color === 'amber' ? 'bg-amber-500/10 text-amber-400' : ''}
            ${color === 'cyan' ? 'bg-cyan-500/10 text-cyan-400' : ''}
            ${color === 'violet' ? 'bg-violet-500/10 text-violet-400' : ''}
        `}>
            {icon}
        </div>
        <h4 className="text-sm font-bold mb-1 group-hover:text-white transition-colors">{title}</h4>
        <p className="text-[12px] text-slate-500 leading-snug group-hover:text-slate-400 transition-colors">{desc}</p>
    </button>
);
