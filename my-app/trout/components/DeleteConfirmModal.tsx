"use client";

import { useState, useEffect } from "react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  checklistInfo?: {
    locationNumber: string | null;
    client: string | null;
    completedAt: string | null;
  };
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  checklistInfo,
}: DeleteConfirmModalProps) {
  const [confirmText, setConfirmText] = useState("");
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmText("");
      setCanDelete(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setCanDelete(confirmText === "DELETE");
  }, [confirmText]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-red-600 mb-2">Delete Review</h2>
          <p className="text-sm text-gray-700 mb-2">
            Are you sure you want to delete this review? This action cannot be undone.
          </p>
          {checklistInfo && (
            <div className="bg-gray-50 rounded-md p-3 mb-4 text-sm">
              <p><strong>Location:</strong> {checklistInfo.locationNumber || 'No Location'}</p>
              {checklistInfo.client && <p><strong>Client:</strong> {checklistInfo.client}</p>}
              {checklistInfo.completedAt && (
                <p><strong>Completed:</strong> {new Date(checklistInfo.completedAt).toLocaleString()}</p>
              )}
            </div>
          )}
          <p className="text-sm font-medium text-gray-900 mb-2">
            Type <span className="font-mono bg-red-100 text-red-800 px-2 py-1 rounded">DELETE</span> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canDelete) {
                handleConfirm();
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canDelete}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              canDelete
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Delete Review
          </button>
        </div>
      </div>
    </div>
  );
}

