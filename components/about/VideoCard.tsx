'use client';

import React, { useRef } from 'react';
import { useInView } from 'framer-motion';

interface VideoCardProps {
    videoSrc: string;
    buttonLabel?: string;
    className?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
    videoSrc,
    buttonLabel = 'Shop Baskets',
    className = ''
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });

    return (
        <div ref={ref} className={`group relative aspect-9/16 overflow-hidden bg-white ${className}`}>
            <video
                src={videoSrc}
                className="w-full h-full object-cover absolute top-0 left-0 z-0"
                autoPlay
                muted
                loop
                playsInline
            />
            <div className="absolute inset-0 z-10 p-3 flex items-end justify-center pointer-events-none">
                <button
                    type="button"
                    onClick={() => window.location.assign('/shop')}
                    className={`pointer-events-auto transition-all duration-300 ease-out px-4 w-full py-3 text-[10px] tracking-[0.35em] font-light uppercase text-white bg-white/15 backdrop-blur-sm border border-white/40 hover:bg-black hover:text-white cursor-pointer
                        ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}
                        md:opacity-0 md:translate-y-6 md:group-hover:opacity-100 md:group-hover:translate-y-0`}
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default VideoCard;

