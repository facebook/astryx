/**
 * @file Programmatic API for the XDS CLI.
 *
 * Every function returns the same { type, data } envelope that `xds --json` outputs.
 * Errors throw XDSError (with optional .suggestions).
 *
 * @example
 * import { component, docs, XDSError } from '@xds/cli/api';
 *
 * const result = await component('Button');
 * // { type: 'component.detail', data: { name: 'Button', ... } }
 *
 * const list = await component(undefined, { list: true });
 * // { type: 'component.list', data: { Layout: [...], ... } }
 */

export {component} from './component.mjs';
export {docs} from './docs.mjs';
export {discover} from './discover.mjs';
export {XDSError} from './error.mjs';
