'use client';

import { ProductForm } from '@/components/admin/ProductForm';

export default function AdminNewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">New product</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Create a new product and assign its type and role.
        </p>
      </div>
      <ProductForm mode="create" />
    </div>
  );
}
