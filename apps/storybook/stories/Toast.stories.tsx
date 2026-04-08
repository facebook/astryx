import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSLayerProvider} from '@xds/core/Layer';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';
import type {XDSToastPosition, XDSToastType} from '@xds/core/Toast';

// =============================================================================
// Helper — wraps children with a provider for stories that need config
// =============================================================================

function ToastDemo({children}: {children: React.ReactNode}) {
  return <>{children}</>;
}

const meta: Meta = {
  title: 'Core/XDSToast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Imperative toast notification system. Use `useXDSToast()` to show transient feedback messages. Works with or without `XDSLayerProvider`.',
      },
    },
  },
};

export default meta;

// =============================================================================
// Default
// =============================================================================

function DefaultDemo() {
  const toast = useXDSToast();
  return (
    <XDSButton
      label="Show toast"
      onClick={() => toast({title: 'This is an info toast'})}
    />
  );
}

export const Default: StoryObj = {
  render: () => <DefaultDemo />,
};

// =============================================================================
// Types
// =============================================================================

function TypesDemo() {
  const toast = useXDSToast();
  const types: XDSToastType[] = ['info', 'success', 'warning', 'error'];
  return (
    <XDSStack direction="row" gap={2}>
      {types.map(type => (
        <XDSButton
          key={type}
          label={type}
          variant={type === 'error' ? 'destructive' : 'secondary'}
          onClick={() =>
            toast({
              title: `${type.charAt(0).toUpperCase() + type.slice(1)} toast`,
              body: `This is a ${type} notification.`,
              type,
            })
          }
        />
      ))}
    </XDSStack>
  );
}

export const Types: StoryObj = {
  render: () => <TypesDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Four toast types: info (default), success, warning, error. Error toasts persist until dismissed.',
      },
    },
  },
};

// =============================================================================
// With Body
// =============================================================================

function WithBodyDemo() {
  const toast = useXDSToast();
  return (
    <XDSButton
      label="Show toast with body"
      onClick={() =>
        toast({
          title: 'Changes saved',
          body: 'Your profile has been updated successfully. Changes may take a few minutes to propagate.',
          type: 'success',
        })
      }
    />
  );
}

export const WithBody: StoryObj = {
  render: () => <WithBodyDemo />,
};

// =============================================================================
// With Action (endContent)
// =============================================================================

function WithActionDemo() {
  const toast = useXDSToast();
  return (
    <XDSButton
      label="Delete item"
      variant="destructive"
      onClick={() =>
        toast({
          title: 'Item deleted',
          type: 'info',
          endContent: (
            <XDSButton
              label="Undo"
              variant="ghost"
              size="compact"
              onClick={() => console.log('Undo!')}
            />
          ),
        })
      }
    />
  );
}

export const WithAction: StoryObj = {
  render: () => <WithActionDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Use `endContent` for action buttons. Named positionally (not `action`) because the slot can hold any content — buttons, spinners, etc.',
      },
    },
  },
};

// =============================================================================
// Error Persists
// =============================================================================

function ErrorPersistsDemo() {
  const toast = useXDSToast();
  return (
    <XDSButton
      label="Trigger error"
      variant="destructive"
      onClick={() =>
        toast({
          title: 'Failed to save',
          body: 'Check your network connection and try again.',
          type: 'error',
        })
      }
    />
  );
}

export const ErrorPersists: StoryObj = {
  render: () => <ErrorPersistsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Error toasts default to `isAutoHide: false` — they persist until the user dismisses them.',
      },
    },
  },
};

// =============================================================================
// Programmatic Dismiss
// =============================================================================

function ProgrammaticDismissDemo() {
  const toast = useXDSToast();
  const dismissRef = useRef<(() => void) | null>(null);
  return (
    <XDSStack direction="row" gap={2}>
      <XDSButton
        label="Show persistent toast"
        onClick={() => {
          dismissRef.current = toast({
            title: 'Uploading...',
            type: 'info',
            isAutoHide: false,
          });
        }}
      />
      <XDSButton
        label="Dismiss"
        variant="secondary"
        onClick={() => {
          dismissRef.current?.();
          dismissRef.current = null;
        }}
      />
    </XDSStack>
  );
}

