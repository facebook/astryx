# @astryxdesign/assistant-ui

Experimental Astryx-native adapters for
[`@assistant-ui/react`](https://www.assistant-ui.com/). The package is a
canary-only incubation space while the package boundary and public API in
[RFC #4441](https://github.com/facebook/astryx/issues/4441) are reviewed.

The adapter package keeps assistant-ui runtime state out of
`@astryxdesign/core`. It composes existing Astryx components, uses
assistant-ui primitives for behavior, and exposes registry-compatible
subpaths for incremental adoption.

## Install

```bash
npm install @astryxdesign/core@canary @astryxdesign/assistant-ui@canary @assistant-ui/react
```

Import the core and adapter styles once:

```tsx
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/assistant-ui/assistant-ui.css';
```

Then render the ready thread inside an assistant-ui runtime provider:

```tsx
import {Thread} from '@astryxdesign/assistant-ui/thread';

export function Assistant() {
  return <Thread />;
}
```

Specialized integrations have isolated entry points:

```tsx
import {DiffViewer} from '@astryxdesign/assistant-ui/diff-viewer';
import {MermaidDiagram} from '@astryxdesign/assistant-ui/mermaid-diagram';
import {astryxGenerativeUILibrary} from '@astryxdesign/assistant-ui/generative-ui';
```

Install the optional generative UI peer only when that subpath is used:

```bash
npm install @assistant-ui/react-generative-ui
```

Use `assistantUIReadyComponents` from the `registry` subpath to inspect the
complete mapping from assistant-ui ready component names to Astryx adapters.

## Coverage

The manifest covers all 36 components in the assistant-ui ready catalog:

- Complete chat: thread, attachment, markdown text, reasoning, timing,
  context display, follow-up suggestions, sources, quote, image, file,
  directive text, and voice.
- Navigation and shells: thread list, modal, assistant sidebar, thread-list
  sidebar, model selector, and composer trigger popover.
- Tooling and integrations: tool fallback, tool group, MCP configuration,
  syntax and Shiki-compatible highlighting, Mermaid, diff viewing, and
  generative UI.
- Presentation adapters: tooltip icon button, select, badge, tabs, accordion,
  provider logos, dot matrix, number roll, and heat graph.

`astryxGenerativeUILibrary` preserves the upstream schemas and actions for all
27 default generative UI intrinsics while replacing their renderers with
Astryx components. Model-provided colors and radii are reduced to a semantic
allowlist rather than being applied as unchecked CSS.

## Package boundary

The package depends on assistant-ui for state and behavior, but
`@astryxdesign/core` does not. Mermaid rendering is injected by the consumer
and falls back to an accessible code block; syntax and diff views use Astryx
`CodeBlock`. This keeps optional renderers out of the base dependency graph
and lets applications adopt each integration through its own subpath.
