import * as React from "react";
import { Button } from "./ui/button";
import { AppIcons, Camera, Upload, X, Image as ImageIcon } from "./icons";
import { cn } from "../lib/utils";
import { uploadImageToSupabase } from "../lib/supabase";

type Props = {
  onChange: (imageUrl: string | null) => void;
  className?: string;
};

export default function ImagePicker({ onChange, className }: Props) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<{
    file: File;
    preview: string;
    uploadedUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setIsLoading(true);
    setUploadError(null);

    if (f) {
      const previewUrl = URL.createObjectURL(f);
      setPreview(previewUrl);
      setSelectedFile({ file: f, preview: previewUrl });

      try {
        // Upload to Supabase Storage
        const uploadedUrl = await uploadImageToSupabase(f);

        setSelectedFile((prev) => (prev ? { ...prev, uploadedUrl } : null));
        onChange(uploadedUrl);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadError(
          error instanceof Error ? error.message : "Upload failed",
        );
        onChange(null);
      }
    } else {
      setPreview(null);
      setSelectedFile(null);
      onChange(null);
    }

    setIsLoading(false);
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
    setUploadError(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
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

          {/* Upload status */}
          {selectedFile?.uploadedUrl && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              Uploaded
            </div>
          )}

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
          <div className="flex gap-2 mt-3">
            <Button
              variant="default"
              onClick={handleCameraCapture}
              className="flex-1 h-9 text-sm"
              data-testid="button-retake-photo"
            >
              <Camera size={14} className="mr-1" />
              Retake
            </Button>
            <Button
              variant="default"
              onClick={handleGalleryUpload}
              className="flex-1 h-9 text-sm"
              data-testid="button-choose-different"
            >
              <Upload size={14} className="mr-1" />
              Choose Different
            </Button>
          </div>

          {/* Upload error message */}
          {uploadError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <X size={16} />
                <span>{uploadError}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upload area */}
          <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors duration-300 shadow-medium hover:shadow-elevated">
            <div className="flex flex-col items-center justify-center p-4 text-center bg-muted/20 hover:bg-muted/30 transition-colors duration-300">
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
                <div className="space-y-4 flex flex-col items-center">
                  <AppIcons.camera size={24} className="text-primary" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-foreground">
                      Upload or Take a Photo
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      A focused image helps us give you better guidance.
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCameraCapture}
              variant="default"
              size="default"
              className="h-10 space-x-1 group relative overflow-hidden"
              data-testid="button-take-photo"
            >
              <Camera
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm">Take Photo</span>
            </Button>
            <Button
              onClick={handleGalleryUpload}
              variant="default"
              size="default"
              className="h-10 space-x-1 group relative overflow-hidden"
              data-testid="button-choose-gallery"
            >
              <Upload
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-sm">Choose File</span>
            </Button>
          </div>
        </div>
      )}

      {/* Camera input - opens native camera */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handle}
        ref={cameraInputRef}
        className="sr-only"
        data-testid="input-camera"
      />

      {/* File input - opens file picker */}
      <input
        type="file"
        accept="image/*"
        onChange={handle}
        ref={fileInputRef}
        className="sr-only"
        data-testid="input-file"
      />
    </div>
  );
}
