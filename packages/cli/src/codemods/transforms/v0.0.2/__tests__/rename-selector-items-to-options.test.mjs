import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-selector-items-to-options.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-selector-items-to-options', () => {
  it('renames items prop on XDSSelector', async () => {
    const input = '<XDSSelector items={options} />';
    const output = await applyTransform(input);
    expect(output).toContain('options={options}');
    expect(output).not.toContain('items=');
  });

  it('handles items with complex expressions', async () => {
    const input = '<XDSSelector items={data.map(d => ({label: d.name, value: d.id}))} />';
    const output = await applyTransform(input);
    expect(output).toContain('options={');
    expect(output).not.toContain('items=');
  });

  it('preserves other props', async () => {
    const input = '<XDSSelector items={opts} onChange={handleChange} label="Pick one" />';
    const output = await applyTransform(input);
    expect(output).toContain('options={opts}');
    expect(output).toContain('onChange={handleChange}');
    expect(output).toContain('label="Pick one"');
  });

  it('does not rename items on non-XDS components', async () => {
    const input = '<Select items={options} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename items on other XDS components', async () => {
    const input = '<XDSDropdownMenu items={menuItems} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-selector-items-to-options.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSSelector options={opts} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles multiple XDSSelector instances', async () => {
    const input = `
      <div>
        <XDSSelector items={a} />
        <XDSSelector items={b} label="second" />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).not.toContain('items=');
    expect(output).toContain('options={a}');
    expect(output).toContain('options={b}');
  });
});
