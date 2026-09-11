// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file check-contract.test.mjs
 * Unit tests for the API-contract gate (#5421 / #4163). The behaviour worth
 * pinning is what counts as a public prop: the type checker has to see props
 * a regex would miss (`extends`/`Omit`/`Pick`) and ignore the ones a regex
 * would invent (BaseProps HTML passthrough, raw DOM `on*`), and it has to
 * require a redeclared handler (`onKeyDown` on an input) rather than strip
 * it by name.
 *
 * Policy is SUBSET, not equality: every public source prop must be documented.
 * Docs may list more (forwarded subcomponent props). Required/optional and
 * phantom-doc props are out of scope for v1.
 *
 * Edge classes pinned after the original set: union member-only props,
 * intersection redeclares (either constituent order), `@types/react`
 * inheritance, generic and key-remapped Props, `__tests__/` leakage, docs
 * that cannot be loaded or export no `docs`, report order under any
 * directory read order, and the `run()` exit codes CI sees — including a
 * zero-doc scan failing rather than passing.
 *
 * Then the shared/aliased bags: an entry with no `{Name}Props` of its own
 * resolves through the exported `{Name}` signature (generic shared bag,
 * `export {X as Y}` alias, every overload, zero-parameter hook), and an
 * entry that resolves neither way fails the run instead of sitting in an
 * informational list. Those last two are pinned against REAL core
 * components — the indicator family and `ContextMenuItem` — because a
 * fixture proves the mechanism and only real source proves the coverage.
 *
 * Then which bag wins: only an exported, top-level `{Name}Props` counts,
 * the doc's own directory beats a foreign one, a shallower path beats a
 * nested copy, and the answer holds under any directory read order. Then
 * the parameter forms the signature route must read (class constructors,
 * rest tuples, every bag parameter, constrained type parameters, destructured
 * defaults, optional and Readonly / Partial / Omit / Pick parameters, unions
 * with primitives, index-signature-only bags, Parameters<typeof> and
 * ComponentProps<typeof>, bare callbacks; `any` / `unknown` / `object` are
 * unresolved, not empty), the declaration forms (memo / forwardRef / FC,
 * arrow consts, deferred and default exports, barrel chains), the platform
 * filter through that route (and that node_modules outside @types/react and
 * csstype is public API), the report shape, the resolver's route report, and
 * the remaining gates: the `docs` export is the one checked, a doc that
 * publishes props[] without a name fails, a malformed doc is unreadable
 * rather than a crash, and a program that cannot resolve `react` — or
 * resolves it to untyped JavaScript — fails before any verdict.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it, expect, afterEach, vi} from 'vitest';
import {
  isSkippedProp,
  documentedPropNames,
  findUndocumented,
  checkContract,
  run,
  buildProgram,
  createResolver,
} from './check-contract.mjs';

const tmpDirs = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function fixture(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-contract-'));
  tmpDirs.push(dir);
  for (const [rel, source] of Object.entries(files)) {
    const full = path.join(dir, rel);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, source);
  }
  return dir;
}

const BASE_PROPS = `export interface BaseProps {
  id?: string;
  className?: string;
  style?: unknown;
  xstyle?: unknown;
  onClick?: () => void;
}
`;

describe('isSkippedProp — platform surface docs must not enumerate', () => {
  it('skips the universal styling / ref props ComponentPropDoc tells authors to omit', () => {
    expect(isSkippedProp('xstyle')).toBe(true);
    expect(isSkippedProp('className')).toBe(true);
    expect(isSkippedProp('style')).toBe(true);
    expect(isSkippedProp('ref')).toBe(true);
    expect(isSkippedProp('data-testid')).toBe(true);
  });

  it('does not skip redeclared HTML-ish props that are part of the component contract', () => {
    expect(isSkippedProp('href')).toBe(false);
    expect(isSkippedProp('as')).toBe(false);
    expect(isSkippedProp('target')).toBe(false);
    expect(isSkippedProp('rel')).toBe(false);
    expect(isSkippedProp('onKeyDown')).toBe(false);
    expect(isSkippedProp('onClick')).toBe(false);
    expect(isSkippedProp('label')).toBe(false);
  });
});

describe('documentedPropNames — every props[] the doc file owns', () => {
  it('reads top-level props on a single-component doc', () => {
    expect(
      documentedPropNames({
        name: 'Button',
        props: [{name: 'label'}, {name: 'href'}],
      }),
    ).toEqual(new Set(['label', 'href']));
  });

  it('reads inline components[].props on a multi-component doc', () => {
    expect(
      documentedPropNames({
        name: 'Layout',
        components: [
          {name: 'Stack', props: [{name: 'gap'}, {name: 'direction'}]},
          {name: 'LayoutPanel'},
        ],
      }),
    ).toEqual(new Set(['gap', 'direction']));
  });

  it('unions top-level props with inline component props', () => {
    expect(
      documentedPropNames({
        name: 'Dialog',
        props: [{name: 'padding'}],
        components: [{name: 'DialogHeader', props: [{name: 'title'}]}],
      }),
    ).toEqual(new Set(['padding', 'title']));
  });
});

describe('findUndocumented — subset, not equality', () => {
  it('lists a source prop the doc omitted', () => {
    expect(findUndocumented(['label', 'href'], ['label'])).toEqual(['href']);
  });

  it('accepts extra documented props (forwarded / subcomponent surface)', () => {
    expect(findUndocumented(['label'], ['label', 'type', 'color'])).toEqual([]);
  });

  it('returns empty when every source prop is documented', () => {
    expect(findUndocumented(['label', 'href'], ['href', 'label'])).toEqual([]);
  });
});

