import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../components/ImagePicker";
import { useHistory } from "../state/historyContext";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Skeleton, SkeletonCard } from "../components/ui/skeleton";
import { AppIcons, AlertCircle, Edit, ArrowRight } from "../components/icons";

import BottomTabs from "../components/BottomTabs";


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
    <div className="container max-w-2xl mx-auto p-4 space-y-6 relative">
      {/* Loading overlay */}
      {submitting && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="bg-card p-8 rounded-2xl shadow-elevated max-w-sm w-full mx-4">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Analyzing Your Pet</h3>
                <p className="text-sm text-muted-foreground">{debugMsg}</p>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full rounded-full" />
                <Skeleton className="h-2 w-3/4 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full transition-colors ${submitting ? 'bg-primary animate-pulse' : 'bg-primary'}`}></div>
          <span>Step 1</span>
        </div>
        <div className="w-4 h-px bg-border"></div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <span>Step 2</span>
        </div>
        <div className="w-4 h-px bg-border"></div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <span>Step 3</span>
        </div>
      </div>

      {/* Debug message */}
      {debugMsg && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-sm font-medium text-primary">{debugMsg}</p>
          </div>
        </div>
      )}

      {/* Photo upload section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AppIcons.camera size={20} className="text-primary" />
            Add Photo
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload a clear photo of your pet for accurate analysis
          </p>
        </div>
        
        <ImagePicker onChange={setImageFile} />
        {errors.image && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{errors.image}</p>
          </div>
        )}
      </div>

      {/* Notes section */}
      <form onSubmit={onInitialSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Edit size={20} className="text-primary" />
              Describe Symptoms
            </h2>
            <p className="text-sm text-muted-foreground">
              Tell us about any symptoms, behaviors, or concerns (optional)
            </p>
          </div>
          
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you've noticed about your pet's health..."
            className="min-h-[100px] resize-none"
            data-testid="textarea-symptoms"
          />
        </div>

        {/* Error message */}
        {errors.submit && (
          <div className="space-y-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Analysis Failed</p>
                <p className="text-sm text-destructive/80">{errors.submit}</p>
              </div>
            </div>
            {errors.submit.includes("OpenAI") && (
              <div className="p-3 rounded-md bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  💡 This might be due to API key issues or account credits. Check your OpenAI configuration in the Secrets tab.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="w-full h-12 text-base font-medium shadow-soft hover:shadow-medium transition-all duration-300 active:scale-95 disabled:hover:scale-100"
          data-testid="button-continue"
        >
          {submitting ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-5 h-5 border-2 border-current/30 rounded-full"></div>
              </div>
              <span className="animate-pulse">Analyzing your pet...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
              Continue Analysis
            </div>
          )}
        </Button>
      </form>
    </div>
  );
}