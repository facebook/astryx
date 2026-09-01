// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ComplexSelector.tsx
 * @input Uses React, StyleX, Field, Icon slots, and adaptive selector presentation
 * @output Exports a rich-selector shell with exact token-sized input and ghost triggers, plus an imperative open/close handle
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/ComplexSelector/ComplexSelector.doc.mjs
 * - /packages/core/src/ComplexSelector/ComplexSelector.test.tsx
 * - /packages/core/src/ComplexSelector/index.ts
 * - /apps/storybook/stories/ComplexSelector.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/ComplexSelector/ (showcase blocks)
 */

import React, {
  useCallback,
  useId,
  useImperativeHandle,
  useOptimistic,
  useRef,
  useTransition,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {Field, inputWrapperStyles, type FieldStatusVariant} from '../Field';
import {Icon, renderIconSlot, type IconType} from '../Icon';
import {Spinner} from '../Spinner';
import {useTranslator} from '../i18n';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import type {AdaptivePresentation} from '../hooks/useAdaptivePresentation';
import {useResolvedRequired} from '../hooks/useResolvedRequired';
import {
  colorVars,
  durationVars,
  easeVars,
  fontWeightVars,
  radiusVars,
  sizeVars,
  spacingVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {isRenderable, mergeProps} from '../utils';
import {composeEventHandlers} from '../utils/composeEventHandlers';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {interactionOverlayStyles} from '../utils/interactionOverlay.stylex';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {selectorPresentationStyles} from '../Selector/selectorPresentation.stylex';
import {SelectorBottomSheet} from '../Selector/SelectorBottomSheet';
import {useSelectorPresentation} from '../Selector/useSelectorPresentation';
import {stableClassName} from '../naming';

const COMPLEX_SELECTOR_VIEWPORT_GUTTER = spacingVars['--spacing-4'];
const COMPLEX_SELECTOR_MAX_INLINE_SIZE = `calc(100vi - max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px)) - max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-right, 0px)))`;
const COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK = `calc(100vw - ${COMPLEX_SELECTOR_VIEWPORT_GUTTER} - ${COMPLEX_SELECTOR_VIEWPORT_GUTTER})`;
const COMPLEX_SELECTOR_MAX_BLOCK_SIZE = `min(480px, calc(100dvb - max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px)) - max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))))`;
const COMPLEX_SELECTOR_MAX_BLOCK_SIZE_FALLBACK = `min(480px, calc(100vh - ${COMPLEX_SELECTOR_VIEWPORT_GUTTER} - ${COMPLEX_SELECTOR_VIEWPORT_GUTTER}))`;
const COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE = `calc(100% - max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px)))`;
const COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK = `calc(100% - ${COMPLEX_SELECTOR_VIEWPORT_GUTTER})`;
const COMPLEX_SELECTOR_INLINE_EDGE_GUTTER = `max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-left, 0px), env(safe-area-inset-right, 0px))`;

const styles = stylex.create({
  triggerContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-label-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-label-size']})`,
    },
    lineHeight: typeScaleVars['--text-label-leading'],
    color: colorVars['--color-text-primary'],
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacingVars['--spacing-2'],
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    lineHeight: 'inherit',
    color: 'inherit',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    outline: 'none',
    borderRadius: radiusVars['--radius-element'],
  },
  triggerText: {
    flexGrow: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
  placeholder: {
    color: colorVars['--color-text-secondary'],
  },
  triggerGhost: {
    width: 'auto',
    borderWidth: 0,
    backgroundColor: 'transparent',
    boxShadow: {
      default: 'none',
      ':hover:not(:focus-within):where(:not(:disabled,[aria-disabled="true"]))':
        {
          '@media (hover: hover)': 'none',
        },
      ':focus-within': 'none',
    },
    fontWeight: fontWeightVars['--font-weight-medium'],
    transitionProperty:
      'background-image, background-color, color, opacity, transform',
    transform: {
      default: 'scale(1)',
      ':active': 'scale(0.98)',
    },
  },
  triggerGhostDisabled: {
    backgroundImage: 'none',
    transform: {
      default: 'none',
      ':active': 'none',
    },
  },
  // Only what Icon does not already provide: `sm` gives the 16px box and
  // `color="secondary"` the color, but the glyph still must not shrink inside
  // the flex trigger.
  triggerIcon: {
    flexShrink: 0,
  },
  // Rotation lives on the chevron glyph itself (passed through `xstyle`), not
  // on the layout wrapper above, so the icon's
  // `complex-selector-indicator-icon` theme target and the open/closed
  // transform sit on one element — a theme can restyle the mark and its
  // rotation through a single selector. The wrapper keeps only layout.
  triggerIconRotation: {
    transitionProperty: 'transform',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    transformOrigin: 'center',
  },
  triggerIconOpen: {
    transform: 'rotate(180deg)',
  },
  popoverViewport: {
    boxSizing: 'border-box',
    maxBlockSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE,
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE_FALLBACK,
    ),
  },
  popoverViewportAligned: {
    maxInlineSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE,
      COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverViewportStart: {
    marginInlineEnd: COMPLEX_SELECTOR_INLINE_EDGE_GUTTER,
  },
  popoverViewportEnd: {
    marginInlineStart: COMPLEX_SELECTOR_INLINE_EDGE_GUTTER,
  },
  popoverViewportBlockStart: {
    marginBlockEnd: `max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
  },
  popoverViewportBlockEnd: {
    marginBlockStart: `max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
  },
  popoverViewportCentered: {
    marginInlineStart: COMPLEX_SELECTOR_INLINE_EDGE_GUTTER,
    marginInlineEnd: COMPLEX_SELECTOR_INLINE_EDGE_GUTTER,
    maxInlineSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_INLINE_SIZE,
      COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverViewportBlockCentered: {
    marginBlockStart: `max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-top, 0px))`,
    marginBlockEnd: `max(${COMPLEX_SELECTOR_VIEWPORT_GUTTER}, env(safe-area-inset-bottom, 0px))`,
    maxInlineSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_INLINE_SIZE,
      COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK,
    ),
  },
  popoverAligned: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${COMPLEX_SELECTOR_POSITION_AREA_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
  },
  popoverCentered: {
    minWidth: stylex.firstThatWorks(
      `min(anchor-size(width), ${COMPLEX_SELECTOR_MAX_INLINE_SIZE})`,
      `min(anchor-size(width), ${COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK})`,
      'anchor-size(width)',
    ),
  },
  surfaceViewportFit: {
    boxSizing: 'border-box',
    maxInlineSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_INLINE_SIZE,
      COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK,
    ),
    maxBlockSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE,
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE_FALLBACK,
    ),
  },
  content: {
    boxSizing: 'border-box',
    maxInlineSize: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_INLINE_SIZE,
      COMPLEX_SELECTOR_MAX_INLINE_SIZE_FALLBACK,
    ),
    maxHeight: stylex.firstThatWorks(
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE,
      COMPLEX_SELECTOR_MAX_BLOCK_SIZE_FALLBACK,
    ),
    overflow: 'auto',
    overscrollBehavior: 'contain',
    padding: spacingVars['--spacing-3'],
  },
  sheetContent: {
    width: '100%',
    maxInlineSize: '100%',
    maxHeight: 'none',
    overflow: 'visible',
    padding: 0,
  },
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
  disabled: {
    cursor: 'default',
  },
});

