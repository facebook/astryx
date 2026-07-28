// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file mermaid-diagram.tsx
 * @input Uses a consumer renderer or Astryx CodeBlock fallback
 * @output Exports MermaidDiagram and MermaidDiagramProps
 * @position Optional diagram integration boundary
 */

import type {ReactNode} from 'react';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';

export interface MermaidDiagramProps {
  chart: string;
  label?: string;
  render?: (chart: string) => ReactNode;
}

/**
 * Renders Mermaid through an injected renderer. The fallback preserves the
 * source as an accessible code block, keeping Mermaid itself out of the base
 * dependency graph and avoiding unsafe HTML injection.
 */
export function MermaidDiagram({
  chart,
  label = 'Mermaid diagram',
  render,
}: MermaidDiagramProps) {
  if (render != null) {
    return (
      <figure aria-label={label}>
        {render(chart)}
        <figcaption>{label}</figcaption>
      </figure>
    );
  }
  return (
    <CodeBlock code={chart} language="mermaid" title={label} width="100%" />
  );
}
