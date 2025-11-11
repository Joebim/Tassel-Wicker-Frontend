import React from 'react';

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
    return (
        <div className={`group relative aspect-9/16 overflow-hidden bg-white ${className}`}>
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
                    className="pointer-events-auto opacity-0 group-hover:opacity-100 translate-y-6 group-hover:translate-y-0 transition-all duration-300 ease-out px-4 w-full py-3 text-[10px] tracking-[0.35em] font-light uppercase text-white bg-white/15 backdrop-blur-sm border border-white/40 hover:bg-black hover:text-white cursor-pointer"
                >
                    {buttonLabel}
                </button>
            </div>
        </div>
    );
};

export default VideoCard;

