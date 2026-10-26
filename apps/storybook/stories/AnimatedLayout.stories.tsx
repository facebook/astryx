// Copyright (c) Meta Platforms, Inc. and affiliates.

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Button} from '@astryxdesign/core/Button';
import {useAnimatedLayout} from '@astryxdesign/core/hooks';
// The internal reporting half of the module: a plain app element whose size
// changes reports it here, as Astryx components do internally.
import {
  playLayoutChange,
  reportLayoutChange,
} from '../../../packages/core/src/motion/animatedLayout';

const meta: Meta = {
  title: 'Core/Animated layout',
  parameters: {layout: 'padded'},
};

export default meta;

type Story = StoryObj;

const card = {
  padding: 12,
  margin: '0 0 8px',
  borderRadius: 12,
  border: '1px solid var(--color-border)',
  background: 'var(--color-background-surface)',
  color: 'var(--color-text-primary)',
  fontFamily: 'var(--font-family-body)',
  fontSize: 14,
} as const;

const plain = {
  ...card,
  borderStyle: 'dashed',
  background: 'var(--color-background-muted)',
} as const;

const label = {
  margin: '0 0 6px',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--color-text-secondary)',
  fontFamily: 'var(--font-family-body)',
} as const;

/**
 * A plain element's size change, reported to the nearest area: `before()`
 * runs in the handler that causes the change; the move plays when `dep`
 * commits, and the changed element plays its own entrance.
 */
function useReportedChange(dep: unknown) {
  const ref = useRef<HTMLDivElement>(null);
  const change = useMemo(() => reportLayoutChange(ref), []);
  const first = useRef(true);
  useLayoutEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    change.animate();
    if (ref.current != null) {
      playLayoutChange(ref.current, 'enter');
    }
  }, [dep, change]);
  return {ref, before: () => change.measureBefore()};
}

const TREE: TreeListItemData[] = [
  {
    id: 'photos',
    label: 'Photos',
    children: [
      {id: 'beach', label: 'Beach.jpg'},
      {
        id: 'trips',
        label: 'Trips',
        children: [
          {id: 'snow', label: 'Snow.jpg'},
          {id: 'lake', label: 'Lake.jpg'},
        ],
      },
      {id: 'party', label: 'Party.jpg'},
    ],
  },
  {
    id: 'docs',
    label: 'Documents',
    children: [
      {id: 'cv', label: 'Resume.pdf'},
      {id: 'tax', label: 'Taxes.pdf'},
    ],
  },
  {id: 'notes', label: 'Notes.txt'},
];

function FieldError() {
  const [email, setEmail] = useState('not-an-email');
  const [error, setError] = useState<string | null>(null);
  const {ref, before} = useReportedChange(error);
  return (
    <div style={card}>
      <p style={label}>A field error on Validate</p>
      <TextInput label="Email" value={email} onChange={setEmail} />
      <div ref={ref}>
        {error != null && (
          <p
            role="alert"
            style={{
              margin: '6px 0 0',
              color: 'var(--color-text-red)',
              fontSize: 13,
            }}>
            {error}
          </p>
        )}
      </div>
      <div style={{marginTop: 8}}>
        <Button
          label={error == null ? 'Validate' : 'Clear error'}
          onClick={() => {
            before();
            setError(
              error == null
                ? email.includes('@')
                  ? null
                  : 'Enter a valid email address, like name@example.com.'
                : null,
            );
          }}
        />
      </div>
    </div>
  );
}

function LoadMore() {
  const [loaded, setLoaded] = useState(false);
  const {ref, before} = useReportedChange(loaded);
  return (
    <div style={card}>
      <p style={label}>Load more: a skeleton replaced by taller content</p>
      <div ref={ref}>
        {loaded ? (
          <div style={{display: 'grid', gap: 6}}>
            <strong>Alex Rivera</strong>
            <span>Product designer · Seattle</span>
            <span>Joined in 2021 · 48 projects</span>
            <span>Prefers async reviews; pairs on Thursdays.</span>
          </div>
        ) : (
          <div
            aria-hidden
            style={{
              height: 36,
              borderRadius: 8,
              background: 'var(--color-skeleton)',
            }}
          />
        )}
      </div>
      <div style={{marginTop: 8}}>
        <Button
          label={loaded ? 'Reset' : 'Load more'}
          onClick={() => {
            before();
            setLoaded(!loaded);
          }}
        />
      </div>
    </div>
  );
}

