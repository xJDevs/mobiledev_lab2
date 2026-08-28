import { createContext, useContext, useState, type ReactNode } from "react";

// así guardo la posición de cada foto, accuracy es el margen de error en metros
export type EntryLocation = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
};

// una entrada de la bitácora, la foto con su ubicación y su descripción
// location queda en null si el gps no respondió cuando tomé la foto
export type Entry = {
  id: string;
  uri: string;
  description: string;
  takenAt: number;
  location: EntryLocation | null;
};

// esto es lo que las pantallas pueden usar del contexto
type EntriesContextValue = {
  entries: Entry[];
  addEntry: (entry: Entry) => void;
};

// la caja compartida, arranca en null hasta que el provider la llene
const EntriesContext = createContext<EntriesContextValue | null>(null);

// el provider envuelve a los tabs y es el que guarda la lista en memoria
export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);

  // meto la nueva al inicio para que el journal salga de la más reciente a la más vieja
  function addEntry(entry: Entry) {
    setEntries((current) => [entry, ...current]);
  }

  return (
    <EntriesContext.Provider value={{ entries, addEntry }}>
      {children}
    </EntriesContext.Provider>
  );
}

// con este hook cualquier pantalla lee la lista o agrega una entrada
export function useEntries() {
  const value = useContext(EntriesContext);
  // si esto explota es porque usé el hook fuera del provider
  if (!value) {
    throw new Error("useEntries must be used inside EntriesProvider");
  }
  return value;
}