describe('checkContract — public props derived from the type checker', () => {
  it('flags an own prop that the doc omitted', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({component: 'Widget', prop: 'width'}),
      ]),
    );
  });

  it('does not require BaseProps passthrough (id, onClick)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved, unreadable} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(unreadable).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('requires a redeclared onKeyDown (component-owned, not raw DOM passthrough)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'node_modules/@types/react/index.d.ts': `
        export interface HTMLAttributes<T> {
          onKeyDown?: (event: T) => void;
          onFocus?: (event: T) => void;
        }
      `,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        import type {HTMLAttributes} from 'react';
        export interface WidgetProps extends BaseProps, HTMLAttributes<unknown> {
          label: string;
          onKeyDown?: (e: unknown) => void;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    // onFocus reaches WidgetProps only through @types/react and stays
    // passthrough; onKeyDown is declared there AND on the component: API.
    expect(missing.map(m => m.prop)).toEqual(['onKeyDown']);
  });

  it('accepts extra documented props (subset policy)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          format?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [
            {name: 'format', type: 'string', description: 'Format string'},
            {name: 'type', type: 'string', description: 'Forwarded from a child'},
            {name: 'color', type: 'string', description: 'Forwarded from a child'},
          ],
        };
      `,
    });
    const {missing, unresolved, unreadable} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(unreadable).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('prefers the {Name}Props declared in the doc directory when the name collides', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Other/Other.tsx': `
        export interface WidgetProps {
          alien: string;
        }
      `,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved, unreadable} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(unreadable).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('scans a sibling sub-component doc (subComponentOf) as its own contract', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Dialog/Dialog.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface DialogProps extends BaseProps {
          padding?: number;
        }
      `,
      'Dialog/DialogHeader.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface DialogHeaderProps extends BaseProps {
          title: string;
        }
      `,
      'Dialog/Dialog.doc.mjs': `
        export const docs = {
          name: 'Dialog',
          props: [{name: 'padding', type: 'number', description: 'Inset'}],
          components: [{name: 'DialogHeader'}],
        };
      `,
      'Dialog/DialogHeader.doc.mjs': `
        export const docs = {
          name: 'DialogHeader',
          subComponentOf: 'Dialog',
          description: 'Title row',
          props: [],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({component: 'DialogHeader', prop: 'title'}),
      ]),
    );
  });

  it('skips a hook doc that documents params, not props[]: no entry, so neither unresolved nor drift', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Table/useTableSortable.ts': `
        export interface UseTableSortableConfig {
          column: string;
        }
      `,
      'Table/useTableSortable.doc.mjs': `
        export const docs = {
          name: 'useTableSortable',
          params: [{name: 'column', type: 'string', description: 'Sort key'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(missing).toEqual([]);
    expect(unresolved.some(u => u.component === 'useTableSortable')).toBe(
      false,
    );
  });

  it('records unresolved when a component doc has props[] but no matching {Name}Props', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(missing).toEqual([]);
    expect(unresolved).toEqual(
      expect.arrayContaining([expect.objectContaining({component: 'Widget'})]),
    );
  });

  it('reads a stamped default export, not only `export const docs`', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export default {
          type: 'component',
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({component: 'Widget', prop: 'width'}),
      ]),
    );
  });

  it('reports a .doc.mjs that cannot be imported instead of swallowing it', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {`,
    });
    const result = await checkContract(src);
    expect(result.unreadable).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          file: expect.stringContaining('Widget.doc.mjs'),
        }),
      ]),
    );
  });

  it('still skips ref and xstyle when the component redeclares them', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          ref?: unknown;
          xstyle?: unknown;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved, unreadable} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(unreadable).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('derives props from a type alias, not only an interface', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        export type WidgetProps = {
          label: string;
          width?: string;
        };
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({component: 'Widget', prop: 'width'}),
      ]),
    );
  });

  it('follows Pick<ParentProps> the same way it follows Omit', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Button/Button.tsx': `
        export interface ButtonProps {
          label: string;
          href?: string;
          size?: string;
        }
      `,
      'LinkButton/LinkButton.tsx': `
        import type {ButtonProps} from '../Button/Button';
        export type LinkButtonProps = Pick<ButtonProps, 'label' | 'href'> & {
          icon: unknown;
        };
      `,
      'LinkButton/LinkButton.doc.mjs': `
        export const docs = {
          name: 'LinkButton',
          props: [{name: 'icon', type: 'unknown', description: 'Glyph'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    const props = missing
      .filter(m => m.component === 'LinkButton')
      .map(m => m.prop)
      .sort();
    expect(props).toEqual(expect.arrayContaining(['label', 'href']));
    expect(props).not.toContain('size');
  });

  it('does not treat colocated .test / .stories files as the source of truth', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.test.tsx': `
        export interface WidgetProps { leakedFromTest: string }
      `,
      'Widget/Widget.stories.tsx': `
        export interface WidgetProps { leakedFromStory: string }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved, unreadable} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(unreadable).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('checks inline components[].props against that sub-component, not the parent', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Layout/Stack.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface StackProps extends BaseProps {
          gap?: number;
          direction?: string;
        }
      `,
      'Layout/Layout.doc.mjs': `
        export const docs = {
          name: 'Layout',
          components: [
            {
              name: 'Stack',
              props: [{name: 'gap', type: 'number', description: 'Space between children'}],
            },
          ],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual(
      expect.arrayContaining([
        expect.objectContaining({component: 'Stack', prop: 'direction'}),
      ]),
    );
    expect(missing.map(m => m.component)).not.toContain('Layout');
  });
});

describe('documentedPropNames / findUndocumented — empty and nameless input', () => {
  it('returns an empty set for a missing or empty doc', () => {
    expect(documentedPropNames(undefined)).toEqual(new Set());
    expect(documentedPropNames({name: 'X'})).toEqual(new Set());
  });

  it('skips a props[] entry that has no name', () => {
    expect(
      documentedPropNames({
        name: 'X',
        props: [{type: 'string'}, {name: 'label'}],
      }),
    ).toEqual(new Set(['label']));
  });

  it('returns empty when the source side is empty, even if docs list extras', () => {
    expect(findUndocumented([], ['label'])).toEqual([]);
  });
});

describe('checkContract — union, intersection, and inheritance edges', () => {
  it('requires a prop that only one member of a union {Name}Props declares (Slider range mode)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Slider/Slider.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface SliderBaseProps extends BaseProps {
          step?: number;
        }
        export interface SliderSingleProps extends SliderBaseProps {
          value: number;
        }
        export interface SliderRangeProps extends SliderBaseProps {
          value: [number, number];
          minStepsBetweenThumbs?: number;
        }
        export type SliderProps = SliderSingleProps | SliderRangeProps;
      `,
      'Slider/Slider.doc.mjs': `
        export const docs = {
          name: 'Slider',
          props: [
            {name: 'step', type: 'number', description: 'Increment'},
            {name: 'value', type: 'number | [number, number]', description: 'Current value'},
          ],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual([
      expect.objectContaining({
        component: 'Slider',
        prop: 'minStepsBetweenThumbs',
      }),
    ]);
  });

  it('requires a prop redeclared over BaseProps in an intersection, whichever side BaseProps is on', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export type WidgetProps = BaseProps & {
          label: string;
          /** Component-owned, not the BaseProps passthrough. */
          onClick?: () => void;
        };
      `,
      'Gadget/Gadget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export type GadgetProps = {
          label: string;
          onClick?: () => void;
        } & BaseProps;
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
      'Gadget/Gadget.doc.mjs': `
        export const docs = {
          name: 'Gadget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual([
      expect.objectContaining({component: 'Gadget', prop: 'onClick'}),
      expect.objectContaining({component: 'Widget', prop: 'onClick'}),
    ]);
  });
});

