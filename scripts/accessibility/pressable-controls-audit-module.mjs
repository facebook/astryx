// Copyright (c) Meta Platforms, Inc. and affiliates.

import fs from 'node:fs';
import {neutralTheme} from '../../packages/themes/neutral/src/neutralTheme.ts';
import {
  AA_NON_TEXT,
  AA_TEXT,
  compositeColor,
  createTokenResolver,
  displayName,
  documentedMeasurement,
  formatRatio,
  localVariables,
  lowest,
  measureContrast,
  renderBackground,
  resolveSolidOverlay,
  resultStatus,
} from './contrast-audit-engine.mjs';

const MODES = [
  {name: 'Light', index: 0},
  {name: 'Dark', index: 1},
];
const PARENT_PROFILES = [
  {name: 'body', token: 'var(--color-background-body)'},
  {name: 'surface', token: 'var(--color-background-surface)'},
];
const BUTTON_VARIANTS = ['primary', 'secondary', 'ghost', 'destructive'];
const BADGE_VARIANTS = [
  'neutral',
  'info',
  'success',
  'warning',
  'error',
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

const SOURCE_PATHS = {
  Button: new URL('../../packages/core/src/Button/Button.tsx', import.meta.url),
  ButtonIndex: new URL(
    '../../packages/core/src/Button/index.ts',
    import.meta.url,
  ),
  BadgeIndex: new URL(
    '../../packages/core/src/Badge/index.ts',
    import.meta.url,
  ),
  IconButton: new URL(
    '../../packages/core/src/IconButton/IconButton.tsx',
    import.meta.url,
  ),
  ToggleButton: new URL(
    '../../packages/core/src/ToggleButton/ToggleButton.tsx',
    import.meta.url,
  ),
  ButtonGroup: new URL(
    '../../packages/core/src/Button/Button.tsx',
    import.meta.url,
  ),
  InteractionOverlay: new URL(
    '../../packages/core/src/utils/interactionOverlay.stylex.ts',
    import.meta.url,
  ),
  Tokens: new URL(
    '../../packages/core/src/theme/tokens.stylex.ts',
    import.meta.url,
  ),
  SegmentedControl: new URL(
    '../../packages/core/src/SegmentedControl/SegmentedControl.tsx',
    import.meta.url,
  ),
  SegmentedControlItem: new URL(
    '../../packages/core/src/SegmentedControl/SegmentedControlItem.tsx',
    import.meta.url,
  ),
};

export const pressableControlsSource = Object.fromEntries(
  Object.entries(SOURCE_PATHS).map(([name, url]) => [
    name,
    fs.readFileSync(url, 'utf8'),
  ]),
);

function sourceColorExpression(value) {
  const token = value.match(/^colorVars\['([^']+)'\]$/)?.[1];
  if (token) return `var(${token})`;
  const literal = value.match(/^'([^']+)'$/)?.[1];
  if (literal) return literal;
  throw new Error(`Unsupported Button color expression: ${value}`);
}

function readButtonDefaults() {
  const variantsBlock = pressableControlsSource.Button.match(
    /const variants = stylex\.create\(\{([\s\S]*?)\n\}\);/,
  )?.[1];
  if (variantsBlock == null) throw new Error('Button variants were not found');
  return Object.fromEntries(
    BUTTON_VARIANTS.map(variant => {
      const block = variantsBlock.match(
        new RegExp(`\\n  ${variant}: \\{([\\s\\S]*?)\\n  \\},`),
      )?.[1];
      if (block == null) {
        throw new Error(`Could not read Button variant ${variant}`);
      }
      const background = block.match(/backgroundColor:\s*([^,\n]+)/)?.[1];
      const foreground = block.match(/\n\s+color:\s*([^,\n]+)/)?.[1];
      if (background == null || foreground == null) {
        throw new Error(`Button variant ${variant} is missing color styles`);
      }
      return [
        variant,
        {
          backgroundColor: sourceColorExpression(background.trim()),
          color: sourceColorExpression(foreground.trim()),
        },
      ];
    }),
  );
}

const BUTTON_DEFAULTS = readButtonDefaults();

function sourceToken(source, pattern, label) {
  const token = source.match(pattern)?.[1];
  if (token == null) throw new Error(`Could not read ${label}`);
  return `var(${token})`;
}

