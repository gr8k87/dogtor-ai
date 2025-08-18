
import React, { useRef, useState } from 'react';

interface ImagePickerProps {
  onChange: (file: File | null) => void;
}

export default function ImagePicker({ onChange }: ImagePickerProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    
    onChange(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Select or take a photo"
      />
      
      {preview ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Selected photo"
              className="w-32 h-32 object-cover rounded-lg border border-gray-200"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleClick}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Change Photo
            </button>
            <button
              onClick={handleRemove}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleClick}
          className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 hover:border-gray-400 transition-colors"
          aria-label="Add photo"
        >
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="text-sm text-gray-500 font-medium">Add Photo</span>
        </button>
      )}
    </div>
  );
}
