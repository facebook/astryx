// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `component.detail.props` leaf — just a component's props table.
 *
 * @input  a resolved (already-loaded) doc-like object, from _adapter
 * @output the `component.detail.props` envelope
 * @position api/component/detail/props (projection leaf; routed by component.mjs)
 */

import {extractProps} from '../../_adapter.mjs';

/**
 * Project a resolved doc into the `component.detail.props` envelope.
 * @param {import('../../_adapter.mjs').LoadedComponentDoc} docs
 * @returns {import('../../../../types/component').ComponentDetailPropsResponse}
 */
export function componentDetailProps(docs) {
  return {type: 'component.detail.props', data: extractProps(docs)};
}