const FOCUS_OUTLINE_COLOR = sourceToken(
  pressableControlsSource.Tokens,
  /'--focus-outline-color':\s*'var\((--[^)]+)\)'/,
  'focus outline color',
);
const resolve = createTokenResolver({
  tokens: {
    ...(neutralTheme.tokens ?? {}),
    ...(neutralTheme.localTokens ?? {}),
  },
  defaults: {'--focus-outline-color': FOCUS_OUTLINE_COLOR},
});

const HOVER_OVERLAY = sourceToken(
  pressableControlsSource.InteractionOverlay,
  /const hoverImage = [`']linear-gradient\(\$\{colorVars\['([^']+)'\]\}/,
  'hover overlay token',
);
const POINTER_DOWN_OVERLAY = sourceToken(
  pressableControlsSource.InteractionOverlay,
  /const pressedImage = [`']linear-gradient\(\$\{colorVars\['([^']+)'\]\}/,
  'pointer-down overlay token',
);
const TOGGLE_SELECTED_BACKGROUND = sourceToken(
  pressableControlsSource.ToggleButton,
  /const pressedStyles[\s\S]*?backgroundColor:[\s\S]*?default:\s*colorVars\['([^']+)'\]/,
  'ToggleButton selected background',
);
const SEGMENTED_TRACK_BACKGROUND = sourceToken(
  pressableControlsSource.SegmentedControl,
  /const styles = stylex\.create\([\s\S]*?backgroundColor:\s*colorVars\['([^']+)'\]/,
  'SegmentedControl track background',
);
const SEGMENTED_UNSELECTED_FOREGROUND = sourceToken(
  pressableControlsSource.SegmentedControlItem,
  /const styles = stylex\.create\([\s\S]*?\n\s+color:\s*colorVars\['([^']+)'\]/,
  'SegmentedControl unselected foreground',
);
const SEGMENTED_HOVER_BACKGROUND = sourceToken(
  pressableControlsSource.SegmentedControlItem,
  /hover:[\s\S]*?'@media \(hover: hover\)':\s*colorVars\['([^']+)'\]/,
  'SegmentedControl hover background',
);
const SEGMENTED_SELECTED_FOREGROUND = sourceToken(
  pressableControlsSource.SegmentedControlItem,
  /selected:[\s\S]*?\n\s+color:[\s\S]*?default:\s*colorVars\['([^']+)'\]/,
  'SegmentedControl selected foreground',
);
const SEGMENTED_SELECTED_BACKGROUND = sourceToken(
  pressableControlsSource.SegmentedControlItem,
  /selected:[\s\S]*?backgroundColor:[\s\S]*?default:\s*colorVars\['([^']+)'\]/,
  'SegmentedControl selected background',
);

const spinnerTrackIntent =
  'Spinner track — Decorative. The moving arc must meet 3:1.';

function buttonMeasurements(textMinimum, includeBadges) {
  return [
    {label: 'Rest', source: 'rest', minimum: textMinimum},
    {label: 'Hover', source: 'hover', minimum: textMinimum},
    {label: 'Pointer down', source: 'active', minimum: textMinimum},
    {label: 'Spinner arc', source: 'spinner', minimum: AA_NON_TEXT},
    ...(includeBadges ? [{label: 'Badges', source: 'badges'}] : []),
    {label: 'Focus', source: 'focus', minimum: AA_NON_TEXT},
  ];
}

export const pressableControlsAuditProfiles = {
  Button: {
    kind: 'button',
    measurements: buttonMeasurements(AA_TEXT, true),
    theme: {name: 'Neutral', notMeasured: [spinnerTrackIntent]},
  },
  IconButton: {
    kind: 'button',
    measurements: buttonMeasurements(AA_NON_TEXT, false),
    theme: {name: 'Neutral', notMeasured: [spinnerTrackIntent]},
  },
  ToggleButton: {
    kind: 'toggle',
    rows: [
      {name: 'Unselected', selected: false},
      {name: 'Selected', selected: true},
    ],
    measurements: buttonMeasurements(AA_TEXT, false),
    theme: {
      name: 'Neutral',
      notMeasured: [
        spinnerTrackIntent,
        'Selected background — Supplemental because label weight and optional icon changes also show selection.',
      ],
    },
  },
  ButtonGroup: {
    kind: 'button',
    measurements: buttonMeasurements(AA_TEXT, false),
    theme: {
      name: 'Neutral',
      notMeasured: ['Divider — Decorative in Neutral.', spinnerTrackIntent],
    },
  },
  SegmentedControl: {
    kind: 'segmented',
    rows: [
      {
        name: 'Unselected',
        measurements: [
          {label: 'Rest', source: 'unselectedRest', minimum: AA_TEXT},
          {label: 'Hover', source: 'unselectedHover', minimum: AA_TEXT},
          {label: 'Icon', source: 'unselectedIcon', minimum: AA_NON_TEXT},
          {label: 'Focus', source: 'focus', minimum: AA_NON_TEXT},
        ],
      },
      {
        name: 'Selected',
        measurements: [
          {label: 'Rest', source: 'selectedRest', minimum: AA_TEXT},
          {label: 'Icon', source: 'selectedRest', minimum: AA_NON_TEXT},
          {label: 'Focus', source: 'focus', minimum: AA_NON_TEXT},
        ],
      },
    ],
    theme: {
      name: 'Neutral',
      notMeasured: [
        'Selected background — Supplemental because label color and weight also show selection.',
      ],
    },
  },
};

