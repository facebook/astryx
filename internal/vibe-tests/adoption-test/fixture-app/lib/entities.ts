/**
 * Data access for the console. Components read through these helpers; nothing
 * fetches inline. There is no provider and no cache — calls hit the API route
 * directly and the caller holds the result in local state.
 */

import type {RunStatus} from './status';

export type Run = {
  id: string;
  service: string;
  env: string;
  status: RunStatus;
  startedAt: string;
  durationMs: number;
  buildId: string;
  ticketId: string | null;
};

export type Build = {
  id: string;
  title: string;
  author: string;
  status: RunStatus;
  branch: string;
  landedAt: string | null;
};

export type Ticket = {
  id: string;
  title: string;
  assignee: string;
  state: 'open' | 'in_progress' | 'closed';
  priority: 'p0' | 'p1' | 'p2' | 'p3';
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, {headers: {accept: 'application/json'}});
  if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
  return (await res.json()) as T;
}

export function fetchRuns(env: string): Promise<Run[]> {
  return get<Run[]>(`/api/runs?env=${encodeURIComponent(env)}`);
}

export function fetchBuild(id: string): Promise<Build> {
  return get<Build>(`/api/builds/${encodeURIComponent(id)}`);
}

export function fetchTicket(id: string): Promise<Ticket> {
  return get<Ticket>(`/api/tickets/${encodeURIComponent(id)}`);
}

export const ENVIRONMENTS = [
  {id: 'prod', label: 'Production', description: 'Live traffic, all regions'},
  {id: 'staging', label: 'Staging', description: 'Pre-release verification'},
  {id: 'canary', label: 'Canary', description: '1% of production traffic'},
  {id: 'dev', label: 'Development', description: 'Unstable, rebuilt hourly'},
];
