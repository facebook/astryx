// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabBarTouch.ts
 * @input The touch hooks beside it
 * @output TabBar's touch layer, its one import site: every hook that runs
 *   core's animator or gesture recognizers for TabBar (the exports below)
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * Under a fine pointer only the lens's drag runs (`spec:AST-094` FR43): it
 * moves the lens's resting place on TabBar's CSS transition. The animator,
 * the springs and the copy of the items stay a finger's, so nothing else of
 * it writes anything there (FR24).
 */

export {useTabBarLens} from './useTabBarLens';
export {useTabBarMinimize} from './useTabBarMinimize';
export {useTabBarSearch} from './useTabBarSearch';
