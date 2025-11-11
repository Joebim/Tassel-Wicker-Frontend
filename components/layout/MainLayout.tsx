import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import ToastComponent from '../common/Toast';
import { useAnimation } from '@/context/AnimationContext';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    const isHomeVariation = location.pathname.startsWith('/home-v');
    const { showHeader, setShowHeader } = useAnimation();

    useEffect(() => {
        if (isHomePage) {
            // On home page, always show header immediately
            setShowHeader(true);
        } else if (isHomeVariation) {
            // On home variations, hide header initially (for animations)
            setShowHeader(false);
        } else {
            // On non-home pages, always show header
            setShowHeader(true);
        }
    }, [location.pathname, isHomePage, isHomeVariation, setShowHeader]);

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="relative">
                <Header showHeader={showHeader} />
                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
            {!isHomePage && !isHomeVariation && <Footer />}

            {/* Screen-wide animation overlay */}
            {/* <ScreenWideAnimation
                routes={[
                    {
                        route: '/shop',
                        version: 'v4',
                        exceptionRouteFrom: ['/product/:id', '/learn-more', '/build-your-basket', '/search']
                    }
                ]}
                className="w-[500px] text-white"
            /> */}

            <ToastComponent />
        </div>
    );
};

export default MainLayout;