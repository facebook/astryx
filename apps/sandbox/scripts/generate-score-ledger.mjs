// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file generate-score-ledger.mjs
 * @description Generates apps/sandbox/src/generated/componentScores.ts — the
 *   ROSTER of components (read from packages/core/src and packages/lab/src by
 *   the canonical predicate in scripts/score-ledger.mjs) plus a build-time
 *   SNAPSHOT of the audit ledger fetched from the wiki.
 * @input packages/{core,lab}/src, and the wiki ledger over the network.
 * @output src/generated/componentScores.ts
 * @position Sandbox build step, run by `pnpm generate`.
 *
 *   The two halves come from different places on purpose. The roster is the
 *   packages: a component added today shows up as TBD tomorrow with nobody
 *   maintaining a list. The scores are the wiki: an auditor records one with a
 *   wiki push and no pull request.
 *
 *   The snapshot exists only so the page is never blank, and so the page still
 *   works when the wiki is unreachable. The page re-fetches the same URL
 *   client-side at runtime, so a score recorded after this build shows up
 *   without a rebuild — and the page labels which of the two you are reading.
 *   If the fetch here fails — offline build, wiki down — the snapshot is null
 *   and the page relies on the live fetch alone; it never fails the build.
 *
 * SYNC: When the ledger schema changes, update scripts/score-ledger.mjs and the
 *   Component-Audit-Rubric wiki page too.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  AUDIT_PROMPT,
  DEFAULT_LEDGER_URL,
  DEFAULT_REPO,
  LEDGER_FETCH_TIMEOUT_MS,
  SECTION_TITLES,
  SECTION_WEIGHTS,
  listComponents,
} from '../../../scripts/score-ledger.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const OUT_DIR = path.resolve(__dirname, '..', 'src', 'generated');
const OUT_FILE = path.join(OUT_DIR, 'componentScores.ts');

const roster = listComponents(REPO_ROOT);

let snapshot = null;
let snapshotFetchedAt = null;
try {
  // Bounded on purpose. A 404 or a refused connection lands in the catch
  // immediately, but a STALLED connection would not: a bare fetch inherits
  // undici's defaults, whose headers timeout is measured in minutes. This step
  // is on the critical path of every sandbox build, including the stable
  // /sandbox/ deploy from main, so "never fail the build over this" has to
  // cover hanging too — five seconds is generous for one small static file.
  const res = await fetch(DEFAULT_LEDGER_URL, {
    redirect: 'follow',
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const parsed = JSON.parse(await res.text());
  if (!Array.isArray(parsed.components)) throw new Error('missing a components array');
  snapshot = parsed;
  snapshotFetchedAt = new Date().toISOString();
  console.log(
    `componentScores: snapshot of ${parsed.components.length} audited component(s) from the wiki`,
  );
} catch (e) {
  // Never fail the build over this — and never hang it either. The page
  // fetches the same URL at runtime and says which copy it is showing.
  const why = e.name === 'TimeoutError' ? 'no response within 5000ms' : e.message;
  console.warn(
    `componentScores: could not snapshot the ledger (${why}) — the page will rely on its runtime fetch.`,
  );
}

const banner = `// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * GENERATED FILE — do not edit.
 * Regenerate: node apps/sandbox/scripts/generate-score-ledger.mjs
 *
 * \`roster\` is read from packages/{core,lab}/src by the canonical component
 * predicate. \`snapshot\` is a build-time copy of the wiki ledger, used only
 * until the page's runtime fetch of LEDGER_URL resolves.
 */
`;

const source = `${banner}
export interface LedgerBlock {
  /** Rubric rule id, e.g. \`A8\` or \`T6\`. */
  id: string;
  summary: string;
  section?: string;
  evidence?: string;
  /** The \`hardening\` issue filed for this BLOCK, or null if none is filed. */
  issue: number | null;
}

export interface LedgerSection {
  score: number | null;
  weight: number;
  state: 'scored' | 'limited' | 'not_measured' | 'na' | 'unpublished';
  note?: string | null;
  blocks?: LedgerBlock[];
}

export interface LedgerEntry {
  component: string;
  package: string;
  status: 'audited';
  score: number | null;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | null;
  sections: Record<string, LedgerSection>;
  blocks: {count: number; open: LedgerBlock[]};
  distinct_defects: number | null;
  fixes: number | null;
  nits: number | null;
  lastAudited: string | null;
  rubricVersion: string | null;
  mode: string | null;
  commit: string | null;
  evidence?: Array<{label: string; path?: string; note?: string}>;
  notes?: string;
  regression?: {
    reason: string;
    from: {score: number | null; blocks: number};
    recordedAt: string;
  };
}

export interface Ledger {
  ledgerVersion: number;
  rubricVersion: string;
  updated: string;
  about?: string;
  caveats?: string[];
  components: LedgerEntry[];
}

export interface RosterEntry {
  component: string;
  package: string;
}

/** The wiki ledger, fetched client-side so the page never needs a rebuild. */
export const LEDGER_URL = ${JSON.stringify(DEFAULT_LEDGER_URL)};

/**
 * How long the page waits for that fetch before falling back to the snapshot.
 * Shared with the CLI so there is one number: a stalled connection never
 * rejects on its own, and a page stuck on "checking" is the same dishonesty
 * the freshness indicator exists to prevent.
 */
export const LEDGER_FETCH_TIMEOUT_MS = ${JSON.stringify(LEDGER_FETCH_TIMEOUT_MS)};

/** Where audit issues live. */
export const REPO = ${JSON.stringify(DEFAULT_REPO)};

export const RUBRIC_URL = ${JSON.stringify(
  `https://github.com/${DEFAULT_REPO}/wiki/Component-Audit-Rubric`,
)};

/**
 * The ledger file in the wiki. It is the ONLY stored form of the scores —
 * there is no generated table page to link at, on purpose: a second copy goes
 * stale the moment the JSON changes without a regeneration.
 */
export const LEDGER_WIKI_URL = ${JSON.stringify(DEFAULT_LEDGER_URL)};

/** The paste-to-an-agent request for an audit. Shared with the CLI. */
export const AUDIT_PROMPT = ${JSON.stringify(AUDIT_PROMPT)};

export const SECTION_TITLES: Record<string, string> = ${JSON.stringify(SECTION_TITLES, null, 2)};

export const SECTION_WEIGHTS: Record<string, number> = ${JSON.stringify(SECTION_WEIGHTS, null, 2)};

/** Every component in packages/{core,lab}/src, by the canonical predicate. */
export const roster: RosterEntry[] = ${JSON.stringify(roster, null, 2)};

/**
 * Build-time copy of the ledger, used ONLY until the runtime fetch resolves and
 * as the fallback when it fails. Null when the build could not reach the wiki.
 * The page says which of the two it is showing — a stale page that looks live
 * is worse than one that admits it.
 */
export const snapshot: Ledger | null = ${JSON.stringify(snapshot, null, 2)};

/** When the snapshot above was taken, so the fallback can date itself. */
export const snapshotFetchedAt: string | null = ${JSON.stringify(snapshotFetchedAt)};
`;

fs.mkdirSync(OUT_DIR, {recursive: true});
fs.writeFileSync(OUT_FILE, source);
console.log(
  `componentScores: wrote ${path.relative(REPO_ROOT, OUT_FILE)} — ${roster.length} components in the roster`,
);
