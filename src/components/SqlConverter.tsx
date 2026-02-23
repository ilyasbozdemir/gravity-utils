'use client';

import React, { useState, useCallback } from 'react';
import { ArrowLeft, Copy, Check, Database, Code2, FileCode, Repeat, Sparkles, FileJson, Layers } from 'lucide-react';

type OutputLanguage = 'typescript' | 'json' | 'mermaid' | 'sequelize' | 'eloquent';

export function SqlConverter({ onBack }: { onBack: () => void }) {
    const [sql, setSql] = useState(`CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);`);
    const [output, setOutput] = useState('');
    const [lang, setLang] = useState<OutputLanguage>('typescript');
    const [copied, setCopied] = useState(false);

    const convertSql = useCallback(() => {
        if (!sql.trim()) return;

        // Simple parsing logic (MVP)
        const lines = sql.split('\n');
        const tableNameMatch = sql.match(/CREATE TABLE\s+(\w+)/i);
        const tableName = tableNameMatch ? tableNameMatch[1] : 'Table';

        const columnRegex = /^\s*(\w+)\s+(\w+)/;
        const columns: { name: string, type: string, isNullable: boolean }[] = [];

        lines.forEach(line => {
            const match = line.match(columnRegex);
            if (match && !['CREATE', 'PRIMARY', 'KEY', 'CONSTRAINT', 'UNIQUE', 'INDEX'].includes(match[1].toUpperCase())) {
                columns.push({
                    name: match[1],
                    type: match[2].toUpperCase(),
                    isNullable: !line.toUpperCase().includes('NOT NULL')
                });
            }
        });

        let result = '';

        switch (lang) {
            case 'typescript':
                result = `export interface ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} {\n`;
                columns.forEach(col => {
                    let tsType = 'string';
                    if (['INT', 'BIGINT', 'FLOAT', 'DECIMAL', 'DOUBLE', 'SMALLINT'].includes(col.type)) tsType = 'number';
                    if (['BOOLEAN', 'TINYINT'].includes(col.type)) tsType = 'boolean';
                    if (['DATE', 'TIMESTAMP', 'DATETIME'].includes(col.type)) tsType = 'Date | string';

                    result += `  ${col.name}${col.isNullable ? '?' : ''}: ${tsType};\n`;
                });
                result += `}`;
                break;

            case 'json':
                const jsonObj: any = {};
                columns.forEach(col => {
                    let val: any = "string";
                    if (['INT', 'BIGINT', 'FLOAT', 'DECIMAL', 'DOUBLE', 'SMALLINT'].includes(col.type)) val = 0;
                    if (['BOOLEAN', 'TINYINT'].includes(col.type)) val = true;
                    jsonObj[col.name] = val;
                });
                result = JSON.stringify(jsonObj, null, 2);
                break;

            case 'mermaid':
                result = `erDiagram\n    ${tableName.toUpperCase()} {\n`;
                columns.forEach(col => {
                    result += `        ${col.type} ${col.name}\n`;
                });
                result += `    }`;
                break;

            case 'sequelize':
                result = `const ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} = sequelize.define('${tableName}', {\n`;
                columns.forEach(col => {
                    let seqType = 'DataTypes.STRING';
                    if (['INT', 'BIGINT'].includes(col.type)) seqType = 'DataTypes.INTEGER';
                    if (['BOOLEAN', 'TINYINT'].includes(col.type)) seqType = 'DataTypes.BOOLEAN';
                    if (['DATE', 'TIMESTAMP'].includes(col.type)) seqType = 'DataTypes.DATE';
                    if (['FLOAT', 'DOUBLE', 'DECIMAL'].includes(col.type)) seqType = 'DataTypes.DECIMAL';

                    result += `  ${col.name}: {\n    type: ${seqType},\n    allowNull: ${col.isNullable}\n  },\n`;
                });
                result += `});`;
                break;

            case 'eloquent':
                result = `class ${tableName.charAt(0).toUpperCase() + tableName.slice(1)} extends Model\n{\n`;
                result += `    protected $table = '${tableName}';\n\n`;
                result += `    protected $fillable = [\n`;
                columns.forEach(col => {
                    result += `        '${col.name}',\n`;
                });
                result += `    ];\n}`;
                break;
        }

        setOutput(result);
    }, [sql, lang]);

    React.useEffect(() => {
        convertSql();
    }, [convertSql]);

    const handleCopy = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-6 lg:p-8 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} title="Geri Dön"
                        className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                            <Repeat className="w-6 h-6 text-blue-500" /> SQL Schema Converter
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                            SQL tablolarınızı TypeScript, JSON veya Mermaid şemalarına anında dönüştürün.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={handleCopy}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        {copied ? 'SONUCU KOPYALA' : 'Kopyala'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[65vh]">
                {/* Input Area */}
                <div className="flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Database size={12} /> SQL Input (Table Definition)
                        </span>
                        <button onClick={() => setSql('')} className="text-[10px] font-black text-red-500 hover:underline">TEMİZLE</button>
                    </div>
                    <textarea
                        value={sql}
                        title="SQL Kodunu Buraya Yapıştırın"
                        placeholder="CREATE TABLE users (id INT, ...);"
                        onChange={(e) => setSql(e.target.value)}
                        className="flex-1 bg-white dark:bg-[#0b101b] border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 font-mono text-sm focus:outline-none focus:border-blue-500 transition-all shadow-inner custom-scrollbar resize-none"
                        spellCheck={false}
                    />
                </div>

                {/* Output Area */}
                <div className="flex flex-col h-full space-y-3">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 overflow-x-auto no-scrollbar">
                            {([['typescript', 'TS'], ['json', 'JSON'], ['mermaid', 'ER'], ['sequelize', 'ORM'], ['eloquent', 'PHP']] as const).map(([v, label]) => (
                                <button key={v} onClick={() => setLang(v)}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${lang === v ? 'bg-white dark:bg-white/10 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:block">Çıktı Formatı</span>
                    </div>

                    <div className="flex-1 bg-white dark:bg-[#0b101b] border-2 border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl group">
                        {/* Output Info */}
                        <div className="absolute top-6 left-6 flex items-center gap-2 pointer-events-none">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Canlı Dönüştürme Aktif</span>
                        </div>

                        <div className="p-8 h-full overflow-auto pt-14 custom-scrollbar">
                            <pre className="font-mono text-xs text-slate-700 dark:text-blue-300 leading-relaxed">
                                {output}
                            </pre>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                    </div>
                </div>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pb-20">
                <div className="p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><Layers size={20} /></div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">Anında Dönüşüm</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Yazdığınız SQL kodları siz klavyeden elinizi çekmeden tüm formatlara çevrilir.</p>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><FileJson size={20} /></div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">Zengin Çıktı</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">TypeScript Interface'den Eloquent modellere kadar geniş bir yelpazeyi destekler.</p>
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 flex items-start gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><Sparkles size={20} /></div>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">Döküman Dostu</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">Mermaid ER Diagram çıktısı ile dökümantasyon hazırlama sürenizi %90 azaltır.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

