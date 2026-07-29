// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef} from 'react';
import {useToast, ToastViewport, Toast} from '@astryxdesign/core/Toast';
import type {ToastType} from '@astryxdesign/core/Toast';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Stack';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Theme, defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';

const meta: Meta = {
  title: 'Core/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Imperative toast notification system. Use `useToast()` to show transient feedback messages. Works with or without `LayerProvider`.',
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
    const toast = useToast();
    return (
      <Button
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
    const toast = useToast();
    const types: ToastType[] = ['info', 'error'];
    return (
      <Stack direction="horizontal" gap={2}>
        {types.map(type => (
          <Button
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
      </Stack>
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
    const toast = useToast();
    return (
      <Stack direction="horizontal" gap={2}>
        <Button
          label="With button"
          onClick={() =>
            toast({
              body: 'Item deleted',
              isAutoHide: false,
              endContent: (
                <Button
                  label="Undo"
                  variant="secondary"
                  size="sm"
                  onClick={() => console.log('Undo!')}
                />
              ),
            })
          }
        />
        <Button
          label="With link"
          variant="secondary"
          onClick={() =>
            toast({
              body: 'Your report is ready.',
              isAutoHide: false,
              endContent: (
                <Link href="#" hasUnderline>
                  View report
                </Link>
              ),
            })
          }
        />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use `endContent` for trailing actions: buttons, links, or any content.',
      },
    },
  },
};

// =============================================================================
// Error Persists
// =============================================================================

export const ErrorPersists: StoryObj = {
  render: function ErrorPersistsStory() {
    const toast = useToast();
    return (
      <Button
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
          'Error toasts default to `isAutoHide: false`; they persist until the user dismisses them.',
      },
    },
  },
};

// =============================================================================
// Programmatic Dismiss
// =============================================================================

export const ProgrammaticDismiss: StoryObj = {
  render: function ProgrammaticDismissStory() {
    const toast = useToast();
    const dismissRef = useRef<(() => void) | null>(null);
    return (
      <Stack direction="horizontal" gap={2}>
        <Button
          label="Show persistent toast"
          onClick={() => {
            dismissRef.current = toast({
              body: 'Uploading...',
              isAutoHide: false,
            });
          }}
        />
        <Button
          label="Dismiss"
          variant="secondary"
          onClick={() => {
            dismissRef.current?.();
            dismissRef.current = null;
          }}
        />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useToast()` returns a dismiss function. Call it to remove the toast programmatically.',
      },
    },
  },
};

// =============================================================================
// Deduplication
// =============================================================================

export const Deduplication: StoryObj = {
  render: function DeduplicationStory() {
    const toast = useToast();
    return (
      <Stack direction="horizontal" gap={2}>
        <Button
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
        <Button
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
      </Stack>
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
    const toast = useToast();
    const countRef = useRef(0);
    return (
      <Button
        label="Add toast"
        onClick={() => {
          countRef.current++;
          const types: ToastType[] = ['info', 'error'];
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
        story: 'Multiple toasts stack vertically. Default max visible is 5.',
      },
    },
  },
};

// =============================================================================
// No Provider (fallback)
// =============================================================================

export const NoProvider: StoryObj = {
  render: function NoProviderStory() {
    const toast = useToast();
    return (
      <Card padding={4}>
        <Stack gap={2}>
          <p style={{margin: 0, fontSize: 14}}>
            No LayerProvider: the hook creates a fallback viewport on
            document.body automatically.
          </p>
          <Button
            label="Show toast"
            onClick={() =>
              toast({
                body: 'Works without a provider!',
              })
            }
          />
        </Stack>
      </Card>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          '`useToast()` works without a provider. It lazily mounts a fallback viewport on first call.',
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
      <Stack gap={2}>
        <Button label="Open dialog" onClick={() => setIsOpen(true)} />
        <Dialog isOpen={isOpen} onOpenChange={() => setIsOpen(false)}>
          <ToastViewport isTopLayer={false}>
            <DialogToastContent onClose={() => setIsOpen(false)} />
          </ToastViewport>
        </Dialog>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Dialog with its own `ToastViewport`: toasts render inside the dialog's top layer context and appear above the dialog overlay.",
      },
    },
  },
};

function DialogToastContent({onClose}: {onClose: () => void}) {
  const toast = useToast();
  return (
    <Stack gap={3}>
      <p>
        This dialog has its own toast viewport. Toasts fired here render inside
        the dialog, above its overlay.
      </p>
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button label="Close" variant="secondary" onClick={onClose} />
        <Button
          label="Show toast"
          onClick={() => {
            toast({body: 'Toast from inside the dialog!'});
          }}
        />
        <Button
          label="Error toast"
          variant="destructive"
          onClick={() => {
            toast({body: 'Something went wrong.', type: 'error'});
          }}
        />
      </Stack>
    </Stack>
  );
}

// =============================================================================
// Theme opt-out: surfaces.toast = 'normal'
// =============================================================================

/**
 * A theme that opts Toast out of the inverted media surface. Toasts then
 * render on the app's normal popover surface instead of the high-contrast
 * inverted panel — the sanctioned path for apps consolidating onto Astryx
 * whose existing toast design isn't media-inverted.
 */
const normalToastTheme = defineTheme({
  name: 'toast-normal-surface',
  extends: neutralTheme,
  surfaces: {toast: 'normal'},
});

export const ThemedSurfaceOptOut: StoryObj = {
  render: function ThemedSurfaceOptOutStory() {
    const noop = () => {};
    return (
      <Stack gap={4}>
        <p>
          Compare the default inverted surface against a theme that sets{' '}
          <code>
            surfaces: {'{'} toast: 'normal' {'}'}
          </code>
          . The opted-out toast uses the app&apos;s ordinary surface tokens (no
          color-scheme flip), while the error variant stays on its
          attention-grabbing dark surface in both. These are inline{' '}
          <code>Toast</code> elements so both surfaces render side by side under
          their own theme scope.
        </p>
        <Stack direction="horizontal" gap={6} wrap="wrap">
          <Theme theme={neutralTheme}>
            <Stack gap={2}>
              <strong>Default (inverted surface)</strong>
              <Toast
                type="info"
                body="Saved to your workspace."
                isAutoHide={false}
                autoHideDuration={0}
                onDismiss={noop}
              />
              <Toast
                type="error"
                body="Could not save changes."
                isAutoHide={false}
                autoHideDuration={0}
                onDismiss={noop}
              />
            </Stack>
          </Theme>
          <Theme theme={normalToastTheme}>
            <Stack gap={2}>
              <strong>surfaces.toast = &apos;normal&apos;</strong>
              <Toast
                type="info"
                body="Saved to your workspace."
                isAutoHide={false}
                autoHideDuration={0}
                onDismiss={noop}
              />
              <Toast
                type="error"
                body="Could not save changes."
                isAutoHide={false}
                autoHideDuration={0}
                onDismiss={noop}
              />
            </Stack>
          </Theme>
        </Stack>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Themes control whether Toast renders on the inverted media surface. `defineTheme({ surfaces: { toast: 'normal' } })` opts out app-wide; the error variant remains on its dark surface regardless.",
      },
    },
  },
};
