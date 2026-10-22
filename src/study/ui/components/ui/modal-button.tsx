import React from "react";

interface ModalButtonProps {
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "warning";
  children: React.ReactNode;
  className?: string;
}

export function ModalButton({
  onClick,
  variant = "primary",
  children,
  className = "",
}: ModalButtonProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case "primary":
        return "bg-blue-600 text-white hover:bg-blue-700";
      case "secondary":
        return "text-gray-600 border border-gray-300 hover:bg-gray-50";
      case "danger":
        return "bg-red-600 text-white hover:bg-red-700";
      case "warning":
        return "bg-orange-600 text-white hover:bg-orange-700";
      default:
        return "bg-blue-600 text-white hover:bg-blue-700";
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded transition-colors ${getVariantClasses()} ${className}`}
    >
      {children}
    </button>
  );
}
