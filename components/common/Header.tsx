'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LuUser, LuMenu, LuX, LuShoppingCart, LuSearch } from 'react-icons/lu';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import Logo from '@/assets/images/brand/tassel-wicker-logo2.svg';

interface HeaderProps {
    showHeader?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showHeader = true }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
    // Initialize mounted state: false on server, true on client
    // This prevents hydration mismatches with Zustand stores
    const [mounted] = useState(() => typeof window !== 'undefined');
    const { getTotalItems } = useCartStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const accountDropdownRef = useRef<HTMLDivElement>(null);

    // Check if we're on the client side to avoid hydration mismatches
    // Zustand stores with skipHydration will return default values during SSR
    const totalItems = getTotalItems();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
                setIsAccountDropdownOpen(false);
            }
        };

        if (isAccountDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAccountDropdownOpen]);

    // Pages with background images (video or static images)
    const pagesWithBackground = ['/', '/about', '/contact', '/shop', '/corporate-bespoke', '/shipping', '/returns', '/cookie-policy', '/privacy-policy', '/terms-of-service'];
    const hasBackground = pagesWithBackground.includes(pathname);

    // Text colors based on background
    const textColor = hasBackground ? 'text-white' : 'text-luxury-black';
    const hoverColor = hasBackground ? 'hover:text-luxury-white' : 'hover:text-brand-purple';
    const logoColor = hasBackground ? 'text-white' : 'text-luxury-black';

    const handleLogout = async () => {
        await authService.logout();
        setIsAccountDropdownOpen(false);
        router.push('/');
    };

    return (
        <header className={`bg-transparent absolute top-0 left-0 right-0 z-50 transition-opacity duration-1000 ease-out ${showHeader ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Hamburger Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 ${textColor} ${hoverColor} transition-colors duration-200 ${hasBackground ? 'drop-shadow-lg' : ''}`}
                        >
                            {isMenuOpen ? <LuX size={24} /> : <LuMenu size={24} />}
                        </button>


                        <Link href="/" className="flex items-center">
                            <div className="h-[70px] w-[70px]">
                                <Logo className={`h-full w-full ${logoColor}`} preserveAspectRatio="xMidYMid meet" viewBox="0 0 500 195" />
                            </div>
                        </Link>


                    </div>


                    {/* Right side icons */}
                    <div className="flex items-center space-x-4">
                        {/* Search */}
                        <Link
                            href="/search"
                            className={`p-2 ${textColor} ${hoverColor} transition-colors duration-200 ${hasBackground ? 'drop-shadow-lg' : ''}`}
                        >
                            <LuSearch size={20} />
                        </Link>
                        {/* Cart */}
                        <Link
                            href="/cart"
                            className={`p-2 ${textColor} ${hoverColor} transition-colors duration-200 relative ${hasBackground ? 'drop-shadow-lg' : ''}`}
                        >
                            <LuShoppingCart size={20} />
                            {mounted && totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-purple text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-extralight">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {/* User Account */}
                        <div className="relative group" ref={accountDropdownRef}>
                            <button
                                className={`p-2 ${textColor} ${hoverColor} transition-colors duration-200 ${hasBackground ? 'drop-shadow-lg' : ''}`}
                                onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                            >
                                <LuUser size={20} />
                            </button>
                            {isAccountDropdownOpen && mounted && (
                                <div className="absolute right-0 mt-2 bg-white rounded-md shadow-lg py-1 z-50 min-w-[250px]">
                                    {user ? (
                                        <>
                                            <div className="px-4 py-2 border-b border-luxury-white/20">
                                                <p className="text-sm font-extralight text-luxury-black">{user.displayName || 'User'}</p>
                                                <p className="text-xs text-luxury-cool-grey">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-sm text-luxury-black hover:bg-luxury-warm-grey/10 font-extralight uppercase"
                                            >
                                                Logout
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                href="/login"
                                                onClick={() => setIsAccountDropdownOpen(false)}
                                                className="block px-4 py-2 text-sm text-luxury-black hover:bg-luxury-warm-grey/10 font-extralight uppercase transition-colors duration-200"
                                            >
                                                Login
                                            </Link>
                                            <Link
                                                href="/signup"
                                                onClick={() => setIsAccountDropdownOpen(false)}
                                                className="block px-4 py-2 text-sm text-luxury-black hover:bg-luxury-warm-grey/10 font-extralight uppercase transition-colors duration-200"
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Mobile Navigation - Slides out from left */}
                <div className={`fixed inset-0 z-9999 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        onClick={() => setIsMenuOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className={`absolute left-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}>
                        <div className="h-full flex flex-col">
                            {/* Close Button */}
                            <div className="pt-8 px-8 flex justify-end mb-8">
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 text-luxury-black hover:text-brand-purple transition-colors duration-200"
                                >
                                    <LuX size={24} />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav className="flex flex-col">
                                <Link
                                    href="/"
                                    className={`py-6 px-8 text-luxury-black font-extralight uppercase text-lg transition-colors duration-200 ${pathname === '/' ? 'text-brand-purple' : 'hover:bg-luxury-warm-grey/10'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Home
                                </Link>
                                <Link
                                    href="/shop"
                                    className={`py-6 px-8 text-luxury-black font-extralight uppercase text-lg transition-colors duration-200 ${pathname === '/shop' ? 'text-brand-green' : 'hover:bg-luxury-warm-grey/10'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Shop
                                </Link>
                                <Link
                                    href="/corporate-bespoke"
                                    className={`py-6 px-8 text-luxury-black font-extralight uppercase text-lg transition-colors duration-200 ${pathname === '/corporate-bespoke' ? 'text-brand-green' : 'hover:bg-luxury-warm-grey/10'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Corporate &amp; Bespoke
                                </Link>
                                <Link
                                    href="/about"
                                    className={`py-6 px-8 text-luxury-black font-extralight uppercase text-lg transition-colors duration-200 ${pathname === '/about' ? 'text-brand-green' : 'hover:bg-luxury-warm-grey/10'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    About
                                </Link>
                                <Link
                                    href="/contact"
                                    className={`py-6 px-8 text-luxury-black font-extralight uppercase text-lg transition-colors duration-200 ${pathname === '/contact' ? 'text-brand-green' : 'hover:bg-luxury-warm-grey/10'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Contact Us
                                </Link>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;