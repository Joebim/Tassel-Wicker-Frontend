'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfirmStore } from '@/store/confirmStore';
import { LuX } from 'react-icons/lu';

const ConfirmModal: React.FC = () => {
  const { state, close } = useConfirmStore();

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      close(false);
    }
  };

  const handleCancel = () => {
    close(false);
  };

  const handleConfirm = () => {
    close(true);
  };

  if (!state.isOpen || !state.options) {
    return null;
  }

  const {
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmVariant = 'primary',
  } = state.options;

  const confirmButtonClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-black hover:bg-black/90 text-white';

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-black/10">
                <h3 className="text-lg font-light uppercase tracking-wider text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Close"
                >
                  <LuX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4">
                <p className="text-sm font-light text-gray-700 leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/10 bg-gray-50">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-light text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200 uppercase tracking-wider"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  className={`px-6 py-2 text-sm font-light ${confirmButtonClass} transition-colors duration-200 uppercase tracking-wider`}
                >
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
