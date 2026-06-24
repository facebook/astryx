// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ComponentProps} from 'react';
import {Markdown} from '@astryxdesign/core/Markdown';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

type TextProps = ComponentProps<typeof Text>;

interface MarkdownTextProps {
  children: string;
  type?: TextProps['type'];
  color?: TextProps['color'];
  weight?: TextProps['weight'];
  display?: TextProps['display'];
  style?: TextProps['style'];
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
      <Text
        type={type}
        color={color}
        weight={weight}
        display={display}
        style={style}>
        <Markdown display="inline">{paragraphs[0]}</Markdown>
      </Text>
    );
  }

  return (
    <VStack gap={2} style={style}>
      {paragraphs.map((paragraph, index) => (
        <Text
          key={index}
          as="p"
          type={type}
          color={color}
          weight={weight}
          display="block">
          <Markdown display="inline">{paragraph}</Markdown>
        </Text>
      ))}
    </VStack>
  );
}

function splitMarkdownParagraphs(markdown: string): string[] {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map(block => block.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
}
