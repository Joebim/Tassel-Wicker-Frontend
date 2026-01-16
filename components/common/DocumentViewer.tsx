'use client';

import Link from 'next/link';
import { LuExternalLink } from 'react-icons/lu';

interface DocumentViewerLinkProps {
    title?: string;
    pageSlug: string; // e.g., 'cookie-policy', 'privacy-policy', etc.
}

export default function DocumentViewerLink({ title = 'View Document', pageSlug }: DocumentViewerLinkProps) {
    return (
        <div className="mb-8 border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-white p-6">
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-sm font-extralight uppercase tracking-wide text-luxury-cool-grey mb-2">
                        {title}
                    </p>
                    <p className="text-base text-luxury-black font-extralight">
                        Click the button to view the full document in a new window.
                    </p>
                </div>
                <Link
                    href={`/document-viewer/${pageSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-1 bg-transparent text-sm text-brand-purple uppercase font-extralight hover:bg-gray-100 transition-colors duration-200 rounded whitespace-nowrap"
                >
                    <span>View Document</span>
                    <LuExternalLink size={18} />
                </Link>
            </div>
        </div>
    );
}
