interface SplashProps {
  onGetStarted: () => void;
}

export default function Splash({ onGetStarted }: SplashProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Dogtor AI</h1>
          <p className="text-lg text-gray-600">
            Not a vet, just your first step.
          </p>
        </div>
        
        <div className="pt-8">
          <button
            onClick={onGetStarted}
            className="w-full py-4 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get started
          </button>
        </div>
        
        <div className="pt-8">
          <p className="text-xs text-gray-400">
            For guidance only. Not a veterinary service.
          </p>
        </div>
      </div>
    </div>
  );
}