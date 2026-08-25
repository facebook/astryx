// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import * as stylex from '@stylexjs/stylex';
import {useState, useRef} from 'react';
import {useToast, ToastViewport} from '@astryxdesign/core/Toast';
import type {
  ToastType,
  ToastContentRenderProps,
} from '@astryxdesign/core/Toast';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Stack';
import {Dialog} from '@astryxdesign/core/Dialog';
import {
  colorVars,
  radiusVars,
  spacingVars,
} from '@astryxdesign/core/theme/tokens.stylex';

// The custom toast layout used by the `renderContent` story below.
const cardStyles = stylex.create({
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-3'],
    width: '100%',
  },
  stripe: {
    alignSelf: 'stretch',
    width: 4,
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
  },
  stripeInfo: {backgroundColor: colorVars['--color-accent']},
  stripeError: {backgroundColor: colorVars['--color-text-red']},
  text: {flex: 1, minWidth: 0},
});

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
// Custom content (renderContent)
// =============================================================================

// A product with its own notification layout passes `renderContent` on the
// `showToast` call. Astryx keeps the card — surface, `astryx-toast` theme
// target, live-region role, auto-hide timer — and hands over the message, the
// `endContent`, and a `DismissButton` component.
//
// The dismiss is the part worth noticing: the layout *places* it rather than
// building it, so it stays a real Astryx `Button` with its translated label
// and its `astryx-button` theming. And a layout that never renders it does
// not produce a toast with no way out — Astryx puts the close in the card's
// default corner instead. The last two buttons below show both halves.
//
// Note there is no second `ToastViewport` here: the story's toasts go through
// the app-level one, exactly as a product's would.
function ProductToastContent({
  type,
  body,
  endContent,
  DismissButton,
}: ToastContentRenderProps) {
  return (
    <div {...stylex.props(cardStyles.row)}>
      <div
        {...stylex.props(
          cardStyles.stripe,
          type === 'error' ? cardStyles.stripeError : cardStyles.stripeInfo,
        )}
      />
      <div {...stylex.props(cardStyles.text)}>{body}</div>
      {endContent}
      <DismissButton />
    </div>
  );
}

// The same layout with the close left out — a mistake, or a layout written
// before the close existed. The toast is still dismissible: Astryx renders it
// in the corner.
function ForgetfulToastContent({type, body}: ToastContentRenderProps) {
  return (
    <div {...stylex.props(cardStyles.row)}>
      <div
        {...stylex.props(
          cardStyles.stripe,
          type === 'error' ? cardStyles.stripeError : cardStyles.stripeInfo,
        )}
      />
      <div {...stylex.props(cardStyles.text)}>{body}</div>
    </div>
  );
}

// An app shares one layout across its toasts by wrapping the hook once —
// which is also what keeps a library's toast out of it: code that calls
// `useToast()` directly never passes `renderContent`, so it renders as an
// ordinary Astryx toast rather than inheriting a layout built for someone
// else's payload.
const renderProductContent = (toast: ToastContentRenderProps) => (
  <ProductToastContent {...toast} />
);

export const CustomContent: StoryObj = {
  name: 'Custom content (renderContent)',
  render: function CustomContentStory() {
    const toast = useToast();
    return (
      <Stack direction="horizontal" gap={2} wrap="wrap">
        <Button
          label="Show"
          onClick={() => {
            toast({
              body: 'Your changes have been saved.',
              renderContent: renderProductContent,
            });
          }}
        />
        <Button
          label="With an action"
          variant="secondary"
          onClick={() => {
            toast({
              body: 'Row deleted.',
              endContent: <Button variant="ghost" size="sm" label="Undo" />,
              renderContent: renderProductContent,
            });
          }}
        />
        <Button
          label="Error"
          variant="destructive"
          onClick={() => {
            toast({
              body: 'Could not reach the server.',
              type: 'error',
              renderContent: renderProductContent,
            });
          }}
        />
        <Button
          label="Layout without the close"
          variant="ghost"
          onClick={() => {
            toast({
              body: 'This layout never renders DismissButton.',
              type: 'error',
              renderContent: toastProps => (
                <ForgetfulToastContent {...toastProps} />
              ),
            });
          }}
        />
        <Button
          label="Without renderContent"
          variant="ghost"
          onClick={() => {
            toast({body: 'A toast from code that knows nothing about it.'});
          }}
        />
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "`renderContent` on the `showToast` options replaces the content of that toast's card with your own layout — here a leading status stripe. Astryx keeps the card and the transport, and hands over the message, the `endContent` and a `DismissButton` to place, so the close stays themed, translated and correctly named. **Layout without the close** is the same layout with `DismissButton` left out, on an error toast that does not auto-hide: Astryx renders the close in the card's corner, so the toast is still dismissible. The last button omits `renderContent` entirely, showing what a toast raised by code that has never heard of this layout looks like.",
      },
    },
  },
};
