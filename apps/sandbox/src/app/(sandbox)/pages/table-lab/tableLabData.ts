// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file tableLabData.ts
 * @input Row count
 * @output Deterministic synthetic dataset + column defs for the Table Lab
 * @position Table Lab tool; generates stress-test data
 */

import type {TableColumn} from '@astryxdesign/core/Table';
import {pixel, proportional} from '@astryxdesign/core/Table';

export interface LabRow extends Record<string, unknown> {
  id: string;
  name: string;
  email: string;
  team: string;
  role: string;
  status: 'Active' | 'Away' | 'Offline';
  commits: number;
  reviews: number;
  score: number;
  joined: string;
}

const TEAMS = [
  'Core',
  'Infra',
  'Design',
  'Growth',
  'Data',
  'Mobile',
  'Web',
  'ML',
];
const ROLES = [
  'Engineer',
  'Senior Eng',
  'Staff Eng',
  'Manager',
  'Designer',
  'PM',
];
const STATUSES: LabRow['status'][] = ['Active', 'Away', 'Offline'];
const FIRST = [
  'Ava',
  'Liam',
  'Noah',
  'Emma',
  'Kai',
  'Zoe',
  'Max',
  'Mia',
  'Leo',
  'Ivy',
  'Sam',
  'Ada',
  'Rio',
  'Ben',
  'Uma',
];
const LAST = [
  'Chen',
  'Park',
  'Silva',
  'Kim',
  'Ross',
  'Vega',
  'Nash',
  'Wolf',
  'Cole',
  'Dune',
  'Fox',
  'Hale',
  'Reed',
  'Vale',
  'Ono',
];

/** Small deterministic PRNG so re-renders keep stable data. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRows(count: number): LabRow[] {
  const rand = mulberry32(1337);
  const rows: LabRow[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[Math.floor(rand() * FIRST.length)];
    const last = LAST[Math.floor(rand() * LAST.length)];
    const name = `${first} ${last}`;
    rows.push({
      id: `row-${i}`,
      name,
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@astryx.dev`,
      team: TEAMS[Math.floor(rand() * TEAMS.length)],
      role: ROLES[Math.floor(rand() * ROLES.length)],
      status: STATUSES[Math.floor(rand() * STATUSES.length)],
      commits: Math.floor(rand() * 2000),
      reviews: Math.floor(rand() * 500),
      score: Math.round(rand() * 1000) / 10,
      joined: `20${String(18 + Math.floor(rand() * 7)).padStart(2, '0')}-${String(1 + Math.floor(rand() * 12)).padStart(2, '0')}`,
    });
  }
  return rows;
}

export const labColumns: TableColumn<LabRow>[] = [
  {key: 'name', header: 'Name', width: proportional(2), sortable: true},
  {key: 'email', header: 'Email', width: proportional(2), sortable: true},
  {key: 'team', header: 'Team', width: pixel(110), sortable: true},
  {key: 'role', header: 'Role', width: pixel(130), sortable: true},
  {key: 'status', header: 'Status', width: pixel(110), sortable: true},
  {
    key: 'commits',
    header: 'Commits',
    width: pixel(100),
    align: 'end',
    sortable: true,
  },
  {
    key: 'reviews',
    header: 'Reviews',
    width: pixel(100),
    align: 'end',
    sortable: true,
  },
  {
    key: 'score',
    header: 'Score',
    width: pixel(90),
    align: 'end',
    sortable: true,
  },
  {key: 'joined', header: 'Joined', width: pixel(100), sortable: true},
];
