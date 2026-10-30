// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TabBarTouch.ts
 * @input The touch hooks beside it
 * @output TabBar's touch layer, its one import site: every hook that runs
 *   core's animator or gesture recognizers for TabBar (the exports below)
 * @position Internal to the lab TabBar (TabBar.tsx)
 *
 * Under a fine pointer none of it writes anything: TabBar's CSS draws the
 * mouse presentation, so touch work costs nothing there (AST-094). A build
 * for desktops can swap this module for one whose hooks do nothing.
 */

export {useTabBarLens} from './useTabBarLens';
export {useTabBarMinimize} from './useTabBarMinimize';
