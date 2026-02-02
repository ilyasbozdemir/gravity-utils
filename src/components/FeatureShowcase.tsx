import React from 'react';
import { FileType, Archive, Image as ImageIcon, ShieldCheck, Code2, BarChart3, Zap, Lock } from 'lucide-react';

export const FeatureShowcase: React.FC = () => {
    const features = [
        {
            icon: <FileType size={24} color="#60a5fa" />,
            title: "Format Dönüştürücü",
            desc: "Resim, metin ve diğer dosyaları anında farklı formatlara çevirin."
        },
        {
            icon: <Archive size={24} color="#f472b6" />,
            title: "Arşiv İnceleyici",
            desc: "Zip ve paket dosyalarının içini çıkartmadan görüntüleyin."
        },
        {
            icon: <ImageIcon size={24} color="#34d399" />,
            title: "Resim Optimizasyonu",
            desc: "Görüntü kalitesini koruyarak dosya boyutunu küçültün."
        },
        {
            icon: <ShieldCheck size={24} color="#fbbf24" />,
            title: "Güvenlik & Hash",
            desc: "Dosyaların SHA-1, SHA-256 imzalarını doğrulayın."
        },
        {
            icon: <Code2 size={24} color="#a78bfa" />,
            title: "Geliştirici Araçları",
            desc: "JSON formatlama, Base64 kodlama gibi yazılımcı araçları."
        },
        {
            icon: <BarChart3 size={24} color="#f87171" />,
            title: "Detaylı Analiz",
            desc: "Metin ve kod dosyaları için kelime ve satır istatistikleri."
        },
        {
            icon: <Zap size={24} color="#fb923c" />,
            title: "Hızlı & Yerel",
            desc: "Tüm işlemler tarayıcınızda yapılır, sunucuya veri gitmez."
        },
        {
            icon: <Lock size={24} color="#22d3ee" />,
            title: "%100 Güvenli",
            desc: "Dosyalarınız bilgisayarınızdan asla ayrılmaz."
        }
    ];

    return (
        <div style={{ width: '100%' }}>
            <h3 style={{
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                opacity: 0.8,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                paddingLeft: '0.5rem'
            }}>
                Neler Yapabilirsiniz?
            </h3>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
            }}>
                {features.map((feature, idx) => (
                    <div
                        key={idx}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            textAlign: 'left',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px',
                            transition: 'transform 0.2s',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            width: 'fit-content',
                            padding: '10px',
                            borderRadius: '10px',
                            marginBottom: '5px'
                        }}>
                            {feature.icon}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{feature.title}</div>
                        <div className="text-sm" style={{ lineHeight: '1.5', opacity: 0.7 }}>{feature.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};
