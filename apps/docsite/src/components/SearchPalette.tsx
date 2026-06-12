// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';
import type {TemplateEntry} from '../generated/templateRegistry';
import {trackSearch} from '../lib/analytics';
import {
  buildSearchPaletteItems,
  getSearchItemKeywords,
} from './searchPaletteData';

interface SearchPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
  templates: TemplateEntry[];
}

export function SearchPalette({
  isOpen,
  onOpenChange,
  components,
  packages,
  docTopics,
  templates,
}: SearchPaletteProps) {
  const router = useRouter();

  // Component items come from the same grouped registry as the sidebar so
  // sidebar and command palette navigation stay in lockstep.
  const searchSource = useMemo(() => {
    const items = buildSearchPaletteItems({
      components,
      packages,
      docTopics,
      templates,
    });

    return createStaticSource(items, {
      keywords: getSearchItemKeywords,
    });
  }, [components, packages, docTopics, templates]);

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
    <XDSCommandPalette
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      searchSource={searchSource}
      label="Search docs, components, and templates"
      value=""
      onValueChange={handleValueChange}
    />
  );
}
