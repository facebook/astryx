// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelRows.ts
 * @input A touch wheel's drum and band strip elements, its options, layout
 *   and row classes, and the positions a drag or a motion is about to show
 * @output Exports WheelRows: the rows a touch wheel mounts, kept and recycled
 *   imperatively, and the window of positions they cover
 * @position Row manager of the touch picker wheel (PickerWheel.tsx); hands
 *   the mounted rows to the motion engine (wheelMotion.ts). Never renders
 *   React
 *
 * UIPickerView lays out only the cells it shows. The wheel does the same: a
 * window of rows around the band, the cylinder's front half (±90°) on the
 * drum, three rows in the band's copy, and a buffer of two on each side, so
 * a wide range costs what a narrow one does. A drag moves the window by
 * recycling the rows it leaves behind for the ones ahead, with style and
 * attribute writes only, so a drag frame never renders the column
 * (`spec:AST-094` FR9). A motion mounts every row it will show before it
 * plays: the whole span a coast travels, or for a cross-fade the rows around
 * where it starts and around where it lands.
 *
 * Rows are decoration (the drum and the strip are `aria-hidden`; the listbox's
 * options carry the labels): each draws its label from `data-label`, and keeps
 * its place among its siblings in position order.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/PickerWheel.tsx
 * - /packages/core/src/DateInput/PickerWheel.test.tsx
 */

import type {DrumGeometry} from './wheelDrum';
import type {WheelOption} from './wheelOptions';
import {wrapIndex, type WheelLayout} from './wheelPhysics';

/** Rows mounted past those that can show, on each side. */
const WINDOW_BUFFER = 2;

/**
 * Rows on each side of the band's centre that the band's copy can show: the
 * band is 34 px tall and a row 32, so the row under it and one each side.
 */
const BAND_REACH = 1;

/** The class names a drum row and a band row take. */
export interface WheelRowClasses {
  readonly row: string;
  readonly rowDisabled: string;
  readonly stripRow: string;
  readonly stripRowDisabled: string;
}

/** A run of positions along the wheel, row units: from `lo` to `hi`. */
export type WheelRange = readonly [lo: number, hi: number];

/**
 * The mounted rows of one touch wheel, by position along it: an option index,
 * or on a looping wheel any integer, one row per copy.
 *
 * @example
 * ```
 * const rows = new WheelRows(drum, strip, drumGeometry(32));
 * rows.update(options, layout, classes);
 * rows.settle(10);
 * motion.attach(rows.drumRows(), strip);
 * ```
 */
export class WheelRows {
  private readonly drum: HTMLElement;
  private readonly strip: HTMLElement;
  /** Rows on each side of the band that can show: the cylinder's front half. */
  private readonly visibleReach: number;
  private options: ReadonlyArray<WheelOption> = [];
  private layout: WheelLayout = {rowHeight: 1, rowCount: 0};
  private classes: WheelRowClasses = {
    row: '',
    rowDisabled: '',
    stripRow: '',
    stripRowDisabled: '',
  };
  private readonly drumByPosition = new Map<number, HTMLElement>();
  private readonly stripByPosition = new Map<number, HTMLElement>();
  /** Rows taken out of the window, kept to draw the next positions. */
  private readonly drumPool: HTMLElement[] = [];
  private readonly stripPool: HTMLElement[] = [];

  constructor(drum: HTMLElement, strip: HTMLElement, geometry: DrumGeometry) {
    this.drum = drum;
    this.strip = strip;
    this.visibleReach = Math.ceil(
      ((Math.PI / 2) * geometry.radius) / geometry.rowHeight,
    );
  }

  /** Whether these are the rows of `drum` and `strip`. */
  owns(drum: HTMLElement | null, strip: HTMLElement | null): boolean {
    return drum === this.drum && strip === this.strip;
  }

  /** Whether any row is mounted. */
  isEmpty(): boolean {
    return this.drumByPosition.size === 0 && this.stripByPosition.size === 0;
  }

  /** The drum's mounted rows, by position, for the motion engine. */
  drumRows(): ReadonlyMap<number, HTMLElement> {
    return this.drumByPosition;
  }

  /**
   * New options, layout or classes: every mounted row is drawn again, and rows
   * at positions the layout no longer has are taken out.
   */
  update(
    options: ReadonlyArray<WheelOption>,
    layout: WheelLayout,
    classes: WheelRowClasses,
  ): void {
    this.options = options;
    this.layout = layout;
    this.classes = classes;
    for (const [position, row] of [...this.drumByPosition]) {
      if (this.isPosition(position)) {
        this.drawDrumRow(row, position);
      } else {
        this.drumByPosition.delete(position);
        row.remove();
        this.drumPool.push(row);
      }
    }
    for (const [position, row] of [...this.stripByPosition]) {
      if (this.isPosition(position)) {
        this.drawStripRow(row, position);
      } else {
        this.stripByPosition.delete(position);
        row.remove();
        this.stripPool.push(row);
      }
    }
  }

