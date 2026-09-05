// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stepper.public.test.ts
 * @input Imports the Stepper barrel and its context module
 * @output Locks the supported public context surface
 * @position Compatibility test guarding @astryxdesign/core/Stepper
 *
 * The decision this file encodes: `useStepperContext` and
 * `StepperContextValue` are NOT a supported extension point. Custom step
 * composition goes through `<Step>` and its slots. Both names stay exported
 * until the next major so the removal lands at an explicit compatibility
 * boundary, and until then they must not carry Stepper's private
 * coordination — see StepperContext.ts.
 *
 * The `expectTypeOf` assertions here are enforced by `pnpm -F
 * @astryxdesign/core typecheck`, not by the test run — a failing one surfaces
 * as `TS2554: Expected 2 arguments, but got 1` on the assertion's line, which
 * is how vitest reports a type assertion that did not hold. Verified by
 * re-widening `StepperContextValue` and watching exactly the matching lines
 * fail.
 */

import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {describe, expect, expectTypeOf, it} from 'vitest';

// Type-only: the runtime surface is checked through a dynamic `import('./index')`
// below, so nothing here is needed as a value.
import type {useStepperContext, StepperContextValue} from './index';
import type {StepperCoordination} from './StepperContext';

describe('Stepper public context surface', () => {
  it('keeps private coordination off the public interface', () => {
    // The two fields that made an internal change a consumer type break: the
    // connector-fill choreography and the dev-mode step registry. Neither is
    // something a consumer configures, so neither is named out here.
    expectTypeOf<StepperContextValue>().not.toHaveProperty(
      'previousActiveStep',
    );
    expectTypeOf<StepperContextValue>().not.toHaveProperty('registerStep');

    // Guarded at the hook too, which is the declaration a consumer actually
    // reads — widening the return type is the way this would regress.
    expectTypeOf<ReturnType<typeof useStepperContext>>().not.toHaveProperty(
      'previousActiveStep',
    );
    expectTypeOf<ReturnType<typeof useStepperContext>>().not.toHaveProperty(
      'registerStep',
    );
  });

  it('still names the fields the deprecation window promises', () => {
    // Narrowing removed private coordination, not the supported reads. Anyone
    // already calling the hook keeps compiling until the major.
    expectTypeOf<StepperContextValue>().toHaveProperty('activeStep');
    expectTypeOf<StepperContextValue>().toHaveProperty('orientation');
    expectTypeOf<StepperContextValue>().toHaveProperty('isNonLinear');
    expectTypeOf<StepperContextValue>().toHaveProperty('onStepClick');
    expectTypeOf<StepperContextValue>().toHaveProperty('density');
    expectTypeOf<StepperContextValue>().toHaveProperty('indicatorPosition');

    expectTypeOf<
      ReturnType<typeof useStepperContext>
    >().toEqualTypeOf<StepperContextValue>();
  });

  it('carries one value on the wire, widened only inside the module', () => {
    // The split is about which declaration a consumer can reach, not about
    // building a second object per render. If these ever diverge structurally,
    // the provider is handing Step something the public read cannot describe.
    expectTypeOf<StepperCoordination>().toMatchTypeOf<StepperContextValue>();
    expectTypeOf<StepperCoordination>().toHaveProperty('previousActiveStep');
    expectTypeOf<StepperCoordination>().toHaveProperty('registerStep');
  });

  it('closes the internal seam by module boundary, not by naming', async () => {
    // An `@internal` tag is a note to a reader; a builder reading an exported
    // declaration finds every name on it and can reasonably wire one. So the
    // coordination hook and its type must not reach the barrel at all.
    const entry = await import('./index');
    expect(Object.keys(entry)).not.toContain('useStepperCoordination');
    expect(Object.keys(entry)).not.toContain('StepperContext');

    // Checked against the barrel's CODE, with comments stripped: the block
    // documenting the deprecation names `StepperCoordination` in prose, and a
    // raw substring check cannot tell that from an export.
    const source = await readFile(resolve(__dirname, 'index.ts'), 'utf8');
    const code = source
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    expect(code).not.toContain('StepperCoordination');
    expect(code).not.toContain('useStepperCoordination');
  });

  it('still exports the deprecated names, so removal needs a major', async () => {
    // The other half of the contract: this test fails if someone drops them in
    // a patch instead of at the compatibility boundary.
    const entry = await import('./index');
    expect(Object.keys(entry)).toContain('useStepperContext');

    const source = await readFile(
      resolve(__dirname, 'StepperContext.ts'),
      'utf8',
    );
    expect(source).toContain('@deprecated');
  });
});
