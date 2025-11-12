'use client';

import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import {
    motion,
    useScroll,
    useSpring,
    useTransform,
    useMotionValue,
    useVelocity
} from 'framer-motion';
import './ScrollVelocity.css';

interface VelocityMapping {
    input: [number, number];
    output: [number, number];
}

interface VelocityTextProps {
    children: React.ReactNode;
    baseVelocity: number;
    scrollContainerRef?: React.RefObject<HTMLElement>;
    className?: string;
    damping?: number;
    stiffness?: number;
    numCopies?: number;
    velocityMapping?: VelocityMapping;
    parallaxClassName?: string;
    scrollerClassName?: string;
    parallaxStyle?: React.CSSProperties;
    scrollerStyle?: React.CSSProperties;
}

interface ScrollVelocityProps {
    scrollContainerRef?: React.RefObject<HTMLElement>;
    texts: Array<string | React.ReactNode>;
    velocity?: number;
    className?: string;
    damping?: number;
    stiffness?: number;
    numCopies?: number;
    velocityMapping?: VelocityMapping;
    parallaxClassName?: string;
    scrollerClassName?: string;
    parallaxStyle?: React.CSSProperties;
    scrollerStyle?: React.CSSProperties;
}

function useElementWidth<T extends HTMLElement>(ref: React.RefObject<T | null>): number {
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        function updateWidth() {
            if (ref.current) {
                setWidth(ref.current.offsetWidth);
            }
        }
        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, [ref]);

    return width;
}

// Move VelocityText outside to prevent build issues
function VelocityText({
    children,
    baseVelocity,
    scrollContainerRef,
    className = '',
    damping,
    stiffness,
    numCopies,
    velocityMapping,
    parallaxClassName = 'parallax',
    scrollerClassName = 'scroller',
    parallaxStyle,
    scrollerStyle
}: VelocityTextProps) {
    const [isMounted, setIsMounted] = useState(false);
    const baseX = useMotionValue(0);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Always call hooks unconditionally (React rules), but they'll handle SSR gracefully
    const scrollOptions = scrollContainerRef ? { container: scrollContainerRef } : {};
    const { scrollY } = useScroll(scrollOptions);
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: damping ?? 50,
        stiffness: stiffness ?? 400
    });
    const velocityFactor = useTransform(
        smoothVelocity,
        velocityMapping?.input || [0, 1000],
        velocityMapping?.output || [0, 5],
        { clamp: false }
    );

    const copyRef = useRef<HTMLSpanElement>(null);
    const copyWidth = useElementWidth(copyRef);

    function wrap(min: number, max: number, v: number): number {
        const range = max - min;
        const mod = (((v - min) % range) + range) % range;
        return mod + min;
    }

    const x = useTransform(baseX, v => {
        if (!isMounted || copyWidth === 0) return '0px';
        return `${wrap(-copyWidth, 0, v)}px`;
    });

    const directionFactor = useRef<number>(1);
    const lastTimeRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);

    // Use animation frame only on client side after mount
    useEffect(() => {
        if (!isMounted || typeof window === 'undefined') return;

        const animate = (timestamp: number) => {
            if (lastTimeRef.current === 0) {
                lastTimeRef.current = timestamp;
            }
            const delta = timestamp - lastTimeRef.current;
            lastTimeRef.current = timestamp;

            let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

            if (velocityFactor.get() < 0) {
                directionFactor.current = -1;
            } else if (velocityFactor.get() > 0) {
                directionFactor.current = 1;
            }

            moveBy += directionFactor.current * moveBy * velocityFactor.get();
            baseX.set(baseX.get() + moveBy);

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isMounted, baseVelocity, velocityFactor, baseX]);

    // Always render the same number of spans to prevent hydration mismatch
    const spans = [];
    for (let i = 0; i < (numCopies ?? 6); i++) {
        spans.push(
            <span
                className={className}
                key={i}
                ref={i === 0 ? copyRef : null}
                style={{ marginRight: '150px' }}
            >
                {children}
            </span>
        );
    }

    // Always render the same structure to prevent hydration mismatch
    // The x transform will be applied by Framer Motion, which handles SSR gracefully
    return (
        <div className={parallaxClassName || 'parallax'} style={parallaxStyle}>
            <motion.div 
                className={scrollerClassName || 'scroller'} 
                style={{ x, ...scrollerStyle }}
            >
                {spans}
            </motion.div>
        </div>
    );
}

const ScrollVelocity: React.FC<ScrollVelocityProps> = ({
    scrollContainerRef,
    texts = [],
    velocity = 100,
    className = '',
    damping = 50,
    stiffness = 400,
    numCopies = 6,
    velocityMapping = { input: [0, 1000], output: [0, 5] },
    parallaxClassName = 'parallax',
    scrollerClassName = 'scroller',
    parallaxStyle,
    scrollerStyle
}) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Always render the same structure to prevent hydration mismatch
    // Render VelocityText wrapper on both server and client, but disable animations during SSR
    return (
        <section>
            {texts.map((text, index: number) => (
                <VelocityText
                    key={index}
                    className={className}
                    baseVelocity={index % 2 !== 0 ? -velocity : velocity}
                    scrollContainerRef={scrollContainerRef}
                    damping={damping}
                    stiffness={stiffness}
                    numCopies={numCopies}
                    velocityMapping={velocityMapping}
                    parallaxClassName={parallaxClassName}
                    scrollerClassName={scrollerClassName}
                    parallaxStyle={parallaxStyle}
                    scrollerStyle={scrollerStyle}
                >
                    {text}
                    {' '}
                </VelocityText>
            ))}
        </section>
    );
};

export default ScrollVelocity;