export type ComplexSelectorVariant = 'input' | 'ghost';

export type ComplexSelectorSize = 'sm' | 'md' | 'lg';

export type ComplexSelectorPresentation = AdaptivePresentation;

export interface ComplexSelectorRenderState {
  /** Whether the selector surface is open. */
  isOpen: boolean;
  /** Whether changeAction/isLoading is pending. */
  isBusy: boolean;
  /** ID of the trigger button. */
  triggerId: string;
  /** ID of the popup content container. */
  contentId: string;
}

/**
 * Imperative control surface for ComplexSelector, accessed via the `handleRef`
 * prop. Methods drive the same popover machinery as the built-in trigger, so
 * they respect focus restoration, light dismiss, and Escape. Prefer these
 * callbacks over mirroring open state in the parent — the selector owns its
 * visibility, and imperative calls avoid the focus-management pitfalls of
 * syncing an external `isOpen` prop. Pair with `onOpenChange` to observe every
 * open and close, including the ones the selector performs itself.
 */
export interface ComplexSelectorHandle {
  /** Open the selector surface. No-op when disabled or already open. */
  open(): void;
  /** Close the selector surface. Restores focus to the trigger. */
  close(): void;
  /** Toggle the selector surface open or closed. */
  toggle(): void;
  /** Whether the selector surface is currently open. Reads live state. */
  isOpen(): boolean;
}

