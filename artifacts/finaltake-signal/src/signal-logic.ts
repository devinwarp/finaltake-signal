import type { SignalSearchInput } from '@workspace/api-client-react';

export type ApprovedBriefClaim = {
  claim: string;
  source: string;
  approvalLabel: string;
};

export type BriefEvidenceLink = {
  handle: string;
  platform: string;
  date: string;
  url: string;
};

export type ShareBriefInput = {
  brand: string;
  category: string;
  need: string;
  runSource: string;
  sampleWindow: string;
  creatorCount: number;
  videoCount: number;
  totalViews: string;
  medianViews: string;
  viewsReported: number;
  platformSummary: string;
  claims: ApprovedBriefClaim[];
  guardrails: string[];
  evidence: BriefEvidenceLink[];
};

export function isExactExampleSearch(input: SignalSearchInput, example: SignalSearchInput): boolean {
  return Object.keys(example).every((key) => {
    const field = key as keyof SignalSearchInput;
    return input[field].trim().toLocaleLowerCase() === example[field].toLocaleLowerCase();
  });
}

export function canUnlockBrief(
  exampleSearch: boolean,
  approvedClaimCount: number,
  productName: string,
  ownerAttests: boolean,
): boolean {
  return approvedClaimCount > 0 && (exampleSearch || (!!productName.trim() && ownerAttests));
}

export function canShowConceptPrototype({
  exampleSearch,
  unlocked,
  selectedAdClaimCount,
  allAdClaimsApproved,
  heroNeedId,
  selectedNeedId,
}: {
  exampleSearch: boolean;
  unlocked: boolean;
  selectedAdClaimCount: number;
  allAdClaimsApproved: boolean;
  heroNeedId: string | null | undefined;
  selectedNeedId: string | null | undefined;
}): boolean {
  return exampleSearch && unlocked && selectedAdClaimCount > 0 &&
    allAdClaimsApproved && heroNeedId === 'sweat_reapply' && selectedNeedId === 'sweat_reapply';
}

export function buildBriefShareText(input: ShareBriefInput): string {
  const sceneSequence = [
    'Open: Set the scene in a recognizable everyday moment.',
    'Show: Demonstrate the specific need in the creator’s own routine.',
    'Try: Show the product clearly and describe only the creator’s actual experience.',
    'Close: Share a practical personal takeaway without a universal promise.',
  ];
  const approvedClaims = input.claims.length
    ? input.claims.map(({ claim, source, approvalLabel }) =>
      `- ${claim} (${approvalLabel})\n  Source: ${source}`).join('\n')
    : '- No product claim approved; do not make a product claim.';
  const evidenceLinks = input.evidence.length
    ? input.evidence.map(({ handle, platform, date, url }) =>
      `- ${handle} · ${platform} · ${date}\n  Original post: ${url}`).join('\n')
    : '- No linked original posts were returned for this need.';

  return [
    'FINALTAKE SIGNAL — CREATOR BRIEF',
    `Search: ${input.brand} / ${input.category}`,
    `Evidence source: ${input.runSource}`,
    `Sample window: ${input.sampleWindow}`,
    '',
    'OBJECTIVE',
    'Use this need as a creative starting point for a creator-led video. Review the original posts, then decide whether this direction fits the brief; the search does not predict campaign results.',
    '',
    'NEED',
    input.need,
    '',
    'CREATIVE DIRECTION',
    `Show when ${input.need.toLocaleLowerCase()} becomes relevant in a real routine. Describe the situation in fresh language; do not repeat a creator’s words or imply creator endorsement.`,
    '',
    'SCENE SEQUENCE',
    ...sceneSequence,
    '',
    'CREATOR FIT',
    `Choose a creator whose regular content naturally includes this category or situation and who can demonstrate it credibly in their own style. Search sample context: ${input.platformSummary}. No platform partnership or publishing integration is required.`,
    '',
    'APPROVED PRODUCT LANGUAGE',
    approvedClaims,
    '',
    'EVIDENCE SNAPSHOT',
    `${input.creatorCount} distinct creators · ${input.videoCount} need-matched videos · ${input.totalViews} observed post views total · ${input.medianViews} median views across ${input.viewsReported} posts with reported views.`,
    'Observed post views are not unique people reached, incremental reach, a forecast, or ROI. ROI needs campaign spend and outcome data that this search does not contain.',
    '',
    'ORIGINAL EVIDENCE LINKS',
    evidenceLinks,
    '',
    'GUARDRAILS',
    '- Paraphrase the need. Never use creator quotes as generated ad copy or endorsements.',
    ...input.guardrails.map((guardrail) => `- ${guardrail}`),
    '- Verify every original post and the cited claim source before production.',
  ].join('\n');
}