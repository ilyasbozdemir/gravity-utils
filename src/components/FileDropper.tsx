import React, { type DragEvent, useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropperProps {
    onFileSelect: (file: File) => void;
}

export const FileDropper: React.FC<FileDropperProps> = ({ onFileSelect }) => {
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            className={`w-full max-w-[600px] min-h-[200px] flex flex-col justify-center items-center border-2 border-dashed cursor-pointer transition-all duration-300 p-8 rounded-2xl ${isDragging
                    ? 'border-blue-400 bg-blue-400/5'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            <input
                type="file"
                ref={inputRef}
                onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
                className="hidden"
            />

            <div className="flex items-center justify-center mb-8 bg-blue-400/10 p-6 rounded-full shadow-[0_0_20px_rgba(96,165,250,0.1)]">
                <Upload size={48} className="text-blue-400" />
            </div>
            <h3 className="m-0 mb-2 text-2xl font-semibold">
                {isDragging ? 'Bırak Gelsin!' : 'Dosyayı Buraya Sürükle'}
            </h3>
            <p className="text-sm text-slate-400">veya bilgisayarından seçmek için tıkla</p>
        </div>
    );
};
