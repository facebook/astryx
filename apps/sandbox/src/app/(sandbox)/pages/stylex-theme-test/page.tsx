"use client";

/**
 * StyleX Theme Prototype — Test Page
 *
 * Validates:
 * 1. Base < theme (@scope proximity beats unscoped)
 * 2. Theme nesting — inner scope wins
 * 3. Theme < product override (stylex.props last-arg strips theme classes)
 */

import React from "react";
import * as stylex from "@stylexjs/stylex";
import "./themes.css";

// =============================================================================
// THEME REGISTRY (inline for self-contained prototype)
// =============================================================================

type StyleXCSSObject = { $$css: true; [property: string]: string | true };

const registry = new Map<
  string,
  Map<string, Record<string, StyleXCSSObject>>
>();

function registerTheme(
  themeName: string,
  components: Record<string, Record<string, StyleXCSSObject>>
) {
  const themeMap = new Map<string, Record<string, StyleXCSSObject>>();
  for (const [component, styles] of Object.entries(components)) {
    themeMap.set(component, styles);
  }
  registry.set(themeName, themeMap);
}

function getThemeStyles(
  component: string
): Record<string, StyleXCSSObject> | null {
  const merged: Record<string, Record<string, string>> = {};

  for (const [, themeMap] of registry) {
    const componentStyles = themeMap.get(component);
    if (!componentStyles) continue;
    for (const [part, cssObj] of Object.entries(componentStyles)) {
      if (!merged[part]) merged[part] = {};
      for (const [prop, value] of Object.entries(cssObj)) {
        if (prop === "$$css" || typeof value !== "string") continue;
        merged[part][prop] = merged[part][prop]
          ? `${merged[part][prop]} ${value}`
          : value;
      }
    }
  }

  if (Object.keys(merged).length === 0) return null;

  const result: Record<string, StyleXCSSObject> = {};
  for (const [part, props] of Object.entries(merged)) {
    result[part] = { $$css: true, ...props } as StyleXCSSObject;
  }
  return result;
}

// =============================================================================
// THEME REGISTRATIONS (simulates build output IIFEs)
// =============================================================================

registerTheme("brutalist", {
  button: {
    root: {
      $$css: true,
      borderRadius: "xds-br-brutalist-btn",
      textTransform: "xds-tt-brutalist-btn",
      letterSpacing: "xds-ls-brutalist-btn",
      fontWeight: "xds-fw-brutalist-btn",
    },
  },
});

registerTheme("neutral", {
  button: {
    root: {
      $$css: true,
      borderRadius: "xds-br-neutral-btn",
      fontWeight: "xds-fw-neutral-btn",
    },
  },
});

// =============================================================================
// PROTOTYPE BUTTON
// =============================================================================

const baseStyles = stylex.create({
  root: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    backgroundColor: "#e4e4e7",
    color: "#18181b",
    fontFamily: "system-ui, sans-serif",
  },
});

const productOverrides = stylex.create({
  customRadius: {
    borderRadius: "20px",
  },
  customWeight: {
    fontWeight: "300",
  },
});

function DemoButton({
  label,
  xstyle,
}: {
  label: string;
  xstyle?: stylex.StyleXStyles;
}) {
  const themes = getThemeStyles("button");

  // The key line: base < theme < override
  // Cast $$css object — runtime compatible with styleq, type system doesn't know that
  return (
    <button
      {...stylex.props(
        baseStyles.root,
        themes?.root as unknown as stylex.StyleXStyles,
        xstyle
      )}
    >
      {label}
    </button>
  );
}

// =============================================================================
// PAGE
// =============================================================================

const s = stylex.create({
  page: {
    padding: "32px",
    fontFamily: "system-ui, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  section: {
    marginBottom: "24px",
    padding: "24px",
    borderRadius: "8px",
    border: "1px solid #e4e4e7",
  },
  title: {
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  },
  desc: {
    fontSize: "13px",
    color: "#71717a",
    marginBottom: "16px",
    lineHeight: "1.5",
  },
  row: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  nested: {
    padding: "16px",
    borderRadius: "6px",
    border: "1px dashed #a1a1aa",
    marginTop: "12px",
  },
  label: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#a1a1aa",
    marginBottom: "8px",
    fontWeight: "600",
  },
  h1: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#71717a",
    marginBottom: "32px",
  },
  howItWorks: {
    fontSize: "13px",
    color: "#52525b",
    lineHeight: "1.8",
  },
});

