import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  HealthCard,
  HealthCardHeader,
  HealthCardTitle,
  HealthCardContent,
} from "../components/ui/health-card";
import BottomTabs from "../components/BottomTabs";
import { GlobalHeader } from "../components/GlobalHeader";
import {
  AppIcons,
  ArrowLeft,
  AlertTriangle,
  ClipboardList,
  Target,
  DollarSign,
  Lightbulb,
  Building,
  Pill,
  Search,
  Phone,
  Clock,
  Utensils,
  Activity,
} from "../components/icons";

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
              {/* <Button
                onClick={handleNewDiagnosis}
                variant="default"
                className="mt-6"
                data-testid="button-back-diagnose"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Diagnose
              </Button> */}
            </div>
          </div>
        </main>

        <BottomTabs navigate={navigate} activeTab="diagnose" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero transition-smooth">
      <GlobalHeader />
      <div className="container max-w-4xl mx-auto p-6 space-y-8 pb-24">
        {/* Enhanced Header */}
        <div className="space-y-6">
          {/* Progress Bar - Step 3 Complete */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span>Your Pet's Concerns</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary/60"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary/60"></div>
                <span>A Few More Questions</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/60 to-primary"></div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary animate-pulse scale-110"></div>
                <span className="font-medium text-primary">Guidance</span>
              </div>
            </div>
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full w-full transition-all duration-1000 ease-out"></div>
            </div>
          </div>
        </div>

        {/* Single comprehensive results card */}
        <HealthCard
          colorIndex={2}
          className="border-accent gradient-card transition-smooth hover:shadow-floating rounded-2xl"
        >
          <HealthCardHeader className="pb-4 text-black">
            <HealthCardTitle className="flex items-center gap-3 text-2xl text-foreground">
              <ClipboardList size={32} className="text-primary" />
              Pet Health Analysis Results
            </HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent className="space-y-8 text-black">
            {/* Diagnosis Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <Target size={24} className="text-primary" />
                {cards.diagnosis?.title || "Diagnosis"}
              </h3>

              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1 text-black">
                    Likely condition:
                  </h4>
                  <p className="text-sm text-black">
                    {cards.diagnosis?.likely_condition || "Analysis complete"}
                  </p>
                </div>

                {cards.diagnosis?.other_possibilities && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-black">
                      Other possibilities:
                    </h4>
                    <ul className="space-y-1">
                      {cards.diagnosis.other_possibilities.map(
                        (p: any, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-black flex items-center gap-2"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-black/50"></div>
                            <span>
                              {p.name} ({p.likelihood} likelihood)
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {cards.diagnosis?.urgency && (
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
                    <h4 className="font-medium text-sm mb-1 text-black">
                      Urgency Level:
                    </h4>
                    <p className="text-sm text-black">
                      {cards.diagnosis.urgency.badge}{" "}
                      {cards.diagnosis.urgency.level} Urgency —{" "}
                      {cards.diagnosis.urgency.note}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Costs Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <DollarSign size={24} className="text-primary" />
                {cards.costs?.title || "Expected Costs"}
              </h3>

              {cards.costs?.disclaimer && (
                <p className="text-xs text-black p-2 bg-blue-50 rounded border">
                  {cards.costs.disclaimer}
                </p>
              )}

              {cards.costs?.steps && (
                <div className="space-y-3">
                  {cards.costs.steps.map((step: any, i: number) => (
                    <div
                      key={i}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          {step.icon === "🏥" && (
                            <Building size={20} className="text-primary" />
                          )}
                          {step.icon === "💊" && (
                            <Pill size={20} className="text-primary" />
                          )}
                          {step.icon === "🔬" && (
                            <Search size={20} className="text-primary" />
                          )}
                          {!["🏥", "💊", "🔬"].includes(step.icon) && (
                            <Building size={20} className="text-primary" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm text-black">
                              {step.name}
                            </h4>
                            <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              {step.cost}
                            </span>
                          </div>
                          <p className="text-sm text-black">{step.desc}</p>
                          <p className="text-xs text-black">
                            Likelihood: {step.likelihood}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Care Tips Section */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-xl font-semibold text-black flex items-center gap-2">
                <Lightbulb size={24} className="text-primary" />
                {cards.care?.title || "General Care Tips"}
              </h3>

              {cards.care?.tips && (
                <ul className="space-y-3">
                  {cards.care.tips.map((tip: any, i: number) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-md bg-green-50 border border-green-200"
                    >
                      <div className="flex-shrink-0">
                        {tip.icon === "📱" && (
                          <Phone size={20} className="text-primary" />
                        )}
                        {tip.icon === "🕐" && (
                          <Clock size={20} className="text-primary" />
                        )}
                        {tip.icon === "🍽️" && (
                          <Utensils size={20} className="text-primary" />
                        )}
                        {tip.icon === "🚶" && (
                          <Activity size={20} className="text-primary" />
                        )}
                        {!["📱", "🕐", "🍽️", "🚶"].includes(tip.icon) && (
                          <Lightbulb size={20} className="text-primary" />
                        )}
                      </div>
                      <span className="text-sm text-black">{tip.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Disclaimer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={20}
              className="text-amber-600 flex-shrink-0 mt-0.5"
            />
            <div className="space-y-1">
              <h3 className="font-medium text-amber-800 text-sm">
                Important Disclaimer
              </h3>
              <p className="text-amber-700 text-sm">
                AI results are for information only. Consult a vet for diagnosis
                and treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="pt-4">
          <Button
            onClick={handleNewDiagnosis}
            variant="default"
            size="lg"
            className="w-full h-12"
            data-testid="button-new-diagnosis"
          >
            <AppIcons.medical size={20} className="mr-2" />
            Start New Diagnosis
          </Button>
        </div>
      </div>

      <BottomTabs navigate={navigate} activeTab="diagnose" />
    </div>
  );
}