function modeParents(modeIndex) {
  return PARENT_PROFILES.map(parent => ({
    name: parent.name,
    color: resolve(parent.token, modeIndex),
  }));
}

function buttonVariants(modeIndex) {
  const baseOverride = neutralTheme.components.button?.base ?? {};
  return BUTTON_VARIANTS.map(key => {
    const defaults = BUTTON_DEFAULTS[key];
    const variantOverride =
      neutralTheme.components.button?.[`variant:${key}`] ?? {};
    const override = {...baseOverride, ...variantOverride};
    return {
      key,
      name: displayName(key),
      override,
      foregroundValue: override.color ?? defaults.color,
      backgroundValue: override.backgroundColor ?? defaults.backgroundColor,
      focusValue:
        key === 'destructive'
          ? 'var(--color-error)'
          : 'var(--focus-outline-color)',
    };
  });
}

function buttonStateBackgrounds(variant, modeIndex, parents) {
  const states = {
    Rest: {selector: null, overlay: null},
    Hover: {selector: ':hover', overlay: HOVER_OVERLAY},
    active: {selector: ':active', overlay: POINTER_DOWN_OVERLAY},
  };
  return Object.fromEntries(
    Object.entries(states).map(([state, stateProfile]) => {
      const stateOverride = stateProfile.selector
        ? (variant.override[stateProfile.selector] ?? {})
        : {};
      const local = localVariables(variant.override, stateOverride);
      const foreground = resolve(
        stateOverride.color ?? variant.foregroundValue,
        modeIndex,
        local,
      );
      const backgroundValue =
        stateOverride.backgroundColor ?? variant.backgroundValue;
      const overlay = resolveSolidOverlay({
        backgroundImage:
          stateOverride.backgroundImage ?? variant.override.backgroundImage,
        fallback: stateProfile.overlay,
        local,
        modeIndex,
        resolve,
      });
      return [
        state,
        parents.map(parent => {
          const base = renderBackground({
            value: backgroundValue,
            parent: parent.color,
            modeIndex,
            local,
            resolve,
          });
          return {
            parent: parent.name,
            parentColor: parent.color,
            foreground,
            color: overlay == null ? base : compositeColor(overlay, base),
            local,
          };
        }),
      ];
    }),
  );
}

function stateMeasurement(backgrounds) {
  return lowest(
    backgrounds.map(background =>
      measureContrast(
        background.foreground,
        background.color,
        background.parent,
      ),
    ),
  );
}

function spinnerMeasurement(stateBackgrounds) {
  const opacity = loadingOpacity();
  return lowest(
    stateBackgrounds.Rest.map(background => {
      const foreground = compositeColor(
        background.foreground,
        background.parentColor,
        opacity,
      );
      const renderedBackground = compositeColor(
        background.color,
        background.parentColor,
        opacity,
      );
      return measureContrast(foreground, renderedBackground, background.parent);
    }),
  );
}

function loadingOpacity() {
  if (
    pressableControlsSource.Button.includes(
      'visuallyDisabled && styles.disabled',
    )
  ) {
    return 1;
  }
  if (
    pressableControlsSource.Button.includes('buttonDisabled && styles.disabled')
  ) {
    return 0.5;
  }
  throw new Error('Could not determine the Button loading opacity behavior');
}

function focusMeasurement(variant, modeIndex, parents) {
  const focusOverride = variant.override[':focus-visible'] ?? {};
  const local = localVariables(variant.override, focusOverride);
  const foreground = resolve(
    focusOverride.outlineColor ??
      variant.override.outlineColor ??
      variant.focusValue,
    modeIndex,
    local,
  );
  return lowest(
    parents.map(parent =>
      measureContrast(foreground, parent.color, parent.name),
    ),
  );
}

