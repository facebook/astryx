// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {BaseDoc} from './BaseDoc';
import type {PropDoc} from '../base/PropDoc';

/**
 * Documentation for a directory that exports a single primary component.
 * Props live directly on this object.
 *
 * Use this when the directory has one main `XDS*.tsx` file
 * (e.g. Switch, Badge, Spinner, TextInput).
 */
export interface SingleComponentDoc extends BaseDoc {
  /** All public props for the component. */
  props: PropDoc[];
}
