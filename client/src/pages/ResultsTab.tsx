
import React from "react";

interface ResultsTabProps {
  cards: any;
  onBack: () => void;
}

export default function ResultsTab({ cards, onBack }: ResultsTabProps) {
  if (!cards) {
    return (
      <div className="text-center p-6">
        <p className="text-gray-500">No results to display</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-200 rounded-lg"
        >
          Back to Diagnose
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Diagnose
        </button>
      </div>

      {/* Card 1: Diagnosis */}
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">{cards.diagnosis.title}:</h2>
        <p className="mb-2">
          <b>Likely condition:</b> {cards.diagnosis.likely_condition}
        </p>
        <p className="mb-1"><b>Other possibilities:</b></p>
        <ul className="text-sm mb-3">
          {cards.diagnosis.other_possibilities.map((p: any, i: number) => (
            <li key={i} className="ml-2">
              • {p.name} ({p.likelihood} likelihood)
            </li>
          ))}
        </ul>
        <p className="mb-1"><b>Urgency:</b></p>
        <p className="text-sm">
          {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} Urgency — {cards.diagnosis.urgency.note}
        </p>
      </div>

      {/* Card 2: General Care Tips */}
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">{cards.care.title}</h2>
        <ul className="list-disc pl-5 text-sm">
          {cards.care.tips.map((t: any, i: number) => (
            <li key={i}>
              {t.icon} {t.text}
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          {cards.care.disclaimer}
        </p>
      </div>

      {/* Card 3: Vet Procedures & Costs */}
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">{cards.costs.title}</h2>
        <p className="text-xs text-gray-500 mb-2">
          {cards.costs.disclaimer}
        </p>
        <ul className="space-y-2 text-sm">
          {cards.costs.steps.map((s: any, i: number) => (
            <li key={i}>
              {s.icon} <b>{s.name}</b> – {s.likelihood}
              <br />
              <span className="text-gray-600">{s.desc}</span>
              <br />
              <span className="font-medium">{s.cost}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
