// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {trackSearch} from '../lib/analytics';
import {
  createCliSearchSource,
  resultKind,
  searchTarget,
} from '../lib/cliSearchSource';

interface SearchPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The site's search: `astryx search`, run by the site's search API
 * (app/api/search/route.ts), so it answers what the CLI answers.
 */
export function SearchPalette({isOpen, onOpenChange}: SearchPaletteProps) {
  const router = useRouter();

  const searchSource = useMemo(() => createCliSearchSource(), []);

  const handleValueChange = useCallback(
    (id: string) => {
      const result = searchSource.item(id)?.auxiliaryData;
      if (!result) {
        return;
      }
      trackSearch({target: 'select', ...searchTarget(result.href)});
      router.push(result.href);
      onOpenChange(false);
    },
    [searchSource, router, onOpenChange],
  );

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={searchSource}
      renderItem={item => (
        <Text type="inherit">
          {item.label}
          <Text type="supporting" color="secondary">
            {' '}
            {resultKind(item.auxiliaryData)}
          </Text>
        </Text>
      )}
      label="Search docs, components, and templates"
      value=""
      onValueChange={handleValueChange}
    />
  );
}
