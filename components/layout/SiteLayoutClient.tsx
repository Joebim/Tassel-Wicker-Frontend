'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import ToastComponent from '@/components/common/Toast';
import CountdownOverlay from '@/components/common/CountdownOverlay';

export default function SiteLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    // Compute header visibility directly from pathname
    // Handle null/undefined pathname during SSR
    const showHeader = useMemo(() => {
        if (!pathname) return true; // Default to showing header during SSR
        const isHomePage = pathname === '/';
        const isHomeVariation = pathname.startsWith('/home-v');
        return isHomePage || (!isHomeVariation);
    }, [pathname]);

    const isHomePage = useMemo(() => pathname === '/', [pathname]);
    const isHomeVariation = useMemo(() => pathname?.startsWith('/home-v') ?? false, [pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <CountdownOverlay />
            <div className="relative">
                <Header showHeader={showHeader} />
                <main className="flex-1">
                    {children}
                </main>
            </div>
            {!isHomePage && !isHomeVariation && <Footer />}
            <ToastComponent />
        </div>
    );
}

