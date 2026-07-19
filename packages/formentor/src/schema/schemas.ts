// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file schemas.ts
 * @input types.ts
 * @output Concrete schema classes + builder functions (object, string, number, boolean, enum)
 * @position Public schema-authoring surface
 */

import {
  Schema,
  type SchemaMeta,
  type StringConstraints,
  type NumberConstraints,
  type EnumConstraints,
  type BaseConstraints,
  type ObjectSchema,
  type ObjectValue,
} from './types';
import {rootPath, type ValuePath} from './paths';

const DEFAULT_META = {nullable: false, omissible: false} as const;

export class StringSchema extends Schema<string> {
  readonly meta: SchemaMeta & {type: 'string'};
  constructor(readonly constraints: StringConstraints = {}) {
    super();
    this.meta = {type: 'string', ...DEFAULT_META};
  }
}

export class NumberSchema extends Schema<number> {
  readonly meta: SchemaMeta & {type: 'number'};
  constructor(readonly constraints: NumberConstraints = {}) {
    super();
    this.meta = {type: 'number', ...DEFAULT_META};
  }
}

export class BooleanSchema extends Schema<boolean> {
  readonly meta: SchemaMeta & {type: 'boolean'};
  constructor(readonly constraints: BaseConstraints = {}) {
    super();
    this.meta = {type: 'boolean', ...DEFAULT_META};
  }
}

export class EnumSchema<V extends string | number> extends Schema<V> {
  readonly meta: SchemaMeta & {type: 'enum'};
  constructor(readonly constraints: EnumConstraints<V>) {
    super();
    this.meta = {type: 'enum', ...DEFAULT_META};
  }
}

export class ObjectSchemaImpl<P extends Record<string, Schema>>
  extends Schema<ObjectValue<P>>
  implements ObjectSchema<P>
{
  readonly meta: SchemaMeta & {type: 'object'};
  readonly properties: P;
  constructor(config: {properties: P} & BaseConstraints) {
    super();
    this.properties = config.properties;
    this.meta = {type: 'object', ...DEFAULT_META};
    this.constraints = {title: config.title, description: config.description};
  }
  readonly constraints: BaseConstraints;

  /**
   * A value path rooted at this object. Chain `.property(key)` to point at a
   * field — used to attach a cross-field validation error to a specific input,
   * e.g. `schema.getValuePath().property('confirm')`.
   */
  getValuePath(): ValuePath {
    return rootPath();
  }
}

// ── Builders ────────────────────────────────────────────────────────────────

export function string(constraints?: StringConstraints): StringSchema {
  return new StringSchema(constraints);
}

export function number(constraints?: NumberConstraints): NumberSchema {
  return new NumberSchema(constraints);
}

export function boolean(constraints?: BaseConstraints): BooleanSchema {
  return new BooleanSchema(constraints);
}

export function enumOf<V extends string | number>(
  constraints: EnumConstraints<V>,
): EnumSchema<V> {
  return new EnumSchema(constraints);
}

export function object<P extends Record<string, Schema>>(
  config: {properties: P} & BaseConstraints,
): ObjectSchemaImpl<P> {
  return new ObjectSchemaImpl(config);
}