describe('checkContract — doc loading and report determinism', () => {
  it('reports a .doc.mjs that exports neither `docs` nor a default, instead of silently skipping it', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const doc = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {unreadable, missing} = await checkContract(src);
    expect(unreadable).toEqual([
      expect.objectContaining({
        file: expect.stringContaining('Widget.doc.mjs'),
        reason: expect.stringMatching(/docs/),
      }),
    ]);
    expect(missing).toEqual([]);
  });

  it('sorts missing and unresolved by name, not by directory read order', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Alpha/Alpha.doc.mjs': `
        export const docs = {name: 'Alpha', props: [{name: 'x', type: 'string', description: 'x'}]};
      `,
      'Beta/Beta.doc.mjs': `
        export const docs = {name: 'Beta', props: [{name: 'x', type: 'string', description: 'x'}]};
      `,
      'Yak/Yak.tsx': `export interface YakProps { b: string; a: string }`,
      'Yak/Yak.doc.mjs': `export const docs = {name: 'Yak', props: []};`,
      'Zed/Zed.tsx': `export interface ZedProps { z: string }`,
      'Zed/Zed.doc.mjs': `export const docs = {name: 'Zed', props: []};`,
    });
    const natural = fs.readdirSync.bind(fs);
    const reversed = (dir, opts) => {
      const entries = natural(dir, opts);
      return String(dir).startsWith(src) ? [...entries].reverse() : entries;
    };
    const spy = vi.spyOn(fs, 'readdirSync');
    try {
      for (const walkOrder of [natural, reversed]) {
        spy.mockImplementation(walkOrder);
        const {missing, unresolved} = await checkContract(src);
        expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
          'Yak.a',
          'Yak.b',
          'Zed.z',
        ]);
        expect(unresolved.map(u => u.component)).toEqual(['Alpha', 'Beta']);
      }
    } finally {
      spy.mockRestore();
    }
  });
});

describe('run — the CI-facing report', () => {
  function capture() {
    const out = {log: [], error: []};
    return {
      out,
      io: {
        log: line => out.log.push(line),
        error: line => out.error.push(line),
      },
    };
  }

  it('prints each undocumented prop with its doc path and returns 1', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    expect(out.error.join('\n')).toMatch(/1 undocumented public prop/);
    expect(out.error.join('\n')).toMatch(
      /Widget\.width\s+\(.*Widget\.doc\.mjs\)/,
    );
    expect(out.log).toEqual([]);
  });

  it('returns 1 when the scan finds no .doc.mjs at all — an empty scan is a misconfigured gate, not a pass', async () => {
    const src = fixture({'BaseProps.ts': BASE_PROPS});
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    expect(out.error.join('\n')).toMatch(/no \.doc\.mjs/);
    expect(out.log).toEqual([]);
  });

  it('returns 1 and names an entry whose public props could not be resolved from source', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
      'Ghost/Ghost.doc.mjs': `
        export const docs = {
          name: 'Ghost',
          props: [{name: 'boo', type: 'string', description: 'No GhostProps in source'}],
        };
      `,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    const report = out.error.join('\n');
    expect(report).toMatch(
      /could not resolve the public props of 1 documented entr/,
    );
    expect(report).toMatch(/Ghost\s+\(.*Ghost\.doc\.mjs\)/);
    expect(out.log).toEqual([]);
  });

  it('reports unresolved entries in the same run as undocumented props, not only on the pass path', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
      'Ghost/Ghost.doc.mjs': `
        export const docs = {
          name: 'Ghost',
          props: [{name: 'boo', type: 'string', description: 'No GhostProps in source'}],
        };
      `,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    const report = out.error.join('\n');
    expect(report).toMatch(/Widget\.width/);
    expect(report).toMatch(
      /could not resolve the public props of 1 documented entr/,
    );
  });

  it('returns 0 with the checked count when every documented entry resolved', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(0);
    expect(out.log).toEqual([
      '\u2713 check:contract \u2014 1 doc(s) checked, 0 undocumented public props',
    ]);
    expect(out.error).toEqual([]);
  });

  it('returns 1 and names the file and reason when a doc cannot be loaded', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.doc.mjs': `export const docs = {`,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    const report = out.error.join('\n');
    expect(report).toMatch(/could not load 1 doc file\(s\)/);
    expect(report).toMatch(/Widget\.doc\.mjs\n\s+\S/);
    expect(report).toMatch(/A broken doc is not skipped/);
    expect(out.log).toEqual([]);
  });
});

describe('checkContract — inheritance and file-walk edges', () => {
  it('requires onClick when the component interface redeclares it over BaseProps', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          /** Component-owned: part of the documented contract. */
          onClick?: () => void;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing).toEqual([
      expect.objectContaining({component: 'Widget', prop: 'onClick'}),
    ]);
  });

  it('follows Omit<ParentProps>: IconButton still requires label and href, not the omitted props nor BaseProps passthrough', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Button/Button.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface ButtonProps extends BaseProps {
          label: string;
          href?: string;
          isIconOnly?: boolean;
          children?: unknown;
        }
      `,
      'IconButton/IconButton.tsx': `
        import type {ButtonProps} from '../Button/Button';
        export interface IconButtonProps extends Omit<ButtonProps, 'isIconOnly' | 'children'> {
          icon: unknown;
        }
      `,
      'IconButton/IconButton.doc.mjs': `
        export const docs = {
          name: 'IconButton',
          props: [{name: 'icon', type: 'unknown', description: 'Glyph'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['href', 'label']);
  });

  it('does not require attributes inherited from @types/react (HTMLAttributes)', async () => {
    const src = fixture({
      'node_modules/@types/react/index.d.ts': `
        export interface HTMLAttributes<T> {
          id?: string;
          role?: string;
          'aria-label'?: string;
          onKeyDown?: (event: T) => void;
        }
      `,
      'Widget/Widget.tsx': `
        import type {HTMLAttributes} from 'react';
        export interface WidgetProps extends HTMLAttributes<unknown> {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('derives props from a generic {Name}Props, interface or alias', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps<T> extends BaseProps {
          value: T;
          onChange?: (next: T) => void;
        }
      `,
      'Gadget/Gadget.tsx': `
        export type GadgetProps<T = string> = {
          items: T[];
          label: string;
        };
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'value', type: 'T', description: 'Current value'}],
        };
      `,
      'Gadget/Gadget.doc.mjs': `
        export const docs = {
          name: 'Gadget',
          props: [{name: 'items', type: 'T[]', description: 'Rows'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Gadget.label',
      'Widget.onChange',
    ]);
  });

  it('ignores a {Name}Props declared under __tests__/ (unresolved, not a leaked contract)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/__tests__/Widget.tsx': `
        export interface WidgetProps { leakedFromTestDir: string }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(missing).toEqual([]);
    expect(unresolved).toEqual([
      expect.objectContaining({component: 'Widget'}),
    ]);
    // Not trusted, and not silently passed either.
    await expect(run(src, {log: () => {}, error: () => {}})).resolves.toBe(1);
  });

  it('reports a doc whose import fails at runtime and still checks the other docs', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Broken/Broken.tsx': `export interface BrokenProps { a: string }`,
      'Broken/Broken.doc.mjs': `
        import {shared} from './shared-examples.mjs';
        export const docs = {name: 'Broken', props: shared};
      `,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {unreadable, missing} = await checkContract(src);
    expect(unreadable).toEqual([
      expect.objectContaining({
        file: expect.stringContaining('Broken.doc.mjs'),
        reason: expect.stringContaining('shared-examples'),
      }),
    ]);
    expect(missing).toEqual([
      expect.objectContaining({component: 'Widget', prop: 'width'}),
    ]);
  });

  it('requires declaration-less props from a key-remapped mapped type (they are component API)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        type Phase = 'open' | 'close';
        export type WidgetProps = BaseProps & {
          [K in Phase as \`on\${Capitalize<K>}\`]?: () => void;
        } & {label: string};
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => m.prop)).toEqual(['onClose', 'onOpen']);
  });
});

describe('checkContract — shared and aliased prop bags', () => {
  it('checks a component whose props come from a shared generic bag with no {Name}Props of its own', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Indicator/types.ts': `
        import type {BaseProps} from '../BaseProps';
        export interface IndicatorProps<F extends 'single' | 'multi' = 'single'>
          extends BaseProps {
          state: F extends 'multi' ? 'on' | 'off' | 'mixed' : 'on' | 'off';
          size?: 'sm' | 'md';
          isDisabled?: boolean;
        }
      `,
      'Indicator/CheckboxIndicator.tsx': `
        import type {IndicatorProps} from './types';
        export function CheckboxIndicator({state}: IndicatorProps<'multi'>) {
          return null;
        }
      `,
      'Indicator/Indicator.doc.mjs': `
        export const docs = {
          name: 'Indicator',
          components: [
            {
              name: 'CheckboxIndicator',
              props: [{name: 'state', type: 'string', description: 'Which state to draw'}],
            },
          ],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'CheckboxIndicator.isDisabled',
      'CheckboxIndicator.size',
    ]);
  });

  it('follows an export alias so a re-exported component is checked against the props it really takes', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'DropdownMenu/DropdownMenuItem.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface DropdownMenuItemProps extends BaseProps {
          label: string;
          icon?: string;
        }
        export function DropdownMenuItem(props: DropdownMenuItemProps) {
          return null;
        }
      `,
      'ContextMenu/index.ts': `
        export {
          DropdownMenuItem as ContextMenuItem,
          type DropdownMenuItemProps as ContextMenuItemProps,
        } from '../DropdownMenu/DropdownMenuItem';
      `,
      'ContextMenu/ContextMenuItem.doc.mjs': `
        export const docs = {
          name: 'ContextMenuItem',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'ContextMenuItem.icon',
    ]);
  });

  it('requires the props of every overload, not just the first', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Resizable/useResizable.ts': `
        export interface SingleConfig { defaultSize?: number }
        export interface MultiConfig { regions: string[] }
        export function useResizable(config: SingleConfig): number;
        export function useResizable(config: MultiConfig): number;
        export function useResizable(config: SingleConfig | MultiConfig): number {
          return 0;
        }
      `,
      'Resizable/useResizable.doc.mjs': `
        export const docs = {
          name: 'useResizable',
          props: [{name: 'defaultSize', type: 'number', description: 'Initial size'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useResizable.regions',
    ]);
  });

  it('resolves a zero-parameter hook to an empty contract instead of leaving it unresolved', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'AlertDialog/useImperativeAlertDialog.ts': `
        export function useImperativeAlertDialog(): {show: () => void} {
          return {show: () => {}};
        }
      `,
      'AlertDialog/useImperativeAlertDialog.doc.mjs': `
        export const docs = {
          name: 'useImperativeAlertDialog',
          props: [{name: 'title', type: 'string', description: 'Documented show() option'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('prefers the exported component in the doc directory when the name collides', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Other/Widget.tsx': `
        export function Widget(props: {fromOtherDir: string}) {
          return null;
        }
      `,
      'Widget/Widget.tsx': `
        export function Widget(props: {fromWidgetDir: string}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => m.prop)).toEqual(['fromWidgetDir']);
  });

  it('picks the same colliding export under any directory read order', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Beta/Widget.tsx': `
        export function Widget(props: {fromBeta: string}) {
          return null;
        }
      `,
      'Alpha/Widget.tsx': `
        export function Widget(props: {fromAlpha: string}) {
          return null;
        }
      `,
      'Zeta/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    const natural = fs.readdirSync.bind(fs);
    const reversed = (dir, opts) => {
      const entries = natural(dir, opts);
      return String(dir).startsWith(src) ? [...entries].reverse() : entries;
    };
    const spy = vi.spyOn(fs, 'readdirSync');
    try {
      for (const walkOrder of [natural, reversed]) {
        spy.mockImplementation(walkOrder);
        const {missing} = await checkContract(src);
        expect(missing.map(m => m.prop)).toEqual(['fromAlpha']);
      }
    } finally {
      spy.mockRestore();
    }
  });

  it('prefers a declared {Name}Props over the exported signature when both exist', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          fromDeclaration: string;
        }
        export function Widget(props: {fromSignature: string}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => m.prop)).toEqual(['fromDeclaration']);
  });
});

// These tests pin real core identifiers by name. A rename of any of them
// must land here too: packages/core/src/BaseProps.ts; Indicator/types.ts
// `IndicatorProps` and the three indicator entries in Indicator.doc.mjs;
// DropdownMenu/DropdownMenuItem.tsx `DropdownMenuItemProps` and the
// ContextMenu re-export; Dialog/Dialog.tsx `DialogProps` behind
// useImperativeDialog; Resizable/useResizable.ts `UseResizableMultiConfig`;
// Code/Code.tsx `CodeProps` documented from CodeBlock/Code.doc.mjs; and the
// Table/ plugin hook docs.
describe('checkContract — real components, not fixtures', () => {
  const REPO_ROOT = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
  );
  const CORE_SRC = path.join(REPO_ROOT, 'packages/core/src');

  /**
   * Real core sources copied into a scratch tree at their own relative paths,
   * with the repo's node_modules linked in so `react` resolves exactly as it
   * does for the real gate.
   */
  function realFixture(relPaths) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-contract-real-'));
    tmpDirs.push(dir);
    // 'junction' needs no privilege on Windows and is a plain symlink elsewhere.
    fs.symlinkSync(
      path.join(REPO_ROOT, 'node_modules'),
      path.join(dir, 'node_modules'),
      'junction',
    );
    for (const rel of relPaths) {
      const dest = path.join(dir, rel);
      fs.mkdirSync(path.dirname(dest), {recursive: true});
      fs.cpSync(path.join(CORE_SRC, rel), dest, {recursive: true});
    }
    return dir;
  }

  /** Add a member to a real interface — "a new public member on that shared contract". */
  function addMemberTo(file, interfaceName, member) {
    const source = fs.readFileSync(file, 'utf8');
    const at = source.indexOf(`export interface ${interfaceName}`);
    expect(
      at,
      `export interface ${interfaceName} not found in ${path.relative(REPO_ROOT, file)}`,
    ).toBeGreaterThan(-1);
    const open = source.indexOf('{', at);
    expect(open).toBeGreaterThan(at);
    fs.writeFileSync(
      file,
      `${source.slice(0, open + 1)}\n  ${member}\n${source.slice(open + 1)}`,
    );
  }

  it('resolves the real indicator family through its shared IndicatorProps', async () => {
    const {unresolved} = await checkContract(path.join(CORE_SRC, 'Indicator'));
    // CheckboxIndicator / CheckIndicator / RadioIndicator declare no
    // {Name}Props of their own — they take IndicatorProps<F>. Whether the
    // live docs are complete is the gate's verdict, not this suite's.
    expect(unresolved).toEqual([]);
  });

  it('reports a new member of the real shared IndicatorProps against every indicator that documents it', async () => {
    const src = realFixture(['BaseProps.ts', 'Indicator']);
    addMemberTo(
      path.join(src, 'Indicator/types.ts'),
      'IndicatorProps',
      'brandNewSharedProp?: string;',
    );
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'CheckboxIndicator.brandNewSharedProp',
      'CheckIndicator.brandNewSharedProp',
      'RadioIndicator.brandNewSharedProp',
    ]);
  });

  it('resolves the real ContextMenuItem through its re-exported prop alias', async () => {
    const {unresolved} = await checkContract(
      path.join(CORE_SRC, 'ContextMenu'),
    );
    // ContextMenuItem is DropdownMenuItem re-exported; the only
    // `ContextMenuItemProps` is an alias, never a declaration.
    expect(unresolved).toEqual([]);
  });

  it('reports a new member of the real aliased DropdownMenuItemProps against ContextMenuItem', async () => {
    const src = realFixture([
      'BaseProps.ts',
      'DropdownMenu/DropdownMenuItem.tsx',
      'ContextMenu/index.ts',
      'ContextMenu/ContextMenuItem.doc.mjs',
    ]);
    addMemberTo(
      path.join(src, 'DropdownMenu/DropdownMenuItem.tsx'),
      'DropdownMenuItemProps',
      'brandNewAliasedProp?: string;',
    );
    const {missing} = await checkContract(src);
    expect(
      missing.filter(m => m.component === 'ContextMenuItem').map(m => m.prop),
    ).toContain('brandNewAliasedProp');
  });

  it('reports a new DialogProps member against the real useImperativeDialog through its Omit<DialogProps> option bag', async () => {
    const src = realFixture(['BaseProps.ts', 'Dialog']);
    addMemberTo(
      path.join(src, 'Dialog/Dialog.tsx'),
      'DialogProps',
      'brandNewDialogProp?: string;',
    );
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    const reported = missing.map(m => `${m.component}.${m.prop}`);
    expect(reported).toContain('Dialog.brandNewDialogProp');
    expect(reported).toContain('useImperativeDialog.brandNewDialogProp');
  });

  it('reports a new member of the real second useResizable overload, not only the first', async () => {
    const src = realFixture(['BaseProps.ts', 'Resizable']);
    addMemberTo(
      path.join(src, 'Resizable/useResizable.ts'),
      'UseResizableMultiConfig',
      'brandNewMultiProp?: string;',
    );
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(
      missing.filter(m => m.component === 'useResizable').map(m => m.prop),
    ).toContain('brandNewMultiProp');
  });

  it('checks the real Code doc that lives in CodeBlock/ against CodeProps declared in Code/', async () => {
    const src = realFixture(['BaseProps.ts', 'Code', 'CodeBlock/Code.doc.mjs']);
    addMemberTo(
      path.join(src, 'Code/Code.tsx'),
      'CodeProps',
      'brandNewCodeProp?: string;',
    );
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(
      missing.filter(m => m.component === 'Code').map(m => m.prop),
    ).toContain('brandNewCodeProp');
  });

  it('resolves every real Table plugin hook through its Config parameter; a Record parameter yields an empty contract', async () => {
    const {missing, unresolved} = await checkContract(
      path.join(CORE_SRC, 'Table'),
    );
    // Every use* doc under Table/ carries props[] and none declares a
    // {Name}Props: all of them resolve off the exported signature.
    expect(unresolved).toEqual([]);
    // useTableFilterState(initialState?: Record<string, …>) has no named
    // member to require; an empty contract there is genuine, not vacuous.
    expect(missing.filter(m => m.component === 'useTableFilterState')).toEqual(
      [],
    );
  });
});

describe('checkContract — which bag wins', () => {
  /** Run `check` on the scan under natural AND reversed readdir order. */
  async function underBothReadOrders(src, check) {
    const natural = fs.readdirSync.bind(fs);
    const reversed = (dir, opts) => {
      const entries = natural(dir, opts);
      return String(dir).startsWith(src) ? [...entries].reverse() : entries;
    };
    const spy = vi.spyOn(fs, 'readdirSync');
    try {
      for (const walkOrder of [natural, reversed]) {
        spy.mockImplementation(walkOrder);
        check(await checkContract(src));
      }
    } finally {
      spy.mockRestore();
    }
  }

  it('treats only an exported {Name}Props as the contract; a file-private one defers to the exported signature', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        /** Internal scratch type, not the public contract. */
        interface WidgetProps extends BaseProps {
          internalOnly: string;
        }
        export interface WidgetPublicProps extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
        export function Widget(props: WidgetPublicProps) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.size',
    ]);
  });

  it('ignores a {Name}Props nested in a namespace or a function body', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Other/helpers.ts': `
        export function make() {
          interface WidgetProps { localOnly: string }
          const x: WidgetProps = {localOnly: ''};
          return x;
        }
      `,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export namespace Legacy {
          export interface WidgetProps extends BaseProps {
            legacyOnly: string;
          }
        }
        export interface Props extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
        export function Widget(props: Props) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.size',
    ]);
  });

  it('prefers the exported {Name} signature in the doc directory over a {Name}Props declared elsewhere', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Other/legacy.ts': `
        export interface WidgetProps {
          alien: string;
        }
      `,
      'Widget/Widget.tsx': `
        export function Widget(props: {a: string}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual(['Widget.a']);
  });

  it('picks the shallowest {Name}Props under the doc directory, under any read order', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/internal/Widget.tsx': `
        export interface WidgetProps {internalImpl: string}
      `,
      'Widget/Widget.tsx': `
        export interface WidgetProps {label: string; size?: string}
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    await underBothReadOrders(src, ({missing}) => {
      expect(missing.map(m => m.prop)).toEqual(['size']);
    });
  });

  it('picks the same foreign {Name}Props under any read order when none is in the doc directory', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Beta/b.ts': `export interface WidgetProps {fromBeta: string}`,
      'Alpha/a.ts': `export interface WidgetProps {fromAlpha: string}`,
      'Zeta/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    await underBothReadOrders(src, ({missing}) => {
      expect(missing.map(m => m.prop)).toEqual(['fromAlpha']);
    });
  });

  it('prefers the shallower exported {Name} over a nested internal copy of the same name', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/internal/Widget.tsx': `
        export function Widget(props: {internalImpl: string}) {
          return null;
        }
      `,
      'Widget/Widget.tsx': `
        export function Widget(props: {label: string; size?: string}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    await underBothReadOrders(src, ({missing}) => {
      expect(missing.map(m => m.prop)).toEqual(['size']);
    });
  });

  it('is not fooled by a file-private {Name}Props beside the exported one (the TableRow / BaseTable shape)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Table/BaseTable.tsx': `
        interface TableRowProps<T> {
          item: T;
          columns: string[];
        }
        function InternalRow<T>({item, columns}: TableRowProps<T>) {
          return null;
        }
        export function BaseTable() {
          return InternalRow({item: 1, columns: []});
        }
      `,
      'Table/TableRow.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface TableRowProps extends BaseProps {
          isHeaderRow?: boolean;
        }
        export function TableRow(props: TableRowProps) {
          return null;
        }
      `,
      'Table/TableRow.doc.mjs': `
        export const docs = {
          name: 'TableRow',
          props: [{name: 'isHeaderRow', type: 'boolean', description: 'Header row'}],
        };
      `,
    });
    await underBothReadOrders(src, ({missing, unresolved}) => {
      expect(unresolved).toEqual([]);
      expect(missing).toEqual([]);
    });
  });

  it('checks a doc outside its component directory against the exported {Name}Props, not a private decoy (the CodeBlock / Code shape)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Alpha/Alpha.tsx': `
        interface CodeProps {
          decoy: string;
        }
        function Inner({decoy}: CodeProps) {
          return null;
        }
        export function Alpha() {
          return Inner({decoy: 'x'});
        }
      `,
      'Code/Code.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface CodeProps extends BaseProps {
          children: string;
          size?: 'sm' | 'md';
        }
        export function Code(props: CodeProps) {
          return null;
        }
      `,
      'CodeBlock/Code.doc.mjs': `
        export const docs = {
          name: 'Code',
          props: [{name: 'children', type: 'string', description: 'Source text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual(['Code.size']);
  });
});

describe('checkContract — parameter shapes the signature route must read', () => {
  it('resolves a class component through its construct signature (props is the constructor parameter)', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'node_modules/@types/react/index.d.ts': `
        export type ReactNode = unknown;
        export class Component<P = {}, S = {}> {
          constructor(props: P);
          props: Readonly<P>;
          state: Readonly<S>;
          render(): ReactNode;
        }
      `,
      'Widget/Widget.tsx': `
        import {Component} from 'react';
        import type {BaseProps} from '../BaseProps';
        interface Opts extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
        export class Widget extends Component<Opts, {open: boolean}> {
          state = {open: false};
          render() {
            return null;
          }
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.size',
    ]);
  });

  it('reads the elements of a rest tuple, never the tuple itself', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        interface WidgetOptions { size?: number; label?: string }
        export function Widget(...args: [WidgetOptions]) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {name: 'Widget', props: []};
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['label', 'size']);
  });

  it('reads every bag parameter of a hook, so `useThing(id, options)` and `useThing(callback, options)` reach options', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Keyed/useKeyed.ts': `
        interface KeyedOptions { size?: number; label?: string }
        export function useKeyed(id: string, options: KeyedOptions) {
          return 0;
        }
      `,
      'Keyed/useKeyed.doc.mjs': `
        export const docs = {
          name: 'useKeyed',
          props: [{name: 'size', type: 'number', description: 'Documented option'}],
        };
      `,
      'Debounced/useDebounced.ts': `
        interface DebounceOptions { wait: number; leading?: boolean }
        export function useDebounced(fn: () => void, options: DebounceOptions) {
          return 0;
        }
      `,
      'Debounced/useDebounced.doc.mjs': `
        export const docs = {name: 'useDebounced', props: []};
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useDebounced.leading',
      'useDebounced.wait',
      'useKeyed.label',
    ]);
  });

  it('reads a constrained type parameter as its constraint', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        interface SharedProps extends BaseProps { alpha: string; beta?: number }
        export function Widget<P extends SharedProps>(props: P) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'alpha', type: 'string', description: 'Documented'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['beta']);
  });

  it('skips a union of primitives and treats a union of unconstrained generics as underivable', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Keyed/useKeyed.ts': `
        interface Opts { label?: string }
        export function useKeyed(id: string | number, options: Opts) {
          return 0;
        }
      `,
      'Keyed/useKeyed.doc.mjs': `export const docs = {name: 'useKeyed', props: []};`,
      'Free/Free.tsx': `
        export function Free<P, Q>(props: P | Q) {
          return null;
        }
      `,
      'Free/Free.doc.mjs': `export const docs = {name: 'Free', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved.map(u => u.component)).toEqual(['Free']);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useKeyed.label',
    ]);
  });

  it('leaves a bag typed any / unknown / unconstrained generic unresolved: nothing can be read off it', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Loose/Loose.tsx': `export function Loose(props: any) { return null; }`,
      'Loose/Loose.doc.mjs': `export const docs = {name: 'Loose', props: [{name: 'label'}]};`,
      'Opaque/Opaque.tsx': `export function Opaque(props: unknown) { return null; }`,
      'Opaque/Opaque.doc.mjs': `export const docs = {name: 'Opaque', props: [{name: 'label'}]};`,
      'Free/Free.tsx': `export function Free<P>(props: P) { return null; }`,
      'Free/Free.doc.mjs': `export const docs = {name: 'Free', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(missing).toEqual([]);
    expect(unresolved.map(u => u.component)).toEqual([
      'Free',
      'Loose',
      'Opaque',
    ]);
    await expect(run(src, {log: () => {}, error: () => {}})).resolves.toBe(1);
  });
});

describe('checkContract — doc loading edges', () => {
  it('checks the `docs` export the CLI serves, not a differing default export', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
        export default {
          name: 'Widget',
          props: [
            {name: 'label', type: 'string', description: 'Visible text'},
            {name: 'width', type: 'string', description: 'Only the default lists width'},
          ],
        };
      `,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.width',
    ]);
  });

  it('reports a doc that publishes props[] without a name instead of skipping it', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          props: [{name: 'label', type: 'string', description: 'Visible text'}],
        };
      `,
    });
    const {unreadable} = await checkContract(src);
    expect(unreadable).toEqual([
      expect.objectContaining({
        file: expect.stringContaining('Widget.doc.mjs'),
        reason: expect.stringMatching(/name/),
      }),
    ]);
    await expect(run(src, {log: () => {}, error: () => {}})).resolves.toBe(1);
  });
});

describe('checkContract — what counts as platform surface', () => {
  it('requires the props of a third-party component re-exported under a core name; node_modules is not platform surface', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'node_modules/some-lib/package.json': `{"name":"some-lib","types":"index.d.ts"}`,
      'node_modules/some-lib/index.d.ts': `
        export interface ThirdPartyProps {
          spec: object;
          renderer?: 'svg' | 'canvas';
          onNewView?: () => void;
        }
        export function ThirdParty(props: ThirdPartyProps): null;
      `,
      'Chart/index.ts': `export {ThirdParty as Chart} from 'some-lib';`,
      'Chart/Chart.doc.mjs': `
        export const docs = {name: 'Chart', props: [{name: 'spec'}]};
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['onNewView', 'renderer']);
  });
});

