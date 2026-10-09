// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Supplied visual probes for the role inventory.
 * @input Selected theme plus synthetic fixed/adaptive/direct artwork
 * @output A lossless synthetic role-size/state policy with visibly distinct glyphs
 * @position Storybook-only artwork; not a Button fallback or design approval
 */
import type {SVGProps} from 'react';
import {
  defineIconCapabilities,
  defineAdaptiveIcon,
} from '@astryxdesign/core/Icon';
import {defineTheme} from '@astryxdesign/core/theme';

export function DirectProbe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24">
      <path d="M4 12h16M12 4v16" stroke="currentColor" />
    </svg>
  );
}
const outline = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    data-inventory-artwork="outline">
    <circle
      cx="12"
      cy="12"
      r="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);
const heavyOutline = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    data-inventory-artwork="heavy-outline">
    <circle
      cx="12"
      cy="12"
      r="8"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
    />
  </svg>
);
const filled = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    data-inventory-artwork="filled">
    <circle cx="12" cy="12" r="8" fill="currentColor" />
  </svg>
);
const heavy = (
  <svg
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    data-inventory-artwork="heavy">
    <rect x="3" y="3" width="18" height="18" fill="currentColor" />
  </svg>
);
const capabilities = defineIconCapabilities({
  sizes: {inventoryRoomy: {default: '32px'}},
  appearances: ['outline', 'filled'],
  weights: {values: [400, 600]},
});
export const adaptiveProbe = defineAdaptiveIcon(capabilities, {
  default: {
    default: outline,
    byAppearance: {
      outline: {default: outline, byWeight: {400: outline, 600: heavyOutline}},
      filled: {default: filled, byWeight: {400: filled, 600: heavy}},
    },
  },
  bySize: {
    inventoryRoomy: {
      default: outline,
      byAppearance: {
        outline: {
          default: outline,
          byWeight: {400: outline, 600: heavyOutline},
        },
        filled: {default: filled, byWeight: {400: filled, 600: heavy}},
      },
    },
  },
});
export const syntheticTheme = defineTheme({
  name: 'icon-inventory-synthetic-policy',
  icons: {check: adaptiveProbe},
  iconCapabilities: {
    contract: capabilities,
    sizeOverrides: {inventoryRoomy: '30px'},
    roleSizeOverrides: {'inventory-probe-leading': 'inventoryRoomy'},
    presentation: {
      default: {appearance: 'outline', weight: 400},
      bySize: {inventoryRoomy: {appearance: 'filled', weight: 600}},
      byState: {
        busy: {appearance: 'outline'},
        selected: {appearance: 'filled'},
        invalid: {appearance: 'filled'},
        focused: {appearance: 'outline'},
      },
    },
  },
});
