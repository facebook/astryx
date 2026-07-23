// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Barrel for the shared doc building blocks, grouped by concern:
 *   - prop:       PropDoc, ElementDescriptor
 *   - usage:      UsageDoc, BestPractice, AnatomyElement, ExampleDoc
 *   - theming:    ThemingTarget, ComponentVar, DerivedVar
 *   - playground: PlaygroundConfig
 *
 * These are composed into the top-level doc shapes (ComponentDoc, HookDoc, ...).
 * Part of `@astryxdesign/core/doc-types` (see ../index.ts).
 */

export * from './prop';
export * from './usage';
export * from './theming';
export * from './playground';
