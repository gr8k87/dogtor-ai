
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";
import BottomTabs from "../components/BottomTabs";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";

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
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">ℹ️ No Follow-up Questions</CardTitle>
              <CardDescription className="text-yellow-700">
                We couldn't generate specific follow-up questions, but we can still analyze your pet's image and symptoms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                >
                  ← Try Different Photo
                </Button>
                <Button
                  onClick={skipQuestions}
                  disabled={submitting}
                  className="flex-1 bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  {submitting ? "Analyzing..." : "Continue to Results"}
                </Button>
              </div>
            </CardContent>
          </Card>
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
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">⚠️ Error Loading Questions</CardTitle>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-100"
                >
                  ← Start Over
                </Button>
                <Button
                  onClick={skipQuestions}
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white hover:bg-red-700"
                >
                  {submitting ? "Analyzing..." : "Skip to Results"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="p-4 text-center">
        <h1 className="font-bold">Dogtor AI</h1>
        <div className="text-sm text-gray-500 mt-1">Step 2 of 3</div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Follow-up Questions</CardTitle>
            <CardDescription>
              Please answer these questions to help improve the diagnosis:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <DynamicForm 
                schema={questions} 
                value={answers} 
                onChange={setAnswers} 
              />

              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1"
                  size="lg"
                >
                  {submitting ? "Analyzing..." : "Get Results"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={skipQuestions}
                  disabled={submitting}
                  size="lg"
                >
                  Skip Questions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      
      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}
