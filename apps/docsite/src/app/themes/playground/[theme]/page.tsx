// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Page type: theme playground (full-bleed tool)
 * Live theme customization with token adjustments and live preview. Lives
 * outside the (site) route group so it renders full-screen without the
 * marketing top nav / footer chrome. The [theme] segment seeds the editor
 * with a full theme preset (default, neutral, gothic, matcha, stone).
 */

import {notFound} from 'next/navigation';
import {ThemeEditorView} from '../../../../components/themePlayground/ThemeEditorView';
import {
  getThemeList,
  getThemeByName,
} from '../../../../components/themePlayground/themeList';

export function generateStaticParams() {
  return getThemeList().map(entry => ({theme: entry.name}));
}

export default async function ThemePlaygroundPage({
  params,
}: {
  params: Promise<{theme: string}>;
}) {
  const {theme} = await params;
  const entry = getThemeByName(theme);

  if (!entry) {
    notFound();
  }

  return (
    <ThemeEditorView
      themeId={entry.name}
      themeLabel={entry.label}
      initialTheme={entry.theme}
    />
  );
}
