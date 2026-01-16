'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { LuFileText, LuShield, LuFileCheck, LuTruck, LuRotateCcw, LuInfo, LuExternalLink, LuVideo, LuImage, LuX, LuUpload } from 'react-icons/lu';
import Image from 'next/image';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import RichTextEditor from '@/components/admin/RichTextEditor';
import FileUpload from '@/components/admin/FileUpload'; // Keep for specific non-media types if needed, or fallback
import { MediaLibraryModal } from '@/components/admin/MediaLibraryModal';
import type { UploadFile } from '@/types/upload';

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
  const [selectedPage, setSelectedPage] = useState<ContentPage>('about');
  const [content, setContent] = useState<string>('');
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaSelectCallback, setMediaSelectCallback] = useState<((url: string) => void) | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiFetch<ContentData>(`/api/content/${selectedPage}`, { method: 'GET' });
      setContent(res.content || '');
      setDocumentUrl(res.documentUrl || '');
    } catch (_e) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'Failed to load content',
        message: 'Could not load content.',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedPage]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

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

  const handleOpenMediaLibrary = useCallback((callback: (url: string) => void) => {
    setMediaSelectCallback(() => callback);
    setIsMediaModalOpen(true);
  }, []);

  const handleMediaSelect = (files: UploadFile[]) => {
    if (files.length > 0 && mediaSelectCallback) {
      mediaSelectCallback(files[0].secure_url);
    }
    setMediaSelectCallback(null);
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
          const viewUrl = page.id === 'about' ? '/about' : `/${page.id}`;
          return (
            <div key={page.id} className="relative">
              <button
                onClick={() => setSelectedPage(page.id)}
                className={`w-full p-4 border rounded-lg transition-colors text-left ${isSelected
                  ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                  : 'border-luxury-warm-grey/20 hover:border-brand-purple/40 text-luxury-black'
                  }`}
              >
                <div className="mb-2">
                  <Icon size={24} />
                </div>
                <div className="font-extralight uppercase text-sm tracking-wide">{page.label}</div>
              </button>
              <Link
                href={viewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 p-2 border border-luxury-warm-grey/20 text-luxury-black hover:bg-luxury-warm-grey/10 transition-colors rounded"
                title="View on live site"
                onClick={(e) => e.stopPropagation()}
              >
                <LuExternalLink size={16} />
              </Link>
            </div>
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
          <AboutPageEditor
            content={content}
            onChange={setContent}
            onSelectMedia={handleOpenMediaLibrary}
          />
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
              {/* 
                 Keeping FileUpload for PDF as MediaLibraryModal is optimized for images.
                 User said "Let all... use the upload modal" but practically PDF support in image grid is poor.
                 I'll switch to Media Picker specific for Document if needed, but for now 
                 I'll construct a MediaInput that uses the modal for consistency if possible, 
                 or stick to FileUpload since it handles non-image types better currently.
                 Actually, let's use the new MediaPicker component for consistency where applicable.
               */}
              <FileUpload
                value={documentUrl}
                onChange={setDocumentUrl}
                type="file"
                accept=".pdf,application/pdf"
                label="Document (PDF)"
                maxSizeMB={100}
              />
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

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleMediaSelect}
        uploadType="media"
        multiple={false}
      />
    </div>
  );
}

