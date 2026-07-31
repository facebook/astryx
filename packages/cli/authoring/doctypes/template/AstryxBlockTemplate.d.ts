// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxTemplateInput} from './AstryxTemplateInput';

/** A validated block template doc. */
export type AstryxBlockTemplate = AstryxTemplateInput & {type: 'block'};
