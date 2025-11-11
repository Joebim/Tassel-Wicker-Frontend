'use client';

import { useState } from 'react';
import { contactService } from '@/services/contactService';
import { useToastStore } from '@/store/toastStore';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToastStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const result = await contactService.sendEmail(formData);

        if (result.success) {
            addToast({
                type: 'success',
                title: 'Message Sent',
                message: 'Thank you for your message! We\'ll get back to you soon.',
            });
            setFormData({ name: '', email: '', phone: '', message: '' });
        } else {
            addToast({
                type: 'error',
                title: 'Failed to Send',
                message: result.error || 'Failed to send message. Please try again.',
            });
        }

        setIsSubmitting(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="relative w-full overflow-hidden pb-20">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://res.cloudinary.com/dygrsvya5/image/upload/q_auto:low/v1761149638/_2MK9323_vyzwqm.jpg"
                    alt="Contact Background"
                    className="w-full h-full object-cover"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50"></div>
            </div>

            {/* Contact Form Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-xl">
                    {/* Header */}
                    <div className="flex flex-col items-center justify-center text-center my-14">
                        <h1 className="text-white text-4xl md:text-6xl font-extralight uppercase tracking-wide mb-4">
                            CONTACT US
                        </h1>
                        <p className="text-white/80 text-sm md:text-base font-extralight uppercase tracking-wide">
                            WE'D LOVE TO HEAR FROM YOU
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="FULL NAME *"
                                className="w-full px-6 py-4 bg-transparent border-2 border-white/60 text-white placeholder-white/80 font-extralight uppercase tracking-wide focus:outline-none focus:border-brand-cream transition-all duration-300"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="EMAIL ADDRESS *"
                                className="w-full px-6 py-4 bg-transparent border-2 border-white/60 text-white placeholder-white/80 font-extralight uppercase tracking-wide focus:outline-none focus:border-brand-cream transition-all duration-300"
                            />
                        </div>

                        {/* Phone Number */}
                        <div>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                placeholder="PHONE NUMBER *"
                                className="w-full px-6 py-4 bg-transparent border-2 border-white/60 text-white placeholder-white/80 font-extralight uppercase tracking-wide focus:outline-none focus:border-brand-cream transition-all duration-300"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <input
                                type="text"
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                placeholder="HOW CAN WE HELP *"
                                className="w-full px-6 py-4 bg-transparent border-2 border-white/60 text-white placeholder-white/80 font-extralight uppercase tracking-wide focus:outline-none focus:border-brand-cream transition-all duration-300"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full mt-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/60 text-white font-extralight uppercase tracking-wide hover:bg-white/20 hover:border-brand-cream disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isSubmitting ? 'SENDING...' : 'SUBMIT'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

