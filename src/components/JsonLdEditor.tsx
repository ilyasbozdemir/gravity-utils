'use client';

import React, { useState, useMemo } from 'react';
import { ArrowLeft, Copy, Check, Download, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Code2, Lightbulb } from 'lucide-react';

// ─── Schema Templates ─────────────────────────────────────────────────────────
const SCHEMAS: Record<string, { label: string; emoji: string; desc: string; template: object }> = {
    Article: {
        label: 'Makale', emoji: '📰', desc: 'Blog yazısı, haber makalesi, akademik içerik',
        template: {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Makale Başlığı",
            "description": "Makale açıklaması buraya gelir.",
            "author": { "@type": "Person", "name": "Yazar Adı" },
            "publisher": {
                "@type": "Organization",
                "name": "Yayın Adı",
                "logo": { "@type": "ImageObject", "url": "https://example.com/logo.png" }
            },
            "datePublished": "2026-02-19",
            "dateModified": "2026-02-19",
            "image": "https://example.com/article-image.jpg",
            "url": "https://example.com/article"
        }
    },
    Product: {
        label: 'Ürün', emoji: '🛍️', desc: 'E-ticaret ürün sayfası için yapılandırılmış veri',
        template: {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "Ürün Adı",
            "description": "Ürün açıklaması",
            "image": "https://example.com/product.jpg",
            "brand": { "@type": "Brand", "name": "Marka Adı" },
            "sku": "URUN-001",
            "offers": {
                "@type": "Offer",
                "price": "299.99",
                "priceCurrency": "TRY",
                "availability": "https://schema.org/InStock",
                "url": "https://example.com/product"
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.5",
                "reviewCount": "128"
            }
        }
    },
    FAQPage: {
        label: 'SSS', emoji: '❓', desc: 'Sık sorulan sorular — Google\'da doğrudan yanıt olarak görünür',
        template: {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "İlk soru burada yer alır?",
                    "acceptedAnswer": { "@type": "Answer", "text": "Cevaplanmış yanıt metni burada yer alır." }
                },
                {
                    "@type": "Question",
                    "name": "İkinci soru burada yer alır?",
                    "acceptedAnswer": { "@type": "Answer", "text": "İkinci yanıt metni bu alanda yazılır." }
                }
            ]
        }
    },
    Organization: {
        label: 'Organizasyon', emoji: '🏢', desc: 'Şirket / kurum bilgisi',
        template: {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Şirket Adı",
            "url": "https://example.com",
            "logo": "https://example.com/logo.png",
            "description": "Şirket hakkında kısa açıklama",
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+90-212-000-0000",
                "contactType": "customer service",
                "availableLanguage": ["Turkish", "English"]
            },
            "sameAs": [
                "https://twitter.com/example",
                "https://linkedin.com/company/example"
            ],
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Atatürk Cad. No:1",
                "addressLocality": "İstanbul",
                "addressCountry": "TR"
            }
        }
    },
    Person: {
        label: 'Kişi', emoji: '👤', desc: 'Yazar, profesyonel kişi profili',
        template: {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": "Ad Soyad",
            "jobTitle": "Yazılım Geliştirici",
            "url": "https://example.com/about",
            "image": "https://example.com/avatar.jpg",
            "email": "mailto:ornek@example.com",
            "sameAs": ["https://linkedin.com/in/example", "https://github.com/example"],
            "worksFor": { "@type": "Organization", "name": "Şirket Adı" }
        }
    },
    BreadcrumbList: {
        label: 'Breadcrumb', emoji: '🗺️', desc: 'Sayfa yolu — arama sonuçlarında görünür',
        template: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://example.com" },
                { "@type": "ListItem", "position": 2, "name": "Kategori", "item": "https://example.com/kategori" },
                { "@type": "ListItem", "position": 3, "name": "Sayfa Adı", "item": "https://example.com/kategori/sayfa" }
            ]
        }
    },
    Event: {
        label: 'Etkinlik', emoji: '🎉', desc: 'Konser, seminer, webinar gibi etkinlikler',
        template: {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "Etkinlik Adı",
            "description": "Etkinlik açıklaması",
            "startDate": "2026-03-15T09:00:00+03:00",
            "endDate": "2026-03-15T17:00:00+03:00",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
            "location": {
                "@type": "Place",
                "name": "Mekan Adı",
                "address": { "@type": "PostalAddress", "addressLocality": "İstanbul", "addressCountry": "TR" }
            },
            "organizer": { "@type": "Organization", "name": "Organizatör", "url": "https://example.com" }
        }
    },
    Recipe: {
        label: 'Tarif', emoji: '🍳', desc: 'Yemek tarifi — Google\'da özel kart olarak görünür',
        template: {
            "@context": "https://schema.org",
            "@type": "Recipe",
            "name": "Tarif Adı",
            "description": "Kısa tarif açıklaması",
            "image": "https://example.com/tarif.jpg",
            "author": { "@type": "Person", "name": "Şef Adı" },
            "prepTime": "PT15M",
            "cookTime": "PT30M",
            "totalTime": "PT45M",
            "recipeYield": "4 kişilik",
            "recipeCategory": "Ana Yemek",
            "recipeCuisine": "Türk Mutfağı",
            "nutrition": { "@type": "NutritionInformation", "calories": "350 calories" },
            "recipeIngredient": ["2 su bardağı un", "1 çay kaşığı tuz", "1 yemek kaşığı zeytinyağı"],
            "recipeInstructions": [
                { "@type": "HowToStep", "text": "İlk adım açıklaması" },
                { "@type": "HowToStep", "text": "İkinci adım açıklaması" }
            ]
        }
    },
    JobPosting: {
        label: 'İş İlanı', emoji: '💼', desc: 'İş ilanı — Google Jobs\'ta görünür',
        template: {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": "Senior React Developer",
            "description": "İş pozisyonu açıklaması",
            "datePosted": "2026-02-19",
            "validThrough": "2026-03-31",
            "employmentType": "FULL_TIME",
            "hiringOrganization": { "@type": "Organization", "name": "Şirket Adı", "sameAs": "https://example.com" },
            "jobLocation": {
                "@type": "Place",
                "address": { "@type": "PostalAddress", "addressLocality": "İstanbul", "addressCountry": "TR" }
            },
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "TRY",
                "value": { "@type": "QuantitativeValue", "minValue": 50000, "maxValue": 80000, "unitText": "MONTH" }
            }
        }
    },
    LocalBusiness: {
        label: 'Yerel İşletme', emoji: '📍', desc: 'Restoran, dükkan, hizmet firmalarına özel',
        template: {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "İşletme Adı",
            "image": "https://example.com/isletme.jpg",
            "url": "https://example.com",
            "telephone": "+90-212-000-0000",
            "priceRange": "$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "Atatürk Cad. No: 1",
                "addressLocality": "İstanbul",
                "addressRegion": "İstanbul",
                "postalCode": "34000",
                "addressCountry": "TR"
            },
            "geo": { "@type": "GeoCoordinates", "latitude": 41.015137, "longitude": 28.979530 },
            "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "18:00" }
            ]
        }
    },
    VideoObject: {
        label: 'Video', emoji: '🎥', desc: 'YouTube veya diğer video içerikleri',
        template: {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            "name": "Video Başlığı",
            "description": "Video açıklaması",
            "thumbnailUrl": "https://example.com/thumbnail.jpg",
            "uploadDate": "2026-02-19",
            "duration": "PT5M30S",
            "contentUrl": "https://example.com/video.mp4",
            "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
            "publisher": { "@type": "Organization", "name": "Kanal Adı" }
        }
    },
    WebSite: {
        label: 'Web Sitesi', emoji: '🌐', desc: 'Site geneli için — sitelinks arama kutusu',
        template: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Site Adı",
            "url": "https://example.com",
            "description": "Site açıklaması",
            "potentialAction": {
                "@type": "SearchAction",
                "target": { "@type": "EntryPoint", "urlTemplate": "https://example.com/search?q={search_term_string}" },
                "query-input": "required name=search_term_string"
            }
        }
    },
};

