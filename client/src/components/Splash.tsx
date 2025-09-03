import { useState } from "react";

interface SplashProps {
  onGetStarted: () => void;
}

export default function Splash({ onGetStarted }: SplashProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGetStarted = () => {
    setIsLoading(true);
    setTimeout(() => {
      onGetStarted();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
            <svg
              width="48"
              height="48"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32 12C26 12 22 16 22 22V26C22 28 23 30 25 31L27 42C27 45 29 47 32 47C35 47 37 45 37 42L39 31C41 30 42 28 42 26V22C42 16 38 12 32 12Z"
                fill="currentColor"
              />
              <ellipse cx="26" cy="18" rx="3" ry="6" fill="currentColor" />
              <ellipse cx="38" cy="18" rx="3" ry="6" fill="currentColor" />
              <rect
                x="30"
                y="20"
                width="4"
                height="12"
                fill="hsl(var(--background))"
              />
              <rect
                x="26"
                y="24"
                width="12"
                height="4"
                fill="hsl(var(--background))"
              />
            </svg>
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Dogtor</h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Your pet’s health companion. Get quick, AI-powered guidance before
            the vet.
          </p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          disabled={isLoading}
          className="btn btn-primary w-full h-12 text-lg font-semibold disabled:opacity-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            "Get Started"
          )}
        </button>

        {/* Features */}
        <div className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Instant photo-based diagnosis</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Expert veterinary insights</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span>Care recommendations</span>
          </div>
        </div>
      </div>
    </div>
  );
}
