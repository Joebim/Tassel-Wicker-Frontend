'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import VideoCard from './VideoCard';

interface VideoCarouselProps {
    videos: string[];
    buttonLabel?: string;
}

const VideoCarousel: React.FC<VideoCarouselProps> = ({
    videos,
    buttonLabel = 'Shop Baskets',
}) => {
    const indicatorContainerRef = useRef<HTMLDivElement>(null);

    // Calculate visible cards based on screen size
    const getVisibleCards = () => {
        if (typeof window === 'undefined') return 1.5;
        const width = window.innerWidth;
        if (width >= 1024) return 4; // lg: 4 cards
        return 1.5; // mobile: 1.5 cards
    };

    // Initialize with server-safe default (1.5) to avoid hydration mismatch
    const [visibleItemsCount, setVisibleItemsCount] = useState(1.5);
    const originalItemsLength = videos.length;
    const isRepeating = originalItemsLength > visibleItemsCount;
    const isMobile = visibleItemsCount === 1.5;

    // Current index - start in middle set for infinite scroll
    const [currentIndex, setCurrentIndex] = useState(
        isRepeating ? visibleItemsCount : 0
    );

    // Transition enabled state for seamless infinite scroll
    const [isTransitionEnabled, setTransitionEnabled] = useState(true);

    // Touch position for swipe gestures
    const [touchPosition, setTouchPosition] = useState<number | null>(null);

    // Timeout to prevent spam clicking
    const [timeoutInProgress, setTimeoutInProgress] = useState(false);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            setVisibleItemsCount(getVisibleCards());
        };

        // Initial check to match client state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset current index when visible items count changes (e.g. switching between mobile/desktop)
    useEffect(() => {
        if (isRepeating) {
            setCurrentIndex(visibleItemsCount);
        } else {
            setCurrentIndex(0);
        }
    }, [visibleItemsCount, isRepeating]);

    // Handle transition state for infinite scroll
    useEffect(() => {
        if (isRepeating) {
            if (
                currentIndex === visibleItemsCount ||
                currentIndex === originalItemsLength
            ) {
                setTransitionEnabled(true);
            }
        }
    }, [currentIndex, isRepeating, visibleItemsCount, originalItemsLength]);

    // Scroll indicator container when active dot changes
    useEffect(() => {
        if (indicatorContainerRef.current) {
            const active = indicatorContainerRef.current.querySelector('.dots-active');
            if (active) {
                const index = active.getAttribute('data-index');
                if (index !== null && indicatorContainerRef.current?.scrollTo) {
                    indicatorContainerRef.current.scrollTo({
                        left: ((Number(index) - 2) / 5) * 50,
                        behavior: 'smooth',
                    });
                }
            }
        }
    }, [currentIndex]);

    // Render previous items before the first item
    const extraPreviousItems = useMemo(() => {
        const output = [];
        for (let index = 0; index < visibleItemsCount; index++) {
            const videoIndex = originalItemsLength - 1 - index;
            output.unshift(videos[videoIndex]);
        }
        return output;
    }, [videos, originalItemsLength, visibleItemsCount]);

    // Render next items after the last item
    const extraNextItems = useMemo(() => {
        const output = [];
        for (let index = 0; index < visibleItemsCount; index++) {
            output.push(videos[index]);
        }
        return output;
    }, [videos, visibleItemsCount]);

    // Navigate forward
    const nextItem = useCallback(() => {
        const isOnEdgeForward = currentIndex > originalItemsLength;
        if (isOnEdgeForward) {
            setTimeoutInProgress(true);
        }

        if (isRepeating || currentIndex < originalItemsLength - visibleItemsCount) {
            setCurrentIndex((prevState) => prevState + 1);
        }
    }, [currentIndex, originalItemsLength, visibleItemsCount, isRepeating]);

    // Navigate backward
    const previousItem = useCallback(() => {
        const isOnEdgeBack = isRepeating
            ? currentIndex <= visibleItemsCount
            : currentIndex === 0;

        if (isOnEdgeBack) {
            setTimeoutInProgress(true);
        }

        if (isRepeating || currentIndex > 0) {
            setCurrentIndex((prevState) => prevState - 1);
        }
    }, [currentIndex, visibleItemsCount, isRepeating]);

    // Handle touch start
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touchDown = e.touches[0].clientX;
        setTouchPosition(touchDown);
    }, []);

    // Handle touch move
    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const touchDown = touchPosition;
        if (touchDown === null) {
            return;
        }

        const currentTouch = e.touches[0].clientX;
        const diff = touchDown - currentTouch;

        if (diff > 5) {
            nextItem();
        }
        if (diff < -5) {
            previousItem();
        }

        setTouchPosition(null);
    }, [touchPosition, nextItem, previousItem]);

    // Handle transition end
    const handleTransitionEnd = useCallback(() => {
        if (isRepeating) {
            if (currentIndex === 0) {
                setTransitionEnabled(false);
                setCurrentIndex(originalItemsLength);
            } else if (currentIndex === originalItemsLength + visibleItemsCount) {
                setTransitionEnabled(false);
                setCurrentIndex(visibleItemsCount);
            }
        }
        setTimeoutInProgress(false);
    }, [isRepeating, currentIndex, originalItemsLength, visibleItemsCount]);

    // Calculate transform percentage
    const calculateTransform = () => {
        return `-${currentIndex * (100 / visibleItemsCount)}%`;
    };

    // Render dots indicator
    const renderDots = useMemo(() => {
        const output = [];
        const localShow = isRepeating ? visibleItemsCount : 0;
        const localLength = isRepeating
            ? originalItemsLength
            : Math.ceil(originalItemsLength / visibleItemsCount);
        const calculatedActiveIndex =
            currentIndex - localShow < 0
                ? originalItemsLength + (currentIndex - localShow)
                : currentIndex - localShow;

        for (let index = 0; index < localLength; index++) {
            let dotClasses = '';
            if (calculatedActiveIndex === index) {
                // Active dot - larger
                dotClasses = 'w-3 h-1.5 bg-black/60 shrink-0 grow-0';
            } else {
                if (calculatedActiveIndex === 0) {
                    if (calculatedActiveIndex + index <= 2) {
                        // Close dot - medium
                        dotClasses = 'w-1.5 h-1.5 bg-black/20 shrink-0 grow-0';
                    } else {
                        // Far dot - small
                        dotClasses = 'w-1 h-1 bg-black/20 shrink-0 grow-0 mt-0.5 mb-0.5';
                    }
                } else if (calculatedActiveIndex === localLength - 1) {
                    if (Math.abs(calculatedActiveIndex - index) <= 2) {
                        // Close dot
                        dotClasses = 'w-1.5 h-1.5 bg-black/20 shrink-0 grow-0';
                    } else {
                        // Far dot
                        dotClasses = 'w-1 h-1 bg-black/20 shrink-0 grow-0 mt-0.5 mb-0.5';
                    }
                } else {
                    if (Math.abs(calculatedActiveIndex - index) === 1) {
                        // Close dot
                        dotClasses = 'w-1.5 h-1.5 bg-black/20 shrink-0 grow-0';
                    } else {
                        // Far dot
                        dotClasses = 'w-1 h-1 bg-black/20 shrink-0 grow-0 mt-0.5 mb-0.5';
                    }
                }
            }
            output.push(
                <button
                    key={index}
                    data-index={index}
                    className={`rounded-xl transition-all duration-250 ease-linear ml-1.5 first:ml-0 ${dotClasses}`}
                    onClick={() => {
                        const targetIndex = isRepeating ? visibleItemsCount + index : index;
                        setCurrentIndex(targetIndex);
                    }}
                    aria-label={`Go to slide ${index + 1}`}
                />
            );
        }
        return output;
    }, [currentIndex, isRepeating, originalItemsLength, visibleItemsCount]);

    // Always show buttons on desktop when there are more items than visible
    const isNextButtonVisible = useMemo(() => {
        if (isMobile) return false; // Hide on mobile
        return isRepeating || currentIndex < originalItemsLength - visibleItemsCount;
    }, [isMobile, isRepeating, currentIndex, originalItemsLength, visibleItemsCount]);

    const isPrevButtonVisible = useMemo(() => {
        if (isMobile) return false; // Hide on mobile
        return isRepeating || currentIndex > 0;
    }, [isMobile, isRepeating, currentIndex]);

    // Calculate total items for width
    const totalItemsCount = isRepeating
        ? extraPreviousItems.length + videos.length + extraNextItems.length
        : videos.length;

    return (
        <div className="relative w-full flex flex-col">
            {/* Carousel Wrapper */}
            <div className="relative w-full px-12 md:px-16">
                {/* Previous Button */}
                {isPrevButtonVisible && (
                    <button
                        disabled={timeoutInProgress}
                        onClick={previousItem}
                        className="absolute left-0 md:left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 shadow-lg hover:bg-white transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        style={{
                            cursor: timeoutInProgress ? 'not-allowed' : 'pointer',
                            pointerEvents: timeoutInProgress ? 'none' : 'inherit',
                        }}
                        aria-label="Previous video"
                    >
                        <LuChevronLeft size={20} className="text-gray-700" />
                    </button>
                )}

                {/* Carousel Content Wrapper */}
                <div
                    className="overflow-hidden w-full"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                >
                    {/* Carousel Content */}
                    <div
                        className="flex"
                        style={{
                            transform: `translateX(${calculateTransform()})`,
                            transition: !isTransitionEnabled ? 'none' : 'all 250ms linear',
                            width: `${totalItemsCount * (100 / visibleItemsCount)}%`,
                            margin: 0,
                            padding: 0,
                        }}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {/* Extra Previous Items */}
                        {isRepeating &&
                            extraPreviousItems.map((video, idx) => (
                                <motion.div
                                    key={`prev-${idx}`}
                                    className="shrink-0 grow-0"
                                    style={{
                                        width: isMobile ? '113px' : `calc(100% / ${visibleItemsCount})`,
                                    }}
                                    whileHover={!isMobile ? { scale: 1.02 } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`${isMobile ? 'w-[113px] mx-auto' : 'w-full px-2'}`}>
                                        <VideoCard videoSrc={video} buttonLabel={buttonLabel} />
                                    </div>
                                </motion.div>
                            ))}

                        {/* Original Items */}
                        {videos.map((video, idx) => (
                            <motion.div
                                key={idx}
                                className="shrink-0 grow-0"
                                style={{
                                    width: isMobile ? '113px' : `calc(100% / ${visibleItemsCount})`,
                                }}
                                whileHover={!isMobile ? { scale: 1.02 } : {}}
                                transition={{ duration: 0.3 }}
                            >
                                <div className={`${isMobile ? 'w-[113px] mx-auto' : 'w-full px-2'}`}>
                                    <VideoCard videoSrc={video} buttonLabel={buttonLabel} />
                                </div>
                            </motion.div>
                        ))}

                        {/* Extra Next Items */}
                        {isRepeating &&
                            extraNextItems.map((video, idx) => (
                                <motion.div
                                    key={`next-${idx}`}
                                    className="shrink-0 grow-0"
                                    style={{
                                        width: isMobile ? '113px' : `calc(100% / ${visibleItemsCount})`,
                                    }}
                                    whileHover={!isMobile ? { scale: 1.02 } : {}}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className={`${isMobile ? 'w-[113px] mx-auto' : 'w-full px-2'}`}>
                                        <VideoCard videoSrc={video} buttonLabel={buttonLabel} />
                                    </div>
                                </motion.div>
                            ))}
                    </div>
                </div>

                {/* Next Button */}
                {isNextButtonVisible && (
                    <button
                        disabled={timeoutInProgress}
                        onClick={nextItem}
                        className="absolute right-0 md:right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 backdrop-blur-sm border border-gray-300 shadow-lg hover:bg-white transition-all duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
                        style={{
                            cursor: timeoutInProgress ? 'not-allowed' : 'pointer',
                            pointerEvents: timeoutInProgress ? 'none' : 'inherit',
                        }}
                        aria-label="Next video"
                    >
                        <LuChevronRight size={20} className="text-gray-700" />
                    </button>
                )}
            </div>

            {/* Dots Indicator */}
            <div
                ref={indicatorContainerRef}
                className="flex flex-row items-center justify-center mt-8 max-w-[56px] mx-auto overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {renderDots}
            </div>
        </div>
    );
};

export default VideoCarousel;

