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
import {EDITING_CONTROL_ATTRIBUTE} from './ListContext';
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

/** What the list takes out of layout once its motion is done with it. */
export interface ListEditingPresence {
  /** Every trailing part has faded out after entering edit mode. */
  onTrailingGone: () => void;
  /** Every editing control has slid out after leaving edit mode. */
  onControlGone: () => void;
}

/**
 * Plays the edit-mode transition on each row of `listRef` when `isEditing`
 * changes under a finger (`animates`), and tells the list (`presence`) when
 * the parts that leave after it, the trailing content entering and the
 * editing controls leaving, are gone.
 */
export function useListEditingMotion(
  listRef: RefObject<HTMLElement | null>,
  isEditing: boolean,
  animates: boolean,
  presence: ListEditingPresence,
): void {
  const previousRef = useRef(isEditing);
  const presenceRef = useRef(presence);
  useIsomorphicLayoutEffect(() => {
    presenceRef.current = presence;
  });
  const generationRef = useRef(0);

  // External system (`architecture:react-component-runtime` INV3): the
  // rows' Web Animations (the shared animator), started for the layout this
  // commit made: each moved part put back where it was and sprung home, each
  // trailing part faded in place, each editing control slid in or out.
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
    // Where an editing control comes from and goes to: UIKit's travel
    // toward the row's inline start.
    const away = list.metrics.editingControlTravel * (rtl ? 1 : -1);
    const fades: Promise<boolean>[] = [];
    const exits: Promise<boolean>[] = [];
    for (const row of rowsOf(element)) {
      const control = row.querySelector<HTMLElement>(
        `:scope > [${EDITING_CONTROL_ATTRIBUTE}]`,
      );
      if (control != null) {
        // From where it shows: a control already moving turns around; a new
        // one starts away, unseen.
        const moving =
          motionOf(control, 'x') != null ||
          motionOf(control, 'opacity') != null;
        if (isEditing && !moving) {
          animatorFor(control).set({x: away, opacity: 0});
        }
        const slide = animateRow(
          control,
          isEditing ? {x: 0, opacity: 1} : {x: away, opacity: 0},
          SPRING,
          {
            at: moving ? at : undefined,
            crossfadeAs: isEditing ? 'entrance' : 'exit',
          },
        ).finished;
        if (isEditing) {
          void slide.then(arrived => {
            if (arrived && generationRef.current === mine) {
              releaseMotion(control, 'translate', 'opacity');
            }
          });
        } else {
          exits.push(slide);
        }
      }
      for (const part of Array.from(row.children)) {
        if (
          !(part instanceof HTMLElement) ||
          part.hasAttribute(EDITING_CONTROL_ATTRIBUTE)
        ) {
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
    const whenAllArrive = (slides: Promise<boolean>[], gone: () => void) => {
      void Promise.all(slides).then(results => {
        if (generationRef.current === mine && results.every(done => done)) {
          gone();
        }
      });
    };
    if (isEditing) {
      whenAllArrive(fades, () => presenceRef.current.onTrailingGone());
    } else {
      whenAllArrive(exits, () => presenceRef.current.onControlGone());
    }
  }, [listRef, isEditing, animates]);
}
