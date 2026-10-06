// Copyright (c) Meta Platforms, Inc. and affiliates.

export function checkpointIsComplete(result) {
  return Boolean(
    result?.finishedAt &&
    result.completed !== false &&
    !result.infrastructureFailure?.retryable,
  );
}
