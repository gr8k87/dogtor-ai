
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useHistory } from "../state/historyContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

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
  const { addCase } = useHistory();
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
      setCards(stateCards);
      
      // Save to history
      const historyEntry = {
        id: caseId,
        timestamp: new Date().toISOString(),
        diagnosis: stateCards.diagnosis?.likely_condition || "Analysis complete",
        urgency: stateCards.diagnosis?.urgency?.level || "Unknown"
      };
      addCase(historyEntry);
      
      setLoading(false);
      return;
    }

    // Otherwise fetch results from API
    console.log("🔍 Fetching results for case:", caseId);
    
    fetch(`/api/diagnose/results/${caseId}`)
      .then(async res => {
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
      .then(data => {
        if (data?.cards) {
          console.log("✅ Results data received:", data.cards);
          setCards(data.cards);
          
          // Save to history
          const historyEntry = {
            id: caseId,
            timestamp: new Date().toISOString(),
            diagnosis: data.cards.diagnosis?.likely_condition || "Analysis complete",
            urgency: data.cards.diagnosis?.urgency?.level || "Unknown"
          };
          addCase(historyEntry);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Results fetch error:", err);
        setError(err.message || "Failed to load results");
        setLoading(false);
      });
  }, [caseId, location.state, navigate, addCase]);

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
              <CardTitle className="text-red-800">⚠️ Error Loading Results</CardTitle>
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
              <strong>Likely condition:</strong> {cards.diagnosis.likely_condition}
            </p>
            <div>
              <p className="font-medium mb-1">Other possibilities:</p>
              <ul className="text-sm space-y-1">
                {cards.diagnosis.other_possibilities.map((p: any, i: number) => (
                  <li key={i} className="ml-2">
                    • {p.name} ({p.likelihood} likelihood)
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium mb-1">Urgency:</p>
              <p className="text-sm">
                {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} Urgency — {cards.diagnosis.urgency.note}
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
