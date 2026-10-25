// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Button.tsx
 * @input Uses React, ButtonHTMLAttributes, ReactNode, i18n (useTranslator), group contexts,
 *   getButtonStyleProps (buttonStyles.stylex.ts), ButtonContent
 * @output Exports Button component, ButtonProps, ButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by Button.test.tsx.
 *   The interactive Button. In a Server Component the `react-server` entry
 *   (index.server.ts) renders ButtonShell.tsx instead, which renders this
 *   component only for the props and contexts that need it.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/Button.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Button/Button.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Button/index.ts (exports if types change)
 * - /packages/core/src/Button/ButtonShell.tsx (server shell: which props need this client part)
 * - /apps/storybook/stories/Button.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Button/ (showcase blocks)
 *
 * Last synced props: label, variant, size, isDisabled, isLoading, isInterruptible, clickAction, icon, isIconOnly, width, children, tooltip, endContent, href, as, target, rel
 */

import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from 'react';
import type {BaseProps} from '../BaseProps';
import type {Elevation, SizeValue} from '../utils/types';
import {useTooltip} from '../Tooltip/useTooltip';
import {Spinner} from '../Spinner';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {useSize} from '../SizeContext/SizeContext';
import {useButtonGroup} from '../ButtonGroup/ButtonGroupContext';
import {useInputGroup} from '../InputGroup/InputGroupContext';
import {groupStyles as inputGroupStyles} from '../InputGroup/groupStyles';
import * as stylex from '@stylexjs/stylex';
import {radiusVars, borderVars, colorVars} from '../theme/tokens.stylex';
import {useMergedRefs} from '../hooks/useMergedRefs';
import {useLinkComponent} from '../Link/useLinkComponent';
import type {LinkComponentType} from '../Link/types';
import {usePressFeedback} from '../hooks/usePressFeedback';
import {useTranslator} from '../i18n';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {
  getButtonStyleProps,
  iconSizeByButtonSize,
  type ButtonSize,
  type ButtonVariant,
} from './buttonStyles.stylex';
import {ButtonContent} from './ButtonContent';

export type {ButtonSize, ButtonVariant} from './buttonStyles.stylex';

/**
 * "I am the last member of the group" — the trailing end cap.
 *
 * NOT `:last-child`: several members render an invisible layer element AFTER
 * their button (a tooltip'd Button returns button + layer; DropdownMenu returns
 * trigger + popover). `useLayer` renders those inline rather than portaling
 * them, so the layer — not the button — took the `:last-child` slot and the real
 * trailing button silently kept square corners (#2508).
 *
 * Layers always carry the native `popover` attribute (useLayer.tsx), and a
 * popover is never an in-flow member — it is `display: none` until shown, then
 * promoted to the top layer. Context layers also retain an inert `<template>`
 * marker so they can re-resolve their JSX position. Neither element is a group
 * member, so "last member" is: no following element sibling besides those two
 * pieces of layer infrastructure.
 *
 * Reading it the other way round — marking the *buttons* and testing for a
 * marked sibling — is the trap: it silently reclassifies anything it doesn't
 * recognise as "not a member", so a member wrapped in a `display: contents`
 * wrapper (Tooltip, HoverCard) or a raw child would make the button BEFORE it
 * round mid-group. Ignoring known layers keeps the predicate conservative: an
 * unrecognised sibling still counts, exactly as `:last-child` did, so the worst
 * case degrades to the old behaviour instead of a wrong corner.
 *
 * Kept as a same-file const: StyleX only statically evaluates a selector key
 * from a const in the same file.
 *
 * The leading edge still uses `:first-child` — a member's button always precedes
 * its own layer, so the first button is genuinely `:first-child`.
 */
const IS_LAST_ITEM = ':not(:has(~ *:not([popover]):not(template):not(dialog)))';

