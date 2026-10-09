// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-theme-local.fixture.tsx
 * @input Explicit local contracts, fixed artwork, and bound adaptive sources
 * @output Closed authoring axes, immutable source metadata, and ReactNode read values
 * @position External-consumer program without application augmentation
 */
import type {ReactNode} from 'react';
import {
  defineAdaptiveIcon,
  defineIconCapabilities,
  getApplicationIconCapabilities,
  getIcon,
  registerIcons,
  type AdaptiveIconEntry,
  type AdaptiveIconTree,
  type IconCapabilities,
  type IconEntry,
  type IconPresentationPolicy,
  type IconThemeCapabilitiesInput,
} from '@astryxdesign/core/Icon';
import {
  defineTheme,
  type DefineThemeInput,
  type DefinedTheme,
  type ThemeIconOverrides,
} from '@astryxdesign/core/theme';

export const contract = defineIconCapabilities({
  sizes: {compact: {default: '14px'}},
  appearances: ['outline', 'filled'],
  weights: {values: [400, 600]},
});
export const policy: IconPresentationPolicy<typeof contract> = {
  default: {appearance: 'outline', weight: 400},
  bySize: {compact: {appearance: 'filled', weight: 600}},
};
export const capabilities: IconThemeCapabilitiesInput<typeof contract> = {
  contract,
  sizeOverrides: {compact: '15px', sm: null},
  presentation: policy,
};
export const tree: AdaptiveIconTree<typeof contract> = {
  default: {default: <svg />, byWeight: {600: <svg />}},
  byAppearance: {filled: {default: <svg />, byWeight: {400: <svg />}}},
  bySize: {compact: {default: <svg />, byAppearance: {outline: <svg />}}},
};
export const source: AdaptiveIconEntry<typeof contract> = defineAdaptiveIcon(
  contract,
  tree,
);
export const entry: IconEntry<typeof contract> = source;
export const overrides: ThemeIconOverrides<typeof contract> = {
  search: tree,
  'consumer:mark': source,
};
export const input: DefineThemeInput<typeof contract> = {
  name: 'consumer-local-typed',
  iconCapabilities: capabilities,
  icons: overrides,
};
export const typedTheme: DefinedTheme = defineTheme(input);
export const inferredTheme = defineTheme({
  name: 'consumer-local-inferred',
  iconCapabilities: {
    contract,
    sizeOverrides: {compact: '15px'},
    presentation: {
      default: {appearance: 'outline', weight: 400},
      bySize: {compact: {weight: 600}},
    },
  },
  icons: {search: tree, 'consumer:mark': source, close: <svg />},
});
export const read: ReactNode = inferredTheme.icons?.search;
export const legacyRegistry: Partial<Record<string, ReactNode>> | undefined =
  inferredTheme.icons;
registerIcons(inferredTheme.icons ?? {});
getIcon('search', inferredTheme);
export const retainedSource: IconEntry | undefined =
  inferredTheme.__iconSources?.search;
export const retainedContracts: ReadonlyArray<IconCapabilities> | undefined =
  inferredTheme.__iconContracts;
export const application = getApplicationIconCapabilities(
  ...(inferredTheme.__iconContracts ?? []),
);

const otherContract = defineIconCapabilities({
  sizes: {display: {default: '32px'}},
  appearances: ['duotone'],
});
const otherSource = defineAdaptiveIcon(otherContract, {
  default: <svg />,
  bySize: {display: <svg />},
  byAppearance: {duotone: <svg />},
});
// A bound source owns its contract without imposing it on the theme's policy.
export const boundOnly = defineTheme({
  name: 'consumer-bound-only',
  icons: {search: otherSource},
});
export const independentlyBound = defineTheme({
  name: 'consumer-independent-source',
  iconCapabilities: {contract},
  icons: {search: otherSource},
});
export const cleared = defineTheme({
  name: 'consumer-cleared',
  extends: inferredTheme,
  iconCapabilities: {
    contract,
    sizeOverrides: {compact: null},
    presentation: null,
  },
});
export const fixedOnly = defineTheme({
  name: 'consumer-fixed-only',
  icons: {search: <svg />},
});

// @ts-expect-error Source IR is not a React node-valued read.
export const sourceAsNode: ReactNode = source;
// @ts-expect-error A bare adaptive tree is also authoring IR, not ReactNode.
export const treeAsNode: ReactNode = tree;
// @ts-expect-error Bound source IR cannot be passed to legacy node registration.
registerIcons({search: source});
// @ts-expect-error The retained source map cannot masquerade as a read registry.
export const sourceRegistry: Partial<Record<string, ReactNode>> | undefined =
  inferredTheme.__iconSources;
// @ts-expect-error Capability helper results expose immutable literal data.
contract.sizes.compact.default = '16px';
// @ts-expect-error Bound source data is immutable.
source.tree.default = <svg />;
// @ts-expect-error Retained contract references form an immutable snapshot.
inferredTheme.__iconContracts?.push(contract);
// @ts-expect-error Retained source IR is immutable.
if (inferredTheme.__iconSources) inferredTheme.__iconSources.search = source;

export const unadmittedWeight = defineTheme({
  name: 'consumer-invalid-weight',
  iconCapabilities: {
    contract,
    presentation: {
      default: {
        // @ts-expect-error Policy must not widen the inferred exact-weight contract.
        weight: 500,
      },
    },
  },
});
export const unadmittedAppearance = defineTheme({
  name: 'consumer-invalid-appearance',
  iconCapabilities: {
    contract,
    presentation: {
      default: {
        // @ts-expect-error Policy must not widen the inferred appearance contract.
        appearance: 'duotone',
      },
    },
  },
});
export const unadmittedSize = defineTheme({
  name: 'consumer-invalid-size',
  iconCapabilities: {
    contract,
    sizeOverrides: {
      // @ts-expect-error An undeclared size is not admitted by policy inference.
      display: '32px',
    },
  },
});
export const unadmittedPolicyBranch = defineTheme({
  name: 'consumer-invalid-policy-branch',
  iconCapabilities: {
    contract,
    presentation: {
      bySize: {
        // @ts-expect-error Per-size presentation does not invent a size axis.
        display: {weight: 400},
      },
    },
  },
});
export const unadmittedSourceBranch = defineTheme({
  name: 'consumer-invalid-source-branch',
  iconCapabilities: {contract},
  icons: {
    search: {
      default: <svg />,
      byAppearance: {
        // @ts-expect-error A bare source cannot widen its theme-local contract.
        duotone: <svg />,
      },
    },
  },
});
export const unadmittedBoundBranch = defineAdaptiveIcon(contract, {
  default: <svg />,
  bySize: {
    // @ts-expect-error A bound source cannot widen its explicit contract.
    display: <svg />,
  },
});
export const absentAxis = defineAdaptiveIcon(defineIconCapabilities({}), {
  default: <svg />,
  byAppearance: {
    // @ts-expect-error An absent appearance axis admits no branch names.
    outline: <svg />,
  },
});
export const noStatePolicy: IconPresentationPolicy<typeof contract> = {
  // @ts-expect-error Core A presentation supports only default and bySize.
  byState: {selected: {appearance: 'filled'}},
};
export const noRolePolicy: IconThemeCapabilitiesInput<typeof contract> = {
  contract,
  // @ts-expect-error Role sizing is outside the Core A policy.
  roleSizeOverrides: {'consumer-leading': 'compact'},
};
export const noSourceOrder = defineAdaptiveIcon(contract, {
  default: <svg />,
  // @ts-expect-error There is no caller-configurable two-order API.
  order: ['weight', 'appearance'],
});
