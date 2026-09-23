// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {
  Table,
  useTableStickyColumns,
  useTableStickyHeader,
  pixel,
} from '@astryxdesign/core/Table';

interface Deploy extends Record<string, unknown> {
  id: string;
  service: string;
  version: string;
  environment: string;
  status: string;
  duration: string;
  finished: string;
}

const deploys: Deploy[] = [
  {
    id: '1',
    service: 'checkout-api',
    version: 'v4.12.0',
    environment: 'production',
    status: 'Succeeded',
    duration: '4m 12s',
    finished: '2026-09-11 09:41',
  },
  {
    id: '2',
    service: 'search-indexer',
    version: 'v2.7.1',
    environment: 'production',
    status: 'Rolled back',
    duration: '6m 30s',
    finished: '2026-09-10 22:15',
  },
  {
    id: '3',
    service: 'billing-worker',
    version: 'v1.19.4',
    environment: 'production',
    status: 'Succeeded',
    duration: '2m 44s',
    finished: '2026-09-10 19:50',
  },
  {
    id: '4',
    service: 'notifications',
    version: 'v3.0.0',
    environment: 'staging',
    status: 'Failed',
    duration: '1m 09s',
    finished: '2026-09-10 17:23',
  },
  {
    id: '5',
    service: 'identity',
    version: 'v8.4.2',
    environment: 'production',
    status: 'Succeeded',
    duration: '5m 17s',
    finished: '2026-09-10 12:48',
  },
  {
    id: '6',
    service: 'checkout-api',
    version: 'v4.11.2',
    environment: 'production',
    status: 'Succeeded',
    duration: '4m 05s',
    finished: '2026-09-09 21:37',
  },
  {
    id: '7',
    service: 'media-transcode',
    version: 'v0.9.8',
    environment: 'staging',
    status: 'Failed',
    duration: '0m 47s',
    finished: '2026-09-09 18:20',
  },
  {
    id: '8',
    service: 'identity',
    version: 'v8.4.1',
    environment: 'staging',
    status: 'Succeeded',
    duration: '5m 33s',
    finished: '2026-09-09 14:59',
  },
  {
    id: '9',
    service: 'media-transcode',
    version: 'v0.9.7',
    environment: 'production',
    status: 'Rolled back',
    duration: '3m 40s',
    finished: '2026-09-08 23:04',
  },
  {
    id: '10',
    service: 'search-indexer',
    version: 'v2.6.9',
    environment: 'production',
    status: 'Succeeded',
    duration: '5m 55s',
    finished: '2026-09-08 20:31',
  },
];

// Fixed widths that add up to more than the container below, so the table
// scrolls sideways as well as down and both plugins have something to do.
const columns = [
  {key: 'service', header: 'Service', width: pixel(180)},
  {key: 'version', header: 'Version', width: pixel(120)},
  {key: 'environment', header: 'Environment', width: pixel(140)},
  {key: 'status', header: 'Status', width: pixel(130)},
  {key: 'duration', header: 'Duration', width: pixel(120)},
  {key: 'finished', header: 'Finished', width: pixel(170)},
];

export default function StickyHeaderWithColumnsHookUsage() {
  const stickyHeader = useTableStickyHeader<Deploy>({maxHeight: 280});
  const stickyColumns = useTableStickyColumns<Deploy>({startKeys: ['service']});

  return (
    <div style={{width: 560, maxWidth: '100%'}}>
      {/* Scroll in either direction: the header holds at the top, Service holds
          at the start edge, and the corner cell where they cross stays above
          both runs instead of being overdrawn by whichever plugin painted
          last. Listing order does not matter. */}
      <Table
        data={deploys}
        columns={columns}
        idKey="id"
        hasHover
        plugins={{stickyHeader, stickyColumns}}
      />
    </div>
  );
}
