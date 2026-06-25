// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Card} from '@astryxdesign/core/Card';
import {VStack} from '@astryxdesign/core/Stack';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Text';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
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
      <StatusDot
        variant={scoreToStatusVariant(score)}
        label={`${label}: ${score}`}
        size="sm"
      />
      <Text type="supporting">
        {label} {score}
      </Text>
    </div>
  );
}

function ScoreSummary({label, score}: {label: string; score: UniversalScore}) {
  return (
    <div className="report-promptDetail-scoreBlock">
      <VStack gap={2}>
        <Text type="label">{label}</Text>
        <div className="report-promptDetail-scoreGrid">
          {ALL_DIMENSIONS.filter(dim => score[dim] != null).map(dim => (
            <ScoreItem
              key={dim}
              label={DIMENSION_LABELS[dim]}
              score={score[dim]?.score ?? 0}
            />
          ))}
          <ScoreItem label="Overall" score={computeOverall(score)} />
        </div>
      </VStack>
    </div>
  );
}

function Findings({score}: {score: UniversalScore}) {
  const allFindings = ALL_DIMENSIONS.filter(dim => score[dim] != null).flatMap(
    dim =>
      (score[dim]?.findings ?? []).map(f => ({
        dimension: DIMENSION_LABELS[dim],
        ...f,
      })),
  );

  if (allFindings.length === 0) {
    return <Text type="supporting">No issues found.</Text>;
  }

  return (
    <div className="report-promptDetail-findingsGrid">
      {allFindings.map((f, i) => (
        <>
          <Badge
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
          <Text key={`text-${i}`} type="body">
            <strong>{f.dimension}</strong> — {f.detail}
          </Text>
        </>
      ))}
    </div>
  );
}

interface PromptDetailCardProps {
  promptId: string;
  /** The actual prompt text shown to the agent */
  promptText?: string;
  astryxScore?: UniversalScore;
  baselineScore?: UniversalScore;
  htmlScore?: UniversalScore;
  xdsTailwindScore?: UniversalScore;
  hasXdsCode: boolean;
  hasBaselineCode: boolean;
  hasHtmlCode: boolean;
  hasXdsTailwindCode: boolean;
  onViewCode: (target: 'xds' | 'baseline' | 'html' | 'xds-tailwind') => void;
  /** Relative preview URLs keyed by target (e.g. { astryx: "previews/sd-1/astryx.html" }) */
  previewUrls?: Record<string, string>;
}

export function PromptDetailCard({
  promptId,
  promptText,
  astryxScore,
  baselineScore,
  htmlScore,
  xdsTailwindScore,
  hasXdsCode,
  hasBaselineCode,
  hasHtmlCode,
  hasXdsTailwindCode,
  onViewCode,
  previewUrls,
}: PromptDetailCardProps) {
  const hasAnyPreview =
    previewUrls?.astryx ||
    previewUrls?.baseline ||
    previewUrls?.html ||
    previewUrls?.['xds-tailwind'];
  const hasAnyCode =
    hasXdsCode || hasBaselineCode || hasHtmlCode || hasXdsTailwindCode;

  // Count how many score blocks we have
  const scoreCount = [
    astryxScore,
    baselineScore,
    htmlScore,
    xdsTailwindScore,
  ].filter(Boolean).length;
  const scoresClassName =
    scoreCount >= 4
      ? 'report-promptDetail-scoresRow4'
      : scoreCount === 3
        ? 'report-promptDetail-scoresRow3'
        : scoreCount === 2
          ? 'report-promptDetail-scoresRow'
          : 'report-promptDetail-scoresRowSingle';

  return (
    <Card>
      <div className="report-promptDetail-card">
        <VStack gap={3}>
          {/* Header: prompt ID, prompt text, and buttons */}
          <div className="report-promptDetail-header">
            <Heading level={4}>{promptId}</Heading>
            {promptText && (
              <Text type="body" className="report-promptDetail-promptText">
                {promptText}
              </Text>
            )}
            {(hasAnyPreview || hasAnyCode) && (
              <div className="report-promptDetail-buttonRow">
                {previewUrls?.astryx && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.astryx, '_blank')}
                    label="Astryx Preview"
                  />
                )}
                {previewUrls?.baseline && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.baseline, '_blank')}
                    label="Baseline Preview"
                  />
                )}
                {previewUrls?.html && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(previewUrls.html, '_blank')}
                    label="HTML Preview"
                  />
                )}
                {previewUrls?.['xds-tailwind'] && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      window.open(previewUrls['xds-tailwind'], '_blank')
                    }
                    label="XDS+TW Preview"
                  />
                )}
                {hasXdsCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('astryx')}
                    label="Astryx Code"
                  />
                )}
                {hasBaselineCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('baseline')}
                    label="Baseline Code"
                  />
                )}
                {hasHtmlCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('html')}
                    label="HTML Code"
                  />
                )}
                {hasXdsTailwindCode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewCode('xds-tailwind')}
                    label="XDS+TW Code"
                  />
                )}
              </div>
            )}
          </div>

          {/* Score summaries in constrained grid */}
          {(astryxScore || baselineScore || htmlScore || xdsTailwindScore) && (
            <div className={scoresClassName}>
              {astryxScore && <ScoreSummary label="Astryx" score={astryxScore} />}
              {baselineScore && (
                <ScoreSummary label="Baseline" score={baselineScore} />
              )}
              {htmlScore && <ScoreSummary label="HTML" score={htmlScore} />}
              {xdsTailwindScore && (
                <ScoreSummary label="XDS+TW" score={xdsTailwindScore} />
              )}
            </div>
          )}

          {/* Findings */}
          {astryxScore && (
            <>
              <Divider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <Text type="label">Astryx Findings</Text>
                </div>
                <Findings score={astryxScore} />
              </div>
            </>
          )}

          {baselineScore && (
            <>
              <Divider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <Text type="label">Baseline Findings</Text>
                </div>
                <Findings score={baselineScore} />
              </div>
            </>
          )}

          {htmlScore && (
            <>
              <Divider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <Text type="label">HTML Findings</Text>
                </div>
                <Findings score={htmlScore} />
              </div>
            </>
          )}

          {xdsTailwindScore && (
            <>
              <Divider />
              <div className="report-promptDetail-section">
                <div className="report-promptDetail-sectionLabel">
                  <Text type="label">XDS+TW Findings</Text>
                </div>
                <Findings score={xdsTailwindScore} />
              </div>
            </>
          )}
        </VStack>
      </div>
    </Card>
  );
}
