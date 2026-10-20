// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file benchmark.ts
 * @input A workload id: a multi-file change set or one file of a given size
 * @output Deterministic old/new file contents, their totals, and small
 *   formatting helpers for the DiffViewer performance sandbox
 * @position Pure support utilities for the DiffViewer performance sandbox;
 *   no React and no DOM, so any harness can render the same fixtures
 *
 * Multi-file workloads mirror a real large change: many small files, some
 * medium ones, and a few very large generated or vendored files, with sparse
 * edits, a handful of new and deleted files, and a few full rewrites. Every
 * value comes from a seeded generator, so a workload is byte-identical on
 * every run and in every harness.
 */

export interface DiffBenchmarkFile {
  readonly path: string;
  /** Contents before the change; `null` for an added file. */
  readonly oldContents: string | null;
  /** Contents after the change; `null` for a deleted file. */
  readonly newContents: string | null;
}

export interface DiffBenchmarkWorkload {
  readonly id: string;
  readonly label: string;
  readonly files: ReadonlyArray<DiffBenchmarkFile>;
  /** Lines across every file's newer side (the older side for a deleted file). */
  readonly totalLines: number;
}

/** Multi-file workloads: file count and the total lines they target. */
export const MULTI_FILE_WORKLOADS = [
  {files: 50, totalLines: 10_000},
  {files: 200, totalLines: 50_000},
  {files: 500, totalLines: 100_000},
  {files: 1000, totalLines: 150_000},
] as const;

/** Single-file workloads: line counts, each with sparse edits or a rewrite. */
export const SINGLE_FILE_LINES = [100, 1000, 5000, 20_000] as const;

export type SingleFileChange = 'sparse' | 'rewrite';

/** Mulberry32: a small, fast, seeded generator; same seed, same sequence. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

/**
 * One line of TypeScript-like source, varied by its file and position. A
 * variant changes every non-blank line, so two variants share no code.
 */
function sourceLine(fileIndex: number, line: number, variant = ''): string {
  const base = baseSourceLine(fileIndex, line, variant);
  return variant === '' || base === '' ? base : `${base} // ${variant}`;
}

function baseSourceLine(
  fileIndex: number,
  line: number,
  variant: string,
): string {
  const id = `${fileIndex}_${line}${variant}`;
  switch (line % 12) {
    case 0:
      return `export interface Record${id} {`;
    case 1:
      return `  id: string; // ${variant || 'stable'} field`;
    case 2:
      return `  value: number;`;
    case 3:
      return `}`;
    case 4:
      return '';
    case 5:
      return `export async function load${id}(url: string): Promise<number> {`;
    case 6:
      return `  const response = await fetch(url, {cache: 'no-store'});`;
    case 7:
      return `  if (!response.ok) throw new Error('HTTP ' + response.status);`;
    case 8:
      return `  return (await response.json()).count ?? ${line}; // ${id}`;
    case 9:
      return `}`;
    case 10:
      return '';
    default:
      return `// Section ${Math.floor(line / 12) + 1} of file ${fileIndex}`;
  }
}

function fileLines(fileIndex: number, count: number, variant = ''): string[] {
  return Array.from({length: count}, (_, line) =>
    sourceLine(fileIndex, line, variant),
  );
}

/**
 * Edit roughly one site per `spacing` lines: each site replaces one to three
 * lines and sometimes inserts one or two more.
 */
function applySparseEdits(
  lines: ReadonlyArray<string>,
  random: () => number,
  spacing: number,
): string[] {
  const next: string[] = [];
  let line = 0;
  let isFirst = true;
  while (line < lines.length) {
    const gap = between(random, Math.floor(spacing / 2), spacing * 2);
    // A short file still gets one edit: its first site lands inside it.
    const reach = isFirst ? Math.min(gap, Math.floor(lines.length / 2)) : gap;
    isFirst = false;
    next.push(...lines.slice(line, line + reach));
    line += reach;
    if (line >= lines.length) {
      break;
    }
    const replaced = between(random, 1, 3);
    for (let i = 0; i < replaced && line < lines.length; i++, line++) {
      next.push(`${lines[line]} // updated`);
    }
    const inserted = between(random, 0, 2);
    for (let i = 0; i < inserted; i++) {
      next.push(`  void track('edit-${line}-${i}');`);
    }
  }
  return next;
}