describe('run — the program itself is checked before any verdict', () => {
  const REACT_DEPENDENT_TREE = {
    'BaseProps.ts': `
      import type React from 'react';
      export interface BaseProps<T extends HTMLElement = HTMLElement>
        extends Omit<React.HTMLAttributes<T>, 'title' | 'children'> {
        xstyle?: unknown;
      }
    `,
    'Button/Button.tsx': `
      import type {BaseProps} from '../BaseProps';
      export interface ButtonProps extends BaseProps<HTMLButtonElement> {
        label: string;
        width?: string;
      }
    `,
    'IconButton/IconButton.tsx': `
      import type {ButtonProps} from '../Button/Button';
      export interface IconButtonProps extends Omit<ButtonProps, 'label'> {
        icon: string;
      }
    `,
    'IconButton/IconButton.doc.mjs': `
      export const docs = {name: 'IconButton', props: [{name: 'icon'}]};
    `,
  };
  const REACT_STUB = `
    export interface HTMLAttributes<T> {
      id?: string;
      role?: string;
      title?: string;
      children?: unknown;
      onKeyDown?: (event: T) => void;
    }
  `;

  it('fails when a source imports react and the program cannot resolve it — an Omit over BaseProps would collapse to nothing', async () => {
    const src = fixture(REACT_DEPENDENT_TREE);
    const errors = [];
    await expect(
      run(src, {log: () => {}, error: line => errors.push(line)}),
    ).resolves.toBe(1);
    expect(errors.join('\n')).toMatch(/'react'.*could not be resolved/);
  });

  it('catches the prop behind that Omit once react resolves', async () => {
    const src = fixture({
      ...REACT_DEPENDENT_TREE,
      'node_modules/@types/react/index.d.ts': REACT_STUB,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'IconButton.width',
    ]);
  });
});

