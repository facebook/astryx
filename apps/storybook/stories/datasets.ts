// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Fetch datasets from the vega-datasets CDN.
 * Supports JSON and CSV. Caches in memory.
 */

const BASE = 'https://cdn.jsdelivr.net/npm/vega-datasets@3/data';
const cache = new Map<string, unknown[]>();

/** Minimal CSV parser — handles quoted fields and numeric detection */
function parseCSV(text: string): Record<string, unknown>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => {
      const v = values[i];
      const num = Number(v);
      row[h] = v !== '' && !isNaN(num) ? num : v;
    });
    return row;
  });
}

export async function loadDataset<T = Record<string, unknown>>(
  name: string,
): Promise<T[]> {
  if (cache.has(name)) return cache.get(name) as T[];

  const isCSV = name.endsWith('.csv');
  const hasExt = name.endsWith('.json') || isCSV;
  const url = `${BASE}/${name}${hasExt ? '' : '.json'}`;

  const res = await fetch(url);
  let data: unknown[];
  if (isCSV) {
    const text = await res.text();
    data = parseCSV(text);
  } else {
    data = await res.json();
  }

  cache.set(name, data);
  return data as T[];
}
