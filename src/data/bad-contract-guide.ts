/**
 * Educational content: examples of problematic recording-contract language.
 * Not legal advice — for learning only.
 */

export const badContractGuideMeta = {
  title: 'Bad music contract red flags',
  subtitle:
    'Example language you should discuss with an entertainment attorney before signing — not a template to use.',
};

export interface BadClause {
  id: string;
  sectionTitle: string;
  quote: string;
  whyBad: string;
}

export const badClauses: BadClause[] = [
  {
    id: 'term',
    sectionTitle: '§1. Term — perpetual with one-sided options',
    quote:
      "This agreement shall remain in effect for an initial period of seven (7) years, with the Label holding five (5) additional one-year options, exercisable solely at the Label's discretion, for a total potential term of twelve (12) years.",
    whyBad:
      'Only the label can extend or end the deal. You can be locked in for well over a decade with no reciprocal exit.',
  },
  {
    id: 'ownership',
    sectionTitle: '§2. Ownership — you keep nothing',
    quote:
      'All master recordings created during the term of this agreement, including any pre-existing recordings delivered to the Label, shall be owned in perpetuity, throughout the universe, by the Label. Artist waives all moral rights thereto.',
    whyBad:
      'You may give up masters forever — including work you made before the deal. Broad geographic and format language is common in industry forms.',
  },
  {
    id: 'royalties',
    sectionTitle: '§3. Royalties — stacked against you',
    quote:
      'Artist shall receive a royalty rate of eight percent (8%) of the suggested retail list price (SRLP), subject to a twenty-five percent (25%) packaging deduction, a fifty percent (50%) new media reduction, and a fifty percent (50%) reserve against returns, held for up to four (4) years.',
    whyBad:
      'After deductions and reserves, your effective rate can shrink sharply. Reserves can tie up money for years.',
  },
  {
    id: '360',
    sectionTitle: '§4. 360 deal — they take everything',
    quote:
      "Label shall be entitled to twenty percent (20%) of Artist's gross income derived from any and all entertainment-related activities, including but not limited to: touring, merchandise, endorsements, acting, sponsorships, YouTube/streaming revenue, brand deals, appearances, and any future business ventures related to Artist's name or likeness.",
    whyBad:
      'A broad 360-style clause can give the label a cut of income unrelated to what they funded or marketed.',
  },
  {
    id: 'recoupment',
    sectionTitle: '§5. Recording costs — you pay them back first',
    quote:
      "All recording costs, marketing expenses, video production costs, and promotional expenditures advanced by the Label shall be fully recoupable from Artist's royalties before any royalty payments are made to Artist. Such advances shall not be recoupable from Label's share of any income.",
    whyBad:
      'Costs are often recouped from your royalty share only, which can leave you in a long recoupment position even when revenue exists.',
  },
  {
    id: 'creative',
    sectionTitle: '§6. Creative control — you have none',
    quote:
      "Label shall have sole and final approval over all musical compositions, album artwork, music videos, public statements, social media content, touring schedules, collaborations, and Artist's physical appearance and stage name.",
    whyBad:
      'One-sided approval can limit your art, image, and career decisions for the life of the deal.',
  },
  {
    id: 'delivery',
    sectionTitle: '§7. Album delivery — vague and weaponized',
    quote:
      "Artist agrees to deliver a commercially satisfactory album at such times as determined by the Label. Label retains the right to reject any delivered album as commercially unsatisfactory without specifying reasons, and Artist shall re-deliver at Artist's expense.",
    whyBad:
      'Undefined “commercially satisfactory” standards can be abused to delay acceptance and restrict where else you can record.',
  },
  {
    id: 'suspension',
    sectionTitle: '§8. Suspension clause — they can pause the clock',
    quote:
      'In the event Artist fails to fulfill any obligation hereunder, Label may suspend the term of this agreement for the duration of such failure, and the term shall be extended accordingly.',
    whyBad:
      'Suspension can extend a fixed term far beyond what the years on paper suggest.',
  },
  {
    id: 'likeness',
    sectionTitle: '§9. Name & likeness — forever',
    quote:
      "Artist grants Label the irrevocable, perpetual, worldwide right to use Artist's name, photograph, likeness, voice, and biographical information in connection with the marketing and promotion of Label's catalog, in perpetuity, even after the term of this agreement.",
    whyBad:
      'Perpetual publicity rights after the deal can outlast the relationship; scope and compensation need careful review.',
  },
  {
    id: 'disputes',
    sectionTitle: '§10. Dispute resolution — rigged',
    quote:
      "Any disputes arising under this agreement shall be resolved exclusively in the courts of [Label's home state], and Artist waives the right to jury trial. Artist shall bear all legal costs regardless of outcome.",
    whyBad:
      'Forum selection, jury waiver, and one-sided fee rules can make disputes expensive to pursue.',
  },
];

export const redFlagSummary: { clause: string; redFlag: string }[] = [
  {
    clause: 'Long term + label-only options',
    redFlag: 'Trapped for 10+ years',
  },
  {
    clause: 'Label owns all masters forever',
    redFlag: 'You build little long-term equity',
  },
  {
    clause: 'Stacked royalty deductions',
    redFlag: 'Effective rate can collapse',
  },
  {
    clause: '360 deal (20%+ of everything)',
    redFlag: 'They share unrelated income',
  },
  {
    clause: 'All costs recoupable from your share',
    redFlag: 'Long path to net royalties',
  },
  { clause: 'No creative control', redFlag: 'One-sided approvals' },
  {
    clause: '“Commercially satisfactory” delivery',
    redFlag: 'Risk of repeat rejections',
  },
  { clause: 'Suspension clauses', redFlag: 'Term can stretch' },
  {
    clause: 'Perpetual name/likeness rights',
    redFlag: 'Identity use after the deal',
  },
  {
    clause: 'One-sided dispute resolution',
    redFlag: 'Harder to challenge terms',
  },
];

export const fairContractPoints: string[] = [
  'Shorter initial commitment tied to clear deliverables (e.g. albums or projects), not open-ended years alone.',
  'Artist retains, co-owns, or has a defined reversion path for masters where possible.',
  'Royalty bases and deductions spelled out in plain math; limits on reserves and holdbacks.',
  'Narrow or no 360 language; anything broad should match real services and caps.',
  'Recoupment mechanics defined; watch cross-collateralization across unrelated projects.',
  'Objective or mutual standards for satisfactory delivery and timelines for approval.',
  'Shared or artist-held creative approvals where appropriate.',
  'Neutral or balanced forum, fee-shifting, and dispute rules.',
];

export const legalDisclaimer =
  'This page is for education only. It is not legal advice. Always have an independent entertainment attorney review any contract before you sign.';
