// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, useCallback} from 'react';
import {useRouter} from 'next/navigation';
import {XDSCommandPalette} from '@xds/core/CommandPalette';
import {createStaticSource} from '@xds/core/Typeahead';
import type {XDSSearchableItem} from '@xds/core/Typeahead';
import type {ComponentEntry} from '../generated/componentRegistry';

interface SearchItem extends XDSSearchableItem<{group: string}> {
  id: string;
  label: string;
  auxiliaryData: {group: string};
}
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';
import type {TemplateEntry} from '../generated/templateRegistry';
import {trackSearch} from '../lib/analytics';

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

  // Build search items with hrefs embedded in the id for navigation
  const searchSource = useMemo(() => {
    const items: SearchItem[] = [];

    for (const entries of Object.values(components)) {
      for (const comp of entries) {
        if (comp.hidden || comp.parentDoc) {
          continue;
        }
        items.push({
          id: `/components/${comp.name}`,
          label: comp.name,
          auxiliaryData: {group: 'Component'},
        });
      }
    }

    for (const pkg of packages) {
      const isTheme = pkg.name.includes('theme-');
      // All themes share the single /themes surface — the per-theme
      // dynamic route was removed in favor of state-driven selection.
      // Search results for theme packages all land on /themes with
      // Neutral as the default seed; users browse to the specific
      // theme they want via the sidebar picker.
      items.push({
        id: isTheme ? '/themes' : `/docs/${pkg.name.replace('@xds/', '')}`,
        label: pkg.displayName,
        auxiliaryData: {group: 'Package'},
      });
    }

    for (const doc of docTopics) {
      items.push({
        id: `/docs/${doc.topic}`,
        label: doc.title,
        auxiliaryData: {
          group: doc.category === 'guide' ? 'Guide' : 'Foundations',
        },
      });
    }

    for (const tmpl of templates) {
      items.push({
        id: `/templates/${tmpl.slug}`,
        label: tmpl.name,
        auxiliaryData: {group: 'Template'},
      });
    }

    return createStaticSource(items, {
      keywords: item => {
        const kws = [(item.auxiliaryData as {group: string}).group];
        for (const entries of Object.values(components)) {
          const match = entries.find(c => c.name === item.label);
          if (match) {
            kws.push(...match.keywords);
            break;
          }
        }
        return kws;
      },
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
