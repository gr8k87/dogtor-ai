
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../components/ImagePicker";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

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
    <div className="min-h-screen bg-background pb-20">
      <div className="p-4 space-y-4">
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground mb-6">Pet Health Diagnosis</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add photo</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePicker onChange={setImageFile} />
            {errors.image && (
              <p className="text-red-600 text-sm mt-2">{errors.image}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onInitialSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Describe any symptoms, behaviors, or concerns about your pet (optional)</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe any symptoms, behaviors, or concerns about your pet (optional)..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                />
              </div>

              {errors.submit && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6">
                    <p className="text-red-700 text-sm font-medium">⚠️ Error</p>
                    <p className="text-red-600 text-sm mt-1">{errors.submit}</p>
                    {errors.submit.includes("OpenAI") && (
                      <p className="text-red-500 text-xs mt-2">
                        Check your OpenAI API key in the Secrets tab or verify your account has available credits.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12"
                size="lg"
              >
                {submitting ? "Generating Questions..." : "Continue"}
              </Button>
              
              {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
