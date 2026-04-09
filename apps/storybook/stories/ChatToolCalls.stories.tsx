import type {Meta, StoryObj} from '@storybook/react';
import {XDSChatToolCalls, type XDSChatToolCallItem} from '@xds/core/Chat';
import {useState, useEffect, useCallback} from 'react';
import {XDSDialog} from '@xds/core/Dialog';
import {XDSDialogHeader} from '@xds/core/Dialog';
import {XDSCodeBlock} from '@xds/core/CodeBlock';

const meta: Meta<typeof XDSChatToolCalls> = {
  title: 'Chat/XDSChatToolCalls',
  component: XDSChatToolCalls,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <div style={{width: 500, padding: 40}}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof XDSChatToolCalls>;

// =============================================================================
// Stories
// =============================================================================

/** Single tool call — renders inline, no group chrome */
export const SingleCall: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'git status', status: 'complete', duration: '1.2s'},
      ]}
    />
  ),
};

/** Multiple calls — pile visual with collapsible group */
export const MultipleCalls: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'git diff --stat', status: 'complete', duration: '340ms'},
        {name: 'read', label: 'src/Button.tsx', status: 'complete', duration: '45ms'},
        {name: 'edit', label: 'src/Button.tsx', status: 'complete', duration: '120ms', stats: {additions: 12, deletions: 3}},
      ]}
    />
  ),
};

/** With node badges — shows which sandbox ran each tool */
export const WithNodes: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'yarn test', status: 'complete', duration: '4.2s', node: 'xds'},
        {name: 'bash', label: 'yarn build', status: 'complete', duration: '12s', node: 'xds'},
        {name: 'read', label: 'README.md', status: 'complete', duration: '30ms', node: 'navi'},
        {name: 'web_search', label: 'CSS anchor positioning', status: 'complete', duration: '1.8s'},
      ]}
    />
  ),
};

/** With stats — additions, deletions, file counts */
export const WithStats: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'edit', label: 'XDSButton.tsx', status: 'complete', duration: '85ms', node: 'xds', stats: {additions: 24, deletions: 8}},
        {name: 'edit', label: 'XDSButton.test.tsx', status: 'complete', duration: '60ms', node: 'xds', stats: {additions: 45}},
        {name: 'bash', label: 'grep -r "radius"', status: 'complete', duration: '200ms', node: 'xds', stats: {matches: 14, files: 6}},
      ]}
    />
  ),
};

/** Error state — shows error indicator on group and individual calls */
export const WithErrors: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'yarn build', status: 'complete', duration: '8s', node: 'xds'},
        {name: 'bash', label: 'yarn test', status: 'error', duration: '2.1s', node: 'xds', errorMessage: 'Process exited with code 1: FAIL src/Button.test.tsx'},
        {name: 'read', label: 'test-output.log', status: 'complete', duration: '15ms', node: 'xds'},
      ]}
    />
  ),
};

/** Running state — spinner on active calls */
export const Running: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'yarn test --watch', status: 'running', node: 'xds'},
        {name: 'read', label: 'vitest.config.ts', status: 'complete', duration: '20ms', node: 'xds'},
      ]}
    />
  ),
};

/** Streaming — tool calls arrive one by one with status transitions */
export const Streaming: Story = {
  render: () => {
    const allCalls: XDSChatToolCallItem[] = [
      {key: '1', name: 'web_search', label: 'CSS anchor positioning support', status: 'complete', duration: '1.8s'},
      {key: '2', name: 'read', label: 'packages/core/src/Layer/useXDSLayer.tsx', status: 'complete', duration: '45ms', node: 'xds'},
      {key: '3', name: 'bash', label: 'npx tsc --noEmit', status: 'complete', duration: '4.2s', node: 'xds'},
      {key: '4', name: 'edit', label: 'XDSChatComposer.tsx', status: 'complete', duration: '120ms', node: 'xds', stats: {additions: 8, deletions: 2}},
      {key: '5', name: 'bash', label: 'yarn test', status: 'complete', duration: '6.1s', node: 'xds'},
    ];

    const [calls, setCalls] = useState<XDSChatToolCallItem[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const start = useCallback(() => {
      setCalls([]);
      setIsRunning(true);
      let i = 0;

      const addNext = () => {
        if (i >= allCalls.length) {
          setIsRunning(false);
          return;
        }
        // Add as running
        const call = allCalls[i]!;
        setCalls(prev => [...prev, {...call, status: 'running', duration: undefined}]);

        // Complete after a delay
        const idx = i;
        setTimeout(() => {
          setCalls(prev =>
            prev.map((c, j) =>
              j === idx ? {...allCalls[idx]!} : c,
            ),
          );
          // Add next after completion
          setTimeout(addNext, 200);
        }, 800 + Math.random() * 1200);

        i++;
      };

      addNext();
    }, []);

    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <button
          onClick={start}
          disabled={isRunning}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #ccc',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            opacity: isRunning ? 0.5 : 1,
          }}>
          {isRunning ? 'Running...' : 'Start streaming'}
        </button>
        {calls.length > 0 && <XDSChatToolCalls calls={calls} />}
      </div>
    );
  },
};

