// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react';
import {useState, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Toast, useToast, ToastViewport} from '@astryxdesign/core/Toast';
import type {ToastOptions, ToastType} from '@astryxdesign/core/Toast';
import {Theme, defineTheme, useTheme} from '@astryxdesign/core/theme';
import {Button} from '@astryxdesign/core/Button';
import {Link} from '@astryxdesign/core/Link';
import {Card} from '@astryxdesign/core/Card';
import {Stack} from '@astryxdesign/core/Stack';
import {Heading} from '@astryxdesign/core/Text';
import {Dialog} from '@astryxdesign/core/Dialog';
import {Text} from '@astryxdesign/core/Text';

const styles = stylex.create({
  narrowLayoutReference: {
    width: 280,
    maxWidth: '100%',
  },
  mobileCanvas: {
    position: 'relative',
    boxSizing: 'border-box',
    inlineSize: 360,
    maxInlineSize: '100%',
    minBlockSize: 640,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-low)',
    transform: 'translateZ(0)',
  },
  mobileHeader: {
    paddingBlock: 'var(--spacing-4)',
    paddingInline: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-surface)',
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'var(--color-border)',
  },
  mobileContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-4)',
  },
  mobileCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  rtlCanvas: {
    direction: 'rtl',
  },
  stackControls: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
});

const mobileStoryParameters = {
  docs: {
    story: {inline: false, height: '720px'},
  },
};

function MobileCanvas({
  title,
  description,
  isRtl = false,
  children,
}: {
  title: string;
  description: string;
  isRtl?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      dir={isRtl ? 'rtl' : undefined}
      {...stylex.props(styles.mobileCanvas, isRtl && styles.rtlCanvas)}>
      <div {...stylex.props(styles.mobileHeader)}>
        <Text type="label">{title}</Text>
        <Text type="supporting" color="secondary">
          {description}
        </Text>
      </div>
      <div {...stylex.props(styles.mobileContent)}>{children}</div>
    </div>
  );
}

function MockCard({children}: {children: ReactNode}) {
  return <div {...stylex.props(styles.mobileCard)}>{children}</div>;
}

interface ReplayToastSpec extends ToastOptions {
  key: string;
}

function ToastReplayControls({
  items,
  label = 'Show toast',
}: {
  items: ReadonlyArray<ReplayToastSpec>;
  label?: string;
}) {
  const toast = useToast();
  const dismissers = useRef<Array<() => void>>([]);
  const reset = (): void => {
    for (const dismiss of dismissers.current) {
      dismiss();
    }
    dismissers.current = [];
  };
  const replay = (): void => {
    reset();
    for (const item of items) {
      const {key, ...options} = item;
      dismissers.current.push(toast({uniqueID: key, ...options}));
    }
  };
  return (
    <div {...stylex.props(styles.stackControls)}>
      <Button label={label} onClick={replay} />
      <Button label="Reset" variant="secondary" onClick={reset} />
    </div>
  );
}

const meta: Meta = {
  title: 'Core/Toast',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Imperative toast notification system. Use `useToast()` for brief, non-critical feedback. Works with or without `LayerProvider`.',
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
  parameters: {
    docs: {
      description: {
        story:
          'Plain info toasts are transient by default. Use them for brief, non-critical feedback that is also reflected elsewhere in the UI.',
      },
    },
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
          'Two toast types: info (default) and error. Plain info toasts are transient by default; error toasts persist until dismissed.',
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
          'Use `endContent` for short trailing actions. Set `isAutoHide: false` when the action must remain available; timed content still needs to satisfy WCAG 2.2.1.',
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
// Layout references
// =============================================================================

export const NarrowLayoutReference: StoryObj = {
  name: 'Narrow layout reference',
  render: () => (
    <div {...stylex.props(styles.narrowLayoutReference)}>
      <Toast
        type="info"
        body="Arbeitsbereichsbenachrichtigungseinstellungen gespeichert"
        isAutoHide={false}
        autoHideDuration={5000}
        endContent={<Button label="Undo" variant="secondary" size="sm" />}
        onDismiss={() => {}}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Static visual reference for narrow viewport/content-fit behavior: realistic translated copy wraps while Undo and dismiss stay aligned with its first line. This example opts out of auto-hide and does not emulate touch, pointer, or hover capabilities.',
      },
    },
  },
};

