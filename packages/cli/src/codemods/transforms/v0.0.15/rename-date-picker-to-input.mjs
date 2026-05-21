// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Codemod: Rename DateTimePicker → DateTimeInput, DateRangePicker → DateRangeInput
 *
 * Renames components, types, and import paths for consistency with other
 * input components (DateInput, TextInput, NumberInput).
 *
 * Handles:
 * 1. Import source paths: '@xds/core/DateTimePicker' → '@xds/core/DateTimeInput'
 * 2. Named imports/exports: XDSDateTimePicker → XDSDateTimeInput, etc.
 * 3. JSX element names: <XDSDateTimePicker /> → <XDSDateTimeInput />
 * 4. Type references: XDSDateTimePickerProps → XDSDateTimeInputProps, etc.
 * 5. displayName strings
 */

export const meta = {
  title: 'Rename DateTimePicker/DateRangePicker → DateTimeInput/DateRangeInput',
  description:
    'Renames `XDSDateTimePicker` to `XDSDateTimeInput` and `XDSDateRangePicker` to `XDSDateRangeInput`, ' +
    'including props types, import paths, and JSX usage.',
};

const IMPORT_PATH_RENAMES = new Map([
  ['@xds/core/DateTimePicker', '@xds/core/DateTimeInput'],
  ['@xds/core/DateRangePicker', '@xds/core/DateRangeInput'],
]);

const IDENTIFIER_RENAMES = new Map([
  // Components
  ['XDSDateTimePicker', 'XDSDateTimeInput'],
  ['XDSDateRangePicker', 'XDSDateRangeInput'],
  // Props types
  ['XDSDateTimePickerProps', 'XDSDateTimeInputProps'],
  ['XDSDateRangePickerProps', 'XDSDateRangeInputProps'],
  // Size types
  ['XDSDateTimePickerSize', 'XDSDateTimeInputSize'],
  ['XDSDateRangePickerSize', 'XDSDateRangeInputSize'],
  // Hour format type
  ['XDSDateTimePickerHourFormat', 'XDSDateTimeInputHourFormat'],
  // Status types
  ['XDSDateTimePickerStatus', 'XDSDateTimeInputStatus'],
  ['XDSDateTimePickerStatusType', 'XDSDateTimeInputStatusType'],
  ['XDSDateRangePickerStatus', 'XDSDateRangeInputStatus'],
  ['XDSDateRangePickerStatusType', 'XDSDateRangeInputStatusType'],
]);

export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let hasChanges = false;

  // 1. Rename import/export source paths
  root.find(j.ImportDeclaration).forEach((path) => {
    const source = path.node.source.value;
    const renamed = IMPORT_PATH_RENAMES.get(source);
    if (renamed) {
      path.node.source.value = renamed;
      hasChanges = true;
    }
  });

  root.find(j.ExportNamedDeclaration).forEach((path) => {
    if (path.node.source) {
      const source = path.node.source.value;
      const renamed = IMPORT_PATH_RENAMES.get(source);
      if (renamed) {
        path.node.source.value = renamed;
        hasChanges = true;
      }
    }
  });

  // 2. Rename all identifiers (covers imports, type refs, variable names)
  root.find(j.Identifier).forEach((path) => {
    const renamed = IDENTIFIER_RENAMES.get(path.node.name);
    if (renamed) {
      path.node.name = renamed;
      hasChanges = true;
    }
  });

  // 3. Rename JSX element names
  root.find(j.JSXIdentifier).forEach((path) => {
    const renamed = IDENTIFIER_RENAMES.get(path.node.name);
    if (renamed) {
      path.node.name = renamed;
      hasChanges = true;
    }
  });

  // 4. Rename string literals (covers displayName assignments)
  root.find(j.StringLiteral).forEach((path) => {
    const renamed = IDENTIFIER_RENAMES.get(path.node.value);
    if (renamed) {
      path.node.value = renamed;
      hasChanges = true;
    }
  });

  // Also handle Literal nodes (parser-dependent)
  root.find(j.Literal).forEach((path) => {
    if (typeof path.node.value === 'string') {
      const renamed = IDENTIFIER_RENAMES.get(path.node.value);
      if (renamed) {
        path.node.value = renamed;
        if (path.node.raw) path.node.raw = undefined;
        hasChanges = true;
      }
    }
  });

  return hasChanges ? root.toSource() : undefined;
}
