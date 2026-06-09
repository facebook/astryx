// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Deep-link redirect — /themes/<name> → /themes?theme=<name>
 *
 * The themes surface was consolidated into a single state-driven
 * explorer at /themes (see ./page.tsx). To keep existing deep links
 * working (docs cross-links, shared URLs, search bookmarks), this
 * route accepts the original `/themes/<slug>` shape and redirects to
 * the canonical query-param form `/themes?theme=<slug>`, which the
 * explorer reads on mount to preselect the right theme in its
 * sidebar picker.
 *
 * Only known theme slugs are statically generated; any other slug
 * falls through Next's default routing and returns a 404, matching
 * the pre-consolidation behavior of the deleted per-theme page.
 */
import {redirect} from 'next/navigation';
import {packages} from '../../../../generated/packageRegistry';

export function generateStaticParams() {
  return packages
    .filter(p => p.name.startsWith('@xds/theme-'))
    .map(p => ({name: p.name.replace('@xds/theme-', '')}));
}

export default async function ThemeRedirectPage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: slug} = await params;
  redirect(`/themes?theme=${encodeURIComponent(slug)}`);
}
