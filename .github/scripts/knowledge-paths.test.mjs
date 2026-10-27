// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  classifyComponentKnowledgePath,
  classifyPackageArchitecturePath,
  classifyPlatformComponentKnowledgePath,
  isComponentSpecRecordPath,
  isKnowledgeRecordCandidatePath,
} = require('./knowledge-paths.cjs');

describe('component knowledge paths', () => {
  it.each([
    [
      'directory-layout Core component record',
      'packages/core/src/Button/Button.spec.md',
      'component',
    ],
    [
      'directory-layout public member record',
      'packages/core/src/NavMenu/NavHeadingMenu.spec.md',
      'component',
    ],
    [
      'directory-layout module record',
      'packages/core/src/Table/plugins/rowStatus/useTableRowStatus.spec.md',
      'module',
    ],
    [
      'flat Charts component record',
      'packages/charts/src/Chart.spec.md',
      'component',
    ],
    [
      'flat Rich Text component record',
      'packages/richtext/src/RichTextView.spec.md',
      'component',
    ],
    [
      'flat Vega component record',
      'packages/vega/src/VegaChart.spec.md',
      'component',
    ],
    [
      'flat-package module record',
      'packages/charts/src/Chart/plugins/useChartSelection.spec.md',
      'module',
    ],
  ])('classifies the %s', (_label, filePath, kind) => {
    expect(classifyComponentKnowledgePath(filePath)).toMatchObject({kind});
    expect(isComponentSpecRecordPath(filePath)).toBe(true);
  });

  it.each([
    'packages/core/src/__tests__/TopLevel.spec.md',
    'packages/core/src/Button/__fixtures__/Fixture.spec.md',
    'packages/core/src/Button/.hidden/Hidden.spec.md',
    'packages/core/src/Button/.Hidden.spec.md',
    'packages/core/src/Button/generated/Generated.spec.md',
    'packages/core/src/Button/plugins/Thing.generated.spec.md',
    'packages/core/src/Button/node_modules/pkg/Dependency.spec.md',
  ])('ignores %s on every consumer', filePath => {
    expect(classifyComponentKnowledgePath(filePath)).toBeNull();
    expect(isComponentSpecRecordPath(filePath)).toBe(false);
  });

  it.each([
    'packages/core/src/Button/Button.md',
    'packages/core/src/Button/not-kebab.spec.md',
    'packages/core/src/Button.spec.md',
    'packages/themes/neutral/src/Button.spec.md',
    'packages/cli/src/Prompt.spec.md',
  ])('rejects non-record path %s', filePath => {
    expect(classifyComponentKnowledgePath(filePath)).toBeNull();
  });
});

describe('platform component knowledge paths', () => {
  it('classifies a Swift component record beside its code', () => {
    const filePath =
      'packages/native/apple/Sources/Astryx/Button/Button.spec.md';
    expect(classifyPlatformComponentKnowledgePath(filePath)).toMatchObject({
      componentRoot: 'Button',
      componentTree: 'packages/native/apple/Sources/Astryx',
      kind: 'component',
      language: 'swift',
      publicName: 'Button',
    });
    expect(isComponentSpecRecordPath(filePath)).toBe(true);
  });

  it.each([
    'packages/native/apple/Sources/Astryx/Button/plugins/Thing.spec.md',
    'packages/native/apple/Sources/Astryx/Button.spec.md',
    'packages/native/apple/Sources/AstryxNative/Button/Button.spec.md',
    'packages/native/apple/Sources/Astryx/__fixtures__/Button.spec.md',
    'packages/native/apple/Sources/Astryx/Button/button.spec.md',
    'packages/native/swift-ios-1/core/Button/Button.spec.md',
  ])('rejects %s', filePath => {
    expect(classifyPlatformComponentKnowledgePath(filePath)).toBeNull();
  });
});

describe('package record paths', () => {
  it.each([
    [
      'packages/native/specs/swift/accessibility.spec.md',
      'architecture:native-swift-accessibility',
    ],
    [
      'packages/native/specs/swift/library/theme-generator.spec.md',
      'architecture:native-swift-library-theme-generator',
    ],
    [
      'packages/native/specs/boundaries.spec.md',
      'architecture:native-boundaries',
    ],
  ])('derives the id of %s', (filePath, id) => {
    expect(classifyPackageArchitecturePath(filePath)).toEqual({
      id,
      kind: 'architecture',
      packageName: 'native',
    });
  });

  it.each([
    'packages/native/specs/swift/accessibility.md',
    'packages/native/specs/swift/Accessibility.spec.md',
    'packages/native/docs/swift/accessibility.spec.md',
  ])('rejects %s', filePath => {
    expect(classifyPackageArchitecturePath(filePath)).toBeNull();
  });
});

describe('knowledge record candidates (INV27)', () => {
  it.each([
    'packages/native/specs/TEMPLATE.md',
    'packages/native/specs/swift/library/accessibility.md',
    'packages/widgets/docs/Widget.spec.md',
    'docs/specs/AST-082-native-first-surfaces/spec.md',
    'packages/core/src/Button/Button.spec.md',
  ])('treats %s as a candidate', filePath => {
    expect(isKnowledgeRecordCandidatePath(filePath)).toBe(true);
  });

  it.each([
    'packages/native/specs/README.md',
    'docs/specs/AST-082-native-first-surfaces/plan.md',
    'packages/native/specs/__fixtures__/fixture.md',
    'packages/core/src/Button/node_modules/dep/Dep.spec.md',
    'packages/core/src/Button/.Hidden.spec.md',
    'packages/core/src/Button/Thing.generated.spec.md',
    'packages/native/specs/swift/notes.txt',
    'docs/contributing/spec-writing.md',
  ])('does not treat %s as a candidate', filePath => {
    expect(isKnowledgeRecordCandidatePath(filePath)).toBe(false);
  });
});
