// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generated role cases rendered through shared Icon under selected themes.
 * @input The same discovery output and synthetic policy used by Storybook
 * @output Coverage, precedence, final size/weight, source-mode and stateless assertions
 * @position UI lane; semantic/markup proof, not screenshots or browser geometry
 */
import path from 'node:path';
import {
  beforeAll,
  beforeEach,
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import {render} from '../../../../internal/test-utils/src';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {discoverIconRoles} from '../../../../scripts/lib/icon-role-inventory.mjs';
import {
  InventoryTheme,
  IconRoleInventory,
  iconInventoryCases,
  iconInventoryRow,
  type InventorySlot,
} from './Inventory';
import {syntheticTheme, DirectProbe} from './artwork.fixture';
import './roles.fixture';

const root = path.resolve(import.meta.dirname, '../../../..');
const discovered = discoverIconRoles(root);
const slots = discovered.slots as InventorySlot[];
beforeAll(async () => {
  for (const module of new Set(
    slots.map(slot => slot.module).filter(Boolean),
  )) {
    await import(path.join(root, module!));
  }
});
const leading = slots.find(slot => slot.slot === 'inventory-probe-leading')!;
let warnings: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warnings = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  // Source theme injection is intentional in this Storybook-only fixture. Permit
  // exactly that known performance hint; any other warning still fails the lane.
  for (const call of warnings.mock.calls) {
    expect(call.join(' ')).toContain(
      'icon-inventory-synthetic-policy" is using runtime style injection',
    );
  }
  warnings.mockRestore();
});

