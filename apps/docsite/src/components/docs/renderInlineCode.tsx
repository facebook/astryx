// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Fragment} from 'react';
import {XDSCode} from '@xds/core/CodeBlock';

const INLINE_CODE = /`([^`]+)`/g;

// Render backtick-delimited spans as inline code, leaving other text as-is.
export function renderInlineCode(text: string) {
  const nodes = [];
  let lastIndex = 0;
  let match;
  while ((match = INLINE_CODE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(<XDSCode key={match.index}>{match[1]}</XDSCode>);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes.map((node, i) => <Fragment key={i}>{node}</Fragment>);
}