// ─── Validation ───────────────────────────────────────────────────────────────
interface ValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
}

function validate(json: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(json);
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { valid: false, errors: [`JSON sözdizimi hatası: ${msg}`], warnings: [], score: 0 };
    }

    if (!parsed['@context']) errors.push('"@context" alanı eksik (zorunlu)');
    else if (parsed['@context'] !== 'https://schema.org' && !String(parsed['@context']).includes('schema.org'))
        warnings.push('"@context" genellikle "https://schema.org" olmalıdır');

    if (!parsed['@type']) errors.push('"@type" alanı eksik (zorunlu)');

    const type = String(parsed['@type'] ?? '');

    if (type === 'Article') {
        if (!parsed['headline']) errors.push('"headline" alanı Article için zorunludur');
        if (!parsed['author']) warnings.push('"author" alanı önerilir');
        if (!parsed['datePublished']) warnings.push('"datePublished" alanı önerilir');
        if (!parsed['image']) warnings.push('"image" alanı önerilir (rich result için gerekli)');
    }
    if (type === 'Product') {
        if (!parsed['name']) errors.push('"name" alanı Product için zorunludur');
        if (!parsed['offers']) warnings.push('"offers" alanı olmadan fiyat gösterilemez');
    }
    if (type === 'FAQPage') {
        const entities = parsed['mainEntity'];
        if (!Array.isArray(entities) || entities.length === 0) errors.push('"mainEntity" bir soru dizisi içermelidir');
    }
    if (type === 'Event') {
        if (!parsed['startDate']) errors.push('"startDate" Event için zorunludur (ISO 8601)');
        if (!parsed['location']) warnings.push('"location" önerilir');
    }
    if (type === 'JobPosting') {
        if (!parsed['title']) errors.push('"title" JobPosting için zorunludur');
        if (!parsed['datePosted']) errors.push('"datePosted" zorunludur');
        if (!parsed['hiringOrganization']) warnings.push('"hiringOrganization" önerilir');
    }

    const totalChecks = errors.length + warnings.length;
    const score = Math.max(0, Math.round(100 - (errors.length * 25) - (warnings.length * 8)));

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        score: Math.min(100, score),
    };
}

