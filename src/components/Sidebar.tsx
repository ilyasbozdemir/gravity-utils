import React from 'react';
import {
    LayoutDashboard,
    Archive,
    FileType,
    Binary,
    Image as ImageIcon,
    Zap,
    FileText,
    ShieldCheck,
    QrCode,
    Settings
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
    const menuItems = [
        { id: 'home', label: 'Ana Sayfa', icon: LayoutDashboard },
        { id: 'convert', label: 'Dönüştürücü', icon: FileType },
        { id: 'inspect', label: 'Arşiv İncele', icon: Archive },
        { id: 'imagetopdf', label: 'Resim to PDF', icon: FileText },
        { id: 'optimize', label: 'Resim Optimize', icon: ImageIcon },
        { id: 'base64', label: 'Base64 Araçları', icon: Binary },
        { id: 'encrypt', label: 'Güvenli Şifre', icon: ShieldCheck },
        { id: 'qr', label: 'QR & Barkod', icon: QrCode },
    ];

    return (
        <div className="fixed left-0 top-0 h-screen w-[280px] bg-slate-900/40 backdrop-blur-2xl border-r border-white/5 p-6 flex flex-col z-50 animate-[fadeIn_0.5s_ease]">
            {/* Logo Section */}
            <div
                className="flex items-center gap-4 mb-12 px-2 cursor-pointer group"
                onClick={() => onNavigate('home')}
            >
                <div className="bg-violet-500/20 p-2.5 rounded-2xl border border-violet-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                    <Zap size={28} className="text-violet-400 fill-violet-400/20" />
                </div>
                <div className="text-left">
                    <h2 className="text-xl font-black tracking-tight text-white leading-none mb-1">Gravity</h2>
                    <span className="text-[10px] text-violet-400 font-bold uppercase tracking-[0.2em] opacity-70">Tools Suite v2</span>
                </div>
            </div>

            {/* Navigation Menu */}
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 px-3">Hızlı Erişim</p>
                {menuItems.map((item) => {
                    const isActive = currentView === item.id;
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all relative group overflow-hidden ${isActive
                                ? 'bg-white/10 text-white shadow-xl shadow-black/20 border border-white/10'
                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                }`}
                            title={item.label}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-400 rounded-full" />
                            )}
                            <Icon size={20} className={`${isActive ? 'text-violet-400' : 'group-hover:text-violet-300'} transition-colors`} />
                            <span>{item.label}</span>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom Section */}
            <div className="mt-auto pt-6 border-t border-white/5">
                <div className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 rounded-2xl p-4 border border-white/5 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-violet-500/5 group-hover:scale-110 transition-transform duration-500">
                        <Settings size={80} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Durumu</span>
                        </div>
                        <p className="text-xs font-bold text-slate-200">Pro Sürüm Aktif</p>
                        <p className="text-[10px] text-slate-500 mt-1">Tüm özelliklere erişiminiz var.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
