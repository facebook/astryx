// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TextType} from '@astryxdesign/core';
import type {HeadingLevel} from '@astryxdesign/core/Text';
import type {TokenTableProps} from './types';
import {resolveToken} from './helpers';

const styles = stylex.create({
  sample: {
    overflow: 'hidden',
    whiteSpace: 'nowrap' as const,
    textOverflow: 'ellipsis',
    display: 'block',
  },
});

const HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];
const TEXT_TYPES: TextType[] = [
  'display-1',
  'display-2',
  'display-3',
  'large',
  'body',
  'label',
  'code',
  'supporting',
];

const STYLE_LABEL: Record<string, string> = {
  'display-1': 'Display 1',
  'display-2': 'Display 2',
  'display-3': 'Display 3',
  'heading-1': 'H1',
  'heading-2': 'H2',
  'heading-3': 'H3',
  'heading-4': 'H4',
  'heading-5': 'H5',
  'heading-6': 'H6',
  body: 'Body',
  large: 'Large',
  label: 'Label',
  code: 'Code',
  supporting: 'Supporting',
};

const SAMPLE_TEXT: Record<string, string> = {
  'display-1': '$12,450',
  'display-2': '98.7%',
  'display-3': 'Welcome',
  'heading-1': 'Page Title',
  'heading-2': 'Section Title',
  'heading-3': 'Card Heading',
  'heading-4': 'Subsection',
  'heading-5': 'Group Label',
  'heading-6': 'Overline',
  body: 'Body text for reading',
  large: 'Intro paragraph',
  label: 'Form Label',
  code: 'const x = 42;',
  supporting: 'Helper text',
};

const FONT_FAMILY_MAP: Record<string, string> = {
  'heading-1': '--font-family-heading',
  'heading-2': '--font-family-heading',
  'heading-3': '--font-family-heading',
  'heading-4': '--font-family-heading',
  'heading-5': '--font-family-heading',
  'heading-6': '--font-family-heading',
  body: '--font-family-body',
  large: '--font-family-body',
  label: '--font-family-body',
  supporting: '--font-family-body',
  code: '--font-family-code',
  'display-1': '--font-family-heading',
  'display-2': '--font-family-heading',
  'display-3': '--font-family-heading',
};

export function TypographyTokenTable({theme}: TokenTableProps) {
  const entries = [
    ...HEADING_LEVELS.map(level => `heading-${level}`),
    ...TEXT_TYPES,
  ];

  const data = entries.map(name => {
    const sizeToken = `--text-${name}-size`;
    const weightToken = `--text-${name}-weight`;
    const leadingToken = `--text-${name}-leading`;
    const fontFamilyToken = FONT_FAMILY_MAP[name] ?? '--font-family-body';

    const fontSize = resolveToken(theme, sizeToken);
    const fontWeight = resolveToken(theme, weightToken);
    const leading = resolveToken(theme, leadingToken);
    const fontFamily = resolveToken(theme, fontFamilyToken);

    const px =
      fontSize && leading
        ? Math.round(parseFloat(leading) * parseFloat(fontSize))
        : null;

    return {
      name,
      label: STYLE_LABEL[name] ?? name,
      sampleText: SAMPLE_TEXT[name] ?? name,
      fontFamily,
      fontSize,
      fontWeight,
      leading: px ? `${leading} (${px}px)` : leading,
    };
  });

  return (
    <Table
      data={data as Record<string, unknown>[]}
      columns={[
        {
          key: 'label',
          header: 'Sample',
          width: pixel(200),
          renderCell: (item: Record<string, unknown>) => (
            <span
              {...stylex.props(styles.sample)}
              style={{
                fontFamily: item.fontFamily as string,
                fontSize: item.fontSize as string,
                fontWeight: item.fontWeight as string,
                lineHeight: (item.leading as string)?.split(' ')[0],
              }}>
              {item.label as string}
            </span>
          ),
        },
        {
          key: 'tokens',
          header: 'Tokens',
          width: proportional(1, {minWidth: 280}),
          renderCell: (item: Record<string, unknown>) => (
            <VStack gap={1}>
              <Text type="code" color="secondary">
                {item.fontSize as string} ·{' '}
                {(item.fontFamily as string)?.split(',')[0]?.trim()}
              </Text>
              <Text type="code" color="secondary">
                {item.fontWeight as string} · {item.leading as string}
              </Text>
            </VStack>
          ),
        },
      ]}
      density="spacious"
      dividers="rows"
      hasHover
    />
  );
}
