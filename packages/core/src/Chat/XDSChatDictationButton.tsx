'use client';

/**
 * @file XDSChatDictationButton.tsx
 * @input Uses React, StyleX, XDSButton, XDSIcon, useXDSChatDictation return
 * @output Exports XDSChatDictationButton for voice input in chat composer
 * @position UI component — renders in sendActions slot of XDSChatComposer
 *
 * A toggle button that connects to useXDSChatDictation. Shows a microphone
 * icon when idle. When listening, replaces the icon with volume-reactive
 * frequency bars (equalizer style) that respond to real mic input.
 * Bars use the accent color and hue-shift when volume clips past 10%.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 * - /packages/cli/templates/blocks/components/ChatDictationButton/ (block examples)
 */

import type {UseSpeechRecognitionReturn} from './useSpeechRecognition';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {XDSButton} from '../Button';
import {XDSIcon} from '../Icon';
import {mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSChatDictationButtonProps {
  /** The return value from useXDSChatDictation or useSpeechRecognition. */
  dictation: UseSpeechRecognitionReturn;
  /** Button size. @default "md" */
  size?: 'sm' | 'md';
  /** Hide the button when SpeechRecognition is not supported. @default true */
  isHiddenWhenUnsupported?: boolean;
  /** Accessible label override. */
  label?: string;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   *
   * @example
   * ```
   * const styles = stylex.create({ wrapper: { marginTop: 8 } });
   * <XDSChatDictationButton xstyle={styles.wrapper} />
   * ```
   */
  xstyle?: StyleXStyles;
}

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barsContainer: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1,
  },
  bar: {
    borderRadius: radiusVars['--radius-full'],
    transformOrigin: 'center',
    transitionProperty: 'transform, background-color',
    transitionDuration: '0.06s',
    transitionTimingFunction: 'ease-out',
  },
});

// =============================================================================
// Constants
// =============================================================================

const BAR_COUNT = 5;
const BAR_MIN_SCALE = 0.08;

const SIZE_CONFIG = {
  sm: {barWidth: 2, barGap: 1.5, barMaxHeight: 14},
  md: {barWidth: 2.5, barGap: 2, barMaxHeight: 18},
};

// =============================================================================
// Component
// =============================================================================

/**
 * Microphone button for voice input in a chat composer.
 * Requires the return value of useXDSChatDictation.
 *
 * @example
 * ```
 * <XDSChatDictationButton dictation={dictation} />
 * ```
 */
export function XDSChatDictationButton({
  dictation,
  size = 'md',
  isHiddenWhenUnsupported = true,
  label,
  xstyle,
}: XDSChatDictationButtonProps) {
  if (isHiddenWhenUnsupported && !dictation.isSupported) {
    return null;
  }

  const {isListening, bands, volume: rawVolume} = dictation;
  const accessibleLabel =
    label ?? (isListening ? 'Stop dictation' : 'Start dictation');

  // Boost each band for visibility — quiet speech (0-10%) maps to full visual range
  const boostedBands = bands.map(b => Math.min(Math.pow(b / 0.2, 0.5), 1));

  // Hue shift from accent color when volume clips past 10%
  const isClipping = rawVolume >= 0.2;
  const hueShift = isClipping ? Math.min((rawVolume - 0.2) / 0.1, 1) * 60 : 0;

  const barColor = isClipping
    ? `hsl(calc(var(--accent-hue, 210) + ${hueShift}), 80%, 50%)`
    : `var(--color-accent, ${colorVars['--color-accent']})`;

  const {barWidth, barGap, barMaxHeight} = SIZE_CONFIG[size];

  return (
    <span {...stylex.props(styles.wrapper, xstyle)}>
      {isListening && (
        <span
          aria-hidden
          {...mergeProps(stylex.props(styles.barsContainer), {
            style: {gap: barGap, height: barMaxHeight},
          })}>
          {boostedBands.slice(0, BAR_COUNT).map((level, i) => {
            const scale = BAR_MIN_SCALE + level * (1 - BAR_MIN_SCALE);
            return (
              <span
                key={i}
                {...mergeProps(stylex.props(styles.bar), {
                  style: {
                    width: barWidth,
                    height: '100%',
                    backgroundColor: barColor,
                    transform: `scaleY(${scale})`,
                  },
                })}
              />
            );
          })}
        </span>
      )}
      <XDSButton
        label={accessibleLabel}
        aria-label={accessibleLabel}
        variant="ghost"
        size={size}
        icon={
          isListening ? undefined : <XDSIcon icon="microphone" size={size} />
        }
        isIconOnly
        onClick={dictation.toggle}
      />
    </span>
  );
}

XDSChatDictationButton.displayName = 'XDSChatDictationButton';
