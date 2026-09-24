import React from "react";
import { X } from "lucide-react";

interface ImageZoomModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  imageUrl,
  onClose,
}) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full"
        >
          <X className="w-6 h-6" />
        </button>
        <img
          src={imageUrl}
          alt="Visualização ampliada"
          className="max-h-[85vh] w-auto rounded-xl object-contain shadow-2xl border border-white/20"
        />
      </div>
    </div>
  );
};
