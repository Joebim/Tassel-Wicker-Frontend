'use client';

import React from 'react';

interface RichTextRendererProps {
  content: string; // HTML string
  className?: string;
}

export default function RichTextRenderer({ content, className = '' }: RichTextRendererProps) {
  if (!content) return null;

  return (
    <div
      className={`prose prose-lg max-w-none text-luxury-black leading-relaxed font-extralight ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        // Override default prose styles to match design system
        fontFamily: 'inherit',
      }}
    />
  );
}




