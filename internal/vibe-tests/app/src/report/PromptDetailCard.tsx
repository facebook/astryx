import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSStatusDot} from '@xds/core/StatusDot';
import {XDSBadge} from '@xds/core/Badge';
import {XDSButton} from '@xds/core/Button';
import {XDSDivider} from '@xds/core/Divider';
import type {UniversalScore} from './types';
import {
  ALL_DIMENSIONS,
  DIMENSION_LABELS,
  computeOverall,
  scoreToStatusVariant,
} from './utils';
import './report.css';

function ScoreItem({label, score}: {label: string; score: number}) {
  return (
    <div className="report-promptDetail-scoreItem">
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
    <div className="report-promptDetail-scoreBlock">
      <XDSVStack gap={2}>
        <XDSText type="label">{label}</XDSText>
        <div className="report-promptDetail-scoreGrid">
          {ALL_DIMENSIONS.filter(dim => score[dim] != null).map(dim => (
            <ScoreItem
              key={dim}
              label={DIMENSION_LABELS[dim]}
              score={score[dim]!.score}
            />
          ))}
          <ScoreItem label="Overall" score={computeOverall(score)} />
        </div>
      </XDSVStack>
    </div>
  );
}

function Findings({score}: {score: UniversalScore}) {
  const allFindings = ALL_DIMENSIONS.filter(dim => score[dim] != null).flatMap(
    dim =>
      (score[dim]!.findings ?? []).map(f => ({
        dimension: DIMENSION_LABELS[dim],
        ...f,
      })),
  );

  if (allFindings.length === 0) {
    return <XDSText type="supporting">No issues found.</XDSText>;
  }

  return (
    <div className="report-promptDetail-findingsGrid">
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
            }
            label={f.severity ?? 'info'}
          />
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

  const scoresClassName = hasAll
    ? 'report-promptDetail-scoresRow3'
    : hasBoth
      ? 'report-promptDetail-scoresRow'
      : 'report-promptDetail-scoresRowSingle';

  return (
    <XDSCard>
      <div className="report-promptDetail-card">
        <XDSVStack gap={3}>
          {/* Header: prompt ID, prompt text, and buttons */}
          <div className="report-promptDetail-header">
            <XDSHeading level={4}>{promptId}</XDSHeading>
            {promptText && (
              <XDSText type="body" className="report-promptDetail-promptText">
                {promptText}
              </XDSText>
            )}
            {(hasAnyPreview || hasAnyCode) && (
              <div className="report-promptDetail-buttonRow">
                {previewUrls?.xds && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.xds, '_blank')}
                    label="XDS Preview"
                  />
                )}
                {previewUrls?.baseline && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.baseline, '_blank')}
                    label="Baseline Preview"
                  />
                )}
                {previewUrls?.html && (
                  <XDSButton
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.html, '_blank')}
                    label="HTML Preview"
                  />
                )}
                {hasXdsCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('xds')}
                    label="XDS Code"
                  />
                )}
                {hasBaselineCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('baseline')}
                    label="Baseline Code"
                  />
                )}
                {hasHtmlCode && (
                  <XDSButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('html')}
                    label="HTML Code"
                  />
                )}
              </div>
            )}
          </div>

          {/* Score summaries in constrained grid */}
          {(xdsScore || baselineScore || htmlScore) && (
            <div className={scoresClassName}>
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
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <XDSText type="label">XDS Findings</XDSText>
                </div>
                <Findings score={xdsScore} />
              </div>
            </>
          )}

          {baselineScore && (
            <>
              <XDSDivider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <XDSText type="label">Baseline Findings</XDSText>
                </div>
                <Findings score={baselineScore} />
              </div>
            </>
          )}

          {htmlScore && (
            <>
              <XDSDivider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
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
