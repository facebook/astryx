// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxBaseDocInput} from '../base/AstryxBaseDocInput';
import type {AstryxParamInput} from '../base/AstryxParamInput';
import type {AstryxReturnInput} from '../base/AstryxReturnInput';

/** Any function, including hooks: an inputs (`params`) + outputs (`returns`) surface. */
export interface AstryxFunctionDocInput extends AstryxBaseDocInput {
  /** Function/hook parameters or options-object fields. */
  params: AstryxParamInput[];
  /** Return value documentation. One entry per field (or a single primitive). */
  returns: AstryxReturnInput[];
}
