// Copyright (c) Meta Platforms, Inc. and affiliates.

import {pressableControlsAuditModule} from './pressable-controls-audit-module.mjs';

export const componentAccessibilityAuditModules = [
  pressableControlsAuditModule,
];

const EXPORT_NAME = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

export function buildRegisteredAccessibilityCoverage(
  modules = componentAccessibilityAuditModules,
) {
  const generated = new Map();
  const componentNames = new Set();
  const moduleIds = new Set();

  for (const module of modules) {
    if (
      module == null ||
      typeof module !== 'object' ||
      typeof module.id !== 'string' ||
      module.id.trim() === '' ||
      !Array.isArray(module.components) ||
      module.components.length === 0 ||
      typeof module.buildCoverage !== 'function'
    ) {
      throw new Error(
        'Every accessibility audit module needs an id, components, and builder',
      );
    }
    if (moduleIds.has(module.id)) {
      throw new Error(`Duplicate accessibility audit module ${module.id}`);
    }
    moduleIds.add(module.id);

    const coverage = module.buildCoverage();
    if (
      coverage == null ||
      typeof coverage !== 'object' ||
      Array.isArray(coverage)
    ) {
      throw new TypeError(`${module.id} must build a component-keyed object`);
    }
    const declaredComponents = new Set(
      module.components.map((component, index) =>
        nonEmptyString(component?.name, `${module.id} component ${index} name`),
      ),
    );
    for (const componentName of Object.keys(coverage)) {
      if (!declaredComponents.has(componentName)) {
        throw new Error(
          `${module.id} built undeclared coverage for ${componentName}`,
        );
      }
    }
    for (const component of module.components) {
      const componentName = nonEmptyString(
        component?.name,
        `${module.id} component name`,
      );
      const exportName = nonEmptyString(
        component?.exportName,
        `${module.id} ${componentName} exportName`,
      );
      if (!EXPORT_NAME.test(exportName)) {
        throw new Error(
          `Invalid accessibility coverage export ${exportName} for ${componentName}`,
        );
      }
      if (componentNames.has(componentName)) {
        throw new Error(`Duplicate accessibility audit for ${componentName}`);
      }
      if (generated.has(exportName)) {
        throw new Error(
          `Duplicate accessibility coverage export ${exportName}`,
        );
      }
      if (!Object.hasOwn(coverage, componentName)) {
        throw new Error(
          `${module.id} did not build coverage for ${componentName}`,
        );
      }
      if (!Array.isArray(coverage[componentName])) {
        throw new TypeError(
          `${module.id} built non-array coverage for ${componentName}`,
        );
      }
      componentNames.add(componentName);
      generated.set(exportName, coverage[componentName]);
    }
  }

  return Object.fromEntries(generated);
}
