import Link from 'next/link';
import { LuHouse } from 'react-icons/lu';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-light text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-light text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-md transition-colors duration-200 font-medium"
        >
          <LuHouse size={20} />
          <span>Go Home</span>
        </Link>
      </div>
    </div>
  );
}

