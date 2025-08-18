import { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 12C26 12 22 16 22 22V26C22 28 23 30 25 31L27 42C27 45 29 47 32 47C35 47 37 45 37 42L39 31C41 30 42 28 42 26V22C42 16 38 12 32 12Z" fill="#111111"/>
              <ellipse cx="26" cy="18" rx="3" ry="6" fill="#111111"/>
              <ellipse cx="38" cy="18" rx="3" ry="6" fill="#111111"/>
              <rect x="30" y="20" width="4" height="12" fill="#ffffff"/>
              <rect x="26" y="24" width="12" height="4" fill="#ffffff"/>
            </svg>
          </div>
        </div>

        {/* Title and Tagline */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900">🐕 Dogtor AI</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Not a vet, just your first step.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-gray-500 text-sm leading-relaxed">
            Get quick guidance on your pet's health concerns. Connect with local veterinarians when needed.
          </p>
        </div>

        {/* Get Started Button */}
        <div className="pt-4">
          <button
            onClick={handleGetStarted}
            disabled={isLoading}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Starting...</span>
              </div>
            ) : (
              'Get Started'
            )}
          </button>
        </div>

        {/* Disclaimer */}
        <div className="pt-6">
          <p className="text-xs text-gray-400 leading-relaxed">
            For guidance only. Not a veterinary service.
          </p>
        </div>
      </div>
    </div>
  );
}