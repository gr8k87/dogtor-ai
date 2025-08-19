import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  form: any;
  triage: any;
}

export interface HistoryContextValue {
  items: HistoryEntry[];
  addEntry: (entry: Omit<HistoryEntry, "id" | "createdAt">) => HistoryEntry;
  clear: () => void;
}

const HistoryContext = createContext<HistoryContextValue | undefined>(
  undefined,
);

export function HistoryProvider({
  children,
  persist = false,
}: {
  children: ReactNode;
  persist?: boolean;
}) {
  const STORAGE_KEY = "dogtor.history.v1";

  const [items, setItems] = useState<HistoryEntry[]>(() => {
    if (!persist) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, persist]);

  const api: HistoryContextValue = useMemo(
    () => ({
      items,
      addEntry(entry) {
        const id =
          typeof globalThis !== "undefined" &&
          globalThis.crypto &&
          typeof globalThis.crypto.randomUUID === "function"
            ? globalThis.crypto.randomUUID()
            : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const createdAt = Date.now();
        const newItem: HistoryEntry = { id, createdAt, ...entry };
        setItems((prev) => [newItem, ...prev]);
        return newItem;
      },
      clear() {
        setItems([]);
        if (persist) {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch {}
        }
      },
    }),
    [items, persist],
  );

  return (
    <HistoryContext.Provider value={api}>{children}</HistoryContext.Provider>
  );
}

export function useHistory() {
  const ctx = useContext(HistoryContext);
  if (!ctx) throw new Error("useHistory must be used inside <HistoryProvider>");
  return ctx;
}
