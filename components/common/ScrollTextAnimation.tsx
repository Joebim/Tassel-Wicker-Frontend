'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollTextAnimationProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    distance?: number;
    once?: boolean;
    amount?: number;
}

const ScrollTextAnimation = ({
    children,
    className = '',
    delay = 0,
    duration = 0.4,
    direction = 'up',
    distance = 100,
    once = true,
    amount = 0.3
}: ScrollTextAnimationProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const motionRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);

    // useInView hook - always call it (React rules)
    const isInView = useInView(ref, { once, amount });

    useEffect(() => {
        // Use setTimeout to avoid synchronous setState warning
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    // Get initial and animate positions
    const getInitialPosition = () => {
        switch (direction) {
            case 'up':
                return { y: distance, opacity: 0 };
            case 'down':
                return { y: -distance, opacity: 0 };
            case 'left':
                return { x: distance, opacity: 0 };
            case 'right':
                return { x: -distance, opacity: 0 };
            default:
                return { y: distance, opacity: 0 };
        }
    };

    const getAnimatePosition = () => {
        switch (direction) {
            case 'up':
                return { y: 0, opacity: 1 };
            case 'down':
                return { y: 0, opacity: 1 };
            case 'left':
                return { x: 0, opacity: 1 };
            case 'right':
                return { x: 0, opacity: 1 };
            default:
                return { y: 0, opacity: 1 };
        }
    };

    // Track when animation should start - only after mount
    useEffect(() => {
        if (isMounted && isInView && !hasAnimated) {
            // Small delay to ensure hydration is complete
            const timer = setTimeout(() => {
                setHasAnimated(true);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isMounted, isInView, hasAnimated]);

    // Always render the same structure to prevent hydration mismatch
    // On SSR, render with initial position. After mount and in view, animate
    const initialPos = getInitialPosition();
    const finalPos = getAnimatePosition();
    const shouldAnimate = isMounted && hasAnimated && isInView;

    return (
        <div ref={ref} className="overflow-hidden relative inline-block w-fit pb-[10px]" suppressHydrationWarning>
            <motion.div
                ref={motionRef}
                className={className}
                initial={initialPos}
                animate={shouldAnimate ? finalPos : initialPos}
                transition={shouldAnimate ? {
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1]
                } : { duration: 0, delay: 0 }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollTextAnimation;
