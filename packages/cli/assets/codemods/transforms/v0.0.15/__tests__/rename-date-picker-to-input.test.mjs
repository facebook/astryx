// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../rename-date-picker-to-input.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('rename-date-picker-to-input', () => {
  it('renames XDSDateTimePicker import path', async () => {
    const input = `import { XDSDateTimePicker } from '@xds/core/DateTimePicker';`;
    const output = await applyTransform(input);
    expect(output).toContain('@xds/core/DateTimeInput');
    expect(output).toContain('XDSDateTimeInput');
    expect(output).not.toContain('DateTimePicker');
  });

  it('renames XDSDateRangePicker import path', async () => {
    const input = `import { XDSDateRangePicker } from '@xds/core/DateRangePicker';`;
    const output = await applyTransform(input);
    expect(output).toContain('@xds/core/DateRangeInput');
    expect(output).toContain('XDSDateRangeInput');
    expect(output).not.toContain('DateRangePicker');
  });

  it('renames JSX element names', async () => {
    const input = `<XDSDateTimePicker label="Pick" value={v} onChange={fn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('<XDSDateTimeInput');
    expect(output).not.toContain('XDSDateTimePicker');
  });

  it('renames type references', async () => {
    const input = `import type { XDSDateTimePickerProps, XDSDateTimePickerSize } from '@xds/core/DateTimePicker';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSDateTimeInputProps');
    expect(output).toContain('XDSDateTimeInputSize');
    expect(output).not.toContain('Picker');
  });

  it('renames DateRangePicker type references', async () => {
    const input = `import type { XDSDateRangePickerProps, XDSDateRangePickerSize } from '@xds/core/DateRangePicker';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSDateRangeInputProps');
    expect(output).toContain('XDSDateRangeInputSize');
    expect(output).not.toContain('Picker');
  });

  it('renames hour format type', async () => {
    const input = `const fmt: XDSDateTimePickerHourFormat = '12h';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSDateTimeInputHourFormat');
    expect(output).not.toContain('Picker');
  });

  it('renames status types', async () => {
    const input = `const s: XDSDateTimePickerStatus = { type: 'error', message: 'bad' };
const t: XDSDateRangePickerStatusType = 'warning';`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSDateTimeInputStatus');
    expect(output).toContain('XDSDateRangeInputStatusType');
    expect(output).not.toContain('Picker');
  });

  it('handles a full component file with both pickers', async () => {
    const input = `import { XDSDateTimePicker } from '@xds/core/DateTimePicker';
import { XDSDateRangePicker } from '@xds/core/DateRangePicker';

function DateForm() {
  return (
    <div>
      <XDSDateTimePicker label="Start" value={start} onChange={setStart} />
      <XDSDateRangePicker label="Range" value={range} onChange={setRange} />
    </div>
  );
}`;
    const output = await applyTransform(input);
    expect(output).toContain('@xds/core/DateTimeInput');
    expect(output).toContain('@xds/core/DateRangeInput');
    expect(output).toContain('<XDSDateTimeInput');
    expect(output).toContain('<XDSDateRangeInput');
    expect(output).not.toContain('Picker');
  });

  it('does not touch unrelated components', async () => {
    const input = `<XDSDateInput label="Date" value={v} onChange={fn} />`;
    const output = await applyTransform(input);
    expect(output).toContain('XDSDateInput');
  });

  it('returns undefined when no changes needed', async () => {
    const {default: transform} = await import(
      '../rename-date-picker-to-input.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSDateInput label="Date" value={v} onChange={fn} />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
