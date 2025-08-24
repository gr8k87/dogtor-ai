
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";
import BottomTabs from "../components/BottomTabs";
import { Button } from "../components/ui/button";
import { AppIcons, ArrowRight, ArrowLeft, AlertCircle } from "../components/icons";

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
  const [error, setError] = useState<string>("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          answers
        })
      });

      if (!response.ok) throw new Error("Failed to get results");

      const data = await response.json();
      navigate(`/results/${caseId}`, { state: { cards: data.cards } });
    } catch (err: any) {
      console.error("Results submission error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function skipQuestions() {
    setSubmitting(true);

    try {
      const response = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId })
      });

      if (!response.ok) throw new Error("Failed to get results");

      const data = await response.json();
      navigate(`/results/${caseId}`, { state: { cards: data.cards } });
    } catch (err: any) {
      console.error("Skip questions error:", err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

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
                      onClick={skipQuestions}
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
                      onClick={skipQuestions}
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

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="flex-1 h-12 text-base font-medium shadow-md hover:shadow-lg transition-all"
                  data-testid="button-get-results"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ArrowRight size={20} />
                      Get Results
                    </div>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipQuestions}
                  disabled={submitting}
                  size="lg"
                  className="px-6 h-12"
                  data-testid="button-skip-questions"
                >
                  Skip Questions
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
