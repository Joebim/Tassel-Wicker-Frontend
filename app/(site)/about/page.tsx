'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { LuChevronDown } from 'react-icons/lu';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Great_Vibes } from 'next/font/google';

const CircularText = dynamic(() => import('@/components/common/CircularText'), { ssr: false });
const ScrollTextAnimation = dynamic(() => import('@/components/common/ScrollTextAnimation'), { ssr: false });

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import VideoCard from '@/components/about/VideoCard';

// Google Font for signature
const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-great-vibes',
});

export default function About() {
  // ---------------------------------------------------------------
  // Animation variants (unchanged)
  // ---------------------------------------------------------------
  const headingVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  // Container variants with fallback to ensure content is visible
  const containerVariants = {
    hidden: { opacity: 0.01 }, // Use 0.01 instead of 0 to ensure it can animate
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const ourStoryRef = useRef<HTMLElement>(null);
  const ourStoryInView = useInView(ourStoryRef, { once: true, amount: 0.1, margin: '-100px' });
  const [ourStoryVisible, setOurStoryVisible] = useState(false);

  const builtForRef = useRef<HTMLElement>(null);
  const builtForInView = useInView(builtForRef, { once: true, amount: 0.1, margin: '-100px' });
  const [builtForVisible, setBuiltForVisible] = useState(false);

  // Check if elements are in view on mount and after scroll
  useEffect(() => {
    const checkInView = () => {
      if (typeof window === 'undefined') return;

      if (ourStoryRef.current) {
        const rect = ourStoryRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 1.5 && rect.bottom > -window.innerHeight * 0.5;
        if (isVisible && !ourStoryVisible) {
          setOurStoryVisible(true);
        }
      }
      if (builtForRef.current) {
        const rect = builtForRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 1.5 && rect.bottom > -window.innerHeight * 0.5;
        if (isVisible && !builtForVisible) {
          setBuiltForVisible(true);
        }
      }
    };

    // Check after a short delay to ensure DOM is ready
    const timer = setTimeout(() => {
      checkInView();
    }, 100);

    // Check on scroll
    window.addEventListener('scroll', checkInView, { passive: true });
    window.addEventListener('resize', checkInView);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', checkInView);
      window.removeEventListener('resize', checkInView);
    };
  }, [ourStoryVisible, builtForVisible]);

  // ---------------------------------------------------------------
  // JSX (unchanged except the imported components)
  // ---------------------------------------------------------------
  return (
    <div className="bg-white">
      {/* HERO */}
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1761542804/IMAGE_SEVEN_w8mzsc.jpg"
            alt="About Header"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            onError={(e) => {
              // Retry loading on error
              const target = e.target as HTMLImageElement;
              if (target.src && !target.src.includes('retry')) {
                setTimeout(() => {
                  target.src = `${target.src}${target.src.includes('?') ? '&' : '?'}retry=${Date.now()}`;
                }, 1000);
              }
            }}
          />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>

        <div className="relative z-10 h-full w-full p-6 sm:p-10 lg:p-12 flex flex-col items-start justify-end lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="w-full flex flex-row items-end justify-between self-end">

            <div className="flex flex-col text-white text-center lg:text-left">
              <ScrollTextAnimation
                className="text-[30px] sm:text-[90px] font-extralight tracking-wide uppercase leading-none"
                delay={0.2}
                duration={1.2}
              >
                ABOUT
              </ScrollTextAnimation>
              <ScrollTextAnimation
                className="text-[30px] sm:text-[90px] text-left font-extralight tracking-wide uppercase leading-none"
                delay={0.4}
                duration={1.2}
              >
                TASSEL & WICKER
              </ScrollTextAnimation>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    document
                      .getElementById('about-content')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="relative"
                aria-label="About Us"
              >
                <CircularText
                  text="ABOUT US • ABOUT US • ABOUT US • "
                  spinDuration={15}
                  onHover="speedUp"
                  className="w-[70px] h-[70px] text-[11px] leading-0.5 sm:w-[120px] sm:h-[120px] sm:text-[12px]"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <LuChevronDown
                    size={24}
                    className="cursor-pointer text-white animate-bounce"
                    aria-hidden="true"
                  />
                </div>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* CONTENT */}
      <div id="about-content" className="relative z-10">
        {/* OUR STORY */}
        <motion.section
          ref={ourStoryRef}
          className="py-20 sm:py-24 lg:py-32 bg-white"
          initial="hidden"
          animate={(ourStoryInView || ourStoryVisible) ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            {/* Mobile: Single flex container, Desktop: Two separate grid rows with spacing */}
            <div className="flex flex-col lg:contents gap-8 sm:gap-16">
              {/* Row 1 - Desktop Grid, Mobile: flex children */}
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-16 lg:items-center lg:mb-24">
                {/* Heading - Order 1 on mobile */}
                <motion.div variants={itemVariants} className="order-1">
                  <motion.div className="" variants={itemVariants}>
                    <motion.div
                      className="h-1 w-16 bg-brand-purple mb-6"
                      initial={{ width: 0 }}
                      animate={(ourStoryInView || ourStoryVisible) ? { width: 64 } : { width: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    />
                    <motion.h2
                      className="text-5xl font-extralight text-gray-900 leading-tight"
                      variants={headingVariants}
                    >
                      <ScrollTextAnimation delay={0.3} duration={0.8}>
                        MY WHY
                      </ScrollTextAnimation>
                    </motion.h2>
                  </motion.div>
                </motion.div>

                {/* First Image - Order 2 on mobile */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-[600px] order-2 lg:row-span-2"
                >
                  <Image
                    src="https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1763659367/UPDATED_ABOUT_IMAGE_ogsr4o.jpg"
                    alt="My Why"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Text Content - Order 3 on mobile */}
                <motion.div variants={itemVariants} className="order-3">
                  <motion.p
                    className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight mt-4 lg:mt-0"
                    variants={itemVariants}
                  >
                    Tassel & Wicker was created from a love for the little things that make life feel elevated and intentional. Think soft woven throw blankets, polished crystals, marble coasters, tin cookies, incense cones, tassel key chains, linen notepads, duck feather cushions…little tokens of comfort that slow us down, center us and help transform an ordinary space into a sanctuary of calm and creativity.
                  </motion.p>

                  <motion.p
                    className="text-lg text-gray-600 leading-relaxed font-extralight"
                    variants={itemVariants}
                  >
                    My vision is for Tassel & Wicker to stand as a symbol of thoughtfulness; a reminder to celebrate everyday moments and surround ourselves with quality pieces that bring joy and meaning. Through every product and experience, I hope to inspire a way of living that feels elevated, joyful and deeply considered.
                  </motion.p>
                </motion.div>
              </div>

              {/* Row 2 - Desktop Grid, Mobile: flex children */}
              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 sm:gap-16 lg:items-center">
                {/* Second Image - Order 4 on mobile (after text) */}
                <motion.div
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="lg:order-1 order-4 relative w-full h-[600px]"
                >
                  <Image
                    src="https://res.cloudinary.com/dygrsvya5/image/upload/f_auto/v1764234195/STACKED_BASKETS_h4nxfk.jpg"
                    alt="Signature Celebration Basket"
                    fill
                    className="object-cover"
                  />
                </motion.div>

                {/* Rest of Text Content - Order 5 on mobile */}
                <motion.div className="lg:order-2 order-5" variants={itemVariants}>

                  <motion.div className="mb-6" variants={itemVariants}>
                    <motion.p
                      className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight"
                      variants={itemVariants}
                    >
                      Our story starts with a collection of signature celebration baskets, the first step toward our envisioned line of home and lifestyle pieces. Through our celebration baskets, I invite you to reimagine how you express appreciation; not as a routine gesture, but as a chance to connect, honor individuality and create beautiful memories.
                    </motion.p>

                    <motion.p
                      className="text-lg text-gray-600 leading-relaxed font-extralight"
                      variants={itemVariants}
                    >
                      Here&apos;s to celebrating the little things and moments that make life feel special.
                    </motion.p>
                  </motion.div>

                  <motion.div className="mt-8 pt-6" variants={itemVariants}>
                    <p className="text-lg text-gray-600 leading-relaxed font-extralight mb-4 italic">
                      With love and intention,
                    </p>
                    <div className={`mb-2 ${greatVibes.variable}`}>
                      <p className={`text-4xl md:text-5xl text-gray-700 leading-relaxed tracking-wide transform rotate-[-0.5deg] ${greatVibes.className}`}>
                        Dee
                      </p>
                    </div>
                    <p className="text-lg text-gray-500 leading-relaxed font-extralight italic mt-2">
                      Founder, Tassel & Wicker
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* BUILT FOR */}
        <motion.section
          ref={builtForRef}
          className="py-20 sm:py-24 lg:py-32 bg-luxury-charcoal"
          initial="hidden"
          animate={(builtForInView || builtForVisible) ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
            <motion.div className="sm:mb-16 mb-8 gap-1 sm:gap-2 flex flex-row" variants={itemVariants}>
              <motion.h2
                className="text-5xl font-extralight text-white mb-0 sm:mb-4"
                variants={headingVariants}
              >
                <ScrollTextAnimation delay={0.2} duration={0.8} className='text-[18px] sm:text-[39px]'>
                  IT&apos;S THE{' '}
                  <span className="line-through decoration-1 sm:decoration-5 decoration-white">
                    THOUGHT
                  </span>{' '}
                  GIFT THAT COUNTS
                </ScrollTextAnimation>
              </motion.h2>
            </motion.div>

            <motion.div variants={itemVariants} className="w-full">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                  slidesToScroll: 1,
                }}
                className="w-full"
                setApi={(api) => {
                  // Start at the middle set (position 4) for seamless infinite scroll
                  if (api) {
                    setTimeout(() => {
                      api.scrollTo(4, false); // false = no animation, jump directly
                    }, 0);
                  }
                }}
              >
                <CarouselContent className="ml-0 md:-ml-4">
                  {(() => {
                    // Duplicate videos for proper infinite scroll on desktop
                    const videos = [
                      'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582893/VIDEO_1_qemvjg.mp4',
                      'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582835/VIDEO_2_rybtlw.mp4',
                      'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582847/VIDEO_3_yitmo6.mp4',
                      'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582806/VIDEO_4_lxnmu0.mp4',
                    ];
                    // Create 3 sets for seamless infinite scroll
                    const duplicatedVideos = [...videos, ...videos, ...videos];
                    return duplicatedVideos.map((video, index) => (
                      <CarouselItem
                        key={index}
                        className={`${index === 0 ? 'pl-0 pr-2' : 'pl-2 pr-2'} md:pl-4 md:pr-0 basis-[82%]! md:basis-1/4!`}
                      >
                        <div className="p-1 md:p-1">
                          <div className="mx-auto w-full">
                            <VideoCard videoSrc={video} buttonLabel="Shop Baskets" className='rounded-sm' />
                          </div>
                        </div>
                      </CarouselItem>
                    ));
                  })()}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex left-0 md:left-4 w-10 h-10 md:w-12 md:h-12 z-30" />
                <CarouselNext className="hidden md:flex right-0 md:right-4 w-10 h-10 md:w-12 md:h-12 z-30" />
              </Carousel>
            </motion.div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}