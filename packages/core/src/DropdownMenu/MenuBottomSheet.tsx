// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MenuBottomSheet.tsx
 * @input Uses BottomSheet and Section
 * @output Internal action-sheet host for menu content
 * @position Shared by DropdownMenu and ContextMenu adaptive presentations
 */

import type {ReactNode, RefObject} from 'react';
import {BottomSheet} from '../BottomSheet/BottomSheet';
import {Section} from '../Section/Section';

interface MenuBottomSheetProps {
  finalFocusRef?: RefObject<HTMLElement | null>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  label: string;
  children: ReactNode;
}

export function MenuBottomSheet({
  finalFocusRef,
  isOpen,
  onOpenChange,
  label,
  children,
}: MenuBottomSheetProps) {
  return (
    <BottomSheet
      finalFocusRef={finalFocusRef}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      label={label}
      height="hug"
      purpose="info">
      <Section paddingBlockStart={4} paddingBlockEnd={0} paddingInline={1}>
        {children}
      </Section>
    </BottomSheet>
  );
}

MenuBottomSheet.displayName = 'MenuBottomSheet';
