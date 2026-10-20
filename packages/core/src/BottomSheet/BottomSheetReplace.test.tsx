// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file BottomSheetReplace.test.tsx
 * @input Uses vitest, @testing-library/react, BottomSheet, BottomSheetSwitcher
 *   and the private bottom-sheet stack registry
 * @output Tests for the replace handoff between standalone sheets: when a
 *   close and an open in one update are a replace and when they are not, the
 *   retained sheet's motion (covered, aligning, fading), one steady scrim,
 *   inertness and dismissal order, focus and the inherited opener, rapid
 *   reversal and dismissal during a handoff, non-modal sheets, and that
 *   switcher flows and lone sheets are untouched
 * @position Core testing; validates the replace path of bottomSheetStack.ts
 *   and BottomSheet.tsx
 *
 * SYNC: When bottomSheetStack.ts or BottomSheet.tsx change the replace
 * handoff, update these tests to match.
 */

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BottomSheet } from "./BottomSheet";
import { BottomSheetSwitcher } from "./BottomSheetSwitcher";
import {
  getBottomSheetStackForTests,
  resetBottomSheetStackForTests,
} from "./bottomSheetStack";
import { __resetInteractionModalityForTest } from "../utils/interactionModality";

let nativeLog: { call: "showModal" | "show" | "close"; dialog: HTMLElement }[] =
  [];

beforeEach(() => {
  nativeLog = [];
  resetBottomSheetStackForTests();
  __resetInteractionModalityForTest();
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    nativeLog.push({ call: "showModal", dialog: this });
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.show = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({ call: "show", dialog: this });
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    nativeLog.push({ call: "close", dialog: this });
    this.removeAttribute("open");
  });
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = vi.fn();
    Element.prototype.releasePointerCapture = vi.fn();
  }
  window.scrollTo = vi.fn();
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: false,
      media: "",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDialog(label: string): HTMLDialogElement {
  const dialog = document.querySelector<HTMLDialogElement>(
    `dialog[aria-label="${label}"]`,
  );
  if (dialog == null) {
    throw new Error(`dialog "${label}" not found`);
  }
  return dialog;
}

function getPanel(dialog: HTMLElement): HTMLElement {
  const panel = Array.from(
    dialog.querySelectorAll<HTMLElement>(".astryx-bottom-sheet"),
  ).find((candidate) => candidate.closest("dialog") === dialog);
  if (panel == null) {
    throw new Error("sheet panel not found");
  }
  return panel;
}

function scrim(dialog: HTMLElement): string {
  return dialog.style.getPropertyValue("--_sheet-scrim-opacity");
}

function calls(): string[] {
  return nativeLog.map(
    (entry) =>
      `${entry.call}:${entry.dialog.getAttribute("aria-label") ?? "?"}`,
  );
}

function openDialogs(): string[] {
  return Array.from(document.querySelectorAll("dialog[open]")).map(
    (dialog) => dialog.getAttribute("aria-label") ?? "?",
  );
}

/** `label:state` for every registered sheet, bottom to top. */
function summary(): string[] {
  return getBottomSheetStackForTests().map(({ element, isOpen, view }) => {
    const label = element?.getAttribute("aria-label") ?? "?";
    const state = isOpen
      ? view.isReplacing
        ? "replacing"
        : view.isTop
          ? "top"
          : "covered"
      : view.replacedMotion != null
        ? `replaced-${view.replacedMotion}`
        : "exiting";
    return `${label}:${state}:${view.depth}`;
  });
}

function endMotion(dialog: HTMLElement, propertyName: "transform" | "opacity") {
  fireEvent.transitionEnd(getPanel(dialog), { propertyName });
}

function pressEscape(): void {
  document.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    }),
  );
}

/** Give an element a fixed box, the way the browser would lay it out. */
function layout(element: HTMLElement, top: number, height: number) {
  element.getBoundingClientRect = () => new DOMRect(0, top, 390, height);
}

type Step = "one" | "two" | "three" | null;

/**
 * A three-step flow of standalone sheets: one state value names the open
 * step, so moving on closes one sheet and opens the next in one update.
 */
