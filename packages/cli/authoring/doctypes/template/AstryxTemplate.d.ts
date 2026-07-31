// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxBlockTemplate} from './AstryxBlockTemplate';
import type {AstryxPageTemplate} from './AstryxPageTemplate';

/** A validated template doc (page or block). */
export type AstryxTemplate = AstryxPageTemplate | AstryxBlockTemplate;
