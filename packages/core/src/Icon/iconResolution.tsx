// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconResolution.tsx
 * @input Independent Icon intent, private owner slot/state/default size, local contracts and active theme policy
 * @output Supplied artwork, physical box selection and private fallback diagnostics
 * @position Private server-safe resolver; not part of the public Icon barrel
 */
/* eslint-disable @astryx/no-hardcoded-i18n-string -- Private synchronous developer diagnostics, not rendered UI. */
import type {ReactNode} from 'react';
import type {IconType} from './Icon';
import {getComponentIconRole} from './componentIconRoles';
import {getRegisteredTheme} from '../theme/themeRegistry';
import {warnOnce} from '../utils/devWarning';
import {
  getIconSourceEntry,
  type ExtendedIconName,
  type IconRegistrySource,
} from './globalIconRegistry';
import {
  admitsIconWeight,
  builtInIconDimensions,
  getApplicationIconCapabilities,
  getIconThemeContracts,
  getOwnIconData,
  readIconThemeCapabilities,
  readIconThemeContractList,
  type ApplicationIconCapabilities,
  type BuiltInIconSize,
  type IconCapabilities,
  type IconRequest,
  type IconThemeCapabilities,
} from './iconCapabilities';
import {
  getIconEntryContract,
  isAdaptiveIconEntry,
  isAdaptiveIconTree,
  selectAdaptiveIcon,
  type IconEntry,
} from './adaptiveIcons';

type AxisOrigin =
  | 'explicit'
  | 'theme-size'
  | 'theme-role'
  | 'theme-state'
  | 'theme-default'
  | 'component'
  | 'standalone'
  | 'source-default';
