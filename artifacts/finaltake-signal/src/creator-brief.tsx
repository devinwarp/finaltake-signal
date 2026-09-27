import type { SignalNeed, SignalSampleWindow, SignalVideo } from '@workspace/api-client-react';

type BriefClaim = {
  claim: string;
  source: string;
  useInAd: boolean;
};

export function CreatorBriefDocument({
  brand,
  category,
  productName,
  source,
  sampleWindow,
  need,
  videos,
  claims,
  guardrails,
}: {
  brand: string;
  category: string;
  productName: string;
  source: 'live' | 'backup';
  sampleWindow: SignalSampleWindow;
  need: SignalNeed;
  videos: SignalVideo[];
  claims: BriefClaim[];
  guardrails: string[];
}) {
  const evidence = [...videos].sort((a, b) => (b.views ?? -1) - (a.views ?? -1)).slice(0, 5);
  const views = videos.filter((video) => video.views !== null);
  const platformCounts = videos.reduce<Record<string, number>>((counts, video) => {
    counts[video.platform] = (counts[video.platform] || 0) + 1;
    return counts;
  }, {});
  const platformSummary = Object.entries(platformCounts)
    .map(([platform, count]) => `${platform === 'tiktok' ? 'TikTok' : platform === 'instagram' ? 'Instagram' : 'Other'} ${count}`)
    .join(' · ') || 'No linked platform evidence';
  const sourceLabel = source === 'live'
    ? 'Live Oriane response'
    : 'Saved historical sunscreen example — not live evidence';
  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);
  const formatCompact = (value: number) => new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
  const formatDate = (value: string | null) => value
    ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Date not reported';
  const sampleLabel = source === 'backup'
    ? `${formatDate(sampleWindow.startAt)}–${formatDate(sampleWindow.endAt)} · fixed ${sampleWindow.days}-day historical sunscreen example`
    : `${formatDate(sampleWindow.startAt)}–${formatDate(sampleWindow.endAt)} · videos published within the ${sampleWindow.days}-day search window`;

  return <article className="print-sheet paper brief-sheet fade-up" data-testid="document-creator-brief">
    <div className="brief-sheet-top"><span>FINALTAKE / CREATOR DIRECTION</span><span>{sourceLabel.toUpperCase()}</span></div>
    <div className="brief-sheet-title">
      <span className="eyebrow">A CREATOR BRIEF FOR / {brand.toUpperCase()}</span>
      <h2 className="serif">A need worth<br /><em>putting to work.</em></h2>
      <p>Need / {need.label}</p>
      <p className="brief-window">Search: {category} · {sampleLabel}</p>
    </div>
    <div className="brief-sheet-columns">
      <div className="brief-body">
        <section><span className="brief-num">01</span><div>
          <h3>Objective</h3>
          <p>Use this recurring need as a starting point for a creator-led video direction. Review the original posts, then decide whether the need fits the campaign. This search does not predict campaign results.</p>
        </div></section>
        <section><span className="brief-num">02</span><div>
          <h3>The human tension</h3>
          <p>Show when {need.label.toLocaleLowerCase()} becomes relevant in an everyday routine. Find a specific moment the audience can recognize, then describe it in fresh language rather than repeating a creator’s words.</p>
        </div></section>
        <section><span className="brief-num">03</span><div>
          <h3>Creator task</h3>
          <p>Create a short, observational video around this real-life situation. Demonstrate your own routine honestly; if appropriate, show {productName} as one option being considered. Keep the experience specific, not universal.</p>
        </div></section>
        <section><span className="brief-num">04</span><div>
          <h3>Scene sequence</h3>
          <ol>
            <li><strong>Open:</strong> Set the scene in a recognizable everyday moment.</li>
            <li><strong>Show:</strong> Demonstrate the need in your own routine.</li>
            <li><strong>Try:</strong> Show the product clearly and describe only your actual experience.</li>
            <li><strong>Close:</strong> Share a practical personal takeaway without a universal promise.</li>
          </ol>
        </div></section>
        <section><span className="brief-num">05</span><div>
          <h3>Creator fit</h3>
          <p>Choose a creator whose regular content naturally includes this category or situation and who can demonstrate it credibly in their own style. The observed need sample includes {platformSummary}. No single platform, publishing integration, or reuse of source creators’ words or shots is required.</p>
        </div></section>
        <section><span className="brief-num">06</span><div>
          <h3>Approved product language</h3>
          {claims.length ? <ul className="approved-list">{claims.map((claim, index) => <li key={`${claim.claim}-${index}`}>
            {claim.claim}
            <small>{source === 'backup' ? (claim.useInAd ? 'BRAND-VERIFIED EXAMPLE / BRIEF + TEST AD' : 'BRAND-VERIFIED EXAMPLE / BRIEF ONLY') : 'OWNER-APPROVED / NOT INDEPENDENTLY VERIFIED BY FINALTAKE'}</small>
            <a href={claim.source} target="_blank" rel="noopener noreferrer">Official claim source <span aria-hidden="true">↗</span></a>
          </li>)}</ul> : <p>No product claims are approved for this brief. Do not make product claims until the owner approves them.</p>}
          <p className="brief-caveat">{source === 'backup' ? 'These are brand-sourced example statements, not creator testimony.' : 'Custom claims were supplied and approved by the brand or agency owner; Brand Take has not independently verified them.'} Use only in a manner consistent with the cited source and actual experience.</p>
        </div></section>
      </div>
      <aside className="brief-margin">
        <span className="eyebrow">RUN EVIDENCE</span>
        <strong className="serif">{formatNumber(need.creatorCount)}</strong><span>distinct creators</span>
        <div className="brief-margin-rule" />
        <strong className="serif">{formatNumber(need.videoCount)}</strong><span>need-matched videos</span>
        <div className="brief-margin-rule" />
        <strong className="serif">{views.length ? formatCompact(need.totalViews) : '—'}</strong><span>observed post views total</span>
        <small>Median {views.length ? formatCompact(need.medianViews) : 'not reported'} · view count reported on {views.length} of {videos.length} need-matched posts</small>
        <p>Post views are not unique people reached, incremental reach, a forecast, or ROI. ROI needs campaign spend and outcome data that search does not contain.</p>
      </aside>
    </div>
    <div className="brief-sheet-bottom">
      <div><span className="eyebrow">GUARDRAILS / NEVER CLAIM</span>
        <ul className="brief-guardrails">
          <li>Paraphrase the need; never use a creator’s exact sentence as ad copy or endorsement.</li>
          {guardrails.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          <li>Check all claim sources and original posts before production.</li>
        </ul>
      </div>
      <div><span className="eyebrow">ORIGINAL EVIDENCE LINKS</span>
        <p>{formatNumber(need.videoCount)} need-matched videos / {formatNumber(need.creatorCount)} distinct creators · {sourceLabel}.</p>
        {evidence.length
          ? <ul className="brief-source-links">{evidence.map((video) => <li key={video.id}>
            <a href={video.url} target="_blank" rel="noopener noreferrer">{video.handle} · {video.platform} · {formatDate(video.date)}{video.views === null ? '' : ` · ${formatCompact(video.views)} post views`} ↗</a>
          </li>)}</ul>
          : <p>No linked original posts were returned for this need.</p>}
        <p className="brief-source-note">Original videos remain on their source platforms; Signal links out and does not re-host them. See the Evidence page for the full returned sample and exact excerpts.</p>
      </div>
    </div>
    <div className="brief-sheet-footer"><span>FINALTAKE SIGNAL</span><span>Powered by Oriane · Need → Evidence → Brief</span></div>
  </article>;
}