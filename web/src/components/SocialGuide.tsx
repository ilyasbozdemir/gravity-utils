'use client';

import React from 'react';
import { ArrowLeft, Monitor, Smartphone, Instagram, Twitter, Youtube, Facebook, Linkedin, Music2, Share2 } from 'lucide-react';

const SOCIAL_DATA = [
    {
        platform: 'Instagram',
        icon: <Instagram className="text-pink-600" />,
        sizes: [
            { label: 'Profil Fotoğrafı', size: '320 x 320', ratio: '1:1' },
            { label: 'Post (Kare)', size: '1080 x 1080', ratio: '1:1' },
            { label: 'Post (Dikey)', size: '1080 x 1350', ratio: '4:5' },
            { label: 'Post (Yatay)', size: '1080 x 566', ratio: '1.91:1' },
            { label: 'Story / Reels', size: '1080 x 1920', ratio: '9:16' },
        ]
    },
    {
        platform: 'Twitter / X',
        icon: <Twitter className="text-slate-900 dark:text-white" />,
        sizes: [
            { label: 'Profil Fotoğrafı', size: '400 x 400', ratio: '1:1' },
            { label: 'Header (Kapak)', size: '1500 x 500', ratio: '3:1' },
            { label: 'Post Görseli', size: '1200 x 675', ratio: '16:9' },
            { label: 'Kart Görseli', size: '800 x 418', ratio: '1.91:1' },
        ]
    },
    {
        platform: 'YouTube',
        icon: <Youtube className="text-red-600" />,
        sizes: [
            { label: 'Profil Fotoğrafı', size: '800 x 800', ratio: '1:1' },
            { label: 'Banner (Kanal Kapak)', size: '2560 x 1440', ratio: '16:9' },
            { label: 'Thumbnail (Video)', size: '1280 x 720', ratio: '16:9' },
            { label: 'YouTube Shorts', size: '1080 x 1920', ratio: '9:16' },
        ]
    },
    {
        platform: 'TikTok',
        icon: <Music2 className="text-black dark:text-white" />,
        sizes: [
            { label: 'Profil Fotoğrafı', size: '200 x 200', ratio: '1:1' },
            { label: 'Video Boyutu', size: '1080 x 1920', ratio: '9:16' },
        ]
    },
    {
        platform: 'LinkedIn',
        icon: <Linkedin className="text-blue-700" />,
        sizes: [
            { label: 'Profil Fotoğrafı', size: '400 x 400', ratio: '1:1' },
            { label: 'Kapak Görseli', size: '1584 x 396', ratio: '4:1' },
            { label: 'Post Görseli', size: '1200 x 627', ratio: '1.91:1' },
            { label: 'Şirket Logosu', size: '300 x 300', ratio: '1:1' },
        ]
    }
];

export function SocialGuide({ onBack }: { onBack: () => void }) {
    return (
        <div className="max-w-5xl mx-auto p-4 lg:p-6 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={onBack} title="Geri Dön"
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 tracking-tight">
                        <Share2 className="w-6 h-6 text-indigo-500" /> Sosyal Medya Boyut Rehberi
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Platformlar için güncel görsel ve video boyutları</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {SOCIAL_DATA.map((social) => (
                    <div key={social.platform} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                                {social.icon}
                            </div>
                            <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">{social.platform}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            {social.sizes.map((size) => (
                                <div key={size.label} className="flex items-center justify-between group">
                                    <div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-500 transition-colors">{size.label}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">{size.ratio}</p>
                                    </div>
                                    <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                                        {size.size}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-3xl p-6 flex items-start gap-4">
                <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                    <Monitor size={24} />
                </div>
                <div>
                    <h3 className="font-black text-indigo-900 dark:text-indigo-300 uppercase leading-none mb-2">Tasarımcı Notu</h3>
                    <p className="text-xs text-indigo-800/70 dark:text-indigo-400/70 leading-relaxed font-medium">
                        En iyi sonuçlar için görsellerinizi belirtilen boyutların 2 katı (Retina ekranlar için) veya PNG yerine WebP formatında hazırlamanızı öneririz. Profil fotoğraflarının çoğu platformda daire şeklinde kırpılacağını unutmayın.
                    </p>
                </div>
            </div>
        </div>
    );
}
