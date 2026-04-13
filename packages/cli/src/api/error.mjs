/**
 * @file API error class — carries structured error info matching CLIError shape.
 */

export class XDSError extends Error {
  /** @type {Array<{name: string, reason: string}> | undefined} */
  suggestions;

  /**
   * @param {string} message
   * @param {Array<{name: string, reason: string}>} [suggestions]
   */
  constructor(message, suggestions) {
    super(message);
    this.name = 'XDSError';
    if (suggestions?.length) this.suggestions = suggestions;
  }
}
