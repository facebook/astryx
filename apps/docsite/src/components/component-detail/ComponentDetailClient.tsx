'use client';

import {Suspense} from 'react';
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSDivider} from '@xds/core';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {useMediaQuery} from '@xds/core/hooks';
import {ShowcasePreview} from './ShowcasePreview';
import {BestPractices} from './BestPractices';
import {HookSignature} from './HookSignature';
import {ExampleBlock} from './ExampleBlock';
import {PropsTable} from './PropsTable';
import {
  InteractivePreviewStage,
  useInteractiveState,
} from './InteractivePreview';
import {PlaygroundPropsTable} from './PlaygroundPropsTable';
import type {ComponentEntry} from '../../generated/componentRegistry';
import type {BlockEntry} from '../../generated/blockRegistry';
import {showcaseRegistry} from '../../generated/showcaseRegistry';
import {exampleRegistry} from '../../generated/exampleRegistry';

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
  const importPath = `import {${comp.moduleName}} from '${pkg}/${comp.directory}'`;

  return (
    <XDSVStack gap={8}>
      {hasShowcase && (
        <XDSCard variant="muted" padding={0}>
          <ShowcasePreview name={comp.name} />
        </XDSCard>
      )}

      {comp.usage && (
        <XDSVStack gap={6}>
          <XDSHeading level={2}>Usage</XDSHeading>
          <XDSText type="large" weight="normal">
            {comp.usage.description}
          </XDSText>

          <XDSCodeBlock code={importPath} language="ts" hasCopyButton />

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
          <XDSVStack gap={6}>
            <XDSHeading level={2}>Examples</XDSHeading>
            <XDSText type="large" weight="normal">
              Common configurations, variations, and states.
            </XDSText>
          </XDSVStack>
          <XDSVStack gap={8}>
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
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const qs = params.toString();
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, {scroll: false});
  };

  const {knobs, state, setProp} = useInteractiveState(
    comp.name,
    comp.props,
    comp.playground,
  );

  return (
    <XDSSection
      maxWidth={960}
      padding={4}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSVStack gap={4}>
        <XDSVStack gap={2}>
          <XDSText type="display-1">{comp.name}</XDSText>
          <XDSText type="supporting" color="secondary">
            {pkg}
            {pkgVersion ? ` v${pkgVersion}` : ''} · {comp.moduleName}
          </XDSText>
        </XDSVStack>

        {hasPlayground ? (
          <>
            <XDSTabList value={tab} onChange={setTab} hasDivider>
              <XDSTab value="overview" label="Overview" />
              <XDSTab value="playground" label="Playground" />
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

            {tab === 'playground' && (
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
                  <InteractivePreviewStage name={comp.name} state={state} />
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
