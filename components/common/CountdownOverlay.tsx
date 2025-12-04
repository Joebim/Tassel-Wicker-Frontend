'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Logo from '@/assets/images/brand/tassel-wicker-logo.svg';

export default function CountdownOverlay() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isVisible, setIsVisible] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Defer state update to avoid synchronous setState in effect
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Only run on client side after mounting
        if (typeof window === 'undefined' || !isMounted) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const currentYear = now.getFullYear();
            // Set target date to December 5th at 11:59:59 PM
            const targetDate = new Date(currentYear, 11, 5, 23, 59, 59); // Month is 0-indexed, so 11 = December

            // If December 5th has already passed this year, target next year
            if (now > targetDate) {
                targetDate.setFullYear(currentYear + 1);
            }

            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0, shouldShow: false };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                shouldShow: true,
            };
        };

        // Defer state updates to avoid synchronous setState in effect
        const timer = setTimeout(() => {
            const initialTime = calculateTimeLeft();
            setTimeLeft({
                days: initialTime.days,
                hours: initialTime.hours,
                minutes: initialTime.minutes,
                seconds: initialTime.seconds,
            });
            setIsVisible(initialTime.shouldShow);
        }, 0);

        // Update every second
        const interval = setInterval(() => {
            const newTime = calculateTimeLeft();
            setTimeLeft({
                days: newTime.days,
                hours: newTime.hours,
                minutes: newTime.minutes,
                seconds: newTime.seconds,
            });

            // Hide when countdown reaches exactly zero
            if (!newTime.shouldShow) {
                setIsVisible(false);
                clearInterval(interval);
            }
        }, 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [isMounted]);

    // Don't render anything during SSR - return null until mounted
    if (!isMounted) {
        return null;
    }

    // Don't render if countdown has ended
    if (!isVisible) {
        return null;
    }

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-9999 bg-luxury-black flex items-center justify-center"
                >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                        <Image
                            src="https://res.cloudinary.com/dygrsvya5/image/upload/v1763661125/PROPOSED_HEADER_IMAGE_FOR_PRODUCT_PAGE_woxqv9.jpg"
                            alt="Countdown Background"
                            fill
                            className="object-cover"
                            priority
                            sizes="100vw"
                            fetchPriority="high"
                        />
                        {/* Transparent Black Overlay */}
                        <div className="absolute inset-0 bg-black/70"></div>
                    </div>

                    <div className="relative z-10 w-full max-w-2xl mx-auto px-6 sm:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center space-y-10 sm:space-y-12"
                        >
                            {/* Logo */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="flex justify-center"
                            >
                                <Logo
                                    className="w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[450px] h-auto"
                                    preserveAspectRatio="xMidYMid meet" viewBox="0 0 1114 111"
                                    style={{ color: '#ffffff' }}
                                />
                            </motion.div>

                            {/* Countdown Timer */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="max-w-xl mx-auto"
                            >
                                {/* Frosted Glass Container */}
                                <div className="backdrop-blur-md bg-white/10 rounded-2xl sm:rounded-3xl border border-white/20 p-6 sm:p-8 lg:p-10 shadow-2xl">
                                    <div className="grid grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                                        {/* Days */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-full aspect-square max-w-[70px] sm:max-w-[90px] lg:max-w-[110px] mx-auto mb-2">
                                                <div className="absolute inset-0 border border-brand-purple/40 rounded-sm"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl sm:text-2xl lg:text-3xl font-light text-luxury-white">
                                                        {timeLeft.days.toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] text-white/90 font-extralight uppercase tracking-wider">
                                                Days
                                            </span>
                                        </div>

                                        {/* Hours */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-full aspect-square max-w-[70px] sm:max-w-[90px] lg:max-w-[110px] mx-auto mb-2">
                                                <div className="absolute inset-0 border border-brand-purple/40 rounded-sm"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl sm:text-2xl lg:text-3xl font-light text-luxury-white">
                                                        {timeLeft.hours.toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] text-white/90 font-extralight uppercase tracking-wider">
                                                Hours
                                            </span>
                                        </div>

                                        {/* Minutes */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-full aspect-square max-w-[70px] sm:max-w-[90px] lg:max-w-[110px] mx-auto mb-2">
                                                <div className="absolute inset-0 border border-brand-purple/40 rounded-sm"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl sm:text-2xl lg:text-3xl font-light text-luxury-white">
                                                        {timeLeft.minutes.toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] text-white/90 font-extralight uppercase tracking-wider">
                                                Minutes
                                            </span>
                                        </div>

                                        {/* Seconds */}
                                        <div className="flex flex-col items-center">
                                            <div className="relative w-full aspect-square max-w-[70px] sm:max-w-[90px] lg:max-w-[110px] mx-auto mb-2">
                                                <div className="absolute inset-0 border border-brand-purple/40 rounded-sm"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-xl sm:text-2xl lg:text-3xl font-light text-luxury-white">
                                                        {timeLeft.seconds.toString().padStart(2, '0')}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] text-white/90 font-extralight uppercase tracking-wider">
                                                Seconds
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Minimal Date Text */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="pt-4"
                            >
                                <div className="h-px w-16 bg-brand-purple/50 mx-auto mb-4"></div>
                                <p className="text-xs sm:text-sm text-white font-extralight uppercase tracking-widest">
                                    December 5th
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

