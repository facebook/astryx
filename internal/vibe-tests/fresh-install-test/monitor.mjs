#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file monitor.mjs
 * @output prints a `PING …` line whenever a NEW scoreboard data point is
 *         recorded or all agent runs go idle.
 * @position internal/vibe-tests/fresh-install-test — status watcher
 *
 * Lightweight status watcher (not a system cron — nothing to clean up). Launch
 * it in the background with the Shell tool's `notify_on_output` set to the
 * pattern "PING", so the agent is notified on each completion and can relay it.
 * It seeds already-recorded points silently, then pings only on NEW ones.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const SB = path.join(dir, 'results', 'scoreboard.json');
const INTERVAL = 45_000;
const MAX = 6 * 3600 * 1000;
const start = Date.now();

const seen = new Set();
let first = true;
let zeros = 0;
let sawRunning = false;

const agents = () => {
  try {
    return parseInt(execSync('pgrep -f cursor-agent | wc -l', {encoding: 'utf8'}).trim(), 10) || 0;
  } catch {
    return 0;
  }
};

const pointCount = () => {
  try {
    return (JSON.parse(fs.readFileSync(SB, 'utf8')).points || []).length;
  } catch {
    return 0;
  }
};

function tick() {
  try {
    const b = JSON.parse(fs.readFileSync(SB, 'utf8'));
    for (const p of b.points || []) {
      const k = `${p.label}|${p.model}`;
      if (!seen.has(k)) {
        seen.add(k);
        if (!first) console.log(`PING point | ${p.label} · ${p.model} · core=${p.core}% cli=${p.cli}% init=${p.init}% (n=${p.n})`);
      }
    }
  } catch {
    /* scoreboard not ready */
  }
  first = false;

  const a = agents();
  if (a > 0) sawRunning = true;
  zeros = a === 0 ? zeros + 1 : 0;
  if (sawRunning && zeros === 2) {
    console.log('PING idle | all matrix/agent runs finished (0 cursor-agents active)');
    sawRunning = false;
  }

  if (Date.now() - start > MAX) {
    console.log('PING monitor exiting (max lifetime reached)');
    process.exit(0);
  }
}

console.log(`monitor started (poll ${INTERVAL / 1000}s) — seeded ${pointCount()} existing points silently; reports new points + idle`);
tick();
setInterval(tick, INTERVAL);
