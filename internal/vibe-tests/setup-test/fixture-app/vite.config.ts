// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.config.ts
 * @input The fixture app's source
 * @output A dev server / production build of the existing app
 * @position internal/vibe-tests/setup-test/fixture-app — build entry
 *
 * The app is a plain Vite + React + Tailwind v4 build because a setup run has
 * to be COMPILED AND RENDERED to be scored: the failures this test measures do
 * not show up in a diff. Its data comes from a middleware stub so the app runs
 * with no backend, in dev and in `vite preview` alike.
 */

import {defineConfig, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {readFileSync} from 'node:fs';

/** Serves lib/fixtures.json as the app's API, in dev and preview. */
function stubApi(): Plugin {
  const data = JSON.parse(
    readFileSync(new URL('./lib/fixtures.json', import.meta.url), 'utf8'),
  );
  const handler = (req: {url?: string}, res: any, next: () => void) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/api/')) return next();
    const json = (body: unknown) => {
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify(body));
    };
    if (url.pathname === '/api/runs') {
      const env = url.searchParams.get('env');
      return json(
        data.runs.filter((r: {env: string}) => !env || r.env === env),
      );
    }
    const build = url.pathname.match(/^\/api\/builds\/(.+)$/);
    if (build)
      return json(
        data.builds[decodeURIComponent(build[1])] ?? data.builds.default,
      );
    const ticket = url.pathname.match(/^\/api\/tickets\/(.+)$/);
    if (ticket)
      return json(
        data.tickets[decodeURIComponent(ticket[1])] ?? data.tickets.default,
      );
    res.statusCode = 404;
    res.end();
  };
  return {
    name: 'fixture-api',
    configureServer: server => void server.middlewares.use(handler),
    configurePreviewServer: server => void server.middlewares.use(handler),
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stubApi()],
  resolve: {
    alias: {'@': new URL('./', import.meta.url).pathname.replace(/\/$/, '')},
  },
});
