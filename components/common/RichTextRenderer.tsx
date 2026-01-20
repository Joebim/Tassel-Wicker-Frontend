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
      className={`prose prose-lg max-w-none text-luxury-black font-extralight 
        [&>p]:mb-6 [&>p]:leading-relaxed 
        [&>h1]:mb-6 [&>h1]:mt-8
        [&>h2]:mb-4 [&>h2]:mt-8
        [&>h3]:mb-4 [&>h3]:mt-6
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-6
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-6
        [&_li]:mb-2 [&_li]:pl-1
        empty:hidden
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        fontFamily: 'inherit',
      }}
    />
  );
}




