'use client';

import {
  useState,
  useCallback,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSVStack, XDSHStack} from '@xds/core/Layout';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {spacingVars, colorVars, radiusVars, shadowVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Toast Types
// ---------------------------------------------------------------------------

type ToastVariant = 'default' | 'error';

interface ToastOptions {
  title: string;
  variant?: ToastVariant;
  isAutoHide?: boolean;
  autoHideDuration?: number;
  action?: ReactNode;
  isDismissable?: boolean;
  uniqueID?: string;
  collisionBehavior?: 'overwrite' | 'ignore';
  onHide?: () => void;
}

interface ToastEntry extends Required<Pick<ToastOptions, 'title' | 'variant'>> {
  id: string;
  isAutoHide: boolean;
  autoHideDuration: number;
  action?: ReactNode;
  isDismissable: boolean;
  uniqueID?: string;
  onHide?: () => void;
  isPaused: boolean;
  isExiting: boolean;
}

type ShowToastFn = (options: ToastOptions) => () => void;

// ---------------------------------------------------------------------------
// Toast Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ShowToastFn | null>(null);

function useToast(): ShowToastFn {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Toast Styles
// ---------------------------------------------------------------------------

const toastStyles = stylex.create({
  viewport: {
    position: 'fixed',
    zIndex: 9999,
    bottom: spacingVars['--spacing-6'],
    right: spacingVars['--spacing-6'],
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    pointerEvents: 'none',
    width: 360,
  },
  toast: {
    pointerEvents: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-4'],
    paddingInlineStart: spacingVars['--spacing-5'],
    paddingInlineEnd: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-container'],
    boxShadow: shadowVars['--shadow-low'],
    animationDuration: '0.2s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
  defaultVariant: {
    backgroundColor: 'light-dark(#0A1317, #28292C)',
    color: 'light-dark(#FFFFFF, var(--color-text-primary))',
  },
  errorVariant: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  enter: {
    animationName: stylex.keyframes({
      from: {opacity: 0, transform: 'translateY(16px)'},
      to: {opacity: 1, transform: 'translateY(0)'},
    }),
  },
  exit: {
    animationName: stylex.keyframes({
      from: {opacity: 1, transform: 'translateX(0)'},
      to: {opacity: 0, transform: 'translateX(100%)'},
    }),
    animationDuration: '0.15s',
    animationTimingFunction: 'ease-in',
  },
  content: {
    flexGrow: 1,
    minWidth: 0,
  },
  title: {
    color: 'inherit',
    fontSize: 14,
    lineHeight: 1.4,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  link: {
    color: 'inherit',
    textDecorationLine: 'underline',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    flexShrink: 0,
    opacity: {
      default: 0.9,
      ':hover': {
        '@media (hover: hover)': 1,
      },
    },
  },
  actions: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    marginInlineStart: 'auto',
  },
  actionButton: {
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    borderRadius: radiusVars['--radius-element'],
    borderWidth: 0,
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']})`,
    },
  },
  closeWrapper: {
    flexShrink: 0,
  },
});

// ---------------------------------------------------------------------------
// Close Icon
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
      aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Toast Item Component
// ---------------------------------------------------------------------------

function ToastItem({
  entry,
  onDismiss,
  onPause,
  onResume,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
}) {
  const isError = entry.variant === 'error';

  return (
    <div
      {...stylex.props(
        toastStyles.toast,
        isError ? toastStyles.errorVariant : toastStyles.defaultVariant,
        entry.isExiting ? toastStyles.exit : toastStyles.enter,
      )}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      onMouseEnter={() => onPause(entry.id)}
      onMouseLeave={() => onResume(entry.id)}
      onFocus={() => onPause(entry.id)}
      onBlur={() => onResume(entry.id)}
      onAnimationEnd={() => {
        if (entry.isExiting) {
          onDismiss(entry.id);
        }
      }}>
      <div {...stylex.props(toastStyles.content)}>
        <span {...stylex.props(toastStyles.title)}>{entry.title}</span>
      </div>
      <div {...stylex.props(toastStyles.actions)}>
        {entry.action}
        {entry.isDismissable && (
          <div {...stylex.props(toastStyles.closeWrapper)}>
            <XDSButton
              label="Dismiss"
              variant="ghost"
              size="sm"
              icon={<CloseIcon />}
              onClick={() => onDismiss(entry.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toast Provider
// ---------------------------------------------------------------------------

function ToastProvider({
  children,
  maxVisible = 5,
}: {
  children: ReactNode;
  maxVisible?: number;
}) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const counterRef = useRef(0);

  const startTimer = useCallback(
    (id: string, duration: number) => {
      const existing = timersRef.current.get(id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        setToasts(prev =>
          prev.map(t => (t.id === id ? {...t, isExiting: true} : t)),
        );
        timersRef.current.delete(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev => {
      const toast = prev.find(t => t.id === id);
      if (toast?.onHide) toast.onHide();
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const startExit = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev =>
      prev.map(t => (t.id === id ? {...t, isExiting: true} : t)),
    );
  }, []);

  const pause = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts(prev =>
      prev.map(t => (t.id === id ? {...t, isPaused: true} : t)),
    );
  }, []);

  const resume = useCallback(
    (id: string) => {
      setToasts(prev => {
        const toast = prev.find(t => t.id === id);
        if (toast && toast.isAutoHide && !toast.isExiting) {
          startTimer(id, toast.autoHideDuration);
        }
        return prev.map(t => (t.id === id ? {...t, isPaused: false} : t));
      });
    },
    [startTimer],
  );

  const showToast: ShowToastFn = useCallback(
    options => {
      const variant = options.variant ?? 'default';
      const isAutoHide = options.isAutoHide ?? (variant !== 'error');
      const autoHideDuration = options.autoHideDuration ?? 5000;

      const id = `toast-${++counterRef.current}`;

      // Handle deduplication
      if (options.uniqueID) {
        setToasts(prev => {
          const existing = prev.find(t => t.uniqueID === options.uniqueID);
          if (existing) {
            if ((options.collisionBehavior ?? 'overwrite') === 'ignore') {
              return prev;
            }
            // Remove existing duplicate
            const timer = timersRef.current.get(existing.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(existing.id);
            }
            return prev.filter(t => t.id !== existing.id);
          }
          return prev;
        });
      }

      const entry: ToastEntry = {
        id,
        title: options.title,
        variant,
        isAutoHide,
        autoHideDuration,
        action: options.action,
        isDismissable: options.isDismissable ?? true,
        uniqueID: options.uniqueID,
        onHide: options.onHide,
        isPaused: false,
        isExiting: false,
      };

      setToasts(prev => {
        const next = [entry, ...prev];
        return next.length > maxVisible ? next.slice(0, maxVisible) : next;
      });

      if (isAutoHide) {
        startTimer(id, autoHideDuration);
      }

      return () => startExit(id);
    },
    [maxVisible, startTimer, startExit],
  );

  const orderedToasts = [...toasts].reverse();

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        {...stylex.props(toastStyles.viewport)}
        role="region"
        aria-label="Notifications">
        {orderedToasts.map(entry => (
          <ToastItem
            key={entry.id}
            entry={entry}
            onDismiss={startExit}
            onPause={pause}
            onResume={resume}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Playground Page
// ---------------------------------------------------------------------------

const pageStyles = stylex.create({
  page: {
    minHeight: '100svh',
    backgroundColor: colorVars['--color-background-surface'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-8'],
  },
  container: {
    maxWidth: 880,
    width: '100%',
  },
  columns: {
    display: 'flex',
    gap: spacingVars['--spacing-5'],
    justifyContent: 'center',
  },
  card: {
    width: 360,
    flexShrink: 0,
  },
  exampleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: spacingVars['--spacing-3'],
  },
  exampleDivider: {
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-full'],
    fontSize: 12,
    fontWeight: 500,
  },
  badgeDefault: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-on-dark'],
  },
  badgeError: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
});

interface ExampleEntry {
  label: string;
  description: string;
  variant: ToastVariant;
  options?: ToastOptions;
  hasAction?: 'button' | 'link';
}

const examples: ExampleEntry[] = [
  {
    label: 'Default',
    description: 'Simple notification',
    variant: 'default',
    options: {title: 'Changes saved successfully'},
  },
  {
    label: 'Error',
    description: 'Error notification',
    variant: 'error',
    options: {title: 'Something went wrong, please try again.', variant: 'error'},
  },
  {
    label: 'With Action',
    description: 'Undo button action',
    variant: 'default',
    hasAction: 'button',
  },
  {
    label: 'With Link',
    description: 'Text link action',
    variant: 'default',
    hasAction: 'link',
  },
  {
    label: 'Not Dismissable',
    description: 'No close button, 3s auto-hide',
    variant: 'default',
    options: {title: 'Auto-saving...', isDismissable: false, autoHideDuration: 3000},
  },
  {
    label: 'Long Text',
    description: 'Truncated to 2 lines',
    variant: 'default',
    options: {title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua'},
  },
];

export default function ToastPlaygroundPage() {
  const [title, setTitle] = useState('Changes saved successfully');
  const [variant, setVariant] = useState<string>('default');
  const [isDismissable, setIsDismissable] = useState<string>('yes');

  return (
    <ToastProvider>
      <div {...stylex.props(pageStyles.page)}>
        <div {...stylex.props(pageStyles.container)}>
          <XDSVStack gap={6}>
            <XDSVStack gap={1} hAlign="center">
              <XDSHeading level={1}>Toast</XDSHeading>
              <XDSText type="body" color="secondary">
                Brief notifications that appear at the bottom right. Two
                variants: default and error.
              </XDSText>
            </XDSVStack>

            <div {...stylex.props(pageStyles.columns)}>
              <div {...stylex.props(pageStyles.card)}>
              <XDSCard>
                <XDSVStack gap={5}>
                  <XDSText type="body" weight="bold">
                    Configure
                  </XDSText>
                  <XDSTextInput
                    label="Message"
                    value={title}
                    onChange={setTitle}
                  />
                  <XDSSelector
                    label="Variant"
                    options={[
                      {value: 'default', label: 'Default'},
                      {value: 'error', label: 'Error'},
                    ]}
                    value={variant}
                    onChange={setVariant}
                  />
                  <XDSSelector
                    label="Dismissable"
                    options={[
                      {value: 'yes', label: 'Yes'},
                      {value: 'no', label: 'No'},
                    ]}
                    value={isDismissable}
                    onChange={setIsDismissable}
                  />
                  <ToastTrigger
                    title={title}
                    variant={variant as ToastVariant}
                    isDismissable={isDismissable === 'yes'}
                  />
                </XDSVStack>
              </XDSCard>
              </div>

              <div {...stylex.props(pageStyles.card)}>
              <XDSCard>
                <XDSVStack gap={4}>
                  <XDSText type="body" weight="bold">
                    Examples
                  </XDSText>
                  <ToastExamples />
                </XDSVStack>
              </XDSCard>
              </div>
            </div>
          </XDSVStack>
        </div>
      </div>
    </ToastProvider>
  );
}

function ToastTrigger({
  title,
  variant,
  isDismissable,
}: {
  title: string;
  variant: ToastVariant;
  isDismissable: boolean;
}) {
  const toast = useToast();

  return (
    <XDSButton
      label="Show Toast"
      variant={variant === 'error' ? 'destructive' : 'primary'}
      onClick={() => toast({title, variant, isDismissable})}
    />
  );
}

function ToastExamples() {
  const toast = useToast();

  return (
    <XDSVStack gap={0}>
      {examples.map((example, i) => (
        <div key={example.label}>
          {i > 0 && <div {...stylex.props(pageStyles.exampleDivider)} />}
          <div {...stylex.props(pageStyles.exampleRow)}>
            <XDSVStack gap={1}>
              <XDSHStack gap={2} vAlign="center">
                <XDSText type="body" weight="semibold">
                  {example.label}
                </XDSText>
                <span
                  {...stylex.props(
                    pageStyles.badge,
                    example.variant === 'error'
                      ? pageStyles.badgeError
                      : pageStyles.badgeDefault,
                  )}>
                  {example.variant}
                </span>
              </XDSHStack>
              <XDSText type="supporting" color="secondary">
                {example.description}
              </XDSText>
            </XDSVStack>
            <XDSButton
              label="Try"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (example.hasAction === 'button') {
                  toast({
                    title: 'Item moved to trash',
                    action: (
                      <button
                        {...stylex.props(toastStyles.actionButton)}
                        onClick={() => toast({title: 'Restored!'})}>
                        Undo
                      </button>
                    ),
                  });
                } else if (example.hasAction === 'link') {
                  toast({
                    title: 'Settings updated',
                    action: (
                      <button
                        {...stylex.props(toastStyles.link)}
                        onClick={() => toast({title: 'Navigating...'})}>
                        View changes
                      </button>
                    ),
                  });
                } else {
                  toast(example.options as ToastOptions);
                }
              }}
            />
          </div>
        </div>
      ))}
    </XDSVStack>
  );
}
