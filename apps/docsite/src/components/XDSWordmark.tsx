// Copyright (c) Meta Platforms, Inc. and affiliates.

// Brand mark used in shell chrome (top nav). Renders the icon-only logo
// from /public/brand-icon.svg so the wordmark is replaced by the icon.
export const XDS_BRAND_ICON = (
  <img
    src="/brand-icon.svg"
    alt="XDS"
    width={24}
    height={24}
    style={{display: 'block'}}
  />
);
