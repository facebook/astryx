import type {ComponentEntry} from '../generated/componentRegistry';

export type ComponentItem =
  | {type: 'entry'; name: string; href: string}
  | {
      type: 'group';
      label: string;
      entries: Array<{name: string; href: string}>;
    };

export interface GroupedComponents {
  items: ComponentItem[];
  utilities: Array<{name: string; href: string}>;
}

export function groupComponents(entries: ComponentEntry[]): GroupedComponents {
  const utilities: Array<{name: string; href: string}> = [];
  const groups = new Map<string, Array<{name: string; href: string}>>();
  const ungrouped: Array<{name: string; href: string}> = [];

  const parentDocsWithComponents = new Set<string>();
  for (const e of entries) {
    if (e.parentDoc && !e.name.startsWith('use') && !e.hidden) {
      parentDocsWithComponents.add(e.parentDoc);
    }
  }

  for (const entry of entries) {
    if (entry.hidden) continue;
    const isHook = entry.name.startsWith('use');

    if (
      entry.group === 'Utilities' ||
      (isHook && !entry.parentDoc && entry.directory === 'hooks')
    ) {
      utilities.push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }
    if (entry.group) {
      if (!groups.has(entry.group)) groups.set(entry.group, []);
      groups
        .get(entry.group)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }
    if (isHook && !entry.parentDoc && entry.directory !== 'hooks') {
      const dir = entry.directory;
      if (!groups.has(dir)) groups.set(dir, []);
      groups
        .get(dir)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }
    if (
      isHook &&
      entry.parentDoc &&
      parentDocsWithComponents.has(entry.parentDoc)
    ) {
      const parent = entry.parentDoc;
      if (!groups.has(parent)) groups.set(parent, []);
      groups
        .get(parent)!
        .push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }
    if (isHook) {
      utilities.push({name: entry.name, href: `/components/${entry.name}`});
      continue;
    }
    ungrouped.push({name: entry.name, href: `/components/${entry.name}`});
  }

  const items: Array<{sortKey: string; item: ComponentItem}> = [];
  for (const [label, members] of groups) {
    members.sort((a, b) => a.name.localeCompare(b.name));
    if (members.length === 1) {
      items.push({
        sortKey: members[0].name,
        item: {type: 'entry', ...members[0]},
      });
    } else {
      items.push({
        sortKey: label,
        item: {type: 'group', label, entries: members},
      });
    }
  }
  for (const entry of ungrouped) {
    items.push({sortKey: entry.name, item: {type: 'entry', ...entry}});
  }
  items.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  return {
    items: items.map(i => i.item),
    utilities: utilities.sort((a, b) => a.name.localeCompare(b.name)),
  };
}
