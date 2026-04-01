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
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSDivider} from '@xds/core/Divider';
import {spacingVars, colorVars, radiusVars, shadowVars} from '@xds/core/theme/tokens.stylex';

// ---------------------------------------------------------------------------
// Toast Types
// ---------------------------------------------------------------------------

type ToastType = 'info' | 'warning' | 'error' | 'success';
type ToastPosition = 'topEnd' | 'topStart' | 'bottomEnd' | 'bottomStart';

interface ToastOptions {
  title: string;
  body?: string;
  type?: ToastType;
  isAutoHide?: boolean;
  autoHideDuration?: number;
  action?: ReactNode;
  isDismissable?: boolean;
  uniqueID?: string;
  collisionBehavior?: 'overwrite' | 'ignore';
  onHide?: () => void;
}

interface ToastEntry extends Required<Pick<ToastOptions, 'title' | 'type'>> {
  id: string;
  body?: string;
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
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-3'],
    pointerEvents: 'none',
    maxWidth: 480,
    width: '100%',
  },
  topEnd: {
    top: spacingVars['--spacing-6'],
    right: spacingVars['--spacing-6'],
  },
  topStart: {
    top: spacingVars['--spacing-6'],
    left: spacingVars['--spacing-6'],
  },
  bottomEnd: {
    bottom: spacingVars['--spacing-6'],
    right: spacingVars['--spacing-6'],
  },
  bottomStart: {
    bottom: spacingVars['--spacing-6'],
    left: spacingVars['--spacing-6'],
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
    boxShadow: shadowVars['--shadow-med'],
    animationDuration: '0.2s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'forwards',
  },
  defaultVariant: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-on-dark'],
  },
  errorVariant: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  enterFromBottom: {
    animationName: stylex.keyframes({
      from: {opacity: 0, transform: 'translateY(16px)'},
      to: {opacity: 1, transform: 'translateY(0)'},
    }),
  },
  enterFromTop: {
    animationName: stylex.keyframes({
      from: {opacity: 0, transform: 'translateY(-16px)'},
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
  closeButton: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: radiusVars['--radius-inner'],
    borderWidth: 0,
    backgroundColor: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    padding: 0,
    opacity: 0.8,
    fontFamily: 'inherit',
    backgroundImage: {
      default: null,
      ':hover': {
        '@media (hover: hover)': 'linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))',
      },
    },
  },
});

