import type { ReactNode } from 'react';
import { tokenToCssVar } from '@jedi/tokens';

export const focusRingStyle = {
  outline: `2px solid var(${tokenToCssVar('semantic.focus.ring')})`,
  outlineOffset: '2px',
} as const;

export interface SkipLinkProps {
  href?: string;
  children?: ReactNode;
}

export function SkipLink({ href = '#main', children = 'Skip to main content' }: SkipLinkProps) {
  return (
    <a
      href={href}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
      onFocus={(e) => {
        Object.assign(e.currentTarget.style, {
          position: 'fixed',
          left: '16px',
          top: '16px',
          width: 'auto',
          height: 'auto',
          padding: '8px 16px',
          background: 'var(--jedi-semantic-surface-inverse)',
          color: 'var(--jedi-semantic-text-inverse)',
          zIndex: '9999',
          borderRadius: '4px',
        });
      }}
      onBlur={(e) => {
        Object.assign(e.currentTarget.style, {
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
        });
      }}
    >
      {children}
    </a>
  );
}

export function visuallyHiddenStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  };
}

export const a11yTokens = {
  focusRing: tokenToCssVar('semantic.focus.ring'),
} as const;
