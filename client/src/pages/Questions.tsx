import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  HealthCard,
  HealthCardHeader,
  HealthCardTitle,
  HealthCardContent,
} from "../components/ui/health-card";
import { Skeleton } from "../components/ui/skeleton";
import DynamicForm from "../components/DynamicForm";
import BottomTabs from "../components/BottomTabs";
import { GlobalHeader } from "../components/GlobalHeader";
import {
  AppIcons,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from "../components/icons";
import { supabase } from "../lib/supabase";

interface BaseField {
  id: string;
  question?: string;
  label?: string;
  required?: boolean;
}

interface RadioField extends BaseField {
  type: "radio";
  options: string[];
}

interface CheckboxField extends BaseField {
  type: "checkbox";
  options: string[];
}

interface DropdownField extends BaseField {
  type: "dropdown";
  options: string[];
}

interface YesNoField extends BaseField {
  type: "yesno";
}

interface SelectField extends BaseField {
  type: "select";
  options: string[];
}

type FormQuestion =
  | RadioField
  | CheckboxField
  | DropdownField
  | YesNoField
  | SelectField;

export default function Questions() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState("");

  // Mock case data structure for demo mode
  const [caseData, setCaseData] = useState<any>(null);

  useEffect(() => {
    const fetchCaseData = async () => {
      if (!caseId) return;

      setLoading(true);
      setError("");

      try {
        // Check for demo mode
        const isDemoMode =
          sessionStorage.getItem("demo-mode") === "true" ||
          new URLSearchParams(window.location.search).get("demo") === "true" ||
          window.location.pathname.includes("/demo") ||
          caseId?.startsWith("demo-");

        let headers: HeadersInit = {};

        if (isDemoMode) {
          headers["x-demo-mode"] = "true";
        } else {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError || !session) {
            setError("Authentication required");
            return;
          }

          headers.Authorization = `Bearer ${session.access_token}`;
        }

        const response = await fetch(
          `/api/diagnose/cases/${caseId}${isDemoMode ? "?demo=true" : ""}`,
          {
            headers,
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            navigate("/");
          } else {
            const errorText = await response.text();
            throw new Error(
              `Failed to fetch case data: ${response.status} ${errorText}`,
            );
          }
          return;
        }

        const data = await response.json();
        setCaseData(data);
        setQuestions(data.questions || []);
      } catch (err: any) {
        console.error("Error fetching case data:", err);
        setError(err.message || "Failed to load case details.");
        navigate("/"); // Redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchCaseData();
  }, [caseId, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setDebugMsg("📋 Processing your answers...");

    try {
      setDebugMsg("🤖 Analyzing your pet's condition...");
      // Get Supabase session token first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // Check for demo mode
      const isDemoMode =
        sessionStorage.getItem("demo-mode") === "true" ||
        new URLSearchParams(window.location.search).get("demo") === "true" ||
        window.location.pathname.includes("/demo") ||
        caseId?.startsWith("demo-");

      if (isDemoMode) {
        setDebugMsg("✅ Demo analysis complete! Redirecting to results...");
        navigate(`/results/${caseId}`, {
          state: {
            cards: [
              { title: "Demo Result", description: "This is a demo analysis." },
            ],
          },
        });
        return;
      }

      if (sessionError || !session) {
        console.error("Authentication required for diagnosis");
        setError("Authentication required");
        return;
      }

      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // ✅ NEW AUTH METHOD
        },
        body: JSON.stringify({
          caseId,
          answers,
        }),
      });

      if (!response.ok) throw new Error("Failed to get results");

      setDebugMsg("✅ Analysis complete! Redirecting to results...");
      const data = await response.json();
      navigate(`/results/${caseId}`, { state: { cards: data.cards } });
    } catch (err: any) {
      console.error("Results submission error:", err);
      setError(err.message);
      setDebugMsg(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    setError(null);
    setDebugMsg("⚡ Skipping questions...");

    try {
      setDebugMsg("🤖 Generating results with initial information...");
      // Get Supabase session token first
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      // Check for demo mode
      const isDemoMode =
        sessionStorage.getItem("demo-mode") === "true" ||
        new URLSearchParams(window.location.search).get("demo") === "true" ||
        window.location.pathname.includes("/demo") ||
        caseId?.startsWith("demo-");

      if (isDemoMode) {
        setDebugMsg("✅ Demo analysis complete! Redirecting to results...");
        navigate(`/results/${caseId}`, {
          state: {
            cards: [
              { title: "Demo Result", description: "This is a demo analysis." },
            ],
          },
        });
        return;
      }

      if (sessionError || !session) {
        console.error("Authentication required for results");
        setError("Authentication required");
        setSubmitting(false);
        return;
      }

      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`, // ✅ ADD JWT TOKEN
        },
        body: JSON.stringify({ caseId }),
      });

      if (!response.ok) throw new Error("Failed to get results");

      setDebugMsg("✅ Analysis complete! Redirecting to results...");
      const data = await response.json();
      navigate(`/results/${caseId}`, { state: { cards: data.cards } });
    } catch (err: any) {
      console.error("Skip questions error:", err);
      setError(err.message);
      setDebugMsg(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-dvh flex flex-col gradient-hero">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Preparing Questions</h2>
              <p className="text-muted-foreground text-lg">
                Analyzing your pet's condition...
              </p>
              {/* Enhanced Progress indicator */}
              <div className="space-y-4 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary/60 transition-all duration-500"></div>
                    <span>Photo Upload</span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse scale-110 transition-all duration-500"></div>
                    <span className="font-medium text-primary">Questions</span>
                  </div>
                  <div className="flex-1 h-px bg-muted"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-muted transition-all duration-500"></div>
                    <span>Results</span>
                  </div>
                </div>
                <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-2/3 transition-all duration-1000 ease-out animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="diagnose" />
      </div>
    );
  }

  // Show questions if available, or allow skipping if empty
  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-dvh flex flex-col gradient-hero">
        <main className="flex-1 pb-24 overflow-y-auto">
          <div className="container max-w-2xl mx-auto p-6 space-y-8">
            {/* Enhanced Progress indicator */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/60 transition-all duration-500"></div>
                  <span>Your Pet’s Concerns</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary"></div>
                <div className="flex items-center gap-1 text-foreground">
                  <div className="w-3 h-3 rounded-full bg-primary transition-all duration-500"></div>
                  <span className="font-medium text-primary">
                    A Few More Questions
                  </span>
                </div>
                <div className="flex-1 h-px bg-muted"></div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-muted transition-all duration-500"></div>
                  <span>Guidance</span>
                </div>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-2/3 transition-all duration-1000 ease-out"></div>
              </div>
            </div>

            <HealthCard
              colorIndex={2}
              className="border-accent gradient-card rounded-2xl shadow-elevated"
            >
              <HealthCardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={24} className="text-amber-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-amber-800">
                      Follow-Up Questions Needed
                    </h3>
                    <p className="text-amber-700 text-sm">
                      We didn’t identify any additional questions for this case.
                      Don’t worry — we can still analyze your pet’s photo and
                      notes to provide guidance.
                    </p>

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="default"
                        onClick={() => navigate("/")}
                        className="flex-1"
                        data-testid="button-try-different"
                      >
                        <ArrowLeft size={16} className="mr-2" />
                        Try Different Photo
                      </Button>
                      <Button
                        onClick={handleSkip}
                        disabled={submitting}
                        className="flex-1"
                        data-testid="button-continue-results"
                      >
                        {submitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            Analyzing...
                          </div>
                        ) : (
                          <>
                            Continue to Results
                            <ArrowRight size={16} className="ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </HealthCardContent>
            </HealthCard>
          </div>
        </main>
        <BottomTabs navigate={navigate} activeTab="diagnose" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col bg-background">
        <GlobalHeader />

        <main className="flex-1 pb-20 overflow-y-auto">
          <div className="container max-w-2xl mx-auto p-4 space-y-6">
            {/* Enhanced Progress indicator */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-primary/60 transition-all duration-500"></div>
                  <span>Your Pet’s Concerns</span>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-destructive"></div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-destructive transition-all duration-500"></div>
                  <span className="font-medium text-primary">
                    A Few More Questions
                  </span>
                </div>
                <div className="flex-1 h-px bg-muted"></div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-muted transition-all duration-500"></div>
                  <span>Guidance</span>
                </div>
              </div>
              <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/60 to-destructive rounded-full w-2/3 transition-all duration-1000 ease-out"></div>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle
                  size={24}
                  className="text-destructive flex-shrink-0 mt-0.5"
                />
                <div className="space-y-3">
                  <h3 className="font-semibold text-destructive">
                    Error Loading Questions
                  </h3>
                  <p className="text-destructive/80 text-sm">{error}</p>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="default"
                      onClick={() => navigate("/")}
                      className="flex-1"
                      data-testid="button-start-over"
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Start Over
                    </Button>
                    <Button
                      onClick={handleSkip}
                      disabled={submitting}
                      variant="destructive"
                      className="flex-1"
                      data-testid="button-skip-results"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          Analyzing...
                        </div>
                      ) : (
                        <>
                          Skip to Results
                          <ArrowRight size={16} className="ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col gradient-hero">
      <GlobalHeader title="Questions" />

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
                      Generating Results
                    </h3>
                  </div>
                  <div className="space-y-2">
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full animate-pulse"></div>
                    </div>
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
                <div className="w-3 h-3 rounded-full bg-primary/60 transition-all duration-500"></div>
                <span>Your Pet’s Concerns</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary transition-all duration-500"></div>
                <span className="font-medium text-primary">
                  A Few More Questions
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary to-muted"></div>
              <div className="flex items-center gap-1">
                <div
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${submitting ? "bg-primary animate-pulse scale-110" : "bg-muted"}`}
                ></div>
                <span className={submitting ? "font-medium text-primary" : ""}>
                  Guidance
                </span>
              </div>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-1000 ease-out ${submitting ? "w-full animate-pulse" : "w-2/3"}`}
              ></div>
            </div>
          </div>

          {/* Questions form */}
          <HealthCard
            colorIndex={2}
            className="border-accent gradient-card rounded-2xl shadow-elevated"
          >
            <HealthCardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-foreground text-xl font-semibold flex items-center gap-3">
                    <AppIcons.medical size={24} className="text-primary" />A Few
                    More Questions
                  </h2>
                  <p className="text-muted-foreground">
                    Just a few quick questions to help us understand your pet’s
                    concern more clearly
                  </p>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  className="space-y-6"
                >
                  <DynamicForm
                    schema={questions}
                    value={answers}
                    onChange={setAnswers}
                  />

                  {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <AlertCircle
                        size={16}
                        className="text-destructive mt-0.5 flex-shrink-0"
                      />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* Enhanced Action buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="default"
                      onClick={handleSkip}
                      disabled={submitting}
                      className="flex-1 h-14 font-semibold text-lg rounded-2xl transition-all duration-300 hover:shadow-medium active:scale-95 disabled:hover:scale-100"
                      data-testid="button-skip"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="animate-pulse">Analyzing...</span>
                        </div>
                      ) : (
                        "Skip Questions"
                      )}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 h-14 font-semibold text-lg rounded-2xl cta-enhanced transition-all duration-300 active:scale-95 disabled:hover:scale-100"
                      data-testid="button-submit"
                    >
                      {submitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                          <span className="animate-pulse">Analyzing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 group">
                          <ArrowRight
                            size={20}
                            className="transition-transform group-hover:translate-x-2"
                          />
                          Get Advice
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </HealthCardContent>
          </HealthCard>
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}
