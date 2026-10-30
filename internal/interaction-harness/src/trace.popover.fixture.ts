// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file trace.popover.fixture.ts
 * @input A rendering trace recorded with `{invalidations: true}` while a
 *   Popover presented under a touch on a loaded machine (Chromium)
 * @output POPOVER_PRESENT_UNDER_LOAD: its Animation events, rendering events,
 *   style recalculations and script starts, ms from the present's start
 * @position Fixture for trace.test.ts
 *
 * The popover layer is trace node 6; its present runs two compositor
 * animations under the ids 0x25 and 0x26, and the dismissal's exit copy
 * (node 59) gets the same ids once they end. In the present's window
 * [150, 482] Chrome restyles the layer on its own (`Animation`), then its
 * `::backdrop` (`Conditional ::backdrop`), with one Layout and Paint and no
 * script since the previous pass.
 */

export const POPOVER_PRESENT_UNDER_LOAD = {
  window: [150, 482],
  animationEvents: [
    {
      name: 'Animation',
      ph: 'b',
      ts: -86600,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          name: '',
          nodeId: 6,
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'e',
      ts: -72600,
      id2: {
        local: '0x25',
      },
      args: {
        data: {},
      },
    },
    {
      name: 'Animation',
      ph: 'b',
      ts: -54100,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          name: '',
          nodeId: 6,
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'b',
      ts: -52800,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          name: '',
          nodeId: 6,
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: -1900,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          compositeFailed: 0,
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: -1900,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          compositeFailed: 0,
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 17400,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 17400,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'e',
      ts: 533600,
      id2: {
        local: '0x25',
      },
      args: {
        data: {},
      },
    },
    {
      name: 'Animation',
      ph: 'e',
      ts: 537900,
      id2: {
        local: '0x26',
      },
      args: {
        data: {},
      },
    },
    {
      name: 'Animation',
      ph: 'b',
      ts: 649200,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          name: '',
          nodeId: 59,
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'b',
      ts: 650200,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          name: '',
          nodeId: 59,
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 660900,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          compositeFailed: 0,
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 661000,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          compositeFailed: 0,
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 668300,
      id2: {
        local: '0x25',
      },
      args: {
        data: {
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'n',
      ts: 668300,
      id2: {
        local: '0x26',
      },
      args: {
        data: {
          state: 'running',
        },
      },
    },
    {
      name: 'Animation',
      ph: 'e',
      ts: 1202300,
      id2: {
        local: '0x25',
      },
      args: {
        data: {},
      },
    },
    {
      name: 'Animation',
      ph: 'e',
      ts: 1202400,
      id2: {
        local: '0x26',
      },
      args: {
        data: {},
      },
    },
  ],
  events: [
    {
      name: 'UpdateLayoutTree',
      t: 118.6,
    },
    {
      name: 'Layout',
      t: 119.6,
    },
    {
      name: 'UpdateLayoutTree',
      t: 120.1,
    },
    {
      name: 'Layout',
      t: 126,
    },
    {
      name: 'UpdateLayoutTree',
      t: 151,
    },
    {
      name: 'Layout',
      t: 151.6,
    },
    {
      name: 'UpdateLayoutTree',
      t: 159.3,
    },
    {
      name: 'Layout',
      t: 159.9,
    },
    {
      name: 'PrePaint',
      t: 160.4,
    },
    {
      name: 'Paint',
      t: 160.4,
    },
    {
      name: 'Paint',
      t: 160.5,
    },
    {
      name: 'Layerize',
      t: 160.5,
    },
  ],
  styleInvalidations: [
    {
      t: 118.6,
      reason: 'Animation',
      nodeId: 6,
    },
    {
      t: 120.1,
      reason: 'Conditional ::backdrop',
      nodeId: 6,
    },
    {
      t: 150.9,
      reason: 'Animation',
      nodeId: 6,
    },
    {
      t: 157.4,
      reason: 'Conditional ::backdrop',
      nodeId: 6,
    },
  ],
  scripts: [
    3.4, 3.5, 3.6, 6.7, 6.7, 13.8, 13.9, 13.9, 13.9, 14.1, 14.2, 14.3, 14.3, 72,
    72,
  ],
} as const;
