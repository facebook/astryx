// Copyright (c) Meta Platforms, Inc. and affiliates.

// Brand mark used in shell chrome (top nav). Renders the icon-only logo
// from /public/brand-icon.svg so the wordmark is replaced by the icon.
export const XDS_BRAND_ICON = (
  <img
    src="/brand-icon.svg"
    alt="XDS"
    width={28}
    height={28}
    style={{display: 'block'}}
  />
);
