
import React, { useState } from "react";
import ImagePicker from "../components/ImagePicker";
import DynamicForm from "../components/DynamicForm";
import { useHistory } from "../state/historyContext";

interface DiagnoseTabProps {
  onResultsReady: (cards: any) => void;
}

export default function DiagnoseTab({ onResultsReady }: DiagnoseTabProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [step, setStep] = useState<"initial" | "questions" | "results">("initial");
  const [imageUrl, setImageUrl] = useState<string>("");
  const { addEntry } = useHistory();
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
        setImageUrl(uploadedImageUrl);
        const uploadTime = Date.now() - uploadStart;
        setDebugMsg(`✅ Image uploaded (${uploadTime}ms), generating questions...`);
      }

      // Generate questions
      setDebugMsg("❓ Generating questions...");
      const questionsResp = await fetch("/api/diagnose/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "general health check",
          imageUrl: uploadedImageUrl,
        }),
      });

      if (!questionsResp.ok) {
        const errorText = await questionsResp.text();
        throw new Error(
          `Questions generation failed: ${questionsResp.status} - ${errorText}`,
        );
      }

      const questionsJson = await questionsResp.json();
      setQuestions(questionsJson.questions || []);
      setStep("questions");
      setDebugMsg("✅ Questions generated! Please answer to continue.");
      
    } catch (err: any) {
      console.error("❌ Questions generation error", err);
      setDebugMsg(`❌ Questions error: ${err.message}`);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Failed to generate questions",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  async function onQuestionsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setDebugMsg("🔍 Final analysis...");

    try {
      const resp = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "general health check",
          imageUrl,
          answers,
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Results request failed: ${resp.status} - ${errorText}`,
        );
      }

      const j = await resp.json();
      
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

      addEntry({
        form: { notes, answers },
        triage: j.cards,
      });

      onResultsReady(j.cards);
      
    } catch (err: any) {
      console.error("❌ Final analysis error", err);
      setDebugMsg(`❌ Error: ${err.message}`);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Something went wrong",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  async function skipToResults() {
    setSubmitting(true);
    setDebugMsg("⏭️ Skipping to results...");

    try {
      const resp = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "general health check",
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
      setDebugMsg("✅ Analysis complete!");

      addEntry({
        form: { notes },
        triage: j.cards,
      });

      onResultsReady(j.cards);
      
    } catch (err: any) {
      console.error("❌ Skip to results error", err);
      setDebugMsg(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "questions") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Follow-up Questions</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please answer these questions to help improve the diagnosis:
          </p>
          
          <form onSubmit={onQuestionsSubmit}>
            <DynamicForm 
              schema={questions} 
              value={answers} 
              onChange={setAnswers} 
            />
            
            {errors.submit && (
              <p className="text-red-600 text-sm mt-2">{errors.submit}</p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-black text-white disabled:opacity-50"
              >
                {submitting ? "Analyzing..." : "Get Results"}
              </button>
              <button
                type="button"
                onClick={skipToResults}
                disabled={submitting}
                className="px-6 h-12 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50"
              >
                Skip Questions
              </button>
            </div>
          </form>
          
          {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
        </div>
      </div>
    );
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

      <form onSubmit={onInitialSubmit} className="rounded-2xl border p-4">
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
          {submitting ? "Generating Questions..." : "Continue"}
        </button>
        {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
      </form>
    </div>
  );
}
