import {describe, it, expect} from 'vitest';
import {component} from '../api/component.mjs';
import {findShowcase, findRelatedBlocks} from '../api/template.mjs';

const CWD = {cwd: '.'};

// ─── Bug: sub-component doc resolution ──────────────────────────
// When asking for a sub-component (Code, HStack, Heading, SideNavItem),
// the API should scope the response to that specific sub-component,
// not return the entire parent doc.

describe('component() sub-component scoping', () => {
  it('component("Code") returns Code, not CodeBlock', async () => {
    const result = await component('Code', CWD);
    // Should be scoped to the Code sub-component
    expect(result.data.name).not.toBe('CodeBlock');
    // The response should contain Code's props, not CodeBlock's
    const props = result.data.props || result.data.components?.flatMap(c => c.props || []);
    const propNames = props?.map(p => p.name) || [];
    // Code has 'children', CodeBlock has 'code' + 'language'
    expect(propNames).toContain('children');
    expect(propNames).not.toContain('language');
  });

  it('component("HStack") returns HStack, not Stack', async () => {
    const result = await component('HStack', CWD);
    expect(result.data.name).not.toBe('Stack');
    // Should have HStack's description, not the family overview
  });

  it('component("Heading") returns Heading, not Text', async () => {
    const result = await component('Heading', CWD);
    expect(result.data.name).not.toBe('Text');
  });

  it('component("SideNavItem") returns SideNavItem, not SideNav', async () => {
    const result = await component('SideNavItem', CWD);
    expect(result.data.name).not.toBe('SideNav');
  });

  it('component("GridSpan") returns GridSpan, not Grid', async () => {
    const result = await component('GridSpan', CWD);
    expect(result.data.name).not.toBe('Grid');
  });

  it('component("Tab") returns Tab, not TabList', async () => {
    const result = await component('Tab', CWD);
    expect(result.data.name).not.toBe('TabList');
  });

  // Non-regression: asking for the parent still returns the full doc
  it('component("CodeBlock") still returns full CodeBlock doc', async () => {
    const result = await component('CodeBlock', CWD);
    expect(result.data.name).toBe('CodeBlock');
    expect(result.data.components.length).toBeGreaterThan(1);
  });

  it('component("Stack") still returns full Stack doc', async () => {
    const result = await component('Stack', CWD);
    expect(result.data.name).toBe('Stack');
  });

  it('component("SideNav") still returns full SideNav doc', async () => {
    const result = await component('SideNav', CWD);
    expect(result.data.name).toBe('SideNav');
  });
});

// ─── Bug: findShowcase priority ─────────────────────────────────
// findShowcase should prioritize exact directory matches over
// componentsUsed matches from sibling directories.

describe('findShowcase() priority', () => {
  it('Badge resolves to Badge dir, not a sibling that uses Badge', async () => {
    const result = await findShowcase('Badge');
    expect(result).not.toBeNull();
    expect(result.filePath).toMatch(/\/Badge\//);
  });

  it('Avatar resolves to Avatar dir, not AvatarStatusDot', async () => {
    const result = await findShowcase('Avatar');
    expect(result).not.toBeNull();
    expect(result.filePath).toMatch(/\/Avatar\//);
    expect(result.filePath).not.toMatch(/AvatarStatusDot/);
  });

  it('ClickableCard resolves via componentsUsed in Card/', async () => {
    const result = await findShowcase('ClickableCard');
    expect(result).not.toBeNull();
    expect(result.name).toBe('ClickableCard');
    expect(result.filePath).toMatch(/\/Card\//);
  });

  it('SelectableCard resolves via componentsUsed in Card/', async () => {
    const result = await findShowcase('SelectableCard');
    expect(result).not.toBeNull();
    expect(result.name).toBe('SelectableCard');
  });

  it('Stack resolves to Stack dir despite componentsUsed elsewhere', async () => {
    const result = await findShowcase('Stack');
    expect(result).not.toBeNull();
    expect(result.filePath).toMatch(/\/Stack\//);
  });

  it('returns null for nonexistent component', async () => {
    const result = await findShowcase('NonExistentWidget');
    expect(result).toBeNull();
  });
});

// ─── Feature: component() → example blocks ─────────────────────
// The component API should expose related example blocks so consumers
// (doc site, agents) can discover them without a separate call.

describe('component() blocks integration', () => {
  it('component("Card", {blocks: true}) returns related blocks', async () => {
    const result = await component('Card', {...CWD, blocks: true});
    expect(result.type).toBe('component.detail.blocks');
    expect(result.data.component).toBe('Card');
    expect(Array.isArray(result.data.blocks)).toBe(true);
    expect(result.data.blocks.length).toBeGreaterThan(0);
    // Each block should have name, description, isShowcase
    const first = result.data.blocks[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('description');
    expect(first).toHaveProperty('isShowcase');
  });

  it('blocks include showcase and non-showcase entries', async () => {
    const result = await component('Card', {...CWD, blocks: true});
    const showcases = result.data.blocks.filter(b => b.isShowcase);
    const nonShowcases = result.data.blocks.filter(b => !b.isShowcase);
    expect(showcases.length).toBeGreaterThan(0);
    expect(nonShowcases.length).toBeGreaterThan(0);
  });

  it('blocks for sub-component returns that sub-component blocks', async () => {
    const result = await component('ClickableCard', {...CWD, blocks: true});
    expect(result.data.component).toBe('ClickableCard');
    expect(result.data.blocks.length).toBeGreaterThan(0);
    // Should include ClickableCardShowcase
    const names = result.data.blocks.map(b => b.name);
    expect(names.some(n => n.includes('ClickableCard'))).toBe(true);
  });

  it('blocks for component with no blocks returns empty array', async () => {
    const result = await component('Theme', {...CWD, blocks: true});
    expect(result.data.blocks).toEqual([]);
  });
});
