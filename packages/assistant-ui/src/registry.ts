// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file registry.ts
 * @input Static assistant-ui ready registry names and Astryx adapter subpaths
 * @output Exports the complete ready-component manifest and related types
 * @position Discovery contract for @astryxdesign/assistant-ui
 */

export type AssistantUIReadyComponentKind =
  | 'composition'
  | 'content'
  | 'integration'
  | 'navigation'
  | 'presentation'
  | 'tool';

export interface AssistantUIReadyComponent {
  /** Name used by the assistant-ui ready registry. */
  name: string;
  /** Astryx adapter package subpath. */
  entrypoint: string;
  /** Primary Astryx export or compound component. */
  exportName: string;
  /** High-level responsibility of the adapter. */
  kind: AssistantUIReadyComponentKind;
  /** Whether loading the entrypoint requires an optional peer dependency. */
  optionalPeer?: string;
}

/**
 * Complete mapping for the assistant-ui ready `registry:component` catalog.
 *
 * Entries intentionally share modules when they are facets of the same
 * composition. The entrypoint is the stable public package subpath rather
 * than an implementation filename.
 */
export const assistantUIReadyComponents = [
  {
    name: 'thread',
    entrypoint: '@astryxdesign/assistant-ui/thread',
    exportName: 'Thread',
    kind: 'composition',
  },
  {
    name: 'voice',
    entrypoint: '@astryxdesign/assistant-ui/voice',
    exportName: 'VoiceControl',
    kind: 'composition',
  },
  {
    name: 'markdown-text',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'MarkdownText',
    kind: 'content',
  },
  {
    name: 'reasoning',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'Reasoning',
    kind: 'content',
  },
  {
    name: 'message-timing',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'MessageTiming',
    kind: 'content',
  },
  {
    name: 'context-display',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'ContextDisplay',
    kind: 'content',
  },
  {
    name: 'thread-list',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'ThreadList',
    kind: 'navigation',
  },
  {
    name: 'mcp-config',
    entrypoint: '@astryxdesign/assistant-ui/mcp-config',
    exportName: 'MCPConfig',
    kind: 'integration',
  },
  {
    name: 'attachment',
    entrypoint: '@astryxdesign/assistant-ui/attachment',
    exportName: 'Attachment',
    kind: 'content',
  },
  {
    name: 'follow-up-suggestions',
    entrypoint: '@astryxdesign/assistant-ui/follow-up-suggestions',
    exportName: 'FollowUpSuggestions',
    kind: 'composition',
  },
  {
    name: 'tooltip-icon-button',
    entrypoint: '@astryxdesign/assistant-ui/tooltip-icon-button',
    exportName: 'TooltipIconButton',
    kind: 'presentation',
  },
  {
    name: 'syntax-highlighter',
    entrypoint: '@astryxdesign/assistant-ui/syntax-highlighter',
    exportName: 'SyntaxHighlighter',
    kind: 'integration',
  },
  {
    name: 'assistant-modal',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'AssistantModal',
    kind: 'navigation',
  },
  {
    name: 'assistant-sidebar',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'AssistantSidebar',
    kind: 'navigation',
  },
  {
    name: 'tool-fallback',
    entrypoint: '@astryxdesign/assistant-ui/tools',
    exportName: 'ToolFallback',
    kind: 'tool',
  },
  {
    name: 'tool-group',
    entrypoint: '@astryxdesign/assistant-ui/tools',
    exportName: 'ToolGroup',
    kind: 'tool',
  },
  {
    name: 'shiki-highlighter',
    entrypoint: '@astryxdesign/assistant-ui/syntax-highlighter',
    exportName: 'ShikiHighlighter',
    kind: 'integration',
  },
  {
    name: 'mermaid-diagram',
    entrypoint: '@astryxdesign/assistant-ui/mermaid-diagram',
    exportName: 'MermaidDiagram',
    kind: 'integration',
  },
  {
    name: 'diff-viewer',
    entrypoint: '@astryxdesign/assistant-ui/diff-viewer',
    exportName: 'DiffViewer',
    kind: 'integration',
  },
  {
    name: 'threadlist-sidebar',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'ThreadListSidebar',
    kind: 'navigation',
  },
  {
    name: 'quote',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'QuoteBlock',
    kind: 'content',
  },
  {
    name: 'sources',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'Sources',
    kind: 'content',
  },
  {
    name: 'image',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'Image',
    kind: 'content',
  },
  {
    name: 'file',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'File',
    kind: 'content',
  },
  {
    name: 'model-selector',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'ModelSelector',
    kind: 'navigation',
  },
  {
    name: 'logos',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'ProviderLogo',
    kind: 'presentation',
  },
  {
    name: 'select',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'Select',
    kind: 'presentation',
  },
  {
    name: 'badge',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'Badge',
    kind: 'presentation',
  },
  {
    name: 'tabs',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'Tabs',
    kind: 'presentation',
  },
  {
    name: 'accordion',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'Accordion',
    kind: 'presentation',
  },
  {
    name: 'dot-matrix',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'DotMatrix',
    kind: 'presentation',
  },
  {
    name: 'number-roll',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'NumberRoll',
    kind: 'presentation',
  },
  {
    name: 'heat-graph',
    entrypoint: '@astryxdesign/assistant-ui/primitives',
    exportName: 'HeatGraph',
    kind: 'presentation',
  },
  {
    name: 'composer-trigger-popover',
    entrypoint: '@astryxdesign/assistant-ui/navigation',
    exportName: 'ComposerTriggerPopover',
    kind: 'navigation',
  },
  {
    name: 'directive-text',
    entrypoint: '@astryxdesign/assistant-ui/content',
    exportName: 'DirectiveText',
    kind: 'content',
  },
  {
    name: 'generative-ui',
    entrypoint: '@astryxdesign/assistant-ui/generative-ui',
    exportName: 'astryxGenerativeUILibrary',
    kind: 'integration',
    optionalPeer: '@assistant-ui/react-generative-ui',
  },
] as const satisfies ReadonlyArray<AssistantUIReadyComponent>;

export type AssistantUIReadyComponentName =
  (typeof assistantUIReadyComponents)[number]['name'];
