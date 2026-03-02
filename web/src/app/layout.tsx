import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using google fonts via next/font
import "./globals.css";
import { Toaster } from 'sonner';
// We need to move ThemeProvider to a Client Component wrapper if it's using hooks directly in the layout, or keep it if it's "use client"
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Gravity Utils - Hepsi Bir Arada Dijital Araç Seti",
    description: "Tarayıcı tabanlı, hızlı ve güvenli hepsi bir arada araç seti. Dosya, ağ, geliştirici ve grafik araçları.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 🛡️ Global Crash Reporter for Electron
    if (typeof window !== 'undefined') {
        window.onerror = (msg, url, line, col, error) => {
            const electron = (window as any).electron;
            if (electron?.reportUIError) {
                electron.reportUIError({ msg, url, line, col, stack: error?.stack });
            }
        };
    }

    return (
        <html lang="tr" suppressHydrationWarning>
            <body className={inter.className}>
                <div className="min-h-screen bg-slate-50 dark:bg-[#06070a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
                    {/* We need to ensure ThemeProvider wraps correctly. If it's not a client component, we error. */}
                    {/* I will add 'use client' to ThemeContext.tsx next. */}
                    <ThemeProvider>
                        <div className="min-h-screen">
                            {children}
                        </div>
                        <Toaster richColors position="top-right" closeButton />
                    </ThemeProvider>
                </div>
            </body>
        </html>
    );
}
