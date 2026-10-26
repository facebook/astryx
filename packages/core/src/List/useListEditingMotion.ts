// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useListEditingMotion.ts
 * @input The list element, whether it is editing and whether the touch
 *   presentation animates, the list table's edit-mode indent and table
 *   spring (motion/uikit/list.ts), and the shared row moves (utils/rowMotion.ts)
 * @output `useListEditingMotion`: entering and leaving edit mode played the
 *   way a UIKit table plays `setEditing(_:animated:)`
 * @position The List's edit-mode touch layer: List.tsx is its one import
 *   site. Under a finger it moves what the indent moved; with a mouse it
 *   does nothing (the indent and the trailing content switch at once).
 *
 * UIKit (iOS 26.2, `setEditing(_:animated:)`): one spring for everything,
 * `UIView.animate(springDuration: 0.3, bounce: 0)`, the table update spring.
 * The content slides by the indent from where it was; the trailing
 * accessories fade out in place, and fade back in where they rest when the
 * table leaves edit mode; a toggle mid-transition continues from the frame
 * on screen with its velocity (the springs are additive). Here the layout
 * changes at the commit (List.tsx adds or removes each row's indent, and the
 * trailing content once faded) and each moved part is put back where it was
 * with an inverse `translate`, then springs home on the compositor; the
 * trailing content's opacity springs to its new value. Under reduced motion
 * the animator's own policy applies (`design:reduced-motion`): the content
 * dips into place and the trailing content cross-fades.
 *
 * SYNC: When modified, update List/List.tsx, List/ListItem.tsx and
 * List/__tests__/ListEditing.interaction.browser.spec.ts.
 */

import {useRef, type RefObject} from 'react';
import {isRtlElement} from '../hooks/isRtlElement';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {list} from '../motion/uikit/list';
import {
  animateRow,
  animatorFor,
  motionNow,
  motionOf,
  releaseMotion,
  springBack,
} from '../utils/rowMotion';

/** Marks a row's trailing content (Item's end slot, Item/Item.tsx). */
const TRAILING_ATTRIBUTE = 'data-astryx-item-end';

const SPRING = list.update.tableSpring;

/** The rows of the list element: its own `li` children, never a ghost. */
function rowsOf(element: HTMLElement): HTMLElement[] {
  return Array.from(element.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement &&
      child.tagName === 'LI' &&
      !child.hasAttribute('data-astryx-leaving'),
  );
}

/**
 * Plays the edit-mode transition on each row of `listRef` when `isEditing`
 * changes under a finger (`animates`). `onTrailingGone` runs once every
 * trailing part has faded out after entering edit mode, so the list can take
 * them out of layout.
 */
export function useListEditingMotion(
  listRef: RefObject<HTMLElement | null>,
  isEditing: boolean,
  animates: boolean,
  onTrailingGone: () => void,
): void {
  const previousRef = useRef(isEditing);
  const onTrailingGoneRef = useRef(onTrailingGone);
  useIsomorphicLayoutEffect(() => {
    onTrailingGoneRef.current = onTrailingGone;
  });
  const generationRef = useRef(0);

  // External system (`architecture:react-component-runtime` INV3): the
  // rows' Web Animations (the shared animator), started for the layout this
  // commit made: each moved part put back where it was and sprung home, each
  // trailing part faded in place.
  useIsomorphicLayoutEffect(() => {
    const element = listRef.current;
    const was = previousRef.current;
    previousRef.current = isEditing;
    if (element == null || was === isEditing || !animates) {
      return;
    }
    const at = motionNow();
    const mine = ++generationRef.current;
    const indent = list.metrics.editingIndent;
    const rtl = isRtlElement(element);
    // The indent moved each part toward the inline end by `indent` when
    // entering, back when leaving: put it where it was, then spring home.
    const shift = (isEditing ? -indent : indent) * (rtl ? -1 : 1);
    const fades: Promise<boolean>[] = [];
    for (const row of rowsOf(element)) {
      for (const part of Array.from(row.children)) {
        if (!(part instanceof HTMLElement)) {
          continue;
        }
        if (part.hasAttribute(TRAILING_ATTRIBUTE)) {
          // In place, never sliding: out when entering; when leaving it is
          // back in layout, fading in from where it shows (0 when new).
          if (!isEditing && motionOf(part, 'opacity') == null) {
            animatorFor(part).set({opacity: 0});
          }
          const fade = animateRow(part, {opacity: isEditing ? 0 : 1}, SPRING, {
            at: motionOf(part, 'opacity') == null ? undefined : at,
            crossfadeAs: isEditing ? 'exit' : 'entrance',
          }).finished;
          if (isEditing) {
            fades.push(fade);
          } else {
            void fade.then(arrived => {
              if (arrived) {
                releaseMotion(part, 'opacity');
              }
            });
          }
          continue;
        }
        void springBack(part, 'x', shift, SPRING, at).then(arrived => {
          if (arrived && generationRef.current === mine) {
            releaseMotion(part, 'translate');
          }
        });
      }
    }
    if (isEditing) {
      void Promise.all(fades).then(results => {
        if (generationRef.current === mine && results.every(done => done)) {
          onTrailingGoneRef.current();
        }
      });
    }
  }, [listRef, isEditing, animates]);
}
