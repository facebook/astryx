// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {CommandPalette} from '@astryxdesign/core/CommandPalette';
import {Text} from '@astryxdesign/core/Text';
import {createStaticSource} from '@astryxdesign/core/Typeahead';
import {components} from '../generated/componentRegistry';
import {packages} from '../generated/packageRegistry';
import {docTopics} from '../generated/docsRegistry';
import {templateMetadata} from '../generated/templateMetadataRegistry';
import {trackSearch} from '../lib/analytics';
import {
  buildSearchPaletteItems,
  getSearchItemKeywords,
} from './searchPaletteData';

interface SearchPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchPalette({isOpen, onOpenChange}: SearchPaletteProps) {
  const router = useRouter();

  // Component items come from the same grouped registry as the sidebar so
  // sidebar and command palette navigation stay in lockstep.
  const searchSource = useMemo(() => {
    const items = buildSearchPaletteItems({
      components,
      packages,
      docTopics,
      templates: templateMetadata,
    });

    return createStaticSource(items, {
      keywords: getSearchItemKeywords,
    });
  }, []);

  const handleValueChange = useCallback(
    (value: string) => {
      if (value && value.startsWith('/')) {
        // Determine type from path prefix
        const type = value.startsWith('/components/')
          ? 'component'
          : value.startsWith('/templates/')
            ? 'template'
            : value.startsWith('/themes/')
              ? 'theme'
              : value.startsWith('/docs/')
                ? 'doc'
                : 'page';
        const item = value.split('/').pop() || value;
        trackSearch({target: 'select', item, type});
        router.push(value);
        onOpenChange(false);
      }
    },
    [router, onOpenChange],
  );

  return (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={searchSource}
      renderItem={item => <Text type="inherit">{item.label}</Text>}
      label="Search docs, components, and templates"
      value=""
      onValueChange={handleValueChange}
    />
  );
}