describe('generated role inventory rendering', () => {
  it.each(['light', 'dark'] as const)(
    'preserves selected mode %s when the synthetic provider changes theme',
    mode => {
      const {container} = render(
        <Theme theme={syntheticTheme} mode={mode}>
          <InventoryTheme theme={syntheticTheme}>
            <IconRoleInventory slots={[leading]} />
          </InventoryTheme>
        </Theme>,
      );
      const providers = container.querySelectorAll(
        '[data-astryx-theme="icon-inventory-synthetic-policy"]',
      );
      expect(providers).toHaveLength(2);
      expect(providers[1].getAttribute('data-theme')).toBe(mode);
    },
  );
  it.each(['light', 'dark'] as const)(
    'preserves explicit toolbar mode %s with no parent Theme (base tokens)',
    mode => {
      const {container} = render(
        <InventoryTheme theme={syntheticTheme} mode={mode}>
          <IconRoleInventory slots={[leading]} />
        </InventoryTheme>,
      );
      expect(
        container
          .querySelector(
            '[data-astryx-theme="icon-inventory-synthetic-policy"]',
          )
          ?.getAttribute('data-theme'),
      ).toBe(mode);
    },
  );
  it('renders one-state and true slots without duplicate case keys', () => {
    expect(iconInventoryCases({...leading, states: ['busy']})).toEqual([
      [],
      ['busy'],
    ]);
    expect(iconInventoryCases({...leading, states: []})).toEqual([[]]);
  });
  it('renders every discovered slot and finite state without hand-maintained rows', () => {
    expect(discovered.errors).toEqual([]);
    const {container} = render(
      <Theme theme={syntheticTheme}>
        <IconRoleInventory slots={slots} />
      </Theme>,
    );
    for (const slot of slots) {
      const rows = container.querySelectorAll(
        `[data-inventory-slot="${slot.slot}"]`,
      );
      expect(rows).toHaveLength(
        1 + slot.states.length + (slot.states.length > 1 ? 1 : 0),
      );
      expect(
        container.querySelector(
          `[data-inventory-slot="${slot.slot}"][data-inventory-case="none"]`,
        ),
      ).not.toBeNull();
      if (slot.states.length > 1) {
        expect(
          container.querySelector(
            `[data-inventory-slot="${slot.slot}"][data-inventory-case="${slot.states.join(',')}"]`,
          ),
        ).not.toBeNull();
      }
      for (const state of slot.states) {
        expect(
          container.querySelector(
            `[data-inventory-slot="${slot.slot}"][data-inventory-case="${state}"]`,
          ),
        ).not.toBeNull();
      }
    }
    expect(
      container
        .querySelector('[data-inventory-theme]')
        ?.getAttribute('data-inventory-theme'),
    ).toBe(syntheticTheme.name);
  });
  it('shows precedence, final role size and bySize weight without state weight', () => {
    const all = iconInventoryRow(leading, ['selected', 'busy'], syntheticTheme);
    expect(all.state).toBe('busy');
    expect(all.role?.statePrecedence).toEqual(['busy', 'selected']);
    expect(all.role?.defaultSize).toBe('sm');
    expect(all.inspection?.size.selected).toBe('inventoryRoomy');
    expect(all.inspection?.dimension).toBe('30px');
    expect(all.inspection?.appearance.selected).toBe('outline');
    expect(all.inspection?.weight.requested).toBe(600);
    const selected = iconInventoryRow(leading, ['selected'], syntheticTheme);
    expect(selected.inspection?.weight.requested).toBe(
      all.inspection?.weight.requested,
    );
    expect(selected.inspection?.appearance.selected).toBe('filled');
  });
  it('renders the same resolved size and selected artwork as its row metadata', () => {
    const {container} = render(
      <Theme theme={syntheticTheme}>
        <IconRoleInventory slots={[leading]} />
      </Theme>,
    );
    const row = container.querySelector('[data-inventory-case="selected"]')!;
    expect(row.getAttribute('data-inventory-size')).toBe('inventoryRoomy');
    expect(row.querySelector('.astryx-icon')?.getAttribute('data-size')).toBe(
      'inventoryRoomy',
    );
    expect(
      row.querySelector('[data-inventory-artwork="heavy"]'),
    ).not.toBeNull();
  });
  it('keeps both true-slot forms visibly stateless/nonparticipating', () => {
    for (const slot of slots.filter(slot => !slot.states.length)) {
      const row = iconInventoryRow(slot, ['selected'], syntheticTheme);
      expect(row.role).toBeUndefined();
      expect(row.state).toBeUndefined();
      expect(row.inspection?.size.selected).toBe('md');
    }
  });
  it('reflects theme switching, keyed null clearing, explicit size and source modes', () => {
    const clear = defineTheme({
      name: 'inventory-cleared',
      extends: syntheticTheme,
      componentIcons: {'inventory-probe-leading': null},
      iconCapabilities: {roleSizeOverrides: {'inventory-probe-leading': null}},
    });
    expect(
      iconInventoryRow(leading, [], syntheticTheme).inspection?.source.kind,
    ).toBe('adaptive');
    expect(iconInventoryRow(leading, [], clear).icon).toBeNull();
    const direct = iconInventoryRow(
      leading,
      ['busy'],
      clear,
      DirectProbe,
      'lg',
    );
    expect(direct.inspection?.source.kind).toBe('ordinary-direct');
    expect(direct.inspection?.size.selected).toBe('lg');
    expect(direct.inspection?.appearance.fallback).toBe(true);
    const plain = defineTheme({name: 'inventory-plain'});
    expect(iconInventoryRow(leading, [], plain).inspection?.source.kind).toBe(
      'fixed',
    );
    expect(iconInventoryRow(leading, [], plain).inspection?.size.selected).toBe(
      'sm',
    );
  });
  it('fails rather than showing an unregistered or mismatched role as a true slot', () => {
    expect(() =>
      iconInventoryRow(
        {...leading, slot: 'missing-owner-role'},
        [],
        syntheticTheme,
      ),
    ).toThrow(/coverage/);
    expect(() =>
      iconInventoryRow({...leading, states: ['invented']}, [], syntheticTheme),
    ).toThrow(/coverage/);
    expect(() =>
      iconInventoryRow({...leading, states: []}, [], syntheticTheme),
    ).toThrow(/unexpectedly participates/);
  });
});
