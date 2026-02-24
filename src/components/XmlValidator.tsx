'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, FileJson, AlertCircle, CheckCircle2, Copy, Download, Code, Play, Trash2, BookOpen, Sparkles, Braces, FileCode, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

type XmlMode = 'validate' | 'format' | 'xml-json' | 'json-xml';

export const XmlValidator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [xml, setXml] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<note>\n  <to>Tove</to>\n  <from>Jani</from>\n  <heading>Reminder</heading>\n  <body>Benim için xml xsd vs gibi şeylere yer ver!</body>\n</note>');
    const [xsd, setXsd] = useState('<?xml version="1.0" encoding="UTF-8"?>\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">\n  <xs:element name="note">\n    <xs:complexType>\n      <xs:sequence>\n        <xs:element name="to" type="xs:string"/>\n        <xs:element name="from" type="xs:string"/>\n        <xs:element name="heading" type="xs:string"/>\n        <xs:element name="body" type="xs:string"/>\n      </xs:sequence>\n    </xs:complexType>\n  </xs:element>\n</xs:schema>');
    const [mode, setMode] = useState<XmlMode>('validate');
    const [result, setResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

    const formatXml = (xmlStr: string) => {
        const PADDING = '  ';
        let reg = /(>)(<)(\/*)/g;
        let pad = 0;
        let formatted = xmlStr.replace(reg, '$1\r\n$2$3');
        return formatted.split('\r\n').map((node) => {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) indent = 0;
            else if (node.match(/^<\/\w/)) { if (pad !== 0) pad -= 1; }
            else if (node.match(/^<\w[^>]*[^\/]>.*$/)) indent = 1;
            else indent = 0;

            let padding = '';
            for (let i = 0; i < pad; i++) padding += PADDING;
            pad += indent;
            return padding + node;
        }).join('\r\n');
    };

    const xmlToJson = (xmlStr: string) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlStr, "text/xml");
        const errorNode = doc.querySelector("parsererror");
        if (errorNode) throw new Error("XML Hatası: " + errorNode.textContent?.split('\n')[0]);

        function parseNode(node: Node): any {
            if (node.nodeType === 3) return node.nodeValue;
            if (node.nodeType === 1) {
                let obj: any = {};
                const element = node as Element;
                if (element.attributes.length > 0) {
                    obj["@attributes"] = {};
                    for (let j = 0; j < element.attributes.length; j++) {
                        const attr = element.attributes[j];
                        obj["@attributes"][attr.nodeName] = attr.nodeValue;
                    }
                }
                if (element.hasChildNodes()) {
                    for (let i = 0; i < element.childNodes.length; i++) {
                        const child = element.childNodes[i];
                        if (child.nodeType === 1 || child.nodeType === 3) {
                            const name = child.nodeName;
                            const value = parseNode(child);
                            if (name === "#text") {
                                const trimmed = value?.trim();
                                if (trimmed) return trimmed;
                                continue;
                            }
                            if (obj[name] === undefined) obj[name] = value;
                            else {
                                if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
                                obj[name].push(value);
                            }
                        }
                    }
                }
                return Object.keys(obj).length === 0 ? "" : obj;
            }
            return null;
        }
        return { [doc.documentElement.nodeName]: parseNode(doc.documentElement) };
    };

    const jsonToXml = (jsonStr: string) => {
        const obj = JSON.parse(jsonStr);
        const toXml = (v: any, name: string): string => {
            let xmlContent = "";
            if (Array.isArray(v)) {
                v.forEach(item => xmlContent += toXml(item, name));
            } else if (typeof v === 'object' && v !== null) {
                xmlContent += `<${name}`;
                if (v["@attributes"]) {
                    Object.entries(v["@attributes"]).forEach(([k, val]) => {
                        xmlContent += ` ${k}="${val}"`;
                    });
                }
                xmlContent += ">";
                Object.entries(v).forEach(([k, val]) => {
                    if (k !== "@attributes") xmlContent += toXml(val, k);
                });
                xmlContent += `</${name}>`;
            } else {
                xmlContent += `<${name}>${v}</${name}>`;
            }
            return xmlContent;
        };
        const rootName = Object.keys(obj)[0] || 'root';
        return `<?xml version="1.0" encoding="UTF-8"?>\n` + toXml(obj[rootName], rootName);
    };

    const runAction = () => {
        setResult({ status: 'idle', message: '' });
        try {
            if (mode === 'validate') {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xml, 'application/xml');
                const parserError = xmlDoc.getElementsByTagName('parsererror');
                if (parserError.length > 0) {
                    setResult({ status: 'error', message: `XML Sözdizimi Hatası: ${parserError[0].textContent}` });
                    toast.error('Doğrulama başarısız');
                } else {
                    setResult({ status: 'success', message: 'XML yapısı geçerli ve iyi biçimlendirilmiş (well-formed).' });
                    toast.success('Doğrulama başarılı');
                }
            } else if (mode === 'format') {
                setXml(formatXml(xml));
                toast.success('XML Formatlandı');
            } else if (mode === 'xml-json') {
                const json = JSON.stringify(xmlToJson(xml), null, 2);
                setXml(json);
                toast.success('JSON\'a dönüştürüldü');
            } else if (mode === 'json-xml') {
                setXml(formatXml(jsonToXml(xml)));
                toast.success('XML\'e dönüştürüldü');
            }
        } catch (err: any) {
            setResult({ status: 'error', message: err.message });
            toast.error('Hata: ' + err.message);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Kopyalandı');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön" className="p-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm group">
                        <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">XML / XSD / JSON Pro</h1>
                        <p className="text-slate-500 text-sm font-medium">XML verilerinizi doğrulayın, formatlayın ve JSON ile karşılıklı dönüştürün.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* XML Input */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex gap-2">
                            {[
                                { id: 'validate', label: 'Doğrula', icon: <CheckCircle2 size={14} /> },
                                { id: 'format', label: 'Formatla', icon: <Braces size={14} /> },
                                { id: 'xml-json', label: '→ JSON', icon: <FileJson size={14} /> },
                                { id: 'json-xml', label: '← JSON', icon: <FileCode size={14} /> },
                            ].map(m => (
                                <button
                                    key={m.id}
                                    onClick={() => setMode(m.id as XmlMode)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${mode === m.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-blue-500'
                                        }`}
                                >
                                    {m.icon}
                                    {m.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setXml('')} title="Temizle" className="p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                            <button onClick={() => handleCopy(xml)} title="Kopyala" className="p-1 text-slate-400 hover:text-blue-500 transition-all"><Copy size={14} /></button>
                        </div>
                    </div>
                    <textarea
                        value={xml}
                        onChange={(e) => setXml(e.target.value)}
                        className="w-full h-[450px] bg-white dark:bg-[#0b101b] border-2 border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 text-xs font-mono text-slate-700 dark:text-blue-300/80 focus:border-blue-500 outline-none custom-scrollbar leading-relaxed"
                        placeholder={mode === 'json-xml' ? "JSON verinizi buraya yapıştırın..." : "XML verinizi buraya yapıştırın..."}
                        spellCheck={false}
                    />
                    <button onClick={runAction} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-2">
                        <RefreshCw size={16} className={result.status === 'idle' ? '' : 'animate-spin'} /> İŞLEMİ ÇALIŞTIR
                    </button>
                </div>

                {/* XSD / Result Section */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                                <FileJson size={14} className="text-amber-500" /> XSD ŞEMASI (OPSİYONEL)
                            </label>
                            <button onClick={() => handleCopy(xsd)} title="Kopyala" className="p-1 text-slate-400 hover:text-amber-500 transition-all"><Copy size={14} /></button>
                        </div>
                        <textarea
                            value={xsd}
                            onChange={(e) => setXsd(e.target.value)}
                            className="w-full h-[200px] bg-slate-900 border border-white/5 rounded-[2.5rem] p-6 text-[11px] font-mono text-amber-500/70 focus:border-amber-500/30 outline-none custom-scrollbar leading-relaxed"
                            placeholder="Doğrulama için XSD şemasını buraya yapıştırın..."
                            spellCheck={false}
                        />
                    </div>

                    {/* Result Card */}
                    <div className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 h-full ${result.status === 'idle' ? 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5' :
                        result.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 animate-in zoom-in-95' :
                            'bg-red-500/5 border-red-500/20 animate-in shake-in'
                        }`}>
                        <div className="flex items-start gap-4">
                            {result.status === 'idle' ? <AlertCircle className="text-slate-400 shrink-0" /> :
                                result.status === 'success' ? <CheckCircle2 className="text-emerald-500 shrink-0" /> :
                                    <AlertCircle className="text-red-500 shrink-0" />}
                            <div>
                                <h3 className={`font-black text-[10px] uppercase tracking-[0.2em] mb-2 ${result.status === 'idle' ? 'text-slate-400' :
                                    result.status === 'success' ? 'text-emerald-500' :
                                        'text-red-500'
                                    }`}>
                                    {result.status === 'idle' ? 'İşlem Bekleniyor' : result.status === 'success' ? 'BAŞARILI' : 'HATA BULUNDU'}
                                </h3>
                                <p className={`text-sm font-medium leading-relaxed ${result.status === 'idle' ? 'text-slate-500' :
                                    result.status === 'success' ? 'text-slate-700 dark:text-slate-200' :
                                        'text-red-700 dark:text-red-400'
                                    }`}>
                                    {result.status === 'idle' ? 'Verinizi girin ve üstteki modlardan birini seçerek çalıştırın.' : result.message}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hoca Köşesi Academy Section */}
            <div className="mt-12 p-10 bg-indigo-600 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group/academy">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover/academy:scale-110 transition-transform">
                    <BookOpen size={150} />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-md border border-white/20">
                        <Sparkles className="w-8 h-8 text-indigo-200" />
                    </div>

                    <div className="space-y-4 max-w-3xl">
                        <h3 className="text-2xl font-black uppercase italic tracking-tight">Bilgi Köşesi: XML Dünyasında İki Kritik Kavram</h3>
                        <p className="text-indigo-50 font-bold italic leading-relaxed">
                            XML dünyasında kritik iki seviye vardır. İlki <span className="underline decoration-indigo-300">Well-formed (İyi Biçimlendirilmiş)</span> olmaktır; yani etiketlerin doğru açılıp kapanmasıdır. Bu kurala uyulmazsa veri işlenemez ve yapısal olarak hatalı kabul edilir.
                            İkinci seviye ise <span className="underline decoration-indigo-300">Valid (Geçerli)</span> olmaktır. Bu, XML verisinin kendisine atanan kurallara (XSD şemasına) tam uyum sağlaması demektir.
                            Örneğin, bir şema 'İsim alanı sadece harf içermeli' diyorsa ve siz sayı kullanırsanız, XML iyi biçimlendirilmiş olsa dahi 'geçersiz' (invalid) sayılır.
                            Veri entegrasyonu projelerinde bu ayrımı bilmek, yapısal hataları hızla teşhis etmenizi sağlar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

