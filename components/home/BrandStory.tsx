import React from 'react';
import { LuHeart, LuGift, LuStar } from 'react-icons/lu';

const BrandStory: React.FC = () => {
    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <div>
                        <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-6">
                            Our Story
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Tassel and Wicker is a lifestyle brand aligned with our love for functional,
                            aesthetically pleasing, unique, and quality lifestyle items. We are launching
                            with our signature wicker baskets aligned with our passion for celebrations
                            and promoting healthy relationships through thoughtful gifting.
                        </p>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Our vision for Tassel & Wicker is for the brand to become a symbol of
                            thoughtfulness. When people think of Tassel & Wicker, we want them to think
                            of three things: <strong>Quality, Aspirational, and Timeless</strong>.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LuStar className="text-amber-600" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Quality</h3>
                                <p className="text-gray-600 text-sm">
                                    Every item is carefully selected for its superior craftsmanship and materials.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LuHeart className="text-amber-600" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aspirational</h3>
                                <p className="text-gray-600 text-sm">
                                    Designed to inspire and elevate your everyday living experience.
                                </p>
                            </div>

                            <div className="text-center">
                                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LuGift className="text-amber-600" size={24} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Timeless</h3>
                                <p className="text-gray-600 text-sm">
                                    Classic designs that will remain beautiful and relevant for years to come.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative">
                        <div className="aspect-square rounded-lg overflow-hidden shadow-2xl">
                            <img
                                src="/images/lifestyle/brand-story.jpg"
                                alt="Tassel & Wicker Brand Story"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400 rounded-full opacity-20"></div>
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-200 rounded-full opacity-30"></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BrandStory;
