import React, { useState } from 'react';
import { LuMail, LuCheck } from 'react-icons/lu';
import toast from 'react-hot-toast';

const Newsletter: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // TODO: Implement actual newsletter subscription API
            await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call

            toast.success('Successfully subscribed to our newsletter!');
            setEmail('');
        } catch {
            toast.error('Failed to subscribe. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-20 bg-gray-900 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="mb-8">
                    <h2 className="text-4xl md:text-5xl font-light mb-4">
                        Stay Connected
                    </h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Be the first to discover new collections, exclusive offers, and lifestyle tips
                        that celebrate thoughtful living.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <LuMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white placeholder-gray-400"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-500 disabled:cursor-not-allowed text-white px-8 py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2 font-medium"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Subscribing...</span>
                                </>
                            ) : (
                                <>
                                    <LuCheck size={16} />
                                    <span>Subscribe</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <p className="text-sm text-gray-400 mt-4">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </section>
    );
};

export default Newsletter;
