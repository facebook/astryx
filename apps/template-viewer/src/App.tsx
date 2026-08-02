// Copyright (c) Meta Platforms, Inc. and affiliates.

import {Suspense, lazy} from 'react';
import type {ComponentType} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {LayerProvider} from '@astryxdesign/core/Layer';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';

// Every renderable template, keyed by its path relative to this file, e.g.
// "../../../packages/cli/assets/templates/pages/ai-chat/page.tsx".
const templates = import.meta.glob(
  '../../../packages/cli/assets/templates/**/*.tsx',
);

// The URL pathname is a template directory,
// e.g. /packages/cli/assets/templates/pages/ai-chat
const dir = window.location.pathname.replace(/^\/+|\/+$/g, '');

// Each directory holds a single .tsx, so a substring match uniquely finds it.
const key = dir
  ? Object.keys(templates).find(path => path.includes(`/${dir}/`))
  : undefined;

export default function App() {
  if (!key) {
    return <Index />;
  }

  const Template = lazy(
    templates[key] as () => Promise<{default: ComponentType}>,
  );

  return (
    <Theme theme={neutralTheme}>
      <LayerProvider>
        <Suspense fallback={null}>
          <Template />
        </Suspense>
      </LayerProvider>
    </Theme>
  );
}

// Fallback list of every template when the URL doesn't point at one.
function Index() {
  const dirs = [
    ...new Set(
      Object.keys(templates).map(path =>
        path.slice(path.indexOf('packages/')).replace(/\/[^/]+$/, ''),
      ),
    ),
  ].sort();

  return (
    <main style={{padding: '2rem', fontFamily: 'system-ui', lineHeight: 1.8}}>
      <h1>Astryx Templates</h1>
      <ul>
        {dirs.map(d => (
          <li key={d}>
            <a href={`/${d}`}>{d}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