function Flow({
  hasScrim = true,
  initialStep = null,
  withBystander = false,
}: {
  hasScrim?: boolean;
  initialStep?: Step;
  withBystander?: boolean;
}) {
  const [step, setStep] = useState<Step>(initialStep);
  const [isBystanderOpen, setIsBystanderOpen] = useState(false);
  const stepProps = (own: Step) => ({
    isOpen: step === own,
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) {
        setStep((current) => (current === own ? null : current));
      }
    },
    hasScrim,
  });
  return (
    <>
      <button type="button" onClick={() => setStep("one")}>
        Open flow
      </button>
      {withBystander ? (
        <BottomSheet
          isOpen={isBystanderOpen}
          onOpenChange={setIsBystanderOpen}
          label="Bystander"
        >
          bystander
        </BottomSheet>
      ) : null}
      <BottomSheet {...stepProps("one")} label="One">
        <button type="button" onClick={() => setStep("two")}>
          Continue to two
        </button>
        <button type="button" onClick={() => setIsBystanderOpen(true)}>
          Open bystander
        </button>
      </BottomSheet>
      <BottomSheet {...stepProps("two")} label="Two">
        <button type="button" onClick={() => setStep("one")}>
          Back to one
        </button>
        <button type="button" onClick={() => setStep("three")}>
          Continue to three
        </button>
        <button type="button" onClick={() => setStep(null)}>
          Finish
        </button>
      </BottomSheet>
      <BottomSheet {...stepProps("three")} label="Three">
        <button type="button" onClick={() => setStep("two")}>
          Back to two
        </button>
      </BottomSheet>
    </>
  );
}

function openFlow() {
  const opener = screen.getByRole("button", { name: "Open flow" });
  opener.focus();
  fireEvent.click(opener);
  return opener;
}

// ---------------------------------------------------------------------------
// R1: what is, and is not, a replace
// ---------------------------------------------------------------------------

