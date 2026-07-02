// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: redirect
 * /docs immediately reroutes to the Getting Started guide.
 */

import {redirect} from 'next/navigation';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function DocsIndexPage() {
  redirect('/docs/getting-started');
}
