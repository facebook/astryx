// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file fixture.ts
 * @input Nothing: bundled by esbuild and injected into a blank page
 * @output A page of gesture hosts (a horizontal pan inside a scroller, a tap
 *   target, a long press, a pinch, a sheet body that hands its scroll to a
 *   pan) that records every recognizer transition and every click on
 *   `window.__gestures`
 * @position Browser fixture of gestures.chromium.spec.ts; test-only
 */

import {getGestureHost} from '../../GestureHost';
import type {GestureRecognizer} from '../../GestureRecognizer';
import {LongPressGestureRecognizer} from '../../LongPressGestureRecognizer';
import {PanGestureRecognizer} from '../../PanGestureRecognizer';
import {PinchGestureRecognizer} from '../../PinchGestureRecognizer';
import {TapGestureRecognizer} from '../../TapGestureRecognizer';

interface Entry {
  name: string;
  state: string;
  time: number;
  x?: number;
  y?: number;
  scale?: number;
  handoff?: boolean;
  beganAt?: number | null;
  startedAt?: number;
}

declare global {
  interface Window {
    __gestures: Entry[];
  }
}

window.__gestures = [];

document.body.style.margin = '0';
document.body.innerHTML = `
  <div id="page" style="font: 14px sans-serif">
    <div id="scroller" style="height: 240px; overflow-y: auto; overscroll-behavior: contain; background: #eef">
      <div style="height: 40px">scroller</div>
      <div id="hpan" style="height: 140px; background: #ccd">
        <button id="hbutton" style="width: 200px; height: 80px; margin: 30px">button</button>
      </div>
      <div style="height: 1200px">content</div>
    </div>
    <div id="tapper" style="height: 60px; background: #efe">tap</div>
    <div id="presser" style="height: 60px; background: #fee">press</div>
    <div id="pinchable" style="height: 160px; background: #ffe">pinch</div>
    <div id="sheetBody" style="height: 240px; overflow-y: auto; overscroll-behavior: contain; background: #eee">
      <div style="height: 1200px">sheet content</div>
    </div>
    <div style="height: 1600px">page</div>
  </div>`;

function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (found == null) {
    throw new Error(`missing #${id}`);
  }
  return found;
}

const host = getGestureHost(document);

function record(recognizer: GestureRecognizer, extra: () => Partial<Entry>) {
  recognizer.addTransitionListener((current, _from, to) => {
    window.__gestures.push({
      name: current.name,
      state: to,
      time: current.arena?.now() ?? performance.now(),
      ...(to === 'possible' || to === 'failed' ? {} : extra()),
    });
  });
}

const hpan = new PanGestureRecognizer({name: 'hpan', direction: 'horizontal'});
record(hpan, () => ({x: hpan.translation().x, y: hpan.translation().y}));
host.attach(element('hpan'), hpan);

const tap = new TapGestureRecognizer({name: 'tap'});
record(tap, () => ({}));
host.attach(element('tapper'), tap);

const press = new LongPressGestureRecognizer({name: 'press'});
record(press, () => ({
  beganAt: press.beganAt,
  startedAt: press.trackedTouches[0]?.startTime,
}));
host.attach(element('presser'), press);

const pinch = new PinchGestureRecognizer({name: 'pinch'});
const pinchPan = new PanGestureRecognizer({
  name: 'pinchPan',
  maximumNumberOfTouches: 2,
});
pinch.recognizeSimultaneouslyWith(pinchPan);
record(pinch, () => ({scale: pinch.scale}));
record(pinchPan, () => ({x: pinchPan.translation().x}));
host.attach(element('pinchable'), pinch);
host.attach(element('pinchable'), pinchPan);

const sheet = new PanGestureRecognizer({
  name: 'sheet',
  direction: 'down',
  scrollEdge: true,
  scrollHandoff: true,
});
record(sheet, () => ({
  y: sheet.translation().y,
  handoff: sheet.isHandoff,
}));
host.attach(element('sheetBody'), sheet);

for (const type of ['click', 'mousedown']) {
  document.addEventListener(
    type,
    event => {
      const target = event.target as HTMLElement | null;
      window.__gestures.push({
        name: `${type}:${target?.id ?? ''}`,
        state: 'dom',
        time: event.timeStamp,
      });
    },
    true,
  );
}
