import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef} from 'react';
import {useXDSToast} from '@xds/core/Toast';
import {XDSLayerProvider} from '@xds/core/Layer';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';
import {XDSToggleButton, XDSToggleButtonGroup} from '@xds/core/ToggleButton';
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
      onClick={() => toast({body: 'This is an info toast'})}
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
  const types: XDSToastType[] = ['info', 'error'];
  return (
    <XDSStack direction="row" gap={2}>
      {types.map(type => (
        <XDSButton
          key={type}
          label={type}
          variant={type === 'error' ? 'destructive' : 'secondary'}
          onClick={() =>
            toast({
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
          'Two toast types: info (default) and error. Error toasts persist until dismissed.',
      },
    },
  },
};

// =============================================================================
// With Action (endContent)
// =============================================================================

function WithActionDemo() {
  const toast = useXDSToast();
  return (
    <XDSStack direction="row" gap={2}>
      <XDSButton
        label="With button"
        onClick={() =>
          toast({
            body: 'Item deleted',
            type: 'info',
            isAutoHide: false,
            endContent: (
              <XDSButton
                label="Undo"
                variant="secondary"
                size="sm"
                onClick={() => console.log('Undo!')}
              />
            ),
          })
        }
      />
      <XDSButton
        label="With link"
        variant="secondary"
        onClick={() =>
          toast({
            body: 'Your report is ready.',
            type: 'info',
            isAutoHide: false,
            endContent: (
              <XDSLink label="View report" href="#" hasUnderline>View report</XDSLink>
            ),
          })
        }
      />
    </XDSStack>
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
            body: 'Uploading...',
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
            body: 'You are offline',
            type: 'info',
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
            body: `Uploading... ${Math.floor(Math.random() * 100)}%`,
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
        const types: XDSToastType[] = ['info', 'error'];
        const type = types[countRef.current % types.length];
        toast({
          body: `Toast #${countRef.current} — This is a ${type} toast.`,
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

function PositionsDemoInner({
  position,
  onPositionChange,
}: {
  position: XDSToastPosition;
  onPositionChange: (pos: XDSToastPosition) => void;
}) {
  const toast = useXDSToast();

  return (
    <XDSStack gap={3}>
      <XDSToggleButtonGroup
        type="single"
        value={position}
        onChange={(value: string | null) => {
          if (value != null) onPositionChange(value as XDSToastPosition);
        }}
        label="Toast position"
      >
        <XDSToggleButton value="topStart" label="Top Start" />
        <XDSToggleButton value="topEnd" label="Top End" />
        <XDSToggleButton value="bottomStart" label="Bottom Start" />
        <XDSToggleButton value="bottomEnd" label="Bottom End" />
      </XDSToggleButtonGroup>
      <XDSButton
        label="Toggle Toast"
        onClick={() =>
          toast({
            body: `Toast at ${position}`,
            type: 'info',
          })
        }
      />
    </XDSStack>
  );
}

function PositionsDemo() {
  const [position, setPosition] = useState<XDSToastPosition>('bottomEnd');

  return (
    <XDSLayerProvider toast={{position}}>
      <PositionsDemoInner position={position} onPositionChange={setPosition} />
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
              body: 'Works without a provider! A fallback viewport was created on document.body.',
              type: 'info',
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

// =============================================================================
// Toast over Dialog
// =============================================================================

import {XDSDialog} from '@xds/core/Dialog';

function ToastOverDialogDemo() {
  const toast = useXDSToast();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <XDSStack gap={2}>
      <XDSButton label="Open dialog" onClick={() => setIsOpen(true)} />
      <XDSDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Save changes?"
        footer={
          <XDSStack direction="row" gap={2}>
            <XDSButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsOpen(false)}
            />
            <XDSButton
              label="Save"
              onClick={() => {
                toast({body: 'Changes saved successfully.'});
                setIsOpen(false);
              }}
            />
          </XDSStack>
        }>
        <p>Your unsaved changes will be lost. Do you want to save them?</p>
      </XDSDialog>
    </XDSStack>
  );
}

export const ToastOverDialog: StoryObj = {
  render: () => <ToastOverDialogDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Toasts render in the top layer via popover="manual", so they appear above dialogs. Click Save to dismiss the dialog and show a toast — it should be visible on top.',
      },
    },
  },
};
