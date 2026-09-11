// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {Table, useTableStickyHeader} from '@astryxdesign/core/Table';

interface Deploy extends Record<string, unknown> {
  id: string;
  service: string;
  version: string;
  environment: string;
  status: string;
  duration: string;
  finished: string;
}

// More rows than the height cap can show, so the body actually scrolls and
// there is something for the header to hold still against.
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
    service: 'checkout-api',
    version: 'v4.11.3',
    environment: 'staging',
    status: 'Succeeded',
    duration: '3m 58s',
    finished: '2026-09-11 08:02',
  },
  {
    id: '3',
    service: 'search-indexer',
    version: 'v2.7.1',
    environment: 'production',
    status: 'Rolled back',
    duration: '6m 30s',
    finished: '2026-09-10 22:15',
  },
  {
    id: '4',
    service: 'billing-worker',
    version: 'v1.19.4',
    environment: 'production',
    status: 'Succeeded',
    duration: '2m 44s',
    finished: '2026-09-10 19:50',
  },
  {
    id: '5',
    service: 'notifications',
    version: 'v3.0.0',
    environment: 'staging',
    status: 'Failed',
    duration: '1m 09s',
    finished: '2026-09-10 17:23',
  },
  {
    id: '6',
    service: 'search-indexer',
    version: 'v2.7.0',
    environment: 'staging',
    status: 'Succeeded',
    duration: '6m 02s',
    finished: '2026-09-10 15:11',
  },
  {
    id: '7',
    service: 'identity',
    version: 'v8.4.2',
    environment: 'production',
    status: 'Succeeded',
    duration: '5m 17s',
    finished: '2026-09-10 12:48',
  },
  {
    id: '8',
    service: 'billing-worker',
    version: 'v1.19.3',
    environment: 'staging',
    status: 'Succeeded',
    duration: '2m 51s',
    finished: '2026-09-10 10:05',
  },
  {
    id: '9',
    service: 'checkout-api',
    version: 'v4.11.2',
    environment: 'production',
    status: 'Succeeded',
    duration: '4m 05s',
    finished: '2026-09-09 21:37',
  },
  {
    id: '10',
    service: 'media-transcode',
    version: 'v0.9.8',
    environment: 'staging',
    status: 'Failed',
    duration: '0m 47s',
    finished: '2026-09-09 18:20',
  },
  {
    id: '11',
    service: 'identity',
    version: 'v8.4.1',
    environment: 'staging',
    status: 'Succeeded',
    duration: '5m 33s',
    finished: '2026-09-09 14:59',
  },
  {
    id: '12',
    service: 'notifications',
    version: 'v2.14.6',
    environment: 'production',
    status: 'Succeeded',
    duration: '1m 22s',
    finished: '2026-09-09 11:16',
  },
  {
    id: '13',
    service: 'media-transcode',
    version: 'v0.9.7',
    environment: 'production',
    status: 'Rolled back',
    duration: '3m 40s',
    finished: '2026-09-08 23:04',
  },
  {
    id: '14',
    service: 'search-indexer',
    version: 'v2.6.9',
    environment: 'production',
    status: 'Succeeded',
    duration: '5m 55s',
    finished: '2026-09-08 20:31',
  },
];

const columns = [
  {key: 'service', header: 'Service'},
  {key: 'version', header: 'Version'},
  {key: 'environment', header: 'Environment'},
  {key: 'status', header: 'Status'},
  {key: 'duration', header: 'Duration'},
  {key: 'finished', header: 'Finished'},
];

export default function StickyHeaderHookUsage() {
  // maxHeight is what makes this work. The header pins to the scrollport the
  // table owns, and without a cap that container grows to fit all 14 rows and
  // never scrolls — the page scrolls instead, and the header has no scrollport
  // to pin inside. Pass a cap here, or let an ancestor bound the height and
  // omit it.
  const stickyHeader = useTableStickyHeader<Deploy>({maxHeight: 320});

  return (
    <Table
      data={deploys}
      columns={columns}
      idKey="id"
      hasHover
      plugins={{stickyHeader}}
    />
  );
}
