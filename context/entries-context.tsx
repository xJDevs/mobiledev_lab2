import { createContext, useContext, useState, type ReactNode } from "react";

export type EntryLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

export type Entry = {
  id: string;
  uri: string;
  description: string;
  takenAt: number;
  location: EntryLocation | null;
};

type EntriesContextValue = {
  entries: Entry[];
  addEntry: (entry: Entry) => void;
};

const EntriesContext = createContext<EntriesContextValue | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  function addEntry(entry: Entry) {
    setEntries((current) => [entry, ...current]);
  }

  return (
    <EntriesContext.Provider value={{ entries, addEntry }}>
      {children}
    </EntriesContext.Provider>
  );
}

export function useEntries() {
  const value = useContext(EntriesContext);
  if (!value) {
    throw new Error("useEntries must be used inside EntriesProvider");
  }
  return value;
}
