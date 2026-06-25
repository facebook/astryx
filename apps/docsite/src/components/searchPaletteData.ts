// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {SearchableItem} from '@astryxdesign/core/Typeahead';
import type {ComponentEntry} from '../generated/componentRegistry';
import type {PackageMeta} from '../generated/packageRegistry';
import type {DocTopic} from '../generated/docsRegistry';
import type {TemplateEntry} from '../generated/templateRegistry';
import {flattenComponentSidebarEntries} from './componentSidebarData';

export interface SearchItemAuxiliaryData {
  group: string;
  keywords: string[];
}

export interface SearchItem extends SearchableItem<SearchItemAuxiliaryData> {
  id: string;
  label: string;
  auxiliaryData: SearchItemAuxiliaryData;
}

interface SearchPaletteDataInput {
  components: Record<string, ComponentEntry[]>;
  packages: PackageMeta[];
  docTopics: DocTopic[];
  templates: TemplateEntry[];
}

function uniqueKeywords(keywords: Array<string | null | undefined>): string[] {
  return [...new Set(keywords.filter((kw): kw is string => Boolean(kw)))];
}

function splitWords(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
}

export function getSearchItemKeywords(item: SearchItem): string[] {
  return [
    item.auxiliaryData.group,
    splitWords(item.label),
    ...item.auxiliaryData.keywords.flatMap(keyword => [
      keyword,
      splitWords(keyword),
    ]),
  ];
}

export function buildSearchPaletteItems({
  components,
  packages,
  docTopics,
  templates,
}: SearchPaletteDataInput): SearchItem[] {
  const items: SearchItem[] = [];
  const componentLookup = new Map<string, ComponentEntry>();

  for (const entries of Object.values(components)) {
    for (const comp of entries) {
      componentLookup.set(comp.name, comp);
    }
  }

  for (const entry of flattenComponentSidebarEntries()) {
    const comp = componentLookup.get(entry.name);
    items.push({
      id: entry.href,
      label: entry.displayName,
      auxiliaryData: {
        group: 'Component',
        keywords: uniqueKeywords([
          entry.name,
          entry.displayName,
          comp?.moduleName,
          ...(comp?.keywords ?? []),
        ]),
      },
    });
  }

  for (const pkg of packages) {
    const isTheme = pkg.name.includes('theme-');
    // All themes share the single /themes surface — the per-theme
    // dynamic route was removed in favor of state-driven selection.
    // Search results for theme packages all land on /themes with
    // Neutral as the default seed; users browse to the specific
    // theme they want via the sidebar picker.
    items.push({
      id: isTheme
        ? '/themes'
        : `/docs/${pkg.name.replace('@astryxdesign/', '')}`,
      label: pkg.displayName,
      auxiliaryData: {
        group: 'Package',
        keywords: uniqueKeywords([pkg.name, pkg.displayName]),
      },
    });
  }

  for (const doc of docTopics) {
    items.push({
      id: `/docs/${doc.topic}`,
      label: doc.title,
      auxiliaryData: {
        group: doc.category === 'guide' ? 'Guide' : 'Foundations',
        keywords: uniqueKeywords([doc.topic, doc.title, doc.category]),
      },
    });
  }

  for (const tmpl of templates) {
    items.push({
      id: `/templates/${tmpl.slug}`,
      label: tmpl.name,
      auxiliaryData: {
        group: 'Template',
        keywords: uniqueKeywords([tmpl.slug, tmpl.name, tmpl.category]),
      },
    });
  }

  return items;
}
