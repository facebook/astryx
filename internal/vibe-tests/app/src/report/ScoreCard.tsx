import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {formatScore, scoreToProgressVariant} from './utils';
import './report.css';

interface ScoreCardProps {
  label: string;
  score: number;
  compareScore?: number;
  compareLabel?: string;
}

function deltaClassName(delta: number): string {
  if (delta > 0) return 'report-color-positive';
  if (delta < 0) return 'report-color-negative';
  return 'report-color-neutral';
}

export function ScoreCard({
  label,
  score,
  compareScore,
  compareLabel,
}: ScoreCardProps) {
  const delta = compareScore != null ? score - compareScore : undefined;

  return (
    <XDSCard>
      <div className="report-scoreCard-card">
        <XDSVStack gap="space2">
          <XDSText type="label">{label}</XDSText>
          <XDSHStack gap="space2" hAlign="center">
            <XDSHeading level={2}>{formatScore(score)}</XDSHeading>
            {delta != null && (
              <XDSText type="supporting" className={deltaClassName(delta)}>
                {delta > 0 ? '+' : ''}
                {formatScore(delta)}
                {compareLabel ? ` vs ${compareLabel}` : ''}
              </XDSText>
            )}
          </XDSHStack>
          <XDSProgressBar
            label={label}
            isLabelHidden
            value={score}
            max={100}
            variant={scoreToProgressVariant(score)}
            size="sm"
          />
        </XDSVStack>
      </div>
    </XDSCard>
  );
}
