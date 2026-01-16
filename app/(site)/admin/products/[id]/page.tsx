'use client';

import Link from 'next/link';
import { LuArrowLeft } from 'react-icons/lu';
import { ProductForm } from '@/components/admin/ProductForm';
import { useParams } from 'next/navigation';

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/products" className="inline-flex items-center gap-2 text-luxury-cool-grey hover:text-brand-purple mb-4 transition-colors">
          <LuArrowLeft size={16} />
          <span className="text-sm uppercase tracking-wider font-light">Back to Products</span>
        </Link>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Edit product</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Update details, inventory, images, and linked items.
        </p>
      </div>
      <ProductForm mode="edit" productId={params.id} />
    </div>
  );
}
