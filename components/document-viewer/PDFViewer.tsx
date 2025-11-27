'use client';

import { useEffect, useState } from 'react';

const documentMap: Record<string, string> = {
  'privacy-policy': '/privacy-policy.pdf',
  'terms-of-service': '/terms-of-service.pdf',
  'cookie-policy': '/cookie-policy.pdf',
};

interface PDFViewerProps {
  docName: string;
}

export default function PDFViewer({ docName }: PDFViewerProps) {
  const pdfUrl = documentMap[docName] || null;
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Set viewport meta tag for proper mobile zoom
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts for saving/downloading
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+P, Ctrl+A, F12 (DevTools)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 's' || e.key === 'p' || e.key === 'a')
      ) {
        e.preventDefault();
        return false;
      }
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      
      // Restore default viewport on unmount
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1');
      }
    };
  }, []);

  if (!pdfUrl) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-extralight text-luxury-black mb-4">
            Document Not Found
          </h1>
          <p className="text-luxury-cool-grey font-extralight">
            The requested document could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar */}
      <div className={`bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm ${isMobile ? 'py-2' : 'py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <p className={`text-luxury-black font-extralight ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {isMobile ? 'Document Viewer' : 'Document Viewer - Use browser controls to navigate'}
            </p>
          </div>
        </div>
      </div>

      {/* PDF Viewer using iframe */}
      <div className={`flex justify-center items-start py-4 px-4 ${isMobile ? 'h-[calc(100vh-60px)]' : 'h-[calc(100vh-80px)]'}`}>
        <div className="w-full h-full bg-white shadow-lg" style={{ userSelect: 'none' }}>
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0${isMobile ? '&zoom=page-width' : '&zoom=auto'}`}
            className="w-full h-full border-0"
            title="PDF Document Viewer"
            style={{
              pointerEvents: 'auto',
              touchAction: 'pan-x pan-y pinch-zoom',
            }}
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          />
        </div>
      </div>

      {/* Additional protection styles */}
      <style jsx global>{`
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          overflow: hidden;
        }
        /* Prevent image dragging */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }
        /* Mobile-specific PDF viewer adjustments */
        @media (max-width: 768px) {
          iframe[title="PDF Document Viewer"] {
            -webkit-overflow-scrolling: touch;
            overflow: auto;
          }
        }
      `}</style>
    </div>
  );
}