const groupStyles = stylex.create({
  horizontal: {
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderInlineStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': 0,
    },
    borderInlineStartStyle: {
      default: 'solid' as const,
      ':first-child': 'none' as const,
    },
    borderInlineStartColor: colorVars['--color-border'],
  },
  vertical: {
    borderStartStartRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderStartEndRadius: {
      default: 0,
      ':first-child': radiusVars['--radius-element'],
    },
    borderEndStartRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderEndEndRadius: {
      default: 0,
      [IS_LAST_ITEM]: radiusVars['--radius-element'],
    },
    borderBlockStartWidth: {
      default: borderVars['--border-width'],
      ':first-child': 0,
    },
    borderBlockStartStyle: {
      default: 'solid' as const,
      ':first-child': 'none' as const,
    },
    borderBlockStartColor: colorVars['--color-border'],
  },
  onSolidHorizontal: {
    borderInlineStartColor: colorVars['--color-on-accent'],
  },
  onSolidVertical: {
    borderBlockStartColor: colorVars['--color-on-accent'],
  },
});

export interface ButtonProps extends BaseProps<HTMLButtonElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLButtonElement>;
  /** HTML button type attribute. @default 'button' */
  type?: 'button' | 'submit' | 'reset';
  /** HTML name attribute for form submission. */
  name?: string;
  /** HTML value attribute for form submission. */
  value?: string | number | ReadonlyArray<string>;
  /** Associates the button with a form element by ID. */
  form?: string;
  /**
   * Accessible label for the button (required for accessibility).
   * Rendered as visible text by default. When `isIconOnly` is true,
   * used as aria-label instead.
   */
  label: string;
  /**
   * The visual style variant of the button.
   * @default 'secondary'
   */
  variant?: ButtonVariant;
  /**
   * The size of the button.
   * @default 'md'
   */
  size?: ButtonSize;
  /**
   * Resting elevation — the shadow depth the button sits at. Use for floating
   * buttons (FABs) that hover above content. `none` is the default flat button.
   * @default 'none'
   */
  elevation?: Elevation;
  /**
   * Whether the button is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the button is in a loading state. Loading prevents interaction
   * without dimming the spinner; explicit disabled states remain dimmed.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Keep the button interactive while a `clickAction` is pending. The loading
   * state still renders the spinner and `aria-busy`, but the button is not
   * disabled and the in-flight action is not deduped — so a re-click lands and
   * interrupts the previous action with a fresh one. Use for interruptible
   * actions (e.g. a toggle whose action can be re-triggered before the previous
   * one settles), not fire-once actions (submit/save/pay).
   * @default false
   */
  isInterruptible?: boolean;
  /**
   * Click handler. For async actions that should show a loading state,
   * use `clickAction` instead.
   */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Async click action. Shows loading state while pending.
   */
  clickAction?: (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => void | Promise<void>;
  /**
   * Icon element rendered before the label text.
   */
  icon?: ReactNode;
  /**
   * When true, renders as a square icon-only button with `label` as aria-label.
   * Requires `icon` to be provided.
   * @default false
   */
  isIconOnly?: boolean;
  /**
   * Width of the button. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'` for a full-width button). By default the button sizes to
   * its content.
   */
  width?: SizeValue;
  /**
   * Optional visible content. When provided, rendered instead of `label` as the
   * visible text (label still serves as the accessible name via aria-label).
   */
  children?: ReactNode;
  /**
   * Content rendered after the label text (badge, icon, chevron, etc.).
   * Ignored when `isIconOnly` is true to preserve square aspect ratio.
   *
   * Wrapped in a container that inherits the button's text color,
   * so child elements match the button variant's color automatically.
   */
  endContent?: ReactNode;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * When provided, renders the button as a link (`<a>` or custom component).
   * When the button is disabled, still renders as `<button>` regardless of href
   * (disabled links are an accessibility anti-pattern).
   */
  href?: string;
  /**
   * Custom link component to use when `href` is provided.
   * Overrides the provider-level default set by LinkProvider.
   * Useful for Next.js `<Link>` or other router-aware components.
   */
  as?: LinkComponentType;
  /**
   * HTML target attribute for the link. Only applies when `href` is provided.
   */
  target?: string;
  /**
   * HTML rel attribute for the link. Only applies when `href` is provided.
   */
  rel?: string;
}

