// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout.tsx
 * @input The Motion Lab provider and shell
 * @output The /pages/motion-lab section frame
 * @position Next.js segment layout
 *
 * Every lab page reads its durations, curves and springs from one store, so the
 * provider wraps the whole section rather than each page — that is what lets a
 * slider on the tokens page change a demo on the rubric page. It also has to be
 * a layout rather than a per-page wrapper because the sandbox is a static
 * export: each route is prerendered on its own, and a page whose hook has no
 * provider above it fails the build rather than the browser.
 */

import type {ReactNode} from 'react';
import {MotionLabProvider} from './MotionLabStore';
import {MotionLabShell} from './MotionLabShell';

export default function MotionLabLayout({children}: {children: ReactNode}) {
  return (
    <MotionLabProvider>
      <MotionLabShell>{children}</MotionLabShell>
    </MotionLabProvider>
  );
}
