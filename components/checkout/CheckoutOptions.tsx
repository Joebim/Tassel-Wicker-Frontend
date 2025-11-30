'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuUser, LuUserCheck } from 'react-icons/lu';

interface CheckoutOptionsProps {
    onSelect: (option: 'signin' | 'guest') => void;
}

export default function CheckoutOptions({ onSelect }: CheckoutOptionsProps) {
    const [selectedOption, setSelectedOption] = useState<'signin' | 'guest' | null>(null);

    const handleContinue = () => {
        if (selectedOption) {
            onSelect(selectedOption);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-extralight text-luxury-black mb-4 uppercase">
                Choose Checkout Option
            </h3>
            
            <div className="space-y-4">
                <button
                    onClick={() => setSelectedOption('signin')}
                    className={`w-full p-6 border-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                        selectedOption === 'signin'
                            ? 'border-brand-purple bg-purple-50'
                            : 'border-luxury-cool-grey hover:border-brand-purple/50'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === 'signin'
                                ? 'border-brand-purple bg-brand-purple'
                                : 'border-luxury-cool-grey'
                        }`}>
                            {selectedOption === 'signin' && (
                                <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <LuUserCheck size={20} className="text-luxury-black" />
                                <h4 className="font-extralight text-luxury-black uppercase">
                                    Sign in to your account
                                </h4>
                            </div>
                            <p className="text-sm text-luxury-cool-grey font-extralight">
                                Access your order history and save your preferences
                            </p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={() => setSelectedOption('guest')}
                    className={`w-full p-6 border-2 rounded-lg transition-all duration-200 text-left cursor-pointer ${
                        selectedOption === 'guest'
                            ? 'border-brand-purple bg-purple-50'
                            : 'border-luxury-cool-grey hover:border-brand-purple/50'
                    }`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedOption === 'guest'
                                ? 'border-brand-purple bg-brand-purple'
                                : 'border-luxury-cool-grey'
                        }`}>
                            {selectedOption === 'guest' && (
                                <div className="w-3 h-3 rounded-full bg-white" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <LuUser size={20} className="text-luxury-black" />
                                <h4 className="font-extralight text-luxury-black uppercase">
                                    Checkout as a guest
                                </h4>
                            </div>
                            <p className="text-sm text-luxury-cool-grey font-extralight">
                                Complete your purchase without creating an account
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            <button
                onClick={handleContinue}
                disabled={!selectedOption}
                className={`w-full py-4 px-6 font-extralight uppercase transition-colors duration-200 ${
                    selectedOption
                        ? 'bg-brand-purple text-luxury-white hover:bg-brand-purple-light cursor-pointer'
                        : 'bg-luxury-warm-grey/20 text-luxury-cool-grey cursor-not-allowed'
                }`}
            >
                Continue to Checkout
            </button>
        </div>
    );
}

