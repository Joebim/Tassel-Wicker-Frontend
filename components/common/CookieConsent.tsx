'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX } from 'react-icons/lu';

const COOKIE_CONSENT_KEY = 'tassel-wicker-cookie-consent';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if user has already accepted cookies
    if (typeof window !== 'undefined') {
      const hasAccepted = localStorage.getItem(COOKIE_CONSENT_KEY);
      
      // Check if consent cookie exists
      const hasConsentCookie = document.cookie
        .split(';')
        .some(cookie => cookie.trim().startsWith('cookieConsent='));
      
      // Only show if user hasn't accepted in localStorage AND no consent cookie exists
      if (!hasAccepted && !hasConsentCookie) {
        // Small delay to ensure smooth animation
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      // Set acceptance in localStorage
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
      // Set a cookie to track acceptance
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year expiry
      document.cookie = `cookieConsent=accepted; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      
      setIsVisible(false);
    }
  };

  const handleDecline = () => {
    if (typeof window !== 'undefined') {
      // Set decline in localStorage
      localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
      setIsVisible(false);
    }
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-700 font-light leading-relaxed uppercase">
                  We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                  By clicking &quot;Accept&quot;, you consent to our use of cookies.{' '}
                  <Link href="/cookie-policy" className="underline hover:text-gray-900 transition-colors duration-200">
                    Learn more
                  </Link>.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={handleDecline}
                  className="px-4 py-2 text-sm font-light text-white bg-black hover:bg-black/90 transition-colors duration-200 uppercase tracking-wider"
                  aria-label="Decline cookies"
                >
                  Decline
                </button>
                <button
                  onClick={handleAccept}
                  className="px-6 py-2 text-sm font-light text-white bg-black hover:bg-black/90 transition-colors duration-200 uppercase tracking-wider"
                  aria-label="Accept cookies"
                >
                  Accept
                </button>
                <button
                  onClick={handleDecline}
                  className="p-2 text-black hover:text-black/70 transition-colors duration-200"
                  aria-label="Close cookie notice"
                >
                  <LuX size={20} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
