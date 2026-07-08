// flow-typed signature: 913da0be335d23be3c9dd56e9ec4dd3a
// flow-typed version: c6154227d1/@babel/code-frame_v7.x.x/flow_>=v0.104.x

declare module '@babel/code-frame' {
  declare export type SourceLocation = {
    start: {|
      line: number,
      column?: number,
    |},
    end?: {|
      line: number,
      column?: number,
    |},
    ...
  };
  declare export function codeFrameColumns(
    rawLines: string,
    location: SourceLocation,
    options?: BabelCodeFrameOptions
  ): string;

  declare export type BabelCodeFrameOptions = {
    /**
     * Syntax highlight the code as JavaScript for terminals. default: false
     */
    highlightCode?: boolean,

    /**
     * The number of lines to show above the error. default: 2
     */
    linesAbove?: number,

    /**
     * The number of lines to show below the error. default: 3
     */
    linesBelow?: number,

    /**
     * Forcibly syntax highlight the code as JavaScript (for non-terminals);
     * overrides highlightCode.
     * default: false
     */
    forceColor?: boolean,

    /**
     * Pass in a string to be displayed inline (if possible) next to the
     * highlighted location in the code. If it can't be positioned inline,
     * it will be placed above the code frame.
     * default: nothing
     */
    message?: string,
    ...
  }

  /**
   * Generate errors that contain a code frame that point to source locations.
   * @param rawLines Raw lines to frame
   * @param lineNumber Line number (1 indexed)
   * @param colNumber Column number
   * @param options Additional options
   * @returns Framed code
   */
  declare export default function codeFrame(
    rawLines: string,
    lineNumber: number,
    colNumber: number,
    options?: BabelCodeFrameOptions
  ): string;
}
