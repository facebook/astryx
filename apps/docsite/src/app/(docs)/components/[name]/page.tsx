// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Component detail page.
 * Server component that resolves data, then delegates to ComponentDetailClient
 * which handles tabs (Overview / Playground) on the client.
 */

import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {components} from '../../../../generated/componentRegistry';
import {blocks} from '../../../../generated/blockRegistry';
import {packages} from '../../../../generated/packageRegistry';
import {ComponentDetailClient} from '../../../../components/component-detail/ComponentDetailClient';
import {flattenComponentSidebarEntries} from '../../../../components/componentSidebarData';
import {pageMetadata} from '../../../../lib/pageMetadata';

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

const allComponents = Object.values(components).flat();

export function generateStaticParams() {
  return flattenComponentSidebarEntries().map(c => ({name: c.name}));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{name: string}>;
}): Promise<Metadata> {
  const {name} = await params;
  const comp = allComponents.find(c => c.name === name);
  if (!comp) {
    return {};
  }
  return pageMetadata({
    title: comp.displayName,
    description:
      comp.description ||
      `Props, usage, and live examples for the ${comp.displayName} component.`,
    path: `/components/${comp.name}`,
    type: 'article',
  });
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name} = await params;
  const comp = allComponents.find(c => c.name === name);
  if (!comp) {
    notFound();
  }

  const pkg = Object.entries(components).find(([, comps]) =>
    comps.includes(comp),
  )?.[0];

  const pkgVersion = packages.find(p => p.name === pkg)?.version;

  const componentBlocks = blocks.filter(b => b.exampleFor === name);
  const showcase = componentBlocks.find(b => b.isShowcase);

  return (
    <ComponentDetailClient
      comp={comp}
      pkg={pkg}
      pkgVersion={pkgVersion}
      showcase={showcase}
    />
  );
}
