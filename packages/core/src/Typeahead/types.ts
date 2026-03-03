/**
 * @file types.ts
 * @input None
 * @output Exports shared types for Typeahead and Tokenizer components
 * @position Shared type definitions; consumed by XDSBaseTypeahead, XDSTypeahead, XDSTokenizer
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Typeahead/README.md
 * - /packages/core/src/Typeahead/index.ts
 */

import type {ReactNode} from 'react';

/**
 * Minimal item interface for search results.
 * Extend with `auxiliaryData` for custom data per item.
 *
 * @example
 * ```tsx
 * interface UserItem extends XDSSearchableItem<{ avatar: string; role: string }> {}
 *
 * const user: UserItem = {
 *   id: '1',
 *   label: 'Jane Doe',
 *   auxiliaryData: { avatar: '/jane.jpg', role: 'Engineer' },
 * };
 * ```
 */
export interface XDSSearchableItem<TAuxData = unknown> {
  /**
   * Unique identifier for the item.
   */
  id: string;

  /**
   * Display label for the item.
   */
  label: string;

  /**
   * Pre-rendered element for SSR compatibility.
   * When provided, takes priority over `renderItem` and default label rendering.
   */
  element?: ReactNode;

  /**
   * Arbitrary extra data associated with the item.
   * Use generics to type this for your specific use case.
   */
  auxiliaryData?: TAuxData;
}

/**
 * Search source interface for providing items to typeahead components.
 * Supports both synchronous and asynchronous search.
 *
 * @example
 * ```tsx
 * // Sync search source
 * const fruitSource: XDSSearchSource = {
 *   search: (query) => fruits.filter(f => f.label.includes(query)),
 *   bootstrap: () => fruits.slice(0, 5),
 * };
 *
 * // Async search source with cancel support
 * const userSource: XDSSearchSource<UserItem> = {
 *   _controller: null as AbortController | null,
 *   cancel() { this._controller?.abort(); },
 *   async search(query) {
 *     this.cancel();
 *     this._controller = new AbortController();
 *     const res = await fetch(`/api/users?q=${query}`, {
 *       signal: this._controller.signal,
 *     });
 *     return res.json();
 *   },
 *   async bootstrap() {
 *     const res = await fetch('/api/users/recent');
 *     return res.json();
 *   },
 * };
 * ```
 */
export interface XDSSearchSource<
  T extends XDSSearchableItem = XDSSearchableItem,
> {
  /**
   * Called on query change. Returns matching items.
   * Can be synchronous or asynchronous.
   *
   * For expensive operations (API calls, large datasets), consider caching
   * results internally to avoid redundant work on repeated queries.
   */
  search(query: string): Promise<T[]> | T[];

  /**
   * Called on init/focus. Returns initial/default items.
   * Can be synchronous or asynchronous.
   */
  bootstrap(): Promise<T[]> | T[];

  /**
   * Cancel any in-flight search. Called when a new search supersedes
   * a previous one, or when the dropdown closes.
   *
   * Useful for aborting network requests (e.g., via `AbortController`).
   * Optional — if not implemented, previous searches simply resolve and
   * their results are discarded.
   */
  cancel?(): void;
}
