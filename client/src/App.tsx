import { useHistory } from "./state/historyContext.jsx";
import History from "./pages/history.jsx";

import React, { useEffect, useState } from "react";
import ImagePicker from "./components/ImagePicker";
import DynamicForm from "./components/DynamicForm";
import OfflineBadge from "./components/OfflineBadge";
type Tab = "Diagnose" | "History" | "Connect";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold">Dogtor AI</h1>
      <p className="text-sm text-gray-500 mt-1">
        Not a vet, just your first step.
      </p>
      <button
        onClick={onStart}
        className="mt-6 px-6 py-3 rounded-2xl bg-black text-white"
      >
        Get started
      </button>
      <p className="mt-4 text-xs text-gray-400">
        For guidance only. Not a veterinary service.
      </p>
    </div>
  );
}

function DiagnoseView() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [schema, setSchema] = useState<any[] | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [triage, setTriage] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addEntry } = useHistory();

  useEffect(() => {
    setLoading(true);
    fetch("/api/diagnose/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((r) => r.json())
      .then((j) => {
        setSchema(j.suggested_questions || []);
        setLoading(false);
      })
      .catch((e) => {
        setErrMsg("Failed to load questions");
        setLoading(false);
      });
  }, []);

  function validate() {
    const e: Record<string, string> = {};
    if (!imageFile) e.image = "Please add a photo";
    (schema || []).forEach((f: any) => {
      if (
        f.required &&
        (formData[f.id] === undefined || formData[f.id] === "")
      ) {
        e[f.id] = "Required";
      }
    });
    setErrors(e);
    console.log("Validation errors:", e);
    console.log("Has image:", !!imageFile);
    console.log("Form data:", formData);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      let imageUrl = "";

      // 1. If user selected an image → upload it first
      if (imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append("image", imageFile);

        const uploadResp = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        });

        if (!uploadResp.ok) {
          throw new Error("Image upload failed");
        }

        const uploadJson = await uploadResp.json();
        imageUrl = uploadJson.imageUrl; // e.g. "/uploads/12345.png"
      }

      // 2. Build payload for triage
      const payload = { ...formData, imageUrl };

      // 3. Call backend triage API
      const resp = await fetch("/api/diagnose/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        throw new Error(`Triage request failed: ${resp.status}`);
      }

      const j = await resp.json();

      // 4. Update triage state
      setTriage(j);
    } catch (err: any) {
      console.error("❌ Diagnose submit error", err);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Someth  ing went wrong",
      }));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-4">Loading questions…</div>;
  if (errMsg) return <div className="p-4 text-red-600">{errMsg}</div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Add photo</h2>
        <ImagePicker onChange={setImageFile} />
        {errors.image && (
          <p className="text-red-600 text-sm mt-2">{errors.image}</p>
        )}
      </div>
      <form onSubmit={onSubmit} className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-2">Questions</h2>
        <DynamicForm
          schema={schema || []}
          value={formData}
          onChange={setFormData}
        />
        {Object.entries(errors).filter(([k]) => k !== "image").length > 0 && (
          <p className="text-red-600 text-sm mt-2">
            Pl ease complete required fields.
          </p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full h-12 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {submitting ? "Analyzing..." : "Review"}
        </button>
        {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
      </form>
      {triage && (
        <div className="rounded-2xl border p-4">
          <h2 className="font-semibold mb-2">Triage</h2>
          <p className="text-sm">{triage.triage_summary}</p>
          <div className="mt-2">
            <p className="font-medium">Possible causes</p>
            <ul className="list-disc pl-5 text-sm">
              {(triage.possible_causes || []).map((c: string) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <div className="mt-2">
            <p className="font-medium">Recommended actions</p>
            <ul className="list-disc pl-5 text-sm">
              {(triage.recommended_actions || []).map((a: string) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
          <p className="mt-2 text-sm">
            <strong>Urgency:</strong> {triage.urgency_level}
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("Diagnose");
  const [started, setStarted] = useState<boolean>(
    () => localStorage.getItem("hasStarted") === "1",
  );

  function begin() {
    localStorage.setItem("hasStarted", "1");
    setStarted(true);
  }

  if (!started) return <Splash onStart={begin} />;

  return (
    <div className="min-h-dvh flex flex-col">
      <OfflineBadge />
      <header className="p-4 text-center font-bold">Dogtor AI</header>
      <main className="flex-1 p-4">
        {tab === "Diagnose" && <DiagnoseView />}
        {tab === "History" && <History />}
        {tab === "Connect" && <div>Connect to Vet (placeholder)</div>}
      </main>
      <nav className="sticky bottom-0 inset-x-0 border-t bg-white">
        <div className="grid grid-cols-3 text-center">
          {tabs.map((t) => (
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
