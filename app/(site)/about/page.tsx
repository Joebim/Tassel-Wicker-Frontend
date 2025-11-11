'use client';

import { useRef } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { motion, useInView } from 'framer-motion';
import CircularText from '@/components/common/CircularText';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import ScrollVelocity from '@/components/common/ScrollVelocity';
import VideoCard from '@/components/about/VideoCard';

export default function About() {
  const headingVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const ourStoryRef = useRef(null);
  const ourStoryInView = useInView(ourStoryRef, { once: true, amount: 0.3 });

  const builtForRef = useRef(null);
  const builtForInView = useInView(builtForRef, { once: true, amount: 0.3 });

  return (
    <div className="bg-white">
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542804/IMAGE_NINE_cdzxti.jpg"
            alt="About Header"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-40"></div>
        </div>

        <div className="flex items-end relative justify-between z-10 text-left h-full w-full p-12">
          <div className="flex flex-col text-white max-w-3xl">
            <ScrollTextAnimation
              className="md:text-[110px] text-5xl font-extralight tracking-wide uppercase leading-none"
              delay={0.2}
              duration={1.2}
            >
              ABOUT
            </ScrollTextAnimation>
            <ScrollTextAnimation
              className="md:text-[110px] whitespace-nowrap text-5xl font-extralight tracking-wide uppercase leading-none"
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
                  document.getElementById('about-content')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="relative"
              aria-label="About Us"
            >
              <CircularText
                text="ABOUT US • ABOUT US • ABOUT US • "
                spinDuration={15}
                onHover="speedUp"
                className="w-[120px] h-[120px] text-[12px] leading-0.5"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <LuChevronDown size={24} className="cursor-pointer text-white animate-bounce" aria-hidden="true" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div id="about-content">
        <motion.section
          ref={ourStoryRef}
          className="py-30 bg-white"
          initial="hidden"
          animate={ourStoryInView ? 'visible' : 'hidden'}
          variants={containerVariants}
        >
          <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 space-y-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div variants={itemVariants}>
                <motion.div className="mb-8" variants={itemVariants}>
                  <motion.div
                    className="h-1 w-16 bg-brand-purple mb-6"
                    initial={{ width: 0 }}
                    animate={ourStoryInView ? { width: 64 } : { width: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  ></motion.div>
                  <motion.h2
                    className="text-5xl font-extralight text-gray-900 leading-tight"
                    variants={headingVariants}
                  >
                    <ScrollTextAnimation delay={0.3} duration={0.8}>
                      My Why
                    </ScrollTextAnimation>
                  </motion.h2>
                </motion.div>
                <motion.p className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight" variants={itemVariants}>
                  Tassel & Wicker was created from a love for the little things that make life feel elevated and intentional. My vision is for it to become a symbol of thoughtfulness—a reminder to celebrate everyday moments and surround ourselves with pieces that bring joy and meaning.
                </motion.p>
                <motion.p className="text-lg text-gray-600 leading-relaxed font-extralight" variants={itemVariants}>
                  Through every product and experience, I hope to inspire a way of living that feels genuine, joyful, and deeply considered.
                </motion.p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542826/ABOUT_PAGE_IMAGE_v9jgbs.jpg"
                  alt="My Why"
                  className="w-full object-cover h-[600px]"
                />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="lg:order-1 order-2"
              >
                <img
                  src="https://res.cloudinary.com/dygrsvya5/image/upload/v1761149640/_2MK9308_dcgky8.jpg"
                  alt="Signature Celebration Basket"
                  className="w-full object-cover h-[600px]"
                />
              </motion.div>
              <motion.div className="lg:order-2 order-1" variants={itemVariants}>
                <motion.div className="mb-6" variants={itemVariants}>
                  <motion.p className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight" variants={itemVariants}>
                    Our story starts with a collection of signature celebration baskets, the first step toward our envisioned line of home and lifestyle pieces.
                  </motion.p>
                  <motion.p className="text-lg text-gray-600 mb-6 leading-relaxed font-extralight" variants={itemVariants}>
                    Through our celebration baskets, I invite you to reimagine how you express appreciation—not as a routine gesture, but as a chance to delight, honor individuality, and create moments that linger.
                  </motion.p>
                  <motion.p className="text-lg text-gray-600 leading-relaxed font-extralight" variants={itemVariants}>
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

        <motion.section
          ref={builtForRef}
          className="py-30 bg-luxury-charcoal"
          initial="hidden"
          animate={builtForInView ? 'visible' : 'hidden'}
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
                  <span className="line-through decoration-5 decoration-white">THOUGHT</span>{' '}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582893/VIDEO_1_qemvjg.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582835/VIDEO_2_rybtlw.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582847/VIDEO_3_yitmo6.mp4',
                'https://res.cloudinary.com/dygrsvya5/video/upload/v1762582806/VIDEO_4_lxnmu0.mp4'
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

        <div className="py-14 bg-amber-50">
          <ScrollVelocity
            texts={[<span key="scroll" className='font-extralight'>COMMITTED TO ELEVATED LIVING.</span>]}
            velocity={100}
            className="custom-scroll-text"
          />
        </div>
      </div>
    </div>
  );
}

