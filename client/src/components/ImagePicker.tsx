import * as React from "react";
import { Button } from "./ui/button";
import { AppIcons, Camera, Upload, X, Image as ImageIcon } from "./icons";
import { cn } from "../lib/utils";

type Props = { 
  onChange: (file: File | null) => void;
  className?: string;
};

export default function ImagePicker({ onChange, className }: Props) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<{ file: File; preview: string } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setIsLoading(true);
    
    onChange(f);
    if (f) {
      const previewUrl = URL.createObjectURL(f);
      setPreview(previewUrl);
      setSelectedFile({ file: f, preview: previewUrl });
    } else {
      setPreview(null);
      setSelectedFile(null);
    }
    
    setTimeout(() => setIsLoading(false), 600); // Slightly longer for better perceived performance
  }

  React.useEffect(() => {
    // Cleanup function to revoke object URLs when the component unmounts or preview changes
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (selectedFile) URL.revokeObjectURL(selectedFile.preview);
    };
  }, [preview, selectedFile]);

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const handleGalleryUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("space-y-4", className)}>
      {selectedFile ? (
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl border-2 border-border bg-card">
            <img
              src={selectedFile.preview}
              alt="Selected pet photo"
              className="w-full h-48 object-contain bg-muted/20 transition-transform duration-300 group-hover:scale-105"
              data-testid="img-preview"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2 text-sm">
                  <ImageIcon size={16} />
                  <span>{selectedFile.file.name}</span>
                </div>
                <span className="text-xs opacity-80">
                  {(selectedFile.file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
          
          {/* Remove button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-elevated hover:shadow-floating hover:scale-110 transition-all duration-200"
            data-testid="button-remove-image"
          >
            <X size={16} />
          </Button>
          
          {/* Replace button */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCameraCapture}
              className="flex-1"
              data-testid="button-retake-photo"
            >
              <Camera size={16} className="mr-2" />
              Retake
            </Button>
            <Button
              variant="outline"
              onClick={handleGalleryUpload}
              className="flex-1"
              data-testid="button-choose-different"
            >
              <Upload size={16} className="mr-2" />
              Choose Different
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Friendly Pet Illustration */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-medium">
              <svg width="48" height="48" viewBox="0 0 100 100" className="text-primary">
                {/* Friendly Dog SVG */}
                <circle cx="50" cy="45" r="25" fill="currentColor" opacity="0.1" />
                <circle cx="42" cy="40" r="3" fill="currentColor" />
                <circle cx="58" cy="40" r="3" fill="currentColor" />
                <ellipse cx="50" cy="48" rx="2" ry="3" fill="currentColor" />
                <path d="M45 52 Q50 56 55 52" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <circle cx="35" cy="35" r="8" fill="currentColor" opacity="0.15" />
                <circle cx="65" cy="35" r="8" fill="currentColor" opacity="0.15" />
                <path d="M35 30 Q32 25 30 30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M65 30 Q68 25 70 30" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                <ellipse cx="50" cy="65" rx="15" ry="8" fill="currentColor" opacity="0.08" />
              </svg>
            </div>
          </div>
          
          {/* Upload area */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300 shadow-medium hover:shadow-elevated">
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 hover:bg-muted/30 transition-colors duration-300">
              {isLoading ? (
                <div className="space-y-6 w-full">
                  <div className="space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded-lg w-32 mx-auto animate-pulse" />
                      <div className="h-3 bg-muted/60 rounded-lg w-24 mx-auto animate-pulse" />
                    </div>
                  </div>
                  <div className="h-[200px] bg-gradient-to-r from-muted via-muted/50 to-muted rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite] translate-x-[-100%]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-10 bg-muted rounded-lg animate-pulse" />
                    <div className="h-10 bg-muted rounded-lg animate-pulse" />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <AppIcons.camera size={32} className="text-primary" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Add Your Pet's Photo</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Take a clear photo of your pet or upload from your device. Better photos lead to more accurate analysis.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>JPG, PNG supported</span>
                    </div>
                    <span>•</span>
                    <span>Max 10MB</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCameraCapture}
              variant="default"
              size="lg"
              className="h-12 space-x-2 group relative overflow-hidden"
              data-testid="button-take-photo"
            >
              <Camera size={20} className="transition-transform group-hover:scale-110" />
              <span>Take Photo</span>
            </Button>
            <Button
              onClick={handleGalleryUpload}
              variant="secondary"
              size="lg"
              className="h-12 space-x-2 group relative overflow-hidden"
              data-testid="button-choose-gallery"
            >
              <Upload size={20} className="transition-transform group-hover:scale-110" />
              <span>Choose File</span>
            </Button>
          </div>
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handle}
        ref={fileInputRef}
        className="sr-only"
        data-testid="input-file"
      />
    </div>
  );
}