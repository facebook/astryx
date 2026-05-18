// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-attachments-to-drawer.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-attachments-to-drawer', () => {
  it('renames import specifier', async () => {
    const input = `import { XDSChatComposerAttachments } from '@xds/core/Chat';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSChatComposerDrawer');
    expect(output).not.toContain('XDSChatComposerAttachments');
  });

  it('renames type import', async () => {
    const input = `import type { XDSChatComposerAttachmentsProps } from '@xds/core/Chat';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSChatComposerDrawerProps');
    expect(output).not.toContain('XDSChatComposerAttachmentsProps');
  });

  it('renames JSX element (self-closing)', async () => {
    const input = `import { XDSChatComposerAttachments } from '@xds/core/Chat';
const x = <XDSChatComposerAttachments count={3} />;`;
    const output = await applyTransform(input);
    expect(output).toContain('<XDSChatComposerDrawer');
    expect(output).not.toContain('<XDSChatComposerAttachments');
  });

  it('renames JSX element (with children)', async () => {
    const input = `import { XDSChatComposerAttachments } from '@xds/core/Chat';
const x = <XDSChatComposerAttachments><span>child</span></XDSChatComposerAttachments>;`;
    const output = await applyTransform(input);
    expect(output).toContain('<XDSChatComposerDrawer>');
    expect(output).toContain('</XDSChatComposerDrawer>');
    expect(output).not.toContain('XDSChatComposerAttachments');
  });

  it('renames attachments prop to drawer on XDSChatComposer', async () => {
    const input = `<XDSChatComposer onSubmit={fn} attachments={<Foo />} />`;
    const output = await applyTransform(input);
    expect(output).toContain('drawer={');
    expect(output).not.toContain('attachments={');
  });

  it('does not rename attachments prop on other components', async () => {
    const input = `<SomeOtherComponent attachments={items} />`;
    const output = await applyTransform(input);
    expect(output).toContain('attachments={');
  });

  it('renames CSS class in string literals', async () => {
    const input = `const cls = "xds-chat-composer-attachments";`;
    const output = await applyTransform(input);
    expect(output).toContain('xds-chat-composer-drawer');
    expect(output).not.toContain('xds-chat-composer-attachments');
  });

  it('renames CSS class in template literals', async () => {
    const input = 'const cls = `xds-chat-composer-attachments`;';
    const output = await applyTransform(input);
    expect(output).toContain('xds-chat-composer-drawer');
    expect(output).not.toContain('xds-chat-composer-attachments');
  });

  it('renames type reference in annotation', async () => {
    const input = `import type { XDSChatComposerAttachmentsProps } from '@xds/core/Chat';
const props: XDSChatComposerAttachmentsProps = {};`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSChatComposerDrawerProps');
    expect(output).not.toContain('XDSChatComposerAttachmentsProps');
  });

  it('handles combined import + JSX + prop rename', async () => {
    const input = `import { XDSChatComposer, XDSChatComposerAttachments } from '@xds/core/Chat';
export default function App() {
  return (
    <XDSChatComposer
      onSubmit={fn}
      attachments={
        <XDSChatComposerAttachments count={2}>
          <Token label="file.pdf" />
        </XDSChatComposerAttachments>
      }
    />
  );
}`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSChatComposerDrawer');
    expect(output).toContain('drawer={');
    expect(output).toContain('<XDSChatComposerDrawer');
    expect(output).toContain('</XDSChatComposerDrawer>');
    expect(output).not.toContain('XDSChatComposerAttachments');
    expect(output).not.toContain('attachments={');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-attachments-to-drawer.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSChatComposer drawer={<XDSChatComposerDrawer />} />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('preserves aliased imports', async () => {
    const input = `import { XDSChatComposerAttachments as Attachments } from '@xds/core/Chat';
const x = <Attachments count={3} />;`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSChatComposerDrawer as Attachments');
    expect(output).toContain('<Attachments');
  });
});
