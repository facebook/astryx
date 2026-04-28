/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useXDSStreamingText',
  keywords: ['streaming', 'text', 'typewriter', 'animation', 'ai', 'chat', 'markdown', 'reveal', 'llm', 'chunked'],
  params: [
    {
      name: 'targetText',
      type: 'string',
      description: 'The full target text to reveal. As new chunks arrive, update this value with the accumulated text.',
      required: true,
    },
    {
      name: 'isStreaming',
      type: 'boolean',
      description: 'Whether text is currently being streamed. When false, the hook returns the full targetText immediately.',
      required: true,
    },
    {
      name: 'options',
      type: 'UseStreamingTextOptions',
      description: 'Optional configuration for streaming behavior.',
      required: false,
    },
    {
      name: 'options.speed',
      type: "'natural' | 'fast' | 'instant'",
      description: "Speed preset for text reveal. 'natural' is steady ~2 chars/frame, 'fast' scales with backlog ~4 chars/frame, 'instant' returns full text with no animation.",
      default: "'natural'",
      required: false,
    },
  ],
  returns: [
    {
      name: 'displayedText',
      type: 'string',
      description: 'The portion of targetText to render. Grows steadily toward the full targetText during streaming, or equals targetText when not streaming.',
    },
  ],
  usage: {
    description:
      'Smooths bursty streamed text into a steady character-by-character reveal using requestAnimationFrame. Decouples arrival rate from display rate. Advances on word and syntax boundaries to avoid slicing mid-markdown or mid-word, preventing visual glitches with markdown renderers. Animation timing derives from XDS motion tokens via useXDSTheme when available, with sensible fallbacks outside a theme provider. Snaps to full text when isStreaming becomes false.',
    bestPractices: [
      { guidance: true, description: 'Pass the accumulated text (not individual chunks) as targetText — the hook handles incremental reveal internally.' },
      { guidance: true, description: 'Set isStreaming to false when the stream completes to snap to the final text.' },
      { guidance: true, description: "Use speed='instant' for non-animated contexts like search results or when reduced motion is preferred." },
      { guidance: false, description: 'Use for static text that does not change — the hook adds unnecessary overhead for non-streaming content.' },
    ],
  },
  relatedComponents: ['Markdown'],
  relatedHooks: [],
  importPath: '@xds/core/hooks',
  category: 'streaming',
};
