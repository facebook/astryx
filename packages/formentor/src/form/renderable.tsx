// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file renderable.tsx
 * @input ../inputset/types
 * @output Renderable — a partially-applied field component with prop-overlay and callback modes
 * @position The customization seam: fields.x.render(overlay) or fields.x.render(callback)
 */

import * as React from 'react';
import type {ComponentType} from 'react';
import type {CommonFieldProps} from '../inputset/types';
import type {Validator, AsyncValidator} from './validation';

/**
 * Extra props a caller may layer on when rendering a field. `validate` and
 * `validateAsync` configure field-level validation (their `pass`/`fail` helpers
 * are typed); the field value is `unknown` at this type-erased layer, so narrow
 * it in the callback. Any other keys are forwarded to the underlying input.
 */
export type RenderOverlay = Record<string, unknown> & {
  validate?: Validator<unknown>;
  validateAsync?: AsyncValidator<unknown>;
};

/**
 * A render callback receives the bound props plus the default input component,
 * and returns whatever should render. This is the full escape hatch.
 */
export type RenderCallback = (
  props: CommonFieldProps & Record<string, unknown>,
  DefaultInput: ComponentType<CommonFieldProps & Record<string, unknown>>,
) => React.ReactNode;

/**
 * A renderable field. `props` are the framework-bound props (value, onChange,
 * errors, schema, plus InputSet commonProps). `render()` applies an overlay or
 * a callback on top of them.
 */
export class Renderable {
  constructor(
    readonly props: CommonFieldProps & Record<string, unknown>,
    private readonly DefaultInput: ComponentType<
      CommonFieldProps & Record<string, unknown>
    >,
  ) {}

  render(overlayOrCallback?: RenderOverlay | RenderCallback): React.ReactNode {
    const {DefaultInput} = this;
    if (typeof overlayOrCallback === 'function') {
      return overlayOrCallback(this.props, DefaultInput);
    }
    // Strip validator keys — they configure the field, they aren't DOM props.
    const overlay = overlayOrCallback ?? {};
    const {validate: _v, validateAsync: _va, ...domOverlay} = overlay;
    const merged = {...this.props, ...domOverlay};
    return <DefaultInput {...merged} />;
  }
}
