import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import type {UniversalScore} from './types';
import {ALL_DIMENSIONS, DIMENSION_LABELS, computeOverall} from './utils';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
  },
  scoreRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
  },
  findingRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    alignItems: 'baseline',
  },
  section: {
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  sectionLabel: {
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  scoreBlock: {
    flex: '1 1 0',
    minWidth: '200px',
  },
});

function scoreBadgeVariant(
  score: number,
): 'success' | 'neutral' | 'warning' | 'error' {
  if (score >= 90) return 'success';
  if (score >= 70) return 'neutral';
  if (score >= 50) return 'warning';
  return 'error';
}

function ScoreSummary({label, score}: {label: string; score: UniversalScore}) {
  return (
    <div {...stylex.props(styles.scoreBlock)}>
      <XDSVStack gap="space2">
        <XDSText type="label">{label}</XDSText>
        <div {...stylex.props(styles.scoreRow)}>
          {ALL_DIMENSIONS.map(dim => (
            <XDSBadge key={dim} variant={scoreBadgeVariant(score[dim].score)}>
              {DIMENSION_LABELS[dim]}: {score[dim].score}
            </XDSBadge>
          ))}
          <XDSBadge variant={scoreBadgeVariant(computeOverall(score))}>
            Overall: {computeOverall(score)}
          </XDSBadge>
        </div>
      </XDSVStack>
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
    <XDSVStack gap="space1">
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

interface PromptDetailCardProps {
  promptId: string;
  xdsScore?: UniversalScore;
  baselineScore?: UniversalScore;
  hasXdsCode: boolean;
  hasBaselineCode: boolean;
  onViewCode: (target: 'xds' | 'baseline') => void;
}

export function PromptDetailCard({
  promptId,
  xdsScore,
  baselineScore,
  hasXdsCode,
  hasBaselineCode,
  onViewCode,
}: PromptDetailCardProps) {
  return (
    <XDSCard>
      <div {...stylex.props(styles.card)}>
        <XDSVStack gap="space3">
          {/* Header with prompt ID and code buttons */}
          <XDSHStack gap="space3" hAlign="between" vAlign="center">
            <XDSHeading level={4}>{promptId}</XDSHeading>
            <XDSHStack gap="space2">
              {hasXdsCode && (
                <XDSButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewCode('xds')}>
                  View XDS Code
                </XDSButton>
              )}
              {hasBaselineCode && (
                <XDSButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onViewCode('baseline')}>
                  View Baseline Code
                </XDSButton>
              )}
            </XDSHStack>
          </XDSHStack>

          {/* Score summaries side by side */}
          {(xdsScore || baselineScore) && (
            <XDSHStack gap="space4">
              {xdsScore && <ScoreSummary label="XDS" score={xdsScore} />}
              {baselineScore && (
                <ScoreSummary label="Baseline" score={baselineScore} />
              )}
            </XDSHStack>
          )}

          {/* Findings */}
          {xdsScore && (
            <>
              <XDSDivider />
              <div {...stylex.props(styles.section)}>
                <div {...stylex.props(styles.sectionLabel)}>
                  <XDSText type="label">XDS Findings</XDSText>
                </div>
                <Findings score={xdsScore} />
              </div>
            </>
          )}

          {baselineScore && (
            <>
              <XDSDivider />
              <div {...stylex.props(styles.section)}>
                <div {...stylex.props(styles.sectionLabel)}>
                  <XDSText type="label">Baseline Findings</XDSText>
                </div>
                <Findings score={baselineScore} />
              </div>
            </>
          )}
        </XDSVStack>
      </div>
    </XDSCard>
  );
}
