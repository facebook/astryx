// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.tsx
 * @input The Motion Lab provider, the link provider, and the shell
 * @output The /pages/motion-lab section frame
 * @position Next.js segment layout
 *
 * Every lab page reads its durations, curves and springs from one store, so the
 * provider wraps the whole section rather than each page — that is what lets a
 * slider on the tokens page change a demo on the rubric page. It also has to be
 * a layout rather than a per-page wrapper because the sandbox is a static
 * export: each route is prerendered on its own, and a page whose hook has no
 * provider above it fails the build rather than the browser.
 *
 * LinkProvider is here for a subtler reason. The sandbox deploys under a
 * basePath (`/astryx/pr/<n>/sandbox` on a PR preview, `/astryx/sandbox` on
 * main), and `next/link` prepends it automatically — which is why the rest of
 * the app links correctly. Astryx's own `Link` renders a plain anchor, so a
 * root-absolute `href="/pages/motion-lab/..."` written by hand escapes the
 * basePath entirely and lands on the org's root site. Pointing LinkProvider at
 * `next/link` makes every Astryx `Link` in this section route through Next and
 * pick the prefix up.
 *
 * `ListItem` routes through the same provider, so the nav panel is covered
 * too. Nothing in this section should prepend the basePath by hand: Next does
 * it exactly once, and doing it again yields a double-prefixed URL that 404s.
 */

'use client';

import NextLink from 'next/link';
import type {ReactNode} from 'react';
import {LinkProvider} from '@astryxdesign/core/Link';
import {MotionLabProvider} from './MotionLabStore';
import {MotionLabShell} from './MotionLabShell';

export default function MotionLabLayout({children}: {children: ReactNode}) {
  return (
    <LinkProvider component={NextLink}>
      <MotionLabProvider>
        <MotionLabShell>{children}</MotionLabShell>
      </MotionLabProvider>
    </LinkProvider>
  );
}
