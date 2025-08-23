import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../components/ImagePicker";
import { useHistory } from "../state/historyContext";

// Dummy BottomTabs component for context, assuming it exists elsewhere
// If BottomTabs is defined in the same file, it should be placed here.
// For this example, we'll assume it's imported correctly.
// Placeholder for BottomTabs if not provided in the context:
/*
const BottomTabs = ({ navigate, activeTab }) => {
  const tabs = [
    { id: "diagnose", label: "Diagnose", path: "/diagnose" },
    { id: "history", label: "History", path: "/history" },
    { id: "results", label: "Results", path: "/results" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around p-2 border-t">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center p-2 rounded-lg ${
            activeTab === tab.id
              ? "bg-blue-100 text-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
*/
// Assuming BottomTabs is imported from "../components/BottomTabs"
// If it's not, and the intention is to create it here, uncomment and adjust the above.
// For now, we proceed assuming it's an external import.

// NOTE: The original provided code snippet for `DiagnoseTab` is missing the import for `BottomTabs`.
// Based on the changes, it's clear that `BottomTabs` is intended to be used.
// I will add a placeholder import and assume the component is correctly defined elsewhere.
// If `BottomTabs` was meant to be defined in this file, the structure would need adjustment.
import BottomTabs from "../components/BottomTabs"; // Assuming this is the correct path


export default function DiagnoseTab() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [debugMsg, setDebugMsg] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!imageFile) e.image = "Please add a photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onInitialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDebugMsg("✅ Starting analysis...");

    if (!validate()) {
      setDebugMsg("❌ Please add a photo");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      let uploadedImageUrl = "";

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
        uploadedImageUrl = uploadJson.imageUrl;
        const uploadTime = Date.now() - uploadStart;
        setDebugMsg(`✅ Image uploaded (${uploadTime}ms), creating case...`);
      }

      // Create case and generate questions
      setDebugMsg("❓ Creating case and generating questions...");
      const caseResp = await fetch("/api/diagnose/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "general health check",
          imageUrl: uploadedImageUrl,
        }),
      });

      if (!caseResp.ok) {
        const errorText = await caseResp.text();
        throw new Error(
          `Case creation failed: ${caseResp.status} - ${errorText}`,
        );
      }

      const caseJson = await caseResp.json();
      const caseId = caseJson.caseId;

      setDebugMsg("✅ Case created! Redirecting to questions...");
      navigate(`/questions/${caseId}`);

    } catch (err: any) {
      console.error("❌ Case creation error", err);
      setDebugMsg(`❌ Error: ${err.message}`);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to create case",
      }));
    } finally {
      setSubmitting(false);
    }
  }



  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      <header className="p-4 text-center bg-white border-b">
        <h1 className="font-bold">Dogtor AI</h1>
        <div className="text-sm text-gray-500 mt-1">Step 1 of 3</div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        <div className="space-y-6">{debugMsg && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700 text-sm">{debugMsg}</p>
            </div>
          )}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">Add photo</h2>
            <ImagePicker onChange={setImageFile} />
            {errors.image && (
              <p className="text-red-600 text-sm mt-2">{errors.image}</p>
            )}
          </div>

          <form onSubmit={onInitialSubmit} className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe any symptoms, behaviors, or concerns about your pet (optional)..."
              className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
            />

            {errors.submit && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">⚠️ Error</p>
                <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
                {errors.submit.includes("OpenAI") && (
                  <p className="text-red-500 text-xs mt-2">
                    Check your OpenAI API key in the Secrets tab or verify your account has available credits.
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full h-12 rounded-xl bg-black text-white disabled:opacity-50"
            >
              {submitting ? "Generating Questions..." : "Continue"}
            </button>
            {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
          </form>
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}