import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LuX, LuUpload, LuTrash2, LuEye, LuCheck, LuLoader, LuRefreshCw, LuLink, LuVideo, LuFileText } from 'react-icons/lu';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { apiFetch } from '@/services/apiClient';
import { useToastStore } from '@/store/toastStore';
import { useConfirmStore } from '@/store/confirmStore';
import type { UploadGroup, UploadFile } from '@/types/upload';

interface MediaLibraryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (files: UploadFile[]) => void;
    multiple?: boolean;
    uploadType?: 'media' | 'product-image';
}

export function MediaLibraryModal({
    isOpen,
    onClose,
    onSelect,
    multiple = false,
    uploadType = 'product-image',
}: MediaLibraryModalProps) {
    const [groups, setGroups] = useState<UploadGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [previewFile, setPreviewFile] = useState<UploadFile | null>(null);

    const loadUploads = async () => {
        try {
            setLoading(true);
            const data = await apiFetch<UploadGroup[]>('/api/uploads', { method: 'GET' });
            setGroups(data || []);
        } catch (e) {
            useToastStore.getState().addToast({
                type: 'error',
                title: 'Failed to load library',
                message: e instanceof Error ? e.message : 'Could not fetch uploads.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadUploads();
            setSelectedIds(new Set());
        }
    }, [isOpen]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        try {
            setUploading(true);
            const promises = Array.from(files).map((file) => {
                const form = new FormData();
                form.append('file', file);
                // Determine endpoint based on type
                const endpoint = uploadType === 'product-image'
                    ? '/api/uploads/product-image'
                    : '/api/uploads/media';

                return apiFetch<{ success: boolean; url: string; public_id?: string; format?: string }>(
                    endpoint,
                    { method: 'POST', body: form }
                );
            });

            await Promise.all(promises);

            useToastStore.getState().addToast({
                type: 'success',
                title: 'Upload complete',
                message: 'Files uploaded successfully.',
            });

            e.target.value = ''; // Reset input
            loadUploads(); // Reload library
        } catch (err) {
            useToastStore.getState().addToast({
                type: 'error',
                title: 'Upload failed',
                message: err instanceof Error ? err.message : 'Failed to upload files.',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (file: UploadFile) => {
        if (file.isLinked) {
            const confirm = await useConfirmStore.getState().confirm({
                title: 'Delete Linked File?',
                message: 'This file is currently linked to a product. Deleting it may break images on your site. Are you sure?',
                confirmVariant: 'danger',
                confirmText: 'Delete Anyway',
            });
            if (!confirm) return;
        } else {
            const confirm = await useConfirmStore.getState().confirm({
                title: 'Delete File',
                message: 'Are you sure you want to delete this file?',
                confirmVariant: 'danger',
            });
            if (!confirm) return;
        }

        try {
            await apiFetch<{ success: boolean }>(`/api/uploads/${encodeURIComponent(file.public_id)}`, { method: 'DELETE' });

            useToastStore.getState().addToast({
                type: 'success',
                title: 'Deleted',
                message: 'File deleted successfully.',
            });

            // Remove from selection if present
            const nextSel = new Set(selectedIds);
            nextSel.delete(file.public_id);
            setSelectedIds(nextSel);

            loadUploads();
        } catch (e) {
            useToastStore.getState().addToast({
                type: 'error',
                title: 'Delete failed',
                message: e instanceof Error ? e.message : 'Could not delete file.',
            });
        }
    };

    const toggleSelection = (file: UploadFile) => {
        const next = new Set(multiple ? selectedIds : []);
        if (next.has(file.public_id)) {
            next.delete(file.public_id);
        } else {
            next.add(file.public_id);
        }
        setSelectedIds(next);
    };

    const handleConfirmSelect = () => {
        // Gather all selected files
        const allFiles = groups.flatMap(g => g.files);
        const selected = allFiles.filter(f => selectedIds.has(f.public_id));
        onSelect(selected);
        onClose();
    };

    // Helper functions for file types
    const isVideo = (file: UploadFile) => {
        return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(file.format?.toLowerCase());
    };

    const isPdf = (file: UploadFile) => {
        return file.format?.toLowerCase() === 'pdf' || file.secure_url?.toLowerCase().endsWith('.pdf');
    };

    // Helper to get thumbnail url for video (replacing extension with .jpg)
    // Cloudinary specific heuristic
    const getVideoThumbnail = (url: string) => {
        return url.replace(/\.[^/.]+$/, ".jpg");
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-light uppercase tracking-wider text-luxury-black">Media Library</h2>
                        {loading && <LuLoader className="animate-spin text-brand-purple" />}
                    </div>
                    <div className="flex items-center gap-3">
                        <label className={`
                flex items-center gap-2 px-4 py-2 bg-brand-purple text-white rounded-lg 
                cursor-pointer hover:bg-brand-purple-light transition-colors text-sm uppercase tracking-wide font-light
                ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                            {uploading ? <LuLoader className="animate-spin" /> : <LuUpload size={16} />}
                            <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
                            <input
                                type="file"
                                multiple
                                accept="image/*,video/*,application/pdf"
                                className="hidden"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                        </label>
                        <button
                            onClick={() => loadUploads()}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                            title="Refresh"
                        >
                            <LuRefreshCw size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            <LuX size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {groups.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 font-light">
                            <LuUpload size={48} className="mb-4 opacity-20" />
                            <p>No uploads found.</p>
                            <p className="text-sm">Upload some media to get started.</p>
                        </div>
                    )}

                    <div className="space-y-8">
                        {groups.map((group) => (
                            <div key={group.folder}>
                                <h3 className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 flex items-center gap-2">
                                    <span>/{group.folder}</span>
                                    <span className="bg-gray-200 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">{group.files.length}</span>
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {group.files.map((file) => {
                                        const isSelected = selectedIds.has(file.public_id);
                                        const videoFile = isVideo(file);
                                        const pdfFile = isPdf(file);

                                        return (
                                            <div
                                                key={file.public_id}
                                                className={`
                          group relative aspect-square bg-gray-200 rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                          ${isSelected ? 'border-brand-purple ring-2 ring-brand-purple/20' : 'border-transparent hover:border-brand-purple/50'}
                        `}
                                                onClick={() => toggleSelection(file)}
                                            >
                                                {/* Thumbnail Logic */}
                                                {videoFile ? (
                                                    <>
                                                        <Image
                                                            src={getVideoThumbnail(file.secure_url)}
                                                            alt={file.public_id}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 768px) 50vw, 20vw"
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                            <div className="bg-black/40 p-2 rounded-full text-white">
                                                                <LuVideo size={20} />
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : pdfFile ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                                                        <LuFileText size={48} className="text-red-500 mb-2" />
                                                        <span className="text-[10px] text-gray-500 font-mono break-all text-center line-clamp-2 px-1">
                                                            {file.public_id.split('/').pop()}
                                                        </span>
                                                        <span className="text-[9px] uppercase font-bold text-gray-400 mt-1">PDF</span>
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={file.secure_url}
                                                        alt={file.public_id}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 50vw, 20vw"
                                                    />
                                                )}

                                                {/* Overlay */}
                                                <div className={`
                          absolute inset-0 bg-black/40 transition-opacity flex flex-col justify-end p-2
                          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                        `}>
                                                    <div className="absolute top-2 right-2 flex gap-1">
                                                        {file.isLinked && (
                                                            <div className="bg-blue-500 text-white p-1 rounded-md shadow-sm" title="Linked to a product">
                                                                <LuLink size={14} />
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }}
                                                            className="bg-white/90 text-gray-700 p-1.5 rounded-md hover:bg-white hover:text-brand-purple shadow-sm transition-colors"
                                                            title="Preview"
                                                        >
                                                            <LuEye size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(file); }}
                                                            className="bg-white/90 text-red-500 p-1.5 rounded-md hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                                                            title="Delete"
                                                        >
                                                            <LuTrash2 size={14} />
                                                        </button>
                                                    </div>

                                                    {isSelected && (
                                                        <div className="absolute top-2 left-2 bg-brand-purple text-white p-1 rounded-full shadow-sm animate-in zoom-in">
                                                            <LuCheck size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center">
                    <div className="text-sm text-gray-500 font-light">
                        {selectedIds.size} file{selectedIds.size !== 1 && 's'} selected
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm uppercase tracking-wide font-light"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirmSelect}
                            disabled={selectedIds.size === 0}
                            className="px-6 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple-light transition-colors text-sm uppercase tracking-wide font-light disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Select {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 animate-in fade-in duration-200" onClick={() => setPreviewFile(null)}>
                    <button
                        className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-50"
                        onClick={() => setPreviewFile(null)}
                    >
                        <LuX size={32} />
                    </button>
                    <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center p-4" onClick={e => e.stopPropagation()}>
                        {isVideo(previewFile) ? (
                            <video
                                src={previewFile.secure_url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full rounded shadow-2xl"
                            />
                        ) : isPdf(previewFile) ? (
                            <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-2xl">
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                    <Viewer fileUrl={previewFile.secure_url} />
                                </Worker>
                            </div>
                        ) : (
                            <Image
                                src={previewFile.secure_url}
                                alt={previewFile.public_id}
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                    <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 font-mono text-xs z-50">
                        {previewFile.public_id} • {previewFile.format}
                    </div>
                </div>
            )}
        </div>
    );
}
