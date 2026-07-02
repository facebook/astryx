// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Redirect /templates/<slug> to /templates?preview=<slug> so the preview
 * dialog opens on the gallery page. Keeps old direct links working.
 */

import {redirect} from 'next/navigation';
import {templates} from '../../../../generated/templateRegistry';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export function generateStaticParams() {
  return templates.map(t => ({slug: t.slug}));
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{slug: string}>;
}) {
  const {slug} = await params;
  redirect(`/templates?preview=${slug}`);
}
