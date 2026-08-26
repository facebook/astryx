// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input LabDemos rigs, published guidance, the lab store
 * @output The exit-gap argument, with both documents on screen
 * @position /motion/exit-gap
 *
 * The brief calls this the single highest-leverage fix in the audit. It is
 * also the one place where the thing being called a defect is the published
 * guidance, so the page leads with that rather than burying it.
 */

import * as stylex from '@stylexjs/stylex';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Grid} from '@astryxdesign/core/Grid';
import {Link} from '@astryxdesign/core/Link';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {LabPage} from '../PageFrame';
import {ComparePanes, DemoBody, DemoCard, TokenSlider} from '../LabPrimitives';
import {DialogRig, LayerRig, NativePopoverProbe} from '../LabDemos';
import {GUIDANCE_CONFLICTS} from '../publishedGuidance';

const sx = stylex.create({
  full: {width: '100%'},
  quote: {
    borderInlineStart: '2px solid var(--color-border)',
    paddingInlineStart: '12px',
    maxWidth: '62ch',
  },
});

/** The eleven, as the brief lists them, plus the dialog family. */
const LAYER_CONSUMERS = [
  'Tooltip',
  'HoverCard',
  'Popover',
  'DropdownMenu',
  'ContextMenu',
  'Selector',
  'ComplexSelector',
  'PowerSearch',
  'Typeahead',
  'MoreMenu',
  'Breadcrumbs overflow',
];

const RIGS = [
  {
    title: 'Tooltip',
    subtitle: 'useLayer · highest-frequency surface in the system',
    triggerLabel: 'Hover me',
    trigger: 'hover' as const,
    origin: 'top center',
    question:
      'The published page names tooltips specifically as a surface that may vanish. Does the exit earn its 175ms here, on something seen hundreds of times a day?',
  },
  {
    title: 'HoverCard',
    subtitle: 'useLayer · the most visible instance of the gap',
    triggerLabel: 'Hover a name',
    trigger: 'hover' as const,
    origin: 'top left',
    question:
      'A larger surface travelling the same distance. Judge the scale-from value here rather than on Tooltip — 0.96 reads differently at size.',
  },
  {
    title: 'Popover',
    subtitle: 'useLayer',
    triggerLabel: 'Click me',
    trigger: 'click' as const,
    origin: 'top left',
    question:
      'Click twice quickly. The exit has to retarget rather than restart, or rapid dismissal looks broken.',
  },
  {
    title: 'DropdownMenu',
    subtitle: 'useLayer · submenus too',
    triggerLabel: 'Open menu',
    trigger: 'click' as const,
    origin: 'top left',
    question:
      'A menu snapping shut is the case people notice. Does the exit help, or does it just delay the next click?',
  },
];

