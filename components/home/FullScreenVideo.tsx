'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LuChevronDown, LuVolume2, LuVolumeX, LuArrowRight } from 'react-icons/lu';
import Link from 'next/link';

const FullScreenVideo: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            // Set video to muted by default
            video.muted = true;

            // Ensure video plays
            const playVideo = async () => {
                try {
                    await video.play();
                } catch (error) {
                    console.log('Autoplay prevented:', error);
                    document.addEventListener('click', () => {
                        video.play();
                    }, { once: true });
                }
            };
            playVideo();
        }
    }, []);

    const toggleMute = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = !video.muted;
            setIsMuted(video.muted);
        }
    };

    return (
        <div className="relative h-screen w-full overflow-hidden">
            {/* Full-screen video background */}
            <div className="absolute inset-0 z-0">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                    onLoadStart={() => console.log('Video loading started')}
                    onCanPlay={() => console.log('Video can play')}
                    onError={(e) => console.error('Video error:', e)}
                >
                    <source
                        src="https://res.cloudinary.com/dygrsvya5/video/upload/q_auto:low/v1761149777/LOOP_VIDEO_isr7h3.mp4"
                        type="video/mp4"
                    />
                    Your browser does not support the video tag.
                </video>
                {/* Subtle overlay for better text readability */}
                <div className="absolute inset-0 bg-black opacity-30"></div>
            </div>

            {/* Luxury Call-to-Action */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-10 text-center">
                <Link
                    href="/shop"
                    className="group flex flex-col items-center space-y-4 hover:scale-105 transition-all duration-500 ease-out"
                >
                    {/* Luxury Text */}
                    <div className="relative">
                        <div className="text-white text-xs whitespace-nowrap md:text-sm font-extralight tracking-[0.25em] uppercase opacity-95">
                            Discover Our SIGNATURE
                        </div>
                        <div className="text-white text-sm whitespace-nowrap md:text-base font-extralight tracking-[0.15em] uppercase mt-1">
                            Celebration Baskets
                        </div>
                        {/* Decorative line */}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-px bg-linear-to-r from-transparent via-luxury-white to-transparent opacity-50"></div>
                    </div>

                    {/* Luxury Arrow with Animation */}
                    <div className="relative">
                        <div className="animate-bounce">
                            <div className="bg-black/20 backdrop-blur-sm rounded-full p-3 border border-white/20 group-hover:border-luxury-white/60 transition-all duration-300">
                                <LuChevronDown
                                    size={18}
                                    className="text-white group-hover:text-luxury-white drop-shadow-2xl transition-colors duration-300"
                                />
                            </div>
                        </div>
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-luxury-white/10 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>

                    {/* Subtle "Shop Now" hint */}
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
                        <div className="flex items-center space-x-2 text-luxury-white text-xs font-extralight tracking-wider uppercase">
                            <span>Shop Now</span>
                            <LuArrowRight size={12} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Video Controls - Bottom Right */}
            <div className="absolute bottom-6 right-6 z-10">
                {/* Mute/Unmute Button */}
                <button
                    onClick={toggleMute}
                    className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                >
                    {isMuted ? (
                        <LuVolumeX size={20} className="text-white group-hover:scale-110 transition-transform duration-200" />
                    ) : (
                        <LuVolume2 size={20} className="text-white group-hover:scale-110 transition-transform duration-200" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default FullScreenVideo;