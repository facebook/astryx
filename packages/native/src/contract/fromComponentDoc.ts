// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contract/fromComponentDoc.ts
 * @input A component's documentation (.doc.mjs) plus the native additions for it
 * @output A component contract: the portable core, native platform props, and the
 *   web-only props with reasons
 * @position Turns core documentation into the contract the generators consume.
 *   Reads documentation as data at build time; never imports core at run time
 *   (AST-082 FR16)
 */

import {parseDocType} from './parseDocType.js';
import {coreNameProblem} from './rules.js';
import type {
  BaseTarget,
  ComponentContract,
  PropMap,
  PropSpec,
  WebOnlyProp,
} from './types.js';
import type {NativePlatform} from '../platforms.js';

/** The subset of a ComponentDoc this reader needs. */
export interface ComponentDocLike {
  readonly name: string;
  readonly props?: ReadonlyArray<{
    readonly name: string;
    readonly type?: unknown;
    readonly required?: boolean;
    readonly description?: unknown;
  }>;
}

/** What the native package adds to one core component. */
export interface NativeAdditions {
  readonly name: string;
  readonly baseTarget: BaseTarget;
  /**
   * Portable definitions for named types the documentation references. Fields
   * the web type has that are not portable are left out on purpose.
   */
  readonly types?: Readonly<Record<string, PropMap>>;
  /** Documented types renamed to a native definition, e.g. `SelectorOption[]`. */
  readonly typeNames?: Readonly<Record<string, string>>;
  readonly platforms?: Readonly<Partial<Record<NativePlatform, PropMap>>>;
  /**
   * Portable-typed props that still belong to the web contract, with the
   * reason, such as a web presentation heuristic a native platform replaces.
   */
  readonly webOnly?: Readonly<Record<string, string>>;
}

export function fromComponentDoc(
  doc: ComponentDocLike,
  additions: NativeAdditions,
): ComponentContract {
  const core: Record<string, PropSpec> = {};
  const webOnly: WebOnlyProp[] = [];
  const types = additions.types ?? {};

  for (const prop of doc.props ?? []) {
    const declaredWebOnly = additions.webOnly?.[prop.name];
    if (declaredWebOnly) {
      webOnly.push({name: prop.name, reason: declaredWebOnly});
      continue;
    }
    if (
      /(?:Xstyle|XStyle|ClassName|Style)$/.test(prop.name) ||
      prop.name === 'xstyle'
    ) {
      webOnly.push({name: prop.name, reason: 'web styling input'});
      continue;
    }
    if (prop.name.startsWith('html') || prop.name.startsWith('aria-')) {
      webOnly.push({name: prop.name, reason: 'HTML attribute'});
      continue;
    }
    const parsed = parseDocType(String(prop.type ?? ''));
    if (!parsed.ok) {
      webOnly.push({name: prop.name, reason: parsed.reason});
      continue;
    }
    // A portable type can still carry a name another platform owns.
    const nameProblem = coreNameProblem(prop.name);
    if (nameProblem) {
      webOnly.push({name: prop.name, reason: nameProblem});
      continue;
    }
    let type = parsed.type;
    const renamed = (name: string) => additions.typeNames?.[name] ?? name;
    if (type.kind === 'named') {
      type = {kind: 'named', name: renamed(type.name)};
    }
    if (type.kind === 'array' && type.of.kind === 'named') {
      type = {kind: 'array', of: {kind: 'named', name: renamed(type.of.name)}};
    }
    if (type.kind === 'named' && !(type.name in types)) {
      webOnly.push({
        name: prop.name,
        reason: `type "${type.name}" has no portable definition yet`,
      });
      continue;
    }
    if (
      type.kind === 'array' &&
      type.of.kind === 'named' &&
      !(type.of.name in types)
    ) {
      webOnly.push({
        name: prop.name,
        reason: `type "${type.of.name}" has no portable definition yet`,
      });
      continue;
    }
    core[prop.name] = {
      type,
      optional: prop.required !== true,
      ...(typeof prop.description === 'string' ? {doc: prop.description} : {}),
    };
  }

  return {
    name: additions.name,
    baseTarget: additions.baseTarget,
    types,
    core,
    platforms: additions.platforms ?? {},
    webOnly,
  };
}
