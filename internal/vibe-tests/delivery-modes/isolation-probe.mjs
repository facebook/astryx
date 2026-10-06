// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global process, setTimeout */

import {spawnSync} from 'node:child_process';
import * as fs from 'node:fs';
import * as http from 'node:http';
import * as path from 'node:path';

const fsp = fs.promises;
const input = JSON.parse(
  await fsp.readFile(
    path.join(process.cwd(), '.isolation-probe-input.json'),
    'utf8',
  ),
);

if (input.mode === 'victim') {
  await runVictim(input);
} else if (input.mode === 'attacker') {
  await runAttacker(input);
} else {
  throw new Error(`Unknown isolation probe mode: ${input.mode}`);
}

async function runVictim({token}) {
  process.title = token;
  await fsp.writeFile('.isolation-probe-marker', token);
  const server = http.createServer((_request, response) => {
    response.writeHead(200).end('probe');
  });
  await listen(server, 0);
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  console.log(
    JSON.stringify({
      type: 'isolation-probe-ready',
      pid: process.pid,
      port,
      pidNamespace: await fsp.readlink('/proc/self/ns/pid'),
      networkNamespace: await fsp.readlink('/proc/self/ns/net'),
      projectDir: process.cwd(),
    }),
  );
  const deadline = Date.now() + 10_000;
  while (!fs.existsSync('.isolation-probe-stop') && Date.now() < deadline) {
    await delay(25);
  }
  await close(server);
}

async function runAttacker({target, token}) {
  let siblingProcReadable = false;
  try {
    const marker = await fsp.readFile(
      `/proc/${target.pid}/root${target.projectDir}/.isolation-probe-marker`,
      'utf8',
    );
    siblingProcReadable = marker === token;
  } catch {
    siblingProcReadable = false;
  }

  const server = http.createServer((_request, response) => {
    response.writeHead(200).end('probe');
  });
  let samePortAvailable = false;
  try {
    await listen(server, target.port);
    samePortAvailable = true;
  } catch {
    samePortAvailable = false;
  } finally {
    if (server.listening) {
      await close(server);
    }
  }

  const pkill = spawnSync('pkill', ['-f', token], {encoding: 'utf8'});
  console.log(
    JSON.stringify({
      type: 'isolation-probe-attack',
      siblingProcReadable,
      samePortAvailable,
      pkillAvailable: !pkill.error,
      pkillCode: pkill.status,
      pidNamespace: await fsp.readlink('/proc/self/ns/pid'),
      networkNamespace: await fsp.readlink('/proc/self/ns/net'),
    }),
  );
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', resolve);
  });
}

function close(server) {
  return new Promise(resolve => server.close(resolve));
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
