// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxTemplateInput} from './AstryxTemplateInput';

/** A validated page template doc. */
export type AstryxPageTemplate = AstryxTemplateInput & {type: 'page'};