export interface IconAxisInspection {
  requested?: unknown;
  admitted: boolean;
  supported: boolean;
  selected?: string | number;
  omitted?: unknown;
  fallback: boolean;
  provenance: AxisOrigin;
}
export interface IconDiagnostic {
  code: 'unadmitted' | 'unsupported' | 'malformed-entry' | 'malformed-policy';
  axis?: 'size' | 'appearance' | 'weight';
  value?: unknown;
  provenance?: AxisOrigin;
  message: string;
}
export interface IconInspection {
  source: {
    kind: 'fixed' | 'adaptive' | 'ordinary-direct' | 'missing';
    provenance: string;
    name?: string;
    themeName?: string;
  };
  size: IconAxisInspection;
  appearance: IconAxisInspection;
  weight: IconAxisInspection;
  dimension: string;
  customDimension: boolean;
  capabilities: ApplicationIconCapabilities;
  entry?: IconEntry;
  diagnostics: IconDiagnostic[];
}
export interface IconResolution {
  node: ReactNode;
  component?: IconType;
  inspection: IconInspection;
}
const diagnosticObjects = new WeakMap<object, number>();
let nextIdentity = 1;
function valueKey(value: unknown): string {
  if (
    (typeof value === 'object' && value !== null) ||
    typeof value === 'function'
  ) {
    let identity = diagnosticObjects.get(value);
    if (identity === undefined) {
      identity = nextIdentity++;
      diagnosticObjects.set(value, identity);
    }
    return `object:${identity}`;
  }
  if (typeof value === 'symbol') {
    return 'symbol';
  }
  return `${typeof value}:${String(value)}`;
}
function report(diagnostic: IconDiagnostic, identity: string): void {
  if (
    process.env.NODE_ENV === 'production' ||
    ((diagnostic.code === 'unsupported' || diagnostic.code === 'unadmitted') &&
      diagnostic.provenance !== 'explicit')
  ) {
    return;
  }
  warnOnce(
    `icon-capability:${identity}:${diagnostic.provenance ?? ''}:${diagnostic.code}:${diagnostic.axis ?? ''}:${valueKey(diagnostic.value)}`,
    'Icon',
    diagnostic.message,
  );
}
/** @internal Explicit size is kept distinct from an implicit released sizing context. */
export function resolveIconWithContext(
  icon: ExtendedIconName | IconType,
  request: IconRequest = {},
  source?: IconRegistrySource,
  context: {
    legacyContextSize?: unknown;
    slot?: string;
    state?: unknown;
    defaultSize?: unknown;
    renderNode?: boolean;
  } = {},
): IconResolution {
  const theme =
    typeof source === 'string' ? getRegisteredTheme(source) : source;
  const diagnostics: IconDiagnostic[] = [];
  const malformedPolicy = () => {
    if (!diagnostics.some(item => item.code === 'malformed-policy')) {
      diagnostics.push({
        code: 'malformed-policy',
        message: 'Malformed runtime icon policy fields were ignored.',
      });
    }
  };
  let themeName: string | undefined;
  try {
    const name = getOwnIconData(theme, 'name');
    if (typeof name === 'string') {
      themeName = name;
    }
  } catch {
    malformedPolicy();
  }
  let entry: IconEntry | undefined;
  let provenance = 'direct';
  if (typeof icon === 'string') {
    const selected = getIconSourceEntry(icon, source);
    entry = selected.entry;
    provenance = selected.provenance;
    diagnostics.push(...selected.diagnostics);
  }
  const sourceContract = getIconEntryContract(entry);
  const sourceContracts = sourceContract ? [sourceContract] : [];
  let themeContracts: ReadonlyArray<IconCapabilities> = [];
  let policy: IconThemeCapabilities | undefined;
  try {
    themeContracts = readIconThemeContractList(
      getOwnIconData(theme, '__iconContracts'),
      malformedPolicy,
    );
  } catch {
    malformedPolicy();
  }
  try {
    policy = readIconThemeCapabilities(
      getOwnIconData(theme, 'iconCapabilities'),
      [...sourceContracts, ...themeContracts],
      malformedPolicy,
    );
  } catch {
    malformedPolicy();
  }
  let app: ApplicationIconCapabilities;
  try {
    app = getApplicationIconCapabilities(
      ...sourceContracts,
      ...themeContracts,
      ...getIconThemeContracts(policy),
    );
  } catch {
    policy = undefined;
    app = getApplicationIconCapabilities(...sourceContracts);
    malformedPolicy();
  }
  // eslint-disable-next-line @typescript-eslint/promise-function-async -- Caller metadata is opaque synchronous data; never await it or wrap supplied React promises.
  const field = (axis: 'size' | 'appearance' | 'weight') => {
    try {
      return getOwnIconData(request, axis);
    } catch {
      diagnostics.push({
        code: 'unadmitted',
        axis,
        provenance: 'explicit',
        message: `Invalid ${axis} request was omitted; using the safe default.`,
      });
      return undefined;
    }
  };
  const raw = {
    size: field('size'),
    appearance: field('appearance'),
    weight: field('weight'),
  };
  function axis(
    name: 'size' | 'appearance' | 'weight',
    value: unknown,
    origin: AxisOrigin,
    admitted: boolean,
  ): IconAxisInspection {
    if (value !== undefined && !admitted) {
      diagnostics.push({
        code: 'unadmitted',
        axis: name,
        value,
        provenance: origin,
        message: `Unadmitted ${name} request was omitted; using the safe default.`,
      });
    }
    return {
      requested: value,
      admitted,
      supported: false,
      fallback: value !== undefined && !admitted,
      provenance: origin,
      ...(value !== undefined && !admitted ? {omitted: value} : {}),
    };
  }
  const explicitSizeAdmitted =
    typeof raw.size === 'string' && Object.hasOwn(app.sizes, raw.size);
  const role =
    context.slot === undefined ? undefined : getComponentIconRole(context.slot);
  const state =
    role &&
    typeof context.state === 'string' &&
    role.states.includes(context.state)
      ? context.state
      : undefined;
  const roleSize = role ? policy?.roleSizeOverrides?.[role.slot] : undefined;
  const roleSizeAdmitted =
    typeof roleSize === 'string' && Object.hasOwn(app.sizes, roleSize);
  // An owner may refine its declared default per render (for example from its
  // control size); only an admitted name replaces the role metadata default.
  const ownerDefaultSize =
    role &&
    typeof context.defaultSize === 'string' &&
    Object.hasOwn(app.sizes, context.defaultSize)
      ? context.defaultSize
      : role?.defaultSize;
  const implicitSize = role
    ? roleSizeAdmitted
      ? roleSize
      : ownerDefaultSize !== undefined &&
          Object.hasOwn(app.sizes, ownerDefaultSize)
        ? ownerDefaultSize
        : 'md'
    : typeof context.legacyContextSize === 'string' &&
        Object.hasOwn(app.sizes, context.legacyContextSize)
      ? context.legacyContextSize
      : 'md';
  const finalSize = explicitSizeAdmitted ? (raw.size as string) : implicitSize;
  const size = axis(
    'size',
    raw.size ?? implicitSize,
    raw.size !== undefined
      ? 'explicit'
      : roleSizeAdmitted
        ? 'theme-role'
        : role ||
            (context.legacyContextSize !== undefined &&
              context.legacyContextSize !== null)
          ? 'component'
          : 'standalone',
    raw.size === undefined || explicitSizeAdmitted,
  );
  size.selected = finalSize;
  const bySize = policy?.presentation?.bySize?.[finalSize];
  const byState =
    state === undefined ? undefined : policy?.presentation?.byState?.[state];
  const baseline = policy?.presentation?.default;
  const appearanceValue =
    raw.appearance !== undefined
      ? raw.appearance
      : (byState?.appearance ?? bySize?.appearance ?? baseline?.appearance);
  const weightValue =
    raw.weight !== undefined
      ? raw.weight
      : (bySize?.weight ?? baseline?.weight);
  const appearance = axis(
    'appearance',
    appearanceValue,
    raw.appearance !== undefined
      ? 'explicit'
      : byState?.appearance !== undefined
        ? 'theme-state'
        : bySize?.appearance !== undefined
          ? 'theme-size'
          : baseline?.appearance !== undefined
            ? 'theme-default'
            : 'source-default',
    appearanceValue === undefined ||
      (typeof appearanceValue === 'string' &&
        app.appearances.includes(appearanceValue)),
  );
  const weight = axis(
    'weight',
    weightValue,
    raw.weight !== undefined
      ? 'explicit'
      : bySize?.weight !== undefined
        ? 'theme-size'
        : baseline?.weight !== undefined
          ? 'theme-default'
          : 'source-default',
    weightValue === undefined || admitsIconWeight(app, weightValue),
  );
  const adaptive = isAdaptiveIconEntry(entry) || isAdaptiveIconTree(entry);
  let node: ReactNode = entry as ReactNode;
  if (adaptive) {
    const selection = selectAdaptiveIcon(
      entry,
      {
        size: finalSize,
        appearance: appearance.admitted
          ? (appearanceValue as string | undefined)
          : undefined,
        weight:
          weight.admitted &&
          sourceContract &&
          admitsIconWeight(sourceContract, weightValue)
            ? weightValue
            : undefined,
      },
      context.renderNode !== false,
    );
    node = selection.node;
    for (const [name, inspection] of [
      ['size', size],
      ['appearance', appearance],
      ['weight', weight],
    ] as const) {
      const selected = selection[name];
      inspection.supported = selected.supported;
      if (selected.selected !== undefined) {
        inspection.selected = selected.selected;
      }
      inspection.fallback ||= selected.fallback;
    }
  }
  // Fixed artwork supports box sizing. Adaptive artwork reports a missing
  // supplied size branch independently, without warning about normal fallback.
  size.supported = adaptive ? size.supported : true;
  if (adaptive) {
    size.fallback ||= !size.supported;
  }
  for (const [name, inspection] of [
    ['appearance', appearance],
    ['weight', weight],
  ] as const) {
    if (
      inspection.requested !== undefined &&
      inspection.admitted &&
      !inspection.supported
    ) {
      inspection.fallback = true;
      inspection.omitted = inspection.requested;
      diagnostics.push({
        code: 'unsupported',
        axis: name,
        value: inspection.requested,
        provenance: inspection.provenance,
        message: `Supplied artwork does not support ${name}; using its safe default.`,
      });
    }
  }
  const builtIn = builtInIconDimensions[finalSize as BuiltInIconSize];
  const legacyDimension =
    !role &&
    !explicitSizeAdmitted &&
    typeof context.legacyContextSize === 'string' &&
    Object.hasOwn(builtInIconDimensions, context.legacyContextSize) &&
    builtIn !== undefined;
  const override = policy?.sizeOverrides?.[finalSize];
  const hasOverride = typeof override === 'string';
  const dimension = legacyDimension
    ? builtIn
    : hasOverride
      ? override
      : (app.sizes[finalSize]?.default ?? builtInIconDimensions.md);
  const customDimension =
    !legacyDimension && (builtIn === undefined || hasOverride);
  const sourceInfo: IconInspection['source'] = {
    kind:
      typeof icon !== 'string'
        ? 'ordinary-direct'
        : entry === undefined
          ? 'missing'
          : adaptive
            ? 'adaptive'
            : 'fixed',
    provenance,
    ...(typeof icon === 'string' ? {name: icon} : {}),
    ...(themeName ? {themeName} : {}),
  };
  const identity =
    typeof icon === 'string'
      ? `${themeName ?? ''}:${icon}`
      : `direct:${valueKey(icon)}`;
  for (const diagnostic of diagnostics) {
    report(diagnostic, identity);
  }
  return {
    node,
    ...(typeof icon !== 'string' ? {component: icon} : {}),
    inspection: {
      source: sourceInfo,
      size,
      appearance,
      weight,
      dimension,
      customDimension,
      capabilities: app,
      entry,
      diagnostics,
    },
  };
}
