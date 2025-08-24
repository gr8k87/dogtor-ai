import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";
import BottomTabs from "../components/BottomTabs";
import { AppIcons } from "../assets/AppIcons"; // Assuming AppIcons are in this path
import ThemeToggle from "../components/ThemeToggle"; // Assuming ThemeToggle is in this path

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

  // Mock AppIcons and ThemeToggle if they are not available in the provided context
  // This is a placeholder and should be replaced with actual imports if available
  const mockAppIcons = {
    arrowLeft: ({ size, className }: { size: number, className: string }) => (
      <svg className={className} width={size} height={size} fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.41,16.58,10.83,12l4.58-4.59L14,7l-6,6,6,6,1.41-1.42Z"/>
      </svg>
    ),
    logo: ({ size, className }: { size: number, className: string }) => (
      <svg className={className} width={size} height={size} viewBox="0 0 32 32">
        {/* Placeholder for logo SVG */}
        <circle cx="16" cy="16" r="16" fill="currentColor"/>
      </svg>
    )
  };

  const mockThemeToggle = () => (
    <button className="p-2">Toggle Theme</button>
  );

  // Use actual imports if available, otherwise use mocks
  const ActualAppIcons = typeof AppIcons !== 'undefined' ? AppIcons : mockAppIcons;
  const ActualThemeToggle = typeof ThemeToggle !== 'undefined' ? ThemeToggle : mockThemeToggle;


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
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Loading Questions...</h2>
          <div className="text-sm text-gray-500">Step 2 of 3</div>
        </div>
      </div>
    );
  }

  // Show questions if available, or allow skipping if empty
  if (questions.length === 0 && !loading) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
          <div className="text-sm text-gray-500 mt-1">Step 2 of 3</div>
        </header>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ No Follow-up Questions</h3>
            <p className="text-yellow-700 text-sm mb-3">
              We couldn't generate specific follow-up questions, but we can still analyze your pet's image and symptoms.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 h-12 rounded-xl border border-yellow-300 text-yellow-700 hover:bg-yellow-100"
              >
                ← Try Different Photo
              </button>
              <button
                onClick={skipQuestions}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-yellow-600 text-white disabled:opacity-50 hover:bg-yellow-700"
              >
                {submitting ? "Analyzing..." : "Continue to Results"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
          <div className="text-sm text-gray-500 mt-1">Step 2 of 3</div>
        </header>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Error Loading Questions</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 h-12 rounded-xl border border-red-300 text-red-700 hover:bg-red-100"
              >
                ← Start Over
              </button>
              <button
                onClick={skipQuestions}
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-red-600 text-white disabled:opacity-50 hover:bg-red-700"
              >
                {submitting ? "Analyzing..." : "Skip to Results"}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ActualAppIcons.arrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <ActualAppIcons.logo size={32} className="text-primary" />
            <h1 className="text-xl font-bold">Dogtor AI</h1>
          </div>
          <ActualThemeToggle />
        </div>
      </header>

      {/* Progress Indicator */}
      <div className="border-b bg-background">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-8 h-0.5 bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-8 h-0.5 bg-muted"></div>
            <div className="w-3 h-3 rounded-full bg-muted"></div>
          </div>
          <div className="text-center mt-2">
            <span className="text-sm text-muted-foreground">Step 2 of 3</span>
          </div>
        </div>
      </div>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Follow-up Questions</h2>
          <p className="text-sm text-gray-600 mb-4">
            Please answer these questions to help improve the diagnosis:
          </p>

          <form onSubmit={handleSubmit}>
            <DynamicForm
              schema={questions}
              value={answers}
              onChange={setAnswers}
            />

            {error && (
              <p className="text-red-600 text-sm mt-2">{error}</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 h-12 rounded-xl bg-black text-white disabled:opacity-50 hover:bg-gray-800"
              >
                {submitting ? "Analyzing..." : "Get Results"}
              </button>
              <button
                type="button"
                onClick={skipQuestions}
                disabled={submitting}
                className="px-6 h-12 rounded-xl border border-gray-300 text-gray-700 disabled:opacity-50 hover:bg-gray-50"
              >
                Skip Questions
              </button>
            </div>
          </form>
        </div>
      </main>

      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}