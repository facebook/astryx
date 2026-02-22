import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import type {UniversalScore} from './types';
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  computeOverall,
  scoreToStatusVariant,
} from './utils';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  scoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: spacingVars['--spacing-2'],
  },
  scoreItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    whiteSpace: 'nowrap',
  },
  scoresRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: spacingVars['--spacing-3'],
  },
  scoresRowSingle: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: spacingVars['--spacing-3'],
  },
  scoreBlock: {
    minWidth: 0,
    overflow: 'hidden',
  },
  findingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: `${spacingVars['--spacing-1']} ${spacingVars['--spacing-2']}`,
    alignItems: 'baseline',
  },
  section: {
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  sectionLabel: {
    paddingBlockEnd: spacingVars['--spacing-1'],
  },
  buttonRow: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
  },
});

function ScoreItem({label, score}: {label: string; score: number}) {
  return (
    <div {...stylex.props(styles.scoreItem)}>
      <XDSStatusDot
        variant={scoreToStatusVariant(score)}
        label={`${label}: ${score}`}
        size="sm"
      />
      <XDSText type="supporting">
        {label} {score}
      </XDSText>
    </div>
  );
}

function ScoreSummary({label, score}: {label: string; score: UniversalScore}) {
  return (
    <div {...stylex.props(styles.scoreBlock)}>
      <XDSVStack gap="space2">
        <XDSText type="label">{label}</XDSText>
        <div {...stylex.props(styles.scoreGrid)}>
          {ALL_DIMENSIONS.map(dim => (
            <ScoreItem
              key={dim}
              label={DIMENSION_LABELS[dim]}
              score={score[dim].score}
            />
          ))}
          <ScoreItem label="Overall" score={computeOverall(score)} />
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
    <div {...stylex.props(styles.findingsGrid)}>
      {allFindings.map((f, i) => (
        <>
          <XDSBadge
            key={`badge-${i}`}
            variant={
              f.severity === 'critical'
                ? 'error'
                : f.severity === 'moderate'
                  ? 'warning'
                  : 'neutral'
            }>
            {f.severity ?? 'info'}
          </XDSBadge>
          <XDSText key={`text-${i}`} type="body">
            <strong>{f.dimension}</strong> — {f.detail}
          </XDSText>
        </>
      ))}
    </div>
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
  const hasBoth = !!(xdsScore && baselineScore);

  return (
    <XDSCard>
      <div {...stylex.props(styles.card)}>
        <XDSVStack gap="space3">
          {/* Header: prompt ID on its own line, buttons below */}
          <div {...stylex.props(styles.header)}>
            <XDSHeading level={4}>{promptId}</XDSHeading>
            {(hasXdsCode || hasBaselineCode) && (
              <div {...stylex.props(styles.buttonRow)}>
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
              </div>
            )}
          </div>

          {/* Score summaries in constrained grid */}
          {(xdsScore || baselineScore) && (
            <div
              {...stylex.props(
                hasBoth ? styles.scoresRow : styles.scoresRowSingle,
              )}>
              {xdsScore && <ScoreSummary label="XDS" score={xdsScore} />}
              {baselineScore && (
                <ScoreSummary label="Baseline" score={baselineScore} />
              )}
            </div>
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