// ---------------------------------------------------------------------------
// Close Icon (inline to avoid dependency on icon registry for sandbox)
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
  position,
}: {
  entry: ToastEntry;
  onDismiss: (id: string) => void;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  position: ToastPosition;
}) {
  const isFromBottom = position.startsWith('bottom');
  const isError = entry.type === 'error';

  return (
    <div
      {...stylex.props(
        toastStyles.toast,
        isError ? toastStyles.errorVariant : toastStyles.defaultVariant,
        entry.isExiting
          ? toastStyles.exit
          : isFromBottom
            ? toastStyles.enterFromBottom
            : toastStyles.enterFromTop,
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
        <span {...stylex.props(toastStyles.title)}>
          {entry.title}
          {entry.body && `, ${entry.body}`}
        </span>
      </div>
      <div {...stylex.props(toastStyles.actions)}>
        {entry.action}
        {entry.isDismissable && (
          <button
            {...stylex.props(toastStyles.closeButton)}
            onClick={() => onDismiss(entry.id)}
            aria-label="Dismiss notification">
            <CloseIcon />
          </button>
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
  position = 'bottomEnd',
  maxVisible = 5,
}: {
  children: ReactNode;
  position?: ToastPosition;
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
      const type = options.type ?? 'info';
      const isAutoHide = options.isAutoHide ?? (type !== 'error');
      const autoHideDuration = options.autoHideDuration ?? 5000;

      // Handle deduplication
      if (options.uniqueID) {
        const existing = toasts.find(
          t => t.uniqueID === options.uniqueID,
        );
        if (existing) {
          if (
            (options.collisionBehavior ?? 'overwrite') === 'ignore'
          ) {
            return () => startExit(existing.id);
          }
          dismiss(existing.id);
        }
      }

      const id = `toast-${++counterRef.current}`;

      const entry: ToastEntry = {
        id,
        title: options.title,
        body: options.body,
        type,
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
        if (next.length > maxVisible) {
          return next.slice(0, maxVisible);
        }
        return next;
      });

      if (isAutoHide) {
        startTimer(id, autoHideDuration);
      }

      return () => startExit(id);
    },
    [toasts, maxVisible, startTimer, dismiss, startExit],
  );

  const positionStyle =
    position === 'topEnd'
      ? toastStyles.topEnd
      : position === 'topStart'
        ? toastStyles.topStart
        : position === 'bottomStart'
          ? toastStyles.bottomStart
          : toastStyles.bottomEnd;

  const orderedToasts =
    position.startsWith('bottom') ? [...toasts].reverse() : toasts;

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div
        {...stylex.props(toastStyles.viewport, positionStyle)}
        role="region"
        aria-label="Notifications">
        {orderedToasts.map(entry => (
          <ToastItem
            key={entry.id}
            entry={entry}
            onDismiss={startExit}
            onPause={pause}
            onResume={resume}
            position={position}
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
    backgroundColor: colorVars['--color-background-muted'],
    paddingBlock: spacingVars['--spacing-8'],
    paddingInline: spacingVars['--spacing-8'],
  },
  container: {
    maxWidth: 720,
    marginInline: 'auto',
  },
});

export default function ToastPlaygroundPage() {
  const [position, setPosition] = useState<ToastPosition>('bottomEnd');
  const [title, setTitle] = useState('Lorem ipsum dolor sit amet, consectetur adipiscing elit');
  const [type, setType] = useState<string>('info');
  const [duration, setDuration] = useState('5000');

  return (
    <ToastProvider position={position}>
      <div {...stylex.props(pageStyles.page)}>
        <div {...stylex.props(pageStyles.container)}>
          <XDSVStack gap={6}>
            <XDSVStack gap={2}>
              <XDSHeading level={2}>Toast Playground</XDSHeading>
              <XDSText type="body" color="secondary">
                Prototype for XDSToast component. Two visual variants: default
                (dark) and error (red).
              </XDSText>
            </XDSVStack>

            <XDSCard>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  Configuration
                </XDSText>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
                  <XDSTextInput
                    label="Title"
                    value={title}
                    onChange={setTitle}
                  />
                  <XDSSelector
                    label="Type"
                    options={['info', 'success', 'warning', 'error']}
                    value={type}
                    onChange={setType}
                  />
                  <XDSSelector
                    label="Position"
                    options={[
                      {value: 'bottomEnd', label: 'Bottom End'},
                      {value: 'bottomStart', label: 'Bottom Start'},
                      {value: 'topEnd', label: 'Top End'},
                      {value: 'topStart', label: 'Top Start'},
                    ]}
                    value={position}
                    onChange={v => setPosition(v as ToastPosition)}
                  />
                  <XDSTextInput
                    label="Auto-hide duration (ms)"
                    value={duration}
                    onChange={setDuration}
                  />
                </div>

                <XDSDivider />

                <XDSText type="label" weight="bold">
                  Trigger Toasts
                </XDSText>
                <ToastTriggers
                  title={title}
                  type={type as ToastType}
                  duration={parseInt(duration, 10)}
                />
              </XDSVStack>
            </XDSCard>

            <XDSCard>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  Quick Examples
                </XDSText>
                <QuickExamples />
              </XDSVStack>
            </XDSCard>

            <XDSCard>
              <XDSVStack gap={4}>
                <XDSText type="label" weight="bold">
                  API Preview
                </XDSText>
                <XDSText type="supporting" color="secondary">
                  The proposed API for @xds/core/Toast
                </XDSText>
                <pre
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: 'var(--color-background-muted)',
                    fontSize: 13,
                    lineHeight: 1.6,
                    overflow: 'auto',
                  }}>
{`// 1. Wrap your app
<XDSToastProvider position="bottomEnd">
  <App />
</XDSToastProvider>

// 2. Use the hook
const toast = useXDSToast();

// 3. Show toasts
toast({
  title: "Saved successfully",
  type: "success",
});

// With action button
const dismiss = toast({
  title: "Item deleted",
  action: <XDSButton label="Undo" variant="ghost" onClick={undo} />,
});

// Error toast (red, persists by default)
toast({
  title: "Something went wrong",
  type: "error",
});

// Deduplication
toast({
  title: "You are offline",
  type: "warning",
  uniqueID: "offline",
  collisionBehavior: "ignore",
  isAutoHide: false,
});`}
                </pre>
              </XDSVStack>
            </XDSCard>
          </XDSVStack>
        </div>
      </div>
    </ToastProvider>
  );
}

function ToastTriggers({
  title,
  type,
  duration,
}: {
  title: string;
  type: ToastType;
  duration: number;
}) {
  const toast = useToast();

  return (
    <XDSHStack gap={2}>
      <XDSButton
        label="Show Toast"
        variant="primary"
        onClick={() =>
          toast({title, type, autoHideDuration: duration})
        }
      />
      <XDSButton
        label="With Action"
        variant="secondary"
        onClick={() =>
          toast({
            title,
            type,
            autoHideDuration: duration,
            action: (
              <button
                {...stylex.props(toastStyles.actionButton)}
                onClick={() => {
                  toast({title: 'Action triggered!', type: 'success'});
                }}>
                Button
              </button>
            ),
          })
        }
      />
      <XDSButton
        label="Error Toast"
        variant="destructive"
        onClick={() =>
          toast({
            title: 'Something went wrong, please try again.',
            type: 'error',
          })
        }
      />
    </XDSHStack>
  );
}

function QuickExamples() {
  const toast = useToast();

  return (
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
      <XDSButton
        label="Default (info)"
        variant="secondary"
        onClick={() =>
          toast({title: 'Changes saved successfully'})
        }
      />
      <XDSButton
        label="Default (success)"
        variant="secondary"
        onClick={() =>
          toast({title: 'Profile updated', type: 'success'})
        }
      />
      <XDSButton
        label="Default (warning)"
        variant="secondary"
        onClick={() =>
          toast({title: 'Storage almost full', type: 'warning'})
        }
      />
      <XDSButton
        label="Error"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Upload failed, file exceeds 10MB limit.',
            type: 'error',
          })
        }
      />
      <XDSButton
        label="With Action"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Item moved to trash',
            action: (
              <button
                {...stylex.props(toastStyles.actionButton)}
                onClick={() => toast({title: 'Restored!'})}>
                Undo
              </button>
            ),
          })
        }
      />
      <XDSButton
        label="Error + Action"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Connection lost',
            type: 'error',
            action: (
              <button
                {...stylex.props(toastStyles.actionButton)}
                onClick={() => toast({title: 'Reconnecting...', type: 'info'})}>
                Retry
              </button>
            ),
          })
        }
      />
      <XDSButton
        label="Deduplicated"
        variant="secondary"
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
        label="With Link"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Settings updated',
            action: (
              <button
                {...stylex.props(toastStyles.link)}
                onClick={() => toast({title: 'Navigating...'})}>
                View changes
              </button>
            ),
          })
        }
      />
      <XDSButton
        label="No Close Button"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Auto-saving...',
            isDismissable: false,
            autoHideDuration: 3000,
          })
        }
      />
      <XDSButton
        label="Long text (truncated)"
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua',
          })
        }
      />
    </div>
  );
}