describe('checkContract — declaration forms the signature route reads', () => {
  it('reads the props through memo(), forwardRef() and a React.FC annotation, not only a bare function', async () => {
    const react = `
      export type ReactNode = unknown;
      export interface HTMLAttributes<T> { id?: string; role?: string }
      export interface FC<P> { (props: P): ReactNode; displayName?: string }
      export interface ForwardRefExoticComponent<P> { (props: P): ReactNode; displayName?: string }
      export interface NamedExoticComponent<P> { (props: P): ReactNode; displayName?: string }
      export type PropsWithoutRef<P> = P extends any ? ('ref' extends keyof P ? Omit<P, 'ref'> : P) : P;
      export interface RefAttributes<T> { ref?: T }
      export function forwardRef<T, P = {}>(
        render: (props: P, ref: T) => ReactNode,
      ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;
      export function memo<P extends object>(c: (props: P) => ReactNode): NamedExoticComponent<P>;
    `;
    const doc = name => `
      export const docs = {
        name: '${name}',
        props: [{name: 'label', type: 'string', description: 'Visible text'}],
      };
    `;
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'node_modules/@types/react/index.d.ts': react,
      'Opts.ts': `
        import type {BaseProps} from './BaseProps';
        export interface Opts extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
      `,
      'Memoed/Memoed.tsx': `
        import {memo} from 'react';
        import type {Opts} from '../Opts';
        export const Memoed = memo(function Memoed(props: Opts) {
          return null;
        });
      `,
      'Memoed/Memoed.doc.mjs': doc('Memoed'),
      'Forwarded/Forwarded.tsx': `
        import {forwardRef} from 'react';
        import type {Opts} from '../Opts';
        export const Forwarded = forwardRef<HTMLDivElement, Opts>(
          function Forwarded(props, ref) {
            return null;
          },
        );
      `,
      'Forwarded/Forwarded.doc.mjs': doc('Forwarded'),
      'Typed/Typed.tsx': `
        import type {FC} from 'react';
        import type {Opts} from '../Opts';
        export const Typed: FC<Opts> = props => null;
      `,
      'Typed/Typed.doc.mjs': doc('Typed'),
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Forwarded.size',
      'Memoed.size',
      'Typed.size',
    ]);
  });

  it('reads an arrow const, a generic function, and a function exported on a later line', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Opts.ts': `
        import type {BaseProps} from './BaseProps';
        export interface Opts extends BaseProps { label: string; size?: 'sm' | 'md' }
      `,
      'Arrow/Arrow.tsx': `
        import type {Opts} from '../Opts';
        export const Arrow = (props: Opts) => null;
      `,
      'Arrow/Arrow.doc.mjs': `export const docs = {name: 'Arrow', props: [{name: 'label'}]};`,
      'Generic/Generic.tsx': `
        import type {Opts} from '../Opts';
        export function Generic<T>(props: Opts & {items: T[]}) {
          return null;
        }
      `,
      'Generic/Generic.doc.mjs': `export const docs = {name: 'Generic', props: [{name: 'label'}, {name: 'items'}]};`,
      'Later/Later.tsx': `
        import type {Opts} from '../Opts';
        function Later(props: Opts) {
          return null;
        }
        export {Later};
      `,
      'Later/Later.doc.mjs': `export const docs = {name: 'Later', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Arrow.size',
      'Generic.size',
      'Later.size',
    ]);
  });

  it('follows `export {default as X}` to a default-exported function, and leaves a bare default unresolved', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        interface Opts extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
        export default function Widget(props: Opts) {
          return null;
        }
      `,
      'Widget/index.ts': `export {default as Widget} from './Widget';`,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: [{name: 'label'}]};`,
      'Orphan/Orphan.tsx': `
        export default function Orphan(props: {label: string}) {
          return null;
        }
      `,
      'Orphan/Orphan.doc.mjs': `export const docs = {name: 'Orphan', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved.map(u => u.component)).toEqual(['Orphan']);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.size',
    ]);
  });

  it('resolves through a chain of `export *` barrels and through an alias of an alias', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Menu/MenuItem.tsx': `
        import type {BaseProps} from '../BaseProps';
        interface Opts extends BaseProps {
          label: string;
          size?: 'sm' | 'md';
        }
        export function MenuItem(props: Opts) {
          return null;
        }
      `,
      'Menu/index.ts': `export * from './MenuItem';`,
      'ContextMenu/index.ts': `export * from '../Menu';`,
      'index.ts': `export * from './ContextMenu';`,
      'ContextMenu/MenuItem.doc.mjs': `export const docs = {name: 'MenuItem', props: [{name: 'label'}]};`,
      'Renamed/index.ts': `export {MenuItem as Renamed} from '../Menu';`,
      'Twice/index.ts': `export {Renamed as Twice} from '../Renamed';`,
      'Twice/Twice.doc.mjs': `export const docs = {name: 'Twice', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'MenuItem.size',
      'Twice.size',
    ]);
  });

  it('leaves a type-only alias with no value export unresolved: a Props name alone is not a component', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        export interface WidgetProps {label: string}
        export function Widget(props: WidgetProps) {
          return null;
        }
      `,
      'Alias/index.ts': `export type {WidgetProps as AliasProps} from '../Widget/Widget';`,
      'Alias/Alias.doc.mjs': `export const docs = {name: 'Alias', props: [{name: 'label'}]};`,
    });
    const {unresolved} = await checkContract(src);
    expect(unresolved.map(u => u.component)).toEqual(['Alias']);
  });
});

describe('checkContract — parameter forms the signature route reads', () => {
  it('reaches the bag through a destructured default and through an optional parameter', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        interface Opts { size?: number; label?: string }
        export function Widget({size = 1, ...rest}: Opts = {}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: []};`,
      'Dialog/useImperativeDialog.ts': `
        interface DialogOptions { title?: string; width?: number }
        export function useImperativeDialog(defaultOptions?: DialogOptions) {
          return 0;
        }
      `,
      'Dialog/useImperativeDialog.doc.mjs': `export const docs = {name: 'useImperativeDialog', props: [{name: 'title'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useImperativeDialog.width',
      'Widget.label',
      'Widget.size',
    ]);
  });

  it('sees through Readonly / Partial / Omit / Pick on a parameter and still drops BaseProps passthrough', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        interface SharedProps extends BaseProps { alpha: string; beta?: number; gamma?: boolean }
        export function Widget(props: Readonly<Partial<Omit<SharedProps, 'gamma'>>>) {
          return null;
        }
        export function WidgetSlim(props: Pick<SharedProps, 'alpha' | 'onClick'>) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [],
          components: [{name: 'WidgetSlim', props: []}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.alpha',
      'Widget.beta',
      'WidgetSlim.alpha',
    ]);
  });

  it('walks the object member of a union with primitives and does not invent String members', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Input/useInput.ts': `
        interface Opts { value: string; onChange?: () => void }
        export function useInput(input: Opts | string | null) {
          return 0;
        }
      `,
      'Input/useInput.doc.mjs': `export const docs = {name: 'useInput', props: [{name: 'value'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useInput.onChange',
    ]);
  });

  it('resolves an index-signature-only bag to an empty contract, not to unresolved', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Filter/useFilterState.ts': `
        export function useFilterState(initial?: Record<string, unknown>) {
          return 0;
        }
      `,
      'Filter/useFilterState.doc.mjs': `export const docs = {name: 'useFilterState', props: [{name: 'anything'}]};`,
      'Map/useMapState.ts': `
        export function useMapState(initial: {[key: string]: unknown}) {
          return 0;
        }
      `,
      'Map/useMapState.doc.mjs': `export const docs = {name: 'useMapState', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('follows Parameters<typeof Other>[0] and ComponentProps<typeof Other>, dropping RefAttributes from @types/react', async () => {
    const src = fixture({
      'node_modules/@types/react/index.d.ts': `
        export interface RefAttributes<T> { ref?: T }
        export type ComponentProps<T> = T extends (props: infer P) => any ? P : never;
      `,
      'BaseProps.ts': BASE_PROPS,
      'Widget/Other.tsx': `
        export function Other(props: {fromOther: string; extra?: number}) {
          return null;
        }
      `,
      'Widget/Widget.tsx': `
        import type {ComponentProps, RefAttributes} from 'react';
        import {Other} from './Other';
        export function Widget(props: Parameters<typeof Other>[0]) {
          return null;
        }
        export function WidgetAlt(props: ComponentProps<typeof Other> & RefAttributes<HTMLDivElement>) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `
        export const docs = {
          name: 'Widget',
          props: [{name: 'fromOther'}],
          components: [{name: 'WidgetAlt', props: [{name: 'fromOther'}]}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.extra',
      'WidgetAlt.extra',
    ]);
  });

  it('resolves a bare callback parameter to an empty contract but requires members declared on a callable', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Effect/useEffectOnce.ts': `
        export function useEffectOnce(effect: () => void) {
          return 0;
        }
      `,
      'Effect/useEffectOnce.doc.mjs': `export const docs = {name: 'useEffectOnce', props: []};`,
      'Tagged/useTagged.ts': `
        export function useTagged(handler: (() => void) & {displayLabel: string}) {
          return 0;
        }
      `,
      'Tagged/useTagged.doc.mjs': `export const docs = {name: 'useTagged', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'useTagged.displayLabel',
    ]);
  });
});

