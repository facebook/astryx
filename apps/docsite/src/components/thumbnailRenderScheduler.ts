// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Serializes live template thumbnail activation during browser idle time.
 * @input Receives cancellable async render jobs from visible gallery tiles.
 * @output Runs one job at a time and waits for it to settle before scheduling the next.
 * @position Client-side scheduling boundary between visibility and heavy preview work.
 */

type ThumbnailRenderJob = {
  cancelled: boolean;
  run: () => Promise<unknown> | unknown;
};

const jobs: ThumbnailRenderJob[] = [];
let isBusy = false;

function scheduleNext(): void {
  if (isBusy || jobs.length === 0) {
    return;
  }

  isBusy = true;
  const runNext = () => {
    let job = jobs.shift();
    while (job?.cancelled === true) {
      job = jobs.shift();
    }

    if (job == null) {
      isBusy = false;
      return;
    }

    const execute = async () => {
      try {
        await job.run();
      } finally {
        isBusy = false;
        scheduleNext();
      }
    };
    void execute().catch(() => {});
  };

  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(runNext);
  } else {
    window.setTimeout(runNext, 100);
  }
}

export function scheduleThumbnailRender(
  run: () => Promise<unknown> | unknown,
): () => void {
  const job = {cancelled: false, run};
  jobs.push(job);
  scheduleNext();

  return () => {
    job.cancelled = true;
  };
}