function readableBadgeContext(state, parent) {
  const stateLabel = state === 'active' ? 'Pointer down' : displayName(state);
  const parentLabel = parent === 'body' ? 'Page' : displayName(parent);
  return `${stateLabel} state · ${parentLabel} background`;
}

function badgeMeasurement(stateBackgrounds, modeIndex) {
  const badgeResults = BADGE_VARIANTS.map(badgeVariant => {
    const badge = neutralTheme.components.badge[`variant:${badgeVariant}`];
    const combinations = Object.entries(stateBackgrounds).flatMap(
      ([state, backgrounds]) =>
        backgrounds.map(background => {
          const local = localVariables(background.local, badge);
          const foregroundValue = resolve(badge.color, modeIndex, local);
          const badgeBase = renderBackground({
            value: badge.backgroundColor,
            parent: background.color,
            modeIndex,
            local,
            resolve,
          });
          const badgeOverlay = resolveSolidOverlay({
            backgroundImage: badge.backgroundImage,
            fallback: null,
            local,
            modeIndex,
            resolve,
          });
          const renderedBackground =
            badgeOverlay == null
              ? badgeBase
              : compositeColor(badgeOverlay, badgeBase);
          const renderedForeground = compositeColor(
            foregroundValue,
            renderedBackground,
          );
          return {
            ...measureContrast(
              renderedForeground,
              renderedBackground,
              background.parent,
            ),
            state,
            parent: background.parent,
          };
        }),
    );
    return {badgeVariant, combinations};
  });
  const passing = badgeResults.filter(result =>
    result.combinations.every(item => item.ratio >= AA_TEXT),
  ).length;
  return {
    label: 'Badges',
    value: `${passing} of ${BADGE_VARIANTS.length} badge colors pass`,
    breakdown: badgeResults.map(result => {
      const worst = lowest(result.combinations);
      return {
        label: displayName(result.badgeVariant),
        value: formatRatio(worst.ratio),
        detail: readableBadgeContext(worst.state, worst.parent),
        colorPair: {
          foreground: worst.foreground,
          background: worst.background,
        },
        ...(worst.ratio < AA_TEXT && {status: 'Fail'}),
      };
    }),
    ...(passing < BADGE_VARIANTS.length && {status: 'Fail'}),
  };
}

function buttonMode(mode, profile) {
  const parents = modeParents(mode.index);
  return {
    mode: mode.name,
    results: buttonVariants(mode.index).map(variant => {
      const states = buttonStateBackgrounds(variant, mode.index, parents);
      const sources = {
        rest: stateMeasurement(states.Rest),
        hover: stateMeasurement(states.Hover),
        active: stateMeasurement(states.active),
        spinner: spinnerMeasurement(states),
        badges: () => badgeMeasurement(states, mode.index),
        focus: focusMeasurement(variant, mode.index, parents),
      };
      const measurements = profile.measurements.map(measurement =>
        measurement.source === 'badges'
          ? {
              ...sources.badges(),
              ...(measurement.applicability
                ? {applicability: measurement.applicability}
                : {}),
            }
          : documentedMeasurement(
              measurement.label,
              sources[measurement.source],
              measurement.minimum,
              {applicability: measurement.applicability},
            ),
      );
      return {
        name: variant.name,
        measurements,
        status: resultStatus(measurements),
      };
    }),
  };
}