// =============================================================================
// Mobile situations
// =============================================================================

export const MobileRtlSafeAreaPlacement: StoryObj = {
  name: 'Mobile situations / RTL logical placement',
  render: () => (
    <MobileCanvas
      title="إعدادات الفريق"
      description="bottomStart follows the document direction; safe-area insets are device behavior and are not pixel-emulated here."
      isRtl>
      <ToastViewport position="bottomStart" isTopLayer={false} maxVisible={2}>
        <MockCard>
          <Text type="supporting" color="secondary">
            The toast uses a logical start placement. On an RTL page, start is
            the right edge; device safe-area padding is handled by the viewport
            styles.
          </Text>
          <ToastReplayControls
            label="إظهار التنبيه"
            items={[
              {key: 'mobile-rtl-safe-area', body: 'تم حفظ إعدادات الفريق'},
            ]}
          />
        </MockCard>
      </ToastViewport>
    </MobileCanvas>
  ),
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description:
          'RTL story for logical start/end placement. Safe-area behavior depends on real device insets; this story does not fake pixel evidence.',
      },
    },
  },
};

export const MobileMotionEdgeAwareEntrance: StoryObj = {
  name: 'Mobile situations / Motion edge-aware entrance',
  render: () => (
    <MobileCanvas
      title="Motion replay"
      description="Replay top and bottom stacks to compare the 8px edge-directed slide, fade, and tighter stack spacing.">
      <Stack gap={3}>
        <ToastViewport position="topEnd" isTopLayer={false} maxVisible={3}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Top placement travels 8px down from the top edge; exits return
              upward. Existing toasts make room through the wrapper grid-row
              transition.
            </Text>
            <ToastReplayControls
              label="Replay top stack"
              items={[
                {key: 'motion-top-1', body: 'Top first', isAutoHide: false},
                {key: 'motion-top-2', body: 'Top second', isAutoHide: false},
                {key: 'motion-top-3', body: 'Top third', isAutoHide: false},
              ]}
            />
          </MockCard>
        </ToastViewport>
        <ToastViewport position="bottomEnd" isTopLayer={false} maxVisible={3}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Bottom placement travels 8px up from the bottom edge and returns
              downward on exit, with the same transform/opacity contract and
              tighter stack spacing.
            </Text>
            <ToastReplayControls
              label="Replay bottom stack"
              items={[
                {
                  key: 'motion-bottom-1',
                  body: 'Bottom first',
                  isAutoHide: false,
                },
                {
                  key: 'motion-bottom-2',
                  body: 'Bottom second',
                  isAutoHide: false,
                },
                {
                  key: 'motion-bottom-3',
                  body: 'Bottom third',
                  isAutoHide: false,
                },
              ]}
            />
          </MockCard>
        </ToastViewport>
      </Stack>
    </MobileCanvas>
  ),
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description:
          'Replayable visual check for the focused motion change: an 8px top/bottom translate with the existing opacity and timing, plus the wrapper grid-row spacing transition.',
      },
    },
  },
};

export const NestedViewportLandmark: StoryObj = {
  name: 'Accessibility / Nested viewport landmark',
  render: () => (
    <MobileCanvas
      title="Nested providers"
      description="Only the viewport that receives a toast becomes a Notifications landmark.">
      <ToastViewport isTopLayer={false}>
        <ToastViewport isTopLayer={false}>
          <MockCard>
            <Text type="supporting" color="secondary">
              Show a toast, then inspect the accessibility tree: the empty outer
              viewport remains unnamed and only the inner viewport is a region.
            </Text>
            <ToastReplayControls
              items={[
                {
                  key: 'nested-viewport-landmark',
                  body: 'Notification settings saved',
                  isAutoHide: false,
                },
              ]}
            />
          </MockCard>
        </ToastViewport>
      </ToastViewport>
    </MobileCanvas>
  ),
  parameters: {
    ...mobileStoryParameters,
    docs: {
      story: {
        ...mobileStoryParameters.docs.story,
        description:
          'Accessibility check for nested ToastViewport composition. With a toast visible, exactly one named Notifications region should appear; with none visible, there should be zero.',
      },
    },
  },
};

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
// Theming
// =============================================================================

