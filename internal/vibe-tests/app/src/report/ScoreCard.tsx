import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Stack';
import {XDSHStack} from '@xds/core/Stack';
import {XDSText} from '@xds/core/Text';
import {XDSHeading} from '@xds/core/Text';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {spacingVars, colorVars} from '@xds/core/theme/tokens.stylex';
import {formatScore, scoreToProgressVariant} from './utils';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
  },
  deltaPositive: {
    color: colorVars['--color-positive'],
  },
  deltaNegative: {
    color: colorVars['--color-negative'],
  },
  deltaNeutral: {
    color: colorVars['--color-text-secondary'],
  },
});

interface ScoreCardProps {
  label: string;
  score: number;
  compareScore?: number;
  compareLabel?: string;
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
      <div {...stylex.props(styles.card)}>
        <XDSVStack gap="space2">
          <XDSText type="label">{label}</XDSText>
          <XDSHStack gap="space2" hAlign="center">
            <XDSHeading level={2}>{formatScore(score)}</XDSHeading>
            {delta != null && (
              <XDSText
                type="supporting"
                xstyle={
                  delta > 0
                    ? styles.deltaPositive
                    : delta < 0
                      ? styles.deltaNegative
                      : styles.deltaNeutral
                }>
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
