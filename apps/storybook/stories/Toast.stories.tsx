import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef} from 'react';
import {useXDSToast, XDSToastViewport} from '@xds/core/Toast';
import type {XDSToastType} from '@xds/core/Toast';
import {XDSButton} from '@xds/core/Button';
import {XDSLink} from '@xds/core/Link';
import {XDSCard} from '@xds/core/Card';
import {XDSStack} from '@xds/core/Stack';
import {XDSDialog} from '@xds/core/Dialog';

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

export const Default: StoryObj = {
  render: function DefaultStory() {
    const toast = useXDSToast();
    return (
      <XDSButton
        label="Show toast"
        onClick={() => toast({body: 'This is an info toast'})}
      />
    );
  },
};

// =============================================================================
// Types
// =============================================================================

export const Types: StoryObj = {
  render: function TypesStory() {
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
  },
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

export const WithAction: StoryObj = {
  render: function WithActionStory() {
    const toast = useXDSToast();
    return (
      <XDSStack direction="row" gap={2}>
        <XDSButton
          label="With button"
          onClick={() =>
            toast({
              body: 'Item deleted',
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
              isAutoHide: false,
              endContent: (
                <XDSLink href="#" hasUnderline>
                  View report
                </XDSLink>
              ),
            })
          }
        />
      </XDSStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `endContent` for trailing actions — buttons, links, or any content.',
      },
    },
  },
};

// =============================================================================
// Error Persists
// =============================================================================

export const ErrorPersists: StoryObj = {
  render: function ErrorPersistsStory() {
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
  },
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

export const ProgrammaticDismiss: StoryObj = {
  render: function ProgrammaticDismissStory() {
    const toast = useXDSToast();
    const dismissRef = useRef<(() => void) | null>(null);
    return (
      <XDSStack direction="row" gap={2}>
        <XDSButton
          label="Show persistent toast"
          onClick={() => {
            dismissRef.current = toast({
              body: 'Uploading...',
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
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useXDSToast()` returns a dismiss function. Call it to remove the toast programmatically.',
      },
    },
  },
};

// =============================================================================
// Deduplication
// =============================================================================

export const Deduplication: StoryObj = {
  render: function DeduplicationStory() {
    const toast = useXDSToast();
    return (
      <XDSStack direction="row" gap={2}>
        <XDSButton
          label="Offline (ignore)"
          onClick={() =>
            toast({
              body: 'You are offline',
              uniqueID: 'offline',
              collisionBehavior: 'ignore',
              isAutoHide: false,
            })
          }
        />
        <XDSButton
          label="Progress (overwrite)"
          variant="secondary"
          onClick={() =>
            toast({
              body: `Uploading... ${Math.floor(Math.random() * 100)}%`,
              uniqueID: 'upload-progress',
              collisionBehavior: 'overwrite',
              isAutoHide: false,
            })
          }
        />
      </XDSStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`uniqueID` prevents duplicate toasts. `ignore` keeps the existing; `overwrite` replaces it.',
      },
    },
  },
};

// =============================================================================
// Stacking
// =============================================================================

export const Stacking: StoryObj = {
  render: function StackingStory() {
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
            body: `Toast #${countRef.current} — ${type} notification.`,
            type,
          });
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Multiple toasts stack vertically. Default max visible is 5.',
      },
    },
  },
};

// =============================================================================
// No Provider (fallback)
// =============================================================================

export const NoProvider: StoryObj = {
  render: function NoProviderStory() {
    const toast = useXDSToast();
    return (
      <XDSCard padding={4}>
        <XDSStack gap={2}>
          <p style={{margin: 0, fontSize: 14}}>
            No XDSLayerProvider — the hook creates a fallback viewport on
            document.body automatically.
          </p>
          <XDSButton
            label="Show toast"
            onClick={() =>
              toast({
                body: 'Works without a provider!',
              })
            }
          />
        </XDSStack>
      </XDSCard>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useXDSToast()` works without a provider. It lazily mounts a fallback viewport on first call.',
      },
    },
  },
};

// =============================================================================
// Toast over Dialog
// =============================================================================

export const ToastOverDialog: StoryObj = {
  render: function ToastOverDialogStory() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <XDSStack gap={2}>
        <XDSButton label="Open dialog" onClick={() => setIsOpen(true)} />
        <XDSDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Dialog with scoped toasts">
          <XDSToastViewport isTopLayer={false}>
            <DialogToastContent onClose={() => setIsOpen(false)} />
          </XDSToastViewport>
        </XDSDialog>
      </XDSStack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Dialog with its own `XDSToastViewport` — toasts render inside the dialog\'s top layer context and appear above the dialog overlay.',
      },
    },
  },
};

function DialogToastContent({onClose}: {onClose: () => void}) {
  const toast = useXDSToast();
  return (
    <XDSStack gap={3}>
      <p>
        This dialog has its own toast viewport. Toasts fired here render
        inside the dialog — above its overlay.
      </p>
      <XDSStack direction="row" gap={2} wrap="wrap">
        <XDSButton
          label="Close"
          variant="secondary"
          onClick={onClose}
        />
        <XDSButton
          label="Show toast"
          onClick={() => {
            toast({body: 'Toast from inside the dialog!'});
          }}
        />
        <XDSButton
          label="Error toast"
          variant="destructive"
          onClick={() => {
            toast({body: 'Something went wrong.', type: 'error'});
          }}
        />
      </XDSStack>
    </XDSStack>
  );
}
