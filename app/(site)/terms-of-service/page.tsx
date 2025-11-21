'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { LuChevronDown } from 'react-icons/lu';
import { motion } from 'framer-motion';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import CircularText from '@/components/common/CircularText';

export default function TermsOfService() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const sections = [
        {
            title: 'Who we are',
            content:
                'We are tasselandwicker.com a luxury lifestyle online brand.',
        },
        {
            title: 'Introduction',
            content:
                'These Terms and Conditions ("Terms") govern your use of the website located at, www.tasselandwicker.com (the "Website"), which is operated by Tassel and Wicker (the "Company", "we", "us", or "our"), a company registered in England and Wales with its registered office at 7, Westland Drive, Newark, Nottinghamshire, England. By accessing or using the Website, you agree to be bound by these Terms, which constitute a legally binding agreement between you and the Company. If you disagree with any part of the Terms, you must not use the Website.',
        },
        {
            title: 'Using Tasselandwicker.com',
            content:
                'You agree to use tasselandwicker.com only for lawful purposes. You must also use it in a way that does not infringe the rights of, or restrict or inhibit the use and enjoyment of, this site by anyone else. We update tasselandwicker.com all the time. We can change or remove content at any time without notice.',
        },
        {
            title: 'Changes to the Terms',
            content:
                'We reserve the right to revise and amend these Terms from time to time. The updated version will be indicated by an updated "Revised" date and the updated version will be effective as soon as it is accessible. You are responsible for regularly reviewing these Terms. Your continued use of the Website after any changes are posted constitutes your acceptance of the new Terms.',
        },
        {
            title: 'Intellectual Property Rights',
            content:
                'Unless otherwise stated, we or our licensors own the intellectual property rights in the Website and material on the Website, including but not limited to all content, text, graphics, logos, images, audio, video, software, and underlying code. All these intellectual property rights are reserved. You may view, download for caching purposes only, and print pages from the Website for your own personal use, subject to the restrictions set out below and elsewhere in these Terms.',
        },
        {
            title: 'Acceptable Use',
            content:
                'You must not: Republish material from this Website (including republication on another website). Sell, rent, or sub-license material from the Website. Show any material from the Website in public. Reproduce, duplicate, copy, or otherwise exploit material on our Website for a commercial purpose. Redistribute material from this Website. Use our Website in any way that causes, or may cause, damage to the Website or impairment of the availability or accessibility of the Website. Use our Website in any way which is unlawful, illegal, fraudulent, or harmful, or in connection with any unlawful, illegal, fraudulent, or harmful purpose or activity.',
        },
        {
            title: 'User Accounts and Registration',
            content:
                'If any part of the Website requires you to register an account, you agree to provide accurate and complete information and to keep this information up-to-date. You are responsible for maintaining the confidentiality of your account password and are responsible for all activities that occur under your account. We reserve the right to terminate or suspend your account at any time for any breach of these Terms.',
        },
        {
            title: 'Information about you and your visits to tasselandwicker.com',
            content:
                'We collect information about you in accordance with our privacy policy and our cookie policy. By using tasselandwicker.com, you agree to us collecting this information and confirm that any data you provide is accurate.',
        },
        {
            title: 'Limitation of Liability',
            content:
                'Nothing in these Terms will: (a) limit or exclude our or your liability for death or personal injury resulting from negligence; (b) limit or exclude our or your liability for fraud or fraudulent misrepresentation; (c) limit any of our or your liabilities in any way that is not permitted under applicable UK law; or (d) exclude any of our or your liabilities that may not be excluded under applicable UK law. Subject to the preceding paragraph, the Website and its content are provided on an "as is" and "as available" basis. To the extent permitted by law, we exclude all warranties, representations, conditions, and other terms which might otherwise be implied by statute, common law, or the law of equity. We will not be liable for any loss or damage of any nature, including direct, indirect, or consequential loss, arising under or in connection with the use of, or inability to use, the Website.',
        },
        {
            title: 'Indemnity',
            content:
                'You hereby indemnify us and undertake to keep us indemnified against any losses, damages, costs, liabilities, and expenses (including, without limitation, legal expenses and any amounts paid by us to a third party in settlement of a claim or dispute on the advice of our legal advisers) incurred or suffered by us arising out of any breach by you of any provision of these terms.',
        },
        {
            title: 'Governing Law and Jurisdiction',
            content:
                'These Terms shall be governed by and construed in accordance with the laws of England and Wales. Any disputes relating to these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.',
        },
        {
            title: 'Contact Information',
            content:
                'If you have any questions about these Terms, please contact us at: Email: info@tasselandwicker.com',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            {/* Hero */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1763659375/TERMS_OF_SERVICE_py8opy.jpg"
                        alt="Terms of Service"
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
                                TERMS OF
                            </ScrollTextAnimation>
                            <ScrollTextAnimation
                                className="text-[39px] sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none"
                                delay={0.2}
                                duration={1.2}
                            >
                                SERVICE
                            </ScrollTextAnimation>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        document.getElementById('terms-content')?.scrollIntoView({ behavior: 'smooth' });
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
            <section id="terms-content" className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
                    <div className="text-center mb-16">
                        <p className="text-lg text-luxury-cool-grey font-extralight leading-relaxed max-w-3xl mx-auto">
                            These Terms and Conditions govern your use of tasselandwicker.com. By accessing or using our Website, you agree to be bound by these Terms.
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

