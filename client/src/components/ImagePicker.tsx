import React, { useEffect, useState } from "react";
type Props = { onChange: (file: File|null)=>void };
export default function ImagePicker({ onChange }: Props){
  const [preview, setPreview] = useState<string|null>(null);
  function handle(e: React.ChangeEvent<HTMLInputElement>){
    const f = e.target.files?.[0] ?? null;
    onChange(f);
    if (f) setPreview(URL.createObjectURL(f)); else setPreview(null);
  }
  useEffect(()=>()=>{ if(preview) URL.revokeObjectURL(preview); },[preview]);
  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" capture="environment" onChange={handle} className="block w-full text-sm" />
      {preview && <img src={preview} alt="preview" className="w-32 h-32 object-cover rounded-lg border" />}
      {preview && (
        <button type="button" onClick={()=>{ setPreview(null); onChange(null); }} className="px-3 py-2 rounded-lg border">
          Remove
        </button>
      )}
    </div>
  );
}
