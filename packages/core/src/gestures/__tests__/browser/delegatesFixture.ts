// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file delegatesFixture.ts
 * @input Nothing: bundled by esbuild and injected into a blank page
 * @output Three panels where app code relates to a component's recognizer by
 *   its published name ('BottomSheet.drag', on stand-in sheets): A, an app
 *   pan inside a sheet that can wait for the sheet's drag; B, a sheet inside
 *   an app pan area whose drag can wait for the app's pan; C, a veto of the
 *   sheet's drag while the app is editing. `window.__setDeclared` turns each
 *   declaration on or off; every transition is logged on `window.__log`
 * @position Browser fixture of gestureDelegates.browser.spec.ts; test-only
 */

import {addGestureDelegate, gestureNamed} from '../../gestureDelegates';
import {getGestureHost} from '../../GestureHost';
import type {GestureRecognizer} from '../../GestureRecognizer';
import {PanGestureRecognizer} from '../../PanGestureRecognizer';

type Panel = 'A' | 'B' | 'C';

declare global {
  interface Window {
    __log: string[];
    __setDeclared: (panel: Panel, on: boolean) => void;
  }
}

window.__log = [];
const declared: Record<Panel, boolean> = {A: false, B: false, C: false};

const TITLES: Record<Panel, [string, string]> = {
  A: ['A · app pan in a sheet', 'declared: app waits'],
  B: ['B · sheet in an app pan', 'declared: sheet waits'],
  C: ['C · veto while editing', 'editing: drag vetoed'],
};

document.body.style.cssText =
  'margin:0;font:13px/1.3 system-ui,sans-serif;background:#e8eaf0;overflow:hidden';
document.body.innerHTML = (['A', 'B', 'C'] as const)
  .map(
    panel => `
  <section id="panel${panel}" style="position:relative;height:276px;overflow:hidden;border-bottom:1px solid #c5c9d6">
    <div style="padding:6px 10px;display:flex;justify-content:space-between">
      <b>${TITLES[panel][0]}</b><span id="mode${panel}" style="color:#666">default</span>
    </div>
    <div id="frame${panel}" style="position:absolute;inset:30px 10px 10px;border-radius:12px;background:${panel === 'B' ? 'repeating-linear-gradient(45deg,#dfe6f5 0 10px,#d3dcf0 10px 20px)' : 'transparent'};overflow:hidden">
      ${panel === 'B' ? '<div id="dotB" style="position:absolute;left:174px;top:18px;width:28px;height:28px;border-radius:50%;background:#e2554f;z-index:1"></div>' : ''}
      <div id="sheet${panel}" style="position:absolute;left:0;right:0;bottom:0;height:${panel === 'B' ? 170 : 236}px;border-radius:14px 14px 0 0;background:#fff;box-shadow:0 -2px 10px rgba(0,0,0,.15)">
        <div style="width:36px;height:5px;border-radius:3px;background:#c7c7cc;margin:7px auto"></div>
        <div style="text-align:center;color:#888">sheet</div>
        ${panel === 'A' ? '<div id="canvasA" style="position:relative;margin:10px auto;width:220px;height:150px;border-radius:10px;background:#eef1f7;overflow:hidden"><div id="dotA" style="position:absolute;left:96px;top:61px;width:28px;height:28px;border-radius:50%;background:#e2554f"></div></div>' : ''}
      </div>
    </div>
  </section>`,
  )
  .join('');

const element = (id: string): HTMLElement => {
  const found = document.getElementById(id);
  if (found == null) {
    throw new Error(`missing #${id}`);
  }
  return found;
};

// A finger mark, for the recordings: injected touches draw nothing.
const finger = document.createElement('div');
finger.style.cssText =
  'position:fixed;width:34px;height:34px;margin:-17px 0 0 -17px;border-radius:50%;background:rgba(40,40,40,.28);pointer-events:none;display:none;z-index:9';
document.body.append(finger);
for (const type of ['touchstart', 'touchmove'] as const) {
  document.addEventListener(
    type,
    event => {
      const touch = event.touches[0];
      if (touch != null) {
        finger.style.display = 'block';
        finger.style.left = `${touch.clientX}px`;
        finger.style.top = `${touch.clientY}px`;
      }
    },
    {capture: true, passive: true},
  );
}
document.addEventListener(
  'touchend',
  () => {
    finger.style.display = 'none';
  },
  {capture: true, passive: true},
);

const host = getGestureHost(document);

/** Logs `label:state` and moves `target` with the pan, springing back after. */
function follow(
  recognizer: PanGestureRecognizer,
  label: string,
  target: HTMLElement,
  axis: 'xy' | 'down',
): void {
  recognizer.addTransitionListener((_recognizer, _from, to) => {
    window.__log.push(`${label}:${to}`);
  });
  recognizer.addListener(current => {
    if (current.state === 'began' || current.state === 'changed') {
      const {x, y} = current.totalTranslation();
      target.style.transition = 'none';
      target.style.transform =
        axis === 'down'
          ? `translateY(${Math.max(0, y)}px)`
          : `translate(${x}px, ${y}px)`;
    } else {
      target.style.transition =
        'transform 0.35s cubic-bezier(0.2, 0.9, 0.3, 1)';
      target.style.transform = 'none';
    }
  });
}

/** The component stand-in: a sheet's drag, published under its name. */
function sheetDrag(panel: Panel): PanGestureRecognizer {
  const sheet = element(`sheet${panel}`);
  const drag = new PanGestureRecognizer({
    name: 'BottomSheet.drag',
    direction: 'down',
  });
  follow(drag, `sheet${panel}`, sheet, 'down');
  host.attach(sheet, drag);
  return drag;
}

// A: the app's canvas pan sits inside the sheet. Declared, it waits for the
// sheet it is in to fail, as UIKit's require-to-fail does.
sheetDrag('A');
const canvasA = element('canvasA');
const appA = new PanGestureRecognizer({
  name: 'app.canvas',
  shouldRequireFailureOf: (_self, other: GestureRecognizer) =>
    declared.A &&
    gestureNamed('BottomSheet.drag', {containing: canvasA})(other),
});
follow(appA, 'appA', element('dotA'), 'xy');
host.attach(canvasA, appA);

// B: the sheet sits inside the app's pan area. Declared, the sheet's drag
// waits for the app's pan to fail.
sheetDrag('B');
const frameB = element('frameB');
const appB = new PanGestureRecognizer({
  name: 'app.frame',
  shouldBeRequiredToFailBy: (_self, other: GestureRecognizer) =>
    declared.B && gestureNamed('BottomSheet.drag', {within: frameB})(other),
});
follow(appB, 'appB', element('dotB'), 'xy');
host.attach(frameB, appB);

// C: the app vetoes the sheet's drag while it is editing.
sheetDrag('C');
addGestureDelegate(
  document,
  gestureNamed('BottomSheet.drag', {within: element('sheetC')}),
  {shouldBegin: () => !declared.C},
);

window.__setDeclared = (panel, on) => {
  declared[panel] = on;
  const mode = element(`mode${panel}`);
  mode.textContent = on ? TITLES[panel][1] : 'default';
  mode.style.color = on ? '#1a7f37' : '#666';
};