export interface ComplexSelectorStatus {
  type: 'warning' | 'error' | 'success';
  message?: string;
}

export interface ComplexSelectorProps<Value> extends Omit<
  BaseProps<HTMLDivElement>,
  'children' | 'onChange'
> {
  /** Label text for accessibility and the field label. */
  label: string;
  /** Current controlled value. */
  value: Value;
  /** Called when custom content commits a new value. */
  onChange?: (value: Value) => void;
  /** Optional async action after onChange; drives optimistic UI. */
  changeAction?: (value: Value) => void | Promise<void>;
  /** Custom selector surface content rendered inside a dialog popover. */
  children: (
    value: Value,
    onChange: (value: Value) => void,
    close: () => void,
    state: ComplexSelectorRenderState,
  ) => ReactNode;
  /** Label/content shown in the closed trigger. */
  triggerLabel?: ReactNode;
  /** Placeholder shown when triggerLabel is omitted. */
  placeholder?: ReactNode;
  /** Whether to visually hide the field label. */
  isLabelHidden?: boolean;
  /** Helper text displayed below the label. */
  description?: string;
  /** Marks the field optional. */
  isOptional?: boolean;
  /** Marks the field required. */
  isRequired?: boolean;
  /** Disables the selector. */
  isDisabled?: boolean;
  /** Shows loading state on the trigger. */
  isLoading?: boolean;
  /** Validation status. */
  status?: ComplexSelectorStatus;
  /** Status placement. */
  statusVariant?: FieldStatusVariant;
  /** Tooltip text displayed next to the label. */
  labelTooltip?: string;
  /** Trigger and field size. */
  size?: ComplexSelectorSize;
  /** Visual trigger style. Ghost matches toolbar buttons. */
  variant?: ComplexSelectorVariant;
  /** Icon displayed at the start of the trigger. */
  startIcon?: ReactNode | IconType;
  /** Width of the field. */
  width?: SizeValue;
  /** Popup placement. */
  placement?: LayerPlacement;
  /** Popup alignment along the placement axis. */
  alignment?: LayerAlignment;
  /**
   * How the custom selector content is presented.
   * - 'popover': anchored to the trigger
   * - 'bottom-sheet': modal sheet suited to compact touch screens
   * - 'adaptive': bottom sheet on compact coarse-pointer screens, otherwise popover
   * @default 'popover'
   */
  presentation?: ComplexSelectorPresentation;
  /**
   * Imperative handle for programmatic open/close control. Exposes open,
   * close, toggle, and the isOpen query. Use this instead of mirroring open
   * state in the parent — the selector owns its visibility.
   */
  handleRef?: React.Ref<ComplexSelectorHandle>;
  /**
   * Called whenever the selector surface opens or closes, however it happened
   * — the trigger, the keyboard, a light dismiss, Escape, content that calls
   * `close()`, or the imperative handle. Pair it with `handleRef` to drive the
   * surface from outside without mirroring its state.
   */
  onOpenChange?: (isOpen: boolean) => void;
  /** StyleX styles for the popup content container. */
  contentXstyle?: StyleXStyles;
  /** Test ID for the trigger container. */
  'data-testid'?: string;
}

/**
 * A selector shell for rich, custom selection surfaces.
 *
 * ComplexSelector owns the field, trigger, popover, focus restore, and async
 * change action flow. Consumers provide the dialog content as a render function,
 * using the supplied `value`, `onChange`, and `close` helpers to compose the
 * right accessible structure for the custom selector.
 *
 * @example
 * ```
 * <ComplexSelector
 *   label="Fruit"
 *   value={value}
 *   onChange={setValue}
 *   triggerLabel={`${value.fruit} ${value.ripeness}`}>
 *   {(value, onChange, close) => (
 *     <FruitGrid
 *       value={value}
 *       onChange={nextValue => {
 *         onChange(nextValue);
 *         close();
 *       }}
 *     />
 *   )}
 * </ComplexSelector>
 * ```
 */
