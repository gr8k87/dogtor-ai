import { useHistory } from "./state/historyContext";
import History from "./pages/history";

import React, { useState } from "react";
import ImagePicker from "./components/ImagePicker";
import OfflineBadge from "./components/OfflineBadge";

type Tab = "Diagnose" | "History" | "Connect";
const tabs: Tab[] = ["Diagnose", "History", "Connect"];

function Splash({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-bold">Dogtor AI</h1>
      <p className="text-sm  text-gray-500 mt-1">
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
  const [notes, setNotes] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cards, setCards] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { addEntry } = useHistory();
  const [debugMsg, setDebugMsg] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!imageFile) e.image = "Please add a photo";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDebugMsg("✅ Starting analysis...");

    if (!validate()) {
      setDebugMsg("❌ Please add a photo");
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      let imageUrl = "";

      // Upload image
      if (imageFile) {
        setDebugMsg("📤 Uploading image...");
        const formDataToSend = new FormData();
        formDataToSend.append("image", imageFile);

        const uploadResp = await fetch("/api/upload", {
          method: "POST",
          body: formDataToSend,
        });

        if (!uploadResp.ok) {
          const errorText = await uploadResp.text();
          throw new Error(
            `Image upload failed: ${uploadResp.status} - ${errorText}`,
          );
        }

        const uploadJson = await uploadResp.json();
        imageUrl = uploadJson.imageUrl;
        setDebugMsg(`✅ Image uploaded, analyzing...`);
      }

      // Call backend multi-prompt results API
      setDebugMsg("🔍 AI analyzing...");
      const resp = await fetch("/api/diagnose/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: notes || "dog health issue",
          imageUrl,
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(
          `Results request failed: ${resp.status} - ${errorText}`,
        );
      }

      const j = await resp.json();
      setCards(j.cards);
      setDebugMsg("✅ Analysis complete!");

      // Save to history
      addEntry({
        form: { notes },
        triage: j.cards,
      });
    } catch (err: any) {
      console.error("❌ Diagnose submit error", err);
      setDebugMsg(`❌ Error: ${err.message}`);
      setErrors((prev) => ({
        ...prev,
        submit: err.message || "Something went wrong",
      }));
    } finally {
      setSubmitting(false);
    }
  }

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
        <h2 className="font-semibold mb-2">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Describe any symptoms, behaviors, or concerns about your pet (optional)..."
          className="w-full h-24 p-3 border rounded-lg resize-none text-sm"
        />

        {errors.submit && (
          <p className="text-red-600 text-sm mt-2">{errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full h-12 rounded-xl bg-black text-white disabled:opacity-50"
        >
          {submitting ? "Analyzing..." : "Analyze"}
        </button>
        {debugMsg && <p className="text-xs text-blue-600 mt-2">{debugMsg}</p>}
      </form>

      {cards && (
        <div className="space-y-4">
          {/* Card 1: Diagnosis */}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">{cards.diagnosis.title}</h2>
            <p>
              <b>Likely:</b> {cards.diagnosis.likely_condition}
            </p>
            <ul className="list-disc pl-5 text-sm mt-2">
              {cards.diagnosis.other_possibilities.map((p: any, i: number) => (
                <li key={i}>
                  {p.name} – {p.likelihood}
                </li>
              ))}
            </ul>
            <p className="mt-2">
              {cards.diagnosis.urgency.badge} {cards.diagnosis.urgency.level} –{" "}
              {cards.diagnosis.urgency.note}
            </p>
          </div>

          {/* Card 2: General Care Tips */}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">{cards.care.title}</h2>
            <ul className="list-disc pl-5 text-sm">
              {cards.care.tips.map((t: any, i: number) => (
                <li key={i}>
                  {t.icon} {t.text}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mt-2">
              {cards.care.disclaimer}
            </p>
          </div>

          {/* Card 3: Vet Procedures & Costs */}
          <div className="rounded-2xl border p-4">
            <h2 className="font-semibold mb-2">{cards.costs.title}</h2>
            <p className="text-xs text-gray-500 mb-2">
              {cards.costs.disclaimer}
            </p>
            <ul className="space-y-2 text-sm">
              {cards.costs.steps.map((s: any, i: number) => (
                <li key={i}>
                  {s.icon} <b>{s.name}</b> – {s.likelihood}
                  <br />
                  <span className="text-gray-600">{s.desc}</span>
                  <br />
                  <span className="font-medium">{s.cost}</span>
                </li>
              ))}
            </ul>
          </div>
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