describe("BottomSheet replace: recognising a replace", () => {
  it("a top sheet closing while another opens in the same update is replaced", () => {
    render(<Flow />);
    openFlow();
    expect(summary()).toEqual(["One:top:0"]);
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    expect(summary()).toEqual(["One:replaced-covered:0", "Two:replacing:0"]);
    expect(openDialogs()).toEqual(["One", "Two"]);
    expect(getDialog("One")).toHaveAttribute("data-sheet-stack", "replaced");
    expect(getDialog("Two")).toHaveAttribute("data-sheet-stack", "top");
    expect(calls()).toEqual(["showModal:One", "showModal:Two"]);
  });

  it("a sheet opening over an open sheet is a push, not a replace", () => {
    render(<Flow withBystander />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Open bystander" }));
    expect(summary()).toEqual(["One:covered:1", "Bystander:top:0"]);
    expect(getDialog("One")).toHaveAttribute("data-sheet-stack", "covered");
  });

  it("a sheet closing on its own is a pop, not a replace", () => {
    render(<Flow initialStep="two" />);
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(summary()).toEqual(["Two:exiting:0"]);
    expect(getDialog("Two")).not.toHaveAttribute("data-sheet-stack");
  });

  it("a close and an open in different updates are a pop and a push", () => {
    render(<Flow initialStep="two" />);
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    fireEvent.click(screen.getByRole("button", { name: "Open flow" }));
    expect(summary()).toEqual(["Two:exiting:1", "One:top:0"]);
  });

  it("a covered sheet closing while a sheet opens is not a replace", () => {
    // Bystander is open over step one; one update closes the covered step
    // one (not the top) and opens step two: two pushes over the bystander
    // and one slides out beneath it.
    function Harness() {
      const [isOneOpen, setIsOneOpen] = useState(true);
      const [isBystanderOpen, setIsBystanderOpen] = useState(false);
      const [isTwoOpen, setIsTwoOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setIsOneOpen(false);
              setIsTwoOpen(true);
            }}
          >
            Swap beneath
          </button>
          <BottomSheet
            isOpen={isOneOpen}
            onOpenChange={setIsOneOpen}
            label="One"
          >
            <button type="button" onClick={() => setIsBystanderOpen(true)}>
              Open bystander
            </button>
          </BottomSheet>
          <BottomSheet
            isOpen={isBystanderOpen}
            onOpenChange={setIsBystanderOpen}
            label="Bystander"
          >
            x
          </BottomSheet>
          <BottomSheet
            isOpen={isTwoOpen}
            onOpenChange={setIsTwoOpen}
            label="Two"
          >
            x
          </BottomSheet>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Open bystander" }));
    expect(summary()).toEqual(["One:covered:1", "Bystander:top:0"]);
    fireEvent.click(screen.getByRole("button", { name: "Swap beneath" }));
    expect(summary()).toEqual([
      "One:exiting:2",
      "Bystander:covered:1",
      "Two:top:0",
    ]);
  });

  it("a switcher flow closing while a standalone sheet opens is never paired", () => {
    function Harness() {
      const [active, setActive] = useState<string | null>("step");
      const [isSheetOpen, setIsSheetOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={() => {
              setActive(null);
              setIsSheetOpen(true);
            }}
          >
            Leave flow for sheet
          </button>
          <BottomSheetSwitcher
            activeSheet={active}
            onActiveSheetChange={setActive}
            aria-label="Flow"
          >
            <BottomSheet sheetId="step" label="Step">
              x
            </BottomSheet>
          </BottomSheetSwitcher>
          <BottomSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            label="Sheet"
          >
            x
          </BottomSheet>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(
      screen.getByRole("button", { name: "Leave flow for sheet" }),
    );
    expect(summary()).toEqual(["Flow:exiting:1", "Sheet:top:0"]);
  });

  it("a sheet on its own carries no replace state", () => {
    render(<Flow />);
    openFlow();
    const [one] = getBottomSheetStackForTests();
    expect(one.view).toMatchObject({
      replacedMotion: null,
      alignmentOffset: 0,
      isReplacing: false,
      isStacked: false,
    });
    expect(getDialog("One")).not.toHaveAttribute("data-sheet-stack");
    expect(calls()).toEqual(["showModal:One"]);
  });
});

// ---------------------------------------------------------------------------
// R2: the handoff
// ---------------------------------------------------------------------------

describe("BottomSheet replace: the handoff", () => {
  it("keeps the replaced sheet in place, inert and hidden, while the new sheet enters", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    const one = getDialog("One");
    const two = getDialog("Two");
    expect(one.open).toBe(true);
    expect(one).toHaveAttribute("inert");
    expect(one).toHaveAttribute("aria-hidden", "true");
    expect(one).not.toHaveAttribute("aria-modal");
    expect(two).toHaveAttribute("aria-modal", "true");
    expect(two).not.toHaveAttribute("inert");
    // Not receded: a replaced sheet is at the new sheet's level, not under it.
    expect(one).not.toHaveAttribute("data-sheet-stack-depth");
    // The retained panel stays put (no exit transform) and takes no pointer.
    expect(getPanel(one).style.transform).toBe("");
    expect(getComputedStyle(getPanel(one)).pointerEvents).toBe("none");
  });

  it("fades the replaced sheet only after the entering motion completes, then closes its dialog", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    const one = getDialog("One");
    const two = getDialog("Two");
    expect(summary()).toEqual(["One:replaced-covered:0", "Two:replacing:0"]);
    endMotion(two, "transform");
    expect(summary()).toEqual(["One:replaced-fading:0", "Two:replacing:0"]);
    expect(one.open).toBe(true);
    endMotion(one, "opacity");
    expect(summary()).toEqual(["Two:top:0"]);
    expect(openDialogs()).toEqual(["Two"]);
    expect(calls()).toEqual(["showModal:One", "showModal:Two", "close:One"]);
    expect(two).not.toHaveAttribute("data-sheet-stack");
  });

  it("moves a taller replaced sheet down to the entering sheet, concurrently, and fades after both finish", () => {
    render(<Flow />);
    openFlow();
    const one = getDialog("One");
    const two = getDialog("Two");
    // Step one is 400px tall; step two will rest 160px lower. The panels are
    // mounted already, so lay them out before the switch: the alignment is
    // measured when the entering motion starts.
    layout(getPanel(one), 444, 400);
    layout(getPanel(two).parentElement as HTMLElement, 604, 240);
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    expect(summary()).toEqual(["One:replaced-aligning:0", "Two:replacing:0"]);
    expect(getPanel(one).style.transform).toBe("translateY(160px)");
    // Entering finished first: wait for the alignment.
    endMotion(two, "transform");
    expect(summary()).toEqual(["One:replaced-aligning:0", "Two:replacing:0"]);
    endMotion(one, "transform");
    expect(summary()).toEqual(["One:replaced-fading:0", "Two:replacing:0"]);
    endMotion(one, "opacity");
    expect(summary()).toEqual(["Two:top:0"]);
  });

  it("waits for the entering motion when the alignment finishes first", () => {
    render(<Flow />);
    openFlow();
    const one = getDialog("One");
    const two = getDialog("Two");
    layout(getPanel(one), 444, 400);
    layout(getPanel(two).parentElement as HTMLElement, 604, 240);
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    endMotion(one, "transform");
    expect(summary()).toEqual(["One:replaced-aligning:0", "Two:replacing:0"]);
    endMotion(two, "transform");
    expect(summary()).toEqual(["One:replaced-fading:0", "Two:replacing:0"]);
  });

  it("leaves a shorter replaced sheet where it is", () => {
    render(<Flow />);
    openFlow();
    const one = getDialog("One");
    const two = getDialog("Two");
    layout(getPanel(one), 604, 240);
    layout(getPanel(two).parentElement as HTMLElement, 444, 400);
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    expect(summary()).toEqual(["One:replaced-covered:0", "Two:replacing:0"]);
    expect(getPanel(one).style.transform).toBe("");
  });

  it("keeps the scrim on the replaced sheet and hands it to the new sheet with no fade", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    const one = getDialog("One");
    const two = getDialog("Two");
    expect(scrim(one)).toBe("1");
    expect(scrim(two)).toBe("0");
    // The flip to 1 lands with the transition pinned to 0s (rAF is
    // synchronous here, so the pin is lifted again by the time we look).
    const pins: string[] = [];
    const setProperty = CSSStyleDeclaration.prototype.setProperty;
    CSSStyleDeclaration.prototype.setProperty = function (name, value) {
      if (
        this === two.style &&
        name === "--_sheet-scrim-opacity" &&
        value === "1"
      ) {
        pins.push(this.getPropertyValue("--_sheet-scrim-duration"));
      }
      return setProperty.call(this, name, value);
    };
    endMotion(two, "transform");
    endMotion(one, "opacity");
    CSSStyleDeclaration.prototype.setProperty = setProperty;
    expect(scrim(two)).toBe("1");
    expect(pins[0]).toBe("0s");
    expect(two.style.getPropertyValue("--_sheet-scrim-duration")).toBe("");
    expect(one.open).toBe(false);
  });

  it("runs the replace one level up a stack and leaves the sheet beneath covered", () => {
    function Harness() {
      const [isBaseOpen, setIsBaseOpen] = useState(true);
      const [step, setStep] = useState<"a" | "b" | null>("a");
      return (
        <>
          <BottomSheet
            isOpen={isBaseOpen}
            onOpenChange={setIsBaseOpen}
            label="Base"
          >
            x
          </BottomSheet>
          <BottomSheet
            isOpen={step === "a"}
            onOpenChange={(o) => !o && setStep(null)}
            label="A"
          >
            <button type="button" onClick={() => setStep("b")}>
              Next
            </button>
          </BottomSheet>
          <BottomSheet
            isOpen={step === "b"}
            onOpenChange={(o) => !o && setStep(null)}
            label="B"
          >
            x
          </BottomSheet>
        </>
      );
    }
    render(<Harness />);
    expect(summary()).toEqual(["Base:covered:1", "A:top:0"]);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(summary()).toEqual([
      "Base:covered:1",
      "A:replaced-covered:0",
      "B:replacing:0",
    ]);
    expect(scrim(getDialog("Base"))).toBe("1");
    expect(scrim(getDialog("A"))).toBe("0");
    expect(scrim(getDialog("B"))).toBe("0");
    endMotion(getDialog("B"), "transform");
    endMotion(getDialog("A"), "opacity");
    expect(summary()).toEqual(["Base:covered:1", "B:top:0"]);
    expect(scrim(getDialog("Base"))).toBe("1");
    expect(scrim(getDialog("B"))).toBe("0");
  });
});

