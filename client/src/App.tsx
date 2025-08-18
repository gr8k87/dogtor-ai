
import React, { useState, useEffect } from "react";
import ImagePicker from "./components/ImagePicker";
import DynamicForm from "./components/DynamicForm";

const tabs = ["Diagnose","History","Connect"] as const;
type Tab = typeof tabs[number];

function DiagnoseView(){
  const [imageFile, setImageFile] = useState<File|null>(null);
  const [formData, setFormData] = useState<Record<string,any>>({});
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [showReview, setShowReview] = useState(false);
  const [schema, setSchema] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [triage, setTriage] = useState<any>(null);
  const [triageLoading, setTriageLoading] = useState(false);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const response = await fetch('/api/diagnose/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setSchema(data.suggested_questions);
      } catch (err) {
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    }
    fetchSchema();
  }, []);

  function validate(){
    const e: Record<string,string> = {};
    if (!imageFile) e.image = "Please add a photo";
    schema.forEach((f:any)=>{
      if (f.required && (formData[f.id]===undefined || formData[f.id]==='')) e[f.id]='Required';
    });
    setErrors(e);
    return Object.keys(e).length===0;
  }

  async function onSubmit(e: React.FormEvent){
    e.preventDefault();
    if (!validate()) return;
    
    setTriageLoading(true);
    try {
      const response = await fetch('/api/diagnose/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagePresent: !!imageFile,
          answers: formData
        })
      });
      if (!response.ok) throw new Error('Triage failed');
      const triageData = await response.json();
      setTriage(triageData);
      setShowReview(true);
    } catch (err) {
      setError('Failed to get triage results');
    } finally {
      setTriageLoading(false);
    }
  }

  if (loading) {
    return <div className="p-4 text-center">Loading questions...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Add photo</h2>
        <ImagePicker onChange={setImageFile} />
        {errors.image && <p className="text-red-600 text-sm mt-2">{errors.image}</p>}
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Questions</h2>
        <DynamicForm schema={schema} value={formData} onChange={setFormData} />
        {Object.entries(errors).filter(([k])=>k!=="image").length>0 &&
          <p className="text-red-600 text-sm mt-2">Please complete required fields.</p>}
        <button 
          type="submit" 
          disabled={triageLoading}
          className="mt-4 w-full h-12 rounded-xl bg-black text-white disabled:bg-gray-400"
        >
          {triageLoading ? 'Analyzing...' : 'Review'}
        </button>
      </form>
      {showReview && triage && (
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Triage Results</h2>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Summary:</strong> {triage.triage_summary}
            </div>
            <div>
              <strong>Urgency Level:</strong> {triage.urgency_level}
            </div>
            <div>
              <strong>Possible Causes:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                {triage.possible_causes.map((cause: string, i: number) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </div>
            <div>
              <strong>Recommended Actions:</strong>
              <ul className="list-disc list-inside ml-2 mt-1">
                {triage.recommended_actions.map((action: string, i: number) => (
                  <li key={i}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App(){
  const [tab, setTab] = useState<Tab>("Diagnose");
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="p-4 text-center font-bold">Dogtor AI</header>
      <main className="flex-1 p-4">
        {tab==="Diagnose" && <DiagnoseView />}
        {tab==="History" && <div>History (placeholder)</div>}
        {tab==="Connect" && <div>Connect to Vet (placeholder)</div>}
      </main>
      <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
        <div className="grid grid-cols-3 text-center">
          {tabs.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`py-3 ${t===tab?"font-semibold":"text-gray-500"}`}
              aria-current={t===tab? "page":undefined}>
              {t}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