/**
 * `toast` is the card — the surface the toast paints. `base` restyles every
 * toast; `type:error` restyles just the error one, because `type` is the
 * toast's visual prop and the card renders it as a `.error` class.
 *
 * That one target covers more of the toast than it looks like it should:
 *
 * - **Inherited properties reach the content.** Font, size and letter-spacing
 *   set on `toast` cascade into the body and `endContent`. There is no
 *   `toast-body` target and none is needed.
 * - **Text colour looks after itself.** A toast measures the surface it just
 *   painted and picks the side that reads on it, so restyling the background
 *   is enough — the body, the dismiss glyph and `endContent` follow. Below,
 *   the cream card gets dark text and the deep red one light text, from
 *   nothing but the two `backgroundColor` rules.
 *
 * `onDark` / `onLight` are for overriding that choice, not for making it. They
 * apply only when the surface actually resolves to that side, so a toast whose
 * ambient text already reads gets neither.
 *
 * Wrap the viewport, not just the buttons: theme CSS is `@scope`d and the
 * toast renders inside the viewport.
 */
const brandToastTheme = defineTheme({
  name: 'toast-brand-demo',
  components: {
    toast: {
      base: {
        backgroundColor: '#FFF4D6',
        borderRadius: 'var(--radius-full)',
        paddingInline: 'var(--spacing-6)',
        boxShadow: 'var(--shadow-high)',
        fontFamily: 'var(--font-family-code)',
      },
      'type:error': {
        backgroundColor: '#5C0A18',
      },
    },
  },
});

/**
 * Default and themed, side by side, in both types. These are inline `Toast`
 * elements rather than fired ones so both states stay on screen together;
 * `ThemedToastLive` shows the same theme driving real `useToast()` calls.
 */
export const ThemedToast: StoryObj = {
  render: function ThemedToastStory() {
    return (
      <Stack direction="horizontal" gap={4} wrap="wrap">
        <ToastSpecimens label="Default" />
        <BrandToastScope>
          <ToastSpecimens label="brandToastTheme" />
        </BrandToastScope>
      </Stack>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Pill radius, wider inline padding, the cream surface and the ' +
          'monospace body all come from `components.toast.base`; the deep red ' +
          'is `type:error`. Neither rule sets a text colour.',
      },
    },
  },
};

/**
 * The copyable shape: wrap the viewport in the theme and fire toasts normally.
 */
export const ThemedToastLive: StoryObj = {
  render: function ThemedToastLiveStory() {
    return (
      <BrandToastScope>
        <ToastViewport>
          <ThemedToastTriggers />
        </ToastViewport>
      </BrandToastScope>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Same theme, real toasts. The viewport is inside `Theme`, so the ' +
          'scoped theme CSS reaches the toasts it renders.',
      },
    },
  },
};

/**
 * An app names its colour mode once, at its root `Theme`. A nested `Theme`
 * defaults to `mode="system"`, which follows the OS rather than the mode the
 * toolbar picked — and Toast reads that mode to choose its inverted-surface
 * tokens, so an unthreaded nested theme renders dark text on a dark card.
 */
function BrandToastScope({children}: {children: ReactNode}) {
  const {mode} = useTheme();
  return (
    <Theme theme={brandToastTheme} mode={mode}>
      {children}
    </Theme>
  );
}

function ToastSpecimens({label}: {label: string}) {
  return (
    <Stack direction="vertical" gap={2}>
      <Heading level={4}>{label}</Heading>
      <Toast
        type="info"
        body="Your changes have been saved."
        isAutoHide={false}
        autoHideDuration={5000}
        onDismiss={noop}
      />
      <Toast
        type="error"
        body="Could not reach the server."
        isAutoHide={false}
        autoHideDuration={5000}
        onDismiss={noop}
      />
    </Stack>
  );
}

function ThemedToastTriggers() {
  const toast = useToast();
  return (
    <Stack direction="horizontal" gap={2}>
      <Button
        label="Themed info toast"
        onClick={() => toast({body: 'Your changes have been saved.'})}
      />
      <Button
        label="Themed error toast"
        variant="destructive"
        onClick={() =>
          toast({body: 'Could not reach the server.', type: 'error'})
        }
      />
    </Stack>
  );
}

function noop() {}
