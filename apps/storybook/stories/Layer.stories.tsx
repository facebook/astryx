// Copyright (c) Meta Platforms, Inc. and affiliates.

import {useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {useLayer} from '@xds/core/Layer';
import {LayerProvider} from '@xds/core/Layer';
import {Button} from '@xds/core/Button';
import {Text} from '@xds/core/Text';

const styles = stylex.create({
  popoverContent: {
    backgroundColor: 'var(--xds-color-surface-raised)',
    borderRadius: 8,
    padding: 16,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid var(--xds-color-border-default)',
  },
  demoArea: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
});

const meta: Meta = {
  title: 'Core/Layer',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Layer is the core positioning hook for overlay content using CSS Anchor Positioning and the Popover API. Used as the foundation for Popover, HoverCard, and Tooltip.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function ContextModeDemo() {
  const layer = useLayer({mode: 'context', lightDismiss: true});

  return (
    <div {...stylex.props(styles.demoArea)}>
      <Button
        ref={layer.ref}
        label="Show layer"
        onClick={() => (layer.isOpen ? layer.hide() : layer.show())}
      />
      {layer.render(
        <div {...stylex.props(styles.popoverContent)}>
          <Text type="body">
            This layer is anchored to the button using CSS Anchor Positioning.
          </Text>
        </div>,
        {placement: 'below', alignment: 'center'},
      )}
    </div>
  );
}

export const ContextMode: Story = {
  render: () => <ContextModeDemo />,
};

function PlacementDemo() {
  const [placement, setPlacement] = useState<
    'above' | 'below' | 'start' | 'end'
  >('above');
  const layer = useLayer({mode: 'context', lightDismiss: true});

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        alignItems: 'center',
      }}>
      <div style={{display: 'flex', gap: 8}}>
        {(['above', 'below', 'start', 'end'] as const).map(p => (
          <Button
            key={p}
            label={p}
            variant={placement === p ? 'primary' : 'secondary'}
            onClick={() => setPlacement(p)}
          />
        ))}
      </div>
      <div {...stylex.props(styles.demoArea)}>
        <Button
          ref={layer.ref}
          label="Trigger"
          onClick={() => (layer.isOpen ? layer.hide() : layer.show())}
        />
        {layer.render(
          <div {...stylex.props(styles.popoverContent)}>
            <Text type="body">Placement: {placement}</Text>
          </div>,
          {placement, alignment: 'center'},
        )}
      </div>
    </div>
  );
}

export const Placements: Story = {
  render: () => <PlacementDemo />,
};

function FixedModeDemo() {
  const [coords, setCoords] = useState({x: 0, y: 0});
  const layer = useLayer({mode: 'fixed', lightDismiss: true});

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 300,
        border: '1px dashed var(--xds-color-border-default)',
        borderRadius: 8,
        cursor: 'crosshair',
      }}
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        setCoords({
          x: e.clientX - rect.left + rect.left,
          y: e.clientY - rect.top + rect.top,
        });
        layer.show();
      }}>
      <Text type="supporting" style={{padding: 16}}>
        Click anywhere in this area to show a fixed-position layer
      </Text>
      {layer.render(
        <div {...stylex.props(styles.popoverContent)}>
          <Text type="body">
            Fixed at ({Math.round(coords.x)}, {Math.round(coords.y)})
          </Text>
        </div>,
        {x: coords.x, y: coords.y},
      )}
    </div>
  );
}

export const FixedMode: Story = {
  render: () => <FixedModeDemo />,
};

function LayerProviderDemo() {
  return (
    <LayerProvider toast={{position: 'topEnd', maxVisible: 3}}>
      <div style={{padding: 16}}>
        <Text type="body">
          LayerProvider wraps your app to configure layer systems (toast
          positioning, max visible toasts). It is optional — hooks fall back to
          defaults when no provider exists.
        </Text>
      </div>
    </LayerProvider>
  );
}

export const Provider: Story = {
  render: () => <LayerProviderDemo />,
};