function toggleMode(mode, profile) {
  const parents = modeParents(mode.index);
  const buttonVariant = buttonVariants(mode.index).find(
    variant => variant.key === 'ghost',
  );
  const target = neutralTheme.components?.['toggle-button'] ?? {};
  const baseOverride = target.base ?? {};
  const selectedOverride = target.isPressed ?? {};
  const foregroundValue = baseOverride.color ?? buttonVariant.foregroundValue;
  const interactionStates = {
    rest: {selector: null, overlay: null},
    hover: {selector: ':hover', overlay: HOVER_OVERLAY},
    active: {selector: ':active', overlay: POINTER_DOWN_OVERLAY},
  };

  const renderSelection = (selected, parent) => {
    const selectionOverride = selected ? selectedOverride : {};
    const local = localVariables(
      buttonVariant.override,
      baseOverride,
      selectionOverride,
    );
    const foreground = resolve(
      selectionOverride.color ?? foregroundValue,
      mode.index,
      local,
    );
    const backgroundValue = selected
      ? (selectionOverride.backgroundColor ?? TOGGLE_SELECTED_BACKGROUND)
      : (baseOverride.backgroundColor ?? buttonVariant.backgroundValue);
    return Object.fromEntries(
      Object.entries(interactionStates).map(([state, stateProfile]) => {
        const stateOverride = stateProfile.selector
          ? (selectionOverride[stateProfile.selector] ??
            baseOverride[stateProfile.selector] ??
            {})
          : {};
        const stateLocal = localVariables(local, stateOverride);
        const stateForeground = resolve(
          stateOverride.color ?? foreground,
          mode.index,
          stateLocal,
        );
        const base = renderBackground({
          value: stateOverride.backgroundColor ?? backgroundValue,
          parent: parent.color,
          modeIndex: mode.index,
          local: stateLocal,
          resolve,
        });
        const overlay = resolveSolidOverlay({
          backgroundImage:
            stateOverride.backgroundImage ??
            selectionOverride.backgroundImage ??
            baseOverride.backgroundImage ??
            buttonVariant.override.backgroundImage,
          fallback: stateProfile.overlay,
          local: stateLocal,
          modeIndex: mode.index,
          resolve,
        });
        return [
          state,
          {
            parent: parent.name,
            parentColor: parent.color,
            foreground: stateForeground,
            color: overlay == null ? base : compositeColor(overlay, base),
          },
        ];
      }),
    );
  };
  const statesFor = selected =>
    parents.map(parent => renderSelection(selected, parent));
  const measureState = (states, state) =>
    lowest(
      states.map(item =>
        measureContrast(
          item[state].foreground,
          item[state].color,
          item[state].parent,
        ),
      ),
    );
  const spinnerFor = states =>
    lowest(
      states.map(item => {
        const rest = item.rest;
        const opacity = loadingOpacity();
        return measureContrast(
          compositeColor(rest.foreground, rest.parentColor, opacity),
          compositeColor(rest.color, rest.parentColor, opacity),
          rest.parent,
        );
      }),
    );
  const makeResult = row => {
    const {name, selected} = row;
    const states = statesFor(selected);
    const focusVariant = {
      ...buttonVariant,
      override: {
        ...buttonVariant.override,
        ...baseOverride,
        ...(selected ? selectedOverride : {}),
      },
    };
    const sources = {
      rest: measureState(states, 'rest'),
      hover: measureState(states, 'hover'),
      active: measureState(states, 'active'),
      spinner: spinnerFor(states),
      focus: focusMeasurement(focusVariant, mode.index, parents),
    };
    const measurements = profile.measurements.map(measurement =>
      documentedMeasurement(
        measurement.label,
        sources[measurement.source],
        measurement.minimum,
        {applicability: measurement.applicability},
      ),
    );
    return {name, measurements, status: resultStatus(measurements)};
  };
  return {
    mode: mode.name,
    results: profile.rows.map(makeResult),
  };
}

function segmentedMode(mode, profile) {
  const parents = modeParents(mode.index);
  const container = neutralTheme.components?.['segmented-control']?.base ?? {};
  const target = neutralTheme.components?.['segmented-control-item'] ?? {};
  const base = target.base ?? {};
  const selected = target.selected ?? {};
  const local = localVariables(container, base, selected);
  const trackValue = container.backgroundColor ?? SEGMENTED_TRACK_BACKGROUND;
  const hoverValue =
    base[':hover']?.backgroundColor ?? SEGMENTED_HOVER_BACKGROUND;
  const selectedBackgroundValue =
    selected.backgroundColor ?? SEGMENTED_SELECTED_BACKGROUND;
  const unselectedForeground = resolve(
    base.color ?? SEGMENTED_UNSELECTED_FOREGROUND,
    mode.index,
    local,
  );
  const selectedForeground = resolve(
    selected.color ?? SEGMENTED_SELECTED_FOREGROUND,
    mode.index,
    local,
  );
  const pairs = parents.map(parent => {
    const track = renderBackground({
      value: trackValue,
      parent: parent.color,
      modeIndex: mode.index,
      local,
      resolve,
    });
    return {
      parent: parent.name,
      track,
      hover: renderBackground({
        value: hoverValue,
        parent: track,
        modeIndex: mode.index,
        local,
        resolve,
      }),
      selectedBackground: renderBackground({
        value: selectedBackgroundValue,
        parent: track,
        modeIndex: mode.index,
        local,
        resolve,
      }),
    };
  });
  const measure = (foreground, backgroundKey) =>
    lowest(
      pairs.map(pair =>
        measureContrast(foreground, pair[backgroundKey], pair.parent),
      ),
    );
  const rest = measure(unselectedForeground, 'track');
  const hover = measure(unselectedForeground, 'hover');
  const selectedRest = measure(selectedForeground, 'selectedBackground');
  const focusColor = resolve(
    selected.outlineColor ?? base.outlineColor ?? 'var(--focus-outline-color)',
    mode.index,
    local,
  );
  const focus = lowest(
    pairs.map(pair => measureContrast(focusColor, pair.track, pair.parent)),
  );
  const sources = {
    unselectedRest: rest,
    unselectedHover: hover,
    unselectedIcon: lowest([rest, hover]),
    selectedRest,
    focus,
  };
  return {
    mode: mode.name,
    results: profile.rows.map(row => {
      const measurements = row.measurements.map(measurement =>
        documentedMeasurement(
          measurement.label,
          sources[measurement.source],
          measurement.minimum,
          {applicability: measurement.applicability},
        ),
      );
      return {name: row.name, measurements, status: resultStatus(measurements)};
    }),
  };
}

