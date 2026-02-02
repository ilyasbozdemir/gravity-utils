import React from 'react';
import {
    LayoutDashboard,
    FileCode2,
    Archive,
    FileType,
    Binary,
    Image as ImageIcon,
    Zap
} from 'lucide-react';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
    const menuItems = [
        { id: 'home', label: 'Ana Sayfa', icon: LayoutDashboard },
        { id: 'convert', label: 'Dönüştürücü', icon: FileType },
        { id: 'inspect', label: 'Zip/Arşiv Önizle', icon: Archive },
        { id: 'html-format', label: 'HTML Düzenle', icon: FileCode2 },
        { id: 'base64', label: 'Base64 Araçları', icon: Binary },
        { id: 'optimize', label: 'Resim Optimize', icon: ImageIcon },
    ];

    return (
        <div className="sidebar glass-panel" style={{
            width: '260px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            borderRadius: '0 20px 20px 0',
            zIndex: 50
        }}>
            <div className="flex-center" style={{ gap: '12px', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
                <div style={{ background: 'rgba(167, 139, 250, 0.2)', padding: '8px', borderRadius: '10px' }}>
                    <Zap size={24} color="#a78bfa" fill="#a78bfa" style={{ opacity: 1 }} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 'bold' }}>Gravity</h2>
                    <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Tools Suite</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {menuItems.map((item) => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className="flex-center"
                            style={{
                                background: isActive ? 'linear-gradient(90deg, rgba(167, 139, 250, 0.2) 0%, rgba(167, 139, 250, 0.05) 100%)' : 'transparent',
                                border: 'none',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                color: isActive ? '#a78bfa' : '#94a3b8',
                                gap: '12px',
                                justifyContent: 'flex-start',
                                transition: 'all 0.2s ease',
                                fontWeight: isActive ? 600 : 400
                            }}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                            {isActive && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', background: '#a78bfa' }} />}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '4px' }}>Pro Sürüm</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>Daha fazla özellik yakında.</div>
            </div>
        </div>
    );
};
