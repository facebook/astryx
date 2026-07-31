// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxComponentDocInput} from './component/AstryxComponentDocInput';
import type {AstryxFunctionDocInput} from './hook/AstryxFunctionDocInput';
import type {AstryxGenericDocInput} from './reference/AstryxGenericDocInput';

/** Back-compat alias: the union of the three authored doc-input kinds. */
export type AstryxComponentDoc =
  AstryxComponentDocInput | AstryxFunctionDocInput | AstryxGenericDocInput;
