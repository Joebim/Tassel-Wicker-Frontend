'use client';

import { useParams } from 'next/navigation';

export default function BlogPost() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-light text-gray-900 mb-8">
          Blog Post - {slug}
        </h1>
        <p className="text-gray-600">
          Blog post content will be added here.
        </p>
      </div>
    </div>
  );
}