export default function ExitGapPage() {
  const conflict = GUIDANCE_CONFLICTS.find(c => c.id === 'exit-optional');
  const blocking = GUIDANCE_CONFLICTS.find(c => c.id === 'blocking');

  return (
    <LabPage
      title="The exit gap"
      intro="Eleven components animate in and vanish out — every surface built on useLayer, plus Dialog, AlertDialog and CommandPalette. One change to layerAnimations and useLayer would give all eleven a dismissal animation, which is why the brief calls it the highest-leverage fix in the audit."
      decides="Whether presence surfaces should animate out at all, and what enter and exit cost."
      badges={
        <Badge variant="warning" label="conflicts with the published page" />
      }>
      {conflict != null && (
        <Banner
          status="warning"
          title="This is not drift — it is the published guidance, correctly followed"
          description={
            <VStack gap={2}>
              <Text {...stylex.props(sx.quote)}>
                <em>&ldquo;{conflict.published}&rdquo;</em>
              </Text>
              <Text>
                {conflict.reading} Before any of this is scheduled, decide which
                document is right. If the proposal wins, the rewrite of that
                paragraph ships in the same stack as the{' '}
                <code>layerAnimations</code> change — otherwise the rubric
                starts failing components for doing exactly what the docs still
                instruct.
              </Text>
            </VStack>
          }
          endContent={
            <Link href="/pages/motion-lab/published/">All conflicts</Link>
          }
        />
      )}

      <DemoCard
        title="Tune the presence budget"
        question="These two values drive every pane on this page, and every layer demo in the lab.">
        <DemoBody>
          <TokenSlider token="--duration-enter" label="enter" max={600} />
          <TokenSlider token="--duration-exit" label="exit" max={600} />
          <TokenSlider token="--duration-overlay" label="overlay" max={900} />
          <Text type="supporting" color="secondary">
            Exit is deliberately shorter than enter, because old content should
            leave faster than new content arrives. Drag them equal and a
            dismissal starts to feel sticky.
          </Text>
        </DemoBody>
      </DemoCard>

      {RIGS.map(rig => (
        <DemoCard
          key={rig.title}
          title={rig.title}
          question={rig.question}
          badges={<Badge label={rig.subtitle} />}>
          <ComparePanes
            panes={[
              {
                tone: 'before',
                label: 'Today — animates in, vanishes out',
                content: (
                  <LayerRig
                    mode="before"
                    label={rig.title}
                    triggerLabel={rig.triggerLabel}
                    trigger={rig.trigger}
                    origin={rig.origin}
                  />
                ),
              },
              {
                tone: 'after',
                label: 'Proposed — the exit retraces the entry',
                content: (
                  <LayerRig
                    mode="after"
                    label={rig.title}
                    triggerLabel={rig.triggerLabel}
                    trigger={rig.trigger}
                    origin={rig.origin}
                  />
                ),
              },
            ]}
          />
        </DemoCard>
      ))}

      <DemoCard
        title="Dialog, AlertDialog, CommandPalette"
        question="Two separate bugs in one surface: the panel has no exit, and the backdrop has no transition at all. Watch the focus ring on the trigger."
        badges={<Badge variant="error" label="focus races the exit" />}>
        <ComparePanes
          panes={[
            {
              tone: 'before',
              label:
                'Today — no exit, scrim hard-cuts, focus returns immediately',
              content: <DialogRig mode="before" />,
            },
            {
              tone: 'after',
              label: 'Proposed — panel and scrim both exit, focus waits',
              content: <DialogRig mode="after" />,
            },
          ]}
        />
        <DemoBody>
          <Text type="supporting" color="secondary">
            In the left pane the focus ring lights the instant the dialog
            closes, while the dialog is still on screen. With a real exit
            animation that means focus moves — and the page may scroll —
            mid-animation. The brief lists this as a risk; here it is a thing
            you can watch, and it has to be settled before the Dialog work
            starts rather than after.
          </Text>
        </DemoBody>
      </DemoCard>

      <DemoCard
        title="The technique, running natively in this browser"
        question="Is the platform enough, or does the shared primitive need a JS fallback? This card answers it for real — nothing here is simulated.">
        <DemoBody>
          <NativePopoverProbe />
        </DemoBody>
      </DemoCard>

      <VStack gap={3}>
        <Heading level={2}>What one change buys</Heading>
        <Card padding={4}>
          <VStack gap={2}>
            <Text>
              Every component below is a <code>useLayer</code> consumer, so all
              of them inherit a dismissal animation from a single definition.
              That is the leverage — and it is also the risk, because it is one
              change to the code path that owns dismissal.
            </Text>
            <HStack gap={1} wrap="wrap">
              {LAYER_CONSUMERS.map(name => (
                <Badge key={name} label={name} />
              ))}
            </HStack>
          </VStack>
        </Card>
        <CodeBlock
          language="css"
          title="layerAnimations — one definition, eleven consumers"
          hasCopyButton
          code={`.layer {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
  transform-origin: var(--layer-origin);
  transition:
    opacity   var(--duration-exit) var(--ease-exit),
    transform var(--duration-exit) var(--ease-exit),
    display   var(--duration-exit) allow-discrete,
    overlay   var(--duration-exit) allow-discrete;
}

.layer:popover-open {
  opacity: 1;
  transform: scale(1) translateY(0);
  transition:
    opacity   var(--duration-enter) var(--ease-entry),
    transform var(--duration-enter) var(--ease-entry),
    display   var(--duration-enter) allow-discrete,
    overlay   var(--duration-enter) allow-discrete;
}

@starting-style {
  .layer:popover-open { opacity: 0; transform: scale(0.96) translateY(-4px); }
}`}
        />
        <CodeBlock
          language="tsx"
          title="useLayer — await the exit instead of hiding synchronously"
          hasCopyButton
          code={`- setOpen(false);                     // element gone this frame
+ setClosing(true);                   // stops accepting input immediately
+ await Promise.all(
+   el.getAnimations().map(a => a.finished),
+ );
+ setOpen(false);                     // focus return happens here`}
        />
      </VStack>

      <VStack gap={3}>
        <Heading level={2}>What this work has to be careful about</Heading>
        <Grid columns={{minWidth: 300}} gap={3}>
          <Card padding={4}>
            <VStack gap={1.5}>
              <Text weight="semibold">Dismissal is load-bearing</Text>
              <Text type="supporting" color="secondary">
                Layer dismissal has its own invariants test for good reason.
                Keeping an element alive through its exit doubles the state
                matrix for focus return, outside-press and escape handling — and
                every one of those has to be tested against an element that is
                visible but already closing.
              </Text>
            </VStack>
          </Card>
          {blocking != null && (
            <Card padding={4}>
              <VStack gap={1.5}>
                <Text weight="semibold">
                  The published page already warns about this
                </Text>
                <Text type="supporting" color="secondary">
                  &ldquo;{blocking.published}&rdquo; The answer has to be that
                  the surface stops accepting input the moment dismissal starts,
                  not when the animation ends. Write that into the
                  primitive&rsquo;s contract rather than leaving it to each
                  consumer.
                </Text>
              </VStack>
            </Card>
          )}
          <Card padding={4}>
            <VStack gap={1.5}>
              <Text weight="semibold">
                Motion is already fighting the automated gates
              </Text>
              <Text type="supporting" color="secondary">
                Two fixes landed this month to stop animation interfering with
                the accessibility audit and the visual-regression capture. More
                motion means more of this, and there is no documented policy for
                it. The lab&rsquo;s reduced-motion switch doubles as the freeze
                mode a capture needs.
              </Text>
            </VStack>
          </Card>
        </Grid>
      </VStack>
    </LabPage>
  );
}
