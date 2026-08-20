/**
 * Canonical status vocabulary for the console.
 *
 * This mapping is mirrored by the run table, the deploy timeline, and the
 * weekly digest. It is the single source of truth — a surface that re-derives
 * it drifts, which is how the timeline and the table disagreed last quarter.
 */

export type RunStatus =
  | 'queued'
  | 'running'
  | 'needs_review'
  | 'blocked'
  | 'succeeded'
  | 'failed'
  | 'abandoned';

/** Tone names used by the app's own components. */
export type Tone =
  | 'neutral'
  | 'info'
  | 'progress'
  | 'attention'
  | 'positive'
  | 'danger'
  | 'inert';

/** Canonical status → tone. Do not re-derive locally. */
export const STATUS_TONE: Record<RunStatus, Tone> = {
  queued: 'neutral',
  running: 'progress',
  needs_review: 'attention',
  blocked: 'attention',
  succeeded: 'positive',
  failed: 'danger',
  abandoned: 'inert',
};

/** Canonical tone → utility classes, in the app's own vocabulary. */
export const TONE_CLASS: Record<Tone, string> = {
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-sky-500/15 text-sky-300',
  progress: 'bg-blue-500/15 text-blue-300',
  attention: 'bg-amber-500/15 text-amber-300',
  positive: 'bg-emerald-500/15 text-emerald-300',
  danger: 'bg-red-500/15 text-red-300',
  inert: 'bg-muted text-muted-foreground/70',
};

export const STATUS_LABEL: Record<RunStatus, string> = {
  queued: 'Queued',
  running: 'Running',
  needs_review: 'Needs review',
  blocked: 'Blocked',
  succeeded: 'Succeeded',
  failed: 'Failed',
  abandoned: 'Abandoned',
};

export function toneForStatus(status: RunStatus): Tone {
  return STATUS_TONE[status];
}
