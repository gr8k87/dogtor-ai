import { useState, useEffect } from "react";
import Splash from "./Splash";

const tabs = ["Diagnose", "History", "Connect"] as const;
type Tab = typeof tabs[number];

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('hasStarted') === '1';
  });
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Diagnose tab state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);

  const schema = [
    { id: 'duration_days', type: 'number' as const, label: 'How many days has this been happening?', min: 0, max: 30, step: 1, required: true },
    { id: 'diet_change', type: 'select' as const, label: 'Recent diet change?', options: ['Yes', 'No', 'Not sure'], required: true },
    { id: 'energy', type: 'radio' as const, label: 'Energy level', options: ['Normal', 'Slightly low', 'Very low'], required: true },
    { id: 'vomiting', type: 'yesno' as const, label: 'Any vomiting?', required: true },
    { id: 'notes', type: 'text' as const, label: 'Anything else to add?', placeholder: 'Optional notes' }
  ];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!imageFile) {
      errors.image = 'Please add a photo';
    }

    schema.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        errors[field.id] = `${field.label} is required`;
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReview = () => {
    if (validateForm()) {
      setShowReview(true);
    }
  };

  const handleBackToForm = () => {
    setShowReview(false);
  };

  const handleGetStarted = () => {
    localStorage.setItem('hasStarted', '1');
    setHasStarted(true);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!hasStarted) {
    return <Splash onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 text-center font-bold relative">
        Dogtor AI
        {!isOnline && (
          <span className="absolute top-2 right-4 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
            Offline
          </span>
        )}
      </header>
      <main className="flex-1 p-4">
        {tab === "Diagnose" && (
          <div>
            {showReview ? (
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Review Your Diagnosis</h2>
                  <button onClick={handleBackToForm} className="text-blue-500 hover:underline">Back to Form</button>
                </div>
                {imageFile && (
                  <div>
                    <h3 className="font-medium">Photo</h3>
                    <img src={URL.createObjectURL(imageFile)} alt="Diagnosis Photo" className="max-w-full h-auto rounded-md mt-2" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">Symptoms</h3>
                  <ul>
                    {schema.map(field => (
                      <li key={field.id} className="flex justify-between py-1 border-b">
                        <span className="text-gray-600">{field.label}</span>
                        <span className="font-medium">{formData[field.id]?.toString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold">Diagnose Your Dog</h2>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.037 5 5 0 0 0 0 9.999a5 5 0 0 0 5 5h11a4.5 4.5 0 0 0 0-9h-6.025A5.56 5.56 0 0 0 13 13z"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {imageFile ? imageFile.name : 'Max file size: 5MB'}
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                          setFormErrors(prev => ({ ...prev, image: '' }));
                        }
                      }}
                    />
                  </label>
                </div>
                {formErrors.image && <p className="text-red-500 text-sm">{formErrors.image}</p>}

                {schema.map(field => (
                  <div key={field.id} className="flex flex-col gap-1">
                    <label htmlFor={field.id} className="font-medium">
                      {field.label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.type === 'text' && (
                      <input
                        type="text"
                        id={field.id}
                        placeholder={field.placeholder}
                        value={formData[field.id] || ''}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                          if (field.required && e.target.value) {
                            setFormErrors(prev => ({ ...prev, [field.id]: '' }));
                          }
                        }}
                        className="border border-gray-300 rounded-md p-2"
                      />
                    )}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        id={field.id}
                        value={formData[field.id] || ''}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, [field.id]: parseInt(e.target.value, 10) }));
                          if (field.required && e.target.value) {
                            setFormErrors(prev => ({ ...prev, [field.id]: '' }));
                          }
                        }}
                        className="border border-gray-300 rounded-md p-2"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                          if (field.required && e.target.value) {
                            setFormErrors(prev => ({ ...prev, [field.id]: '' }));
                          }
                        }}
                        className="border border-gray-300 rounded-md p-2"
                      >
                        <option value="" disabled>Select an option</option>
                        {field.options.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'radio' && (
                      <div className="flex gap-4">
                        {field.options.map(option => (
                          <div key={option} className="flex items-center gap-1">
                            <input
                              type="radio"
                              id={`${field.id}-${option}`}
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                                if (field.required && e.target.value) {
                                  setFormErrors(prev => ({ ...prev, [field.id]: '' }));
                                }
                              }}
                            />
                            <label htmlFor={`${field.id}-${option}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    )}
                    {field.type === 'yesno' && (
                      <div className="flex gap-4">
                        {field.options.map(option => (
                          <div key={option} className="flex items-center gap-1">
                            <input
                              type="radio"
                              id={`${field.id}-${option}`}
                              name={field.id}
                              value={option}
                              checked={formData[field.id] === option}
                              onChange={(e) => {
                                setFormData(prev => ({ ...prev, [field.id]: e.target.value }));
                                if (field.required && e.target.value) {
                                  setFormErrors(prev => ({ ...prev, [field.id]: '' }));
                                }
                              }}
                            />
                            <label htmlFor={`${field.id}-${option}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    )}
                    {formErrors[field.id] && <p className="text-red-500 text-sm">{formErrors[field.id]}</p>}
                  </div>
                ))}
                <button
                  onClick={handleReview}
                  className="bg-blue-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-600"
                >
                  Review Diagnosis
                </button>
              </div>
            )}
          </div>
        )}
        {tab === "History" && <div>History (placeholder)</div>}
        {tab === "Connect" && <div>Connect to Vet (placeholder)</div>}
      </main>
      <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
        <div className="grid grid-cols-3 text-center">
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 ${t === tab ? "font-semibold" : "text-gray-500"}`}
              aria-current={t === tab ? "page" : undefined}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}