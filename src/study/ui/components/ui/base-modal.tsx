import React from "react";

interface BaseModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

export function BaseModal({
  isOpen = false,
  onClose,
  children,
  maxWidth = "max-w-md",
}: BaseModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white p-6 rounded-lg shadow-lg ${maxWidth}`}>
        {children}
      </div>
    </div>
  );
}
