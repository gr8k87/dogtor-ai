import * as React from "react";

type Props = { onChange: (file: File | null) => void };

export default function ImagePicker({ onChange }: Props) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<{ file: File; preview: string } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    if (f) {
      setPreview(URL.createObjectURL(f));
      setSelectedFile({ file: f, preview: URL.createObjectURL(f) });
    } else {
      setPreview(null);
      setSelectedFile(null);
    }
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
      fileInputRef.current.value = ""; // Reset the input value
    }
  };

  const handleCameraCapture = () => {
    // This would typically involve a more complex camera integration or direct file access
    // For now, we'll simulate by opening the file input
    fileInputRef.current?.click();
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Upload Pet Photo</h2>

      <div className="space-y-4">
        {selectedFile ? (
          <div className="relative">
            <img
              src={selectedFile.preview}
              alt="Selected pet"
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleRemoveFile}
              className="btn btn-destructive absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/20">
            <div className="space-y-4">
              <div className="text-6xl">📷</div>
              <div>
                <p className="text-foreground mb-2">Take a photo or choose from gallery</p>
                <p className="text-sm text-muted-foreground">Supports JPG, PNG files</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button
                  onClick={handleCameraCapture}
                  className="btn btn-primary px-6 py-3"
                >
                  Take Photo
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-secondary px-6 py-3"
                >
                  Choose from Gallery
                </button>
              </div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handle}
          ref={fileInputRef}
          className="sr-only" // Use sr-only to hide the default file input
        />
      </div>
    </div>
  );
}