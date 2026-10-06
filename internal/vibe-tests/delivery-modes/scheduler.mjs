// Copyright (c) Meta Platforms, Inc. and affiliates.

export async function runInPhases(
  items,
  concurrency,
  {prepare, evaluate, now = () => new Date().toISOString()},
) {
  const prepared = await mapWithConcurrency(items, concurrency, prepare);
  const barrierAt = now();
  const results = await mapWithConcurrency(
    prepared,
    concurrency,
    (value, index) => evaluate(value, {barrierAt, index}),
  );
  return {barrierAt, results};
}

export async function mapWithConcurrency(items, concurrency, worker) {
  const results = new Array(items.length);
  let index = 0;
  const threads = Array.from(
    {length: Math.min(concurrency, items.length)},
    async () => {
      while (true) {
        const current = index;
        index += 1;
        if (current >= items.length) {
          return;
        }
        results[current] = await worker(items[current], current);
      }
    },
  );
  await Promise.all(threads);
  return results;
}

export function resolveConcurrency(requested, isolationReceipt) {
  if (requested <= 1) {
    return {requested, effective: 1, fallbackReason: null};
  }
  if (isolationReceipt?.parallelIsolation?.passed) {
    return {requested, effective: requested, fallbackReason: null};
  }
  return {
    requested,
    effective: 1,
    fallbackReason:
      isolationReceipt?.parallelIsolation?.reason ??
      'parallel PID and network isolation was not proven',
  };
}