const DIRECTORIES = [
  'src/components',
  'src/hooks',
  'src/utils',
  'src/server/routes',
  'src/server/models',
  'test/unit',
  'test/integration',
  'docs/guides',
  'generated/schema',
  'vendor/parser',
];

/** File sizes in three tiers, scaled so their sum meets the target. */
function fileSizes(
  random: () => number,
  files: number,
  totalLines: number,
): number[] {
  const raw = Array.from({length: files}, () => {
    const tier = random();
    if (tier < 0.85) {
      return between(random, 30, 160);
    }
    if (tier < 0.97) {
      return between(random, 300, 1500);
    }
    return between(random, 3000, 12_000);
  });
  const sum = raw.reduce((total, size) => total + size, 0);
  const scale = totalLines / sum;
  return raw.map(size => Math.max(12, Math.round(size * scale)));
}

/**
 * A change set of `files` files whose sides total about `totalLines` lines.
 * About 5% of the files are new, 2% deleted and 2% rewritten in full; the
 * rest carry sparse edits.
 */
export function createMultiFileWorkload(
  files: number,
  totalLines: number,
): DiffBenchmarkWorkload {
  const random = createRandom(files * 7919 + totalLines);
  const sizes = fileSizes(random, files, totalLines);
  const result: DiffBenchmarkFile[] = sizes.map((size, index) => {
    const directory = DIRECTORIES[index % DIRECTORIES.length];
    const path = `${directory}/module_${String(index).padStart(4, '0')}.ts`;
    const original = fileLines(index, size);
    const kind = random();
    if (kind < 0.05) {
      return {path, oldContents: null, newContents: original.join('\n')};
    }
    if (kind < 0.07) {
      return {path, oldContents: original.join('\n'), newContents: null};
    }
    if (kind < 0.09) {
      return {
        path,
        oldContents: original.join('\n'),
        newContents: fileLines(index, size, 'v2').join('\n'),
      };
    }
    return {
      path,
      oldContents: original.join('\n'),
      newContents: applySparseEdits(original, random, 40).join('\n'),
    };
  });
  return {
    id: `files-${files}`,
    label: `${files.toLocaleString()} files`,
    files: result,
    totalLines: countLines(result),
  };
}

/** One file of `lines` lines with sparse edits or rewritten in full. */
export function createSingleFileWorkload(
  lines: number,
  change: SingleFileChange,
): DiffBenchmarkWorkload {
  const random = createRandom(lines * 31 + (change === 'rewrite' ? 1 : 0));
  const original = fileLines(0, lines);
  const next =
    change === 'rewrite'
      ? fileLines(0, lines, 'v2')
      : applySparseEdits(original, random, 40);
  const files = [
    {
      path: 'src/large_module.ts',
      oldContents: original.join('\n'),
      newContents: next.join('\n'),
    },
  ];
  return {
    id: `single-${lines}-${change}`,
    label: `${lines.toLocaleString()} lines, ${change === 'rewrite' ? 'full rewrite' : 'sparse edits'}`,
    files,
    totalLines: countLines(files),
  };
}

function lineCount(contents: string | null): number {
  return contents == null || contents === '' ? 0 : contents.split('\n').length;
}

export function countLines(files: ReadonlyArray<DiffBenchmarkFile>): number {
  return files.reduce(
    (total, file) =>
      total + lineCount(file.newContents ?? file.oldContents ?? null),
    0,
  );
}

export function formatDuration(value: number | null): string {
  return value == null ? '—' : `${value.toFixed(1)} ms`;
}

export function formatCount(value: number | null): string {
  return value == null ? '—' : value.toLocaleString();
}

export function formatMegabytes(bytes: number | null): string {
  return bytes == null ? '—' : `${(bytes / 1_048_576).toFixed(1)} MB`;
}
