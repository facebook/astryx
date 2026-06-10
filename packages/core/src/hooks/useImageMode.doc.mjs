// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').HookDoc} */
export const docs = {
  name: 'useImageMode',
  displayName: 'useImageMode',
  keywords: ['image', 'dark', 'light', 'mode', 'luminance', 'color', 'detect', 'theme', 'media', 'apca', 'contrast'],
  params: [
    {
      name: 'src',
      type: 'string | null | undefined',
      description: 'Image source URL to analyze. When null/undefined, returns the fallback value.',
      required: true,
    },
    {
      name: 'options',
      type: 'UseImageModeOptions',
      description: 'Optional configuration for image analysis.',
      required: false,
    },
    {
      name: 'options.region',
      type: 'ImageSampleRegion',
      description: 'Region to sample within the image using normalized 0-1 coordinates ({ x, y, width, height }). Defaults to the full image.',
      required: false,
    },
    {
      name: 'options.threshold',
      type: 'number',
      description: 'Luminance threshold for the dark/light split. Below = dark, above = light.',
      default: '0.5',
      required: false,
    },
    {
      name: 'options.fallback',
      type: "'dark' | 'light' | null",
      description: 'Fallback value while loading or on error.',
      default: 'null',
      required: false,
    },
  ],
  returns: [
    {
      name: 'mode',
      type: "'dark' | 'light' | null",
      description: "Detected luminance mode of the image. Returns null while loading or if src is null/undefined.",
    },
  ],
  usage: {
    description:
      'Detects whether an image is predominantly dark or light by sampling pixels via OffscreenCanvas. Uses APCA perceptual lightness (sRGB linearization + power curve) for accurate detection, especially on saturated colors. Runs entirely off the paint path — no visible canvas, no layout thrash. Supports regional sampling for detecting luminance where text overlays will appear. Returns null while loading and falls back gracefully on CORS or network errors.',
    bestPractices: [
      { guidance: true, description: 'Pair with XDSMediaTheme to automatically adapt text color over dynamic background images.' },
      { guidance: true, description: 'Use the region option to sample only the area where text overlays will appear for more accurate results.' },
      { guidance: false, description: 'Use for images that change rapidly (e.g., video frames) — each src change triggers a new fetch and analysis.' },
    ],
  },
  relatedComponents: ['MediaTheme'],
  relatedHooks: ['useMediaQuery'],
  importPath: '@xds/core/hooks',
  category: 'media',
};

/** @type {import('../docs-types').HookTranslationDoc} */
export const docsDense = {
  description:
    'Detects whether image is predominantly dark / light by sampling pixels via OffscreenCanvas. Uses APCA perceptual lightness (sRGB linearization + power curve) for accurate detection, esp. on saturated colors. Runs entirely off paint path — no visible canvas, no layout thrash. Supports regional sampling for detecting luminance where text overlays will appear. Returns null while loading + falls back gracefully on CORS / network errors.',
  paramDescriptions: {
    src: 'image source URL to analyze. When null/undefined, returns fallback value.',
    options: 'optional config for image analysis.',
    'options.region': 'region to sample within image using normalized 0-1 coordinates ({ x, y, width, height }). Defaults to full image.',
    'options.threshold': 'luminance threshold for dark/light split. Below = dark, above = light.',
    'options.fallback': 'fallback value while loading / on error.',
  },
  returnDescriptions: {
    mode: 'detected luminance mode of image. Returns null while loading / if src null/undefined.',
  },
  usage: {
    description:
      'Detects whether image is predominantly dark / light by sampling pixels via OffscreenCanvas. Uses APCA perceptual lightness (sRGB linearization + power curve) for accurate detection, esp. on saturated colors. Runs entirely off paint path — no visible canvas, no layout thrash. Supports regional sampling for detecting luminance where text overlays will appear. Returns null while loading + falls back gracefully on CORS / network errors.',
    bestPractices: [
      { guidance: true, description: 'Pair w/ XDSMediaTheme to automatically adapt text color over dynamic background images.' },
      { guidance: true, description: 'Use region option to sample only area where text overlays will appear for more accurate results.' },
      { guidance: false, description: 'Use for images that change rapidly (e.g. video frames) — each src change triggers new fetch + analysis.' },
    ],
  },
};
