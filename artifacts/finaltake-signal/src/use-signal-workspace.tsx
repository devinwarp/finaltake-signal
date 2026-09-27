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
export type ExampleClaimPreset = { id: string; product: string; claim: string; source: string };
export type ExamplePreset = { id: string; label: string; input: SignalSearchInput; claimPresets?: ExampleClaimPreset[] };
export const examplePresets: ExamplePreset[] = [
  { id: 'sunscreen', label: 'Beauty of Joseon · sunscreen', input: exampleInput },
  { id: 'moisturizer', label: 'CeraVe · moisturizer', input: { brand: 'CeraVe', competitor: 'La Roche-Posay', control: 'Cetaphil + Vanicream', category: 'moisturizer for dry sensitive skin' }, claimPresets: [
    { id: 'cream-ceramides', product: 'CeraVe Moisturizing Cream', claim: 'Formulated with three essential ceramides and hyaluronic acid to help restore the skin barrier', source: 'https://www.cerave.com/skincare/moisturizers/moisturizing-cream' },
    { id: 'cream-24h', product: 'CeraVe Moisturizing Cream', claim: 'MVE technology provides 24-hour hydration', source: 'https://www.cerave.com/skincare/moisturizers/moisturizing-cream' },
  ] },
  { id: 'water-bottle', label: 'Stanley · water bottle', input: { brand: 'Stanley', competitor: 'Owala', control: 'Hydro Flask + Yeti', category: 'insulated water bottle for everyday carry' }, claimPresets: [
    { id: 'quencher-cold', product: 'Stanley Quencher H2.0 FlowState Tumbler 40 oz', claim: 'Double-wall vacuum insulation keeps drinks cold for up to 11 hours and iced for up to 2 days', source: 'https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz' },
    { id: 'quencher-cupholder', product: 'Stanley Quencher H2.0 FlowState Tumbler 40 oz', claim: 'Narrow base fits most car cup holders', source: 'https://www.stanley1913.com/products/adventure-quencher-travel-tumbler-40-oz' },
  ] },
  { id: 'soda', label: 'Olipop · prebiotic soda', input: { brand: 'Olipop', competitor: 'Poppi', control: 'Coca-Cola + Culture Pop', category: 'prebiotic soda as a soda swap' }, claimPresets: [
    { id: 'cola-fiber', product: 'OLIPOP Vintage Cola', claim: '9g of prebiotic fiber per can', source: 'https://drinkolipop.com/products/vintage-cola' },
    { id: 'cola-sugar', product: 'OLIPOP Vintage Cola', claim: '2g of sugar per can', source: 'https://drinkolipop.com/products/vintage-cola' },
  ] },
];
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