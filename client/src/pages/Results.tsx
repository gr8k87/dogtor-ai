
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

interface ResultsProps {}

export default function Results({}: ResultsProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const cards = location.state?.cards;

  if (!cards) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No results to display</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Back to Diagnose
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="p-4 text-center">
        <h1 className="font-bold">Dogtor AI</h1>
        <div className="text-sm text-gray-500 mt-1">Step 3 of 3</div>
      </header>

      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20">
        <div className="flex items-center mb-4">
          <button
            onClick={() => navigate("/")}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← New Diagnosis
          </button>
        </div>

        <div className="space-y-4">
          {/* Card 1: Diagnosis */}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">{cards.diagnosis?.title || "Diagnosis"}:</h2>
            <p className="mb-2">
              <b>Likely condition:</b> {cards.diagnosis?.likely_condition || "Analysis complete"}
            </p>
            {cards.diagnosis?.other_possibilities && (
              <>
                <p className="mb-1"><b>Other possibilities:</b></p>
                <ul className="text-sm mb-3">
                  {cards.diagnosis.other_possibilities.map((p: any, i: number) => (
                    <li key={i} className="ml-2">
                      • {p.name} ({p.likelihood} likelihood)
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cards.diagnosis?.urgency && (
              <>
                <p className="mb-1"><b>Urgency:</b></p>
                <p className="text-sm">
                  {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} Urgency — {cards.diagnosis.urgency.note}
                </p>
              </>
            )}
          </div>

          {/* Card 2: Care Tips */}
          {cards.care && (
            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold mb-2">{cards.care.title}:</h2>
              {cards.care.tips && (
                <ul className="space-y-2 mb-3">
                  {cards.care.tips.map((tip: any, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span>{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {cards.care.disclaimer && (
                <p className="text-xs text-gray-500 italic">{cards.care.disclaimer}</p>
              )}
            </div>
          )}

          {/* Card 3: Costs */}
          {cards.costs && (
            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold mb-2">{cards.costs.title}:</h2>
              {cards.costs.disclaimer && (
                <p className="text-xs text-gray-500 mb-3">{cards.costs.disclaimer}</p>
              )}
              {cards.costs.steps && (
                <ul className="space-y-3">
                  {cards.costs.steps.map((step: any, i: number) => (
                    <li key={i} className="border rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{step.name}</h3>
                            <span className="text-sm font-medium text-green-600">{step.cost}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{step.desc}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Likelihood: {step.likelihood}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation Tabs */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 px-4 text-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span>🏠</span>
              <span>Diagnose</span>
            </div>
          </button>
          <button
            onClick={() => navigate("/history")}
            className="flex-1 py-3 px-4 text-center text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span>📋</span>
              <span>History</span>
            </div>
          </button>
          <button
            className="flex-1 py-3 px-4 text-center text-sm font-medium text-blue-600 bg-blue-50"
          >
            <div className="flex flex-col items-center gap-1">
              <span>📊</span>
              <span>Results</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
