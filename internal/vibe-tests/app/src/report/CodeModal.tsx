import {useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSTabList} from '@xds/core/TabList';
import {XDSTab} from '@xds/core/TabList';
import {XDSCloseButton} from '@xds/core/CloseButton';
import {XDSBadge} from '@xds/core/Badge';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
import type {UniversalScore} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS, computeOverall} from './utils';

const styles = stylex.create({
  header: {
    padding: spacingVars['--spacing-4'],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    padding: spacingVars['--spacing-4'],
    paddingBlockStart: 0,
  },
  codeBlock: {
    fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
    fontSize: '13px',
    lineHeight: '1.5',
    backgroundColor: colorVars['--color-wash'],
    borderRadius: '6px',
    padding: spacingVars['--spacing-3'],
    overflow: 'auto',
    maxHeight: '400px',
    whiteSpace: 'pre',
    tabSize: 2,
  },
  findingsSection: {
    paddingBlockStart: spacingVars['--spacing-3'],
  },
  findingRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    alignItems: 'baseline',
  },
  scoreRow: {
    display: 'flex',
    gap: spacingVars['--spacing-3'],
    flexWrap: 'wrap',
  },
  scorePill: {
    display: 'inline-flex',
    gap: spacingVars['--spacing-1'],
    alignItems: 'center',
  },
});

interface CodeModalProps {
  isShown: boolean;
  onHide: () => void;
  promptId: string;
  xdsCode?: string;
  baselineCode?: string;
  xdsScore?: UniversalScore;
  baselineScore?: UniversalScore;
}

function scoreBadgeVariant(
  score: number,
): 'success' | 'neutral' | 'warning' | 'error' {
  if (score >= 90) return 'success';
  if (score >= 70) return 'neutral';
  if (score >= 50) return 'warning';
  return 'error';
}

function ScoreSummary({score}: {score: UniversalScore}) {
  return (
    <div {...stylex.props(styles.scoreRow)}>
      {ALL_DIMENSIONS.map(dim => (
        <span key={dim} {...stylex.props(styles.scorePill)}>
          <XDSBadge variant={scoreBadgeVariant(score[dim].score)}>
            {DIMENSION_LABELS[dim]}: {score[dim].score}
          </XDSBadge>
        </span>
      ))}
      <span {...stylex.props(styles.scorePill)}>
        <XDSBadge variant={scoreBadgeVariant(computeOverall(score))}>
          Overall: {computeOverall(score)}
        </XDSBadge>
      </span>
    </div>
  );
}

function Findings({score}: {score: UniversalScore}) {
  const allFindings = ALL_DIMENSIONS.flatMap(dim =>
    (score[dim].findings ?? []).map(f => ({
      dimension: DIMENSION_LABELS[dim],
      ...f,
    })),
  );

  if (allFindings.length === 0) {
    return <XDSText type="supporting">No issues found.</XDSText>;
  }

  return (
    <XDSVStack gap="space2">
      {allFindings.map((f, i) => (
        <div key={i} {...stylex.props(styles.findingRow)}>
          <XDSBadge
            variant={
              f.severity === 'critical'
                ? 'error'
                : f.severity === 'moderate'
                  ? 'warning'
                  : 'neutral'
            }>
            {f.severity ?? 'info'}
          </XDSBadge>
          <XDSText type="body">
            <strong>{f.dimension}</strong> — {f.detail}
          </XDSText>
        </div>
      ))}
    </XDSVStack>
  );
}

export function CodeModal({
  isShown,
  onHide,
  promptId,
  xdsCode,
  baselineCode,
  xdsScore,
  baselineScore,
}: CodeModalProps) {
  const hasBoth = xdsCode && baselineCode;
  const [activeTab, setActiveTab] = useState<string>(
    xdsCode ? 'xds' : 'baseline',
  );

  const currentCode = activeTab === 'xds' ? xdsCode : baselineCode;
  const currentScore = activeTab === 'xds' ? xdsScore : baselineScore;

  return (
    <XDSDialog
      isShown={isShown}
      onHide={onHide}
      purpose="info"
      width={800}
      aria-label={`Code for ${promptId}`}>
      <div {...stylex.props(styles.header)}>
        <XDSVStack gap="space1">
          <XDSHeading level={3}>{promptId}</XDSHeading>
          <XDSText type="supporting">Generated code and evaluation</XDSText>
        </XDSVStack>
        <XDSCloseButton onClick={onHide} />
      </div>
      <div {...stylex.props(styles.content)}>
        <XDSVStack gap="space3">
          {hasBoth && (
            <XDSTabList value={activeTab} onChange={setActiveTab} hasDivider>
              <XDSTab value="xds" label="XDS" />
              <XDSTab value="baseline" label="Baseline" />
            </XDSTabList>
          )}

          {currentScore && (
            <XDSVStack gap="space2">
              <XDSText type="label">Scores</XDSText>
              <ScoreSummary score={currentScore} />
            </XDSVStack>
          )}

          {currentScore && (
            <XDSVStack gap="space2">
              <XDSText type="label">Findings</XDSText>
              <Findings score={currentScore} />
            </XDSVStack>
          )}

          {currentCode && (
            <XDSVStack gap="space2">
              <XDSHStack gap="space2" vAlign="center">
                <XDSText type="label">Code</XDSText>
                <XDSText type="supporting">
                  {currentCode.split('\n').length} lines
                </XDSText>
              </XDSHStack>
              <div {...stylex.props(styles.codeBlock)}>{currentCode}</div>
            </XDSVStack>
          )}
        </XDSVStack>
      </div>
    </XDSDialog>
  );
}
