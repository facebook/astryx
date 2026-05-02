/**
 * Component detail page.
 * Adapts based on content:
 * - Visual components: showcase + usage + anatomy + props + examples
 * - Hooks/utilities: usage + params/returns + examples
 * - Compound components: also lists sub-components with their props
 */

import {notFound} from 'next/navigation';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSCenter} from '@xds/core/Center';
import {XDSDivider} from '@xds/core';
import {XDSCodeBlock} from '@xds/core/CodeBlock';
import {components} from '../../../generated/componentRegistry';
import {blocks} from '../../../generated/blockRegistry';
import {PropsTable} from '../../../components/component-detail/PropsTable';
import {BestPractices} from '../../../components/component-detail/BestPractices';
import {Anatomy} from '../../../components/component-detail/Anatomy';
import {HookSignature} from '../../../components/component-detail/HookSignature';
import {ExampleBlock} from '../../../components/component-detail/ExampleBlock';
import {ShowcasePreview} from '../../../components/component-detail/ShowcasePreview';

const allComponents = Object.values(components).flat();

export function generateStaticParams() {
  return allComponents.filter(c => !c.parentDoc).map(c => ({name: c.name}));
}

export default async function ComponentPage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name} = await params;
  const comp = allComponents.find(c => c.name === name);
  if (!comp) notFound();

  const subComponents = allComponents.filter(c => c.parentDoc === name);
  const pkg = Object.entries(components).find(([, comps]) =>
    comps.includes(comp),
  )?.[0];

  const isHook = comp.params != null;

  const componentBlocks = blocks.filter(b => b.exampleFor === name);
  const showcase = componentBlocks.find(b => b.isShowcase);
  const examples = componentBlocks.filter(b => !b.isShowcase);

  const importPath = `import {${comp.moduleName}} from '${pkg}/${comp.directory}'`;

  return (
    <XDSSection
      maxWidth={960}
      padding={8}
      variant="transparent"
      style={{marginInline: 'auto'}}>
      <XDSVStack gap={8}>
        {/* Header */}
        <XDSVStack gap={2}>
          <XDSText type="display-1">{comp.moduleName}</XDSText>
          <XDSText type="supporting" color="secondary">
            {pkg} · {comp.directory}
          </XDSText>
        </XDSVStack>

        <XDSDivider />

        {/* Preview */}
        <XDSCard variant="muted" padding={0}>
          <XDSCenter height={360}>
            <ShowcasePreview name={name} />
          </XDSCenter>
        </XDSCard>

        {/* Usage + Best Practices */}
        {comp.usage && (
          <XDSVStack gap={8}>
            <XDSHeading level={2}>Usage</XDSHeading>
            <XDSText type="large" weight="normal">
              {comp.usage.description}
            </XDSText>

            {comp.usage.bestPractices &&
              comp.usage.bestPractices.length > 0 && (
                <BestPractices practices={comp.usage.bestPractices} />
              )}

            {comp.usage.anatomy && comp.usage.anatomy.length > 0 && (
              <Anatomy elements={comp.usage.anatomy} />
            )}
          </XDSVStack>
        )}

        {/* Hook params/returns */}
        {isHook && comp.params && comp.returns && (
          <HookSignature params={comp.params} returns={comp.returns} />
        )}

        {/* Import */}
        <XDSVStack gap={2}>
          <XDSHeading level={3}>Import</XDSHeading>
          <XDSCodeBlock code={importPath} language="ts" hasCopyButton />
        </XDSVStack>

        {/* Props */}
        {!isHook && comp.props.length > 0 && (
          <XDSVStack gap={3}>
            <XDSHeading level={2}>Props</XDSHeading>
            <PropsTable props={comp.props} />
          </XDSVStack>
        )}

        {/* Sub-components */}
        {subComponents.length > 0 && (
          <>
            <XDSDivider />
            <XDSVStack gap={6}>
              <XDSVStack gap={2}>
                <XDSHeading level={2}>Sub-components</XDSHeading>
                <XDSText type="large" weight="normal">
                  {comp.moduleName.replace(/^XDS/, '')} is a compound component
                  with {subComponents.length} sub-component
                  {subComponents.length === 1 ? '' : 's'}.
                </XDSText>
              </XDSVStack>
              {subComponents.map(sub => (
                <XDSVStack key={sub.name} gap={3}>
                  <XDSVStack gap={1}>
                    <XDSHeading level={3}>{sub.moduleName}</XDSHeading>
                    <XDSText type="body" color="secondary">
                      {sub.description}
                    </XDSText>
                  </XDSVStack>
                  {sub.props.length > 0 && <PropsTable props={sub.props} />}
                </XDSVStack>
              ))}
            </XDSVStack>
          </>
        )}

        {/* Examples */}
        {examples.length > 0 && (
          <>
            <XDSDivider />
            <XDSVStack gap={6}>
              <XDSHeading level={2}>Examples</XDSHeading>
              <XDSText type="large" weight="normal">
                Common configurations, variations, and states.
              </XDSText>
            </XDSVStack>
            <XDSVStack gap={8}>
              {examples.map(block => (
                <ExampleBlock key={block.dirName} block={block} />
              ))}
            </XDSVStack>
          </>
        )}

        {/* Showcase source */}
        {showcase && (
          <>
            <XDSDivider />
            <XDSVStack gap={2}>
              <XDSHeading level={3}>Showcase source</XDSHeading>
              <XDSCodeBlock
                code={showcase.source}
                language="tsx"
                hasCopyButton
              />
            </XDSVStack>
          </>
        )}
      </XDSVStack>
    </XDSSection>
  );
}
