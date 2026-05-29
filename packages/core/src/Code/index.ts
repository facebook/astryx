// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Convenience re-export for XDSCode
 * @position Subpath export so `@xds/core/Code` resolves correctly
 *
 * XDSCode lives in the CodeBlock directory (shared code rendering internals),
 * but agents and developers naturally expect `@xds/core/Code` to work.
 */

export {XDSCode, type XDSCodeProps} from '../CodeBlock';