describe('checkContract — platform passthrough through the signature route', () => {
  it('lets a component whose whole bag is HTMLAttributes pass with nothing documented — every member is platform', async () => {
    const src = fixture({
      'node_modules/@types/react/index.d.ts': `
        export interface HTMLAttributes<T> { id?: string; role?: string; title?: string }
      `,
      'Box/Box.tsx': `
        import type {HTMLAttributes} from 'react';
        export function Box(props: HTMLAttributes<HTMLDivElement>) {
          return null;
        }
      `,
      'Box/Box.doc.mjs': `export const docs = {name: 'Box', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing).toEqual([]);
  });

  it('filters per prop, not per type: a node_modules bag intersected with a local literal keeps the local prop', async () => {
    const src = fixture({
      'node_modules/@types/react/index.d.ts': `
        export interface HTMLAttributes<T> { id?: string; role?: string }
      `,
      'Box/Box.tsx': `
        import type {HTMLAttributes} from 'react';
        export function Box(props: HTMLAttributes<HTMLDivElement> & {local: string}) {
          return null;
        }
      `,
      'Box/Box.doc.mjs': `export const docs = {name: 'Box', props: []};`,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => m.prop)).toEqual(['local']);
  });

  it('skips ref / className / style redeclared on a shared bag and @types/react Attributes.key', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'node_modules/@types/react/index.d.ts': `
        export interface Attributes { key?: string | number | null }
      `,
      'Shared/types.ts': `
        import type {BaseProps} from '../BaseProps';
        import type {Attributes} from 'react';
        export interface SharedProps extends BaseProps, Attributes {
          label: string;
          ref?: unknown;
          className?: string;
          style?: unknown;
        }
      `,
      'Widget/Widget.tsx': `
        import type {SharedProps} from '../Shared/types';
        export function Widget(props: SharedProps) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['label']);
  });

  it('requires onClick redeclared over Omit<BaseProps, "onClick">, and skips __internal members', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export function Widget(props: Omit<BaseProps, 'onClick'> & {onClick?: () => void; __internal?: string}) {
          return null;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: []};`,
    });
    const {missing} = await checkContract(src);
    expect(missing.map(m => m.prop)).toEqual(['onClick']);
  });

  it('resolves `(props: {})` to an empty contract; documented extras are allowed', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Spacer/Spacer.tsx': `
        export function Spacer(props: {}) {
          return null;
        }
      `,
      'Spacer/Spacer.doc.mjs': `export const docs = {name: 'Spacer', props: [{name: 'gap'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing).toEqual([]);
  });
});

describe('run — report shape', () => {
  function capture() {
    const out = {log: [], error: []};
    return {
      out,
      io: {
        log: line => out.log.push(line),
        error: line => out.error.push(line),
      },
    };
  }

  it('prints every section — unreadable, then unresolved, then undocumented — in one failing run', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Broken/Broken.doc.mjs': `export const docs = {`,
      'Ghost/Ghost.doc.mjs': `export const docs = {name: 'Ghost', props: [{name: 'boo'}]};`,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends BaseProps {
          label: string;
          width?: string;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: [{name: 'label'}]};`,
    });
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    const report = out.error.join('\n');
    const at = pattern => {
      const index = report.search(pattern);
      expect(index, String(pattern)).toBeGreaterThan(-1);
      return index;
    };
    const unreadable = at(/could not load 1 doc file\(s\)/);
    const unresolved = at(
      /could not resolve the public props of 1 documented entry:/,
    );
    const missing = at(/found 1 undocumented public prop\(s\)/);
    expect(unreadable).toBeLessThan(unresolved);
    expect(unresolved).toBeLessThan(missing);
    expect(report).toMatch(/Broken\.doc\.mjs\n\s+\S/);
    expect(report).toMatch(/Ghost\s+\(.*Ghost\.doc\.mjs\)/);
    expect(report).toMatch(/Widget\.width\s+\(.*Widget\.doc\.mjs\)/);
    expect(out.log).toEqual([]);
  });

  it('lists the same unresolved name once per doc file that claims it, in file order, and pluralises', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'B/Ghost.doc.mjs': `export const docs = {name: 'Ghost', props: [{name: 'boo'}]};`,
      'A/Ghost.doc.mjs': `export const docs = {name: 'Ghost', props: [{name: 'boo'}]};`,
    });
    const {unresolved} = await checkContract(src);
    expect(unresolved.map(u => path.relative(src, u.file))).toEqual([
      'A/Ghost.doc.mjs',
      'B/Ghost.doc.mjs',
    ]);
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    expect(out.error.join('\n')).toMatch(/of 2 documented entries:/);
  });

  it('fails a use* doc that publishes props[] with no source at all; hooks are not exempt from fail-closed', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Thing/useThing.doc.mjs': `export const docs = {name: 'useThing', props: [{name: 'option'}]};`,
    });
    const {unresolved} = await checkContract(src);
    expect(unresolved.map(u => u.component)).toEqual(['useThing']);
    const {out, io} = capture();
    await expect(run(src, io)).resolves.toBe(1);
    expect(out.log).toEqual([]);
  });

  it('does not partially match a dotted components[] name like Menu.Item', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Menu/MenuItem.tsx': `
        export function MenuItem(props: {label: string}) {
          return null;
        }
      `,
      'Menu/Menu.doc.mjs': `
        export const docs = {
          name: 'Menu',
          components: [{name: 'Menu.Item', props: [{name: 'label'}]}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(missing).toEqual([]);
    expect(unresolved.map(u => u.component)).toEqual(['Menu.Item']);
  });

  it('checks a components[] entry with props: [] and leaves a name-only sibling to its own doc', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Layout/Layout.tsx': `
        export function Panel(props: {title: string}) {
          return null;
        }
        export function Rail(props: {width: number}) {
          return null;
        }
      `,
      'Layout/Layout.doc.mjs': `
        export const docs = {
          name: 'Layout',
          components: [{name: 'Panel', props: []}, {name: 'Rail'}],
        };
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Panel.title',
    ]);
  });
});

