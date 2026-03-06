import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-form-tooltip-startIcon.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const api = {jscodeshift, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-form-tooltip-startIcon', () => {
  // tooltip → labelTooltip
  it('renames tooltip to labelTooltip on XDSField', async () => {
    const input = '<XDSField tooltip="Help text" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Help text"');
    expect(output).not.toContain(' tooltip=');
  });

  it('renames tooltip to labelTooltip on XDSFieldLabel', async () => {
    const input = '<XDSFieldLabel tooltip="Info" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Info"');
  });

  it('renames tooltip on XDSNumberInput', async () => {
    const input = '<XDSNumberInput tooltip="Enter a number" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Enter a number"');
  });

  it('renames tooltip on XDSCheckboxInput', async () => {
    const input = '<XDSCheckboxInput tooltip="Check this" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Check this"');
  });

  it('renames tooltip on XDSSwitch', async () => {
    const input = '<XDSSwitch tooltip="Toggle feature" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Toggle feature"');
  });

  it('renames tooltip on XDSDateInput', async () => {
    const input = '<XDSDateInput tooltip="Pick a date" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Pick a date"');
  });

  it('renames tooltip on XDSTimeInput', async () => {
    const input = '<XDSTimeInput tooltip="Pick a time" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Pick a time"');
  });

  // startIcon → labelIcon
  it('renames startIcon to labelIcon on XDSField', async () => {
    const input = '<XDSField startIcon={<Icon />} />';
    const output = await applyTransform(input);
    expect(output).toContain('labelIcon={<Icon />}');
    expect(output).not.toContain('startIcon');
  });

  it('renames startIcon on XDSNumberInput', async () => {
    const input = '<XDSNumberInput startIcon={icon} />';
    const output = await applyTransform(input);
    expect(output).toContain('labelIcon={icon}');
  });

  // Both renames in one element
  it('renames both tooltip and startIcon on the same element', async () => {
    const input = '<XDSField tooltip="Help" startIcon={icon} label="Name" />';
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Help"');
    expect(output).toContain('labelIcon={icon}');
    expect(output).toContain('label="Name"');
    expect(output).not.toContain(' tooltip=');
    expect(output).not.toContain('startIcon');
  });

  // Negative cases
  it('does not rename tooltip on non-form components', async () => {
    const input = '<XDSTooltip tooltip="Hover me" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename tooltip on non-XDS components', async () => {
    const input = '<Field tooltip="Help" />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('does not rename startIcon on non-form components', async () => {
    const input = '<XDSButton startIcon={icon} />';
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-form-tooltip-startIcon.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const api = {jscodeshift, stats: () => {}, report: () => {}};
    const source = '<XDSField labelTooltip="Help" labelIcon={icon} />';
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });

  it('handles multiple form components in one file', async () => {
    const input = `
      <div>
        <XDSField tooltip="Name help" startIcon={nameIcon} />
        <XDSSwitch tooltip="Enable feature" />
        <XDSDateInput startIcon={calendarIcon} />
      </div>
    `;
    const output = await applyTransform(input);
    expect(output).toContain('labelTooltip="Name help"');
    expect(output).toContain('labelIcon={nameIcon}');
    expect(output).toContain('labelTooltip="Enable feature"');
    expect(output).toContain('labelIcon={calendarIcon}');
  });
});
