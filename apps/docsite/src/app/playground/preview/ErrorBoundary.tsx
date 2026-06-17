// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ErrorBoundary.tsx
 * @input The rendered user component (children) + a reset key
 * @output Catches render errors and shows a stark fallback instead of crashing
 * @position Playground preview iframe — isolates user-code render failures.
 */

import React, {useState, type ErrorInfo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

// Render-error fallback (deliberately stark + monospace, theme-independent).
const styles = stylex.create({
  container: {
    padding: 16,
    fontFamily: 'ui-monospace, monospace',
    fontSize: 13,
    color: '#ef4444',
    lineHeight: 1.5,
  },
  header: {fontWeight: 600, marginBottom: 8, cursor: 'pointer'},
  message: {whiteSpace: 'pre-wrap', margin: 0},
});

export function ErrorDisplay({message}: {message: string}) {
  const [expanded, setExpanded] = useState(false);
  const preview = message.length > 120 ? message.slice(0, 120) + '…' : message;

  return (
    <div {...stylex.props(styles.container)}>
      <div
        {...stylex.props(styles.header)}
        onClick={() => setExpanded(e => !e)}>
        ⚠ Render Error {message.length > 120 && (expanded ? '▾' : '▸')}
      </div>
      <pre {...stylex.props(styles.message)}>
        {expanded ? message : preview}
      </pre>
    </div>
  );
}

interface ErrorBoundaryProps {
  resetKey: unknown;
  children: ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {error: null};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {error};
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    this.props.onError(error);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({error: null});
    }
  }

  render(): ReactNode {
    if (this.state.error) {
      return <ErrorDisplay message={this.state.error.message} />;
    }
    return this.props.children;
  }
}
