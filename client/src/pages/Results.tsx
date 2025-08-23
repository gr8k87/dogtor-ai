import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useHistory } from "../state/historyContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

/*
 * Helper utilities to ensure that any data passed to React components
 * is converted into primitives. React will throw an error if an object
 * (including a React element) is rendered directly as a child. See
 * React’s documentation on the invariant “Objects are not valid as a
 * React child”【937151002077259†L168-L182】. To avoid this, we
 * convert all values to strings using `toSafeString` and then
 * recursively normalise entire objects/arrays via `sanitize`. The
 * `React.isValidElement` check identifies values that are actually
 * React elements【673308173346315†L187-L203】, and we return a
 * placeholder string or extract simple textual children where
 * possible. These functions should be used before storing API
 * responses in state or rendering them.
 */

// Detect objects that look like React elements by checking for the $$typeof key.
// Sometimes values returned from AI may mimic React elements without passing
// React.isValidElement. This helper treats any object with $$typeof as a
// React element-like object.
function isReactElementLike(value: unknown): value is { props?: any } {
  return (
    typeof value === "object" && value !== null && !!(value as any).$$typeof
  );
}

/**
 * Recursively convert an arbitrary value into a form that React can render safely.
 *
 * - Strings, numbers and booleans are returned as strings.
 * - React elements (or objects with $$typeof) are flattened to the text of
 *   their children if possible; otherwise a placeholder string is returned.
 * - Arrays are sanitized item-by-item (preserving their structure).
 * - Plain objects are sanitized field-by-field (preserving their structure).
 * - Any other type is coerced to a string via JSON.stringify or String().
 *
 * This ensures that nested values like `p.name`, `t.text`, `s.desc`, etc., cannot
 * accidentally contain React element objects, preventing the "Objects are not
 * valid as a React child" error.【207238956757809†L214-L230】【358190641072674†L228-L275】
 */
