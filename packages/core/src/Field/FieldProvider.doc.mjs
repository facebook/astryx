// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */

export const docs = {
  name: 'FieldProvider',
  displayName: 'Field Provider',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['field', 'provider', 'required', 'optional', 'indicator', 'form'],
  usage: {
    description:
      'Wraps your app (or a section of it) to set the default required/optional indicator style for all Astryx fields inside it. Per-field requiredIndicator/optionalIndicator props still win. Example: mark only optional fields by setting requiredIndicator="none".',
  },
  props: [
    {
      name: 'requiredIndicator',
      type: "'text' | 'asterisk' | 'none'",
      description:
        'Default required-indicator style for fields in the subtree.',
      default: "'text'",
    },
    {
      name: 'optionalIndicator',
      type: "'text' | 'none'",
      description:
        'Default optional-indicator style for fields in the subtree.',
      default: "'text'",
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      description: 'Content to render with the field indicator policy applied.',
    },
  ],
};

/** @type {import('@astryxdesign/cli/authoring').ComponentTranslationDoc} */
export const docsDense = {
  description:
    'Sets the default required/optional indicator style for all Astryx fields in the subtree. Per-field props still win.',
  usage: {
    description:
      'Sets the default required/optional indicator style for all Astryx fields in the subtree. Per-field props still win.',
  },
  propDescriptions: {
    requiredIndicator: "default required indicator: 'text' | 'asterisk' | 'none'",
    optionalIndicator: "default optional indicator: 'text' | 'none'",
    children: 'content with the field indicator policy applied',
  },
};
