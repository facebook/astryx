// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared layout shell for every page in the docs section.
 * Owns the section padding, content container width, title and description
 * treatment, and vertical spacing. Pages supply only their unique body via
 * `children`.
 */

import type {ReactNode} from 'react';
import {XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';

export function DocPageLayout({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <XDSSection maxWidth={800} padding={6} style={{marginInline: 'auto'}}>
      <XDSVStack gap={8}>
        <XDSVStack gap={2}>
          <XDSText type="display-2">{title}</XDSText>
          {description ? (
            <XDSText type="body" color="secondary">
              {description}
            </XDSText>
          ) : null}
        </XDSVStack>
        {children}
      </XDSVStack>
    </XDSSection>
  );
}
