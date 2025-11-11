'use client';

import React from 'react';
import Link from 'next/link';
import { LuHouse, LuPalette, LuSparkles, LuEye, LuRotateCcw } from 'react-icons/lu';

const AnimationVariations: React.FC = () => {
    const clearAnimationCache = () => {
        sessionStorage.removeItem('tassel-wicker-animation-shown');
        sessionStorage.removeItem('tassel-wicker-animation-v2-shown');
        sessionStorage.removeItem('tassel-wicker-animation-v3-shown');
        sessionStorage.removeItem('tassel-wicker-animation-v4-shown');
        window.location.reload();
    };

    return (
        <div className="fixed top-4 left-4 z-50 bg-luxury-black/90 backdrop-blur-sm rounded-xl p-4 border border-luxury-warm-grey/20">
            <div className="text-luxury-white text-sm font-light mb-3">Animation Variations</div>
            <div className="flex flex-col space-y-2">
                <Link
                    href="/"
                    className="flex items-center space-x-2 text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-xs"
                >
                    <LuHouse size={14} />
                    <span>Original</span>
                </Link>
                <Link
                    href="/home-v2"
                    className="flex items-center space-x-2 text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-xs"
                >
                    <LuPalette size={14} />
                    <span>Cream + Green</span>
                </Link>
                <Link
                    href="/home-v3"
                    className="flex items-center space-x-2 text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-xs"
                >
                    <LuSparkles size={14} />
                    <span>Blur Reveal</span>
                </Link>
                <Link
                    href="/home-v4"
                    className="flex items-center space-x-2 text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-xs"
                >
                    <LuEye size={14} />
                    <span>Sequential</span>
                </Link>
                <button
                    onClick={clearAnimationCache}
                    className="flex items-center space-x-2 text-luxury-warm-grey hover:text-brand-cream transition-colors duration-200 text-xs mt-2 pt-2 border-t border-luxury-warm-grey/20"
                >
                    <LuRotateCcw size={14} />
                    <span>Reset Animations</span>
                </button>
            </div>
        </div>
    );
};

export default AnimationVariations;