function sanitize(value: any): any {
  // Nullish values become empty strings
  if (value === null || value === undefined) return "";

  // Primitive types: convert booleans/numbers to strings
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  // React element (or element-like): attempt to extract simple textual children
  if (isReactElementLike(value) || React.isValidElement(value)) {
    const element = value as any;
    const child = element.props?.children;
    // If the child is a primitive, use it directly
    if (typeof child === "string" || typeof child === "number") {
      return String(child);
    }
    // If the child is an array, sanitize each item and join without separators
    if (Array.isArray(child)) {
      return child.map((v: any) => sanitize(v)).join("");
    }
    // If the child is something else (e.g., another element or object), fall back
    // to a placeholder to indicate a React element was encountered
    return "[react-element]";
  }

  // Arrays: sanitize each element recursively, preserving array structure
  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  // Plain objects: sanitize each property recursively, preserving object keys
  if (typeof value === "object") {
    const result: any = {};
    for (const key of Object.keys(value)) {
      result[key] = sanitize(value[key]);
    }
    return result;
  }

  // Fallback: attempt JSON stringify, or default to String()
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

interface DiagnosisCard {
  title: string;
  likely_condition: string;
  other_possibilities: Array<{
    name: string;
    likelihood: string;
  }>;
  urgency: {
    badge: string;
    level: string;
    note: string;
  };
}

interface CareCard {
  title: string;
  tips: Array<{
    icon: string;
    text: string;
  }>;
  disclaimer: string;
}

interface CostsCard {
  title: string;
  disclaimer: string;
  steps: Array<{
    icon: string;
    name: string;
    likelihood: string;
    desc: string;
    cost: string;
  }>;
}

interface ResultCards {
  diagnosis: DiagnosisCard;
  care: CareCard;
  costs: CostsCard;
}

export default function Results() {
  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { addEntry } = useHistory();
  const [cards, setCards] = useState<ResultCards | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!caseId) {
      navigate("/");
      return;
    }

    // Check if we have results passed via navigation state
    const stateCards = location.state?.cards;
    if (stateCards) {
      console.log("✅ Using results from navigation state");
      // Sanitize once and reuse
      const cleanCards = sanitize(stateCards);
      setCards(cleanCards);

      // Save to history
      const historyEntry = {
        form: { symptoms: "Analysis completed" },
        triage: {
          diagnosis:
            cleanCards.diagnosis?.likely_condition || "Analysis complete",
          urgency: cleanCards.diagnosis?.urgency?.level || "Unknown",
        },
      };
      addEntry(historyEntry);

      setLoading(false);
      return;
    }

    // Otherwise fetch results from API
    console.log("🔍 Fetching results for case:", caseId);

    fetch(`/api/diagnose/results/${caseId}`)
      .then(async (res) => {
        console.log("📡 Results API response status:", res.status);

        if (res.status === 404) {
          console.log("❌ Results not found, redirecting home");
          navigate("/");
          return null;
        }

        if (!res.ok) {
          const errorText = await res.text();
          console.log("❌ Results API error:", errorText);
          throw new Error(`Results API failed: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        console.log("📋 Raw results response:", data);
        return data;
      })
      .then((data) => {
        if (data?.cards) {
          console.log("✅ Results data received:", data.cards);
          // Sanitize once and reuse
          const clean = sanitize(data.cards);
          setCards(clean);

          // Save to history
          const historyEntry = {
            form: { symptoms: "Analysis completed" },
            triage: {
              diagnosis:
                clean.diagnosis?.likely_condition || "Analysis complete",
              urgency: clean.diagnosis?.urgency?.level || "Unknown",
            },
          };
          addEntry(historyEntry);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Results fetch error:", err);
        setError(err.message || "Failed to load results");
        setLoading(false);
      });
  }, [caseId, location.state, navigate, addEntry]);

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Analyzing Results...</h2>
          <div className="text-sm text-gray-500">Step 3 of 3</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
          <div className="text-sm text-gray-500 mt-1">Step 3 of 3</div>
        </header>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">
                ⚠️ Error Loading Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                ← Start Over
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!cards) {
    return (
      <div className="min-h-dvh flex flex-col">
        <header className="p-4 text-center">
          <h1 className="font-bold">Dogtor AI</h1>
          <div className="text-sm text-gray-500 mt-1">Step 3 of 3</div>
        </header>

        <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
          <Card>
            <CardContent className="text-center p-6">
              <p className="text-gray-500">No results to display</p>
              <Button
                onClick={() => navigate("/")}
                className="mt-4"
                variant="outline"
              >
                Back to Diagnose
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <header className="p-4 text-center">
        <h1 className="font-bold">Dogtor AI</h1>
        <div className="text-sm text-gray-500 mt-1">Step 3 of 3</div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 p-0"
          >
            ← Back to Diagnose
          </Button>
        </div>

        {/* Card 1: Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle>{cards.diagnosis.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Likely condition:</strong>{" "}
              {cards.diagnosis.likely_condition}
            </p>
            <div>
              <p className="font-medium mb-1">Other possibilities:</p>
              <ul className="text-sm space-y-1">
                {cards.diagnosis.other_possibilities.map(
                  (p: any, i: number) => (
                    <li key={i} className="ml-2">
                      • {p.name} ({p.likelihood} likelihood)
                    </li>
                  ),
                )}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Urgency:</p>
              <p className="text-sm">
                {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level}{" "}
                — {cards.diagnosis.urgency.note}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: General Care Tips */}
        <Card>
          <CardHeader>
            <CardTitle>{cards.care.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {cards.care.tips.map((t: any, i: number) => (
                <li key={i}>
                  {t.icon} {t.text}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              {cards.care.disclaimer}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Vet Procedures & Costs */}
        <Card>
          <CardHeader>
            <CardTitle>{cards.costs.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              {cards.costs.disclaimer}
            </p>
            <ul className="space-y-3 text-sm">
              {cards.costs.steps.map((s: any, i: number) => (
                <li key={i} className="space-y-1">
                  <div>
                    {s.icon} <strong>{s.name}</strong> – {s.likelihood}
                  </div>
                  <div className="text-gray-600">{s.desc}</div>
                  <div className="font-medium">{s.cost}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
