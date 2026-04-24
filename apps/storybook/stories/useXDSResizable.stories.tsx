import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '@xds/core/theme/tokens.stylex';
import {useXDSResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {XDSStack} from '@xds/core/Layout';
import {XDSButton} from '@xds/core/Button';

const ps = stylex.create({
  demo: {
    padding: spacingVars['--spacing-4'],
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: 8,
  },
  row: {
    display: 'flex',
    gap: spacingVars['--spacing-2'],
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  mono: {fontFamily: 'monospace', fontSize: 13, opacity: 0.7},
  bar: {
    height: 24,
    borderRadius: 4,
    backgroundColor: colorVars['--color-accent'],
    transitionProperty: 'width',
    transitionDuration: '150ms',
  },
});

function HookDemo({children}: {children: React.ReactNode}) {
  return <div>{children}</div>;
}

const meta: Meta<typeof HookDemo> = {
  title: 'Core/Hooks/useXDSResizable',
  component: HookDemo,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook that manages resize state for panel regions. Returns reactive size, ' +
          'isCollapsed, and imperative collapse()/expand()/resize() methods.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof HookDemo>;

/** Shows the reactive size value, imperative resize(), and min/max clamping. */
export const BasicState: Story = {
  render: () => {
    const region = useXDSResizable({
      defaultSize: 200,
      minSizePx: 50,
      maxSizePx: 400,
    });
    return (
      <div {...stylex.props(ps.demo)}>
        <XDSStack gap="space3">
          <XDSHeading level={4}>useXDSResizable — basic state</XDSHeading>
          <div {...stylex.props(ps.row)}>
            <span {...stylex.props(ps.mono)}>size: {region.size}px</span>
            <span {...stylex.props(ps.mono)}>min: 50 / max: 400</span>
          </div>
          <div {...stylex.props(ps.bar)} style={{width: region.size}} />
          <div {...stylex.props(ps.row)}>
            <XDSButton
              variant="secondary"
              size="sm"
              label="50px"
              onClick={() => region.resize(50)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="200px"
              onClick={() => region.resize(200)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="400px"
              onClick={() => region.resize(400)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="999 (clamped)"
              onClick={() => region.resize(999)}
            />
          </div>
        </XDSStack>
      </div>
    );
  },
};

/** Collapse and expand via imperative API. */
export const CollapseExpand: Story = {
  render: () => {
    const region = useXDSResizable({
      defaultSize: 250,
      minSizePx: 100,
      collapsible: true,
      collapsedSize: 40,
    });
    return (
      <div {...stylex.props(ps.demo)}>
        <XDSStack gap="space3">
          <XDSHeading level={4}>collapse / expand</XDSHeading>
          <div {...stylex.props(ps.row)}>
            <span {...stylex.props(ps.mono)}>
              size: {region.size}px | collapsed: {String(region.isCollapsed)}
            </span>
          </div>
          <div
            {...stylex.props(ps.bar)}
            style={{
              width: region.isCollapsed ? 4 : region.size,
              opacity: region.isCollapsed ? 0.3 : 1,
            }}
          />
          <div {...stylex.props(ps.row)}>
            <XDSButton
              variant="secondary"
              size="sm"
              label="Collapse"
              onClick={() => region.collapse()}
              isDisabled={region.isCollapsed}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="Expand"
              onClick={() => region.expand()}
              isDisabled={!region.isCollapsed}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="Resize 300"
              onClick={() => region.resize(300)}
            />
          </div>
        </XDSStack>
      </div>
    );
  },
};

/** Snap points — region snaps to nearest defined value. */
export const WithSnapPoints: Story = {
  render: () => {
    const region = useXDSResizable({
      defaultSize: 260,
      minSizePx: 56,
      maxSizePx: 400,
      snaps: [56, 150, 260],
    });
    return (
      <div {...stylex.props(ps.demo)}>
        <XDSStack gap="space3">
          <XDSHeading level={4}>snap points: 56, 150, 260</XDSHeading>
          <span {...stylex.props(ps.mono)}>size: {region.size}px</span>
          <div {...stylex.props(ps.bar)} style={{width: region.size}} />
          <div {...stylex.props(ps.row)}>
            <XDSButton
              variant="secondary"
              size="sm"
              label="56"
              onClick={() => region.resize(56)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="60 (snaps 56)"
              onClick={() => region.resize(60)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="150"
              onClick={() => region.resize(150)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="260"
              onClick={() => region.resize(260)}
            />
          </div>
        </XDSStack>
      </div>
    );
  },
};

/** Multi-region — coordinated regions from a single hook call. */
export const MultiRegion: Story = {
  render: () => {
    const regions = useXDSResizable({
      direction: 'horizontal',
      regions: {
        sidebar: {defaultSize: 200, minSizePx: 100, maxSizePx: 350},
        inspector: {defaultSize: 180, minSizePx: 80, maxSizePx: 300},
      },
    });
    return (
      <div {...stylex.props(ps.demo)}>
        <XDSStack gap="space3">
          <XDSHeading level={4}>multi-region</XDSHeading>
          <div {...stylex.props(ps.row)}>
            <span {...stylex.props(ps.mono)}>
              sidebar: {regions.sidebar.size}px
            </span>
            <span {...stylex.props(ps.mono)}>
              inspector: {regions.inspector.size}px
            </span>
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <div
              {...stylex.props(ps.bar)}
              style={{width: regions.sidebar.size}}
            />
            <div
              {...stylex.props(ps.bar)}
              style={{width: regions.inspector.size, opacity: 0.6}}
            />
          </div>
          <div {...stylex.props(ps.row)}>
            <XDSButton
              variant="secondary"
              size="sm"
              label="Sidebar 100"
              onClick={() => regions.sidebar.resize(100)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="Sidebar 300"
              onClick={() => regions.sidebar.resize(300)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="Inspector 80"
              onClick={() => regions.inspector.resize(80)}
            />
            <XDSButton
              variant="secondary"
              size="sm"
              label="Inspector 250"
              onClick={() => regions.inspector.resize(250)}
            />
          </div>
        </XDSStack>
      </div>
    );
  },
};
