/**
 * @file BuildStatus.tsx
 * @description Notification bell for the sandbox top nav.
 *
 * Shows the current deployed build hash, any in-progress GitHub Actions
 * workflows, and the last 10 merged PRs. Uses the public GitHub API
 * (unauthenticated, 60 req/hr per IP) — fetches on mount and on
 * manual refresh.
 *
 * The bell shows a small accent-colored dot when a build is in progress.
 */

'use client';

import {useState, useEffect, useCallback} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSPopover} from '@xds/core/Popover';
import {XDSButton} from '@xds/core/Button';
import {XDSText} from '@xds/core/Text';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSDivider} from '@xds/core/Divider';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowRun = {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  head_sha: string;
  html_url: string;
  created_at: string;
  display_title: string;
  head_branch: string;
};

type MergedPR = {
  number: number;
  title: string;
  merged_at: string;
  merge_commit_sha: string | null;
  html_url: string;
};

type BuildData = {
  inProgress: WorkflowRun[];
  recentPRs: MergedPR[];
  currentHash: string | null;
  currentTitle: string | null;
  lastFetched: Date | null;
  error: string | null;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REPO_OWNER = 'facebookexperimental';
const REPO_NAME = 'xds';
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = stylex.create({
  bellWrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    pointerEvents: 'none',
  },
  popoverContent: {
    width: 340,
    maxHeight: 440,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 16,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  prRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '6px 0',
  },
  prTitle: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  prMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  hashBadge: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    padding: '1px 6px',
    borderRadius: 4,
    backgroundColor: 'var(--color-deemphasized, #f0f0f0)',
  },
  buildingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 0',
  },
  link: {
    color: 'var(--color-accent, #0064E0)',
    textDecoration: 'none',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  empty: {
    padding: '12px 0',
    textAlign: 'center',
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Bell icon as inline SVG (no icon registry dependency)
function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function fetchBuildData(): Promise<BuildData> {
  try {
    const [runsRes, prsRes] = await Promise.all([
      fetch(
        `${API_BASE}/actions/workflows/deploy.yml/runs?per_page=5&branch=main`,
      ),
      fetch(
        `${API_BASE}/pulls?state=closed&sort=updated&direction=desc&per_page=10&base=main`,
      ),
    ]);

    if (!runsRes.ok || !prsRes.ok) {
      throw new Error(
        `GitHub API error: runs=${runsRes.status} prs=${prsRes.status}`,
      );
    }

    const runsJson = await runsRes.json();
    const prsJson = await prsRes.json();

    const runs: WorkflowRun[] = runsJson.workflow_runs ?? [];
    const inProgress = runs.filter(
      (r: WorkflowRun) =>
        r.status === 'queued' ||
        r.status === 'in_progress' ||
        r.status === 'waiting',
    );

    // Most recent successful deploy
    const lastSuccess = runs.find(
      (r: WorkflowRun) =>
        r.status === 'completed' && r.conclusion === 'success',
    );
    const currentHash = lastSuccess ? lastSuccess.head_sha.slice(0, 7) : null;
    const currentTitle = lastSuccess?.display_title ?? null;

    // Only merged PRs
    const mergedPRs: MergedPR[] = (prsJson as Array<Record<string, unknown>>)
      .filter((pr: Record<string, unknown>) => pr.merged_at != null)
      .slice(0, 10)
      .map((pr: Record<string, unknown>) => ({
        number: pr.number as number,
        title: pr.title as string,
        merged_at: pr.merged_at as string,
        merge_commit_sha: pr.merge_commit_sha as string | null,
        html_url: pr.html_url as string,
      }));

    return {
      inProgress,
      recentPRs: mergedPRs,
      currentHash,
      currentTitle,
      lastFetched: new Date(),
      error: null,
    };
  } catch (err) {
    return {
      inProgress: [],
      recentPRs: [],
      currentHash: null,
      currentTitle: null,
      lastFetched: new Date(),
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function BuildStatus() {
  const [data, setData] = useState<BuildData | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await fetchBuildData();
    setData(result);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isBuilding = (data?.inProgress.length ?? 0) > 0;

  const popoverContent = (
    <div {...stylex.props(styles.popoverContent)}>
      {/* Header */}
      <div {...stylex.props(styles.header)}>
        <XDSText type="label" weight="semibold">
          Build Status
        </XDSText>
        <XDSButton
          label="Refresh"
          variant="ghost"
          size="sm"
          onClickAction={refresh}
          isDisabled={loading}
        />
      </div>

      <XDSDivider />

      {/* Current deployed hash */}
      {data?.currentHash && (
        <div>
          <div {...stylex.props(styles.sectionTitle)}>
            <XDSText type="supporting">✅ Deployed</XDSText>
          </div>
          {data.currentTitle && (
            <div {...stylex.props(styles.prTitle)}>
              <XDSText type="body" size="sm">
                {data.currentTitle}
              </XDSText>
            </div>
          )}
          <div {...stylex.props(styles.prMeta)}>
            <span {...stylex.props(styles.hashBadge)}>{data.currentHash}</span>
            {data.lastFetched && (
              <XDSText type="supporting">
                Checked {timeAgo(data.lastFetched.toISOString())}
              </XDSText>
            )}
          </div>
        </div>
      )}

      {/* Building section */}
      {isBuilding && (
        <div>
          <div {...stylex.props(styles.sectionTitle)}>
            <XDSText type="supporting">🔄 BUILDING</XDSText>
          </div>
          {data?.inProgress.map(run => (
            <div key={run.id}>
              <div {...stylex.props(styles.buildingRow)}>
                <XDSSpinner size="sm" />
                <div {...stylex.props(styles.prTitle)}>
                  <XDSText type="body" size="sm">
                    {run.display_title}
                  </XDSText>
                </div>
              </div>
              <div {...stylex.props(styles.prMeta)}>
                <span {...stylex.props(styles.hashBadge)}>
                  {run.head_sha.slice(0, 7)}
                </span>
                <a
                  href={run.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...stylex.props(styles.link)}>
                  <XDSText type="supporting">View workflow →</XDSText>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      <XDSDivider />

      {/* Recent merged PRs */}
      <div>
        <div {...stylex.props(styles.sectionTitle)}>
          <XDSText type="supporting">📋 Recent changes</XDSText>
        </div>
        {data?.recentPRs.length === 0 && !data?.error && (
          <div {...stylex.props(styles.empty)}>
            <XDSText type="supporting">No recent merges</XDSText>
          </div>
        )}
        {data?.error && (
          <div {...stylex.props(styles.empty)}>
            <XDSText type="supporting">⚠️ {data.error}</XDSText>
          </div>
        )}
        {data?.recentPRs.map(pr => (
          <div key={pr.number} {...stylex.props(styles.prRow)}>
            <a
              href={pr.html_url}
              target="_blank"
              rel="noopener noreferrer"
              {...stylex.props(styles.link, styles.prTitle)}>
              <XDSText type="body" size="sm">
                {pr.title}
              </XDSText>
            </a>
            <div {...stylex.props(styles.prMeta)}>
              {pr.merge_commit_sha && (
                <span {...stylex.props(styles.hashBadge)}>
                  {pr.merge_commit_sha.slice(0, 7)}
                </span>
              )}
              <XDSText type="supporting">#{pr.number}</XDSText>
              <XDSText type="supporting">{timeAgo(pr.merged_at)}</XDSText>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div
          style={{display: 'flex', justifyContent: 'center', padding: '8px'}}>
          <XDSSpinner size="sm" />
        </div>
      )}
    </div>
  );

  return (
    <XDSPopover content={popoverContent} placement="below" alignment="end">
      <div {...stylex.props(styles.bellWrapper)}>
        <XDSButton
          label="Build status"
          variant="ghost"
          size="sm"
          icon={<BellIcon />}
        />
        {isBuilding && <span {...stylex.props(styles.dot)} />}
      </div>
    </XDSPopover>
  );
}
