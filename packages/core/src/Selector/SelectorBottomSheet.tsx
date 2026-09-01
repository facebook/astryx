// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SelectorBottomSheet.tsx
 * @input Uses BottomSheet, Section, Heading, and shared focusable discovery
 * @output Shared mobile sheet for Selector, MultiSelector, and ComplexSelector
 * @position Internal presentation primitive for selection controls
 */

import {lazy, Suspense, useEffect, type ReactNode, type RefObject} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading} from '../Heading';
import {Section} from '../Section';
import {FOCUSABLE_SELECTOR} from '../hooks/focusableSelector';
import {spacingVars} from '../theme/tokens.stylex';

const LazyBottomSheet = lazy(async () =>
  import('../BottomSheet/BottomSheet').then(module => ({
    default: module.BottomSheet,
  })),
);

const styles = stylex.create({
  content: {
    width: '100%',
  },
  heading: {
    marginBlockEnd: spacingVars['--spacing-2'],
    marginInline: spacingVars['--spacing-3'],
  },
  richHeading: {
    marginBlockEnd: spacingVars['--spacing-3'],
    marginInline: 0,
  },
});

interface SelectorBottomSheetProps {
  children: ReactNode;
  className?: string;
  finalFocusRef: RefObject<HTMLElement | null>;
  initialFocusContainerRef?: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  label: string;
  layout?: 'listbox' | 'rich';
  onOpenChange: (isOpen: boolean) => void;
}

function SelectorBottomSheetInitialFocus({
  isOpen,
  containerRef,
  targetRef,
}: {
  isOpen: boolean;
  containerRef?: RefObject<HTMLElement | null>;
  targetRef?: RefObject<HTMLElement | null>;
}) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const container = containerRef?.current;
      const focusTarget =
        targetRef?.current ??
        container?.querySelector<HTMLElement>('[data-autofocus]') ??
        container?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      focusTarget?.focus({preventScroll: true});
    });
    return () => cancelAnimationFrame(frame);
  }, [containerRef, isOpen, targetRef]);

  return null;
}

export function SelectorBottomSheet({
  children,
  className,
  finalFocusRef,
  initialFocusContainerRef,
  initialFocusRef,
  isOpen,
  label,
  layout = 'listbox',
  onOpenChange,
}: SelectorBottomSheetProps) {
  const content = (
    <div {...stylex.props(styles.content)}>
      <Heading
        level={3}
        xstyle={[styles.heading, layout === 'rich' && styles.richHeading]}>
        {label}
      </Heading>
      {children}
      <SelectorBottomSheetInitialFocus
        isOpen={isOpen}
        containerRef={initialFocusContainerRef}
        targetRef={initialFocusRef}
      />
    </div>
  );

  return (
    <Suspense fallback={null}>
      <LazyBottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        finalFocusRef={finalFocusRef}
        label={label}
        height="hug"
        purpose="info"
        className={className}>
        {layout === 'rich' ? (
          <Section padding={4}>{content}</Section>
        ) : (
          <Section paddingBlockStart={4} paddingBlockEnd={0} paddingInline={1}>
            {content}
          </Section>
        )}
      </LazyBottomSheet>
    </Suspense>
  );
}

SelectorBottomSheet.displayName = 'SelectorBottomSheet';
