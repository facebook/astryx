// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Fragment, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Code} from '@astryxdesign/core/CodeBlock';

const TOKEN = /(`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;

const styles = stylex.create({
  link: {
    color: 'var(--color-text-accent)',
    textDecorationLine: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '0.16em',
    transition: 'color 120ms ease, text-decoration-color 120ms ease',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--color-accent)',
        textDecorationThickness: '2px',
      },
    },
    ':focus-visible': {
      borderRadius: 'var(--radius-sm)',
      outline: '2px solid var(--color-accent)',
      outlineOffset: 2,
    },
  },
});

function renderLink(label: string, href: string, key: number): ReactNode {
  const isExternal = /^https?:\/\//.test(href);
  return (
    <a
      key={key}
      href={href}
      rel={isExternal ? 'noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
      {...stylex.props(styles.link)}>
      {label}
    </a>
  );
}

// Render a small inline markdown subset for authored docs: code spans and links.
export function renderInlineMarkdown(text: string) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match;
  while ((match = TOKEN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const code = match[2];
    const linkLabel = match[3];
    const linkHref = match[4];
    if (code != null) {
      nodes.push(<Code key={match.index}>{code}</Code>);
    } else if (linkLabel != null && linkHref != null) {
      nodes.push(renderLink(linkLabel, linkHref, match.index));
    }

    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}
