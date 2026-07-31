// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ChatSpeechButton.tsx
 * @input Uses React, StyleX, Button, Icon, useChatSpeech return
 * @output Exports ChatSpeechButton for text-to-speech playback of a message
 * @position UI component — renders in the footer/metadata slot of a ChatMessage
 *
 * A toggle button that connects to useChatSpeech. Shows a speaker icon when
 * idle. While speaking, it replaces the icon with animated sound-wave bars
 * (CSS keyframes) and clicking stops playback. Unlike ChatDictationButton
 * there is no live volume signal from the SpeechSynthesis API, so the bars
 * animate on a fixed loop rather than reacting to audio.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Chat/index.ts (exports)
 */

import React from 'react';
import type {UseChatSpeechReturn} from './useChatSpeech';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';

// =============================================================================
// Types
// =============================================================================

export interface ChatSpeechButtonProps extends BaseProps<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  /** The return value from useChatSpeech. */
  speech: UseChatSpeechReturn;
  /** The text to read aloud when the button is pressed. */
  text: string;
  /** Button size. @default "md" */
  size?: 'sm' | 'md';
  /** Hide the button when SpeechSynthesis is not supported. @default true */
  isHiddenWhenUnsupported?: boolean;
  /** Accessible label override. */
  label?: string;
}

// =============================================================================
// Styles
// =============================================================================

const soundWave = stylex.keyframes({
  '0%, 100%': {transform: 'scaleY(0.28)'},
  '50%': {transform: 'scaleY(1)'},
});

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
    backgroundColor: `var(--color-accent, ${colorVars['--color-accent']})`,
    animationName: soundWave,
    animationDuration: '0.9s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
});

// =============================================================================
// Constants
// =============================================================================

const BAR_COUNT = 4;
// Per-bar animation offsets so the wave shimmers instead of pulsing in unison.
const BAR_DELAYS = ['0s', '0.15s', '0.3s', '0.45s'];

const SIZE_CONFIG = {
  sm: {barWidth: 2, barGap: 1.5, barMaxHeight: 14},
  md: {barWidth: 2.5, barGap: 2, barMaxHeight: 18},
};

// =============================================================================
// Component
// =============================================================================

/**
 * Speaker button that reads a chat message aloud via text-to-speech.
 * Requires the return value of useChatSpeech and the text to speak.
 *
 * @example
 * ```
 * const speech = useChatSpeech();
 * <ChatSpeechButton speech={speech} text={message} />
 * ```
 */
export function ChatSpeechButton({
  ref,
  speech,
  text,
  size = 'md',
  isHiddenWhenUnsupported = true,
  label,
  xstyle,
  className,
  style,
  ...rest
}: ChatSpeechButtonProps) {
  if (isHiddenWhenUnsupported && !speech.isSupported) {
    return null;
  }

  const {isSpeaking} = speech;
  const accessibleLabel = label ?? (isSpeaking ? 'Stop reading' : 'Read aloud');

  const {barWidth, barGap, barMaxHeight} = SIZE_CONFIG[size];

  const handleClick = () => {
    if (isSpeaking) {
      speech.stop();
    } else {
      speech.speak(text);
    }
  };

  return (
    <span
      ref={ref}
      {...mergeProps(stylex.props(styles.wrapper, xstyle), className, style)}
      {...rest}>
      {isSpeaking && (
        <span
          aria-hidden
          {...mergeProps(stylex.props(styles.barsContainer), {
            style: {gap: barGap, height: barMaxHeight},
          })}>
          {Array.from({length: BAR_COUNT}).map((_, i) => (
            <span
              // eslint-disable-next-line @eslint-react/no-array-index-key -- sound-wave bars are fixed positional slots
              key={i}
              {...mergeProps(stylex.props(styles.bar), {
                style: {
                  width: barWidth,
                  height: '100%',
                  animationDelay: BAR_DELAYS[i],
                },
              })}
            />
          ))}
        </span>
      )}
      <Button
        label={accessibleLabel}
        aria-label={accessibleLabel}
        aria-pressed={isSpeaking}
        variant="ghost"
        size={size}
        icon={isSpeaking ? undefined : <Icon icon="speaker" size={size} />}
        isIconOnly
        onClick={handleClick}
      />
    </span>
  );
}

ChatSpeechButton.displayName = 'ChatSpeechButton';
