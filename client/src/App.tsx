import { useState, useEffect } from "react";
import Splash from "./Splash";
import ImagePicker from "./components/ImagePicker";
import DynamicForm from "./components/DynamicForm";

const tabs = ["Diagnose", "History", "Connect"] as const;
type Tab = typeof tabs[number];

function DiagnoseView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showReview, setShowReview] = useState(false);

  const schema = [
    { id:'duration_days', type:'number', label:'How many days has this been happening?', min:0, max:30, step:1, required:true },
    { id:'diet_change',   type:'select', label:'Recent diet change?', options:['Yes','No','Not sure'], required:true },
    { id:'energy',        type:'radio',  label:'Energy level', options:['Normal','Slightly low','Very low'], required:true },
    { id:'vomiting',      type:'yesno',  label:'Any vomiting?', required:true },
    { id:'notes',         type:'text',   label:'Anything else to add?', placeholder:'Optional notes' }
  ] as const;

  function validate() {
    const e: Record<string,string> = {};
    if (!imageFile) e.image = "Please add a photo";
    schema.forEach(f => {
      if ((f as any).required && (formData[f.id] === undefined || formData[f.id] === "")) {
        e[f.id] = "Required";
      }
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) setShowReview(true);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Add photo</h2>
        <ImagePicker onChange={setImageFile} />
        {errors.image && <p className="text-red-600 text-sm mt-2">{errors.image}</p>}
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Questions</h2>
        <DynamicForm schema={schema as any} value={formData} onChange={setFormData} />
        {Object.entries(errors).filter(([k])=>k!=="image").length > 0 && (
          <p className="text-red-600 text-sm mt-2">Please complete required fields.</p>
        )}
        <button type="submit" className="mt-4 w-full h-12 rounded-xl bg-black text-white">
          Review
        </button>
      </form>

      {showReview && (
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Review</h2>
          <ul className="text-sm space-y-1">
            <li><strong>Duration:</strong> {formData.duration_days} day(s)</li>
            <li><strong>Diet change:</strong> {formData.diet_change}</li>
            <li><strong>Energy:</strong> {formData.energy}</li>
            <li><strong>Vomiting:</strong> {formData.vomiting ? "Yes" : "No"}</li>
            {formData.notes && <li><strong>Notes:</strong> {formData.notes}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('hasStarted') === '1';
  });
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  

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
        {tab === "Diagnose" && <DiagnoseView />}
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