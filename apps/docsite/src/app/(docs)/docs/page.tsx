// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: redirect
 * /docs immediately reroutes to the Getting Started guide.
 */

import {redirect} from 'next/navigation';

export default function DocsIndexPage() {
  redirect('/docs/getting-started');
}
