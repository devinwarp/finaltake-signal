import { createContext, useContext, useState, type ReactNode } from 'react';
import { useGetSignalConfig, useSearchSignal } from '@workspace/api-client-react';
import type { SignalConfig, SignalSearchInput, SignalSearchResult } from '@workspace/api-client-react';

const STORAGE_KEY = 'finaltake-signal:last-run:v1';
export const defaults: SignalSearchInput = {
  brand: '',
  competitor: '',
  control: '',
  category: '',
};
export const exampleInput: SignalSearchInput = {
  brand: 'Beauty of Joseon',
  competitor: 'Neutrogena',
  control: 'Nivea Sun + Skin1004',
  category: 'sunscreen in heat',
};
type StoredRun = { input: SignalSearchInput; result: SignalSearchResult; at: string };
function readStored(): StoredRun | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return parsed?.input && parsed?.result && parsed?.at ? parsed as StoredRun : null;
  } catch { return null; }
}
type SignalState = {
  input: SignalSearchInput;
  setInput: (value: SignalSearchInput) => void;
  run: () => void;
  stored: StoredRun | null;
  result: SignalSearchResult | null;
  isPending: boolean;
  searchError: string | null;
  config: SignalConfig | undefined;
  configLoading: boolean;
  configError: boolean;
  retryConfig: () => void;
  reveal: boolean;
  setReveal: (value: boolean) => void;
  selectedNeedId: string | null;
  setSelectedNeedId: (id: string) => void;
};
const Context = createContext<SignalState | null>(null);
export function SignalProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredRun | null>(readStored);
  const [input, setInput] = useState<SignalSearchInput>({ ...defaults });
  const [reveal, setReveal] = useState(false);
  const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const configQuery = useGetSignalConfig();
  const search = useSearchSignal();
  function run() {
    const submittedInput = { ...input };
    setStored(null);
    setSelectedNeedId(null);
    setSearchError(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* private mode */ }
    search.mutate({ data: submittedInput }, {
      onSuccess: (result) => {
        const record = { input: submittedInput, result, at: new Date().toISOString() };
        setStored(record);
        setSelectedNeedId(result.heroNeedId);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch { /* private mode */ }
      },
      onError: (error) => setSearchError(error instanceof Error ? error.message : 'The search could not be completed. Please try again.'),
    });
  }
  return <Context.Provider value={{
    input, setInput, run, stored, result: stored?.result || null, isPending: search.isPending,
    searchError, config: configQuery.data, configLoading: configQuery.isLoading,
    configError: configQuery.isError, retryConfig: () => { void configQuery.refetch(); },
    reveal, setReveal, selectedNeedId, setSelectedNeedId,
  }}>{children}</Context.Provider>;
}
export function useSignalWorkspace() {
  const value = useContext(Context);
  if (!value) throw new Error('SignalProvider is missing');
  return value;
}