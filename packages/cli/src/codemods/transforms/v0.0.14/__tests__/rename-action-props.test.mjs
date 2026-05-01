import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-action-props.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-action-props', () => {
  it('renames onChangeAction to changeAction on JSX', async () => {
    const input = `<XDSSelector value="a" onChange={fn} onChangeAction={asyncFn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction={asyncFn}');
    expect(output).not.toContain('onChangeAction');
  });

  it('renames onClickAction to clickAction on JSX', async () => {
    const input = `<XDSButton label="Go" onClickAction={asyncFn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('clickAction={asyncFn}');
    expect(output).not.toContain('onClickAction');
  });

  it('renames onPressedChangeAction to pressedChangeAction', async () => {
    const input = `<XDSToggleButton onPressedChangeAction={asyncFn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('pressedChangeAction={asyncFn}');
    expect(output).not.toContain('onPressedChangeAction');
  });

  it('renames onScrollToTopAction to scrollToTopAction', async () => {
    const input = `<XDSChatMessageList onScrollToTopAction={loadMore} />`;
    const output = await applyTransform(input);
    expect(output).toContain('scrollToTopAction={loadMore}');
    expect(output).not.toContain('onScrollToTopAction');
  });

  it('handles multiple action props on one element', async () => {
    const input = `<XDSTextInput onChange={fn} onChangeAction={asyncFn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction={asyncFn}');
    expect(output).toContain('onChange={fn}');
    expect(output).not.toContain('onChangeAction');
  });

  it('renames object property keys', async () => {
    const input = `createConfig({ onChangeAction: async () => {} });`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction:');
    expect(output).not.toContain('onChangeAction:');
  });

  it('renames destructured props', async () => {
    const input = `function MyInput({ onChangeAction, onChange }) { return null; }`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction');
    expect(output).not.toContain('onChangeAction');
  });

  it('renames aliased destructured props', async () => {
    const input = `function MyInput({ onChangeAction: handler }) { return null; }`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction: handler');
    expect(output).not.toContain('onChangeAction');
  });

  it('renames TypeScript interface properties', async () => {
    const input = `interface Props { onChangeAction?: (v: string) => Promise<void>; }`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction?:');
    expect(output).not.toContain('onChangeAction');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-action-props.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSSelector value="a" changeAction={fn} />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('does not rename onChange or onClick (non-action callbacks)', async () => {
    const input = `<XDSSelector value="a" onChange={fn} onClick={fn2} />`;
    const output = await applyTransform(input);
    expect(output).toContain('onChange={fn}');
    expect(output).toContain('onClick={fn2}');
  });

  it('does not rename onAction (not a transition-wrapped prop)', async () => {
    const input = `<XDSAlertDialog title="Delete?" onAction={asyncFn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('onAction={asyncFn}');
  });

  it('handles a full component file', async () => {
    const input = `import { XDSSelector } from '@xds/core/Selector';

interface MyProps {
  onChangeAction?: (value: string) => Promise<void>;
}

function MySelector({ onChangeAction }: MyProps) {
  return (
    <XDSSelector
      value="a"
      onChange={fn}
      onChangeAction={onChangeAction}
    />
  );
}`;
    const output = await applyTransform(input);
    expect(output).toContain('changeAction');
    expect(output).not.toContain('onChangeAction');
    // onChange should be untouched
    expect(output).toContain('onChange={fn}');
  });
});
