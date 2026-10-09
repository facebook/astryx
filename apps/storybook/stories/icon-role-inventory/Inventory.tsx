// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file One generated role/state review surface using the real private Icon seam.
 * @input Discovered owner slots, nearest selected theme/mode and an explicit glyph probe
 * @output Visual rows with source, default/final size, state precedence and resolved axes
 * @position Storybook-only review component; not a component enrollment or authority record
 */
import {Theme, useTheme} from '@astryxdesign/core/theme';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {IconProps} from '@astryxdesign/core/Icon';
import {
  getComponentIconName,
  getComponentIconState,
} from '@astryxdesign/core/Icon';
import {getComponentIconRole} from '../../../../packages/core/src/Icon/componentIconRoles';
import {renderComponentIconSlot} from '../../../../packages/core/src/Icon/componentIconSlot';
import {
  resolveIconWithContext,
  type IconAxisInspection,
} from '../../../../packages/core/src/Icon/iconResolution';
import {useThemeDefinition} from '../../../../packages/core/src/theme/useTheme';
import type {DefinedTheme} from '../../../../packages/core/src/theme/defineTheme';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';

export interface InventorySlot {
  slot: string;
  states: string[];
  owner: string;
  fixture: boolean;
  module?: string;
}

/** Enumeration is derived from every owner's finite states, never a per-role list. */
export function iconInventoryCases(slot: InventorySlot) {
  return [
    [],
    ...slot.states.map(state => [state]),
    ...(slot.states.length > 1 ? [slot.states] : []),
  ];
}

export function iconInventoryRow(
  slot: InventorySlot,
  active: string[],
  theme?: DefinedTheme,
  direct?: IconProps['icon'],
  size?: IconProps['size'],
) {
  const role = getComponentIconRole(slot.slot);
  if (
    slot.states.length &&
    (!role ||
      JSON.stringify([...role.states].sort()) !== JSON.stringify(slot.states))
  ) {
    throw new Error(
      `${slot.slot}: missing or mismatched runtime inventory coverage`,
    );
  }
  if (!slot.states.length && role) {
    throw new Error(`${slot.slot}: source-only slot unexpectedly participates`);
  }
  const state = role
    ? getComponentIconState(
        slot.slot as never,
        Object.fromEntries(active.map(state => [state, true])) as never,
      )
    : undefined;
  // check is deliberately a visible probe fallback, not a claim about owner artwork.
  const icon =
    direct ?? getComponentIconName(slot.slot as never, 'check', theme);
  const inspection =
    icon === null
      ? undefined
      : resolveIconWithContext(icon, {size}, theme, {
          slot: slot.slot,
          state,
          renderNode: false,
        }).inspection;
  return {slot, active, role, state, icon, inspection, size};
}

function axis(axis: IconAxisInspection | undefined) {
  if (!axis) {
    return 'suppressed';
  }
  const selected = axis.selected ?? 'source default';
  const requested =
    axis.requested === undefined ? '' : `; requested ${String(axis.requested)}`;
  return `${selected} (${axis.provenance}${axis.fallback ? '; fallback' : ''}${requested})`;
}
const styles = stylex.create({
  root: {
    padding: spacingVars['--spacing-4'],
    color: colorVars['--color-text-primary'],
  },
  scroll: {overflowX: 'auto'},
  table: {borderCollapse: 'collapse', width: '100%'},
  cell: {
    padding: spacingVars['--spacing-3'],
    textAlign: 'start',
    verticalAlign: 'middle',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

/** The synthetic theme changes policy, not the toolbar-selected color mode. */
export function InventoryTheme({
  theme,
  children,
  mode: selectedMode,
}: {
  theme: DefinedTheme;
  children: ReactNode;
  mode?: 'light' | 'dark';
}) {
  const {mode} = useTheme();
  return (
    <Theme theme={theme} mode={selectedMode ?? mode}>
      {children}
    </Theme>
  );
}

export function IconRoleInventory({
  slots,
  direct,
  size,
}: {
  slots: InventorySlot[];
  direct?: IconProps['icon'];
  size?: IconProps['size'];
}) {
  const theme = useThemeDefinition();
  const rows = slots.flatMap(slot =>
    iconInventoryCases(slot).map(active =>
      iconInventoryRow(slot, active, theme, direct, size),
    ),
  );
  return (
    <section
      {...stylex.props(styles.root)}
      aria-label="Generated icon role inventory"
      data-inventory-theme={theme?.name ?? 'base'}>
      <h2>Icon roles — {theme?.name ?? 'base tokens'}</h2>
      <p>
        Generated from owner declarations. Use the Theme and Mode toolbar to
        review the selected theme. Glyphs use the theme slot mapping with a
        shared check probe fallback, or the selected direct probe. This is an
        isolated role-policy review, not the component’s fallback artwork,
        layout, interaction, or visual approval.
      </p>
      <div {...stylex.props(styles.scroll)}>
        <table {...stylex.props(styles.table)}>
          <caption>
            {slots.length} slots · {rows.length} cases · no active condition,
            each finite state, then all conditions active
          </caption>
          <thead>
            <tr>
              {[
                'Owner / role',
                'Participation / precedence',
                'Active → effective',
                'Source mode',
                'Owner default → resolved size',
                'Appearance',
                'Weight',
                'Glyph',
              ].map(label => (
                <th key={label} scope="col" {...stylex.props(styles.cell)}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={`${row.slot.slot}:${row.active.join(',')}`}
                data-inventory-slot={row.slot.slot}
                data-inventory-case={row.active.join(',') || 'none'}
                data-inventory-state={row.state ?? 'none'}
                data-inventory-participating={Boolean(row.role)}
                data-inventory-size={row.inspection?.size.selected}
                data-inventory-dimension={row.inspection?.dimension}>
                <th scope="row" {...stylex.props(styles.cell)}>
                  {row.slot.slot}
                  <br />
                  <small>
                    {row.slot.fixture ? 'Synthetic fixture · ' : ''}
                    {row.slot.owner}
                  </small>
                </th>
                <td {...stylex.props(styles.cell)}>
                  {row.role
                    ? row.role.statePrecedence.join(' > ')
                    : 'Source-only · stateless / nonparticipating'}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {row.active.join(' + ') || 'none'} → {row.state ?? 'none'}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {row.icon === null
                    ? 'suppressed (null)'
                    : `${direct ? 'direct probe' : `mapped shared name: ${String(row.icon)}`} · ${row.inspection?.source.kind} / ${row.inspection?.source.provenance}`}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {row.role?.defaultSize ?? 'not role-owned'} →{' '}
                  {axis(row.inspection?.size)}
                  <br />
                  {row.inspection?.dimension ?? 'no box'}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {axis(row.inspection?.appearance)}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {axis(row.inspection?.weight)}
                </td>
                <td {...stylex.props(styles.cell)}>
                  {row.icon === null
                    ? 'No glyph'
                    : renderComponentIconSlot(
                        row.slot.slot as never,
                        row.icon,
                        {size},
                        row.state as never,
                      )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
