// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Playground.tsx
 * @output Interactive form-framework playground: pick a prompt, swap frameworks,
 *   see the live rendered form, the verbatim generated code, and live state.
 */

import * as React from 'react';
import {Suspense} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme/neutral';
import {Text} from '@astryxdesign/core/Text';
import {Heading} from '@astryxdesign/core/Heading';
import {Badge} from '@astryxdesign/core/Badge';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {SegmentedControl} from '@astryxdesign/core/SegmentedControl';
import {SegmentedControlItem} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import '@astryxdesign/core/reset.css';

import manifest from '../../.playground/manifest.json';
import {useFormObserver} from './useFormObserver';
import {StatePanel} from './StatePanel';

interface Solution {
  code: string;
  entry: string;
  componentName: string | null;
  compileClean: boolean | null;
}
interface PromptMeta {
  id: string;
  category: string;
  prompt: string;
}
interface Manifest {
  frameworks: string[];
  prompts: PromptMeta[];
  solutions: Record<string, Record<string, Solution>>;
}

const M = manifest as unknown as Manifest;

const FRAMEWORK_LABELS: Record<string, string> = {
  formentor: 'Formentor',
  formisch: 'Formisch',
  tanstack: 'TanStack',
  rhf: 'React Hook Form',
};

// Eagerly map every generated wrapper module so we can look one up by path.
const MODULES = import.meta.glob('../../.playground/*/*.tsx');

const styles = stylex.create({
  app: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    fontFamily: 'system-ui, sans-serif',
  },
  topbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 20,
    padding: '12px 20px',
    borderBottom: '1px solid var(--color-border, rgba(0,0,0,0.1))',
    flexWrap: 'wrap',
  },
  grow: {flex: 1},
  promptText: {
    padding: '10px 20px',
    borderBottom: '1px solid var(--color-border, rgba(0,0,0,0.08))',
    display: 'flex',
    gap: 10,
    alignItems: 'baseline',
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    flex: 1,
    minHeight: 0,
  },
  left: {
    padding: 24,
    overflow: 'auto',
    borderRight: '1px solid var(--color-border, rgba(0,0,0,0.1))',
  },
  right: {
    display: 'grid',
    gridTemplateRows: '1fr auto',
    minHeight: 0,
  },
  codePane: {overflow: 'auto', padding: 12, minHeight: 0},
  statePane: {
    borderTop: '1px solid var(--color-border, rgba(0,0,0,0.1))',
    overflow: 'auto',
    maxHeight: '45%',
  },
  formCard: {
    maxWidth: 460,
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  selectRow: {display: 'flex', alignItems: 'center', gap: 10},
});

function Field({path}: {path: string}) {
  const loader = MODULES[path];
  const Lazy = React.useMemo(
    () =>
      loader
        ? React.lazy(loader as () => Promise<{default: React.ComponentType}>)
        : null,
    [path, loader],
  );
  if (!Lazy) {
    return <Text type="body">No solution module found for {path}.</Text>;
  }
  return (
    <Suspense fallback={<Text type="body">Loading form…</Text>}>
      <Lazy />
    </Suspense>
  );
}

export function Playground({theme}: {theme: 'light' | 'dark'}) {
  const prompts = M.prompts;
  const frameworks = M.frameworks;
  const [promptId, setPromptId] = React.useState(prompts[0].id);
  const [framework, setFramework] = React.useState(frameworks[0]);

  const promptMeta =
    prompts.find((p) => p.id === promptId) ?? prompts[0];
  const solution = M.solutions[promptId]?.[framework];

  // Remount the form (and reset observed state) whenever the pair changes.
  const formKey = `${promptId}:${framework}`;
  const {containerRef, state, reset} = useFormObserver([formKey]);

  React.useEffect(() => {
    reset();
  }, [formKey, reset]);

  const entryGlobPath = solution
    ? `../../.playground/${framework}/${promptId}.tsx`
    : null;

  return (
    <Theme theme={neutralTheme} mode={theme}>
      <div {...stylex.props(styles.app)}>
        <div {...stylex.props(styles.topbar)}>
          <Heading level={4}>Form Framework Playground</Heading>
          <div {...stylex.props(styles.selectRow)}>
            <Text type="supporting" color="secondary">
              Prompt
            </Text>
            <Selector
              label="Prompt"
              isLabelHidden
              value={promptId}
              onChange={(v: string) => setPromptId(v)}
              options={prompts.map((p) => ({
                value: p.id,
                label: `${p.id} — ${p.category}`,
              }))}
            />
          </div>
          <div {...stylex.props(styles.grow)} />
          <SegmentedControl
            label="Framework"
            value={framework}
            onChange={(v: string) => setFramework(v)}
          >
            {frameworks.map((fw) => (
              <SegmentedControlItem
                key={fw}
                value={fw}
                label={FRAMEWORK_LABELS[fw] ?? fw}
              />
            ))}
          </SegmentedControl>
        </div>

        <div {...stylex.props(styles.promptText)}>
          <Badge variant="neutral">{promptMeta.category}</Badge>
          <Text type="body">{promptMeta.prompt}</Text>
          {solution?.compileClean != null && (
            <Badge variant={solution.compileClean ? 'success' : 'error'}>
              {solution.compileClean ? 'tsc clean' : 'tsc errors'}
            </Badge>
          )}
        </div>

        <div {...stylex.props(styles.body)}>
          <div {...stylex.props(styles.left)}>
            <div ref={containerRef} {...stylex.props(styles.formCard)}>
              {entryGlobPath ? (
                <Field path={entryGlobPath} />
              ) : (
                <Text type="body">No solution for this pair.</Text>
              )}
            </div>
          </div>

          <div {...stylex.props(styles.right)}>
            <div {...stylex.props(styles.codePane)}>
              <CodeBlock
                code={solution?.code ?? '// no solution'}
                language="tsx"
                title={`${promptId} · ${FRAMEWORK_LABELS[framework]}`}
                hasCopyButton
                hasLineNumbers
                width="100%"
                maxHeight="100%"
              />
            </div>
            <div {...stylex.props(styles.statePane)}>
              <StatePanel state={state} />
            </div>
          </div>
        </div>
      </div>
    </Theme>
  );
}
