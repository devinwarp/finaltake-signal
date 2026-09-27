import { ArrowRight, ArrowUpRight, BookOpenText, CircleHelp, ExternalLink, FileText, LockKeyhole, Printer, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Video, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { SignalNeed, SignalQueryMetrics, SignalVideo } from '@workspace/api-client-react';
import { exampleInput, useSignalWorkspace } from './use-signal-workspace';

export const number = (value: number) => new Intl.NumberFormat('en-US').format(value);
export const compact = (value: number | null) => value == null ? 'Not reported' : new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
export const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
export const date = (value: string | null) => value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date not reported';
const queryNames: Record<string, string> = { brand: 'Brand', competitor: 'Brand B', control: 'Control', heat: 'Category context' };
export function queryName(id: string) { return queryNames[id] || id; }
export function queryDisplay(q: SignalQueryMetrics, reveal: boolean, competitor: string) {
  if (q.id === 'competitor' && !reveal) return 'Brand B';
  return q.id === 'competitor' ? competitor : q.label;
}
export function SourceBadge() {
  const { result, stored } = useSignalWorkspace();
  if (!result || !stored) return null;
  return <div className={`source-badge ${result.source === 'backup' ? 'backup' : 'live'}`} data-testid="status-source">
    <span className="source-dot" /> <strong>{result.source === 'live' ? 'LIVE ORIANE SEARCH' : 'BACKUP DATASET'}</strong>
    <span className="source-separator">/</span> Last run {date(stored.at)}
  </div>;
}
export function SourceNotice() {
  const { result } = useSignalWorkspace();
  if (!result) return null;
  return <div className={`source-notice ${result.source === 'backup' ? 'is-backup' : ''}`} data-testid="status-source-detail">
    <div className="source-notice-icon">{result.source === 'live' ? <ShieldCheck size={19} /> : <CircleHelp size={19} />}</div>
    <div><strong>{result.source === 'live' ? 'Evidence from the live Oriane search' : 'This result used backup evidence'}</strong>
      <p>{result.source === 'backup' ? (result.fallbackReason || 'The live search was unavailable; source material is from the backup dataset.') : 'Source labels, video links, and exact spoken evidence are retained so every interpretation can be checked.'}</p>
    </div>
  </div>;
}
export function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { result } = useSignalWorkspace();
  const links = [
    { href: '/', label: 'Need board', number: '01', icon: SlidersHorizontal },
    { href: '/evidence', label: 'Evidence', number: '02', icon: BookOpenText },
    { href: '/brief', label: 'Creator brief', number: '03', icon: FileText },
  ];
  return <div className="app-shell min-h-[100dvh]">
    <header className="site-header no-print">
      <div className="header-inner">
        <Link href="/" className="brand-lockup" data-testid="link-home"><span className="brand-icon"><span /></span><span>FinalTake <i>Signal</i></span></Link>
        <span className="header-center">CREATOR INTELLIGENCE / STRATEGY DESK</span>
        <div className="header-right"><span className="powered">Powered by <strong>Oriane</strong></span><span className="header-index">FT—S / 001</span></div>
      </div>
    </header>
    <div className="workspace">
      <aside className="sidebar no-print">
        <div className="sidebar-top"><div className="eyebrow">WORKSPACE / 01</div><p>A signal, not<br />a guess<span className="sidebar-period">.</span></p></div>
        <nav aria-label="Primary navigation">{links.map(item => <Link key={item.href} href={item.href} className={`side-link ${location === item.href ? 'active' : ''}`} data-testid={`link-${item.href === '/' ? 'board' : item.href.slice(1)}`}><span className="side-number">{item.number}</span><item.icon size={16} strokeWidth={1.6} /><span>{item.label}</span>{location === item.href && <span className="side-arrow">↗</span>}</Link>)}</nav>
        <div className="sidebar-bottom"><span className="small-rule" /><span className="eyebrow">THE WORKFLOW</span><p>Listen to creators.<br />Find the need.<br />Make the work.</p><div className="sidebar-footnote">{result ? 'ONE SEARCH / THREE OUTPUTS' : 'AWAITING FIRST SEARCH'}</div></div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
    <footer className="mobile-footer no-print"><span>FINALTAKE SIGNAL</span><span>Powered by Oriane</span></footer>
  </div>;
}
export function PageIntro({ number: index, label, title, description, action }: { number: string; label: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <section className="page-intro fade-up"><div className="intro-meta"><span className="eyebrow">{index} / {label}</span><SourceBadge /></div><div className="intro-line"><div><h1 className="serif page-title">{title}</h1><p className="page-description">{description}</p></div>{action && <div className="intro-action">{action}</div>}</div></section>;
}
export function EmptyRun({ heading = 'The story starts with a search.', text = 'Run four focused queries to see the creator evidence behind the category need.' }: { heading?: string; text?: string }) {
  return <div className="empty-run" data-testid="status-empty"><div className="empty-asterisk">∗</div><div className="eyebrow">NO SEARCH ON RECORD</div><h2 className="serif">{heading}</h2><p>{text}</p><Link className="btn-primary" href="/" data-testid="link-start-search">Set up a search <ArrowRight size={16} /></Link></div>;
}
export function SearchLoading() {
  return <section className="loading-block" data-testid="status-search-loading"><div className="loading-heading"><span className="eyebrow">ORIANE / SEARCH IN PROGRESS</span><span className="mono">04 / 04 QUERIES</span></div><h2 className="serif">Listening across the category<span className="loading-ellipsis">...</span></h2><p>TikTok + Instagram · Last 90 days · Exact spoken words + caption match · Maximum 200 videos per query</p><div className="loading-grid">{['Brand', 'Brand B', 'Control', 'Category context'].map((q, i) => <div className="loading-cell" key={q}><span className="mono">0{i + 1}</span><strong>{q}</strong><div className="skeleton" /><small>Searching creator videos</small></div>)}</div></section>;
}
export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="error-block" data-testid="status-search-error"><div className="eyebrow">SEARCH INTERRUPTED</div><h2 className="serif">We couldn't complete this run.</h2><p>{message}</p><button className="btn-outline" onClick={onRetry} data-testid="button-retry-search"><RotateCcw size={15} /> Try again</button></div>;
}
export function Metric({ value, label, detail }: { value: string; label: string; detail?: string }) {
  return <div className="metric"><div className="metric-value serif">{value}</div><div className="metric-label">{label}</div>{detail && <div className="metric-detail">{detail}</div>}</div>;
}
export function QueryStrip({ metrics, title }: { metrics: SignalQueryMetrics[]; title?: string }) {
  const { reveal, input, stored } = useSignalWorkspace();
  const runInput = stored?.input || input;
  return <div className="query-strip"><div className="eyebrow">{title || 'NEED PENETRATION / BY SEARCH QUERY'}</div><div className="query-strip-grid">{(['brand', 'competitor', 'control', 'heat'] as const).map(id => {
    const metric = metrics.find(q => q.id === id);
    return <div className="query-stat" key={id} data-testid={`stat-query-${id}`}><span className="query-stat-label">{metric ? queryDisplay(metric, reveal, runInput.competitor) : queryName(id)}</span><strong className="serif">{metric ? percent(metric.needVideoShare) : '—'}</strong><small>{metric ? `${number(metric.needVideos)} of ${number(metric.relevantVideos)} relevant videos` : 'No query metrics'}</small><div className="query-meter"><span style={{ width: `${Math.min(100, (metric?.needVideoShare || 0) * 100)}%` }} /></div></div>;
  })}</div></div>;
}
export function VideoSourceLink({ video, children }: { video: SignalVideo; children?: ReactNode }) {
  const safe = /^https?:\/\//i.test(video.url);
  return safe ? <a href={video.url} target="_blank" rel="noopener noreferrer" className="source-link" data-testid={`link-video-${video.id}`}>{children || 'Open original video'} <ArrowUpRight size={14} /></a> : <span className="unavailable-link">Original link unavailable</span>;
}
export function NeedBadge({ need }: { need: SignalNeed }) {
  return <span className="need-chip">{need.label}</span>;
}
export function SearchPage() {
  const { input, setInput, run, result, stored, isPending, searchError, reveal, setReveal, selectedNeedId, setSelectedNeedId } = useSignalWorkspace();
  const hero = result?.needs.find(n => n.id === (selectedNeedId || result.heroNeedId)) || result?.needs.find(n => n.id === result.heroNeedId) || result?.needs[0];
  const [showMethod, setShowMethod] = useState(false);
  function field(id: keyof typeof input, label: string, index: string) {
    const placeholder = { brand: 'Brand or product name', competitor: 'A competing brand', control: 'Benchmark brands, separated by +', category: 'Product category and consumer situation' };
    return <label className="search-field" key={id}><span className="field-label"><span className="mono">{index}</span>{label}</span><input className="field" type={id === 'competitor' && !reveal ? 'password' : 'text'} autoComplete="off" placeholder={placeholder[id]} value={input[id]} onChange={e => setInput({ ...input, [id]: e.target.value })} maxLength={120} required data-testid={`input-${id}`} /></label>;
  }
  return <>
    <PageIntro number="01" label="THE SEARCH" title={<>From creator noise<br /><em>to category signal.</em></>} description="Four queries. One evidence-backed need. A clearer place to begin." />
    <section className="search-panel paper fade-up">
      <div className="panel-head"><div><span className="eyebrow">SEARCH PARAMETERS</span><h2 className="serif">Set the listening frame</h2></div><div className="panel-head-right"><span>01 — 04</span><Search size={18} strokeWidth={1.4} /></div></div>
       <form onSubmit={e => { e.preventDefault(); run(); }}><div className="search-fields">{field('brand', 'Your brand', '01')}{field('competitor', 'Competitor / Brand B', '02')}{field('control', 'Category control', '03')}{field('category', 'Category context', '04')}</div>
         <div className="search-actions"><div className="search-helpers"><button type="button" className="reveal-button" aria-pressed={reveal} onClick={() => setReveal(!reveal)} data-testid="button-reveal-competitor">{reveal ? <EyeOff size={16} /> : <Eye size={16} />}{reveal ? 'Conceal competitor' : 'Privately reveal competitor'}</button><button type="button" className="reveal-button" onClick={() => setInput({ ...exampleInput })} data-testid="button-load-example">Load sunscreen example</button></div><button type="submit" className="btn-primary run-button" disabled={isPending || Object.values(input).some(v => !v.trim())} data-testid="button-run-search">{isPending ? 'Searching…' : result ? 'Run new search' : 'Run search'} <ArrowRight size={17} /></button></div>
      </form>
      <div className="search-foot"><span>SEARCH SPECIFICATION</span><span>TikTok + Instagram · last 90 days · exact spoken words + caption match · max 200 / query</span></div>
    </section>
    {isPending ? <SearchLoading /> : searchError ? <ErrorBlock message={searchError} onRetry={run} /> : result ? <>
       <div className="results-divider"><span className="eyebrow">THE FINDING / LAST RUN · {stored?.input.brand} / {stored?.input.category}</span><span className="eyebrow">{stored && date(stored.at)}</span></div>
      <SourceNotice />
      {hero ? <>
        <section className="hero-need fade-up">
          <div className="hero-need-left"><span className="eyebrow">THE LEAD NEED / {String(result.needs.findIndex(n => n.id === hero.id) + 1).padStart(2, '0')}</span><h2 className="serif">{hero.label}</h2><p>Prioritized by distinct creator voices, not just repeat uploads. This is the tension worth testing.</p><div className="hero-links"><Link href="/evidence" className="btn-primary" data-testid="link-review-evidence">Review the evidence <ArrowRight size={16} /></Link><Link href="/brief" className="text-link" data-testid="link-build-brief">Build the brief <ArrowUpRight size={15} /></Link></div></div>
          <div className="hero-need-right"><div className="eyebrow">SIGNAL STRENGTH</div><div className="hero-big serif">{number(hero.creatorCount)}</div><div className="hero-big-label">distinct creators</div><div className="hero-small-stats"><div><strong>{number(hero.videoCount)}</strong><span>need videos</span></div><div><strong>{compact(hero.totalViews)}</strong><span>total views</span></div><div><strong>{compact(hero.medianViews)}</strong><span>median views</span></div></div></div>
        </section>
          <section className="share-section"><div className="section-topline"><span className="eyebrow">CONTEXT / WHERE THE NEED APPEARS</span><span className="mono">CATEGORY VS. BRAND QUERIES</span></div><h2 className="serif section-title">A need, seen <em>from two angles.</em></h2><div className="share-comparison"><div className="share-block"><span>CATEGORY CONTEXT QUERY</span><strong className="serif">{percent(result.heatNeedVideoShare)}</strong><small>Reported need share for the category query · {number(result.queries.find(q => q.id === 'heat')?.relevantVideos || 0)} relevant query videos</small></div><div className="share-vs">VS</div><div className="share-block"><span>BRAND / COMPARISON QUERIES</span><strong className="serif">{percent(result.ordinaryNeedVideoShare)}</strong><small>Reported need share across the other queries · {number(result.queries.filter(q => q.id !== 'heat').reduce((sum, q) => sum + q.relevantVideos, 0))} relevant query matches*</small></div></div><p className="fineprint">* The three comparison counts are summed as the denominator. A video matched by multiple queries contributes once to each query.</p></section>
        <QueryStrip metrics={hero.queryMetrics} />
      </> : <div className="empty-run"><div className="eyebrow">NO CATEGORY NEED DETECTED</div><h2 className="serif">Nothing strong enough to brief yet.</h2><p>Try a different category tension or broaden your search terms.</p></div>}
      <section className="need-board"><div className="section-topline"><span className="eyebrow">NEED BOARD / {number(result.needs.length)} IDENTIFIED</span><span className="mono">RANKED BY DISTINCT CREATORS</span></div><h2 className="serif section-title">The other conversations.</h2>{result.needs.length ? <div className="need-list">{[...result.needs].sort((a,b) => b.creatorCount - a.creatorCount || b.videoCount - a.videoCount).map((need, i) => <button key={need.id} className={`need-row ${hero?.id === need.id ? 'selected' : ''}`} onClick={() => { setSelectedNeedId(need.id); window.scrollTo({ top: 500, behavior: 'smooth' }); }} data-testid={`button-need-${need.id}`}><span className="mono need-index">{String(i + 1).padStart(2, '0')}</span><span className="need-row-main"><strong className="serif">{need.label}</strong><small>{need.complaintLines[0] || 'Creator conversation identified in the search.'}</small></span><span className="need-row-data"><strong>{number(need.creatorCount)}</strong><small>creators</small></span><span className="need-row-data"><strong>{number(need.videoCount)}</strong><small>videos</small></span><ArrowUpRight size={18} className="need-row-arrow" /></button>)}</div> : <p>No needs surfaced in this run.</p>}</section>
       <div className="method-block"><button onClick={() => setShowMethod(!showMethod)} aria-expanded={showMethod} data-testid="button-methodology"><span><CircleHelp size={17} /> How to read this signal</span><span>{showMethod ? '−' : '+'}</span></button>{showMethod && <p>The server groups short spoken excerpts using deterministic complaint-phrase rules, not AI interpretation or translation. Creator counts represent distinct handles. Query shares compare need-matched videos with relevant videos; query pools may overlap. Evidence is directional, not a population estimate. Inspect linked originals before production.</p>}</div>
    </> : <div className="home-empty"><div className="empty-rule" /><span className="eyebrow">BEFORE THE BRIEF, THE PROOF</span><h2 className="serif">A category need should be<br /><em>heard, not assumed.</em></h2><p>Run the listening frame above to surface recurring creator complaints, see the exact video evidence, and turn the strongest need into a claim-safe brief.</p><div className="empty-steps"><span>01 / SEARCH</span><span>02 / VERIFY</span><span>03 / BRIEF</span></div></div>}
  </>;
}
export function EvidencePage() {
  const { result, selectedNeedId, setSelectedNeedId, reveal, input, stored, isPending } = useSignalWorkspace();
  const runInput = stored?.input || input;
  const [platform, setPlatform] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [needFilter, setNeedFilter] = useState('all');
  const displayed = result?.videos.filter(v => (platform === 'all' || v.platform === platform) && (needFilter === 'all' || v.needIds.includes(needFilter))) || [];
  return <>
    <PageIntro number="02" label="THE EVIDENCE" title={<>The receipts, <em>in context.</em></>} description="Every claim about the category begins with a real creator, an exact sentence, and a link back to the source." action={result && <Link href="/brief" className="btn-outline" data-testid="link-evidence-to-brief">Continue to brief <ArrowRight size={15} /></Link>} />
    {isPending ? <SearchLoading /> : !result ? <EmptyRun heading="Evidence follows the search." text="No videos are preloaded. Run the search to inspect original creator posts and the exact cited moments." /> : <>
      <SourceNotice />
      <section className="evidence-summary"><div><span className="eyebrow">SOURCE LEDGER</span><h2 className="serif">{number(result.videos.length)} linked videos<span className="punctuation">.</span></h2></div><div className="evidence-summary-detail"><span>{number(result.totalRelevantVideos)} relevant videos in analysis</span><span>Exact excerpts are shown where available</span></div></section>
      <div className="evidence-toolbar no-print"><div className="filter-group"><span className="eyebrow">FILTER / NEED</span><select aria-label="Filter by need" value={needFilter} onChange={e => { setNeedFilter(e.target.value); if (e.target.value !== 'all') setSelectedNeedId(e.target.value); }} data-testid="select-need-filter"><option value="all">All needs</option>{result.needs.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></div><div className="filter-group"><span className="eyebrow">PLATFORM</span><div className="segmented">{['all', 'tiktok', 'instagram', 'other'].map(p => <button key={p} className={platform === p ? 'active' : ''} onClick={() => setPlatform(p)} data-testid={`button-platform-${p}`}>{p === 'all' ? 'All' : p === 'tiktok' ? 'TikTok' : p === 'instagram' ? 'Instagram' : 'Other'}</button>)}</div></div></div>
       {displayed.length ? <div className="evidence-list">{displayed.map((video, i) => <article className="evidence-card paper" key={video.id} data-testid={`card-evidence-${video.id}`}><div className="evidence-card-top"><div className="evidence-number mono">EVIDENCE / {String(i + 1).padStart(2, '0')}</div><div className="platform-label">{video.platform.toUpperCase()} <ExternalLink size={12} /></div></div><div className="evidence-card-body"><div className="evidence-main"><div className="evidence-handle"><span className="handle-mark">{video.handle.replace('@','').slice(0,2).toUpperCase()}</span><div><strong>{video.handle}</strong><span>{video.followers == null ? 'Followers not reported' : `${compact(video.followers)} followers`}</span></div></div><div className="quote-label"><span className="eyebrow">EXACT EVIDENCE SENTENCE</span><span className="mono">{video.evidenceTime || 'Time not supplied'}</span></div><blockquote dir="auto">{video.evidenceSentence ? <mark>{video.evidenceSentence}</mark> : <span className="no-quote">No exact sentence was returned for this video. Review the original caption and transcript.</span>}</blockquote><div className="evidence-needs">{video.needIds.map(id => { const need = result.needs.find(n => n.id === id); return need ? <NeedBadge key={id} need={need} /> : null; })}</div></div><div className="evidence-aside"><div><span>POSTED</span><strong>{date(video.date)}</strong></div><div><span>VIEWS</span><strong>{compact(video.views)}</strong></div><div><span>LANGUAGE</span><strong>{video.language || 'Not reported'}</strong></div><div><span>FOUND VIA</span><strong>{video.sourceQueries.map(id => id === 'competitor' ? (reveal ? runInput.competitor : 'Brand B') : queryName(id)).join(' · ') || 'Not reported'}</strong></div></div></div><div className="evidence-card-bottom"><VideoSourceLink video={video} /><button onClick={() => setExpanded(expanded === video.id ? null : video.id)} aria-expanded={expanded === video.id} data-testid={`button-context-${video.id}`}>{expanded === video.id ? 'Hide full context −' : 'Read caption + transcript +'}</button></div>{expanded === video.id && <div className="evidence-context"><div><span className="eyebrow">ORIGINAL CAPTION</span><p dir="auto">{video.caption || 'No caption supplied.'}</p></div><div><span className="eyebrow">TRANSCRIPT</span><p dir="auto">{video.transcript || 'No transcript supplied.'}</p></div></div>}</article>)}</div> : <div className="filter-empty"><h2 className="serif">No videos in this view.</h2><p>Try another need or platform filter.</p><button className="btn-outline" onClick={() => { setNeedFilter('all'); setPlatform('all'); }} data-testid="button-reset-filters">Clear filters</button></div>}
      <div className="evidence-footer"><span className="eyebrow">READING NOTE</span><p>Evidence sentences are presented verbatim from the returned record, not paraphrased. The brief deliberately translates these into creative direction instead of lifting creator words into advertising.</p>{selectedNeedId && <Link href="/brief" className="text-link" data-testid="link-use-selected-need">Brief selected need <ArrowRight size={15} /></Link>}</div>
    </>}
  </>;
}

type CustomClaim = { claim: string; source: string; verified: boolean; useInAd: boolean };
type BriefDraft = {
  productName: string;
  claimText: string;
  claimSource: string;
  selectedClaims: string[];
  customClaims: CustomClaim[];
};
function briefDraftKey(runAt: string) { return `finaltake-signal:brief:${runAt}`; }
function readBriefDraft(runAt?: string): BriefDraft {
  const empty: BriefDraft = { productName: '', claimText: '', claimSource: '', selectedClaims: [], customClaims: [] };
  if (!runAt) return empty;
  try {
    const saved = JSON.parse(sessionStorage.getItem(briefDraftKey(runAt)) || 'null');
    if (!saved || typeof saved !== 'object') return empty;
    return {
      productName: typeof saved.productName === 'string' ? saved.productName : '',
      claimText: typeof saved.claimText === 'string' ? saved.claimText : '',
      claimSource: typeof saved.claimSource === 'string' ? saved.claimSource : '',
      selectedClaims: Array.isArray(saved.selectedClaims) ? saved.selectedClaims.filter((claim: unknown) => typeof claim === 'string') : [],
      customClaims: Array.isArray(saved.customClaims) ? saved.customClaims.filter((claim: CustomClaim) =>
        typeof claim?.claim === 'string' && typeof claim?.source === 'string' && claim.source.startsWith('https://') && claim.verified === true
      ).map((claim: CustomClaim) => ({ ...claim, useInAd: false })) : [],
    };
  } catch { return empty; }
}

export function BriefPage() {
  const { result, config, configLoading, configError, retryConfig, selectedNeedId, setSelectedNeedId, stored, isPending } = useSignalWorkspace();
  const [draft] = useState(() => readBriefDraft(stored?.at));
  const [selectedClaims, setSelectedClaims] = useState<string[]>(draft.selectedClaims);
  const [productName, setProductName] = useState(draft.productName);
  const [claimText, setClaimText] = useState(draft.claimText);
  const [claimSource, setClaimSource] = useState(draft.claimSource);
  const [ownerAttests, setOwnerAttests] = useState(false);
  const [customClaims, setCustomClaims] = useState<CustomClaim[]>(draft.customClaims);
  const [claimError, setClaimError] = useState('');
  useEffect(() => {
    if (!stored?.at) return;
    try {
      sessionStorage.setItem(briefDraftKey(stored.at), JSON.stringify({ productName, claimText, claimSource, selectedClaims, customClaims }));
    } catch { /* Storage can be unavailable in private browsing mode. */ }
  }, [stored?.at, productName, claimText, claimSource, selectedClaims, customClaims]);
  const need = result?.needs.find(n => n.id === selectedNeedId) || result?.needs.find(n => n.id === result.heroNeedId) || result?.needs[0];
  const exampleSearch = !!stored && Object.keys(exampleInput).every(k => stored.input[k as keyof typeof exampleInput].trim().toLowerCase() === exampleInput[k as keyof typeof exampleInput].toLowerCase());
  const validClaims = exampleSearch ? (config?.claims.filter(c => c.verified) || []) : customClaims;
  const chosen = validClaims.filter(c => selectedClaims.includes(c.claim));
  const adClaims = chosen.filter(c => c.useInAd);
  const unlocked = chosen.length > 0 && (exampleSearch || (!!productName.trim() && ownerAttests));
  const eligibleVideo = exampleSearch && result?.heroNeedId === 'sweat_reapply' && need?.id === 'sweat_reapply';
  const guardrails = exampleSearch ? (config?.neverClaim || []) : ['Do not present user-approved claims as independently verified by FinalTake', 'Do not quote a creator as an endorsement', 'Do not claim superiority to a named competitor without substantiation', 'Do not make unsupported clinical, safety, or performance promises'];
  const videoSrc = `${import.meta.env.BASE_URL}hero-ad.mp4`;
  function toggleClaim(claim: string) { setSelectedClaims(v => v.includes(claim) ? v.filter(c => c !== claim) : [...v, claim]); }
  function addCustomClaim(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    let validUrl = false;
    try { const url = new URL(claimSource.trim()); validUrl = url.protocol === 'https:' && !!url.hostname && !url.username && !url.password; } catch { /* invalid URL */ }
    if (!productName.trim() || !claimText.trim() || !validUrl || !ownerAttests) { setClaimError('Add a product, a claim, an official HTTPS URL, and your verification attestation.'); return; }
    if (customClaims.some(c => c.claim.toLowerCase() === claimText.trim().toLowerCase())) { setClaimError('This claim is already in your register.'); return; }
    setCustomClaims(v => [...v, { claim: claimText.trim(), source: claimSource.trim(), verified: true, useInAd: false }]);
    setClaimText(''); setClaimSource(''); setClaimError('');
  }
  return <>
    <PageIntro number="03" label="THE BRIEF" title={<>A brief with <em>boundaries.</em></>} description="Translate the category tension into a creator task. Keep product language attached to a source and an accountable approver." action={unlocked && <button className="btn-outline no-print" onClick={() => window.print()} data-testid="button-print-brief"><Printer size={15} /> Print brief</button>} />
    {isPending ? <SearchLoading /> : !result ? <EmptyRun heading="No evidence, no brief." text="A creator direction is only as useful as the source beneath it. Run a search before writing one." /> : <>
      <SourceNotice />
      <div className="brief-layout">
          <aside className="claim-panel no-print"><span className="eyebrow">01 / CLAIM CONTROL</span><h2 className="serif">Choose what can be said.</h2><p>{exampleSearch ? 'Example-only register. Select at least one verified claim; brief-only claims are excluded from the test ad.' : 'Custom run. Supply your own product and owner-approved claim. FinalTake does not independently verify these claims.'}</p>
           {exampleSearch ? (configLoading ? <div className="claim-skeleton"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div> : configError ? <div className="claim-error"><strong>Example claim register unavailable.</strong><p>The brief remains locked until the verified example register loads.</p><button className="btn-outline" onClick={retryConfig} data-testid="button-retry-config"><RotateCcw size={14} /> Retry</button></div> : <>
             <div className="product-label"><span>DEMO PRODUCT / BRAND-SOURCED REGISTER</span><strong>{config?.product}</strong></div><div className="claims">{config?.claims.map((item, i) => <label key={`${item.claim}-${i}`} className={`claim-row ${!item.verified ? 'unverified' : ''}`}><input type="checkbox" disabled={!item.verified} checked={selectedClaims.includes(item.claim)} onChange={() => toggleClaim(item.claim)} data-testid={`checkbox-claim-${i}`} /><span className="claim-check" /><span className="claim-copy"><strong>{item.claim}</strong><small>{item.verified ? (item.useInAd ? 'BRAND-VERIFIED / BRIEF + AD' : 'BRAND-VERIFIED / BRIEF ONLY') : 'UNVERIFIED / LOCKED'}</small><a href={item.source} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} data-testid={`link-claim-source-${i}`}>View official claim source <ArrowUpRight size={11} /></a></span></label>)}</div>
           </>) : <div className="custom-register"><div className="owner-notice"><ShieldCheck size={17} /><span>USER-APPROVED CLAIMS<br /><small>Not independently verified by FinalTake. No demo claims are used.</small></span></div><form onSubmit={addCustomClaim} className="custom-claim-form">
             <label>Product name<input className="field" value={productName} onChange={e => { setProductName(e.target.value); setCustomClaims([]); setSelectedClaims([]); }} maxLength={150} required placeholder="Your product" data-testid="input-product-name" /></label>
             <label>Claim text<input className="field" value={claimText} onChange={e => setClaimText(e.target.value)} maxLength={300} required placeholder="Exact approved product claim" data-testid="input-custom-claim" /></label>
             <label>Official claim source URL<input className="field" type="url" value={claimSource} onChange={e => setClaimSource(e.target.value)} required placeholder="https://brand.example/product" data-testid="input-claim-source" /></label>
             <label className="attestation"><input type="checkbox" checked={ownerAttests} onChange={e => setOwnerAttests(e.target.checked)} data-testid="checkbox-owner-attestation" /><span>I am authorized to approve this claim for the named product and have checked the official source.</span></label>
             {claimError && <p className="claim-error-text" role="alert">{claimError}</p>}
             <button type="submit" className="btn-outline" data-testid="button-add-custom-claim">Add approved claim <ArrowRight size={14} /></button>
           </form><div className="claims">{customClaims.map((item, i) => <div className="claim-row" key={`${item.claim}-${i}`}><label className="claim-choice"><input type="checkbox" checked={selectedClaims.includes(item.claim)} onChange={() => toggleClaim(item.claim)} disabled={!ownerAttests} data-testid={`checkbox-custom-claim-${i}`} /><span className="claim-check" /><span className="claim-copy"><strong>{item.claim}</strong><small>USER-APPROVED / NOT INDEPENDENTLY VERIFIED</small><a href={item.source} target="_blank" rel="noopener noreferrer" data-testid={`link-custom-claim-source-${i}`}>Official source <ArrowUpRight size={11} /></a></span></label><button type="button" className="remove-claim" onClick={() => { setCustomClaims(v => v.filter(c => c.claim !== item.claim)); setSelectedClaims(v => v.filter(c => c !== item.claim)); }} data-testid={`button-remove-claim-${i}`}>Remove</button></div>)}</div></div>}
           <div className="never-claim"><span className="eyebrow">NEVER CLAIM / GUARDRAILS</span><ul>{guardrails.map((claim, i) => <li key={i}>{claim}</li>)}</ul>{exampleSearch && configLoading && <span className="muted-text">Loading example guardrails…</span>}</div>
        </aside>
        <div className="brief-main">
          <div className="brief-switcher no-print"><label htmlFor="brief-need">NEED TO BRIEF</label><select id="brief-need" value={need?.id || ''} onChange={e => setSelectedNeedId(e.target.value)} data-testid="select-brief-need">{result.needs.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></div>
           {!unlocked ? <div className="brief-locked paper" data-testid="status-brief-locked"><div className="lock-emblem"><LockKeyhole size={26} strokeWidth={1.4} /></div><span className="eyebrow">CLAIM GATE / LOCKED</span><h2 className="serif">Proof before persuasion.</h2><p>{exampleSearch ? 'Select a verified example claim to unlock the printable brief.' : 'Name your product, add an official HTTPS claim source, attest to owner verification, then select your claim to unlock the printable brief.'}</p><div className="locked-foot"><ShieldCheck size={16} /> No unapproved claim enters the brief.</div></div> : need ? <article className="print-sheet paper brief-sheet fade-up" data-testid="document-creator-brief"><div className="brief-sheet-top"><span>FINALTAKE / CREATOR DIRECTION</span><span>ISSUE 01 — {result.source.toUpperCase()} EVIDENCE</span></div><div className="brief-sheet-title"><span className="eyebrow">A CREATOR BRIEF FOR / {stored?.input.brand.toUpperCase()}</span><h2 className="serif">Make the moment<br /><em>matter.</em></h2><p>Category need / {need.label}</p></div><div className="brief-sheet-columns"><div className="brief-body"><section><span className="brief-num">01</span><div><h3>The human tension</h3><p>Creators are surfacing a recurring friction around {need.label.toLowerCase()}. Find a concrete, everyday moment when that tension shows up. Show it in your own routine, without repeating anyone else's words.</p></div></section><section><span className="brief-num">02</span><div><h3>The creator task</h3><p>Build a short, observational story around a specific moment when this need matters. Start with the setting and the hesitation. Demonstrate your own routine, then introduce {exampleSearch ? config?.product : productName.trim()} as the product being considered. Keep the experience honest and specific.</p></div></section><section><span className="brief-num">03</span><div><h3>The shape of the film</h3><ol><li><strong>Open:</strong> A recognizable everyday interruption, filmed in a real place.</li><li><strong>Show:</strong> What makes this particular need difficult in that moment.</li><li><strong>Try:</strong> Show the product in use, with a clear, unhurried close-up.</li><li><strong>Close:</strong> Your own practical takeaway, without universal promises.</li></ol></div></section><section><span className="brief-num">04</span><div><h3>Approved product language</h3><ul className="approved-list">{chosen.map(c => <li key={c.claim}>{c.claim}<small>{exampleSearch ? (c.useInAd ? 'DEMO REGISTER / BRIEF + TEST AD' : 'DEMO REGISTER / BRIEF ONLY') : 'OWNER-APPROVED / NOT INDEPENDENTLY VERIFIED BY FINALTAKE'}</small><a href={c.source} target="_blank" rel="noopener noreferrer">Official claim source <ArrowUpRight size={11} /></a></li>)}</ul><p className="brief-caveat">{exampleSearch ? 'These are brand-sourced demo statements, not creator testimony.' : 'These claims were supplied and approved by the brand/agency owner. FinalTake has not independently verified them.'} Use only in a manner consistent with the cited source and actual experience.</p></div></section></div><aside className="brief-margin"><span className="eyebrow">WHY THIS ANGLE</span><strong className="serif">{number(need.creatorCount)}</strong><span>distinct creators</span><div className="brief-margin-rule" /><strong className="serif">{number(need.videoCount)}</strong><span>need videos</span><div className="brief-margin-rule" /><strong className="serif">{compact(need.totalViews)}</strong><span>combined views</span><p>Directional creator evidence, not a representative audience survey.</p></aside></div><div className="brief-sheet-bottom"><div><span className="eyebrow">CREATIVE GUARDRAILS / NEVER CLAIM</span><p>Paraphrase the need. Never borrow a creator's exact sentence. {guardrails.join('; ')}.</p></div><div><span className="eyebrow">SOURCE TRAIL</span><p>{number(need.videoCount)} videos / {number(need.creatorCount)} creators · {result.source === 'live' ? 'Live Oriane search' : 'Backup dataset'}. See the evidence ledger for originals and exact cited moments.</p></div></div><div className="brief-sheet-footer"><span>FINALTAKE SIGNAL</span><span>Powered by Oriane</span></div></article> : <div className="filter-empty">No need was returned to brief.</div>}
           <section className="test-ad-section no-print"><div className="section-topline"><span className="eyebrow">02 / CONCEPT PROTOTYPE</span><span className="mono">NOT A CAMPAIGN ASSET</span></div><h2 className="serif">See the idea <em>in motion.</em></h2>{!exampleSearch ? <div className="test-ad-unavailable"><Video size={21} /><p>No test film exists for this custom search. The supplied demo film is never used for custom brands or categories.</p></div> : !unlocked ? <div className="test-ad-unavailable"><Video size={21} /><p>Choose a verified example claim before reviewing the concept prototype.</p></div> : adClaims.length === 0 ? <div className="test-ad-unavailable"><Video size={21} /><p>No ad-approved claim is selected. Brief-only claims are kept out of the test ad.</p></div> : eligibleVideo ? <div className="video-frame"><video controls playsInline preload="metadata" src={videoSrc} data-testid="video-test-ad">Your browser does not support video playback.</video><div className="video-caption"><span>CONCEPT FILM / 01</span><p>AI-generated presenter, concept prototype, not the campaign.</p></div></div> : <div className="test-ad-unavailable"><Video size={21} /><p>The filmed test is only for the explicit sunscreen example's reapply-in-heat hero need. No film has been generated for this selection.</p></div>}</section>
        </div>
      </div>
    </>}
  </>;
}