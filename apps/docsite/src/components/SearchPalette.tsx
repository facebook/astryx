// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {trackSearch} from '../lib/analytics';
import {createCliSearchSource, resultKind} from '../lib/cliSearchSource';

interface SearchPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * The site's search: `astryx search`, run in the browser on the catalog the
 * CLI exported when the site was built, so it answers what the CLI answers
 * (lib/cliSearch.worker.ts).
 */
export function SearchPalette({isOpen, onOpenChange}: SearchPaletteProps) {
  const router = useRouter();

  const searchSource = useMemo(
    () =>
      createCliSearchSource(
        () =>
          new Worker(new URL('../lib/cliSearch.worker.ts', import.meta.url), {
            type: 'module',
          }),
      ),
    [],
  );

  const handleValueChange = useCallback(
    (id: string) => {
      const result = searchSource.item(id)?.auxiliaryData;
      if (!result) {return;}
      trackSearch({
        target: 'select',
        item: result.name,
        type: result.domain === 'hook' ? 'component' : result.domain,
      });
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