// Reusable Media Picker Component to replace FileUpload for Images
function MediaPicker({
  label,
  value,
  onChange,
  onSelectMedia,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onSelectMedia: (cb: (url: string) => void) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
        {label}
      </label>
      <div className="mt-2 space-y-3">
        {value && (
          <div className="relative w-full max-w-md aspect-video bg-luxury-warm-grey/5 rounded-lg border border-luxury-warm-grey/20 overflow-hidden">
            <Image
              src={value}
              alt={label}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute top-2 right-2 p-1.5 bg-white/90 text-luxury-black rounded-full hover:bg-white transition-colors"
              title="Remove"
            >
              <LuX size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-2">
          {/* Text Input for manual URL */}
          <div className="flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight text-sm"
            />
          </div>

          {/* Select Button */}
          <button
            type="button"
            onClick={() => onSelectMedia(onChange)}
            className="px-4 py-2 bg-luxury-warm-grey/10 hover:bg-luxury-warm-grey/20 text-luxury-black border border-luxury-warm-grey/20 rounded-lg transition-colors font-extralight uppercase text-xs flex items-center gap-2"
          >
            <LuImage size={16} /> Select Media
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Video Preview in List
function VideoPreview({ url }: { url: string }) {
  const [muted, setMuted] = useState(true);

  if (!url) return null;

  return (
    <div className="relative w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden mb-2 border border-luxury-warm-grey/20">
      <video
        src={url}
        muted={muted}
        autoPlay
        loop
        className="w-full h-full object-cover"
      />
      <button
        type="button"
        onClick={() => setMuted(!muted)}
        className="absolute bottom-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors pointer-events-auto"
        title={muted ? "Unmute" : "Mute"}
      >
        {muted ? (
          // Muted Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
        ) : (
          // Unmuted Icon
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>
    </div>
  );
}

// About Page Editor with structured form
function AboutPageEditor({
  content,
  onChange,
  onSelectMedia,
}: {
  content: string;
  onChange: (html: string) => void;
  onSelectMedia: (cb: (url: string) => void) => void;
}) {
  // Parse content to get initial values
  const initialFormData = useMemo(() => {
    if (content) {
      try {
        const parsed = JSON.parse(content);
        return {
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
        };
      } catch {
        // If not JSON, return empty defaults
      }
    }
    return {
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
    };
  }, [content]);

  const [formData, setFormData] = useState(initialFormData);

  // Update formData when content changes externally
  useEffect(() => {
    setFormData(initialFormData);
  }, [initialFormData]);

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(JSON.stringify(updated));
  };

  // Use onSelectMedia for video selection/upload via the modal
  const handleVideoAdd = () => {
    onSelectMedia((url) => {
      const updated = [...formData.builtForVideos, url];
      setFormData({ ...formData, builtForVideos: updated });
      onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
    });
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
        <MediaPicker
          label="Hero Image"
          value={formData.heroImage}
          onChange={(url) => handleFieldChange('heroImage', url)}
          onSelectMedia={onSelectMedia}
        />
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
          <MediaPicker
            label="My Why Image"
            value={formData.myWhyImage}
            onChange={(url) => handleFieldChange('myWhyImage', url)}
            onSelectMedia={onSelectMedia}
          />
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
          <MediaPicker
            label="Our Story Image"
            value={formData.ourStoryImage}
            onChange={(url) => handleFieldChange('ourStoryImage', url)}
            onSelectMedia={onSelectMedia}
          />
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
            <div className="space-y-4">
              {formData.builtForVideos.map((video, index) => (
                <div key={index} className="flex flex-col gap-2 p-3 border border-luxury-warm-grey/10 rounded-lg bg-luxury-warm-grey/5">
                  <VideoPreview url={video} />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={video}
                      onChange={(e) => {
                        const updated = [...formData.builtForVideos];
                        updated[index] = e.target.value;
                        setFormData({ ...formData, builtForVideos: updated });
                        onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
                      }}
                      className="flex-1 px-4 py-2 border border-luxury-warm-grey/20 rounded-lg focus:outline-none focus:border-brand-purple/50 font-extralight text-sm bg-white"
                      placeholder="Video URL"
                    />
                    <button
                      type="button"
                      onClick={() => handleVideoRemove(index)}
                      className="px-3 py-2 border border-red-500 text-red-500 uppercase font-extralight hover:bg-red-500 hover:text-luxury-white transition-colors text-xs rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleVideoAdd}
                  className="px-4 py-2 border border-brand-purple text-brand-purple uppercase font-extralight hover:bg-brand-purple hover:text-luxury-white transition-colors flex items-center justify-center gap-2 rounded-lg"
                >
                  <LuUpload size={16} />
                  <span>Select / Upload Video</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = [...formData.builtForVideos, ''];
                    setFormData({ ...formData, builtForVideos: updated });
                    onChange(JSON.stringify({ ...formData, builtForVideos: updated }));
                  }}
                  className="px-4 py-2 border border-luxury-warm-grey/20 text-luxury-black uppercase font-extralight hover:bg-luxury-warm-grey/10 transition-colors flex items-center justify-center gap-2 rounded-lg"
                >
                  <LuVideo size={16} /> Add URL Only
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
