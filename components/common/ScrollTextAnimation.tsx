'use client';

import React, { useRef, useState, useEffect } from 'react';
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
    const [mounted, setMounted] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    
    // Always call hooks (React rules)
    const isInView = useInView(ref, { once, amount });

    useEffect(() => {
        setMounted(true);
    }, []);

    const getInitialPosition = () => {
        switch (direction) {
            case 'up':
                return { y: distance, opacity: 1 };
            case 'down':
                return { y: -distance, opacity: 1 };
            case 'left':
                return { x: distance, opacity: 1 };
            case 'right':
                return { x: -distance, opacity: 1 };
            default:
                return { y: distance, opacity: 1 };
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

    // Return a simple div during SSR to prevent hydration mismatches
    // Don't use motion components during SSR
    if (!mounted || typeof window === 'undefined') {
        return (
            <div className={className}>
                {children}
            </div>
        );
    }

    return (
        <div ref={ref} className="overflow-hidden relative inline-block w-fit pb-[10px]">
            <motion.div
                className={className}
                initial={getInitialPosition()}
                animate={isInView ? getAnimatePosition() : getInitialPosition()}
                transition={{
                    duration,
                    delay,
                    ease: [0.25, 0.1, 0.25, 1]
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollTextAnimation;
