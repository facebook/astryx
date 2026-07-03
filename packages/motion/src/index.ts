import { core } from '@jedi/tokens';

export const duration = core.motion.duration;
export const easing = core.motion.easing;

export const transition = {
  fast: `${duration.fast} ${easing.standard}`,
  normal: `${duration.normal} ${easing.standard}`,
  slow: `${duration.slow} ${easing.standard}`,
} as const;

export const keyframes = {
  spin: '@keyframes jedi-spin { to { transform: rotate(360deg); } }',
  fadeIn: '@keyframes jedi-fade-in { from { opacity: 0; } to { opacity: 1; } }',
} as const;

export function motionStyleSheet(): string {
  return Object.values(keyframes).join('\n');
}
