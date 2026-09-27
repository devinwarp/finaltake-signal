import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

async function loadBundledModule(entryPoint) {
  const { outputFiles } = await build({
    entryPoints: [entryPoint],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    jsx: 'automatic',
    write: false,
  });
  const encoded = Buffer.from(outputFiles[0].text).toString('base64');
  return import(`data:text/javascript;base64,${encoded}`);
}

const oriane = await loadBundledModule('src/lib/signal/oriane.ts');
const analysis = await loadBundledModule('src/lib/signal/analysis.ts');
const uiLogic = await loadBundledModule('../finaltake-signal/src/signal-logic.ts');
const briefDocument = await loadBundledModule('../finaltake-signal/src/creator-brief.tsx');
const frontendRequire = createRequire(new URL('../../../../finaltake-signal/package.json', import.meta.url));
const React = frontendRequire('react');
const { renderToStaticMarkup } = frontendRequire('react-dom/server');

const customInput = {
  brand: 'Orchid Labs',
  competitor: 'Fern House',
  control: 'Daily Dew + Clear Coast',
  category: 'face moisturizer during winter',
};

function emptySearchResponse(totalCount = 0) {
  return new Response(JSON.stringify({
    data: { results: [] },
    metadata: { pagination: { totalCount } },
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

test('live search uses authenticated requests, one exact 90-day window, and validates response shape', async (t) => {
  const oldKey = process.env.ORIANE_API_KEY;
  const oldFetch = globalThis.fetch;
  process.env.ORIANE_API_KEY = 'test-credential-never-printed';
  const requests = [];
  globalThis.fetch = async (requestUrl, options) => {
    const url = new URL(requestUrl);
    assert.equal(options.headers.Authorization, 'Bearer test-credential-never-printed');
    assert.equal(url.searchParams.get('limit'), '100');
    assert.equal(url.searchParams.get('sort'), 'publishedAt:desc');
    const body = JSON.parse(options.body);
    requests.push({ body, url });
    return emptySearchResponse(0);
  };
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.ORIANE_API_KEY;
    else process.env.ORIANE_API_KEY = oldKey;
  });

  const groups = await oriane.searchOriane(customInput);
  assert.equal(requests.length, 4);
  assert.deepEqual(requests.map(({ body }) => body.name).sort(), ['brand', 'competitor', 'control', 'heat']);
  assert.ok(requests.every(({ body }) => body.filters.publishedAt.after === groups.sampleWindow.startAt));
  assert.ok(requests.every(({ body }) => body.filters.publishedAt.before === groups.sampleWindow.endAt));
  assert.equal(groups.sampleWindow.days, 90);
  assert.equal(Date.parse(groups.sampleWindow.endAt) - Date.parse(groups.sampleWindow.startAt), 90 * 24 * 60 * 60 * 1000);
  assert.deepEqual(groups.diagnostics.brand, { reportedTotalCount: 0, isPartial: false });

  const invalidFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ data: {} }), { status: 200 });
  await assert.rejects(oriane.searchOriane(customInput), /without video results/);
  globalThis.fetch = invalidFetch;
});

