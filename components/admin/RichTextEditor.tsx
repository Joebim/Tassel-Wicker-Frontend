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
  // Always start with empty state to prevent hydration mismatch
  // Content will be loaded in useEffect after mount
  const [editorState, setEditorState] = useState<EditorState>(() => EditorState.createEmpty());
  const [isMounted, setIsMounted] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isInitializedRef = useRef(false);
  const lastValueRef = useRef<string>(value);
  const lastGeneratedHtmlRef = useRef<string>('');
  const isInternalChangeRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize mounted state with a delay to ensure DOM is ready
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use requestAnimationFrame to ensure DOM is ready
      const rafId = requestAnimationFrame(() => {
        // Add a small delay to ensure all components are mounted
        const timeoutId = setTimeout(() => {
          setIsMounted(true);
          // Additional delay before rendering Editor to prevent setState errors
          // This gives react-draft-wysiwyg time to fully initialize
          const readyTimeoutId = setTimeout(() => {
            setIsReady(true);
          }, 150);
          timeoutRef.current = readyTimeoutId;
        }, 50);
        timeoutRef.current = timeoutId;
      });
      
      return () => {
        cancelAnimationFrame(rafId);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, []);

  // Load content after mount to prevent hydration mismatch
  // Only update if value changed externally (not from user typing)
  useEffect(() => {
    if (!isMounted) return;

    // Skip if this is an internal change (user typing)
    if (isInternalChangeRef.current) {
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Reset flag after a short delay to allow for rapid typing
      timeoutRef.current = setTimeout(() => {
        isInternalChangeRef.current = false;
        lastValueRef.current = value;
      }, 100);
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

    // Initialize or update editor state
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
  }, [value, isMounted]);

  const onEditorStateChange = (newEditorState: EditorState) => {
    // Mark this as an internal change to prevent re-initialization
    isInternalChangeRef.current = true;
    
    setEditorState(newEditorState);
    const html = draftToHtml(convertToRaw(newEditorState.getCurrentContent()));
    lastGeneratedHtmlRef.current = html;
    onChange(html);
  };

  // Don't render editor until fully ready to prevent setState errors
  if (!isMounted || !isReady) {
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




