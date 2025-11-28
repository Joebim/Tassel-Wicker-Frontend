'use client';

import { useEffect, useState } from 'react';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const documentMap: Record<string, string> = {
  'privacy-policy': '/Tassel & Wicker Privacy Notice.pdf',
  'terms-of-service': '/Tassel & Wicker Website Terms of Service.pdf',
  'cookie-policy': '/Tassel & Wicker Cookie Policy.pdf',
};

interface PDFViewerProps {
  docName: string;
}

export default function PDFViewer({ docName }: PDFViewerProps) {
  const pdfPath = documentMap[docName] || null;
  // Encode URL to handle spaces and special characters
  const pdfUrl = pdfPath ? encodeURI(pdfPath) : null;
  const [isMobile, setIsMobile] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize default layout plugin
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [],
    toolbarPlugin: {
      fullScreenPlugin: {
        onEnterFullScreen: (zoom) => {
          zoom(1.5);
        },
        onExitFullScreen: (zoom) => {
          zoom(1);
        },
      },
    },
  });

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

  if (error) {
  return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-extralight text-luxury-black mb-4">
            Error Loading Document
          </h1>
          <p className="text-luxury-cool-grey font-extralight">
            {error}
            </p>
          </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* PDF Viewer */}
      <div className={`${isMobile ? 'h-screen' : 'h-screen'}`} style={{ userSelect: 'none' }}>
        {pdfUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ height: '100%', width: '100%' }}>
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
                onDocumentLoad={(e) => {
                  console.log('PDF loaded:', e.doc.numPages, 'pages');
                  setError(null);
                }}
          />
        </div>
          </Worker>
        ) : (
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
        )}
      </div>

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      {/* Custom styles for react-pdf-viewer */}
      <style jsx global>{`
        /* Override react-pdf-viewer styles for better mobile experience */
        .rpv-core__viewer {
          height: 100% !important;
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .rpv-core__viewer {
            font-size: 12px;
          }
          
          .rpv-toolbar {
            padding: 8px !important;
          }
          
          .rpv-toolbar__item {
            padding: 4px !important;
          }
        }

        /* Prevent text selection */
        .rpv-core__viewer {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </div>
  );
}


