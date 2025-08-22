
import React, { useState } from "react";
import ImagePicker from "../components/ImagePicker";
import { useHistory } from "../state/historyContext";

interface DiagnoseTabProps {
  onResultsReady: (cards: any) => void;
}

export default function DiagnoseTab({ onResultsReady }: DiagnoseTabProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const { addEntry } = useHistory();
  const [debugMsg, setDebugMsg] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!imageFile) e.image = "Please add a photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDebugMsg("✅ Starting analysis...");

    if (!validate()) {
      setDebugMsg("❌ Please add a photo");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      let imageUrl = "";

      // Upload image
      if (imageFile) {
        const uploadStart = Date.now();
        setDebugMsg("📤 Uploading image...");
        const formDataToSend = new FormData();
        formDataToSend.append("image", imageFile);

        const uploadResp = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        });

        if (!uploadResp.ok) {
          const errorText = await uploadResp.text();
          throw new Error(
            `Image upload failed: ${uploadResp.status} - ${errorText}`,
          );
        }

        const uploadJson = await uploadResp.json();
        imageUrl = uploadJson.imageUrl;
        const uploadTime = Date.now() - uploadStart;
        setDebugMsg(`✅ Image uploaded (${uploadTime}ms), analyzing...`);
      }

      // Call backend multi-prompt results API
      setDebugMsg("🔍 AI analyzing...");
      const resp = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "dog health issue",
          imageUrl,
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Results request failed: ${resp.status} - ${errorText}`,
        );
      }

      const j = await resp.json();
      
      // Display timing information
      if (j.timings) {
        const t = j.timings;
        const parts = [
          `File: ${t.fileRead || 0}ms`,
          t.imageOptimization ? `Optimization: ${t.imageOptimization}ms` : null,
          `OpenAI: ${t.openaiCall}ms`,
          `Processing: ${t.responseProcessing}ms`
        ].filter(Boolean);
        setDebugMsg(`✅ Analysis complete! Total: ${t.total}ms (${parts.join(', ')})`);
      } else {
        setDebugMsg("✅ Analysis complete!");
      }

      // Save to history
      addEntry({
        form: { notes },
        triage: j.cards,
      });

      // Navigate to results
      onResultsReady(j.cards);
      
    } catch (err: any) {
      console.error("❌ Diagnose submit error", err);
      setDebugMsg(`❌ Error: ${err.message}`);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Something went wrong",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Add photo</h2>
        <ImagePicker onChange={setImageFile} />
        {errors.image && (
          <p className="text-red-600 text-sm mt-2">{errors.image}</p>
        )}
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe any symptoms, behaviors, or concerns about your pet (optional)..."
          className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
        />

        {errors.submit && (
          <p className="text-red-600 text-sm mt-2">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full h-12 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {submitting ? "Analyzing..." : "Analyze"}
        </button>
        {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
      </form>
    </div>
  );
}
