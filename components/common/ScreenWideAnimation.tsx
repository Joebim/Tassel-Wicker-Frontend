'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Logo from '@/assets/images/brand/tassel-wicker-logo.svg';
import AnimatedLogo from '@/assets/images/brand/tassel-wicker-logo-animated.svg';
import { useAnimation } from '@/context/AnimationContext';

interface AnimationRoute {
    route: string;
    version: 'v1' | 'v2' | 'v3' | 'v4';
    exceptionRouteFrom?: string[];
}

interface ScreenWideAnimationProps {
    routes: AnimationRoute[];
    className?: string;
}

const ScreenWideAnimation: React.FC<ScreenWideAnimationProps> = ({
    routes,
    className = 'w-[500px] text-white'
}) => {
    const [showAnimatedLogo, setShowAnimatedLogo] = useState(true);
    const [showBackground, setShowBackground] = useState(true);
    const [showBlur, setShowBlur] = useState(true);
    const [showDarkBackground, setShowDarkBackground] = useState(true);
    const [showBlurOverlay, setShowBlurOverlay] = useState(false);
    const [blurIntensity, setBlurIntensity] = useState(0);
    const [showAnimation, setShowAnimation] = useState(false);
    const { setShowHeader } = useAnimation();
    const pathname = usePathname();
    const previousLocationRef = useRef<string>('');

    useEffect(() => {
        // Reset animation state when route changes
        setShowAnimatedLogo(true);
        setShowHeader(false);

        // Initialize version-specific states
        const currentRoute = pathname;
        const routeConfig = routes.find(r => r.route === currentRoute);

        if (!routeConfig) {
            // No animation for this route
            setShowAnimation(false);
            setShowAnimatedLogo(false);
            setShowHeader(true);
            previousLocationRef.current = currentRoute;
            return;
        }

        // Check if current route should be skipped based on previous route
        const previousRoute = previousLocationRef.current;
        if (routeConfig.exceptionRouteFrom && routeConfig.exceptionRouteFrom.length > 0) {
            const shouldSkip = routeConfig.exceptionRouteFrom.some(exceptionRoute => {
                // Handle dynamic routes like "/product-view/:id"
                if (exceptionRoute.includes(':')) {
                    const pattern = exceptionRoute.replace(/:[^/]+/g, '[^/]+');
                    const regex = new RegExp(`^${pattern}$`);
                    return regex.test(previousRoute);
                }
                return previousRoute === exceptionRoute;
            });

            if (shouldSkip) {
                // Skip animation and show header immediately
                setShowAnimation(false);
                setShowAnimatedLogo(false);
                setShowHeader(true);
                previousLocationRef.current = currentRoute;
                return;
            }
        }

        // Start the animation
        const version = routeConfig.version;
        setShowAnimation(true);

        // Initialize version-specific states
        if (version === 'v2') {
            setShowBackground(true);
        } else if (version === 'v3') {
            setShowBlur(true);
        } else if (version === 'v4') {
            setShowDarkBackground(true);
            setShowBlurOverlay(false);
            setBlurIntensity(0);
        }

        // Ensure initial overlays are visible at start for each version
        if (version === 'v1') {
            // no extra overlay
        } else if (version === 'v2') {
            setShowBackground(true);
        } else if (version === 'v3') {
            setShowBlur(true);
        } else if (version === 'v4') {
            setShowDarkBackground(true);
            setShowBlurOverlay(false);
            setBlurIntensity(20);
        }

        // Different timing based on version
        let headerTimer: ReturnType<typeof setTimeout>;
        let backgroundTimer: ReturnType<typeof setTimeout>;
        let blurTimer: ReturnType<typeof setTimeout>;
        let blurReductionTimer: ReturnType<typeof setTimeout>;
        let blurReductionTimer2: ReturnType<typeof setTimeout>;
        let blurReductionTimer3: ReturnType<typeof setTimeout>;

        // Switch to static logo after animation completes (4.2 seconds)
        const logoTimer = setTimeout(() => {
            setShowAnimatedLogo(false);
        }, 4200);

        // Hide static logo quickly after it appears
        const hideStaticLogoTimer = setTimeout(() => {
            setShowAnimation(false);
        }, 4600);

        if (version === 'v1') {
            // V1: Simple animation
            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 4500);
        } else if (version === 'v2') {
            // V2: Cream background fade (keep logo brand green)
            backgroundTimer = setTimeout(() => {
                setShowBackground(false);
            }, 4200);

            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 4500);
        } else if (version === 'v3') {
            // V3: Blur fade away
            blurTimer = setTimeout(() => {
                setShowBlur(false);
            }, 4200);

            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 4500);
        } else if (version === 'v4') {
            // V4: Dark background to blur transition
            backgroundTimer = setTimeout(() => {
                setShowDarkBackground(false);
                setShowBlurOverlay(true);
                setBlurIntensity(20);
            }, 4200);

            blurReductionTimer = setTimeout(() => {
                setBlurIntensity(10);
            }, 4500);

            blurReductionTimer2 = setTimeout(() => {
                setBlurIntensity(5);
            }, 5000);

            blurReductionTimer3 = setTimeout(() => {
                setBlurIntensity(0);
            }, 5500);

            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 6000);
        }

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(hideStaticLogoTimer);
            clearTimeout(headerTimer);
            clearTimeout(backgroundTimer);
            clearTimeout(blurTimer);
            clearTimeout(blurReductionTimer);
            clearTimeout(blurReductionTimer2);
            clearTimeout(blurReductionTimer3);
        };
    }, [pathname, routes, setShowHeader]);

    // Update previous location after effect runs
    useEffect(() => {
        previousLocationRef.current = pathname;
    }, [pathname]);

    // Get current route and find matching animation
    const currentRoute = pathname;
    const routeConfig = routes.find(r => r.route === currentRoute);

    if (!routeConfig || !showAnimation) {
        return null; // No animation for this route or animation is hidden
    }

    const version = routeConfig.version;

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            {/* V2: Cream background overlay */}
            {version === 'v2' && (
                <div className={`absolute inset-0 bg-luxury-white transition-opacity duration-1000 ease-out ${showBackground ? 'opacity-100' : 'opacity-0'}`}></div>
            )}

            {/* V3: Blur background */}
            {version === 'v3' && (
                <div className={`absolute inset-0 backdrop-blur-md bg-black/20 transition-opacity duration-1000 ease-out ${showBlur ? 'opacity-100' : 'opacity-0'}`}></div>
            )}

            {/* V4: Dark background */}
            {version === 'v4' && (
                <div className={`absolute inset-0 bg-luxury-black transition-opacity duration-1000 ease-out ${showDarkBackground ? 'opacity-100' : 'opacity-0'}`}></div>
            )}

            {/* V4: Progressive blur overlay */}
            {version === 'v4' && (
                <div className={`absolute inset-0 backdrop-blur-sm bg-black/10 transition-all duration-1000 ease-out ${showBlurOverlay ? 'opacity-100' : 'opacity-0'}`} style={{
                    backdropFilter: `blur(${blurIntensity}px)`,
                    WebkitBackdropFilter: `blur(${blurIntensity}px)`
                }}></div>
            )}

            {/* Logo Animation */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    {showAnimatedLogo ? (
                        <AnimatedLogo
                            className={`${className} transition-colors duration-1000 ease-out`}
                            style={{ color: version === 'v2' ? '#00351d' : 'white' }}
                        />
                    ) : (
                        <Logo
                            className={`${className} transition-colors duration-1000 ease-out`}
                            style={{ color: version === 'v2' ? '#00351d' : 'white' }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScreenWideAnimation;
