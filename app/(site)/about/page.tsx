'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { LuChevronDown } from 'react-icons/lu';
import { motion, useInView } from 'framer-motion';
import dynamic from 'next/dynamic';

const CircularText = dynamic(() => import('@/components/common/CircularText'), { ssr: false });
const ScrollTextAnimation = dynamic(() => import('@/components/common/ScrollTextAnimation'), { ssr: false });

import VideoCard from '@/components/about/VideoCard';

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
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542804/IMAGE_NINE_cdzxti.jpg"
            alt="About Header"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black opacity-40" />
        </div>

        <div className="relative z-10 h-full w-full p-6 sm:p-10 lg:p-12 flex flex-col items-start justify-end lg:flex-row lg:items-end lg:justify-between gap-10">
          <div className="w-full flex flex-row items-end justify-between self-end">

            <div className="flex flex-col text-white max-w-3xl text-center lg:text-left">
              <ScrollTextAnimation
                className="text-[35px] sm:text-[100px] font-extralight tracking-wide uppercase leading-none"
                delay={0.2}
                duration={1.2}
              >
                ABOUT
              </ScrollTextAnimation>
              <ScrollTextAnimation
                className="text-[35px] sm:text-[100px] text-left font-extralight tracking-wide uppercase leading-none"
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
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 space-y-24">
            {/* Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={itemVariants}>
                <motion.div className="mb-8" variants={itemVariants}>
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
                      My Why
                    </ScrollTextAnimation>
                  </motion.h2>
                </motion.div>

                <motion.p
                  className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight"
                  variants={itemVariants}
                >
                  Tassel & Wicker was created from a love for the little things that make life feel elevated and intentional. My vision is for it to become a symbol of thoughtfulness—a reminder to celebrate everyday moments and surround ourselves with pieces that bring joy and meaning.
                </motion.p>

                <motion.p
                  className="text-lg text-gray-600 leading-relaxed font-extralight"
                  variants={itemVariants}
                >
                  Through every product and experience, I hope to inspire a way of living that feels genuine, joyful, and deeply considered.
                </motion.p>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-[600px]"
              >
                <Image
                  src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542826/ABOUT_PAGE_IMAGE_v9jgbs.jpg"
                  alt="My Why"
                  fill
                  className="object-cover"
                />
              </motion.div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="lg:order-1 order-2 relative w-full h-[600px]"
              >
                <Image
                  src="https://res.cloudinary.com/dygrsvya5/image/upload/v1761149640/_2MK9308_dcgky8.jpg"
                  alt="Signature Celebration Basket"
                  fill
                  className="object-cover"
                />
              </motion.div>

              <motion.div className="lg:order-2 order-1" variants={itemVariants}>
                <motion.div className="mb-6" variants={itemVariants}>
                  <motion.p
                    className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight"
                    variants={itemVariants}
                  >
                    Our story starts with a collection of signature celebration baskets, the first step toward our envisioned line of home and lifestyle pieces.
                  </motion.p>

                  <motion.p
                    className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight"
                    variants={itemVariants}
                  >
                    Through our celebration baskets, I invite you to reimagine how you express appreciation—not as a routine gesture, but as a chance to delight, honor individuality, and create moments that linger.
                  </motion.p>

                  <motion.p
                    className="text-lg text-gray-600 leading-relaxed font-extralight"
                    variants={itemVariants}
                  >
                    Here&apos;s to celebrating the little moments that matter most.
                  </motion.p>
                </motion.div>

                <motion.div className="mt-8 pt-8 border-t border-gray-300" variants={itemVariants}>
                  <p className="text-lg text-gray-600 leading-relaxed font-extralight mb-2">
                    With love and intention,
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed font-extralight">
                    Dee
                  </p>
                  <p className="text-lg text-gray-600 leading-relaxed font-extralight">
                    Founder, Tassel & Wicker
                  </p>
                </motion.div>
              </motion.div>
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
            <motion.div className="mb-16" variants={itemVariants}>
              <motion.h2
                className="text-5xl font-extralight text-white mb-4"
                variants={headingVariants}
              >
                <ScrollTextAnimation delay={0.2} duration={0.8}>
                  IT&apos;S THE{' '}
                  <span className="line-through decoration-5 decoration-white">
                    THOUGHT
                  </span>{' '}
                  GIFT
                </ScrollTextAnimation>
              </motion.h2>

              <motion.h2
                className="text-5xl font-extralight text-white"
                variants={headingVariants}
              >
                <ScrollTextAnimation delay={0.4} duration={0.8}>
                  THAT COUNTS.
                </ScrollTextAnimation>
              </motion.h2>
            </motion.div>

            <div className="grid grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582893/VIDEO_1_qemvjg.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582835/VIDEO_2_rybtlw.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582847/VIDEO_3_yitmo6.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582806/VIDEO_4_lxnmu0.mp4',
              ].map((video, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <VideoCard videoSrc={video} buttonLabel="Shop Baskets" />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}