export function ComplexSelector<Value>({
  label,
  value,
  onChange,
  changeAction,
  children,
  triggerLabel,
  placeholder: placeholderFromProps,
  isLabelHidden = false,
  description,
  isOptional = false,
  isRequired = false,
  isDisabled = false,
  isLoading = false,
  status,
  statusVariant = 'attached',
  labelTooltip,
  size = 'md',
  variant = 'input',
  startIcon,
  width,
  placement = 'below',
  alignment = 'start',
  presentation = 'popover',
  handleRef,
  onOpenChange,
  contentXstyle,
  xstyle,
  className,
  style,
  'data-testid': testId,
  onClick: onClickProp,
  ...props
}: ComplexSelectorProps<Value>) {
  const t = useTranslator();
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});
  const placeholder = placeholderFromProps ?? t('@astryx.selector.placeholder');
  const effectiveStatusVariant =
    variant === 'ghost' && statusVariant === 'attached'
      ? 'detached'
      : statusVariant;

  const triggerId = useId();
  const labelId = useId();
  const contentId = useId();
  const descriptionId = useId();
  const statusMessageId = useId();
  const ariaDescribedBy =
    [
      description ? descriptionId : null,
      status?.message ? statusMessageId : null,
    ]
      .filter((id): id is string => id != null)
      .join(' ') || undefined;

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || isPending;
  const isOpenRef = useRef(false);

  const handlePopoverShow = useCallback(() => {
    isOpenRef.current = true;
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleSurfaceHide = useCallback(() => {
    isOpenRef.current = false;
    onOpenChange?.(false);
  }, [onOpenChange]);

  const surface = useSelectorPresentation({
    presentation,
    onShow: handlePopoverShow,
    onHide: handleSurfaceHide,
    triggerRef,
    popoverOptions: {
      dialogLabel: label,
      hasCloseButton: false,
      hasAutoFocus: true,
      surfaceTarget: 'complex-selector-popup',
      xstyle: styles.surfaceViewportFit,
    },
  });
  const {popover} = surface;

  const isOpen = surface.isOpen;

  const show = useCallback(() => {
    if (isDisabled || isOpenRef.current) {
      return;
    }
    surface.show();
  }, [isDisabled, surface]);

  const close = useCallback(() => {
    surface.hide();
  }, [surface]);

  const handleTriggerClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (surface.isOpen) {
      surface.hide();
    } else {
      show();
    }
  }, [isDisabled, show, surface]);

  useImperativeHandle(
    handleRef,
    () => ({
      open: () => {
        show();
      },
      close: () => surface.hide(),
      toggle: () => {
        if (isDisabled) {
          return;
        }
        if (surface.isOpen) {
          surface.hide();
        } else {
          show();
        }
      },
      isOpen: () => isOpenRef.current,
    }),
    [isDisabled, show, surface],
  );

  const commitValue = useCallback(
    (nextValue: Value) => {
      onChange?.(nextValue);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(nextValue);
          await changeAction(nextValue);
        });
      }
    },
    [changeAction, onChange, setOptimisticValue, startTransition],
  );

  const triggerContent = triggerLabel ?? placeholder;

  const startIconSlot = renderIconSlot(startIcon, {
    size: 'sm',
    color: 'secondary',
  });

  const content = (
    <div
      ref={contentRef}
      id={contentId}
      {...stylex.props(
        styles.content,
        contentXstyle,
        surface.activePresentation === 'bottom-sheet' && styles.sheetContent,
      )}>
      {children(optimisticValue, commitValue, close, {
        isOpen,
        isBusy,
        triggerId,
        contentId,
      })}
    </div>
  );

  const selectorContent = (
    <>
      <div
        ref={popover.triggerRef}
        data-testid={testId}
        {...props}
        onClick={composeEventHandlers(onClickProp, handleTriggerClick)}
        {...mergeProps(
          themeProps('complex-selector', {
            variant,
            size,
            status: status?.type ?? null,
          }),
          stylex.props(
            inputWrapperStyles.base,
            styles.triggerContainer,
            styles[size],
            // The ring belongs to the wrapper (the focusable `<button>` sits
            // inside it), but it must still be a KEYBOARD ring: `:focus-within`
            // matched a mouse click on the trigger and drew the outline for
            // pointer users too. `focusWithin` here is `:has(:focus-visible)`.
            focusOutlineStyles.focusWithin,
            surface.isTriggerFocusRingSuppressed &&
              selectorPresentationStyles.pointerRestoredFocus,
            variant === 'ghost' && styles.triggerGhost,
            variant === 'ghost' && interactionOverlayStyles.backgroundImage,
            isDisabled && inputWrapperStyles.disabled,
            variant === 'ghost' && isDisabled && styles.triggerGhostDisabled,
            isDisabled && styles.disabled,
            triggerLabel == null && styles.placeholder,
            xstyle,
          ),
          className,
          style,
        )}>
        {isRenderable(startIconSlot) && startIconSlot}
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={contentId}
          aria-describedby={ariaDescribedBy}
          aria-labelledby={labelId}
          aria-required={isEffectivelyRequired ? 'true' : undefined}
          aria-invalid={status?.type === 'error' ? 'true' : undefined}
          aria-busy={isBusy || undefined}
          disabled={isDisabled}
          onKeyDown={event => {
            if (event.key === 'ArrowDown' && !isOpen && !isDisabled) {
              event.preventDefault();
              show();
            }
          }}
          onFocus={surface.onTriggerFocus}
          {...stylex.props(styles.trigger)}>
          <span {...stylex.props(styles.triggerText)}>{triggerContent}</span>
        </button>
        {isBusy && <Spinner size="sm" />}
        <Icon
          icon="chevronDown"
          size="sm"
          color="secondary"
          // No wrapper: Icon's own span already provides the 16px box (`sm`)
          // and the secondary icon color the wrapper used to set, so the glyph
          // IS the trigger's icon element — one node carrying the box, the
          // color, the rotation, and the theme target.
          xstyle={[
            styles.triggerIcon,
            styles.triggerIconRotation,
            isOpen && styles.triggerIconOpen,
          ]}
          {...themeProps('complex-selector-indicator-icon', {
            state: isOpen ? 'expanded' : 'collapsed',
          })}
        />
      </div>

      {surface.activePresentation === 'bottom-sheet' ? (
        <SelectorBottomSheet
          isOpen={surface.isSheetOpen}
          onOpenChange={surface.onSheetOpenChange}
          finalFocusRef={triggerRef}
          initialFocusContainerRef={contentRef}
          label={label}
          layout="rich"
          className={stableClassName('complex-selector-popup')}>
          {content}
        </SelectorBottomSheet>
      ) : (
        popover.render(content, {
          placement,
          alignment,
          offset: spacingVars['--spacing-1'],
          xstyle: [
            styles.popoverViewport,
            alignment === 'center'
              ? placement === 'start' || placement === 'end'
                ? styles.popoverViewportBlockCentered
                : styles.popoverViewportCentered
              : [
                  styles.popoverViewportAligned,
                  placement === 'start' || placement === 'end'
                    ? alignment === 'start'
                      ? styles.popoverViewportBlockStart
                      : styles.popoverViewportBlockEnd
                    : alignment === 'start'
                      ? styles.popoverViewportStart
                      : styles.popoverViewportEnd,
                ],
            alignment === 'center'
              ? styles.popoverCentered
              : styles.popoverAligned,
            layerAnimations[placement],
          ],
        })
      )}
    </>
  );

  return (
    <Field
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={triggerId}
      descriptionID={description ? descriptionId : undefined}
      labelID={labelId}
      isOptional={isOptional}
      isRequired={isRequired}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageId : undefined,
            }
          : undefined
      }
      statusVariant={effectiveStatusVariant}
      labelTooltip={labelTooltip}
      width={width}>
      {selectorContent}
    </Field>
  );
}

ComplexSelector.displayName = 'ComplexSelector';