/** Many calls — auto-collapses when >3 */
export const ManyCalls: Story = {
  render: () => (
    <XDSChatToolCalls
      calls={[
        {name: 'bash', label: 'git fetch origin', status: 'complete', duration: '1.2s'},
        {name: 'bash', label: 'git log --oneline -5', status: 'complete', duration: '80ms'},
        {name: 'read', label: 'CHANGELOG.md', status: 'complete', duration: '30ms'},
        {name: 'read', label: 'package.json', status: 'complete', duration: '15ms'},
        {name: 'edit', label: 'package.json', status: 'complete', duration: '50ms', stats: {additions: 1, deletions: 1}},
        {name: 'bash', label: 'yarn install', status: 'complete', duration: '8.5s'},
        {name: 'bash', label: 'yarn build', status: 'complete', duration: '12s'},
        {name: 'bash', label: 'yarn test', status: 'complete', duration: '6.2s'},
      ]}
    />
  ),
};

/** Interactive calls — edit opens a diff modal, bash opens output */
export const Interactive: Story = {
  render: () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogTitle, setDialogTitle] = useState('');
    const [dialogCode, setDialogCode] = useState('');
    const [dialogLang, setDialogLang] = useState('');

    const openDetail = (title: string, code: string, lang: string) => {
      setDialogTitle(title);
      setDialogCode(code);
      setDialogLang(lang);
      setDialogOpen(true);
    };

    const editDiff = `--- a/packages/core/src/Button/XDSButton.tsx
+++ b/packages/core/src/Button/XDSButton.tsx
@@ -55,7 +55,7 @@ const styles = stylex.create({
     gap: spacingVars['--spacing-2'],
     paddingBlock: spacingVars['--spacing-2'],
     paddingInline: spacingVars['--spacing-3'],
-    '--button-radius': radiusVars['--radius-element'],
-    borderRadius: 'var(--button-radius)',
+    borderRadius: 'var(--button-radius, var(--radius-element))',
     fontFamily: 'inherit',
     fontSize: typeScaleVars['--text-label-size'],
     lineHeight: typeScaleVars['--text-label-leading'],
@@ -93,6 +93,10 @@ const styles = stylex.create({
     '--button-icon-only-aspect': '1 / 1',
     aspectRatio: 'var(--button-icon-only-aspect)',
   },
+  // Focus ring offset for accessibility
+  focusVisible: {
+    outline: '2px solid var(--color-ring-focus)',
+    outlineOffset: '2px',
+  },
 });`;

    const testOutput = `$ yarn test
 PASS  packages/core/src/Button/XDSButton.test.tsx
 PASS  packages/core/src/Chat/XDSChatToolCalls.test.tsx
 PASS  packages/core/src/Chat/XDSChatComposerInput.test.tsx

Test Suites: 7 passed, 7 total
Tests:       67 passed, 67 total
Time:        6.1s`;

    return (
      <>
        <XDSChatToolCalls
          calls={[
            {
              name: 'edit',
              label: 'XDSButton.tsx',
              status: 'complete',
              duration: '85ms',
              node: 'xds',
              stats: {additions: 12, deletions: 3},
              onClick: () => openDetail('XDSButton.tsx', editDiff, 'diff'),
            },
            {
              name: 'bash',
              label: 'yarn test',
              status: 'complete',
              duration: '6.1s',
              node: 'xds',
              onClick: () => openDetail('yarn test', testOutput, 'bash'),
            },
            {
              name: 'web_search',
              label: 'CSS anchor positioning',
              status: 'complete',
              duration: '1.8s',
            },
          ]}
        />
        <XDSDialog
          isOpen={dialogOpen}
          onOpenChange={setDialogOpen}
          variant="standard"
          style={{maxWidth: 640}}>
          <XDSDialogHeader title={dialogTitle} onDismiss={() => setDialogOpen(false)} />
          <div style={{padding: 16}}>
            <XDSCodeBlock code={dialogCode} language={dialogLang} />
          </div>
        </XDSDialog>
      </>
    );
  },
};
