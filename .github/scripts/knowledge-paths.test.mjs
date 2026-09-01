// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';

const require = createRequire(import.meta.url);
const {
  classifyComponentKnowledgePath,
  isComponentSpecRecordPath,
} = require('./knowledge-paths.cjs');

describe('component knowledge paths', () => {
  it.each([
    [
      'flat component record',
      'packages/core/src/Button/Button.spec.md',
      'component',
    ],
    [
      'flat public member record',
      'packages/core/src/NavMenu/NavHeadingMenu.spec.md',
      'component',
    ],
    [
      'nested module record',
      'packages/core/src/Table/plugins/rowStatus/useTableRowStatus.spec.md',
      'module',
    ],
    [
      'nested Lab module record',
      'packages/lab/src/Future/subsystems/model/createModel.spec.md',
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
    'packages/charts/src/Chart/Chart.spec.md',
  ])('rejects non-record path %s', filePath => {
    expect(classifyComponentKnowledgePath(filePath)).toBeNull();
  });
});
