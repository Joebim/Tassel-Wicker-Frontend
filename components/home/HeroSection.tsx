'use client';

import React from 'react';
import Link from 'next/link';
import { LuArrowRight, LuPlay } from 'react-icons/lu';

const HeroSection: React.FC = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background Video */}
            <div className="absolute inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/videos/hero-loop.mp4" type="video/mp4" />
                </video>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
                <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight">
                    Quality, Aspirational,{' '}
                    <span className="text-amber-400">Timeless</span>
                </h1>
                <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl mx-auto leading-relaxed">
                    Discover our carefully curated collection of functional, aesthetically pleasing,
                    and unique lifestyle items that celebrate thoughtful gifting.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/shop"
                        className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-md transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 font-medium"
                    >
                        <span>Shop Collection</span>
                        <LuArrowRight size={20} />
                    </Link>

                    <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-md transition-all duration-300 flex items-center space-x-2 font-medium">
                        <LuPlay size={20} />
                        <span>Our Story</span>
                    </button>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
                        <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
