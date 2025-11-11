import React, { useEffect, useState } from 'react';
import Logo from '../../assets/images/brand/tassel-wicker-logo.svg';
import AnimatedLogo from '../../assets/images/brand/tassel-wicker-logo-animated.svg';
import { useAnimation } from '../../context/AnimationContext';

interface LogoAnimationProps {
    version?: 'v1' | 'v2' | 'v3' | 'v4';
    onAnimationComplete?: () => void;
    className?: string;
}

const LogoAnimation: React.FC<LogoAnimationProps> = ({
    version = 'v1',
    onAnimationComplete,
    className = 'w-[500px] text-white'
}) => {
    const [showAnimatedLogo, setShowAnimatedLogo] = useState(true);
    const [hasTriggered, setHasTriggered] = useState(false);
    const { setShowHeader } = useAnimation();

    useEffect(() => {
        // Prevent double triggering
        if (hasTriggered) return;

        setHasTriggered(true);

        // Always show animation on load
        setShowAnimatedLogo(true);
        setShowHeader(false);

        // Different timing based on version
        let logoTimer: number;
        let headerTimer: number;
        let completionTimer: number;

        if (version === 'v3') {
            // V3 specific timing
            logoTimer = setTimeout(() => {
                setShowAnimatedLogo(false);
            }, 4200);

            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 5500);

            completionTimer = setTimeout(() => {
                onAnimationComplete?.();
            }, 6500);
        } else {
            // Default timing for other versions
            logoTimer = setTimeout(() => {
                setShowAnimatedLogo(false);
            }, 4200);

            headerTimer = setTimeout(() => {
                setShowHeader(true);
            }, 5000);

            completionTimer = setTimeout(() => {
                onAnimationComplete?.();
            }, 5200);
        }

        return () => {
            clearTimeout(logoTimer);
            clearTimeout(headerTimer);
            clearTimeout(completionTimer);
        };
    }, [setShowHeader, onAnimationComplete, version, hasTriggered]);

    return (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="text-center">
                {showAnimatedLogo ? (
                    <AnimatedLogo className={className} />
                ) : (
                    <Logo className={className} />
                )}
            </div>
        </div>
    );
};

export default LogoAnimation;
