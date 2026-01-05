'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LuUpload, LuX, LuImage, LuVideo, LuFile } from 'react-icons/lu';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';

interface FileUploadProps {
  value: string; // Current URL
  onChange: (url: string) => void;
  accept?: string; // File types to accept (e.g., 'image/*', 'video/*', '.pdf')
  label?: string;
  type?: 'image' | 'video' | 'file'; // Determines which icon and preview to show
  maxSizeMB?: number; // Maximum file size in MB
}

export default function FileUpload({
  value,
  onChange,
  accept,
  label,
  type = 'image',
  maxSizeMB = 10,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mark component as mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync preview with value prop (only after mount)
  useEffect(() => {
    if (!isMounted) return;
    if (value !== preview && !preview?.startsWith('blob:')) {
      setPreview(value || null);
    }
  }, [value, preview, isMounted]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent event from bubbling
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size based on type (per API documentation)
    const fileSizeMB = file.size / (1024 * 1024);
    const maxSizes = {
      image: 8, // 8MB for images
      video: 100, // 100MB for videos
      file: 100, // 100MB for documents
    };
    const effectiveMaxSize = maxSizes[type] || maxSizeMB;

    if (fileSizeMB > effectiveMaxSize) {
      useToastStore.getState().addToast({
        type: 'error',
        title: 'File Too Large',
        message: `${type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'File'} size must be less than ${effectiveMaxSize}MB`,
      });
      return;
    }

    // Validate file type
    if (accept) {
      const acceptTypes = accept.split(',').map(t => t.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = acceptTypes.some(acceptType => {
        // Check MIME type match
        if (acceptType.includes('/') && file.type === acceptType) {
          return true;
        }
        // Check extension match
        if (acceptType.startsWith('.') && fileExtension === acceptType) {
          return true;
        }
        // Check wildcard patterns like 'image/*'
        if (acceptType.includes('*')) {
          const pattern = acceptType.replace('*', '.*');
          return file.type.match(new RegExp(pattern));
        }
        return false;
      });

      if (!isValidType) {
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Invalid File Type',
          message: `Please select a ${accept} file`,
        });
        return;
      }
    }

    try {
      if (!isMounted) return;
      setUploading(true);

      // Create preview for images and videos
      if (type === 'image' || type === 'video') {
        const previewUrl = URL.createObjectURL(file);
        if (isMounted) {
          setPreview(previewUrl);
        }
      }

      // Upload to Cloudinary using the media endpoint
      const formData = new FormData();
      formData.append('file', file);

      // Determine resource type from file type
      let resourceType: 'image' | 'video' | 'document' = 'image';
      if (type === 'video' || file.type.startsWith('video/')) {
        resourceType = 'video';
      } else if (type === 'file' || file.type.startsWith('application/')) {
        resourceType = 'document';
      } else if (file.type.startsWith('image/')) {
        resourceType = 'image';
      }

      formData.append('type', resourceType);

      // Use appropriate folder based on type
      const folder = resourceType === 'image'
        ? 'tassel-wicker/content/images'
        : resourceType === 'video'
          ? 'tassel-wicker/content/videos'
          : 'tassel-wicker/content/documents';

      formData.append('folder', folder);

      const response = await apiFetch<{
        success: boolean;
        url: string;
        publicId?: string;
        width?: number;
        height?: number;
        format?: string;
        bytes?: number;
        resourceType?: string;
      }>('/api/uploads/media', {
        method: 'POST',
        auth: true,
        body: formData,
      });

      const uploadedUrl = response.url;
      if (isMounted) {
        onChange(uploadedUrl);
        setPreview(uploadedUrl);
      }

      if (isMounted) {
        useToastStore.getState().addToast({
          type: 'success',
          title: 'Upload Successful',
          message: 'File has been uploaded successfully.',
        });
      }
    } catch (error) {
      // Revert preview on error
      if (isMounted) {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
          setPreview(value || null);
        }
        useToastStore.getState().addToast({
          type: 'error',
          title: 'Upload Failed',
          message: error instanceof Error ? error.message : 'Failed to upload file.',
        });
      }
    } finally {
      if (isMounted) {
        setUploading(false);
      }
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    onChange('');
  };

  const getIcon = () => {
    switch (type) {
      case 'image':
        return <LuImage size={20} />;
      case 'video':
        return <LuVideo size={20} />;
      case 'file':
        return <LuFile size={20} />;
      default:
        return <LuUpload size={20} />;
    }
  };

  const getAcceptType = () => {
    if (accept) return accept;
    switch (type) {
      case 'image':
        return 'image/*';
      case 'video':
        return 'video/*';
      case 'file':
        return '.pdf';
      default:
        return '*/*';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-extralight uppercase tracking-wide text-luxury-black mb-2">
          {label}
        </label>
      )}

      <div className="space-y-3">
        {/* Preview */}
        {preview && (
          <div className="relative border border-luxury-warm-grey/20 rounded-lg overflow-hidden bg-luxury-warm-grey/5">
            {type === 'image' && (
              <div className="relative w-full h-48">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            )}
            {type === 'video' && (
              <div className="relative w-full h-48 bg-black">
                <video
                  src={preview}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {type === 'file' && (
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LuFile size={24} className="text-brand-purple" />
                  <div>
                    <div className="text-sm font-extralight text-luxury-black">
                      Document uploaded
                    </div>
                    <a
                      href={preview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-purple hover:text-brand-purple-light underline"
                    >
                      View document
                    </a>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 hover:bg-luxury-warm-grey/10 rounded transition-colors"
                  aria-label="Remove file"
                >
                  <LuX size={16} className="text-luxury-cool-grey" />
                </button>
              </div>
            )}
            {type !== 'file' && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
                aria-label="Remove"
              >
                <LuX size={16} className="text-luxury-black" />
              </button>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptType()}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${type}`}
          />
          <label
            htmlFor={`file-upload-${type}`}
            onClick={(e) => {
              // Prevent event from bubbling to parent components (like RichTextEditor)
              e.stopPropagation();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg cursor-pointer transition-colors ${uploading
                ? 'border-luxury-warm-grey/20 bg-luxury-warm-grey/10 cursor-not-allowed'
                : 'border-brand-purple text-brand-purple hover:bg-brand-purple hover:text-luxury-white'
              } font-extralight uppercase text-sm`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                {getIcon()}
                <span>{preview ? 'Replace' : 'Upload'} {type === 'image' ? 'Image' : type === 'video' ? 'Video' : 'File'}</span>
              </>
            )}
          </label>
        </div>

        {/* Current URL display (if exists and not preview) */}
        {value && !preview?.startsWith('blob:') && (
          <div className="text-xs text-luxury-cool-grey font-extralight">
            Current: <span className="text-luxury-black break-all">{value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

