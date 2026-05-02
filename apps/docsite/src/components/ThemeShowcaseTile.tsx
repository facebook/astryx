'use client';

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  typographyVars,
  borderVars,
} from '@xds/core/theme/tokens.stylex';
import {XDSButton} from '@xds/core/Button';

const styles = stylex.create({
  tile: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    padding: 20,
    borderRadius: radiusVars['--radius-container'],
    backgroundColor: colorVars['--color-background-body'],
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fontSamples: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  headingFont: {
    fontFamily: typographyVars['--font-family-heading'],
    fontSize: 36,
    fontWeight: 300,
    lineHeight: 1,
    color: colorVars['--color-text-primary'],
    letterSpacing: '-0.02em',
  },
  bodyFont: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 13,
    fontWeight: 400,
    lineHeight: 1.3,
    color: colorVars['--color-text-secondary'],
  },
  codeFont: {
    fontFamily: typographyVars['--font-family-code'],
    fontSize: 11,
    fontWeight: 400,
    lineHeight: 1.3,
    color: colorVars['--color-text-disabled'],
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  colorStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: radiusVars['--radius-full'],
  },
  dotAccent: {
    backgroundColor: colorVars['--color-accent'],
  },
  dotPrimary: {
    backgroundColor: colorVars['--color-text-primary'],
  },
  dotSecondary: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  dotDisabled: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
  shapeRow: {
    display: 'flex',
    gap: 6,
  },
  shape: {
    width: 36,
    height: 36,
    backgroundColor: colorVars['--color-background-card'],
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-border-emphasized'],
    boxSizing: 'border-box',
  },
  shapeInner: {
    borderRadius: radiusVars['--radius-inner'],
  },
  shapeElement: {
    borderRadius: radiusVars['--radius-element'],
  },
  shapeContainer: {
    borderRadius: radiusVars['--radius-container'],
  },
  shapeFull: {
    borderRadius: radiusVars['--radius-full'],
  },
});

export function ThemeShowcaseTile({label}: {label: string}) {
  return (
    <div {...stylex.props(styles.tile)} inert>
      <div {...stylex.props(styles.topRow)}>
        <div {...stylex.props(styles.fontSamples)}>
          <span {...stylex.props(styles.headingFont)}>Aa</span>
          <span {...stylex.props(styles.bodyFont)}>Body text</span>
          <span {...stylex.props(styles.codeFont)}>{'<Code />'}</span>
        </div>
        <div {...stylex.props(styles.rightGroup)}>
          <XDSButton variant="primary" label={label} size="sm" />
          <div {...stylex.props(styles.colorStack)}>
            <div {...stylex.props(styles.colorDot, styles.dotAccent)} />
            <div {...stylex.props(styles.colorDot, styles.dotPrimary)} />
            <div {...stylex.props(styles.colorDot, styles.dotSecondary)} />
            <div {...stylex.props(styles.colorDot, styles.dotDisabled)} />
          </div>
        </div>
      </div>
      <div {...stylex.props(styles.shapeRow)}>
        <div {...stylex.props(styles.shape, styles.shapeFull)} />
        <div {...stylex.props(styles.shape, styles.shapeFull)} />
        <div {...stylex.props(styles.shape, styles.shapeContainer)} />
        <div {...stylex.props(styles.shape, styles.shapeElement)} />
        <div {...stylex.props(styles.shape, styles.shapeInner)} />
      </div>
    </div>
  );
}