export function buildPressableControlsAccessibilityThemeCoverage() {
  return Object.fromEntries(
    Object.entries(pressableControlsAuditProfiles).map(
      ([component, profile]) => {
        const modes = MODES.map(mode => {
          if (profile.kind === 'button') return buttonMode(mode, profile);
          if (profile.kind === 'toggle') return toggleMode(mode, profile);
          if (profile.kind === 'segmented') return segmentedMode(mode, profile);
          throw new Error(`Unsupported audit profile kind: ${profile.kind}`);
        });
        return [
          component,
          [
            {
              theme: profile.theme.name,
              tables: [{modes}],
              notMeasured: profile.theme.notMeasured,
            },
          ],
        ];
      },
    ),
  );
}

export function getPressableControlsAuditContract() {
  const buttonVariantMap = pressableControlsSource.ButtonIndex.match(
    /export interface ButtonVariantMap \{([\s\S]*?)\n\}/,
  );
  const badgeVariantMap = pressableControlsSource.BadgeIndex.match(
    /export interface BadgeVariantMap \{([\s\S]*?)\n\}/,
  );
  return {
    buttonVariants: [
      ...(buttonVariantMap?.[1].matchAll(/^\s+([a-z]+): true;/gm) ?? []),
    ].map(match => match[1]),
    badgeVariants: [
      ...(badgeVariantMap?.[1].matchAll(/^\s+([a-z]+): true;/gm) ?? []),
    ].map(match => match[1]),
    expectedButtonVariants: BUTTON_VARIANTS,
    expectedBadgeVariants: BADGE_VARIANTS,
    badgeCombinationCount:
      BADGE_VARIANTS.length *
      BUTTON_VARIANTS.length *
      3 *
      PARENT_PROFILES.length,
  };
}

export const pressableControlsAuditModule = {
  id: 'pressable-controls',
  components: [
    {
      name: 'Button',
      exportName: 'buttonAccessibilityThemeCoverage',
      docsUrl: new URL(
        '../../packages/core/src/Button/Button.doc.mjs',
        import.meta.url,
      ),
    },
    {
      name: 'IconButton',
      exportName: 'iconButtonAccessibilityThemeCoverage',
      docsUrl: new URL(
        '../../packages/core/src/IconButton/IconButton.doc.mjs',
        import.meta.url,
      ),
    },
    {
      name: 'ToggleButton',
      exportName: 'toggleButtonAccessibilityThemeCoverage',
      docsUrl: new URL(
        '../../packages/core/src/ToggleButton/ToggleButton.doc.mjs',
        import.meta.url,
      ),
    },
    {
      name: 'ButtonGroup',
      exportName: 'buttonGroupAccessibilityThemeCoverage',
      docsUrl: new URL(
        '../../packages/core/src/ButtonGroup/ButtonGroup.doc.mjs',
        import.meta.url,
      ),
    },
    {
      name: 'SegmentedControl',
      exportName: 'segmentedControlAccessibilityThemeCoverage',
      docsUrl: new URL(
        '../../packages/core/src/SegmentedControl/SegmentedControl.doc.mjs',
        import.meta.url,
      ),
    },
  ],
  buildCoverage: buildPressableControlsAccessibilityThemeCoverage,
};
