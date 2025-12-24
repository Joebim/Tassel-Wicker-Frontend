'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuFileText, LuShield, LuFileCheck, LuTruck, LuRotateCcw, LuInfo } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import RichTextEditor from '@/components/admin/RichTextEditor';

type ContentPage = 'about' | 'cookie-policy' | 'privacy-policy' | 'terms-of-service' | 'returns' | 'shipping';

interface ContentData {
  id: string;
  page: ContentPage;
  title: string;
  content: string; // HTML content
  documentUrl?: string; // URL to document file
  updatedAt: string;
  updatedBy: string;
}

const contentPages: Array<{ id: ContentPage; label: string; icon: React.ComponentType<{ size?: number }> }> = [
  { id: 'about', label: 'About Page', icon: LuInfo },
  { id: 'cookie-policy', label: 'Cookie Policy', icon: LuFileText },
  { id: 'privacy-policy', label: 'Privacy Policy', icon: LuShield },
  { id: 'terms-of-service', label: 'Terms of Service', icon: LuFileCheck },
  { id: 'returns', label: 'Returns & Exchanges', icon: LuRotateCcw },
  { id: 'shipping', label: 'Shipping Information', icon: LuTruck },
];

export default function ContentManagement() {
  const router = useRouter();
  const [selectedPage, setSelectedPage] = useState<ContentPage>('about');
  const [content, setContent] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadContent();
  }, [selectedPage]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ContentData>(`/api/content/${selectedPage}`, { method: 'GET' });
      setContent(res.content || '');
      setDocumentUrl(res.documentUrl || '');
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to load content',
        message: e instanceof Error ? e.message : 'Could not load content.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await apiFetch(`/api/content/${selectedPage}`, {
        method: 'PUT',
        body: JSON.stringify({
          content,
          documentUrl: documentUrl || undefined,
        }),
      });
      useToastStore.getState().addToast({
        type: 'success',
        title: 'Content Saved',
        message: 'Content has been saved successfully.',
      });
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to save content',
        message: e instanceof Error ? e.message : 'Could not save content.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('page', selectedPage);

      const res = await apiFetch<{ url: string }>('/api/content/upload', {
        method: 'POST',
        body: formData,
      });

      setDocumentUrl(res.url);
      useToastStore.getState().addToast({
        type: 'success',
        title: 'File Uploaded',
        message: 'Document has been uploaded successfully.',
      });
    } catch (e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Upload Failed',
        message: e instanceof Error ? e.message : 'Could not upload file.',
      });
    } finally {
      setUploading(false);
    }
  };

  const currentPage = contentPages.find((p) => p.id === selectedPage);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extralight uppercase tracking-wider text-luxury-black">
          Content Management
        </h2>
        <p className="mt-2 text-luxury-cool-grey font-extralight">
          Edit and manage page content and legal documents.
        </p>
      </div>

      {/* Page Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {contentPages.map((page) => {
          const Icon = page.icon;
          const isSelected = selectedPage === page.id;
          return (
            <button
              key={page.id}
              onClick={() => setSelectedPage(page.id)}
              className={`p-4 border rounded-lg transition-colors text-left ${isSelected
                ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                : 'border-luxury-warm-grey/20 hover:border-brand-purple/40 text-luxury-black'
                }`}
            >
              <div className="mb-2">
                <Icon size={24} />
              </div>
              <div className="font-extralight uppercase text-sm tracking-wide">{page.label}</div>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-6">
        <div className="mb-6">
          <h3 className="text-xl font-extralight uppercase tracking-wider text-luxury-black mb-2">
            {currentPage?.label}
          </h3>
          <p className="text-sm text-luxury-cool-grey font-extralight">
            {selectedPage === 'about'
              ? 'Edit the structured content for the About page.'
              : 'Edit the rich text content for this page.'}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-luxury-cool-grey font-extralight">Loading content...</div>
          </div>
        ) : selectedPage === 'about' ? (
          <AboutPageEditor content={content} onChange={setContent} />
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
                Content
              </label>
              <RichTextEditor value={content} onChange={setContent} />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
                Document (PDF)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-luxury-black file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-extralight file:bg-brand-purple file:text-luxury-white hover:file:bg-brand-purple-light cursor-pointer"
                />
                {documentUrl && (
                  <div className="flex items-center gap-2 text-sm text-luxury-cool-grey">
                    <span>Current document:</span>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-purple hover:text-brand-purple-light underline"
                    >
                      View Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-6 py-3 bg-brand-purple text-luxury-white uppercase font-extralight hover:bg-brand-purple-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// About Page Editor with structured form
function AboutPageEditor({
  content,
  onChange,
}: {
  content: string;
  onChange: (html: string) => void;
}) {
  const [formData, setFormData] = useState({
    heroImage: '',
    myWhyTitle: '',
    myWhyText1: '',
    myWhyText2: '',
    myWhyImage: '',
    ourStoryTitle: '',
    ourStoryText1: '',
    ourStoryText2: '',
    ourStoryImage: '',
    signature: '',
    signatureTitle: '',
    builtForTitle: '',
    builtForVideos: [] as string[],
  });

  useEffect(() => {
    // Parse existing content if available
    if (content) {
      try {
        const parsed = JSON.parse(content);
        setFormData({
          heroImage: parsed.heroImage || '',
          myWhyTitle: parsed.myWhyTitle || '',
          myWhyText1: parsed.myWhyText1 || '',
          myWhyText2: parsed.myWhyText2 || '',
          myWhyImage: parsed.myWhyImage || '',
          ourStoryTitle: parsed.ourStoryTitle || '',
          ourStoryText1: parsed.ourStoryText1 || '',
          ourStoryText2: parsed.ourStoryText2 || '',
          ourStoryImage: parsed.ourStoryImage || '',
          signature: parsed.signature || '',
          signatureTitle: parsed.signatureTitle || '',
          builtForTitle: parsed.builtForTitle || '',
          builtForVideos: Array.isArray(parsed.builtForVideos) ? parsed.builtForVideos : [],
        });
      } catch {
        // If not JSON, treat as HTML and extract if possible
      }
    }
  }, [content]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(JSON.stringify(updated));
  };

  const handleVideoAdd = () => {
    const url = prompt('Enter video URL:');
    if (url && url.trim()) {
      const updated = [...formData.builtForVideos, url.trim()];
      setFormData({ ...formData, builtForVideos: updated });
      onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
    }
  };

  const handleVideoRemove = (index: number) => {
    const updated = formData.builtForVideos.filter((_, i) => i !== index);
    setFormData({ ...formData, builtForVideos: updated });
    onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="border-l-4 border-brand-purple pl-4">
        <h4 className="text-lg font-extralight uppercase text-luxury-black mb-4">Hero Section</h4>
        <div>
          <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
            Hero Image URL
          </label>
          <input
            type="text"
            value={formData.heroImage}
            onChange={(e) => handleFieldChange('heroImage', e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
          />
        </div>
      </div>

      {/* My Why Section */}
      <div className="border-l-4 border-brand-purple pl-4">
        <h4 className="text-lg font-extralight uppercase text-luxury-black mb-4">My Why Section</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.myWhyTitle}
              onChange={(e) => handleFieldChange('myWhyTitle', e.target.value)}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              First Paragraph
            </label>
            <textarea
              value={formData.myWhyText1}
              onChange={(e) => handleFieldChange('myWhyText1', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Second Paragraph
            </label>
            <textarea
              value={formData.myWhyText2}
              onChange={(e) => handleFieldChange('myWhyText2', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              My Why Image URL
            </label>
            <input
              type="text"
              value={formData.myWhyImage}
              onChange={(e) => handleFieldChange('myWhyImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <div className="border-l-4 border-brand-purple pl-4">
        <h4 className="text-lg font-extralight uppercase text-luxury-black mb-4">Our Story Section</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.ourStoryTitle}
              onChange={(e) => handleFieldChange('ourStoryTitle', e.target.value)}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              First Paragraph
            </label>
            <textarea
              value={formData.ourStoryText1}
              onChange={(e) => handleFieldChange('ourStoryText1', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Second Paragraph
            </label>
            <textarea
              value={formData.ourStoryText2}
              onChange={(e) => handleFieldChange('ourStoryText2', e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Our Story Image URL
            </label>
            <input
              type="text"
              value={formData.ourStoryImage}
              onChange={(e) => handleFieldChange('ourStoryImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
        </div>
      </div>

      {/* Signature Section */}
      <div className="border-l-4 border-brand-purple pl-4">
        <h4 className="text-lg font-extralight uppercase text-luxury-black mb-4">Signature Section</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Signature Name
            </label>
            <input
              type="text"
              value={formData.signature}
              onChange={(e) => handleFieldChange('signature', e.target.value)}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Signature Title
            </label>
            <input
              type="text"
              value={formData.signatureTitle}
              onChange={(e) => handleFieldChange('signatureTitle', e.target.value)}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
        </div>
      </div>

      {/* Built For Section */}
      <div className="border-l-4 border-brand-purple pl-4">
        <h4 className="text-lg font-extralight uppercase text-luxury-black mb-4">Built For Section</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.builtForTitle}
              onChange={(e) => handleFieldChange('builtForTitle', e.target.value)}
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
            />
          </div>
          <div>
            <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
              Videos
            </label>
            <div className="space-y-2">
              {formData.builtForVideos.map((video, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={video}
                    onChange={(e) => {
                      const updated = [...formData.builtForVideos];
                      updated[index] = e.target.value;
                      setFormData({ ...formData, builtForVideos: updated });
                      onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
                    }}
                    className="flex-1 px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight"
                    placeholder="Video URL"
                  />
                  <button
                    type="button"
                    onClick={() => handleVideoRemove(index)}
                    className="px-3 py-2 border border-red-500 text-red-500 uppercase font-extralight hover:bg-red-500 hover:text-luxury-white transition-colors text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleVideoAdd}
                className="w-full px-4 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




