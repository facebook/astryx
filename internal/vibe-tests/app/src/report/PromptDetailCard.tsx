import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
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
  promptText: {
    color: colorVars['--color-text-secondary'],
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
  scoresRow3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
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
  /** The actual prompt text shown to the agent */
  promptText?: string;
  xdsScore?: UniversalScore;
  baselineScore?: UniversalScore;
  htmlScore?: UniversalScore;
  hasXdsCode: boolean;
  hasBaselineCode: boolean;
  hasHtmlCode: boolean;
  onViewCode: (target: 'xds' | 'baseline' | 'html') => void;
  /** Relative preview URLs keyed by target (e.g. { xds: "previews/sd-1/xds.html" }) */
  previewUrls?: Record<string, string>;
}

export function PromptDetailCard({
  promptId,
  promptText,
  xdsScore,
  baselineScore,
  htmlScore,
  hasXdsCode,
  hasBaselineCode,
  hasHtmlCode,
  onViewCode,
  previewUrls,
}: PromptDetailCardProps) {
  const hasBoth = !!(xdsScore && baselineScore);
  const hasAll = !!(xdsScore && baselineScore && htmlScore);
  const hasAnyPreview =
    previewUrls?.xds || previewUrls?.baseline || previewUrls?.html;
  const hasAnyCode = hasXdsCode || hasBaselineCode || hasHtmlCode;

  const scoresStyle = hasAll
    ? styles.scoresRow3
    : hasBoth
      ? styles.scoresRow
      : styles.scoresRowSingle;

  return (
    <XDSCard>
      <div {...stylex.props(styles.card)}>
        <XDSVStack gap="space3">
          {/* Header: prompt ID, prompt text, and buttons */}
          <div {...stylex.props(styles.header)}>
            <XDSHeading level={4}>{promptId}</XDSHeading>
            {promptText && (
              <XDSText type="body" xstyle={styles.promptText}>
                {promptText}
              </XDSText>
            )}
            {(hasAnyPreview || hasAnyCode) && (
              <div {...stylex.props(styles.buttonRow)}>
                {previewUrls?.xds && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.xds, '_blank')}>
                    XDS Preview
                  </XDSButton>
                )}
                {previewUrls?.baseline && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.baseline, '_blank')}>
                    Baseline Preview
                  </XDSButton>
                )}
                {previewUrls?.html && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.html, '_blank')}>
                    HTML Preview
                  </XDSButton>
                )}
                {hasXdsCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('xds')}>
                    XDS Code
                  </XDSButton>
                )}
                {hasBaselineCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('baseline')}>
                    Baseline Code
                  </XDSButton>
                )}
                {hasHtmlCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('html')}>
                    HTML Code
                  </XDSButton>
                )}
              </div>
            )}
          </div>

          {/* Score summaries in constrained grid */}
          {(xdsScore || baselineScore || htmlScore) && (
            <div {...stylex.props(scoresStyle)}>
              {xdsScore && <ScoreSummary label="XDS" score={xdsScore} />}
              {baselineScore && (
                <ScoreSummary label="Baseline" score={baselineScore} />
              )}
              {htmlScore && <ScoreSummary label="HTML" score={htmlScore} />}
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

          {htmlScore && (
            <>
              <XDSDivider />
              <div {...stylex.props(styles.section)}>
                <div {...stylex.props(styles.sectionLabel)}>
                  <XDSText type="label">HTML Findings</XDSText>
                </div>
                <Findings score={htmlScore} />
              </div>
            </>
          )}
        </XDSVStack>
      </div>
    </XDSCard>
  );
}
