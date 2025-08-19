import { useHistory } from "../state/historyContext.jsx";

export default function History() {
  const { items, clear } = useHistory();

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-sm text-gray-500">
        No cases yet. Run a diagnosis first and it will appear here.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">History</h1>
        <button
          onClick={clear}
          className="text-xs border rounded-md px-3 py-1 hover:bg-gray-50 active:scale-95"
          title="Remove all saved entries"
        >
          Clear
        </button>
      </div>

      {items.map((item, idx) => (
        <HistoryCard key={item.id ?? idx} item={item} />
      ))}
    </div>
  );
}

function HistoryCard({ item }) {
  const triage = item.triage ?? {};
  const sev = String(
    triage.severity || triage.urgency || "unknown",
  ).toLowerCase();
  const badge =
    sev === "high"
      ? "bg-red-600"
      : sev.includes("moderate") || sev === "medium"
        ? "bg-amber-500"
        : "bg-gray-500";

  return (
    <div className="rounded-xl  border p-4 shadow-sm">
      <div className="text-xs text-gray-500">
        {new Date(item.createdAt).toLocaleString()}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className={`px-2 py-0.5 text-white text-xs rounded ${badge}`}>
          {sev.toUpperCase()}
        </span>
        <div className="font-medium">
          {triage.probableCategory || triage.category || "—"}
        </div>
      </div>
      <div className="mt-2 text-sm">
        <div>
          <span className="text-gray-500">Symptoms:</span>{" "}
          {item?.form?.symptoms || "—"}
        </div>
        {Array.isArray(triage.advice) && triage.advice.length > 0 && (
          <ul className="list-disc ml-6 mt-2 space-y-1">
            {triage.advice.slice(0, 3).map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        )}
      </div>
      <details className="mt-2 text-xs">
        <summary className="cursor-pointer">Details</summary>
        <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
          {JSON.stringify(item, null, 2)}
        </pre>
      </details>
    </div>
  );
}
