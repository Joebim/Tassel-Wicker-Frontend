'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { apiFetch } from '@/services/apiClient';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

// Dynamically import Editor to avoid SSR issues
const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    { ssr: false }
);

interface RichTextEditorProps {
    value: string; // HTML string
    onChange: (html: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start typing...',
    readOnly = false,
}: RichTextEditorProps) {
    const [editorState, setEditorState] = useState<EditorState>(() => EditorState.createEmpty());
    const [isMounted, setIsMounted] = useState(false);
    const isInitializedRef = useRef(false);
    const lastValueRef = useRef<string>(value);
    const lastGeneratedHtmlRef = useRef<string>('');
    const isInternalChangeRef = useRef(false);

    // Single mount effect - set mounted flag only
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Small delay to ensure DOM is ready
            const timeoutId = setTimeout(() => {
                setIsMounted(true);
            }, 100);

            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, []);

    // Initialize editor content ONLY after mounted and ONLY when isReady is true
    useEffect(() => {
        // Don't do anything until mounted
        if (!isMounted) return;

        // Skip if this is an internal change (user typing)
        if (isInternalChangeRef.current) {
            isInternalChangeRef.current = false;
            lastValueRef.current = value;
            return;
        }

        // Skip if value hasn't actually changed
        if (lastValueRef.current === value && isInitializedRef.current) {
            return;
        }

        // Skip if this value matches what we just generated (user typing)
        if (lastGeneratedHtmlRef.current === value && isInitializedRef.current) {
            lastValueRef.current = value;
            return;
        }

        // Update last value
        lastValueRef.current = value;

        // Initialize or update editor state - but only after a small delay to ensure Editor is mounted
        const initTimeout = setTimeout(() => {
            if (value && value.trim()) {
                try {
                    const contentBlock = htmlToDraft(value);
                    if (contentBlock && contentBlock.contentBlocks) {
                        const contentState = ContentState.createFromBlockArray(
                            contentBlock.contentBlocks,
                            contentBlock.entityMap
                        );
                        const newEditorState = EditorState.createWithContent(contentState);
                        setEditorState(newEditorState);
                        isInitializedRef.current = true;
                    } else {
                        if (!isInitializedRef.current) {
                            setEditorState(EditorState.createEmpty());
                            isInitializedRef.current = true;
                        }
                    }
                } catch (error) {
                    console.error('Error parsing HTML content:', error);
                    if (!isInitializedRef.current) {
                        setEditorState(EditorState.createEmpty());
                        isInitializedRef.current = true;
                    }
                }
            } else {
                if (!isInitializedRef.current) {
                    setEditorState(EditorState.createEmpty());
                    isInitializedRef.current = true;
                }
            }
        }, 50);

        return () => {
            clearTimeout(initTimeout);
        };
    }, [value, isMounted]);

    const onEditorStateChange = (newEditorState: EditorState) => {
        // Mark this as an internal change to prevent re-initialization
        isInternalChangeRef.current = true;

        setEditorState(newEditorState);
        const html = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
        lastGeneratedHtmlRef.current = html;
        onChange(html);
    };

    // Don't render editor until mounted
    if (!isMounted) {
        return (
            <div className="border border-luxury-warm-grey/20 rounded-lg bg-white p-4 min-h-[300px] flex items-center justify-center">
                <div className="text-luxury-cool-grey font-extralight">Loading editor...</div>
            </div>
        );
    }

    return (
        <div className="border border-luxury-warm-grey/20 rounded-lg bg-white">
            <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                placeholder={placeholder}
                readOnly={readOnly}
                toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'link', 'emoji', 'image', 'history'],
                    inline: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                        options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'],
                    },
                    blockType: {
                        inDropdown: true,
                        options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                    },
                    fontSize: {
                        options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                    },
                    fontFamily: {
                        options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                    },
                    list: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                        options: ['unordered', 'ordered', 'indent', 'outdent'],
                    },
                    textAlign: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                        options: ['left', 'center', 'right', 'justify'],
                    },
                    link: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        popupClassName: undefined,
                        dropdownClassName: undefined,
                        showOpenOptionOnHover: true,
                        defaultTargetOption: '_self',
                        options: ['link', 'unlink'],
                    },
                    emoji: {
                        className: undefined,
                        component: undefined,
                        popupClassName: undefined,
                        emojis: [
                            '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
                            '😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈', '🙉', '🙊',
                        ],
                    },
                    image: {
                        className: undefined,
                        component: undefined,
                        popupClassName: undefined,
                        urlEnabled: true,
                        uploadEnabled: true,
                        alignmentEnabled: true,
                        uploadCallback: async (file: File) => {
                            try {
                                const formData = new FormData();
                                formData.append('file', file);
                                formData.append('type', 'image');
                                formData.append('folder', 'tassel-wicker/content/images');

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

                                return { data: { link: response.url } };
                            } catch (error) {
                                console.error('Image upload failed:', error);
                                throw error;
                            }
                        },
                        previewImage: true,
                        inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg,image/webp',
                        alt: { present: false, mandatory: false },
                        defaultSize: {
                            height: 'auto',
                            width: 'auto',
                        },
                    },
                    history: {
                        inDropdown: false,
                        className: undefined,
                        component: undefined,
                        dropdownClassName: undefined,
                        options: ['undo', 'redo'],
                    },
                }}
                editorClassName="px-4 py-3 min-h-[300px] text-luxury-black font-extralight"
                wrapperClassName=""
                toolbarClassName="border-b border-luxury-warm-grey/20 bg-luxury-warm-grey/5"
            />
        </div>
    );
}