function Tags() {
  const [tags, setTags] = useState(['design', 'motion', 'layout']);
  const {ref, before} = useReportedChange(tags.length);
  return (
    <div style={card}>
      <p style={label}>“+ Add tag”: chips that wrap to a new line</p>
      <div ref={ref} style={{display: 'flex', flexWrap: 'wrap', gap: 6}}>
        {tags.map(tag => (
          <span
            key={tag}
            style={{
              padding: '2px 10px',
              borderRadius: 9999,
              border: '1px solid var(--color-border)',
              background: 'var(--color-background-muted)',
            }}>
            {tag}
          </span>
        ))}
      </div>
      <div style={{marginTop: 8, display: 'flex', gap: 8}}>
        <Button
          label="+ Add tag"
          onClick={() => {
            before();
            setTags([...tags, `tag ${tags.length + 1}`]);
          }}
        />
        <Button
          label="Reset"
          variant="secondary"
          onClick={() => {
            before();
            setTags(['design', 'motion', 'layout']);
          }}
        />
      </div>
    </div>
  );
}

function Section({title, children}: {title: string; children: ReactNode}) {
  return (
    <section style={{margin: '0 0 12px'}}>
      <p style={label}>{title}</p>
      {children}
    </section>
  );
}

/**
 * Everything inside the ScrollableArea is one area: a size change anywhere
 * in it glides the content after the change. The sticky header and the
 * absolute badge stay put; the `display: contents` wrapper's children move
 * on their own.
 */
export const AnimatedLayout: Story = {
  name: 'Animated layout',
  render: () => (
    <div style={{maxWidth: 520}}>
      <ScrollableArea height={560} label="Animated layout demo">
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            padding: '10px 12px',
            fontWeight: 600,
            background: 'var(--color-background-surface)',
            borderBottom: '1px solid var(--color-border)',
            fontFamily: 'var(--font-family-body)',
          }}>
          Sticky header (stays put)
        </div>
        <div style={{padding: 12}}>
          <Section title="A nested tree (TreeList adopts the module)">
            <div style={card}>
              <TreeList aria-label="Files" items={TREE} />
            </div>
          </Section>
          <Section title="A Collapsible (adopts the module)">
            <div style={card}>
              <Collapsible trigger="Shipping details" defaultIsOpen={false}>
                <p style={{margin: '4px 0'}}>Ships in 2 business days.</p>
                <p style={{margin: '4px 0'}}>Free returns for 30 days.</p>
                <p style={{margin: '4px 0'}}>Tracking arrives by email.</p>
              </Collapsible>
            </div>
          </Section>
          <FieldError />
          <LoadMore />
          <Tags />
          <div style={{...plain, position: 'relative'}}>
            A plain app div with an absolute badge (the badge rides with it)
            <span
              style={{
                position: 'absolute',
                top: -8,
                insetInlineEnd: -8,
                padding: '2px 8px',
                borderRadius: 9999,
                background: 'var(--color-background-inverted)',
                color: 'var(--color-background-body)',
                fontSize: 12,
              }}>
              New
            </span>
          </div>
          <div style={{display: 'contents'}}>
            <div style={plain}>Inside a display: contents wrapper (1)</div>
            <div style={plain}>Inside a display: contents wrapper (2)</div>
          </div>
          {Array.from({length: 8}, (_, i) => (
            <div key={i} style={plain}>
              Plain app content after the changes ({i + 1})
            </div>
          ))}
        </div>
      </ScrollableArea>
    </div>
  ),
};

function PanelDemo() {
  const panel = useRef<HTMLDivElement>(null);
  useAnimatedLayout(panel);
  return (
    <div
      ref={panel}
      style={{
        maxWidth: 520,
        padding: 12,
        border: '2px dashed var(--color-border-emphasized)',
        borderRadius: 16,
      }}>
      <div style={card}>
        <Collapsible trigger="Advanced settings" defaultIsOpen={false}>
          <p style={{margin: '4px 0'}}>Cache size, retries and timeouts.</p>
          <p style={{margin: '4px 0'}}>Changes apply on the next sync.</p>
        </Collapsible>
      </div>
      <div style={plain}>Content after, in an app panel</div>
      <div style={plain}>More content</div>
    </div>
  );
}

/** An app's own container opts in with `useAnimatedLayout(ref)`. */
export const AppPanel: Story = {
  name: 'App panel (useAnimatedLayout)',
  render: () => <PanelDemo />,
};
