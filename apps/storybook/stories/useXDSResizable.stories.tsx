import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
} from '@xds/core/theme/tokens.stylex';
import {useXDSResizable, XDSResizeHandle} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';

const s = stylex.create({
  container: {
    display: 'flex',
    height: 300,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
    backgroundColor: colorVars['--color-background-surface'],
  },
  containerV: {flexDirection: 'column'},
  panel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: 14,
    color: colorVars['--color-text-secondary'],
    overflow: 'hidden',
    flexShrink: 0,
  },
  flex: {flex: 1, minWidth: 0, minHeight: 0},
  muted: {backgroundColor: colorVars['--color-background-muted']},
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
          'Hook that manages resize state for panel regions. ' +
          'Pair with XDSResizeHandle for interactive resizing.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof HookDemo>;

/** Two side-by-side panels. Drag the handle to resize. */
export const Horizontal: Story = {
  render: () => {
    const left = useXDSResizable({
      defaultSize: 200,
      minSizePx: 100,
      maxSizePx: 500,
    });
    return (
      <div {...stylex.props(s.container)}>
        <div {...stylex.props(s.panel, s.muted)} style={{width: left.size}}>
          Sidebar
        </div>
        <XDSResizeHandle direction="horizontal" resizable={left.props} />
        <div {...stylex.props(s.panel, s.flex)}>Content</div>
      </div>
    );
  },
};

/** Vertical layout — top and bottom panels. */
export const Vertical: Story = {
  render: () => {
    const top = useXDSResizable({
      defaultSize: 150,
      minSizePx: 60,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.container, s.containerV)}>
        <div {...stylex.props(s.panel, s.muted)} style={{height: top.size}}>
          Header
        </div>
        <XDSResizeHandle direction="vertical" resizable={top.props} />
        <div {...stylex.props(s.panel, s.flex)}>Content</div>
      </div>
    );
  },
};

/** Three panels with two handles — like a mail client layout. */
export const ThreePanel: Story = {
  render: () => {
    const left = useXDSResizable({
      defaultSize: 180,
      minSizePx: 120,
      maxSizePx: 300,
    });
    const right = useXDSResizable({
      defaultSize: 220,
      minSizePx: 150,
      maxSizePx: 400,
    });
    return (
      <div {...stylex.props(s.container)}>
        <div {...stylex.props(s.panel, s.muted)} style={{width: left.size}}>
          Folders
        </div>
        <XDSResizeHandle direction="horizontal" resizable={left.props} />
        <div {...stylex.props(s.panel, s.flex)}>Inbox</div>
        <XDSResizeHandle direction="horizontal" resizable={right.props} />
        <div {...stylex.props(s.panel, s.muted)} style={{width: right.size}}>
          Preview
        </div>
      </div>
    );
  },
};

/** Nested — horizontal split with a vertical split inside the main area. */
export const Nested: Story = {
  render: () => {
    const sidebar = useXDSResizable({
      defaultSize: 200,
      minSizePx: 120,
      maxSizePx: 350,
    });
    const editor = useXDSResizable({
      defaultSize: 200,
      minSizePx: 80,
      maxSizePx: 250,
    });
    return (
      <div {...stylex.props(s.container)}>
        <div {...stylex.props(s.panel, s.muted)} style={{width: sidebar.size}}>
          Explorer
        </div>
        <XDSResizeHandle direction="horizontal" resizable={sidebar.props} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}>
          <div
            {...stylex.props(s.panel)}
            style={{height: editor.size, flex: 'none'}}>
            Editor
          </div>
          <XDSResizeHandle direction="vertical" resizable={editor.props} />
          <div {...stylex.props(s.panel, s.muted, s.flex)}>Terminal</div>
        </div>
      </div>
    );
  },
};
