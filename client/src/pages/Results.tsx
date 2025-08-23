import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import BottomTabs from "../components/BottomTabs";

interface ResultsProps {}

export default function Results({}: ResultsProps) {
  const { caseId } = useParams<{ caseId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const cards = location.state?.cards;

  const handleNewDiagnosis = () => {
    navigate("/");
  };

  if (!cards) {
    return (
      <div className="min-h-dvh flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No results to display</p>
          <Button
            onClick={handleNewDiagnosis}
            variant="secondary"
          >
            Back to Diagnose
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Diagnosis Results</CardTitle>
              <Button
                onClick={handleNewDiagnosis}
                variant="default"
                size="sm"
                className="px-4 py-2"
              >
                New Diagnosis
              </Button>
            </div>
          </CardHeader>
          <CardContent>

          <div className="space-y-4">
              {/* Card 1: Diagnosis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{cards.diagnosis?.title || "Diagnosis"}</CardTitle>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

            {/* Card 2: Care Tips */}
              {cards.care && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{cards.care.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
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
                      <p className="text-xs text-muted-foreground italic">{cards.care.disclaimer}</p>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Card 3: Costs */}
              {cards.costs && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">{cards.costs.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cards.costs.disclaimer && (
                      <p className="text-xs text-muted-foreground mb-3">{cards.costs.disclaimer}</p>
                    )}
                    {cards.costs.steps && (
                      <ul className="space-y-3">
                        {cards.costs.steps.map((step: any, i: number) => (
                          <li key={i} className="border border-border rounded-lg p-3">
                            <div className="flex items-start gap-2">
                              <span className="text-lg">{step.icon}</span>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h3 className="font-medium text-foreground">{step.name}</h3>
                                  <span className="text-sm font-medium text-green-600">{step.cost}</span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Likelihood: {step.likelihood}
                                </p>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <span className="text-orange-500 text-lg">⚠️</span>
            <div>
              <h3 className="font-medium text-orange-800 mb-1">Important Disclaimer</h3>
              <p className="text-orange-700 text-sm">
                This AI diagnosis is for informational purposes only and should not replace professional veterinary care.
                Always consult with a qualified veterinarian for accurate diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomTabs navigate={navigate} activeTab="results" />
    </div>
  );
}