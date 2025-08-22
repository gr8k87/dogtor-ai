
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DynamicForm from "../components/DynamicForm";

interface BaseField {
  id: string;
  question: string;
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

interface TextboxField extends BaseField {
  type: 'text';
}

type FormQuestion = RadioField | CheckboxField | DropdownField | TextboxField;

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
    fetch(`/api/diagnose/questions/${caseId}`)
      .then(res => {
        if (res.status === 404) {
          // Questions not found, redirect back
          navigate("/");
          return null;
        }
        if (!res.ok) {
          throw new Error("Questions Generation Failed");
        }
        return res.json();
      })
      .then(data => {
        if (data) {
          setQuestions(data.questions || []);
          // If questions array is empty, treat as error
          if (!data.questions || data.questions.length === 0) {
            setError("Questions Generation Failed");
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Questions fetch error:", err);
        setError("Questions Generation Failed");
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

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
          <div className="text-sm text-gray-500 mt-1">Step 2 of 3</div>
        </header>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Questions Generation Failed</h3>
            <p className="text-red-700 text-sm mb-3">{error}</p>

            <div className="bg-white rounded-lg p-3 border border-red-200 mb-4">
              <h4 className="font-medium text-red-800 text-sm mb-2">Possible Solutions:</h4>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Check your OpenAI API key in Secrets tab</li>
                <li>• Verify OpenAI account has available credits</li>
                <li>• Try a clearer, well-lit photo of your pet</li>
                <li>• Ensure your pet is clearly visible in the image</li>
                <li>• Avoid photos with multiple pets or unclear subjects</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 h-12 rounded-xl border border-red-300 text-red-700 hover:bg-red-100"
              >
                ← Try Different Photo
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
      <header className="p-4 text-center">
        <h1 className="font-bold">Dogtor AI</h1>
        <div className="text-sm text-gray-500 mt-1">Step 2 of 3</div>
      </header>

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
    </div>
  );
}