// ---------------------------------------------------------------------------
// R3: focus, dismissal, and interruptions
// ---------------------------------------------------------------------------

describe("BottomSheet replace: focus and dismissal", () => {
  it("moves focus into the entering sheet and keeps it there when the replaced dialog closes", () => {
    render(<Flow />);
    openFlow();
    const one = getDialog("One");
    const two = getDialog("Two");
    const next = screen.getByRole("button", { name: "Continue to two" });
    next.focus();
    fireEvent.click(next);
    expect(document.activeElement).toBe(getPanel(two));
    endMotion(two, "transform");
    endMotion(one, "opacity");
    expect(document.activeElement).toBe(getPanel(two));
  });

  it("returns focus to the element that opened the flow when the replacing sheet closes it", () => {
    render(<Flow />);
    const opener = openFlow();
    const next = screen.getByRole("button", { name: "Continue to two" });
    next.focus();
    fireEvent.click(next);
    const one = getDialog("One");
    const two = getDialog("Two");
    endMotion(two, "transform");
    endMotion(one, "opacity");
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    endMotion(two, "transform");
    expect(openDialogs()).toEqual([]);
    expect(document.activeElement).toBe(opener);
  });

  it("routes Escape to the replacing sheet, not the replaced one, during the handoff", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    act(() => {
      pressEscape();
    });
    // Two closed the flow; one was dropped at once; both leave.
    expect(summary()).toEqual(["Two:exiting:0"]);
    expect(getDialog("One").open).toBe(false);
    expect(getDialog("Two").open).toBe(true);
  });

  it("routes Escape to the sheet that came back, during a reversal", () => {
    render(<Flow initialStep="two" />);
    fireEvent.click(screen.getByRole("button", { name: "Back to one" }));
    expect(summary()).toEqual(["Two:replaced-covered:0", "One:replacing:0"]);
    act(() => {
      pressEscape();
    });
    expect(summary()).toEqual(["One:exiting:0"]);
  });

  it("drops the replaced sheet at once when the replacing sheet is dismissed mid-handoff", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    const one = getDialog("One");
    const two = getDialog("Two");
    fireEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(one.open).toBe(false);
    expect(two.open).toBe(true);
    expect(scrim(two)).toBe("0");
    endMotion(two, "transform");
    expect(openDialogs()).toEqual([]);
  });

  it("a reversal mid-handoff replaces the replacing sheet with the one coming back, on top", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    fireEvent.click(screen.getByRole("button", { name: "Back to one" }));
    // One was already in place: its entrance completes at once and two
    // fades straight away, as a switcher step coming back does.
    expect(summary()).toEqual(["Two:replaced-fading:0", "One:replacing:0"]);
    const one = getDialog("One");
    const two = getDialog("Two");
    expect(one.open).toBe(true);
    expect(two.open).toBe(true);
    // Only one is re-shown, above two; two keeps its place, its backdrop
    // (the scrim stays with the retained sheet) and its motion in flight.
    expect(calls()).toEqual([
      "showModal:One",
      "showModal:Two",
      "close:One",
      "showModal:One",
    ]);
    expect(scrim(two)).toBe("1");
    expect(scrim(one)).toBe("0");
    expect(getPanel(one).style.transform).toBe("");
    expect(document.activeElement).toBe(getPanel(one));
    endMotion(two, "opacity");
    expect(summary()).toEqual(["One:top:0"]);
    expect(scrim(one)).toBe("1");
  });

  it("a third step mid-handoff drops the first step at once", () => {
    render(<Flow />);
    openFlow();
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue to three" }));
    expect(getDialog("One").open).toBe(false);
    expect(summary()).toEqual(["Two:replaced-covered:0", "Three:replacing:0"]);
  });

  it("a purpose on the replacing sheet governs dismissal", () => {
    function Harness() {
      const [step, setStep] = useState<"a" | "b" | null>("a");
      return (
        <>
          <BottomSheet
            isOpen={step === "a"}
            onOpenChange={(o) => !o && setStep(null)}
            label="A"
          >
            <button type="button" onClick={() => setStep("b")}>
              Next
            </button>
          </BottomSheet>
          <BottomSheet
            isOpen={step === "b"}
            onOpenChange={(o) => !o && setStep(null)}
            purpose="required"
            label="B"
          >
            x
          </BottomSheet>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    act(() => {
      pressEscape();
    });
    expect(summary()).toEqual(["A:replaced-covered:0", "B:replacing:0"]);
    expect(getDialog("B")).toHaveAttribute("role", "alertdialog");
  });
});

