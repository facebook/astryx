// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';

async function applyTransform(source) {
  const {default: transform} = await import(
    '../migrate-item-children-to-endcontent.mjs'
  );
  const jscodeshift = (await import('jscodeshift')).default;
  const j = jscodeshift.withParser('tsx');
  const api = {jscodeshift: j, stats: () => {}, report: () => {}};
  const file = {source, path: 'test.tsx'};
  const result = transform(file, api);
  return result ?? source;
}

describe('migrate-item-children-to-endcontent', () => {
  it('moves a JSX child to endContent', async () => {
    const input = `<XDSDropdownMenuItem label="Notifications">
  <XDSBadge label={3} />
</XDSDropdownMenuItem>`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<XDSBadge label={3} />}');
    expect(output).toContain('/>');
    expect(output).not.toContain('</XDSDropdownMenuItem>');
  });

  it('moves an expression child on XDSContextMenuItem to endContent', async () => {
    const input = `<XDSContextMenuItem label="Auto">
  {isSelected && <CheckIcon />}
</XDSContextMenuItem>`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent={isSelected && <CheckIcon />}');
    expect(output).not.toContain('</XDSContextMenuItem>');
  });

  it('moves text children to endContent', async () => {
    const input = `<XDSDropdownMenuItem label="Status">New</XDSDropdownMenuItem>`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent="New"');
  });

  it('wraps multiple meaningful children in a fragment', async () => {
    const input = `<XDSDropdownMenuItem label="Shortcut">
  <XDSBadge label="New" />
  <XDSKbd keys="⌘K" />
</XDSDropdownMenuItem>`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<>');
    expect(output).toContain('<XDSBadge label="New" />');
    expect(output).toContain('<XDSKbd keys="⌘K" />');
  });

  it('moves XDSSelectorOption children to endContent', async () => {
    const input = `<XDSSelectorOption label="Admin">
  <XDSBadge label="Owner" />
</XDSSelectorOption>`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<XDSBadge label="Owner" />}');
    expect(output).not.toContain('</XDSSelectorOption>');
  });

  it('renames an explicit children prop to endContent', async () => {
    const input = `<XDSSelectorOption label="Notifications" children={<XDSBadge label={3} />} />`;
    const output = await applyTransform(input);
    expect(output).toContain('endContent={<XDSBadge label={3} />}');
    expect(output).not.toContain('children=');
  });

  it('does not touch an item that already uses endContent', async () => {
    const input = `<XDSDropdownMenuItem label="Notifications" endContent={<XDSBadge label={3} />} />`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('skips ambiguous items with both children and endContent', async () => {
    const input = `<XDSDropdownMenuItem label="Notifications" endContent={<NewBadge />}>
  <OldBadge />
</XDSDropdownMenuItem>`;
    const output = await applyTransform(input);
    expect(output).toBe(input);
  });

  it('returns undefined when no changes are needed', async () => {
    const {default: transform} = await import(
      '../migrate-item-children-to-endcontent.mjs'
    );
    const jscodeshift = (await import('jscodeshift')).default;
    const j = jscodeshift.withParser('tsx');
    const api = {jscodeshift: j, stats: () => {}, report: () => {}};
    const source = `<XDSDropdownMenuItem label="Edit" />`;
    const result = transform({source, path: 'test.tsx'}, api);
    expect(result).toBeUndefined();
  });
});