// ─── Simple JSON Tree Viewer ──────────────────────────────────────────────────
function JsonNode({ data, depth = 0 }: { data: unknown; depth?: number }) {
    const [open, setOpen] = useState(depth < 2);

    if (data === null) return <span className="text-slate-400 italic">null</span>;
    if (typeof data === 'boolean') return <span className="text-emerald-500 font-bold">{String(data)}</span>;
    if (typeof data === 'number') return <span className="text-blue-500 font-mono">{data}</span>;
    if (typeof data === 'string') return <span className="text-amber-600 dark:text-amber-400 font-mono">"{data}"</span>;

    if (Array.isArray(data)) {
        if (data.length === 0) return <span className="text-slate-400">[]</span>;
        return (
            <span>
                <button onClick={() => setOpen(v => !v)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono text-xs">
                    {open ? '▾' : '▸'} [{data.length}]
                </button>
                {open && (
                    <div className="ml-4 border-l border-slate-200 dark:border-slate-700 pl-3">
                        {data.map((item, i) => (
                            <div key={i} className="my-0.5">
                                <span className="text-slate-400 text-xs mr-1">{i}:</span>
                                <JsonNode data={item} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </span>
        );
    }

    if (typeof data === 'object') {
        const keys = Object.keys(data as object);
        if (keys.length === 0) return <span className="text-slate-400">{'{}'}</span>;
        return (
            <span>
                <button onClick={() => setOpen(v => !v)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-mono text-xs">
                    {open ? '▾' : '▸'} {'{'}…{'}'}
                </button>
                {open && (
                    <div className="ml-4 border-l border-slate-200 dark:border-slate-700 pl-3">
                        {keys.map(k => (
                            <div key={k} className="my-0.5 flex items-start gap-1.5 flex-wrap">
                                <span className={`text-xs font-bold shrink-0 ${k.startsWith('@') ? 'text-violet-600 dark:text-violet-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {k}:
                                </span>
                                <JsonNode data={(data as Record<string, unknown>)[k]} depth={depth + 1} />
                            </div>
                        ))}
                    </div>
                )}
            </span>
        );
    }

    return <span className="text-slate-500">{String(data)}</span>;
}

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
    const r = 28, circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    return (
        <div className="relative w-20 h-20 shrink-0">
            <svg width="80" height="80" viewBox="0 0 80 80" className="-rotate-90">
                <circle cx="40" cy="40" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" className="dark:stroke-slate-700" />
                <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black" style={{ color }}>{score}</span>
                <span className="text-[9px] text-slate-400 font-bold">SKOR</span>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function JsonLdEditor({ onBack }: { onBack: () => void }) {
    const [selectedType, setSelectedType] = useState('Article');
    const [code, setCode] = useState(JSON.stringify(SCHEMAS['Article'].template, null, 2));
    const [viewMode, setViewMode] = useState<'edit' | 'tree' | 'preview'>('edit');
    const [copied, setCopied] = useState(false);
    const [showRef, setShowRef] = useState(false);

    const validation = useMemo(() => validate(code), [code]);

    const applyTemplate = (type: string) => {
        setSelectedType(type);
        setCode(JSON.stringify(SCHEMAS[type].template, null, 2));
    };

    const parsedForTree = useMemo(() => {
        try { return JSON.parse(code); } catch { return null; }
    }, [code]);

    const scriptTag = `<script type="application/ld+json">\n${code}\n</script>`;

    const copy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    const download = () => {
        const blob = new Blob([code], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${selectedType.toLowerCase()}.jsonld`;
        a.click();
    };

    return (
        <div className="max-w-[1400px] mx-auto p-6 animate-in fade-in zoom-in duration-300">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={onBack} title="Geri Dön" aria-label="Geri Dön"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Code2 className="w-6 h-6 text-violet-500" /> JSON-LD Yapılandırılmış Veri Editörü
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Schema.org · SEO rich results · Google Search Console uyumlu</p>
                </div>
                <button onClick={() => setShowRef(v => !v)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${showRef ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    <Lightbulb size={15} /> Rehber
                </button>
            </div>

            {/* Reference panel */}
            {showRef && (
                <div className="mb-6 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
                    <h3 className="font-bold text-violet-700 dark:text-violet-400 mb-3 text-sm">📚 JSON-LD Neden Önemli?</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
                        {[
                            ['🔍 Rich Results', 'Google arama sonuçlarında yıldız, fiyat, SSS kutusu gibi özel görünümler sağlar.'],
                            ['📊 CTR Artışı', 'Structured data kullanan sayfalar genelde %30+ daha fazla tıklanma oranına sahiptir.'],
                            ['🤖 AI Bağlamı', 'LLM ve yapay zeka sistemleri sayfa bağlamını daha iyi anlar.'],
                            ['⚡ Sitelinks', 'WebSite şeması ile Google\'da arama kutusu sitelinks özelliği açılabilir.'],
                            ['🏪 Google İş', 'LocalBusiness şemasıyla harita entegrasyonu ve iş saatleri zenginleşir.'],
                            ['📋 Doğrulama', 'Google\'ın Rich Results Test aracıyla şemanızı test edebilirsiniz.'],
                        ].map(([title, desc]) => (
                            <div key={title} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-violet-100 dark:border-violet-900">
                                <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">{title}</p>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
                            className="text-violet-600 dark:text-violet-400 underline hover:no-underline font-bold">
                            → Google Rich Results Test
                        </a>
                        <a href="https://schema.org/docs/schemas.html" target="_blank" rel="noopener noreferrer"
                            className="text-violet-600 dark:text-violet-400 underline hover:no-underline font-bold">
                            → Schema.org Tam Rehber
                        </a>
                        <a href="https://validator.schema.org/" target="_blank" rel="noopener noreferrer"
                            className="text-violet-600 dark:text-violet-400 underline hover:no-underline font-bold">
                            → Schema Validator
                        </a>
                    </div>
                </div>
            )}

            {/* Schema type selector */}
            <div className="mb-6">
                <p className="text-xs font-bold uppercase text-slate-400 mb-3">Şema Türü Seç</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
                    {Object.entries(SCHEMAS).map(([type, meta]) => (
                        <button key={type} onClick={() => applyTemplate(type)}
                            className={`flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border-2 text-center transition-all ${selectedType === type
                                    ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-md shadow-violet-500/10'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-violet-300 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 bg-white dark:bg-slate-900'
                                }`}>
                            <span className="text-lg">{meta.emoji}</span>
                            <span className={`text-[9px] font-bold leading-tight mt-0.5 ${selectedType === type ? 'text-violet-700 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
                                }`}>{meta.label}</span>
                        </button>
                    ))}
                </div>
                {SCHEMAS[selectedType] && (
                    <p className="text-xs text-slate-400 mt-2">
                        <span className="font-bold text-violet-500">@type: {selectedType}</span> — {SCHEMAS[selectedType].desc}
                    </p>
                )}
            </div>

            {/* Main editor area */}
            <div className="grid xl:grid-cols-5 gap-6">

                {/* Left: Editor — 3/5 width */}
                <div className="xl:col-span-3 flex flex-col gap-3">
                    {/* View mode */}
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                            {([['edit', '✏️ Editör'], ['tree', '🌳 Ağaç'], ['preview', '🏷️ HTML Tag']] as const).map(([v, l]) => (
                                <button key={v} onClick={() => setViewMode(v)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === v ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                                    {l}
                                </button>
                            ))}
                        </div>
                        <div className="ml-auto flex gap-2">
                            <button onClick={() => copy(viewMode === 'preview' ? scriptTag : code)}
                                title="Kopyala" aria-label="JSON-LD kodunu kopyala"
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 transition-all">
                                {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                                {copied ? 'Kopyalandı' : 'Kopyala'}
                            </button>
                            <button onClick={download}
                                title="JSON-LD olarak indir" aria-label="JSON-LD dosyası olarak indir"
                                className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all">
                                <Download size={13} /> .jsonld
                            </button>
                        </div>
                    </div>

                    {viewMode === 'edit' && (
                        <textarea
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            spellCheck={false}
                            aria-label="JSON-LD kodu"
                            className="w-full h-[560px] bg-slate-950 text-green-400 font-mono text-sm p-5 rounded-2xl border border-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/30 leading-relaxed shadow-lg"
                        />
                    )}

                    {viewMode === 'tree' && (
                        <div className="h-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 overflow-auto font-mono text-xs leading-relaxed">
                            {parsedForTree
                                ? <JsonNode data={parsedForTree} />
                                : <p className="text-red-500">JSON parse edilemedi</p>}
                        </div>
                    )}

                    {viewMode === 'preview' && (
                        <div className="h-[560px] bg-slate-950 rounded-2xl border border-slate-800 overflow-auto p-5">
                            <p className="text-slate-500 text-[10px] font-bold uppercase mb-3">HTML head içine yerleştirin:</p>
                            <pre className="font-mono text-sm text-cyan-400 leading-relaxed whitespace-pre-wrap">{scriptTag}</pre>
                        </div>
                    )}
                </div>

                {/* Right: Validation + Tips — 2/5 width */}
                <div className="xl:col-span-2 flex flex-col gap-4">

                    {/* Score + validation */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center gap-4 mb-4">
                            <ScoreRing score={validation.score} />
                            <div>
                                <p className={`text-lg font-black ${validation.valid ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                                    {validation.valid ? '✅ Geçerli' : '❌ Hatalı'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {validation.errors.length} hata · {validation.warnings.length} uyarı
                                </p>
                            </div>
                        </div>

                        {validation.errors.length > 0 && (
                            <div className="space-y-2 mb-3">
                                {validation.errors.map((e, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-red-700 dark:text-red-400">{e}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {validation.warnings.length > 0 && (
                            <div className="space-y-2">
                                {validation.warnings.map((w, i) => (
                                    <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
                                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-xs text-amber-700 dark:text-amber-400">{w}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {validation.valid && validation.warnings.length === 0 && (
                            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                                <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-green-700 dark:text-green-400">Tüm zorunlu ve önerilen alanlar dolu. Schema geçerli!</p>
                            </div>
                        )}
                    </div>

                    {/* Field reference for selected type */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-3">
                            {SCHEMAS[selectedType]?.emoji} {selectedType} — Alan Rehberi
                        </p>
                        <div className="space-y-2 text-xs">
                            {getFieldGuide(selectedType).map(f => (
                                <div key={f.field} className="flex items-start gap-2">
                                    <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${f.required ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        {f.required ? 'ZOR' : 'OPT'}
                                    </span>
                                    <div>
                                        <code className="text-violet-600 dark:text-violet-400 font-bold">{f.field}</code>
                                        <span className="text-slate-400 ml-1">— {f.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Google Rich Results info */}
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border border-violet-200 dark:border-violet-800 rounded-2xl p-4 text-xs">
                        <p className="font-bold text-violet-700 dark:text-violet-400 mb-2">🎯 Google Rich Result Uyumluluğu</p>
                        <p className="text-slate-600 dark:text-slate-400">
                            Bu şema türü Google arama sonuçlarında{' '}
                            <strong>{getRichResultLabel(selectedType)}</strong> olarak görünebilir.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Field guides ─────────────────────────────────────────────────────────────
function getFieldGuide(type: string): { field: string; desc: string; required: boolean }[] {
    const guides: Record<string, { field: string; desc: string; required: boolean }[]> = {
        Article: [
            { field: '@context', desc: 'Her zaman "https://schema.org"', required: true },
            { field: '@type', desc: '"Article", "NewsArticle" veya "BlogPosting"', required: true },
            { field: 'headline', desc: 'Makale başlığı (max 110 karakter)', required: true },
            { field: 'author', desc: 'Yazar Person ya da Organization nesnesi', required: false },
            { field: 'datePublished', desc: 'ISO 8601 formatında yayın tarihi', required: false },
            { field: 'image', desc: 'Makale görseli URL (en az 1200px geniş)', required: false },
        ],
        Product: [
            { field: 'name', desc: 'Ürün adı', required: true },
            { field: 'offers', desc: 'Fiyat ve stok bilgisi (Offer nesnesi)', required: true },
            { field: 'aggregateRating', desc: 'Ortalama puan ve inceleme sayısı', required: false },
            { field: 'image', desc: 'Ürün görseli', required: false },
            { field: 'sku', desc: 'Stok kodu', required: false },
        ],
        FAQPage: [
            { field: 'mainEntity', desc: 'Question nesnelerinin dizisi', required: true },
            { field: 'name', desc: 'Her soru metni', required: true },
            { field: 'acceptedAnswer', desc: 'Her sorunun yanıtı (Answer nesnesi)', required: true },
        ],
        Event: [
            { field: 'name', desc: 'Etkinlik adı', required: true },
            { field: 'startDate', desc: 'ISO 8601 başlangıç tarihi/saati', required: true },
            { field: 'location', desc: 'Place nesnesi veya VirtualLocation', required: false },
            { field: 'eventStatus', desc: 'Planlandı / İptal / Ertelendi', required: false },
        ],
        JobPosting: [
            { field: 'title', desc: 'Pozisyon başlığı', required: true },
            { field: 'datePosted', desc: 'İlan tarihi (ISO 8601)', required: true },
            { field: 'hiringOrganization', desc: 'İşe alımı yapan kurum', required: true },
            { field: 'validThrough', desc: 'İlan bitiş tarihi', required: false },
        ],
    };

    return guides[type] ?? [
        { field: '@context', desc: '"https://schema.org"', required: true },
        { field: '@type', desc: `"${type}"`, required: true },
        { field: 'name', desc: 'İsim / başlık', required: true },
        { field: 'url', desc: 'Sayfa URL\'si', required: false },
        { field: 'description', desc: 'Kısa açıklama', required: false },
    ];
}

function getRichResultLabel(type: string): string {
    const labels: Record<string, string> = {
        Article: 'haber/makale kartı',
        Product: 'ürün fiyatı ve yıldız puanı',
        FAQPage: 'SSS accordion kutusu',
        Event: 'etkinlik kartı',
        Recipe: 'tarif kartı (malzemeler, süre, kalori)',
        JobPosting: 'Google Jobs ilanı',
        LocalBusiness: 'harita ve işletme paneli',
        VideoObject: 'video carousel',
        BreadcrumbList: 'sayfa yolu metni',
        WebSite: 'sitelinks arama kutusu',
        Organization: 'şirket bilgi paneli',
        Person: 'kişi bilgi kartı',
    };
    return labels[type] ?? 'yapılandırılmış sonuç';
}
