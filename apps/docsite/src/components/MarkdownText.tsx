// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ComponentProps} from 'react';
import {XDSMarkdown} from '@xds/core/Markdown';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';

type XDSTextProps = ComponentProps<typeof XDSText>;

interface MarkdownTextProps {
  children: string;
  type?: XDSTextProps['type'];
  color?: XDSTextProps['color'];
  weight?: XDSTextProps['weight'];
  display?: XDSTextProps['display'];
  style?: XDSTextProps['style'];
}

export function MarkdownText({
  children,
  type = 'body',
  color,
  weight,
  display,
  style,
}: MarkdownTextProps) {
  const paragraphs = splitMarkdownParagraphs(children);

  if (paragraphs.length === 0) {
    return null;
  }

  if (paragraphs.length === 1) {
    return (
      <XDSText
        type={type}
        color={color}
        weight={weight}
        display={display}
        style={style}>
        <XDSMarkdown display="inline">{paragraphs[0]}</XDSMarkdown>
      </XDSText>
    );
  }

  return (
    <XDSVStack gap={2} style={style}>
      {paragraphs.map((paragraph, index) => (
        <XDSText
          key={index}
          as="p"
          type={type}
          color={color}
          weight={weight}
          display="block">
          <XDSMarkdown display="inline">{paragraph}</XDSMarkdown>
        </XDSText>
      ))}
    </XDSVStack>
  );
}

function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map(block => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}
