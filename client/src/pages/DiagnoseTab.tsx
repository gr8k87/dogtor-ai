import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImagePicker from "../components/ImagePicker";
import { useHistory } from "../state/historyContext";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Skeleton, SkeletonCard } from "../components/ui/skeleton";
import { AppIcons, AlertCircle, Edit, ArrowRight } from "../components/icons";
import { HealthCard, HealthCardContent } from "../components/ui/health-card";
import BottomTabs from "../components/BottomTabs";
import { supabase } from "../lib/supabase";
import { useDogName } from "../lib/hooks";
import { apiRequest } from "../lib/api";

export default function DiagnoseTab() {
  const [imageUrl, setImageUrl] = useState<string | null>(null); // Changed from imageFile
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [debugMsg, setDebugMsg] = useState("");
  const dogName = useDogName();

  function validate() {
    const e: Record<string, string> = {};
    if (!imageUrl) e.image = "Please add a photo"; // Changed from imageFile
    if (!notes.trim()) e.notes = "Please describe what you've noticed";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onInitialSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDebugMsg("✅ Starting analysis...");

    if (!validate()) {
      setDebugMsg("❌ Please add a photo and describe what you've noticed");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Check if we're in demo mode
      const isDemoMode =
        new URLSearchParams(window.location.search).get("demo") === "true" ||
        window.location.pathname.includes("/demo");

      let headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (isDemoMode) {
        headers["x-demo-mode"] = "true";
      } else {
        // Get Supabase session token for authenticated users
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          throw new Error("Authentication required");
        }

        headers.Authorization = `Bearer ${session.access_token}`;
      }

      const caseResp = await apiRequest(
        `/api/diagnose/cases${isDemoMode ? "?demo=true" : ""}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({
            symptoms: notes || "general health check",
            imageUrl: imageUrl,
          }),
        },
      );

      if (!caseResp.ok) {
        const errorText = await caseResp.text();
        throw new Error(
          `Case creation failed: ${caseResp.status} - ${errorText}`,
        );
      }

      const caseJson = await caseResp.json();
      let caseId = caseJson.caseId;

      // Prefix with "demo-" if in demo mode
      if (isDemoMode) {
        caseId = `demo-${caseId}`;
      }

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
    <div className="min-h-dvh flex flex-col gradient-hero">
      <main className="flex-1 pb-24 overflow-y-auto">
        <div className="container max-w-2xl mx-auto p-6 space-y-8 relative">
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
                    <h3 className="text-lg font-semibold">
                      Taking a Closer Look…
                    </h3>
                    {/* <p className="text-sm text-muted-foreground">{debugMsg}</p>{" "} */}
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-2 w-full rounded-full" />
                    <Skeleton className="h-2 w-3/4 rounded-full mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Progress indicator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${submitting ? "bg-primary animate-pulse scale-110" : "bg-primary"}`}
                ></div>
                <span className="font-medium">Your Pet’s Concerns</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary to-muted"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted transition-all duration-500"></div>
                <span>A Few More Questions</span>
              </div>
              <div className="flex-1 h-px bg-muted"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-muted transition-all duration-500"></div>
                <span>Guidance</span>
              </div>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out ${submitting ? "w-1/3 animate-pulse" : "w-1/3"}`}
              ></div>
            </div>
          </div>

          {/* Enhanced Photo upload section */}
          <HealthCard
            colorIndex={2}
            className="border-accent gradient-card transition-smooth hover:shadow-elevated"
          >
            <HealthCardContent className="p-0">
              <div className="space-y-1">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
                    <AppIcons.camera
                      size={20}
                      className="text-primary flex-shrink-0"
                    />
                    <span className="flex-shrink-0">
                      What's worrying you about{" "}
                      <span className="text-[#FF5A5F]">{dogName}</span>?
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Upload a photo of the affected area.
                  </p>
                </div>

                <ImagePicker
                  onChange={setImageUrl} // Changed to setImageUrl
                  className="mb-0"
                />
                {errors.image && (
                  <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 transition-smooth">
                    <AlertCircle
                      size={14}
                      className="text-destructive mt-0.5 flex-shrink-0"
                    />
                    <p className="text-xs text-destructive">{errors.image}</p>
                  </div>
                )}
              </div>
            </HealthCardContent>
          </HealthCard>

          {/* Enhanced Notes section */}
          <form onSubmit={onInitialSubmit} className="space-y-8">
            <HealthCard
              colorIndex={2}
              className="border-accent gradient-card transition-smooth hover:shadow-elevated"
            >
              <HealthCardContent className="p-0">
                <div className="space-y-1">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 flex-wrap">
                      <Edit size={20} className="text-primary flex-shrink-0" />
                      <span className="flex-shrink-0">
                        What have you noticed about{" "}
                        <span className="text-[#FF5A5F]">{dogName}</span>?
                      </span>
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Describe any changes in{" "}
                      <span className="text-[#FF5A5F]">{dogName}</span>'s health
                      or behavior. Even small details can help.
                    </p>
                  </div>

                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Red bump on paw, started yesterday. Dog keeps licking it."
                    className="min-h-[80px] resize-none transition-smooth focus:shadow-medium"
                    data-testid="textarea-symptoms"
                  />
                  {errors.notes && (
                    <div className="flex items-start gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20 transition-smooth">
                      <AlertCircle
                        size={14}
                        className="text-destructive mt-0.5 flex-shrink-0"
                      />
                      <p className="text-xs text-destructive">{errors.notes}</p>
                    </div>
                  )}
                </div>
              </HealthCardContent>
            </HealthCard>

            {/* Error message */}
            {errors.submit && (
              <HealthCard
                colorIndex={2}
                className="border-destructive/20 bg-destructive/5 transition-smooth"
              >
                <HealthCardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle
                        size={16}
                        className="text-destructive mt-0.5 flex-shrink-0"
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-destructive">
                          Analysis Failed
                        </p>
                        <p className="text-sm text-destructive/80">
                          {errors.submit}
                        </p>
                      </div>
                    </div>
                    {errors.submit.includes("OpenAI") && (
                      <div className="p-3 rounded-md bg-muted/50">
                        <p className="text-xs text-muted-foreground">
                          💡 This might be due to API key issues or account
                          credits. Check your OpenAI configuration in the
                          Secrets tab.
                        </p>
                      </div>
                    )}
                  </div>
                </HealthCardContent>
              </HealthCard>
            )}

            {/* Enhanced Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              size="lg"
              className="w-full h-14 text-lg font-semibold cta-enhanced transition-all duration-300 active:scale-95 disabled:hover:scale-100"
              data-testid="button-continue"
            >
              {submitting ? (
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-6 h-6 border-3 border-current/30 rounded-full"></div>
                  </div>
                  <span className="animate-pulse">Analyzing your pet...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <ArrowRight
                    size={24}
                    className="transition-transform group-hover:translate-x-2"
                  />
                  <span>Keep Going</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </main>
      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}
