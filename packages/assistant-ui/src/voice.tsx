// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file voice.tsx
 * @input Uses assistant-ui voice state/controls and Astryx actions/tokens
 * @output Exports VoiceOrb, VoiceControl, and voice action components
 * @position Runtime-aware voice ready composition
 */

import type {FC} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  useVoiceControls,
  useVoiceState,
  useVoiceVolume,
} from '@assistant-ui/react';
import {Button} from '@astryxdesign/core/Button';
import {HStack} from '@astryxdesign/core/HStack';
import {Icon} from '@astryxdesign/core/Icon';
import {Text} from '@astryxdesign/core/Text';
import {
  colorVars,
  durationVars,
  easeVars,
  radiusVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {TooltipIconButton} from './tooltip-icon-button';

export type VoiceOrbState =
  'idle' | 'connecting' | 'listening' | 'speaking' | 'muted';

export type VoiceOrbVariant = 'default' | 'blue' | 'violet' | 'emerald';

const pulse = stylex.keyframes({
  '0%': {opacity: 0.7},
  '50%': {opacity: 1},
  '100%': {opacity: 0.7},
});

const styles = stylex.create({
  orb: (scale: number) => ({
    display: 'inline-block',
    width: 64,
    height: 64,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-text-secondary'],
    boxShadow: `0 0 0 8px ${colorVars['--color-background-muted']}`,
    transform: `scale(${scale})`,
    transitionProperty: 'transform, background-color, opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  }),
  blue: {
    backgroundColor: colorVars['--color-text-blue'],
  },
  violet: {
    backgroundColor: colorVars['--color-text-purple'],
  },
  emerald: {
    backgroundColor: colorVars['--color-text-green'],
  },
  connecting: {
    animationName: pulse,
    animationDuration: durationVars['--duration-slow'],
    animationIterationCount: 'infinite',
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
  muted: {
    backgroundColor: colorVars['--color-error'],
    opacity: 0.65,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-icon-secondary'],
  },
  statusConnected: {
    backgroundColor: colorVars['--color-success'],
  },
  statusConnecting: {
    backgroundColor: colorVars['--color-warning'],
  },
  statusMuted: {
    backgroundColor: colorVars['--color-error'],
  },
});

export function deriveVoiceOrbState(
  voiceState: ReturnType<typeof useVoiceState>,
): VoiceOrbState {
  if (voiceState == null || voiceState.status.type === 'ended') {
    return 'idle';
  }
  if (voiceState.status.type === 'starting') {
    return 'connecting';
  }
  if (voiceState.isMuted) {
    return 'muted';
  }
  return voiceState.mode === 'speaking' ? 'speaking' : 'listening';
}

export interface VoiceOrbProps {
  state?: VoiceOrbState;
  variant?: VoiceOrbVariant;
  label?: string;
}

export const VoiceOrb: FC<VoiceOrbProps> = ({
  state: stateProp,
  variant = 'default',
  label,
}) => {
  const voiceState = useVoiceState();
  const volume = useVoiceVolume();
  const state = stateProp ?? deriveVoiceOrbState(voiceState);
  const scale = 1 + Math.min(1, Math.max(0, volume)) * 0.12;
  const variantStyle =
    variant === 'blue'
      ? styles.blue
      : variant === 'violet'
        ? styles.violet
        : variant === 'emerald'
          ? styles.emerald
          : null;

  return (
    <span
      aria-label={label ?? `Voice assistant ${state}`}
      data-state={state}
      role="img"
      {...stylex.props(
        styles.orb(scale),
        variantStyle,
        state === 'connecting' && styles.connecting,
        state === 'muted' && styles.muted,
      )}
    />
  );
};

export const VoiceStatusDot: FC = () => {
  const state = deriveVoiceOrbState(useVoiceState());
  return (
    <span
      aria-hidden="true"
      data-state={state}
      {...stylex.props(
        styles.statusDot,
        (state === 'listening' || state === 'speaking') &&
          styles.statusConnected,
        state === 'connecting' && styles.statusConnecting,
        state === 'muted' && styles.statusMuted,
      )}
    />
  );
};

export const VoiceConnectButton: FC = () => {
  const {connect} = useVoiceControls();
  return (
    <Button
      icon={<Icon icon="microphone" size="sm" />}
      label="Connect voice"
      onClick={() => void connect()}
      size="sm"
      variant="primary"
    />
  );
};

export const VoiceMuteButton: FC = () => {
  const voiceState = useVoiceState();
  const {mute, unmute} = useVoiceControls();
  const isMuted = voiceState?.isMuted ?? false;
  return (
    <TooltipIconButton
      onClick={() => (isMuted ? unmute() : mute())}
      size="sm"
      tooltip={isMuted ? 'Unmute' : 'Mute'}>
      <Icon color={isMuted ? 'error' : 'inherit'} icon="microphone" size="sm" />
    </TooltipIconButton>
  );
};

export const VoiceDisconnectButton: FC = () => {
  const {disconnect} = useVoiceControls();
  return (
    <TooltipIconButton
      onClick={() => disconnect()}
      size="sm"
      tooltip="Disconnect">
      <Icon color="error" icon="stop" size="sm" />
    </TooltipIconButton>
  );
};

export const VoiceControl: FC = () => {
  const voiceState = useVoiceState();
  const state = deriveVoiceOrbState(voiceState);
  const isActive =
    voiceState != null &&
    voiceState.status.type !== 'ended' &&
    voiceState.status.type !== 'starting';
  return (
    <HStack align="center" gap={2}>
      <VoiceStatusDot />
      <Text color="secondary" type="supporting">
        {state === 'connecting' ? 'Connecting…' : state}
      </Text>
      {voiceState == null || voiceState.status.type === 'ended' ? (
        <VoiceConnectButton />
      ) : isActive ? (
        <>
          <VoiceMuteButton />
          <VoiceDisconnectButton />
        </>
      ) : null}
    </HStack>
  );
};
