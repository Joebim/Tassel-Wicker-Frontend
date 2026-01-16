'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { LuPlus, LuPencil, LuTrash2, LuImagePlus, LuX } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { useConfirmStore } from '@/store/confirmStore';
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';
import type { UploadFile } from '@/types/upload';
import type { ProductCategory } from '@/types/product';

type CategoryInput = {
  name: string;
  slug: string;
  description: string;
  image: string;
};

const empty: CategoryInput = { name: '', slug: '', description: '', image: '' };

export default function AdminCategoriesPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [items, setItems] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>(empty);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);

  const isEditing = !!editingId;

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<{ items: ProductCategory[] }>('/api/categories', { method: 'GET' });
      setItems(res.items || []);
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to load categories',
        message: e instanceof Error ? e.message : 'Could not load categories.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async () => {
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim() || undefined,
        description: form.description.trim() || undefined,
        image: form.image.trim() || undefined,
      };

      if (!payload.name) throw new Error('Category name is required');

      if (isEditing && editingId) {
        const res = await apiFetch<{ item: ProductCategory }>(`/api/categories/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Category updated',
          message: res.item?.name || 'Saved successfully.',
        });
      } else {
        const res = await apiFetch<{ item: ProductCategory }>('/api/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Category created',
          message: res.item?.name || 'Created successfully.',
        });
      }

      setForm(empty);
      setEditingId(null);
      await load();
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Save failed',
        message: e instanceof Error ? e.message : 'Failed to save category.',
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: ProductCategory) => {
    setEditingId(c.id);
    setForm({
      name: c.name || '',
      slug: c.slug || '',
      description: c.description || '',
      image: c.image || '',
    });
  };

  const remove = async (id: string) => {
    if (!isAdmin) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Admin only',
        message: 'Only admins can delete categories.',
      });
      return;
    }

    const ok = await useConfirmStore.getState().confirm({
      title: 'Delete Category',
      message: 'Delete this category? This cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
    });
    if (!ok) return;

    try {
      await apiFetch<{ success: boolean }>(`/api/categories/${id}`, { method: 'DELETE' });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Category deleted',
        message: 'The category was deleted successfully.',
      });
      if (editingId === id) {
        setEditingId(null);
        setForm(empty);
      }
      await load();
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Delete failed',
        message: e instanceof Error ? e.message : 'Failed to delete category.',
      });
    }
  };

  const headerText = useMemo(() => {
    if (loading) return 'Loading…';
    return `${items.length} categories`;
  }, [loading, items.length]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">Categories</h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Organize your products with categories.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 border border-luxury-warm-grey/20 rounded-lg bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-luxury-warm-grey/20 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              {headerText}
            </div>
            {!isAdmin && (
              <div className="text-xs font-extralight text-luxury-cool-grey">
                Moderators can create/update categories but cannot delete.
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-luxury-warm-grey/5">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Name</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Slug</th>
                  <th className="px-6 py-4 text-xs uppercase tracking-[0.2em] font-extralight text-luxury-cool-grey">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-t border-luxury-warm-grey/10">
                    <td className="px-6 py-4">
                      <div className="text-sm font-extralight text-luxury-black">{c.name}</div>
                      {c.description ? (
                        <div className="text-xs font-extralight text-luxury-cool-grey truncate max-w-[520px]">{c.description}</div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 text-sm font-extralight text-luxury-black">{c.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(c)}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors"
                        >
                          <LuPencil size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c.id)}
                          disabled={!isAdmin}
                          className={
                            'inline-flex items-center gap-2 px-3 py-2 border uppercase font-extralight transition-colors ' +
                            (isAdmin
                              ? 'border-red-500 text-red-500 hover:bg-red-500 hover:text-white'
                              : 'border-luxury-warm-grey/20 text-luxury-cool-grey cursor-not-allowed')
                          }
                        >
                          <LuTrash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-luxury-cool-grey font-extralight">
                      No categories yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.2em] text-luxury-cool-grey font-extralight">
              {isEditing ? 'Edit category' : 'New category'}
            </div>
            <div className="text-xs font-extralight text-luxury-cool-grey">
              {isEditing ? `ID: ${editingId}` : 'Create'}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Gift Baskets"
              />
            </div>

            <div>
              <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Slug (optional)</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="gift-baskets"
              />
            </div>

            <div>
              <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                placeholder="Short description…"
              />
            </div>

            <div>
              <label className="block text-sm font-extralight text-luxury-black uppercase mb-2">Image URL (optional)</label>
              <div className="flex gap-2">
                <input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="flex-1 px-4 py-3 border border-luxury-cool-grey bg-white text-luxury-black placeholder-luxury-cool-grey focus:outline-none focus:ring-2 focus:ring-brand-purple focus:border-transparent font-extralight"
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => setMediaModalOpen(true)}
                  className="flex-none flex items-center justify-center px-4 py-3 border border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-white transition-colors"
                  title="Open Media Library"
                >
                  <LuImagePlus size={20} />
                </button>
              </div>
              {form.image && (
                <div className="mt-2 relative w-full h-32 border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-luxury-warm-grey/5">
                  <Image
                    src={form.image}
                    alt="Category Preview"
                    fill
                    className="object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: '' })}
                    className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full text-red-500 shadow-sm transition-colors"
                  >
                    <LuX size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50"
              >
                <LuPlus size={16} /> {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Create category'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(empty);
                  }}
                  className="px-4 py-3 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors duration-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={(files) => {
          if (files.length > 0) {
            setForm((prev) => ({ ...prev, image: files[0].secure_url }));
          }
        }}
        multiple={false}
        uploadType="media"
      />
    </div>
  );
}
