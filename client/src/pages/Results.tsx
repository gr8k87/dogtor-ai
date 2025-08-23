
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

/**
 * Simplified sanitization approach: Convert complex nested structures to simple strings.
 * This eliminates any possibility of React elements surviving in the data structure.
 */
function sanitize(value: any): any {
  // Nullish values become empty strings
  if (value === null || value === undefined) return "";

  // Primitive types: convert to clean strings
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
      .replace(/<[^>]*>/g, "") // Remove HTML/JSX tags
      .replace(/\{[^}]*\}/g, "") // Remove JSX expressions
      .trim();
  }

  // Arrays: flatten to simple string arrays
  if (Array.isArray(value)) {
    return value.map(item => {
      if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
        return String(item).replace(/<[^>]*>/g, "").replace(/\{[^}]*\}/g, "").trim();
      }

      // For objects in arrays, flatten to descriptive strings
      if (typeof item === "object" && item !== null) {
        // Common patterns for our data structure
        if (item.name && item.likelihood) {
          return `${sanitize(item.name)} (${sanitize(item.likelihood)} likelihood)`;
        }
        if (item.icon && item.text) {
          return `${sanitize(item.icon)} ${sanitize(item.text)}`;
        }
        if (item.icon && item.name && item.likelihood && item.desc && item.cost) {
          return `${sanitize(item.icon)} ${sanitize(item.name)} - ${sanitize(item.likelihood)} | ${sanitize(item.desc)} | ${sanitize(item.cost)}`;
        }

        // Generic object flattening - concatenate all string values
        const values = Object.values(item)
          .filter(v => v !== null && v !== undefined)
          .map(v => sanitize(v))
          .filter(v => v && v.trim());
        return values.join(" ");
      }

      return String(item);
    }).filter(item => item && item.trim());
  }

  // Objects: sanitize each property, but flatten arrays within objects
  if (typeof value === "object") {
    const result: any = {};
    for (const key of Object.keys(value)) {
      const propertyValue = value[key];
      result[key] = sanitize(propertyValue);
    }
    return result;
  }

  // Fallback: convert to string
  return String(value).replace(/<[^>]*>/g, "").replace(/\{[^}]*\}/g, "").trim();
}

interface DiagnosisCard {
  title: string;
  likely_condition: string;
  other_possibilities: string[]; // Simplified to string array
  urgency: {
    badge: string;
    level: string;
    note: string;
  };
}

interface CareCard {
  title: string;
  tips: string[]; // Simplified to string array
  disclaimer: string;
}

interface CostsCard {
  title: string;
  disclaimer: string;
  steps: string[]; // Simplified to string array
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
      const cleanCards = sanitize(stateCards);
      setCards(cleanCards);

      // Save to history
      const historyEntry = {
        form: { symptoms: "Analysis completed" },
        triage: {
          diagnosis: cleanCards.diagnosis?.likely_condition || "Analysis complete",
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
          const clean = sanitize(data.cards);
          setCards(clean);

          // Save to history
          const historyEntry = {
            form: { symptoms: "Analysis completed" },
            triage: {
              diagnosis: clean.diagnosis?.likely_condition || "Analysis complete",
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

  // Safely render arrays of strings
  const renderStringArray = (items: any[], className = "") => {
    if (!Array.isArray(items)) return null;
    
    return items.map((item, index) => {
      // Ensure item is a string
      const displayText = typeof item === "string" ? item : String(item);
      return (
        <li key={index} className={className}>
          {displayText}
        </li>
      );
    });
  };

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
            <CardTitle>{String(cards.diagnosis?.title || "Diagnosis")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p>
              <strong>Likely condition:</strong> {String(cards.diagnosis?.likely_condition || "")}
            </p>
            <div>
              <p className="font-medium mb-1">Other possibilities:</p>
              <ul className="text-sm space-y-1">
                {renderStringArray(cards.diagnosis?.other_possibilities || [], "ml-2")}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Urgency:</p>
              <p className="text-sm">
                {String(cards.diagnosis?.urgency?.badge || "")} {String(cards.diagnosis?.urgency?.level || "")} — {String(cards.diagnosis?.urgency?.note || "")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: General Care Tips */}
        <Card>
          <CardHeader>
            <CardTitle>{String(cards.care?.title || "Care Tips")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {renderStringArray(cards.care?.tips || [])}
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              {String(cards.care?.disclaimer || "")}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Vet Procedures & Costs */}
        <Card>
          <CardHeader>
            <CardTitle>{String(cards.costs?.title || "Procedures & Costs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500 mb-3">
              {String(cards.costs?.disclaimer || "")}
            </p>
            <ul className="space-y-3 text-sm">
              {renderStringArray(cards.costs?.steps || [])}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
