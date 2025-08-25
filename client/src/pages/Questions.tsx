import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import DynamicForm from "../components/DynamicForm";
import BottomTabs from "../components/BottomTabs";
import { AppIcons, ArrowLeft, ArrowRight, AlertCircle } from "../components/icons";

interface BaseField {
  id: string;
  question?: string;
  label?: string;
  required?: boolean;
}

interface RadioField extends BaseField {
  type: 'radio';
  options: string[];
}

interface CheckboxField extends BaseField {
  type: 'checkbox';
  options: string[];
}

interface DropdownField extends BaseField {
  type: 'dropdown';
  options: string[];
}



interface YesNoField extends BaseField {
  type: 'yesno';
}

interface SelectField extends BaseField {
  type: 'select';
  options: string[];
}

type FormQuestion = RadioField | CheckboxField | DropdownField | YesNoField | SelectField;

export default function Questions() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugMsg, setDebugMsg] = useState("");

  useEffect(() => {
    if (!caseId) {
      navigate("/");
      return;
    }

    // Fetch questions for this case
    console.log("🔍 Fetching questions for case:", caseId);

    fetch(`/api/diagnose/questions/${caseId}`)
      .then(async res => {
        console.log("📡 Questions API response status:", res.status);

        if (res.status === 404) {
          console.log("❌ Questions not found, redirecting home");
          navigate("/");
          return null;
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.log("❌ Questions API error:", errorText);
          throw new Error(`Questions API failed: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("📋 Raw questions response:", data);
        return data;
      })
      .then(data => {
        if (data) {
          console.log("✅ Questions data received:", data);
          const questions = data.questions || [];
          setQuestions(questions);

          console.log(`📊 Found ${questions.length} questions`);
          if (questions.length === 0) {
            console.log("ℹ️ No questions found, allowing skip to results");
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Questions fetch error:", err);
        setError(err.message || "Failed to load questions");
        setLoading(false);
      });
  }, [caseId, navigate]);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setDebugMsg("📋 Processing your answers...");

    try {
      setDebugMsg("🤖 Analyzing your pet's condition...");
      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          answers
        })
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
      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId })
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
      <div className="min-h-dvh flex flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <AppIcons.logo size={32} className="text-primary" />
              <h1 className="text-xl font-bold">Dogtor AI</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Loading Questions...</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Step 1</span>
                </div>
                <div className="w-4 h-px bg-border"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <span>Step 2</span>
                </div>
                <div className="w-4 h-px bg-border"></div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-muted"></div>
                  <span>Step 3</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show questions if available, or allow skipping if empty
  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-dvh flex flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <AppIcons.logo size={32} className="text-primary" />
              <h1 className="text-xl font-bold">Dogtor AI</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 overflow-y-auto">
          <div className="container max-w-2xl mx-auto p-4 space-y-6">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <span>Step 1</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Step 2</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <span>Step 3</span>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={24} className="text-amber-600" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-amber-800">No Follow-up Questions</h3>
                  <p className="text-amber-700 text-sm">
                    We couldn't generate specific follow-up questions, but we can still analyze your pet's image and symptoms.
                  </p>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
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
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <AppIcons.logo size={32} className="text-primary" />
              <h1 className="text-xl font-bold">Dogtor AI</h1>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 overflow-y-auto">
          <div className="container max-w-2xl mx-auto p-4 space-y-6">
            {/* Status indicator */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <span>Step 1</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive"></div>
                <span>Step 2</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <span>Step 3</span>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle size={24} className="text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <h3 className="font-semibold text-destructive">Error Loading Questions</h3>
                  <p className="text-destructive/80 text-sm">{error}</p>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
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
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <AppIcons.logo size={32} className="text-primary" />
            <h1 className="text-xl font-bold">Dogtor AI</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 overflow-y-auto">
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
                    <h3 className="text-lg font-semibold">Generating Results</h3>
                    <p className="text-sm text-muted-foreground">{debugMsg}</p>
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

          {/* Back button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2"
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-xl font-bold">Questions</h1>
          </div>

          {/* Animated Progress indicator */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>Step 1</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span>Step 2</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${submitting ? 'bg-primary animate-pulse' : 'bg-muted'}`}></div>
                <span>Step 3</span>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-2/3 transition-all duration-1000 ease-out"></div>
            </div>
          </div>

          {/* Questions form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <AppIcons.medical size={20} className="text-primary" />
                Follow-up Questions
              </h2>
              <p className="text-sm text-muted-foreground">
                Please answer these questions to help improve the diagnosis
              </p>
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
              <DynamicForm 
                schema={questions} 
                value={answers} 
                onChange={setAnswers} 
              />

              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <AlertCircle size={16} className="text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Enhanced Action buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={submitting}
                  className="flex-1 h-12 font-medium transition-all duration-300 hover:shadow-medium active:scale-95 disabled:hover:scale-100"
                  data-testid="button-skip"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">Analyzing...</span>
                    </div>
                  ) : "Skip Questions"}
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 font-medium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-soft hover:shadow-elevated transition-all duration-300 active:scale-95 disabled:hover:scale-100"
                  data-testid="button-submit"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span className="animate-pulse">Analyzing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      Get Results
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}