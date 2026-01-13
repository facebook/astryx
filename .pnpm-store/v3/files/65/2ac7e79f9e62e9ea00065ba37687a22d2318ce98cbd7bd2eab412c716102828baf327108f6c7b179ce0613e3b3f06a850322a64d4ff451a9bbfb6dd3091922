/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

export declare const PSEUDO_CLASS_PRIORITIES: Readonly<{
  [$$Key$$: string]: number;
}>;
export declare type PSEUDO_CLASS_PRIORITIES = typeof PSEUDO_CLASS_PRIORITIES;
type AtRulePriorities = { '@supports': 30; '@media': 200; '@container': 300 };
export declare const AT_RULE_PRIORITIES: Readonly<AtRulePriorities>;
export declare type AT_RULE_PRIORITIES = typeof AT_RULE_PRIORITIES;
export declare const PSEUDO_ELEMENT_PRIORITY: number;
export declare type PSEUDO_ELEMENT_PRIORITY = typeof PSEUDO_ELEMENT_PRIORITY;
export declare function getAtRulePriority(key: string): number | void;
export declare function getPseudoElementPriority(key: string): number | void;
export declare function getPseudoClassPriority(key: string): number | void;
export declare function getDefaultPriority(key: string): number | void;
declare function getPriority(key: string): number;
export default getPriority;
