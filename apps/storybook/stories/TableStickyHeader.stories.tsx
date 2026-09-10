// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {
  Table,
  useTableStickyHeader,
  useTableStickyColumns,
  pixel,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';

// =============================================================================
// Sample Data — tall enough to require vertical scroll, wide enough for the
// composition story to also scroll sideways.
// =============================================================================

interface Reading extends Record<string, unknown> {
  id: string;
  sensor: string;
  site: string;
  reading: string;
  threshold: string;
  drift: string;
  calibrated: string;
  owner: string;
}

const SITES = ['Bay', 'Ridge', 'Harbor', 'Mesa'];
const OWNERS = ['A. Nguyen', 'B. Martinez', 'C. Okafor', 'D. Silva'];

const readings: Reading[] = Array.from({length: 40}, (_, index) => ({
  id: String(index + 1),
  sensor: `SNR-${String(index + 1).padStart(3, '0')}`,
  site: SITES[index % SITES.length],
  reading: `${(18 + (index % 9) * 1.4).toFixed(1)} °C`,
  threshold: `${(24 + (index % 4)).toFixed(1)} °C`,
  drift: `${((index % 7) * 0.13).toFixed(2)}`,
  calibrated: `2026-0${(index % 9) + 1}-1${index % 10}`,
  owner: OWNERS[index % OWNERS.length],
}));

const columns: TableColumn<Reading>[] = [
  {key: 'sensor', header: 'Sensor', width: pixel(140)},
  {key: 'site', header: 'Site', width: pixel(120)},
  {key: 'reading', header: 'Reading', width: pixel(120)},
  {key: 'threshold', header: 'Threshold', width: pixel(120)},
  {key: 'drift', header: 'Drift', width: pixel(100)},
  {key: 'calibrated', header: 'Calibrated', width: pixel(160)},
  {key: 'owner', header: 'Owner', width: pixel(160)},
];

// =============================================================================
// Stories
// =============================================================================

const meta: Meta = {
  title: 'Core/TableStickyHeader',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const note = {
  marginBottom: 8,
  fontSize: 14,
  color: 'var(--color-text-secondary)',
} as const;

/**
 * Cap the scroll container and the header stays put. Scroll the table
 * vertically — the column headings hold at the top while rows pass under them.
 */
export const PinHeader: Story = {
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({maxHeight: 320});
    return (
      <div>
        <p style={note}>
          <code>maxHeight: 320</code> — scroll the table to see the header hold
          at the top.
        </p>
        <Table
          data={readings}
          columns={columns}
          idKey="id"
          plugins={{stickyHeader}}
        />
      </div>
    );
  },
};

/**
 * `maxHeight` also takes any CSS length, for a table sized against the
 * viewport rather than a fixed pixel count.
 */
export const ViewportHeight: Story = {
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({maxHeight: '50vh'});
    return (
      <div>
        <p style={note}>
          <code>maxHeight: '50vh'</code>
        </p>
        <Table
          data={readings}
          columns={columns}
          idKey="id"
          plugins={{stickyHeader}}
        />
      </div>
    );
  },
};

/**
 * Both plugins together. Scroll in either direction: the header holds at the
 * top, the `Sensor` column holds at the start edge, and the corner where they
 * cross stays above both runs rather than being overdrawn by either.
 */
export const WithStickyColumns: Story = {
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>({maxHeight: 320});
    const stickyColumns = useTableStickyColumns<Reading>({
      startKeys: ['sensor'],
    });
    return (
      <div style={{maxWidth: 640}}>
        <p style={note}>
          Scroll down and right — the corner cell stays pinned on both axes.
        </p>
        <Table
          data={readings}
          columns={columns}
          idKey="id"
          plugins={{stickyHeader, stickyColumns}}
        />
      </div>
    );
  },
};

/**
 * Without `maxHeight` the plugin pins the header but adds no height cap, for
 * tables whose height an ancestor already bounds. Here the wrapper supplies it.
 */
export const HeightFromAncestor: Story = {
  render: () => {
    const stickyHeader = useTableStickyHeader<Reading>();
    return (
      <div style={{display: 'flex', flexDirection: 'column', height: 320}}>
        <p style={note}>
          No <code>maxHeight</code> — the surrounding 320px flex column bounds
          the table instead.
        </p>
        <div style={{flex: 1, minHeight: 0, display: 'flex'}}>
          <Table
            data={readings}
            columns={columns}
            idKey="id"
            plugins={{stickyHeader}}
          />
        </div>
      </div>
    );
  },
};
