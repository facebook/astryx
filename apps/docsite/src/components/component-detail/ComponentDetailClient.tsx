// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Suspense} from 'react';
import {useSearchParams, useRouter, usePathname} from 'next/navigation';
import {Heading, Text} from '@xds/core/Text';
import {VStack} from '@xds/core/Layout';
import {Section} from '@xds/core/Section';
import {Card} from '@xds/core/Card';
import {Divider} from '@xds/core';
import {CodeExampleBlock} from '../CodeExampleBlock';
import {TabList, Tab} from '@xds/core/TabList';
import {useMediaQuery} from '@xds/core/hooks';
import {ShowcasePreview} from './ShowcasePreview';
import {ComponentPreviewTheme} from './ComponentPreviewTheme';
import {BestPractices} from './BestPractices';
import {HookSignature} from './HookSignature';
import {ExampleBlock} from './ExampleBlock';
import {MarkdownText} from '../MarkdownText';
import {
  InteractivePreviewStage,
  useInteractiveState,
} from './InteractivePreview';
import {PlaygroundPropsTable} from './PlaygroundPropsTable';
import type {ComponentEntry} from '../../generated/componentRegistry';
import type {BlockEntry} from '../../generated/blockRegistry';
import {showcaseRegistry} from '../../generated/showcaseRegistry';
import {exampleRegistry} from '../../generated/exampleRegistry';
import {trackNavigate} from '../../lib/analytics';

const styles = stylex.create({
  section: {
    marginInline: 'auto',
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
    <VStack gap={8}>
      {hasShowcase && (
        <ComponentPreviewTheme>
          <Card variant="muted" padding={0}>
            <ShowcasePreview name={comp.name} />
          </Card>
        </ComponentPreviewTheme>
      )}

      {comp.usage && (
        <VStack gap={4}>
          <Heading level={2} type="display-3">
            Usage
          </Heading>
          <MarkdownText type="large" weight="normal">
            {comp.usage.description}
          </MarkdownText>

          <CodeExampleBlock
            code={importPath}
            language="ts"
            width="100%"
            hasCopyButton
          />

          {comp.usage.bestPractices && comp.usage.bestPractices.length > 0 && (
            <BestPractices practices={comp.usage.bestPractices} />
          )}
        </VStack>
      )}

      {isHook && comp.params && comp.returns && (
        <HookSignature params={comp.params} returns={comp.returns} />
      )}

      {(exampleRegistry[comp.name] || []).length > 0 && (
        <>
          <Divider />
          <VStack gap={4}>
            <Heading level={2} type="display-3">
              Examples
            </Heading>
            <Text type="large" weight="normal">
              Common configurations, variations, and states.
            </Text>
          </VStack>
          <VStack gap={10}>
            {(exampleRegistry[comp.name] || []).map((entry, i) => (
              <ExampleBlock key={i} entry={entry} componentName={comp.name} />
            ))}
          </VStack>
        </>
      )}
    </VStack>
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
    <Section
      maxWidth={960}
      padding={6}
      variant="transparent"
      xstyle={styles.section}>
      <VStack gap={4}>
        <VStack gap={2}>
          <Text type="display-1">{comp.displayName}</Text>
          <Text type="supporting" color="secondary">
            {pkg}
            {pkgVersion ? ` v${pkgVersion}` : ''} · {comp.moduleName}
          </Text>
        </VStack>

        {hasPlayground ? (
          <>
            <TabList value={tab} onChange={setTab} hasDivider>
              <Tab value="overview" label="Overview" />
              <Tab value="properties" label="Properties" />
            </TabList>

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
              <VStack gap={4}>
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
                    knobs={knobs}
                    playground={comp.playground}
                    missingRequiredProps={missingRequiredProps}
                    onPropChange={setProp}
                    canControlOpenState={
                      comp.props.some(prop => prop.name === 'isOpen') &&
                      comp.props.some(prop => prop.name === 'onOpenChange')
                    }
                  />
                </div>

                {comp.props.length > 0 && (
                  <Section>
                    <VStack gap={3}>
                      <Heading level={3}>Props</Heading>
                      <PlaygroundPropsTable
                        props={comp.props}
                        knobs={knobs}
                        state={state}
                        onPropChange={setProp}
                      />
                    </VStack>
                  </Section>
                )}
              </VStack>
            )}
          </>
        ) : (
          <>
            <Divider />
            <OverviewContent
              comp={comp}
              pkg={pkg}
              pkgVersion={pkgVersion}
              showcase={showcase}
              hasShowcase={hasShowcase}
            />
          </>
        )}
      </VStack>
    </Section>
  );
}

export function ComponentDetailClient(props: ComponentDetailClientProps) {
  return (
    <Suspense>
      <ComponentDetailInner {...props} />
    </Suspense>
  );
}
