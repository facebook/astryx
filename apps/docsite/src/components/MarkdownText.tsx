// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import type {ComponentProps, ReactNode} from 'react';
import {Fragment} from 'react';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {XDSText} from '@xds/core/Text';
import {
  type InlineMarkdownToken,
  parseInlineMarkdown,
  splitMarkdownParagraphs,
} from './markdownInline';

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
        {renderInlineMarkdown(parseInlineMarkdown(paragraphs[0]))}
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
          {renderInlineMarkdown(parseInlineMarkdown(paragraph))}
        </XDSText>
      ))}
    </XDSVStack>
  );
}

function renderInlineMarkdown(tokens: InlineMarkdownToken[]): ReactNode {
  return tokens.map((token, index) => {
    switch (token.kind) {
      case 'text':
        return <Fragment key={index}>{token.text}</Fragment>;
      case 'code':
        return (
          <XDSText key={index} type="code" color="inherit">
            {token.text}
          </XDSText>
        );
      case 'strong':
        return (
          <XDSText key={index} type="inherit" color="inherit" weight="bold">
            {renderInlineMarkdown(token.children)}
          </XDSText>
        );
      case 'emphasis':
        return <em key={index}>{renderInlineMarkdown(token.children)}</em>;
      case 'link':
        return (
          <XDSLink
            key={index}
            href={token.href}
            type="inherit"
            color="active"
            hasUnderline
            isExternalLink={isExternalHref(token.href)}>
            {renderInlineMarkdown(token.children)}
          </XDSLink>
        );
    }
  });
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
