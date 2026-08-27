// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MotionLabShell.tsx
 * @input Motion Lab store, control rail
 * @output The scope element every lab page renders inside
 * @position Motion Lab chrome; used by app/motion/layout.tsx
 *
 * The scope element is where the tuned custom properties land. Keeping them
 * here rather than on `:root` means the lab can retune `--ease-standard` to
 * argue about it without the docsite's own nav starting to move differently.
 */

import {VStack} from '@astryxdesign/core/Layout';
import {useEffect, useRef, type ReactNode} from 'react';
import {useMotionLab} from './MotionLabStore';
import {MotionControlRail} from './MotionControlRail';
import styles from './MotionLab.module.css';

export function MotionLabShell({children}: {children: ReactNode}) {
  const {registerScope, reducedMotion} = useMotionLab();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    registerScope(ref.current);
    return () => registerScope(null);
  }, [registerScope]);

  return (
    <div ref={ref} className={styles.scope} data-reduced-motion={reducedMotion}>
      <VStack gap={0}>
        <MotionControlRail />
        {children}
      </VStack>
    </div>
  );
}
