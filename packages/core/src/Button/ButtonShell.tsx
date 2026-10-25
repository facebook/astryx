// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file ButtonShell.tsx
 * @input Uses getButtonRootProps, ButtonContent, ButtonContextGate, the client
 *   Button, isSafeDestination
 * @output Exports Button: the server shell resolved by the `react-server`
 *   entry (index.server.ts)
 * @position Server-safe Button. Imports no client React API, so a Server
 *   Component renders it on the server. A Button whose props are data only
 *   renders here: the same root element, classes, tokens, attributes and
 *   content the client Button renders for those props. A Button that needs
 *   client behavior renders the client Button (Button.tsx), so its JavaScript
 *   loads only for the props that use it:
 *   - `clickAction`: an async action with pending state (useTransition, an
 *     in-flight ref guard);
 *   - `isLoading`: the Spinner and the localized loading announcement;
 *   - `tooltip`: hover and focus triggers attached to the element (useTooltip);
 *   - a `ref`, an event handler or any other function-valued prop, including
 *     a component passed as `as`: none of them can be rendered on the server.
 *   Every server-rendered Button sits in ButtonContextGate, which hands over to
 *   the client Button inside a size provider, ButtonGroup, InputGroup or (for a
 *   link) LinkProvider, and installs the touch press controller.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Button/Button.tsx (the props and contexts listed above)
 * - /packages/core/src/Button/ButtonContextGate.tsx
 * - /packages/core/src/Button/ButtonShell.test.tsx
 */

import type {AnchorHTMLAttributes, ReactNode} from 'react';
import {Button as ClientButton, type ButtonProps} from './Button';
import {ButtonContextGate} from './ButtonContextGate';
import {ButtonContent} from './ButtonContent';
import {getButtonRootProps, iconSizeByButtonSize} from './buttonStyles.stylex';
import {EDGE_COMP_ATTR} from '../Layout/edgeCompensation.stylex';
import {pressableProps} from '../utils/pressable';
import {isSafeDestination} from '../utils/safeUrl';

/**
 * Whether these props need the client Button. Exported for the server-render
 * tests; not part of the public API.
 */
export function needsClientButton(props: ButtonProps): boolean {
  if (
    props.clickAction != null ||
    props.isLoading === true ||
    props.tooltip != null ||
    props.ref != null
  ) {
    return true;
  }
  // An event handler, or a component passed as `as`: functions only run on
  // the client. A string `as` other than 'a' names an element the client
  // Button resolves through the same link handoff, so it goes there too.
  if (props.as != null && props.as !== 'a') {
    return true;
  }
  return Object.values(props).some(value => typeof value === 'function');
}

/**
 * A versatile button component with multiple variants. Same API as the client
 * Button; see Button.tsx.
 */
export function Button(props: ButtonProps): ReactNode {
  if (needsClientButton(props)) {
    return <ClientButton {...props} />;
  }

  const {
    label,
    variant = 'secondary',
    size = 'md',
    type = 'button',
    isDisabled = false,
    // Only meaningful while pending, and a pending Button is a client Button.
    isInterruptible: _isInterruptible,
    isLoading: _isLoading,
    // Unset here (needsClientButton); kept off the DOM element.
    clickAction: _clickAction,
    tooltip: _tooltip,
    icon,
    isIconOnly = false,
    width,
    elevation = 'none',
    children,
    endContent,
    href,
    as: _as,
    target,
    rel,
    xstyle,
    className,
    style,
    // A ref makes this a client Button (needsClientButton).
    ref: _ref,
    ...rest
  } = props;

  // Outside a ButtonGroup, a disabled Button is truly disabled; a server
  // Button is never busy and has no tooltip, so it never takes the
  // aria-disabled shape (Button.tsx `useAriaDisabled`).
  const isLink = href != null && !isDisabled;
  const rootProps = getButtonRootProps({
    variant,
    size,
    elevation,
    isIconOnly,
    isInactive: isDisabled,
    isTrueDisabled: isDisabled,
    isAriaDisabled: false,
    isLink,
    isGrouped: false,
    groupXstyle: false,
    width,
    xstyle,
    className,
    style,
  });

  const content = (
    <ButtonContent
      icon={icon}
      iconSize={iconSizeByButtonSize[size]}
      isIconOnly={isIconOnly}
      label={label}
      endContent={endContent}
      isLoading={false}
      isSpinnerDelayed={false}
      spinner={null}
      liveText="">
      {children}
    </ButtonContent>
  );

  // Button.tsx ORD4: icon-only with a label, or visible children that differ
  // from the label. (Pending, the third case, is a client Button.)
  const needsAriaLabel =
    (isIconOnly && label !== '') || (children != null && children !== label);
  const ariaLabelProp = needsAriaLabel ? {'aria-label': label} : null;
  const edgeCompAttr = variant === 'ghost' ? {[EDGE_COMP_ATTR]: ''} : null;
  const ariaProps = {
    'aria-busy': rest['aria-busy'] || undefined,
    'aria-disabled': rest['aria-disabled'] || undefined,
  };

  // Same attribute order as Button.tsx, so a caller's attribute lands where it
  // does on the client Button.
  const element = isLink ? (
    // The native anchor the client Button's link handoff renders without
    // LinkProvider (useLinkComponent's SafeLink, which sets href last); a
    // rejected destination renders without an href.
    // eslint-disable-next-line @astryx/no-hardcoded-anchor -- a Server Component cannot read LinkProvider; ButtonContextGate hands a link under one to the client Button, which resolves it.
    <a
      target={target}
      rel={rel}
      {...rootProps}
      {...pressableProps}
      // Data-only here (needsClientButton): no button-typed handler reaches it.
      {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      {...ariaLabelProp}
      {...edgeCompAttr}
      {...ariaProps}
      href={isSafeDestination(href) ? href : undefined}>
      {content}
    </a>
  ) : (
    <button
      type={type}
      disabled={isDisabled}
      {...rootProps}
      {...pressableProps}
      {...rest}
      {...ariaLabelProp}
      {...edgeCompAttr}
      {...ariaProps}>
      {content}
    </button>
  );

  return <ButtonContextGate buttonProps={props}>{element}</ButtonContextGate>;
}

Button.displayName = 'Button';
