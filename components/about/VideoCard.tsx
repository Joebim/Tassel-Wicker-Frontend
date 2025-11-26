'use client';

import React, { useRef, useState } from 'react';
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const isInView = useInView(ref, { once: false, amount: 0.3 });
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleVideoLoaded = () => {
        setIsLoading(false);
        setHasError(false);
    };

    const handleVideoError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div ref={ref} className={`group relative aspect-9/16 md:aspect-9/16 overflow-hidden h-[500px] md:h-auto ${className}`}>
            <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover absolute top-0 left-0 z-0"
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={handleVideoLoaded}
                onError={handleVideoError}
            />

            {/* Loading State with Subtle Pulse Animation */}
            {isLoading && (
                <div className="absolute inset-0 z-5 flex items-center justify-center bg-transparent">
                    <div className="w-20 h-20 border-2 border-gray-300/30 rounded-full animate-pulse opacity-40"></div>
                </div>
            )}

            {/* Error State with Subtle Pulse Animation */}
            {hasError && (
                <div className="absolute inset-0 z-5 bg-transparent">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 border-2 border-gray-300/20 rounded-full animate-pulse opacity-30"></div>
                    </div>
                </div>
            )}

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