  /**
   * Mount every row that can show while the wheel is anywhere in `ranges`;
   * when some are missing, the window moves to just those ranges and a
   * buffer. Returns whether the mounted rows changed.
   */
  show(ranges: ReadonlyArray<WheelRange>): boolean {
    const shown = this.positions(ranges, this.visibleReach);
    const banded = this.positions(ranges, BAND_REACH);
    if (
      shown.every(position => this.drumByPosition.has(position)) &&
      banded.every(position => this.stripByPosition.has(position))
    ) {
      return false;
    }
    this.mount(
      this.positions(ranges, this.visibleReach + WINDOW_BUFFER),
      this.positions(ranges, BAND_REACH + WINDOW_BUFFER),
    );
    return true;
  }

  /**
   * The window around one resting position, as a wheel at rest mounts it.
   * Returns whether the mounted rows changed.
   */
  settle(position: number): boolean {
    const drum = this.positions(
      [[position, position]],
      this.visibleReach + WINDOW_BUFFER,
    );
    const band = this.positions(
      [[position, position]],
      BAND_REACH + WINDOW_BUFFER,
    );
    if (
      drum.length === this.drumByPosition.size &&
      band.length === this.stripByPosition.size &&
      drum.every(p => this.drumByPosition.has(p)) &&
      band.every(p => this.stripByPosition.has(p))
    ) {
      return false;
    }
    this.mount(drum, band);
    return true;
  }

  /** Whether the layout has a row at `position`. */
  private isPosition(position: number): boolean {
    return (
      this.layout.looping === true ||
      (position >= 0 && position < this.layout.rowCount)
    );
  }

  /**
   * The positions `reach` past each range on each side, ascending. A finite
   * wheel's runs stop at its rows; a looping wheel's run past either end.
   */
  private positions(
    ranges: ReadonlyArray<WheelRange>,
    reach: number,
  ): number[] {
    const set = new Set<number>();
    for (const [lo, hi] of ranges) {
      const from = Math.floor(Math.min(lo, hi)) - reach;
      const to = Math.ceil(Math.max(lo, hi)) + reach;
      for (let position = from; position <= to; position++) {
        if (this.isPosition(position)) {
          set.add(position);
        }
      }
    }
    return [...set].sort((a, b) => a - b);
  }

  /** Mount exactly `drum` and `band` (ascending), recycling what leaves. */
  private mount(drum: number[], band: number[]): void {
    this.place(this.drum, this.drumByPosition, this.drumPool, drum, (row, p) =>
      this.drawDrumRow(row, p),
    );
    this.place(
      this.strip,
      this.stripByPosition,
      this.stripPool,
      band,
      (row, p) => this.drawStripRow(row, p),
    );
  }

  /**
   * Make `byPosition` hold exactly `positions`: rows that stay keep their
   * node, the rest are drawn at the new positions (recycled first, then from
   * the pool, then new), and the container keeps them in position order
   * with one move per row drawn anew.
   */
  private place(
    container: HTMLElement,
    byPosition: Map<number, HTMLElement>,
    pool: HTMLElement[],
    positions: number[],
    draw: (row: HTMLElement, position: number) => void,
  ): void {
    const wanted = new Set(positions);
    const freed: HTMLElement[] = [];
    for (const [position, row] of [...byPosition]) {
      if (!wanted.has(position)) {
        byPosition.delete(position);
        freed.push(row);
      }
    }
    const drawn = new Set<HTMLElement>();
    for (const position of positions) {
      if (byPosition.has(position)) {
        continue;
      }
      const row =
        freed.pop() ??
        pool.pop() ??
        container.ownerDocument.createElement('div');
      draw(row, position);
      byPosition.set(position, row);
      drawn.add(row);
    }
    for (const row of freed) {
      row.remove();
      pool.push(row);
    }
    // Highest first: each row drawn anew goes just before the row of the
    // next position, which is in its place already; rows that stay were in
    // order before and keep it.
    let next: HTMLElement | null = null;
    for (let i = positions.length - 1; i >= 0; i--) {
      const row = byPosition.get(positions[i]);
      if (row == null) {
        continue;
      }
      if (drawn.has(row)) {
        container.insertBefore(row, next);
      }
      next = row;
    }
  }

  private optionAt(position: number): WheelOption | undefined {
    return this.options[
      this.layout.looping === true
        ? wrapIndex(position, this.options.length)
        : position
    ];
  }

  private drawDrumRow(row: HTMLElement, position: number): void {
    const option = this.optionAt(position);
    const index =
      this.layout.looping === true
        ? wrapIndex(position, this.options.length)
        : position;
    row.className =
      option?.isDisabled === true ? this.classes.rowDisabled : this.classes.row;
    row.dataset.index = String(index);
    if (this.layout.looping === true) {
      row.dataset.position = String(position);
    } else {
      delete row.dataset.position;
    }
    row.dataset.label = option?.label ?? '';
  }

  private drawStripRow(row: HTMLElement, position: number): void {
    const option = this.optionAt(position);
    row.className =
      option?.isDisabled === true
        ? this.classes.stripRowDisabled
        : this.classes.stripRow;
    row.dataset.label = option?.label ?? '';
    row.style.insetBlockStart = `${position * this.layout.rowHeight}px`;
  }
}
