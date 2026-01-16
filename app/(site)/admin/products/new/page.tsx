'use client';

import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';
import { ProductForm } from '@/components/admin/ProductForm';

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-brand-purple mb-4 transition-colors">
          <LuArrowLeft size={16} />
          <span className="text-sm uppercase tracking-wider font-light">Back to Products</span>
        </Link>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">New product</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Create a new product and assign its type and role.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