export const ProgrammaticDismiss: StoryObj = {
  render: () => <ProgrammaticDismissDemo />,
  parameters: {
    docs: {
      description: {
        story:
          '`useXDSToast()` returns a dismiss function for each toast. Call it to remove the toast programmatically.',
      },
    },
  },
};

// =============================================================================
// Deduplication
// =============================================================================

function DeduplicationDemo() {
  const toast = useXDSToast();
  return (
    <XDSStack direction="row" gap={2}>
      <XDSButton
        label="Show offline toast (ignore)"
        onClick={() =>
          toast({
            title: 'You are offline',
            type: 'warning',
            uniqueID: 'offline',
            collisionBehavior: 'ignore',
            isAutoHide: false,
          })
        }
      />
      <XDSButton
        label="Show progress toast (overwrite)"
        variant="secondary"
        onClick={() =>
          toast({
            title: `Uploading... ${Math.floor(Math.random() * 100)}%`,
            type: 'info',
            uniqueID: 'upload-progress',
            collisionBehavior: 'overwrite',
            isAutoHide: false,
          })
        }
      />
    </XDSStack>
  );
}

export const Deduplication: StoryObj = {
  render: () => <DeduplicationDemo />,
  parameters: {
    docs: {
      description: {
        story:
          '`uniqueID` prevents duplicate toasts. `ignore` keeps the existing toast; `overwrite` replaces it.',
      },
    },
  },
};

// =============================================================================
// Stacking
// =============================================================================

function StackingDemo() {
  const toast = useXDSToast();
  const countRef = useRef(0);
  return (
    <XDSButton
      label="Add toast"
      onClick={() => {
        countRef.current++;
        const types: XDSToastType[] = ['info', 'success', 'warning', 'error'];
        const type = types[countRef.current % types.length];
        toast({
          title: `Toast #${countRef.current}`,
          body: `This is a ${type} toast.`,
          type,
        });
      }}
    />
  );
}

export const Stacking: StoryObj = {
  render: () => <StackingDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Multiple toasts stack vertically. Click rapidly to see them stack. Default max is 5 visible.',
      },
    },
  },
};

// =============================================================================
// Positions (with XDSLayerProvider)
// =============================================================================

function PositionDemoInner({position}: {position: XDSToastPosition}) {
  const toast = useXDSToast();
  return (
    <XDSButton
      label={position}
      variant="secondary"
      onClick={() =>
        toast({
          title: `Toast at ${position}`,
          type: 'info',
        })
      }
    />
  );
}

function PositionsDemo() {
  const [position, setPosition] = useState<XDSToastPosition>('bottomEnd');
  const positions: XDSToastPosition[] = [
    'bottomEnd',
    'bottomStart',
    'topEnd',
    'topStart',
  ];
  return (
    <XDSLayerProvider toast={{position}}>
      <XDSStack direction="row" gap={2}>
        {positions.map(pos => (
          <XDSButton
            key={pos}
            label={pos}
            variant={pos === position ? 'primary' : 'secondary'}
            onClick={() => setPosition(pos)}
          />
        ))}
      </XDSStack>
      <div style={{marginTop: 12}}>
        <PositionDemoInner position={position} />
      </div>
    </XDSLayerProvider>
  );
}

export const Positions: StoryObj = {
  render: () => <PositionsDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Use `XDSLayerProvider` to configure toast position. Supports 4 corners with logical directions (RTL-safe).',
      },
    },
  },
};

// =============================================================================
// No Provider (fallback)
// =============================================================================

function NoProviderDemo() {
  const toast = useXDSToast();
  return (
    <XDSCard padding={4}>
      <XDSStack gap={2}>
        <p style={{margin: 0, fontSize: 14}}>
          This demo has no XDSLayerProvider. The hook creates a fallback
          viewport automatically.
        </p>
        <XDSButton
          label="Show toast (no provider)"
          onClick={() =>
            toast({
              title: 'Works without a provider!',
              body: 'A fallback viewport was created on document.body.',
              type: 'success',
            })
          }
        />
      </XDSStack>
    </XDSCard>
  );
}

export const NoProvider: StoryObj = {
  render: () => <NoProviderDemo />,
  parameters: {
    docs: {
      description: {
        story:
          '`useXDSToast()` works without `XDSLayerProvider`. On first call, it lazily mounts a fallback viewport with default config.',
      },
    },
  },
};
