'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import react-pdf with SSR disabled
const PDFViewer = dynamic(
  () => import('@/components/document-viewer/PDFViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-luxury-black font-extralight">Loading document viewer...</p>
      </div>
    ),
  }
);

function DocumentViewerContent() {
  const params = useParams();
  const docName = params.doc as string;

  return (<div className="pt-20"><PDFViewer docName={docName} /></div>);
}

export default function DocumentViewer() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-luxury-black font-extralight">Loading...</p>
        </div>
      }
    >
      <DocumentViewerContent />
    </Suspense>
  );
}

