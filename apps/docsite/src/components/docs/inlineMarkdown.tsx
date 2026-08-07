// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Fragment, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Code} from '@astryxdesign/core/CodeBlock';
import {InlineCode} from '../InlineCode';
import {tokenizeInline, type InlineToken} from './inlineTokens';

type LinkToken = Extract<InlineToken, {type: 'link'}>;

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

function renderLink(token: LinkToken): ReactNode {
  const isExternal = /^https?:\/\//.test(token.href);
  return (
    <a
      href={token.href}
      rel={isExternal ? 'noreferrer' : undefined}
      target={isExternal ? '_blank' : undefined}
      {...stylex.props(styles.link)}>
      {token.isCodeLabel ? (
        // color="inherit" keeps the link's accent color on the code span;
        // Code's default `primary` would read as body text inside the anchor.
        <Code color="inherit">{token.label}</Code>
      ) : (
        token.label
      )}
    </a>
  );
}

// Render a small inline markdown subset for authored docs: code spans, links,
// and a code span used as a whole link label ([`Name`](href)).
export function renderInlineMarkdown(text: string) {
  return tokenizeInline(text).map((token, i) => (
    <Fragment key={i}>
      {token.type === 'code' ? (
        <InlineCode>{token.value}</InlineCode>
      ) : token.type === 'link' ? (
        renderLink(token)
      ) : (
        token.value
      )}
    </Fragment>
  ));
}
