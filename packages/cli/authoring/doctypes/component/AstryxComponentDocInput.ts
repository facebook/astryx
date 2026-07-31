// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxBaseDocInput} from '../base/AstryxBaseDocInput';
import type {AstryxPropInput} from '../base/AstryxPropInput';

/** A component (or a family). `anatomy`/`slotElements` live inside `usage`. */
export interface AstryxComponentDocInput extends AstryxBaseDocInput {
  /** All public props for the component. */
  props: AstryxPropInput[];
  /** Theming/selector-surface metadata. */
  theming?: unknown;
  /** Interactive-preview playground configuration. */
  playground?: unknown;
  /** Short code examples rendered after the props table. */
  examples?: unknown[];
}
