// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Suspense} from 'react';
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core';
import {CodeExampleBlock} from '../CodeExampleBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {useMediaQuery} from '@xds/core/hooks';
import {ShowcasePreview} from './ShowcasePreview';
import {BestPractices} from './BestPractices';
import {HookSignature} from './HookSignature';
import {ExampleBlock} from './ExampleBlock';
import {
  InteractivePreviewStage,
  useInteractiveState,
} from './InteractivePreview';
import {PlaygroundPropsTable} from './PlaygroundPropsTable';
import type {ComponentEntry} from '../../generated/componentRegistry';
import type {BlockEntry} from '../../generated/blockRegistry';
import {showcaseRegistry} from '../../generated/showcaseRegistry';
import {exampleRegistry} from '../../generated/exampleRegistry';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {trackNavigate} from '../../lib/analytics';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
    paddingBottom: `calc(${spacingVars['--spacing-12']} * 2)`,
  },
});

interface ComponentDetailClientProps {
  comp: ComponentEntry;
  pkg: string | undefined;
  pkgVersion: string | undefined;
  showcase: BlockEntry | undefined;
}

function OverviewContent({
  comp,
  pkg,
  showcase: _showcase,
  hasShowcase,
}: ComponentDetailClientProps & {hasShowcase: boolean}) {
  const isHook = comp.params != null;
  const importFrom = comp.importPath ?? `${pkg}/${comp.directory}`;
  const importPath = `import {${comp.moduleName}} from '${importFrom}'`;

  return (
    <XDSVStack gap={8}>
      {hasShowcase && (
        <XDSCard variant="muted" padding={0}>
          <ShowcasePreview name={comp.name} />
        </XDSCard>
      )}

      {comp.usage && (
        <XDSVStack gap={4}>
          <XDSHeading level={2} type="display-3">
            Usage
          </XDSHeading>
          <XDSText type="large" weight="normal">
            {comp.usage.description}
          </XDSText>

          <CodeExampleBlock
            code={importPath}
            language="ts"
            width="100%"
            hasCopyButton
          />

          {comp.usage.bestPractices && comp.usage.bestPractices.length > 0 && (
            <BestPractices practices={comp.usage.bestPractices} />
          )}
        </XDSVStack>
      )}

      {isHook && comp.params && comp.returns && (
        <HookSignature params={comp.params} returns={comp.returns} />
      )}

      {(exampleRegistry[comp.name] || []).length > 0 && (
        <>
          <XDSDivider />
          <XDSVStack gap={4}>
            <XDSHeading level={2} type="display-3">
              Examples
            </XDSHeading>
            <XDSText type="large" weight="normal">
              Common configurations, variations, and states.
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={10}>
            {(exampleRegistry[comp.name] || []).map((entry, i) => (
              <ExampleBlock key={i} entry={entry} />
            ))}
          </XDSVStack>
        </>
      )}
    </XDSVStack>
  );
}

function ComponentDetailInner({
  comp,
  pkg,
  pkgVersion,
  showcase,
}: ComponentDetailClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const isHook = comp.params != null;
  const hasShowcase = comp.name in showcaseRegistry;
  const hasPlayground = !isHook;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const tab = searchParams.get('tab') ?? 'overview';
  const setTab = (value: string) => {
    trackNavigate({
      page: 'components',
      target: 'tab',
      tab: value,
      item: comp.name,
    });
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, {scroll: false});
  };

  const {knobs, state, setProp, missingRequiredProps} = useInteractiveState(
    comp.name,
    comp.props,
    comp.playground,
  );

  return (
    <XDSSection
      maxWidth={960}
      padding={6}
      variant="transparent"
      xstyle={styles.section}>
      <XDSVStack gap={4}>
        <XDSVStack gap={2}>
          <XDSText type="display-1">{comp.displayName}</XDSText>
          <XDSText type="supporting" color="secondary">
            {pkg}
            {pkgVersion ? ` v${pkgVersion}` : ''} · {comp.moduleName}
          </XDSText>
        </XDSVStack>

        {hasPlayground ? (
          <>
            <XDSTabList value={tab} onChange={setTab} hasDivider>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="properties" label="Properties" />
            </XDSTabList>

            {tab === 'overview' && (
              <OverviewContent
                comp={comp}
                pkg={pkg}
                pkgVersion={pkgVersion}
                showcase={showcase}
                hasShowcase={hasShowcase}
              />
            )}

            {tab === 'properties' && (
              <XDSVStack gap={4}>
                <div
                  style={{
                    position: 'sticky',
                    top: 44,
                    zIndex: 10,
                    backgroundColor: 'var(--color-background-page)',
                    backdropFilter: 'blur(16px)',
                    maxHeight: isMobile ? 250 : 400,
                    overflow: 'auto',
                  }}>
                  <InteractivePreviewStage
                    name={comp.name}
                    state={state}
                    missingRequiredProps={missingRequiredProps}
                  />
                </div>

                {comp.props.length > 0 && (
                  <XDSSection>
                    <XDSVStack gap={3}>
                      <XDSHeading level={3}>Props</XDSHeading>
                      <PlaygroundPropsTable
                        props={comp.props}
                        knobs={knobs}
                        state={state}
                        onPropChange={setProp}
                      />
                    </XDSVStack>
                  </XDSSection>
                )}
              </XDSVStack>
            )}
          </>
        ) : (
          <>
            <XDSDivider />
            <OverviewContent
              comp={comp}
              pkg={pkg}
              pkgVersion={pkgVersion}
              showcase={showcase}
              hasShowcase={hasShowcase}
            />
          </>
        )}
      </XDSVStack>
    </XDSSection>
  );
}

export function ComponentDetailClient(props: ComponentDetailClientProps) {
  return (
    <Suspense>
      <ComponentDetailInner {...props} />
    </Suspense>
  );
}
