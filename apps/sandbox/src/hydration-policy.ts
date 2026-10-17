// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Decide whether the default static HTML matches the incoming query.
 * @input Route and URL search string.
 * @output Whether React can safely hydrate instead of client-rendering.
 * @position Prevents mismatches for iframe themes and Shell Lab URL controls.
 */

export function canHydrate(route: string | undefined, search: string): boolean {
  const params = new URLSearchParams(search);
  return (
    params.get('embed') !== '1' &&
    !(route === '/pages/shell-lab/' && search.length > 0)
  );
}