describe('checkContract — review round: fail-closed holes the skeptics found', () => {
  it('runs a declared {Name}Props through the same bag test as a signature: any / unknown / object are unresolved, a primitive alias falls through', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Any/Any.tsx': `
        export type AnyProps = any;
        export function Any(props: {label: string}) { return null; }
      `,
      'Any/Any.doc.mjs': `export const docs = {name: 'Any', props: []};`,
      'Unk/Unk.tsx': `
        export type UnkProps = unknown;
        export function Unk(props: {label: string}) { return null; }
      `,
      'Unk/Unk.doc.mjs': `export const docs = {name: 'Unk', props: []};`,
      'Obj/Obj.tsx': `
        export function Obj(props: object) { return null; }
      `,
      'Obj/Obj.doc.mjs': `export const docs = {name: 'Obj', props: [{name: 'label'}]};`,
      'Str/Str.tsx': `
        export type StrProps = string;
        export function Str(props: {label: string}) { return null; }
      `,
      'Str/Str.doc.mjs': `export const docs = {name: 'Str', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    // A primitive alias is not a bag: the exported signature is the next
    // candidate. An any / unknown alias is underivable: nothing can be read
    // off it, and the signature beside it must not paper over that.
    expect(unresolved.map(u => u.component)).toEqual(['Any', 'Obj', 'Unk']);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual(['Str.label']);
  });

  it('reads a type parameter constrained to a union per member, so a variant-only prop is still required', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Slider/Slider.tsx': `
        import type {BaseProps} from '../BaseProps';
        interface SingleProps extends BaseProps { value: number; onChange?: () => void }
        interface RangeProps extends BaseProps { values: number[]; minStepsBetweenThumbs?: number }
        export function Slider<P extends SingleProps | RangeProps>(props: P) {
          return null;
        }
      `,
      'Slider/Slider.doc.mjs': `
        export const docs = {name: 'Slider', props: [{name: 'value'}, {name: 'values'}]};
      `,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual([
      'minStepsBetweenThumbs',
      'onChange',
    ]);
  });

  it('does not let `export *` of a same-named type turn a file-private {Name}Props into the contract', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Other/helpers.ts': `export interface WidgetProps {fromHelpers: string}`,
      'Widget/Widget.tsx': `
        export * from '../Other/helpers';
        interface WidgetProps { privateOnly: string }
        const scratch: WidgetProps = {privateOnly: ''};
        export function Widget(props: {label: string; size?: string}) {
          return scratch ? null : null;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: [{name: 'label'}]};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['size']);
  });

  it('treats a react that resolves to untyped JavaScript (no @types/react) as unresolvable', async () => {
    const src = fixture({
      'node_modules/react/package.json': `{"name":"react","main":"index.js"}`,
      'node_modules/react/index.js': `module.exports = {};`,
      'BaseProps.ts': `
        import type React from 'react';
        export interface BaseProps<T extends HTMLElement = HTMLElement>
          extends Omit<React.HTMLAttributes<T>, 'title'> {
          xstyle?: unknown;
        }
      `,
      'Widget/Widget.tsx': `
        import type {BaseProps} from '../BaseProps';
        export interface WidgetProps extends Omit<BaseProps, 'xstyle'> {
          label: string;
        }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: []};`,
    });
    const errors = [];
    await expect(
      run(src, {log: () => {}, error: line => errors.push(line)}),
    ).resolves.toBe(1);
    expect(errors.join('\n')).toMatch(/'react'.*could not be resolved/);
  });

  it('reports a malformed doc shape as unreadable and keeps scanning, instead of throwing', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'NumName/NumName.doc.mjs': `export const docs = {name: 42, props: []};`,
      'NullProp/NullProp.doc.mjs': `export const docs = {name: 'NullProp', props: [null, {name: 'a'}]};`,
      'BadComponents/BadComponents.doc.mjs': `export const docs = {name: 'BadComponents', components: 'nope'};`,
      'NullEntry/NullEntry.doc.mjs': `export const docs = {name: 'NullEntry', components: [null, {name: 7, props: []}]};`,
      'Widget/Widget.tsx': `
        export interface WidgetProps { label: string; width?: string }
      `,
      'Widget/Widget.doc.mjs': `export const docs = {name: 'Widget', props: [{name: 'label'}]};`,
    });
    const {missing, unreadable} = await checkContract(src);
    expect(unreadable.map(u => path.basename(u.file))).toEqual([
      'BadComponents.doc.mjs',
      'NullEntry.doc.mjs',
      'NullProp.doc.mjs',
      'NumName.doc.mjs',
    ]);
    for (const {reason} of unreadable)
      expect(reason).toMatch(/name|props|components/);
    expect(missing.map(m => `${m.component}.${m.prop}`)).toEqual([
      'Widget.width',
    ]);
  });

  it('does not read tuple or array members as props when the parameter is not a rest parameter', async () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Pair/usePair.ts': `
        interface Opts { label?: string }
        export function usePair(pair: [Opts, number], list: string[], options: Opts) {
          return 0;
        }
      `,
      'Pair/usePair.doc.mjs': `export const docs = {name: 'usePair', props: []};`,
    });
    const {missing, unresolved} = await checkContract(src);
    expect(unresolved).toEqual([]);
    expect(missing.map(m => m.prop)).toEqual(['label']);
  });
});

describe('createResolver — which route answered', () => {
  it('reports the route and file behind each resolved entry, and null for none', () => {
    const src = fixture({
      'BaseProps.ts': BASE_PROPS,
      'Widget/Widget.tsx': `
        export interface WidgetProps { label: string }
        export function Widget(props: WidgetProps) { return null; }
      `,
      'Hook/useHook.ts': `
        export function useHook(options: {wait: number}) { return 0; }
      `,
    });
    const {program, checker} = buildProgram(
      ['BaseProps.ts', 'Widget/Widget.tsx', 'Hook/useHook.ts'].map(file =>
        path.join(src, file),
      ),
    );
    const resolve = createResolver(program, checker);

    const widget = resolve('Widget', path.join(src, 'Widget'));
    expect(widget.route).toBe('declaration');
    expect(path.relative(src, widget.file)).toBe('Widget/Widget.tsx');
    expect([...widget.props]).toEqual(['label']);

    const hook = resolve('useHook', path.join(src, 'Hook'));
    expect(hook.route).toBe('signature');
    expect([...hook.props]).toEqual(['wait']);

    expect(resolve('Ghost', src)).toBeNull();
  });
});
