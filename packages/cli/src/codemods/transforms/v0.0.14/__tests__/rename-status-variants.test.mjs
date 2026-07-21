// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-status-variants.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-status-variants', () => {
  it('renames StatusDot variant="positive" to "success"', async () => {
    const input = `<XDSStatusDot variant="positive" label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames StatusDot variant="negative" to "error"', async () => {
    const input = `<XDSStatusDot variant="negative" label="Offline" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('renames StatusDot variant="info" to "accent"', async () => {
    const input = `<XDSStatusDot variant="info" label="Info" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'accent'");
    expect(output).not.toContain("'info'");
  });

  it('renames AvatarStatusDot variant="positive" to "success"', async () => {
    const input = `<XDSAvatarStatusDot variant="positive" label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames Icon color="positive" to "success"', async () => {
    const input = `<XDSIcon color="positive" icon={CheckIcon} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames Icon color="negative" to "error"', async () => {
    const input = `<XDSIcon color="negative" icon={XIcon} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('renames ProgressBar variant="positive" to "success"', async () => {
    const input = `<XDSProgressBar variant="positive" value={50} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames ProgressBar variant="negative" to "error"', async () => {
    const input = `<XDSProgressBar variant="negative" value={50} />`;
    const output = await applyTransform(input);
    expect(output).toContain("'error'");
    expect(output).not.toContain("'negative'");
  });

  it('handles expression container: variant={"positive"}', async () => {
    const input = `<XDSStatusDot variant={'positive'} label="Online" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('handles ternary: variant={x ? "positive" : "negative"}', async () => {
    const input = `<XDSStatusDot variant={isOnline ? 'positive' : 'negative'} label="Status" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });

  it('renames object property values in files importing target components', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const args = { variant: 'positive' };`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).not.toContain("'positive'");
  });

  it('renames unambiguous values in status-denoting object keys (dot/state/status) in target-importing files', async () => {
    // A StatusDot variant is often supplied indirectly via a non-variant key
    // (`{ dot: 'positive' }`, `{ state: 'negative' }`, `{ status: 'positive' }`)
    // that is later fed into `variant`. Those unambiguous values must migrate.
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const cfg = { dot: 'positive' };
const row = { state: 'negative' };
const map = { status: 'positive' };
const el = <XDSStatusDot variant={cfg.dot} label="x" />;`;
    const output = await applyTransform(input);
    expect(output).toContain("dot: 'success'");
    expect(output).toContain("state: 'error'");
    expect(output).toContain("status: 'success'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });

  it('does NOT rewrite status-key values in a file that does not import a target component', async () => {
    // The object-property path (including the status-key allowlist) is gated on
    // the file importing a StatusDot-family component. Without that import, the
    // value could be anything, so it must be left alone.
    const input = `const cfg = { dot: 'positive' };
const row = { state: 'negative' };`;
    const output = await applyTransform(input);
    expect(output).toContain("dot: 'positive'");
    expect(output).toContain("state: 'negative'");
    expect(output).not.toContain("'success'");
    expect(output).not.toContain("'error'");
  });

  it('does NOT rewrite "info" on a status-denoting key (Badge safety, context-blind)', async () => {
    // `info` is a VALID variant on non-target components (e.g. Badge). A
    // status-key is a context-blind path — the concrete component is unknown —
    // so `info` must be preserved even though positive/negative migrate.
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const cfg = { status: 'info' };`;
    const output = await applyTransform(input);
    expect(output).toContain("status: 'info'");
    expect(output).not.toContain("'accent'");
  });

  it('does NOT rewrite unrelated positive/negative string data in non-status object keys', async () => {
    // The allowlist is exactly {dot,state,status}: unrelated data such as
    // sentiment values, review scores, or test fixtures keyed by review/
    // sentiment/result must never be rewritten, even in a target-importing file.
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const data = { review: 'positive', sentiment: 'negative', result: 'positive' };`;
    const output = await applyTransform(input);
    expect(output).toContain("review: 'positive'");
    expect(output).toContain("sentiment: 'negative'");
    expect(output).toContain("result: 'positive'");
    expect(output).not.toContain("'success'");
    expect(output).not.toContain("'error'");
  });

  it('renames unambiguous values in Storybook argType options arrays but leaves ambiguous "info"', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
const meta = { argTypes: { variant: { options: ['positive', 'negative', 'warning', 'info', 'neutral'] } } };`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
    // 'info' is ambiguous (valid on Badge etc.) and this is a context-blind
    // path — the codemod cannot tell which component the options describe, so
    // it is left for human review rather than risk rewriting a valid value.
    expect(output).toContain("'info'");
    expect(output).not.toContain("'accent'");
    // warning and neutral are unchanged
    expect(output).toContain("'warning'");
    expect(output).toContain("'neutral'");
  });

  it('does not touch unrelated components', async () => {
    const input = `<XDSBadge variant="info" label="New" />`;
    const output = await applyTransform(input);
    // XDSBadge is not in the target list
    expect(output).toContain('info');
  });

  it('does not rewrite Badge config "info" in a file that also imports a target (Icon)', async () => {
    // Regression: a file may import a target component (e.g. XDSIcon) AND
    // declare a typed config object for a NON-target component (Badge, whose
    // BadgeVariantMap still has `info`). The context-blind object-property path
    // must NOT rewrite that `info` to `accent` just because the file imports a
    // target — `accent` is not a valid Badge variant. positive/negative stay
    // renamed (no component keeps them), but info is preserved.
    const input = `import { XDSIcon } from '@xds/core/Icon';
import { XDSBadge, type XDSBadgeVariant } from '@xds/core/Badge';
const PROGRESS_CONFIG: Record<string, {label: string; variant: XDSBadgeVariant}> = {
  OPEN: {label: 'Open', variant: 'info'},
  DONE: {label: 'Done', variant: 'positive'},
  BLOCKED: {label: 'Blocked', variant: 'negative'},
};`;
    const output = await applyTransform(input);
    // Ambiguous 'info' on a Badge config is left intact.
    expect(output).toContain("variant: 'info'");
    expect(output).not.toContain("'accent'");
    // Unambiguous values are still migrated (no component retains them).
    expect(output).toContain("variant: 'success'");
    expect(output).toContain("variant: 'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });

  it('still renames "info" to "accent" on a direct target JSX attribute', async () => {
    // The precise path (component is known) keeps the full mapping, including
    // the ambiguous info -> accent, even when other components are imported.
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
import { XDSBadge } from '@xds/core/Badge';
const a = <XDSStatusDot variant="info" label="Status" />;
const b = <XDSBadge variant="info" label="New" />;`;
    const output = await applyTransform(input);
    // StatusDot's info -> accent (precise), Badge's info stays.
    expect(output).toContain("<XDSStatusDot variant='accent'");
    expect(output).toContain('<XDSBadge variant="info"');
  });

  it('does not touch unrelated props on target components', async () => {
    const input = `<XDSStatusDot variant="positive" label="positive result" />`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    // The label "positive result" should NOT be renamed
    expect(output).toContain('positive result');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-status-variants.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSStatusDot variant='success' label='Online' />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles a full component file', async () => {
    const input = `import { XDSStatusDot } from '@xds/core/StatusDot';
import { XDSIcon } from '@xds/core/Icon';

function StatusIndicator({ isOnline }: { isOnline: boolean }) {
  return (
    <div>
      <XDSStatusDot
        variant={isOnline ? 'positive' : 'negative'}
        label={isOnline ? 'Online' : 'Offline'}
      />
      <XDSIcon
        icon={isOnline ? CheckIcon : XIcon}
        color={isOnline ? 'positive' : 'negative'}
      />
    </div>
  );
}`;
    const output = await applyTransform(input);
    expect(output).toContain("'success'");
    expect(output).toContain("'error'");
    expect(output).not.toContain("'positive'");
    expect(output).not.toContain("'negative'");
  });
});
