'use client';

export default function AdminCustomersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Customers</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Customer management endpoints aren’t documented in `docs/BACKEND_API_GUIDE.md` yet.
        </p>
      </div>

      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-8">
        <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
          Coming soon
        </div>
        <div className="mt-3 text-sm font-extralight text-luxury-black">
          Once the backend exposes customer listing (e.g. <span className="uppercase tracking-[0.2em] text-luxury-cool-grey">/api/users</span> or similar),
          this page will support search, role management, and order history.
        </div>
      </div>
    </div>
  );
}
