'use client';

import { useEffect } from 'react';
import { LuChevronDown } from 'react-icons/lu';
import { motion } from 'framer-motion';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import CircularText from '@/components/common/CircularText';

export default function ReturnsExchanges() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const sections = [
        {
            title: 'Our Approach',
            content:
                'Each Tassel & Wicker piece is chosen with intention, and we hope you love your order as much as we enjoyed curating it. Because many baskets are assembled to order, we review every return or exchange on an individual basis.',
        },
        {
            title: 'Eligibility Window',
            content:
                'If something is not quite right, please contact us within 7 days of delivery. We kindly ask that items remain unused and in their original packaging so we can assess next steps together.',
        },
        {
            title: 'How to Begin',
            content:
                'Email us at info@tasselandwicker.com with your order number, item details, and the reason for your request. Our team will respond within 1–2 business days with personalised guidance.',
        },
        {
            title: 'Custom & Perishable Items',
            content:
                'Custom celebration baskets, perishable treats, and personalised pieces are final sale. Should anything arrive damaged, please share photos within 48 hours so we can make it right.',
        },
        {
            title: 'Exchanges & Gift Orders',
            content:
                'Where available, we are happy to help you exchange an item for an alternative of equal value. For gifted baskets, we can arrange a credit note for the recipient to enjoy at a later date.',
        },
        {
            title: 'Return Shipping',
            content:
                'Return shipping costs are the responsibility of the sender unless the item was damaged in transit or we made an error with your order.',
        },
        {
            title: 'Need Assistance?',
            content:
                'We are always here to support you. If you have any questions about your order, please reach out to info@tasselandwicker.com and we will be delighted to help.',
        },
    ];

    return (
        <div className="min-h-screen bg-luxury-white text-luxury-black">
            {/* Hero */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761149640/_2MK9308_dcgky8.jpg"
                        alt="Returns and exchanges"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black opacity-40" />
                </div>
                <div className="relative z-10 h-full w-full p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10">
                    <div className="flex flex-col text-white max-w-3xl text-center lg:text-left">
                        <ScrollTextAnimation
                            className="text-4xl sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none"
                            delay={0.2}
                            duration={1.2}
                        >
                            RETURNS
                        </ScrollTextAnimation>
                        <ScrollTextAnimation
                            className="text-4xl sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none"
                            delay={0.4}
                            duration={1.2}
                        >
                            & EXCHANGES
                        </ScrollTextAnimation>
                    </div>
                    <div className="relative flex justify-center lg:justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    document.getElementById('returns-content')?.scrollIntoView({ behavior: 'smooth' });
                                }
                            }}
                            className="relative"
                            aria-label="Learn More"
                        >
                            <CircularText
                                text="LEARN MORE • LEARN MORE • LEARN MORE • "
                                spinDuration={15}
                                onHover="speedUp"
                                className="w-[100px] h-[100px] text-[11px] leading-0.5 sm:w-[120px] sm:h-[120px] sm:text-[12px]"
                            />
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <LuChevronDown size={24} className="cursor-pointer text-white animate-bounce" aria-hidden="true" />
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section id="returns-content" className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
                    <div className="text-center mb-16">
                        <p className="text-lg text-luxury-cool-grey font-extralight leading-relaxed max-w-3xl mx-auto">
                            Should you need support after your order arrives, our team will guide you through every step with the same care and attention that defines Tassel & Wicker.
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
