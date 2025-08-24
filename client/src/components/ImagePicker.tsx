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

    setTimeout(() => setIsLoading(false), 300); // Small delay for better UX
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
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
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
            className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0 shadow-lg"
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
          {/* Upload area */}
          <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300">
            <div className="flex flex-col items-center justify-center p-12 text-center bg-muted/20 hover:bg-muted/30 transition-colors duration-300">
              {isLoading ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing...</p>
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
              className="h-12 space-x-2"
              data-testid="button-take-photo"
            >
              <Camera size={20} />
              <span>Take Photo</span>
            </Button>
            <Button
              onClick={handleGalleryUpload}
              variant="secondary"
              size="lg"
              className="h-12 space-x-2"
              data-testid="button-choose-gallery"
            >
              <Upload size={20} />
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