/**
 * A versatile button component with multiple variants.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 * Themes can provide component-level variant overrides via theme.components.button.variants
 *
 * When `href` is provided (and the button is not disabled), renders as an `<a>`
 * element (or custom link component) with full button styling, enabling native
 * browser behaviors like right-click → open in new tab and Cmd+Click.
 *
 * @example
 * ```
 * <Button label="Click me" />
 * <Button label="Primary action" variant="primary" />
 * <Button label="Delete" variant="destructive" />
 * <Button label="Settings" icon={<GearIcon />} variant="ghost" isIconOnly />
 * <Button label="Pick emoji" icon={<span>🚀</span>} variant="ghost" size="sm" isIconOnly />
 * <Button label="Edit" icon={<PencilIcon />} />
 * <Button label="Messages" endContent={<Badge label={3} />} />
 * <Button label="Edit" icon={<PencilIcon />} endContent={<Badge label="New" />} />
 * <Button label="Sign in" variant="primary" width="100%" />
 * <Button label="Visit site" href="https://example.com" variant="primary" />
 * <Button label="Open in new tab" href="https://example.com" target="_blank" rel="noopener noreferrer" />
 * ```
 */
export function Button({
  label,
  variant = 'secondary',
  size: sizeProp,
  type = 'button',
  isDisabled = false,
  isLoading = false,
  isInterruptible = false,
  clickAction,
  icon,
  isIconOnly = false,
  width,
  elevation = 'none',
  children,
  endContent,
  tooltip,
  href,
  as,
  target,
  rel,
  xstyle,
  className,
  style,
  ref,
  ...props
}: ButtonProps): ReactNode {
  const pressFeedback = usePressFeedback();
  const t = useTranslator();
  const size = useSize(sizeProp, 'md');
  const buttonGroup = useButtonGroup();
  const inputGroup = useInputGroup();

  const [isPending, startTransition] = useTransition();
  // clickAction is normally fire-once (submit/save/pay), so a same-tick
  // double-click must dedupe — which neither isPending nor useOptimistic do.
  // Hence the ref guard. Interruptible callers (e.g. ToggleButton) opt out so a
  // re-click can land and interrupt the in-flight action with a fresh one.
  const actionInFlightRef = useRef(false);
  const isLoadingState = isLoading || isPending;
  // The loading live region must exist empty before it receives "Loading":
  // many screen readers skip a live region that mounts already holding its
  // text, which is what a Button first rendered loading did (spec:AST-086
  // FR3). Only that case holds the text back, until the frame after the
  // region mounts; a Button mounted idle never re-renders for this.
  const [isLiveRegionReady, setIsLiveRegionReady] = useState(
    () => !isLoadingState,
  );
  useEffect(() => {
    if (isLiveRegionReady) {
      return;
    }
    const frame = requestAnimationFrame(() => setIsLiveRegionReady(true));
    return () => cancelAnimationFrame(frame);
  }, [isLiveRegionReady]);
  // Delay the spinner reveal for action-driven loading (clickAction's own
  // transition) so a fast action that settles within the delay does not flash
  // a spinner. Interruptible loading is delayed too, so rapid re-clicks settle
  // before any spinner shows. Explicit isLoading-only stays immediate, since
  // the consumer is deliberately showing it.
  const delaySpinner = isPending || isInterruptible;
  const groupDisabled = buttonGroup?.isDisabled ?? false;
  const isTrueDisabled = isDisabled || groupDisabled;
  // Busy-only: the button can't fire again purely because an action is in
  // flight, not because it's genuinely isDisabled/group-disabled. Per the API
  // Conventions "Disabled vs Busy" rule, busy is visual-only (aria-busy +
  // spinner) and must never take focusability away — the click-handler ref
  // guard (actionInFlightRef) is what actually makes a fire-once action fire
  // once, so the native disabled attribute adds nothing but a focus loss
  // here. When interruptible, the loading state drives the spinner and
  // aria-busy but not disabled at all, so clicks keep landing and can
  // interrupt the in-flight action.
  const isBusyOnlyDisabled =
    !isTrueDisabled && isLoadingState && !isInterruptible;
  const buttonDisabled = isTrueDisabled || isBusyOnlyDisabled;
  // isIconOnly prop is the source of truth for icon-only rendering.
  // When false (default), label is always rendered as visible text.

  const LinkComponent = useLinkComponent(as);

  // Render as link when href is provided and the button is not TRULY
  // disabled. Disabled links are an accessibility anti-pattern, so a
  // genuinely isDisabled/group-disabled button falls back to <button>.
  // Busy-only does NOT fall back: swapping <a> for a disabled <button>
  // mid-action would drop focus the same way the native attribute does
  // (credit @AKnassa, #4879), which is exactly the bug this PR fixes.
  const renderAsLink = href != null && !isTrueDisabled;

  // Use aria-disabled (button stays focusable) when busy-only, or when a
  // tooltip is present so keyboard users can still reach it. A genuinely
  // isDisabled/group-disabled button (not busy) keeps native disabled.
  const useAriaDisabled =
    buttonDisabled && (isBusyOnlyDisabled || tooltip != null);

  // Attach tooltip behavior via the hook rather than wrapping the button in a
  // <Tooltip> element. The hook adds hover/focus triggers to the button itself,
  // so no extra DOM node is inserted — the button stays a direct child of its
  // container (no layout shift, and edge-compensation markers remain
  // discoverable through the container's direct-child `:has()` selector).
  const tooltipHook = useTooltip({
    placement: 'above',
    isEnabled: tooltip != null,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // The ref guard dedupes fire-once actions. Interruptible callers skip it so
    // a re-click while pending starts a fresh action that interrupts the prior.
    if (buttonDisabled || (actionInFlightRef.current && !isInterruptible)) {
      e.preventDefault();
      // A native `disabled` element never dispatches a click at all, so it
      // never reaches a wrapping element's own handler either. An
      // aria-disabled button (busy-only, or with a tooltip) is still a real,
      // interactive element the DOM keeps dispatching clicks on —
      // preventDefault alone only cancels the button's OWN default action
      // (form submit, link navigation), not propagation. Without this, an
      // unavailable Button inside a clickable row/card/backdrop still
      // triggers that ancestor's action, which the previously native-disabled
      // control never did.
      e.stopPropagation();
      return;
    }
    props.onClick?.(e);
    if (clickAction && !e.defaultPrevented) {
      actionInFlightRef.current = true;
      startTransition(async () => {
        try {
          await clickAction(e);
        } finally {
          actionInFlightRef.current = false;
        }
      });
    }
  };

  // When aria-disabled, suppress activation keys (Enter/Space) but allow
  // other keys (Escape, arrows) to reach consumer handlers.
  const handleKeyDown = useAriaDisabled
    ? (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
        } else {
          props.onKeyDown?.(e);
        }
      }
    : undefined;

  // Ghost buttons are edge-compensatable — containers detect this attribute
  // via :has() and pull their own slot margins to align flush at edges.
  const isFlat = variant === 'ghost';
  const edgeCompAttr = isFlat ? {[EDGE_COMP_ATTR]: ''} : null;

  // Shared root props (classes, tokens, theme attributes) for both button and
  // link rendering. The server shell composes the same parts
  // (getButtonRootProps in buttonStyles.stylex.ts).
  const sharedMergedProps = mergeProps(
    // Inside a group the group owns the surface's elevation, so the button
    // reflects the tier it actually paints rather than the prop it was handed.
    themeProps('button', {
      variant,
      size,
      elevation: buttonGroup ? 'none' : elevation,
    }),
    getButtonStyleProps({
      variant,
      size,
      elevation,
      isIconOnly,
      isInactive: buttonDisabled,
      isTrueDisabled,
      isAriaDisabled: useAriaDisabled,
      isLink: renderAsLink,
      isGrouped: buttonGroup != null,
      groupXstyle: [
        buttonGroup &&
          (buttonGroup.orientation === 'horizontal'
            ? groupStyles.horizontal
            : groupStyles.vertical),
        inputGroup != null &&
          buttonGroup == null &&
          inputGroupStyles.buttonAddon,
        buttonGroup &&
          (variant === 'primary' || variant === 'destructive') &&
          (buttonGroup.orientation === 'horizontal'
            ? groupStyles.onSolidHorizontal
            : groupStyles.onSolidVertical),
      ],
      width,
      xstyle,
    }),
    className,
    style,
  );

  const buttonContent = (
    <ButtonContent
      icon={icon}
      iconSize={iconSizeByButtonSize[size]}
      isIconOnly={isIconOnly}
      label={label}
      endContent={endContent}
      isLoading={isLoadingState}
      isSpinnerDelayed={delaySpinner}
      spinner={<Spinner size="sm" shade="inherit" />}
      liveText={
        isLoadingState && isLiveRegionReady ? t('@astryx.button.loading') : ''
      }>
      {children}
    </ButtonContent>
  );

  // aria-label is set when:
  // 1. Icon-only mode (label is the only accessible name)
  // 2. Loading state on non-icon-only (announce the button's purpose)
  // 3. Children differ from label (children are visible, label is accessible name)
  const needsAriaLabel =
    (isIconOnly && label !== '') ||
    (isLoadingState && !isIconOnly) ||
    (children != null && children !== label);
  const ariaLabelProp = needsAriaLabel ? {'aria-label': label} : null;

  // When a tooltip is attached via the hook, point aria-describedby at the
  // tooltip content (composing with any consumer-provided value).
  const describedByProp =
    tooltip != null
      ? {
          'aria-describedby':
            [props['aria-describedby'], tooltipHook.describedBy]
              .filter(Boolean)
              .join(' ') || undefined,
        }
      : null;

  // Merge the consumer ref with the tooltip hook's trigger ref so both point at
  // the same element. useMergedRefs tolerates undefined, so this is a no-op for
  // the tooltip side when no tooltip is set.
  const mergedButtonRef = useMergedRefs(
    ref,
    tooltip != null ? tooltipHook.ref : undefined,
  );

  let element: ReactNode;

  if (renderAsLink) {
    element = (
      <LinkComponent
        ref={mergedButtonRef as React.Ref<HTMLAnchorElement>}
        href={href}
        target={target}
        rel={rel}
        {...sharedMergedProps}
        {...pressFeedback}
        {...props}
        {...ariaLabelProp}
        {...describedByProp}
        {...edgeCompAttr}
        // A caller's own busy or disabled state is kept, so a component that
        // hands these props to a Button (a caller-rendered trigger) is heard.
        aria-busy={isLoadingState || props['aria-busy'] || undefined}
        aria-disabled={useAriaDisabled || props['aria-disabled'] || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? {onKeyDown: handleKeyDown} : null)}>
        {buttonContent}
      </LinkComponent>
    );
  } else {
    element = (
      <button
        ref={mergedButtonRef}
        type={type}
        disabled={useAriaDisabled ? undefined : buttonDisabled}
        {...sharedMergedProps}
        {...pressFeedback}
        {...props}
        {...ariaLabelProp}
        {...describedByProp}
        {...edgeCompAttr}
        // A caller's own busy or disabled state is kept, so a component that
        // hands these props to a Button (a caller-rendered trigger) is heard.
        aria-busy={isLoadingState || props['aria-busy'] || undefined}
        aria-disabled={useAriaDisabled || props['aria-disabled'] || undefined}
        onClick={handleClick}
        {...(handleKeyDown ? {onKeyDown: handleKeyDown} : null)}>
        {buttonContent}
      </button>
    );
  }

  if (tooltip) {
    return (
      <>
        {element}
        {tooltipHook.renderTooltip(tooltip)}
      </>
    );
  }

  return element;
}

Button.displayName = 'Button';
