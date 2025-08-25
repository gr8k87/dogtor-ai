import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import BottomTabs from "../components/BottomTabs";
import { AppIcons, ArrowLeft, AlertTriangle } from "../components/icons";

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
                <div className="w-2 h-2 rounded-full bg-muted"></div>
                <span>Step 2</span>
              </div>
              <div className="w-4 h-px bg-border"></div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Step 3</span>
              </div>
            </div>

            <div className="text-center p-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto">
                <AppIcons.medical size={32} className="text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-medium">No Results Available</h2>
                <p className="text-sm text-muted-foreground">
                  We couldn't generate results for this diagnosis
                </p>
              </div>
              <Button
                onClick={handleNewDiagnosis}
                variant="default"
                className="mt-6"
                data-testid="button-back-diagnose"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Diagnose
              </Button>
            </div>
          </div>
        </main>

        <BottomTabs navigate={navigate} activeTab="results" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero transition-smooth">
      <div className="container max-w-4xl mx-auto p-6 space-y-8 pb-24">
        {/* Enhanced Header */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="p-2 transition-smooth hover:shadow-medium rounded-xl"
              data-testid="button-back"
            >
              <ArrowLeft size={20} />
            </Button>
            <h1 className="text-3xl font-bold">Analysis Complete</h1>
          </div>
          
          {/* Progress Bar - Step 3 Complete */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span>Photo Upload</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary/60"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span>Questions</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse scale-110"></div>
                <span className="font-medium text-primary">Results</span>
              </div>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Results content */}
        <div className="space-y-8">
          {/* Main diagnosis */}
          <Card className="border-accent gradient-card transition-smooth hover:shadow-floating rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl">🎯</span>
                {cards.diagnosis?.title || "Diagnosis"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-sm mb-1">Likely condition:</h4>
                <p className="text-sm text-muted-foreground">
                  {cards.diagnosis?.likely_condition || "Analysis complete"}
                </p>
              </div>

              {cards.diagnosis?.other_possibilities && (
                <div>
                  <h4 className="font-medium text-sm mb-2">Other possibilities:</h4>
                  <ul className="space-y-1">
                    {cards.diagnosis.other_possibilities.map((p: any, i: number) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></div>
                        <span>{p.name} ({p.likelihood} likelihood)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {cards.diagnosis?.urgency && (
                <div className="p-3 rounded-md bg-muted/50 border">
                  <h4 className="font-medium text-sm mb-1">Urgency Level:</h4>
                  <p className="text-sm">
                    {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} Urgency — {cards.diagnosis.urgency.note}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Recommendations */}
          <Card className="border-accent gradient-card transition-smooth hover:shadow-floating rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <span className="text-4xl">💡</span>
                {cards.care.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {cards.care.tips && (
                <ul className="space-y-3">
                  {cards.care.tips.map((tip: any, i: number) => (
                    <li key={i} className="flex items-start gap-3 p-3 rounded-md bg-green-50 border border-green-100">
                      <span className="text-lg flex-shrink-0">{tip.icon}</span>
                      <span className="text-sm text-green-800">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              {cards.care.disclaimer && (
                <p className="text-xs text-muted-foreground italic p-2 bg-muted/30 rounded">
                  {cards.care.disclaimer}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Card 3: Costs */}
          <Card className="border-accent gradient-card transition-smooth hover:shadow-floating rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-3">
                <span className="text-4xl">💰</span>
                {cards.costs.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cards.costs.disclaimer && (
                <p className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">
                  {cards.costs.disclaimer}
                </p>
              )}
              {cards.costs.steps && (
                <div className="space-y-3">
                  {cards.costs.steps.map((step: any, i: number) => (
                    <div key={i} className="border border-border rounded-lg p-4 bg-card">
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0">{step.icon}</span>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{step.name}</h4>
                            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              {step.cost}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                          <p className="text-xs text-muted-foreground">
                            Likelihood: {step.likelihood}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-medium text-amber-800 text-sm">Important Disclaimer</h3>
              <p className="text-amber-700 text-sm">
                This AI diagnosis is for informational purposes only and should not replace professional veterinary care.
                Always consult with a qualified veterinarian for accurate diagnosis and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Button
            onClick={handleNewDiagnosis}
            variant="outline"
            size="lg"
            className="w-full h-12"
            data-testid="button-new-diagnosis"
          >
            <AppIcons.medical size={20} className="mr-2" />
            Start New Diagnosis
          </Button>
        </div>
      </div>

      <BottomTabs navigate={navigate} activeTab="results" />
    </div>
  );
}