test('a failed second page preserves the first page and marks that query partial', async (t) => {
  const oldKey = process.env.ORIANE_API_KEY;
  const oldFetch = globalThis.fetch;
  process.env.ORIANE_API_KEY = 'test-credential-never-printed';
  globalThis.fetch = async (requestUrl, options) => {
    const url = new URL(requestUrl);
    const body = JSON.parse(options.body);
    if (body.name === 'brand' && url.searchParams.get('offset') === '100') {
      throw new Error('simulated page-two failure');
    }
    const rows = body.name === 'brand' && url.searchParams.get('offset') === '0'
      ? Array.from({ length: 100 }, (_, index) => ({ id: `row-${index}`, platform: 'tiktok' }))
      : [];
    return new Response(JSON.stringify({
      data: { results: rows },
      metadata: { pagination: { totalCount: body.name === 'brand' ? 130 : 0, aiSearchAnchor: 'page-2' } },
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  t.after(() => {
    globalThis.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.ORIANE_API_KEY;
    else process.env.ORIANE_API_KEY = oldKey;
  });

  const groups = await oriane.searchOriane(customInput);
  assert.equal(groups.brand.length, 100);
  assert.deepEqual(groups.diagnostics.brand, { reportedTotalCount: 130, isPartial: true });
  assert.deepEqual(groups.diagnostics.competitor, { reportedTotalCount: 0, isPartial: false });
});

test('an overall deadline aborts pending page requests instead of waiting indefinitely', async (t) => {
  const oldKey = process.env.ORIANE_API_KEY;
  const oldFetch = globalThis.fetch;
  const timeoutDescriptor = Object.getOwnPropertyDescriptor(AbortSignal, 'timeout');
  process.env.ORIANE_API_KEY = 'test-credential-never-printed';
  let observedOverallTimeout = 0;
  globalThis.fetch = (_requestUrl, options) => new Promise((_resolve, reject) => {
    if (options.signal.aborted) {
      reject(options.signal.reason);
      return;
    }
    options.signal.addEventListener('abort', () => reject(options.signal.reason), { once: true });
  });
  AbortSignal.timeout = (milliseconds) => {
    if (milliseconds === 25_000) {
      observedOverallTimeout = milliseconds;
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException('Timed out', 'TimeoutError')), 5);
      return controller.signal;
    }
    return timeoutDescriptor.value.call(AbortSignal, milliseconds);
  };
  t.after(() => {
    globalThis.fetch = oldFetch;
    Object.defineProperty(AbortSignal, 'timeout', timeoutDescriptor);
    if (oldKey === undefined) delete process.env.ORIANE_API_KEY;
    else process.env.ORIANE_API_KEY = oldKey;
  });

  await assert.rejects(oriane.searchOriane(customInput), /Timed out/);
  assert.equal(observedOverallTimeout, 25_000);
});

test('need metrics use returned evidence, distinct creators, observed views, and run provenance', () => {
  const startAt = '2026-06-29T00:00:00.000Z';
  const endAt = '2026-09-27T00:00:00.000Z';
  const evidenceVideo = (id, platform, handle, views) => ({
    id,
    url: platform === 'instagram'
      ? `https://www.instagram.com/reel/${id}/`
      : `https://www.tiktok.com/@${handle}/video/${id}`,
    platform,
    profileHandle: handle,
    viewsCount: views,
    publishedAt: '2026-09-20T12:00:00.000Z',
    transcript: 'When I sweat in the heat, I need to reapply my face moisturizer.',
    caption: '',
  });
  const groups = {
    brand: [
      evidenceVideo('1001', 'tiktok', 'creator-a', 12_000),
      evidenceVideo('2002', 'instagram', 'creator-b', 8_000),
      {
        id: '3003',
        url: 'https://www.tiktok.com/@creator-c/video/3003',
        platform: 'tiktok',
        profileHandle: 'creator-c',
        publishedAt: '2026-09-19T12:00:00.000Z',
        transcript: 'My face moisturizer is part of my morning routine.',
        caption: '',
      },
    ],
    competitor: [],
    control: [],
    heat: [],
    diagnostics: {
      brand: { reportedTotalCount: 8, isPartial: false },
    },
    sampleWindow: { startAt, endAt, days: 90 },
  };
  const result = analysis.analyzeSignal(groups, customInput, 'live', null);
  const need = result.needs.find(({ id }) => id === 'sweat_reapply');
  assert.equal(result.source, 'live');
  assert.deepEqual(result.sampleWindow, groups.sampleWindow);
  assert.equal(result.totalRelevantVideos, 3);
  assert.equal(need.videoCount, 2);
  assert.equal(need.creatorCount, 2);
  assert.equal(need.totalViews, 20_000);
  assert.equal(need.medianViews, 10_000);
  assert.equal(need.queryMetrics[0].reportedTotalCount, 8);
  assert.equal(need.queryMetrics[0].isPartial, false);
  assert.equal(need.queryMetrics[0].needVideoShare, 2 / 3);
  assert.equal(result.needs.every((item) => item.totalViews !== undefined), true);
});

test('an empty live response stays an empty result with zero denominators', () => {
  const result = analysis.analyzeSignal({
    brand: [],
    competitor: [],
    control: [],
    heat: [],
    diagnostics: {
      brand: { reportedTotalCount: 0, isPartial: false },
      competitor: { reportedTotalCount: 0, isPartial: false },
      control: { reportedTotalCount: 0, isPartial: false },
      heat: { reportedTotalCount: 0, isPartial: false },
    },
    sampleWindow: {
      startAt: '2026-06-29T00:00:00.000Z',
      endAt: '2026-09-27T00:00:00.000Z',
      days: 90,
    },
  }, customInput, 'live', null);
  assert.equal(result.source, 'live');
  assert.equal(result.heroNeedId, null);
  assert.deepEqual(result.needs, []);
  assert.equal(result.totalRelevantVideos, 0);
  assert.ok(result.queries.every((query) => query.needVideoShare === 0 && query.needCreatorShare === 0));
});

test('default backup and sunscreen prototype require the exact example concept', () => {
  const example = {
    brand: 'Beauty of Joseon',
    competitor: 'Neutrogena',
    control: 'Nivea Sun + Skin1004',
    category: 'sunscreen in heat',
  };
  assert.equal(oriane.isDefaultSearch(example), true);
  assert.equal(oriane.isDefaultSearch({ ...example, category: 'sunscreen in winter' }), false);
  assert.equal(uiLogic.isExactExampleSearch(example, example), true);
  assert.equal(uiLogic.isExactExampleSearch({ ...example, category: 'sunscreen in winter' }, example), false);
  assert.equal(uiLogic.isExactExampleSearch({ ...example, brand: ' BEAUTY OF JOSEON ' }, example), true);
});

test('custom briefs stay claim-gated and the prototype needs every exact example gate', () => {
  assert.equal(uiLogic.canUnlockBrief(false, 0, 'Product', true), false);
  assert.equal(uiLogic.canUnlockBrief(false, 1, '', true), false);
  assert.equal(uiLogic.canUnlockBrief(false, 1, 'Product', false), false);
  assert.equal(uiLogic.canUnlockBrief(false, 1, 'Product', true), true);
  assert.equal(uiLogic.canUnlockBrief(true, 1, '', false), true);

  const exampleGate = {
    exampleSearch: true,
    unlocked: true,
    selectedAdClaimCount: 2,
    allAdClaimsApproved: true,
    heroNeedId: 'sweat_reapply',
    selectedNeedId: 'sweat_reapply',
  };
  assert.equal(uiLogic.canShowConceptPrototype(exampleGate), true);
  assert.equal(uiLogic.canShowConceptPrototype({ ...exampleGate, exampleSearch: false }), false);
  assert.equal(uiLogic.canShowConceptPrototype({ ...exampleGate, selectedNeedId: 'appearance' }), false);
  assert.equal(uiLogic.canShowConceptPrototype({ ...exampleGate, allAdClaimsApproved: false }), false);
  assert.equal(uiLogic.canShowConceptPrototype({ ...exampleGate, selectedAdClaimCount: 0 }), false);
});

test('portable brief text includes approved claims, platform context, guardrails, and original links without creator quotes', () => {
  const brief = uiLogic.buildBriefShareText({
    brand: 'Orchid Labs',
    category: 'face moisturizer during winter',
    need: 'Using moisturizer in cold weather is difficult',
    runSource: 'Live Oriane response',
    sampleWindow: 'Jun 29–Sep 27, 2026 · videos published within the 90-day search window',
    creatorCount: 4,
    videoCount: 6,
    totalViews: '24K',
    medianViews: '3.2K',
    viewsReported: 5,
    platformSummary: 'tiktok: 4 · instagram: 2',
    claims: [{
      claim: 'Supports the moisture barrier',
      source: 'https://brand.example/claims',
      approvalLabel: 'owner-approved, not independently verified by FinalTake',
    }],
    guardrails: ['Do not claim a cure or treatment.'],
    evidence: [{
      handle: '@creator-a',
      platform: 'tiktok',
      date: 'Sep 20, 2026',
      url: 'https://www.tiktok.com/@creator-a/video/1001',
    }],
  });
  assert.match(brief, /CREATOR BRIEF/);
  assert.match(brief, /SCENE SEQUENCE/);
  assert.match(brief, /CREATOR FIT/);
  assert.match(brief, /owner-approved, not independently verified/);
  assert.match(brief, /https:\/\/brand\.example\/claims/);
  assert.match(brief, /https:\/\/www\.tiktok\.com\/@creator-a\/video\/1001/);
  assert.match(brief, /not unique people reached/);
  assert.match(brief, /ROI needs campaign spend and outcome data/);
  assert.match(brief, /Do not claim a cure or treatment/);
  assert.doesNotMatch(brief, /Since you're sweating more/);
});

test('printable brief markup carries the run window, approved claims, guardrails, and direct evidence links', () => {
  const html = renderToStaticMarkup(React.createElement(briefDocument.CreatorBriefDocument, {
    brand: 'Orchid Labs',
    category: 'face moisturizer during winter',
    productName: 'Orchid Cream',
    source: 'live',
    sampleWindow: {
      startAt: '2026-06-29T00:00:00.000Z',
      endAt: '2026-09-27T00:00:00.000Z',
      days: 90,
    },
    need: {
      id: 'comfort',
      label: 'Using face moisturizer in cold weather feels uncomfortable',
      complaintLines: [],
      videoCount: 1,
      creatorCount: 1,
      totalViews: 5000,
      medianViews: 5000,
      queryMetrics: [],
    },
    videos: [{
      id: '1001',
      url: 'https://www.tiktok.com/@creator-a/video/1001',
      platform: 'tiktok',
      sourceQueries: ['brand'],
      handle: '@creator-a',
      followers: null,
      date: '2026-09-20T12:00:00.000Z',
      views: 5000,
      language: 'en',
      caption: '',
      transcript: 'A private source transcript must not be generated into the brief.',
      evidenceSentence: 'A private source quote must not be generated into the brief.',
      evidenceTime: null,
      needIds: ['comfort'],
    }],
    claims: [{
      claim: 'Supports the moisture barrier',
      source: 'https://brand.example/claims',
      useInAd: false,
    }],
    guardrails: ['Do not claim a cure or treatment.'],
  }));
  assert.match(html, /FINALTAKE \/ CREATOR DIRECTION/);
  assert.match(html, /Creator task/);
  assert.match(html, /Scene sequence/);
  assert.match(html, /Supports the moisture barrier/);
  assert.match(html, /https:\/\/brand\.example\/claims/);
  assert.match(html, /https:\/\/www\.tiktok\.com\/@creator-a\/video\/1001/);
  assert.match(html, /90-day search window/);
  assert.match(html, /Do not claim a cure or treatment/);
  assert.doesNotMatch(html, /A private source quote/);
  assert.doesNotMatch(html, /A private source transcript/);
});