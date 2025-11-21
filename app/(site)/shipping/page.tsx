'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { LuChevronDown } from 'react-icons/lu';
import { motion } from 'framer-motion';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import CircularText from '@/components/common/CircularText';

export default function Shipping() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const sections = [
        {
            title: 'Processing Time',
            content:
                'Please allow 2–3 business days for processing before your parcel begins its journey. During busy seasons or for custom items, processing may take a little longer as we ensure everything is just right.',
        },
        {
            title: 'Shipping Options',
            content:
                'We currently offer standard shipping across the United Kingdom. Shipping costs are calculated at checkout based on your location and order size.',
        },
        {
            title: 'Delivery Timeline',
            content:
                'Once dispatched, standard delivery typically arrives within 3–7 business days, depending on your location.',
        },
        {
            title: 'Order Tracking',
            content:
                'When your order is on its way, you will receive a confirmation email with tracking details so you can follow its journey home to you.',
        },
        {
            title: 'International Shipping',
            content:
                'At this time, we do not offer international shipping, but we look forward to making our products available globally in the future.',
        },
        {
            title: 'Questions or Special Requests',
            content:
                'If you have a special request, a note to include, or any questions about your delivery, we\'d love to hear from you. You can reach out to us at info@tasselandwicker.com.',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            {/* Hero */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761542808/IMAGE_ONE_iwncig.jpg"
                        alt="Shipping information"
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-black opacity-40" />
                </div>
                <div className="relative z-10 h-full w-full p-6 sm:p-10 lg:p-12 flex flex-row items-end sm:items-start justify-end lg:flex-row lg:items-end lg:justify-between gap-10">
                    <div className="w-full flex flex-row items-end justify-between self-end">
                        <div className="flex flex-col text-white max-w-3xl text-center lg:text-left">
                            <ScrollTextAnimation
                                className="text-[39px] sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none"
                                delay={0.2}
                                duration={1.2}
                            >
                                SHIPPING
                            </ScrollTextAnimation>
                            <ScrollTextAnimation
                                className="text-[39px] sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none"
                                delay={0.2}
                                duration={1.2}
                            >
                                INFORMATION
                            </ScrollTextAnimation>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        document.getElementById('shipping-content')?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="relative"
                                aria-label="Learn More"
                            >
                                <CircularText
                                    text="LEARN MORE • LEARN MORE • LEARN MORE • "
                                    spinDuration={15}
                                    onHover="speedUp"
                                    className="w-[70px] h-[70px] text-[11px] leading-0.5 sm:w-[120px] sm:h-[120px] sm:text-[12px]"
                                />
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <LuChevronDown size={24} className="cursor-pointer text-white animate-bounce" aria-hidden="true" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section id="shipping-content" className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
                    <div className="text-center mb-16">
                        <p className="text-lg text-luxury-cool-grey font-extralight leading-relaxed max-w-3xl mx-auto">
                            At Tassel & Wicker, every order is prepared with care and attention. From the moment your baskets are wrapped to the moment they arrive at your home, we want the experience to feel considered.
                        </p>
                    </div>
                    {sections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ duration: 0.6, delay: index * 0.05 }}
                            className="border border-luxury-warm-grey/20 rounded-3xl p-8 md:p-12 bg-white/60 backdrop-blur-sm"
                        >
                            <h2 className="text-2xl md:text-3xl font-extralight uppercase tracking-[0.25em] text-luxury-charcoal mb-4">
                                {section.title}
                            </h2>
                            <p className="text-luxury-cool-grey font-extralight text-base md:text-lg leading-relaxed">
                                {section.content}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
