'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { LuChevronDown } from 'react-icons/lu';
import { motion } from 'framer-motion';
import ScrollTextAnimation from '@/components/common/ScrollTextAnimation';
import CircularText from '@/components/common/CircularText';

export default function CookiePolicy() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo(0, 0);
        }
    }, []);

    const sections = [
        {
            title: 'General Introduction About Cookies',
            content:
                'This Cookie Policy explains what cookies are, how we use them on our website www.tasselandwicker.com (the &quot;Website&quot;), and what your choices are regarding their use. This policy should be read alongside our Privacy Policy which sets out how we process your personal data.',
        },
        {
            title: 'What are Cookies?',
            content:
                'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide reporting information. Cookies can be: Session Cookies: These are temporary and expire once you close your browser. Persistent Cookies: These remain on your device for a set period or until you delete them. Cookies can also be: First-Party Cookies: Set directly by the Website you are visiting. Third-Party Cookies: Set by a different domain (a third party) than the one you are visiting, typically for advertising or analytics.',
        },
        {
            title: 'How We Use Cookies',
            content:
                'We can only store cookies on your device if they are strictly necessary for the operation of this Website or the provision of a service you have explicitly requested like maintaining your shopping cart. For all other non-essential cookies like analytics, performance, and marketing cookies, we must obtain your prior, informed, and explicit consent before setting them.',
        },
        {
            title: 'Category of Cookies',
            content:
                'We use the following categories of cookies for the purposes detailed below. You have the right to choose which non-essential cookies we can use. Strictly Necessary Cookies: Essential for the core functionality of the website like security, networking, accessibility, remembering items in a shopping basket. This type of cookie does not require consent. Performance/Analytics Cookies: Allows us to count visits and traffic sources so we can measure and improve the performance of our site. Data is typically aggregated like Google Analytics. Functional/Preference Cookies: Enables the website to provide enhanced functionality and personalisation like remembering your language, region, or login details. Targeting/Advertising Cookies: Set through our site by our advertising partners. They are used to build a profile of your interests and show you relevant adverts on other sites.',
        },
        {
            title: 'Objectives and Aims',
            content:
                'We use the cookies to: Ensure efficient and safe functioning of the Website; we use cookies to enable and support our security features, and to help us detect malicious activity on our Website. Understand, improve, and research products, features, and services, including when you access our Website from other websites, applications, or devices such as your work computer or your mobile device. Recognize the returning visitors of the Website; cookies help us show you the right information and personalize your experience; cookies also help avoiding re-registration or re-filling of the information by you each time you visit the Website. Analyse your habits so that the functioning of the Website would be convenient, efficient and would conform to your needs and expectations, for example, by ensuring that the Visitors would, without difficulty, find everything they are looking for. Measure the flows of the information and data being sent to our Website; we use the cookies for accumulation of statistical data about the number of users of the Website and their use of the Website. Targeting and advertising; by using the cookies we may collect information so that only relevant content is displayed for the browser by creating different target groups; we may use cookies to show you relevant advertising both on and off our Website. We may, to the extent allowed by applicable laws, link the data, received from the cookies, with other information obtained about you from other legal sources (i.e., information about the use of the services, online account, etc.).',
        },
        {
            title: 'Third Party Cookies Disclosure',
            content:
                'Our website includes content and functionality provided by third parties. When you interact with these services, the third-party provider may process your data using cookies or similar technologies. These providers include: Advertising & Marketing Partners and Payment Processors. Detailed Cookie List: _stripe_mid (Stripe) - Used for fraud prevention and distinguishing users during payment. Helps Stripe identify the device for secure checkout. Third party (Strict), 1 year expiry, Strictly Necessary. __vercel_toolbar (Vercel) - Enables the Vercel developer toolbar in preview environments. Not used for tracking. First-party, 17 days expiry, Functional/Performance. auth-storage (This Website - Next.js + Firebase Auth) - Stores encoded authentication/session data for logged-in users. First-Party, 128 days expiry, Strictly Necessary. cookieConsent (This Website) - Stores whether the user accepted the cookie banner. First-Party, 21 days expiry, Preferences.',
        },
        {
            title: 'Your Consent and How to Manage Cookies',
            content:
                'You have control over the use of non-essential cookies. When you first visit our Website, you will be presented with a clear consent tool (a cookie banner) that gives you the following options: "Accept All": To consent to all cookie categories. "Reject All" (or "Block All"): To decline all non-essential cookies. "Manage Preferences" (or "Customise"): To choose which specific categories you consent to (e.g., accepting analytics but rejecting marketing). How to Change Your Preferences: To change your cookie preferences, please follow this link depending on your device and browser. Alternatively, most web browsers allow you to control cookies through their settings. You can usually find these settings in the \'options\' or \'preferences\' menu of your browser. For more information, you can visit: Chrome Cookie Settings: https://policies.google.com/technologies/cookies?hl=en-US/. Firefox Cookie Setting: https://www.firefox.com/en-US/privacy/websites/cookie-settings/. Safari Cookie Setting: https://support.apple.com/en-ca/guide/safari/ibrw850f6c51/mac. Edge/IE Cookie Settings: https://support.microsoft.com/en-us/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64.',
        },
        {
            title: 'Changes to this Cookie Policy',
            content:
                'We may update this policy from time to time to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies. This policy was last updated on: November 19, 2025. (Change to the date when you are ready to publish)',
        },
    ];

    return (
        <div className="min-h-screen bg-white text-luxury-black">
            {/* Hero */}
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1763661133/COOKIE_POLICY_syh1yx.jpg"
                        alt="Cookie Policy"
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
                                COOKIE
                            </ScrollTextAnimation>
                            <ScrollTextAnimation
                                className="text-[39px] sm:text-5xl lg:text-[110px] font-extralight tracking-wide uppercase leading-none wrap-break-word"
                                delay={0.2}
                                duration={1.2}
                            >
                                POLICY
                            </ScrollTextAnimation>
                        </div>
                        <div className="relative flex justify-center lg:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (typeof window !== 'undefined') {
                                        document.getElementById('cookie-content')?.scrollIntoView({ behavior: 'smooth' });
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
            <section id="cookie-content" className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
                    <div className="text-center mb-16">
                        <p className="text-lg text-luxury-cool-grey font-extralight leading-relaxed max-w-3xl mx-auto">
                            Tassel and Wicker, legal entity with registered address, 7 Westland Drive, Newark, Nottinghamshire, England, (hereinafter referred to as the &quot;Company,&quot; or &quot;we&quot;), shall undertake to ensure the security of personal information and the protection of rights of the visitors of the website (hereinafter referred to as the &quot;Visitors&quot;) while you use Tassel and Wickers website including but not limited to www.tasselandwicker.com, (hereinafter referred to as the &quot;Website&quot;) and the content of it. First and foremost, we DO NOT sell your personal information. However, when you visit or interact with our sites, services, applications, tools or messaging, we or our authorized service providers may use cookies, web beacons, and other similar technologies to make your experience better, faster and safer, for advertising purposes and to allow us to continuously improve our sites, services, applications and tools.
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

