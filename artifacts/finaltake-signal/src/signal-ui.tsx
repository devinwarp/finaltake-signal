import { ArrowRight, ArrowUpRight, BookOpenText, CircleHelp, ClipboardCopy, ExternalLink, FileText, LockKeyhole, Printer, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Video, Eye, EyeOff } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import type { SignalNeed, SignalQueryMetrics, SignalSampleWindow, SignalVideo } from '@workspace/api-client-react';
import { exampleInput, examplePresets, useSignalWorkspace, type ExampleClaimPreset } from './use-signal-workspace';
import { buildBriefShareText, canShowConceptPrototype, canUnlockBrief, isExactExampleSearch } from './signal-logic';
import { CreatorBriefDocument } from './creator-brief';

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
    <span className="source-dot" aria-hidden="true" /> <strong>{result.source === 'live' ? 'LIVE ORIANE SEARCH' : 'BACKUP DATASET'}</strong>
    <span className="source-separator">/</span> Last run {date(stored.at)}
  </div>;
}
export function SourceNotice() {
  const { result } = useSignalWorkspace();
  if (!result) return null;
  return <div className={`source-notice ${result.source === 'backup' ? 'is-backup' : ''}`} data-testid="status-source-detail">
    <div className="source-notice-icon">{result.source === 'live' ? <ShieldCheck size={19} /> : <CircleHelp size={19} />}</div>
    <div><strong>{result.source === 'live' ? 'This run returned live Oriane evidence' : 'This is the saved sunscreen example, not a live result'}</strong>
      <p>{result.source === 'backup' ? (result.fallbackReason || 'The live search was unavailable; this historical example is not evidence for custom searches.') : 'Original-post links and returned transcript evidence stay attached so you can check the finding.'}</p>
    </div>
  </div>;
}
export function sampleWindowText(window: SignalSampleWindow, source: 'live' | 'backup'): string {
  const range = `${date(window.startAt)}–${date(window.endAt)}`;
  return source === 'backup'
    ? `${range} · fixed ${window.days}-day historical sunscreen example`
    : `${range} · videos published within the ${window.days}-day search window`;
}
export function SampleProvenance() {
  const { result } = useSignalWorkspace();
  if (!result) return null;
  const incomplete = result.queries.filter(query => query.isPartial);
  return <section className="sample-provenance no-print" data-testid="status-sample-provenance">
    <div className="sample-provenance-heading"><span className="eyebrow">RUN SOURCE / SAMPLE</span><span className="mono">{result.source === 'live' ? 'CURRENT SEARCH' : 'HISTORICAL EXAMPLE'}</span></div>
    <p><strong>{result.source === 'live' ? 'Oriane response' : 'Saved example dataset'}</strong> · {sampleWindowText(result.sampleWindow, result.source)} · TikTok + Instagram.</p>
    <p>{number(result.totalRelevantVideos)} unique linked videos retained across four query groups. Need shares use each query’s relevant analyzed-video count as the denominator; query pools can overlap. {result.source === 'live' ? 'Up to 200 returned posts are inspected per query.' : 'This frozen sample is not proof for a custom search.'}</p>
    {incomplete.length > 0 && <div className="sample-partial-warning" role="status" data-testid="status-partial-pages">
      <strong>Some query results are incomplete.</strong>
      <span>{incomplete.map(query => {
        const returned = `${number(query.fetchedVideos)} retrieved`;
        const expected = query.reportedTotalCount == null ? 'at the 200-post cap or with an unknown total' : `of ${number(query.reportedTotalCount)} reported matches`;
        return `${queryDisplay(query, false, '')}: ${returned} ${expected}`;
      }).join(' · ')}. Shares below use only the returned evidence.</span>
    </div>}
  </section>;
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
        <Link href="/" className="brand-lockup" data-testid="link-home"><span className="brand-icon"><span /></span><span className="brand-text"><span>Brand <i>Take</i></span><span className="brand-tagline">Brief from proof, not a guess</span></span></Link>
        <span className="header-center">CREATOR INTELLIGENCE / STRATEGY DESK</span>
        <div className="header-right"><span className="powered">Powered by <strong>Oriane</strong></span><span className="header-index">BT / 001</span></div>
      </div>
    </header>
    <div className="workspace">
      <aside className="sidebar no-print">
        <div className="sidebar-top"><div className="eyebrow">WORKSPACE / 01</div><p>A signal, not<br />a guess<span className="sidebar-period">.</span></p></div>
         <nav aria-label="Primary navigation">{links.map(item => <Link key={item.href} href={item.href} aria-current={location === item.href ? 'page' : undefined} className={`side-link ${location === item.href ? 'active' : ''}`} data-testid={`link-${item.href === '/' ? 'board' : item.href.slice(1)}`}><span className="side-number">{item.number}</span><item.icon size={16} strokeWidth={1.6} /><span>{item.label}</span>{location === item.href && <span className="side-arrow" aria-hidden="true">↗</span>}</Link>)}</nav>
        <div className="sidebar-bottom"><span className="small-rule" /><span className="eyebrow">THE WORKFLOW</span><p>Listen to creators.<br />Find the need.<br />Make the work.</p><div className="sidebar-footnote">{result ? 'ONE SEARCH / THREE OUTPUTS' : 'AWAITING FIRST SEARCH'}</div></div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
    <footer className="mobile-footer no-print"><span>BRAND TAKE</span><span>Powered by Oriane</span></footer>
  </div>;
}
export function PageIntro({ number: index, label, title, description, action }: { number: string; label: string; title: ReactNode; description: string; action?: ReactNode }) {
  return <section className="page-intro fade-up"><div className="intro-meta"><span className="eyebrow">{index} / {label}</span><SourceBadge /></div><div className="intro-line"><div><h1 className="serif page-title">{title}</h1><p className="page-description">{description}</p></div>{action && <div className="intro-action">{action}</div>}</div></section>;
}
export function EmptyRun({ heading = 'The story starts with a search.', text = 'Run four focused queries to see the creator evidence behind the category need.' }: { heading?: string; text?: string }) {
  return <div className="empty-run" data-testid="status-empty"><div className="empty-asterisk">∗</div><div className="eyebrow">NO SEARCH ON RECORD</div><h2 className="serif">{heading}</h2><p>{text}</p><Link className="btn-primary" href="/" data-testid="link-start-search">Set up a search <ArrowRight size={16} /></Link></div>;
}
export function SearchLoading() {
  return <section className="loading-block" data-testid="status-search-loading"><div className="loading-heading"><span className="eyebrow">ORIANE / SEARCH IN PROGRESS</span><span className="mono">04 / 04 QUERIES</span></div><h2 className="serif">Checking creator evidence<span className="loading-ellipsis">...</span></h2><p>TikTok + Instagram · published in the last 90 days · exact words in speech or caption · up to 200 posts per query · 25-second overall limit</p><div className="loading-grid">{['Brand', 'Brand B', 'Control', 'Category context'].map((q, i) => <div className="loading-cell" key={q}><span className="mono">0{i + 1}</span><strong>{q}</strong><div className="skeleton" /><small>Searching creator videos</small></div>)}</div></section>;
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
     return <div className="query-stat" key={id} data-testid={`stat-query-${id}`}><span className="query-stat-label">{metric ? queryDisplay(metric, reveal, runInput.competitor) : queryName(id)}</span><strong className="serif">{metric?.relevantVideos ? percent(metric.needVideoShare) : '—'}</strong><small>{metric ? `${number(metric.needVideos)} / ${number(metric.relevantVideos)} relevant analyzed videos · denominator` : 'No query metrics'}</small><div className="query-meter"><span style={{ width: `${Math.min(100, (metric?.needVideoShare || 0) * 100)}%` }} /></div></div>;
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
  const categoryQuery = hero?.queryMetrics.find(q => q.id === 'heat');
  const comparisonQueries = hero?.queryMetrics.filter(q => q.id !== 'heat') || [];
  const comparisonMatches = comparisonQueries.reduce((sum, q) => sum + q.relevantVideos, 0);
  const comparisonNeedMatches = comparisonQueries.reduce((sum, q) => sum + q.needVideos, 0);
  const comparisonShare = comparisonMatches ? comparisonNeedMatches / comparisonMatches : 0;
  const heroVideos = hero && result ? result.videos.filter(video => video.needIds.includes(hero.id)) : [];
  const reportedViewVideos = heroVideos.filter(video => video.views !== null);
  const platformCounts = heroVideos.reduce<Record<string, number>>((counts, video) => {
    counts[video.platform] = (counts[video.platform] || 0) + 1;
    return counts;
  }, {});
  const platformSummary = Object.entries(platformCounts).map(([platform, count]) => `${platform} ${number(count)}`).join(' · ') || 'No platform evidence';
  const [showMethod, setShowMethod] = useState(false);
  function field(id: keyof typeof input, label: string, index: string) {
    const placeholder = { brand: 'Brand or product name', competitor: 'A competing brand', control: 'Benchmark brands, separated by +', category: 'Product category and consumer situation' };
    return <label className="search-field" key={id}><span className="field-label"><span className="mono">{index}</span>{label}</span><input className="field" type={id === 'competitor' && !reveal ? 'password' : 'text'} autoComplete="off" placeholder={placeholder[id]} value={input[id]} onChange={e => setInput({ ...input, [id]: e.target.value })} maxLength={120} required data-testid={`input-${id}`} /></label>;
  }
  return <>
    <PageIntro number="01" label="THE SEARCH" title={<>Find the need.<br /><em>Brief from proof.</em></>} description="Search creator videos for a recurring consumer need, inspect original posts and exact spoken evidence, then hand creators a practical direction that works across video platforms. The search supports what to brief; it does not predict campaign results." />
    <section className="search-panel paper fade-up">
      <div className="panel-head"><div><span className="eyebrow">SEARCH PARAMETERS</span><h2 className="serif">Choose the category and context</h2><p className="panel-subtitle">Use the result to decide whether a recurring need is clear enough to brief—and which original posts the team should review.</p></div><div className="panel-head-right"><span>01 — 04</span><Search size={18} strokeWidth={1.4} /></div></div>
       <form onSubmit={e => { e.preventDefault(); run(); }}><div className="search-fields">{field('brand', 'Your brand', '01')}{field('competitor', 'Competitor / Brand B', '02')}{field('control', 'Category control', '03')}{field('category', 'Category context', '04')}</div>
         <div className="search-actions"><div className="search-helpers"><button type="button" className="reveal-button" aria-pressed={reveal} onClick={() => setReveal(!reveal)} data-testid="button-reveal-competitor">{reveal ? <EyeOff size={16} /> : <Eye size={16} />}{reveal ? 'Conceal competitor' : 'Privately reveal competitor'}</button><div className="example-buttons"><span>LOAD EXAMPLE</span>{examplePresets.map((preset, i) => <button key={preset.id} type="button" className="reveal-button" onClick={() => setInput({ ...preset.input })} data-testid={i === 0 ? 'button-load-example' : `button-load-example-${preset.id}`}>{preset.label}</button>)}</div></div><button type="submit" className="btn-primary run-button" disabled={isPending || Object.values(input).some(v => !v.trim())} data-testid="button-run-search">{isPending ? 'Searching…' : result ? 'Run new search' : 'Run search'} <ArrowRight size={17} /></button></div>
      </form>
      <div className="search-foot"><span>SEARCH SPECIFICATION</span><span>TikTok + Instagram · last 90 days · exact spoken words + caption match · max 200 / query</span></div>
    </section>
    {isPending ? <SearchLoading /> : searchError ? <ErrorBlock message={searchError} onRetry={run} /> : result ? <>
       <div className="results-divider"><span className="eyebrow">THIS RUN / {stored?.input.brand} · {stored?.input.category}</span><span className="eyebrow">{stored && date(stored.at)}</span></div>
      <SourceNotice />
       <SampleProvenance />
      {hero ? <>
        <section className="hero-need fade-up">
           <div className="hero-need-left"><span className="eyebrow">RECURRING NEED / {String(result.needs.findIndex(n => n.id === hero.id) + 1).padStart(2, '0')}</span><h2 className="serif">{hero.label}</h2><p>Ranked by distinct creators in this run. Review the originals, then decide whether this is a useful brief direction.</p><div className="hero-links"><Link href="/evidence" className="btn-primary" data-testid="link-review-evidence">Inspect original evidence <ArrowRight size={16} /></Link><Link href="/brief" className="text-link" data-testid="link-build-brief">Create a shareable brief <ArrowUpRight size={15} /></Link></div></div>
           <div className="hero-need-right"><div className="eyebrow">OBSERVED CREATOR POSTS / NOT REACH</div><div className="hero-big serif">{number(hero.creatorCount)}</div><div className="hero-big-label">distinct creators mentioning this need</div><div className="hero-small-stats"><div><strong>{number(hero.videoCount)}</strong><span>need-matched videos</span></div><div><strong>{reportedViewVideos.length ? compact(hero.totalViews) : '—'}</strong><span>observed post views total</span></div><div><strong>{reportedViewVideos.length ? compact(hero.medianViews) : '—'}</strong><span>median reported views</span></div></div><div className="hero-platform-context"><span>Need-matched posts by platform</span><strong>{platformSummary}</strong><small>{reportedViewVideos.length} of {heroVideos.length} need-matched posts report view counts.</small></div></div>
        </section>
           <section className="share-section"><div className="section-topline"><span className="eyebrow">COMPARISON / WHERE THE NEED APPEARS</span><span className="mono">DIRECTIONAL QUERY SHARES</span></div><h2 className="serif section-title">Check the need <em>across the search.</em></h2><div className="share-comparison"><div className="share-block"><span>CATEGORY CONTEXT QUERY</span><strong className="serif">{categoryQuery?.relevantVideos ? percent(categoryQuery.needVideoShare) : '—'}</strong><small>{number(categoryQuery?.needVideos || 0)} need-matched / {number(categoryQuery?.relevantVideos || 0)} relevant analyzed videos in this query.</small></div><div className="share-vs">VS</div><div className="share-block"><span>BRAND + CONTROL QUERIES</span><strong className="serif">{comparisonMatches ? percent(comparisonShare) : '—'}</strong><small>{number(comparisonNeedMatches)} need-matched / {number(comparisonMatches)} relevant query matches across three comparison pools.</small></div></div><p className="fineprint">Comparison is descriptive, not a competitor gap. The denominator sums each query pool; one post can appear in more than one pool. A dash means no relevant analyzed denominator, not a zero need rate.</p></section>
        <QueryStrip metrics={hero.queryMetrics} />
       </> : <div className="empty-run" data-testid="status-insufficient-evidence"><div className="eyebrow">INSUFFICIENT EVIDENCE / NO NEED TO BRIEF</div><h2 className="serif">{result.videos.length ? 'No recurring need cleared the evidence checks.' : 'No linked video evidence cleared the search checks.'}</h2><p>{result.videos.length ? `${number(result.videos.length)} linked videos were returned, but none had a transcript excerpt meeting the need rules for this run.` : 'No videos with usable transcript, platform, and original-post evidence were returned for this run.'} This is not proof that the need is absent. Try broader search wording or a different category context.</p></div>}
       <section className="need-board"><div className="section-topline"><span className="eyebrow">NEED BOARD / {number(result.needs.length)} IDENTIFIED</span><span className="mono">RANKED BY DISTINCT CREATORS</span></div><h2 className="serif section-title">The other conversations.</h2>{result.needs.length ? <div className="need-list">{[...result.needs].sort((a,b) => b.creatorCount - a.creatorCount || b.videoCount - a.videoCount).map((need, i) => <button key={need.id} className={`need-row ${hero?.id === need.id ? 'selected' : ''}`} aria-pressed={hero?.id === need.id} onClick={() => { setSelectedNeedId(need.id); window.scrollTo({ top: 500, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); }} data-testid={`button-need-${need.id}`}><span className="mono need-index">{String(i + 1).padStart(2, '0')}</span><span className="need-row-main"><strong className="serif">{need.label}</strong><small>{need.complaintLines[0] || 'Creator conversation identified in the search.'}</small></span><span className="need-row-data"><strong>{number(need.creatorCount)}</strong><small>creators</small></span><span className="need-row-data"><strong>{number(need.videoCount)}</strong><small>videos</small></span><ArrowUpRight size={18} className="need-row-arrow" /></button>)}</div> : <p>No needs surfaced in this run.</p>}</section>
       <div className="method-block"><button onClick={() => setShowMethod(!showMethod)} aria-expanded={showMethod} data-testid="button-methodology"><span><CircleHelp size={17} /> How to read this signal</span><span>{showMethod ? '−' : '+'}</span></button>{showMethod && <p>The server groups short spoken excerpts using deterministic complaint-phrase rules, not AI interpretation or translation. Creator counts represent distinct platform-and-handle pairs. Query shares use need-matched videos over relevant analyzed videos; query pools may overlap. Post views are observed counts, not unique or incremental people reached, a forecast, or ROI. Campaign ROI also requires spend and outcome data that this search does not contain. Evidence is directional, not a population estimate; inspect original posts before production.</p>}</div>
    </> : <div className="home-empty"><div className="empty-rule" /><span className="eyebrow">SEARCH → EVIDENCE → CREATOR BRIEF</span><h2 className="serif">Find a recurring need.<br /><em>Choose what to brief.</em></h2><p>Start with four searches. Signal checks creator videos for a recurring need, links you to the original posts and exact spoken evidence, then turns the reviewed finding into a practical creator brief. Your team still decides whether the direction fits the campaign.</p><div className="empty-steps"><span>01 / DISCOVER A NEED</span><span>02 / CHECK ORIGINAL POSTS</span><span>03 / SHARE A BRIEF</span></div></div>}
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
       <SampleProvenance />
      <section className="evidence-summary"><div><span className="eyebrow">SOURCE LEDGER</span><h2 className="serif">{number(result.videos.length)} linked videos<span className="punctuation">.</span></h2></div><div className="evidence-summary-detail"><span>{number(result.totalRelevantVideos)} relevant videos in analysis</span><span>Exact excerpts are shown where available</span></div></section>
       <div className="evidence-toolbar no-print"><div className="filter-group"><span className="eyebrow">FILTER / NEED</span><select aria-label="Filter by need" value={needFilter} onChange={e => { setNeedFilter(e.target.value); if (e.target.value !== 'all') setSelectedNeedId(e.target.value); }} data-testid="select-need-filter"><option value="all">All needs</option>{result.needs.map(n => <option key={n.id} value={n.id}>{n.label}</option>)}</select></div><div className="filter-group"><span className="eyebrow">PLATFORM</span><div className="segmented" aria-label="Filter by platform">{['all', 'tiktok', 'instagram', 'other'].map(p => <button key={p} type="button" aria-pressed={platform === p} className={platform === p ? 'active' : ''} onClick={() => setPlatform(p)} data-testid={`button-platform-${p}`}>{p === 'all' ? 'All' : p === 'tiktok' ? 'TikTok' : p === 'instagram' ? 'Instagram' : 'Other'}</button>)}</div></div></div>
        {displayed.length ? <div className="evidence-list">{displayed.map((video, i) => <article className="evidence-card paper" key={video.id} data-testid={`card-evidence-${video.id}`}><div className="evidence-card-top"><div className="evidence-number mono">EVIDENCE / {String(i + 1).padStart(2, '0')}</div><div className="platform-label">{video.platform.toUpperCase()} <ExternalLink size={12} /></div></div><div className="evidence-card-body"><div className="evidence-main"><div className="evidence-handle"><span className="handle-mark">{video.handle.replace('@','').slice(0,2).toUpperCase()}</span><div><strong>{video.handle}</strong><span>{video.followers == null ? 'Followers not reported' : `${compact(video.followers)} followers`}</span></div></div><div className="quote-label"><span className="eyebrow">EXACT EVIDENCE SENTENCE</span><span className="mono">{video.evidenceTime || 'Time not supplied'}</span></div><blockquote dir="auto">{video.evidenceSentence ? <mark>{video.evidenceSentence}</mark> : <span className="no-quote">No exact sentence was returned for this video. Review the original caption and transcript.</span>}</blockquote><div className="evidence-needs">{video.needIds.map(id => { const need = result.needs.find(n => n.id === id); return need ? <NeedBadge key={id} need={need} /> : null; })}</div></div><div className="evidence-aside"><div><span>POSTED</span><strong>{date(video.date)}</strong></div><div><span>OBSERVED POST VIEWS</span><strong>{compact(video.views)}</strong></div><div><span>LANGUAGE</span><strong>{video.language || 'Not reported'}</strong></div><div><span>FOUND VIA</span><strong>{video.sourceQueries.map(id => id === 'competitor' ? (reveal ? runInput.competitor : 'Brand B') : queryName(id)).join(' · ') || 'Not reported'}</strong></div></div></div><div className="evidence-card-bottom"><VideoSourceLink video={video} /><button onClick={() => setExpanded(expanded === video.id ? null : video.id)} aria-expanded={expanded === video.id} data-testid={`button-context-${video.id}`}>{expanded === video.id ? 'Hide full context −' : 'Read caption + transcript +'}</button></div>{expanded === video.id && <div className="evidence-context"><div><span className="eyebrow">ORIGINAL CAPTION</span><p dir="auto">{video.caption || 'No caption supplied.'}</p></div><div><span className="eyebrow">TRANSCRIPT</span><p dir="auto">{video.transcript || 'No transcript supplied.'}</p></div></div>}</article>)}</div> : result.videos.length === 0 ? <div className="filter-empty" data-testid="status-insufficient-evidence"><h2 className="serif">Insufficient linked evidence.</h2><p>The search returned no videos with usable transcript, platform, and original-post evidence. That does not show the need is absent.</p></div> : <div className="filter-empty"><h2 className="serif">No videos in this view.</h2><p>Try another need or platform filter.</p><button className="btn-outline" onClick={() => { setNeedFilter('all'); setPlatform('all'); }} data-testid="button-reset-filters">Clear filters</button></div>}
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
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => {
    if (!stored?.at) return;
    try {
      sessionStorage.setItem(briefDraftKey(stored.at), JSON.stringify({ productName, claimText, claimSource, selectedClaims, customClaims }));
    } catch { /* Storage can be unavailable in private browsing mode. */ }
  }, [stored?.at, productName, claimText, claimSource, selectedClaims, customClaims]);
  const need = result?.needs.find(n => n.id === selectedNeedId) || result?.needs.find(n => n.id === result.heroNeedId) || result?.needs[0];
  const exampleSearch = !!stored && isExactExampleSearch(stored.input, exampleInput);
  const claimPresets = stored ? examplePresets.find(preset => preset.claimPresets && isExactExampleSearch(stored.input, preset.input))?.claimPresets || [] : [];
  function loadClaimPreset(preset: ExampleClaimPreset) {
    if (preset.product !== productName) { setCustomClaims([]); setSelectedClaims([]); }
    setProductName(preset.product); setClaimText(preset.claim); setClaimSource(preset.source); setClaimError('');
  }
  const validClaims = exampleSearch ? (config?.claims.filter(c => c.verified) || []) : customClaims;
  const chosen = validClaims.filter(c => selectedClaims.includes(c.claim));
  const adClaims = chosen.filter(c => c.useInAd);
  const videoClaims = config?.claims.filter(c => c.verified && c.useInAd) || [];
  const videoClaimsApproved = videoClaims.length > 0 && videoClaims.every(c => selectedClaims.includes(c.claim));
  const unlocked = !!need && canUnlockBrief(exampleSearch, chosen.length, productName, ownerAttests);
  const eligibleVideo = canShowConceptPrototype({
    exampleSearch,
    unlocked,
    selectedAdClaimCount: adClaims.length,
    allAdClaimsApproved: videoClaimsApproved,
    heroNeedId: result?.heroNeedId,
    selectedNeedId: need?.id,
  });
  const guardrails = exampleSearch ? (config?.neverClaim || []) : ['Do not present user-approved claims as independently verified by Brand Take', 'Do not quote a creator as an endorsement', 'Do not claim superiority to a named competitor without substantiation', 'Do not make unsupported clinical, safety, or performance promises'];
  const videoSrc = `${import.meta.env.BASE_URL}hero-ad.mp4`;
  function toggleClaim(claim: string) { setSelectedClaims(v => v.includes(claim) ? v.filter(c => c !== claim) : [...v, claim]); }
  async function copyBriefText() {
    if (!need || !stored || !result) return;
    const needVideos = result.videos.filter(video => video.needIds.includes(need.id));
    const viewVideos = needVideos.filter(video => video.views !== null);
    const platformCounts = needVideos.reduce<Record<string, number>>((counts, video) => {
      counts[video.platform] = (counts[video.platform] || 0) + 1;
      return counts;
    }, {});
    const platformSummary = Object.entries(platformCounts).map(([platform, count]) => `${platform}: ${number(count)}`).join(' · ') || 'No linked platform evidence';
    const evidence = [...needVideos].sort((a, b) => (b.views ?? -1) - (a.views ?? -1)).slice(0, 5);
    const brief = buildBriefShareText({
      brand: stored.input.brand,
      category: stored.input.category,
      need: need.label,
      runSource: result.source === 'live' ? 'Live Oriane response' : 'Saved historical 27 Sep 2026 sunscreen example — not live evidence',
      sampleWindow: sampleWindowText(result.sampleWindow, result.source),
      creatorCount: need.creatorCount,
      videoCount: need.videoCount,
      totalViews: viewVideos.length ? compact(need.totalViews) : 'Not reported',
      medianViews: viewVideos.length ? compact(need.medianViews) : 'Not reported',
      viewsReported: viewVideos.length,
      platformSummary,
      claims: chosen.map(claim => ({
        claim: claim.claim,
        source: claim.source,
        approvalLabel: exampleSearch ? 'brand-verified example' : 'owner-approved, not independently verified by Brand Take',
      })),
      guardrails,
      evidence: evidence.map(video => ({
        handle: video.handle,
        platform: video.platform,
        date: date(video.date),
        url: video.url,
      })),
    });
    try {
      await navigator.clipboard.writeText(brief);
      setCopyStatus('Brief copied with approved claims and original evidence links.');
    } catch {
      setCopyStatus('Copy is unavailable in this browser. Use Print brief to hand off this content.');
    }
  }
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
    <PageIntro number="03" label="THE BRIEF" title={<>A brief with <em>boundaries.</em></>} description="Turn the reviewed need into a platform-agnostic creator handoff. Copy the text or print it; the brief carries approved claims, guardrails, sample context, and links to original posts." action={unlocked && need && <div className="brief-actions no-print"><button className="btn-outline" onClick={copyBriefText} data-testid="button-copy-brief"><ClipboardCopy size={15} /> Copy brief text</button><button className="btn-outline" onClick={() => window.print()} data-testid="button-print-brief"><Printer size={15} /> Print brief</button>{copyStatus && <span role="status" data-testid="status-copy-brief">{copyStatus}</span>}</div>} />
    {isPending ? <SearchLoading /> : !result ? <EmptyRun heading="No evidence, no brief." text="A creator direction is only as useful as the source beneath it. Run a search before writing one." /> : <>
      <SourceNotice />
      <SampleProvenance />
      <div className="brief-layout">
          <aside className="claim-panel no-print"><span className="eyebrow">01 / CLAIM CONTROL</span><h2 className="serif">Choose what can be said.</h2><p>{exampleSearch ? 'Example-only register. Select at least one verified claim; brief-only claims are excluded from the test ad.' : 'Custom run. Supply your own product and owner-approved claim. Brand Take does not independently verify these claims.'}</p>
           {exampleSearch ? (configLoading ? <div className="claim-skeleton"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /></div> : configError ? <div className="claim-error"><strong>Example claim register unavailable.</strong><p>The brief remains locked until the verified example register loads.</p><button className="btn-outline" onClick={retryConfig} data-testid="button-retry-config"><RotateCcw size={14} /> Retry</button></div> : <>
             <div className="product-label"><span>DEMO PRODUCT / BRAND-SOURCED REGISTER</span><strong>{config?.product}</strong></div><div className="claims">{config?.claims.map((item, i) => <label key={`${item.claim}-${i}`} className={`claim-row ${!item.verified ? 'unverified' : ''}`}><input type="checkbox" disabled={!item.verified} checked={selectedClaims.includes(item.claim)} onChange={() => toggleClaim(item.claim)} data-testid={`checkbox-claim-${i}`} /><span className="claim-check" /><span className="claim-copy"><strong>{item.claim}</strong><small>{item.verified ? (item.useInAd ? 'BRAND-VERIFIED / BRIEF + AD' : 'BRAND-VERIFIED / BRIEF ONLY') : 'UNVERIFIED / LOCKED'}</small><a href={item.source} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} data-testid={`link-claim-source-${i}`}>View official claim source <ArrowUpRight size={11} /></a></span></label>)}</div>
           </>) : <div className="custom-register"><div className="owner-notice"><ShieldCheck size={17} /><span>USER-APPROVED CLAIMS<br /><small>Not independently verified by Brand Take. No demo claims are used.</small></span></div>{claimPresets.length > 0 && <div className="example-buttons claim-presets"><span>LOAD EXAMPLE CLAIM</span>{claimPresets.map(preset => <button key={preset.id} type="button" className="reveal-button" onClick={() => loadClaimPreset(preset)} data-testid={`button-load-claim-${preset.id}`}>{preset.claim}</button>)}</div>}<form onSubmit={addCustomClaim} className="custom-claim-form">
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
            {!unlocked ? <div className="brief-locked paper" data-testid="status-brief-locked"><div className="lock-emblem"><LockKeyhole size={26} strokeWidth={1.4} /></div><span className="eyebrow">{need ? 'CLAIM GATE / LOCKED' : 'EVIDENCE GATE / LOCKED'}</span><h2 className="serif">Proof before persuasion.</h2><p>{!need ? 'This run did not return a need that cleared the evidence checks. A claim cannot unlock a brief without an evidence-backed need.' : exampleSearch ? 'Select at least one brand-verified example claim to unlock the brief.' : 'Name your product, add a claim with an official HTTPS source, attest that you approved it, then select it to unlock the brief.'}</p><div className="locked-foot"><ShieldCheck size={16} /> No unapproved claim enters the brief.</div></div> : need ? <CreatorBriefDocument brand={stored?.input.brand || ''} category={stored?.input.category || ''} productName={exampleSearch ? (config?.product || '') : productName.trim()} source={result.source} sampleWindow={result.sampleWindow} need={need} videos={result.videos.filter(video => video.needIds.includes(need.id))} claims={chosen} guardrails={guardrails} /> : <div className="filter-empty">No need was returned to brief.</div>}
           <section className="test-ad-section no-print"><div className="section-topline"><span className="eyebrow">02 / CONCEPT PROTOTYPE</span><span className="mono">NOT A CAMPAIGN ASSET</span></div><h2 className="serif">See the idea <em>in motion.</em></h2>{!exampleSearch ? <div className="test-ad-unavailable"><Video size={21} /><p>No test film exists for this custom search. The supplied demo film is never used for custom brands or categories.</p></div> : !unlocked ? <div className="test-ad-unavailable"><Video size={21} /><p>Choose a verified example claim before reviewing the concept prototype.</p></div> : adClaims.length === 0 ? <div className="test-ad-unavailable"><Video size={21} /><p>No ad-approved claim is selected. Brief-only claims are kept out of the test ad.</p></div> : !videoClaimsApproved ? <div className="test-ad-unavailable"><Video size={21} /><p>The fixed concept film uses the full set of ad-approved demo claims. Select all of them to review it; your brief can still use a smaller selection.</p></div> : eligibleVideo ? <div className="video-frame"><video controls playsInline preload="metadata" src={videoSrc} data-testid="video-test-ad">Your browser does not support video playback.</video><div className="video-caption"><span>CONCEPT FILM / 01</span><p>AI-generated presenter, concept prototype, not the campaign.</p></div></div> : <div className="test-ad-unavailable"><Video size={21} /><p>The filmed test is only for the explicit sunscreen example's reapply-in-heat hero need. No film has been generated for this selection.</p></div>}</section>
        </div>
      </div>
    </>}
  </>;
}