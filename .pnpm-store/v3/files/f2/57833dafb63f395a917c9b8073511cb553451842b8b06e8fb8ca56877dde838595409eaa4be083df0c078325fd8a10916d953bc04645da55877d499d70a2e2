/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { LegacyThemeStyles as Theme } from './StyleXTypes';
type SheetOptions = Readonly<{
  rootDarkTheme?: Theme;
  rootTheme?: Theme;
  supportsVariables?: boolean;
}>;
/**
 * This class manages the CSS stylesheet for the page and the injection of new
 * CSS rules.
 */
export declare class StyleXSheet {
  static LIGHT_MODE_CLASS_NAME: string;
  static DARK_MODE_CLASS_NAME: string;
  constructor(opts: SheetOptions);
  rootTheme: null | undefined | Theme;
  rootDarkTheme: null | undefined | Theme;
  supportsVariables: boolean;
  rules: Array<string>;
  injected: boolean;
  tag: null | undefined | HTMLStyleElement;
  ruleForPriority: Map<number, string>;
  getVariableMatch(): RegExp;
  isHeadless(): boolean;
  getTag(): HTMLStyleElement;
  getCSS(): string;
  getRulePosition(rule: string): number;
  getRuleCount(): number;
  inject(): void;
  injectTheme(): void;
  __injectCustomThemeForTesting(selector: string, theme: Theme): void;
  delete(rule: string): void;
  normalizeRule(rule: string): string;
  getInsertPositionForPriority(priority: number): number;
  insert(
    rawLTRRule: string,
    priority: number,
    rawRTLRule: null | undefined | string,
  ): void;
}
export declare const styleSheet: StyleXSheet;
