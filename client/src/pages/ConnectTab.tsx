import React from "react";
import { useHistory } from "../state/historyContext";
import {
  HealthCard,
  HealthCardHeader,
  HealthCardTitle,
  HealthCardContent,
} from "../components/ui/health-card";

export default function ConnectTab() {
  return (
    <div className="min-h-dvh">
      <main className="container max-w-2xl mx-auto p-6 space-y-8 pb-24">
        {/* Find a Vet Card */}
        <HealthCard
          colorIndex={2}
          className="opacity-75 border-accent gradient-card rounded-2xl shadow-elevated"
        >
          <HealthCardHeader>
            <HealthCardTitle>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🔍</span>
                <h2 className="text-xl font-semibold text-foreground">
                  Find a Vet
                </h2>
                <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your location or zip code"
                  disabled
                  className="input w-full pl-10 opacity-50 cursor-not-allowed"
                />
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  📍
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Happy Paws Veterinary",
                    rating: "4.8",
                    distance: "1.2 km",
                  },
                ].map((vet, i) => (
                  <div key={i} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {vet.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-yellow-600">
                            ⭐ {vet.rating}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            • {vet.distance}
                          </span>
                        </div>
                      </div>
                      <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                        Book
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>

        {/* Call TeleVet Card */}
        <HealthCard
          colorIndex={2}
          className="opacity-75 border-accent gradient-card rounded-2xl shadow-elevated"
        >
          <HealthCardHeader>
            <HealthCardTitle>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">📱</span>
                <h2 className="text-xl font-semibold text-foreground">
                  Call TeleVet
                </h2>
                <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                  Coming Soon
                </span>
              </div>
            </HealthCardTitle>
          </HealthCardHeader>
          <HealthCardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Get professional veterinary advice through video consultation
                from the comfort of your home.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-border rounded-lg text-center">
                  <span className="text-2xl mb-2 block">💬</span>
                  <h3 className="font-medium text-foreground text-sm">
                    Chat Consultation
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">$25 CAD</p>
                  <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    Start Chat
                  </span>
                </div>

                <div className="p-3 border border-border rounded-lg text-center">
                  <span className="text-2xl mb-2 block">📹</span>
                  <h3 className="font-medium text-foreground text-sm">
                    Video Call
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">$45 CAD</p>
                  <span className="ml-auto px-2 py-1 text-xs bg-muted rounded-full text-muted-foreground">
                    Start Video
                  </span>
                </div>
              </div>
            </div>
          </HealthCardContent>
        </HealthCard>
      </main>
    </div>
  );
}