export default function StyleXThemeTestPage() {
  return (
    <div {...stylex.props(s.page)}>
      <h1 {...stylex.props(s.h1)}>StyleX Theme Resolution Prototype</h1>
      <p {...stylex.props(s.subtitle)}>
        base &lt; theme (@scope) &lt; override (stylex merge)
      </p>

      {/* Test 1: Theme overrides base */}
      <div {...stylex.props(s.section)}>
        <div {...stylex.props(s.title)}>Test 1: Theme overrides base</div>
        <p {...stylex.props(s.desc)}>
          Base: border-radius 6px, font-weight 500. Brutalist theme overrides to
          9999px / 800 via @scope proximity (scoped beats unscoped).
        </p>
        <div data-xds-theme="brutalist">
          <div {...stylex.props(s.label)}>scope: brutalist</div>
          <div {...stylex.props(s.row)}>
            <DemoButton label="Brutalist Button" />
          </div>
        </div>
      </div>

      {/* Test 2: Nested themes */}
      <div {...stylex.props(s.section)}>
        <div {...stylex.props(s.title)}>
          Test 2: Nested themes — inner scope wins
        </div>
        <p {...stylex.props(s.desc)}>
          Outer: brutalist (border-radius 9999px, font-weight 800). Inner:
          neutral (border-radius 8px, font-weight 600). Inner button should show
          neutral values.
        </p>
        <div data-xds-theme="brutalist">
          <div {...stylex.props(s.label)}>outer: brutalist</div>
          <div {...stylex.props(s.row)}>
            <DemoButton label="Outer (brutalist)" />
          </div>
          <div data-xds-theme="neutral" {...stylex.props(s.nested)}>
            <div {...stylex.props(s.label)}>inner: neutral</div>
            <div {...stylex.props(s.row)}>
              <DemoButton label="Inner (neutral)" />
            </div>
          </div>
        </div>
      </div>

      {/* Test 3: Product override beats theme */}
      <div {...stylex.props(s.section)}>
        <div {...stylex.props(s.title)}>
          Test 3: Product override beats theme
        </div>
        <p {...stylex.props(s.desc)}>
          Brutalist sets border-radius: 9999px. Product xstyle override sets
          20px. stylex.props last-arg strips ALL theme border-radius classes.
        </p>
        <div data-xds-theme="brutalist">
          <div {...stylex.props(s.label)}>brutalist + xstyle override</div>
          <div {...stylex.props(s.row)}>
            <DemoButton label="No override" />
            <DemoButton
              label="xstyle: borderRadius 20px"
              xstyle={productOverrides.customRadius}
            />
          </div>
        </div>
      </div>

      {/* Test 4: Partial override */}
      <div {...stylex.props(s.section)}>
        <div {...stylex.props(s.title)}>
          Test 4: Partial override — only strips overridden property
        </div>
        <p {...stylex.props(s.desc)}>
          Brutalist sets borderRadius (9999px) + fontWeight (800). Override only
          sets fontWeight: 300. Radius should remain 9999px from theme.
        </p>
        <div data-xds-theme="brutalist">
          <div {...stylex.props(s.label)}>
            brutalist + partial xstyle (fontWeight only)
          </div>
          <div {...stylex.props(s.row)}>
            <DemoButton label="No override" />
            <DemoButton
              label="fontWeight: 300 (radius stays)"
              xstyle={productOverrides.customWeight}
            />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div {...stylex.props(s.section)}>
        <div {...stylex.props(s.title)}>How it works</div>
        <div {...stylex.props(s.howItWorks)}>
          1. Theme build generates $$css objects + CSS with @scope wrappers
          <br />
          2. Theme IIFE registers into global registry at import time
          <br />
          3. Component calls getThemeStyles — gets merged $$css with ALL theme
          classes per property
          <br />
          4. Renders: stylex.props(base, themes?.root, xstyle)
          <br />
          5. CSS @scope proximity picks active theme; JS last-arg strips on
          override
        </div>
      </div>
    </div>
  );
}
