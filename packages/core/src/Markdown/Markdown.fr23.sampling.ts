// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.fr23.sampling.ts
 * @input Baseline/candidate callbacks and a microsecond CPU clock
 * @output The FR23 paired-median ratio
 * @position Test-only sampling for Markdown.fr23.bench.ts
 */

function cpuTime(): number {
  const used = process.cpuUsage();
  return used.user + used.system;
}

function median(values: ReadonlyArray<number>): number {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

export function measureMarkdownPairedRatio(
  baseline: () => number,
  candidate: () => number,
  now: () => number = cpuTime,
): number {
  let sink = 0;
  const average = (callback: () => number): number => {
    const start = now();
    for (let iteration = 0; iteration < 20; iteration++) {
      sink ^= callback();
    }
    return (now() - start) / 20;
  };
  for (let warmup = 0; warmup < 10; warmup++) {
    sink ^= baseline();
    sink ^= candidate();
  }
  const ratios: number[] = [];
  for (let round = 0; round < 9; round++) {
    const baselineFirst = round % 2 === 0;
    const first = average(baselineFirst ? baseline : candidate);
    const second = average(baselineFirst ? candidate : baseline);
    const baselineTime = baselineFirst ? first : second;
    const candidateTime = baselineFirst ? second : first;
    ratios.push(candidateTime / baselineTime);
  }
  void sink;
  // Selecting a sample by its cheapest baseline also selects denominator noise.
  return median(ratios);
}
