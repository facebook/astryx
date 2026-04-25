import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
} from '@xds/core/theme/tokens.stylex';
import {XDSResizeHandle, useXDSResizable} from '@xds/core/Resizable';
import {XDSText, XDSHeading} from '@xds/core/Text';
import {
  XDSLayout,
  XDSLayoutContent,
  XDSLayoutPanel,
  XDSStack,
} from '@xds/core/Layout';
import {XDSSideNav, XDSSideNavItem} from '@xds/core/SideNav';
import {XDSDivider} from '@xds/core/Divider';

const ps = stylex.create({
  shell: {
    height: 400,
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colorVars['--color-border'],
    borderRadius: radiusVars['--radius-container'],
    overflow: 'hidden',
  },
  sz: {opacity: 0.6, fontSize: 12, fontFamily: 'monospace'},
});

const meta: Meta<typeof XDSResizeHandle> = {
  title: 'Lab/Resizable',
  component: XDSResizeHandle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Hook-based resizable panel system. useXDSResizable() manages size state; ' +
          'XDSResizeHandle provides the interactive pill-grip separator with optional divider line.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof XDSResizeHandle>;