// ---------------------------------------------------------------------------
// R4: the boundary — who acted, from where
// ---------------------------------------------------------------------------

/** A step flow whose step change comes from code, after a delay. */
function Timed() {
  const [step, setStep] = useState<Step>("one");
  return (
    <>
      <BottomSheet
        isOpen={step === "one"}
        onOpenChange={(open) => !open && setStep(null)}
        label="One"
      >
        <button
          type="button"
          onClick={() => {
            setTimeout(() => setStep("two"), 500);
          }}
        >
          Save and continue
        </button>
      </BottomSheet>
      <BottomSheet
        isOpen={step === "two"}
        onOpenChange={(open) => !open && setStep(null)}
        label="Two"
      >
        two
      </BottomSheet>
    </>
  );
}

describe("BottomSheet replace: unrelated owners", () => {
  /**
   * Two owners that know nothing of each other, in one tree: X owns sheet A
   * and its opener, Y owns sheet B and its opener. A page control closes A
   * and opens B in one update.
   */
  function TwoOwners() {
    const [isAOpen, setIsAOpen] = useState(false);
    const [isBOpen, setIsBOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setIsAOpen(true)}>
          Open A
        </button>
        <button type="button" onClick={() => setIsBOpen(true)}>
          Open B
        </button>
        <button
          type="button"
          onClick={() => {
            setIsAOpen(false);
            setIsBOpen(true);
          }}
        >
          Swap from page
        </button>
        <BottomSheet isOpen={isAOpen} onOpenChange={setIsAOpen} label="A">
          <button
            type="button"
            onClick={() => {
              setIsAOpen(false);
              setIsBOpen(true);
            }}
          >
            Swap from A
          </button>
        </BottomSheet>
        <BottomSheet isOpen={isBOpen} onOpenChange={setIsBOpen} label="B">
          <button type="button" onClick={() => setIsBOpen(false)}>
            Close B
          </button>
        </BottomSheet>
      </>
    );
  }

  it("a close and an open driven from a control outside the closing sheet are a pop and a push, each with its own opener", () => {
    render(<TwoOwners />);
    const openA = screen.getByRole("button", { name: "Open A" });
    openA.focus();
    fireEvent.click(openA);
    const swap = screen.getByRole("button", { name: "Swap from page" });
    swap.focus();
    fireEvent.click(swap);
    // Not a replace: A slides out beneath B, B is a fresh push.
    expect(summary()).toEqual(["A:exiting:1", "B:top:0"]);
    expect(getDialog("A")).toHaveAttribute("data-sheet-stack", "exiting");
    expect(getDialog("A")).not.toHaveAttribute("data-sheet-stack", "replaced");
    endMotion(getDialog("A"), "transform");
    expect(summary()).toEqual(["B:top:0"]);
    // B's opener is its own (the control that opened it), not A's.
    fireEvent.click(screen.getByRole("button", { name: "Close B" }));
    endMotion(getDialog("B"), "transform");
    expect(swap).toHaveFocus();
    expect(openA).not.toHaveFocus();
  });

  it("the same close and open driven from inside the closing sheet are a replace", () => {
    render(<TwoOwners />);
    const openA = screen.getByRole("button", { name: "Open A" });
    openA.focus();
    fireEvent.click(openA);
    // Focus is in A (its panel took it on open).
    fireEvent.click(screen.getByRole("button", { name: "Swap from A" }));
    expect(summary()).toEqual(["A:replaced-covered:0", "B:replacing:0"]);
    endMotion(getDialog("B"), "transform");
    endMotion(getDialog("A"), "opacity");
    fireEvent.click(screen.getByRole("button", { name: "Close B" }));
    endMotion(getDialog("B"), "transform");
    // The flow began at A's opener, so that is where it returns.
    expect(openA).toHaveFocus();
  });

  it("a step flow whose steps are wrapped in their own components still replaces", () => {
    function Step({
      name,
      step,
      setStep,
      next,
    }: {
      name: Step;
      step: Step;
      setStep: (step: Step) => void;
      next: Step;
    }) {
      return (
        <div>
          <BottomSheet
            isOpen={step === name}
            onOpenChange={(open) => !open && setStep(null)}
            label={String(name)}
          >
            <button type="button" onClick={() => setStep(next)}>
              Go to {next}
            </button>
          </BottomSheet>
        </div>
      );
    }
    function Wizard() {
      const [step, setStep] = useState<Step>(null);
      return (
        <>
          <button type="button" onClick={() => setStep("one")}>
            Start
          </button>
          <Step name="one" step={step} setStep={setStep} next="two" />
          <Step name="two" step={step} setStep={setStep} next="three" />
          <Step name="three" step={step} setStep={setStep} next={null} />
        </>
      );
    }
    render(<Wizard />);
    const start = screen.getByRole("button", { name: "Start" });
    start.focus();
    fireEvent.click(start);
    fireEvent.click(screen.getByRole("button", { name: "Go to two" }));
    expect(summary()).toEqual(["one:replaced-covered:0", "two:replacing:0"]);
    endMotion(getDialog("two"), "transform");
    endMotion(getDialog("one"), "opacity");
    fireEvent.click(screen.getByRole("button", { name: "Go to three" }));
    expect(summary()).toEqual(["two:replaced-covered:0", "three:replacing:0"]);
    endMotion(getDialog("three"), "transform");
    endMotion(getDialog("two"), "opacity");
    fireEvent.click(screen.getByRole("button", { name: "Go to" }));
    endMotion(getDialog("three"), "transform");
    expect(openDialogs()).toEqual([]);
    expect(start).toHaveFocus();
  });

  it("a step change made by code while focus is in the step is a replace (focus cannot be anywhere else under a modal sheet)", () => {
    vi.useFakeTimers();
    try {
      render(<Timed />);
      fireEvent.click(
        screen.getByRole("button", { name: "Save and continue" }),
      );
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(summary()).toEqual(["One:replaced-covered:0", "Two:replacing:0"]);
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// R5: non-modal sheets take no part
// ---------------------------------------------------------------------------

describe("BottomSheet replace: non-modal sheets", () => {
  it("non-modal sheets neither stack nor replace: a step change is a pop and a push with show()", () => {
    render(<Flow hasScrim={false} />);
    openFlow();
    expect(calls()).toEqual(["show:One"]);
    fireEvent.click(screen.getByRole("button", { name: "Continue to two" }));
    expect(calls()).toEqual(["show:One", "show:Two"]);
    const one = getDialog("One");
    const two = getDialog("Two");
    expect(getBottomSheetStackForTests()).toEqual([]);
    expect(one).not.toHaveAttribute("data-sheet-stack");
    expect(two).not.toHaveAttribute("data-sheet-stack");
    // One exits as it would on its own; no replace pose, no z-index band.
    expect(getPanel(one).className).toContain("sheetClosing");
    expect(getComputedStyle(two).zIndex).not.toBe("1001");
    endMotion(one, "transform");
    expect(openDialogs()).toEqual(["Two"]);
  });

  it("a non-modal sheet never pairs with a modal one", () => {
    function Harness() {
      const [step, setStep] = useState<"a" | "b">("a");
      return (
        <>
          <BottomSheet
            isOpen={step === "a"}
            onOpenChange={() => {}}
            hasScrim={false}
            label="A"
          >
            <button type="button" onClick={() => setStep("b")}>
              Next
            </button>
          </BottomSheet>
          <BottomSheet isOpen={step === "b"} onOpenChange={() => {}} label="B">
            x
          </BottomSheet>
        </>
      );
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(summary()).toEqual(["B:top:0"]);
    expect(getDialog("A")).not.toHaveAttribute("data-sheet-stack");
    expect(calls()).toEqual(["show:A", "showModal:B"]);
  });
});
