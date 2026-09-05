// Copyright (c) Meta Platforms, Inc. and affiliates.

import {pressableControlsAuditModule} from './pressable-controls-audit-module.mjs';

export const componentAccessibilityAuditModules = [
  pressableControlsAuditModule,
];

export const generatedCoverageUrl = new URL(
  '../../packages/core/src/accessibility/generatedThemeCoverage.mjs',
  import.meta.url,
);

export function buildRegisteredAccessibilityCoverage(
  modules = componentAccessibilityAuditModules,
) {
  const generated = {};
  const componentNames = new Set();

  for (const module of modules) {
    if (
      !module.id ||
      !Array.isArray(module.components) ||
      module.components.length === 0 ||
      typeof module.buildCoverage !== 'function'
    ) {
      throw new Error(
        'Every accessibility audit module needs an id, components, and builder',
      );
    }
    const coverage = module.buildCoverage();
    const declaredComponents = new Set(
      module.components.map(component => component.name),
    );
    for (const componentName of Object.keys(coverage)) {
      if (!declaredComponents.has(componentName)) {
        throw new Error(
          `${module.id} built undeclared coverage for ${componentName}`,
        );
      }
    }
    for (const component of module.components) {
      if (componentNames.has(component.name)) {
        throw new Error(`Duplicate accessibility audit for ${component.name}`);
      }
      if (generated[component.exportName] !== undefined) {
        throw new Error(
          `Duplicate accessibility coverage export ${component.exportName}`,
        );
      }
      if (coverage[component.name] === undefined) {
        throw new Error(
          `${module.id} did not build coverage for ${component.name}`,
        );
      }
      componentNames.add(component.name);
      generated[component.exportName] = coverage[component.name];
    }
  }

  return generated;
}
