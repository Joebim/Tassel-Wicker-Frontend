'use client';

import { ProductForm } from '@/components/admin/ProductForm';
import { useParams } from 'next/navigation';

export default function AdminEditProductPage() {
  const params = useParams<{ id: string }>();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Edit product</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Update details, inventory, images, and linked items.
        </p>
      </div>
      <ProductForm mode="edit" productId={params.id} />
    </div>
  );
}
