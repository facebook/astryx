// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lower normalized Icon source and role/state policy data into self-contained artifacts.
 * @input Core-validated source IR, exact contract contributors and proven imports.
 * @output JavaScript references to supplied artwork, shared contracts and node defaults.
 * @position Private CLI emitter; never normalizes grammar or samples renderer ranges.
 */
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {serializeIconData} from './icon-serialization.mjs';

/** @param {Set<string>} used @returns {(stem: string) => string} */
function allocator(used) {
  return stem => {
    let name = stem,
      index = 1;
    while (used.has(name)) name = `${stem}${index++}`;
    used.add(name);
    return name;
  };
}

/**
 * Rehydrate bound sources from imported trees. Default leaves are node-valued;
 * a parameterized own default is createElement(render) WITHOUT a weight prop.
 * @param {any} theme @param {string} expression @param {string} binding
 * @param {Set<string>} used @param {(contract: any) => string} contractExpression
 * @returns {{imports: string, declarations: string, icons: string, sources: string}}
 */
export function lowerBuiltIconSources(
  theme,
  expression,
  binding,
  used,
  contractExpression,
) {
  const allocate = allocator(used);
  const raw = allocate(`${binding}ImportedIcons`);
  const sources = allocate(`${binding}IconSources`);
  const defaults = allocate(`${binding}IconDefaults`);
  const defineAdaptive = allocate(`${binding}DefineAdaptiveIcon`);
  const createElement = allocate(`${binding}CreateElement`);
  let parameterized = false;
  const sourceEntries = [],
    defaultEntries = [];
  for (const [key, entry] of Object.entries(theme.__iconSources)) {
    const property = `[${JSON.stringify(key)}]`;
    const imported = `${raw}${property}`;
    if (
      entry &&
      typeof entry === 'object' &&
      Object.hasOwn(entry, 'tree') &&
      Object.hasOwn(entry, 'capabilities')
    ) {
      const contract = contractExpression(entry.capabilities);
      sourceEntries.push(
        `  ${property}: ${defineAdaptive}(${contract}, ${imported}.tree ?? ${imported}),`,
      );
      let leaf = entry.tree.default;
      let leafPath = `${sources}${property}.tree.default`;
      while (
        leaf &&
        typeof leaf === 'object' &&
        !Object.hasOwn(leaf, '$$typeof') &&
        Object.hasOwn(leaf, 'default')
      ) {
        leaf = leaf.default;
        leafPath += '.default';
      }
      if (
        leaf &&
        typeof leaf === 'object' &&
        Object.hasOwn(leaf, 'render') &&
        Object.hasOwn(leaf, 'weightRange')
      ) {
        parameterized = true;
        leafPath = `${createElement}(${leafPath}.render)`;
      }
      defaultEntries.push(`  ${property}: ${leafPath},`);
    } else {
      sourceEntries.push(`  ${property}: ${imported},`);
      defaultEntries.push(`  ${property}: ${sources}${property},`);
    }
  }
  return {
    imports:
      `import { defineAdaptiveIcon as ${defineAdaptive} } from '@astryxdesign/core/Icon';\n` +
      (parameterized
        ? `import { createElement as ${createElement} } from 'react';\n`
        : ''),
    declarations: `const ${raw} = ${expression};\nconst ${sources} = Object.freeze({\n${sourceEntries.join('\n')}\n});\nconst ${defaults} = Object.freeze({\n${defaultEntries.join('\n')}\n});\n`,
    icons: defaults,
    sources,
  };
}

/**
 * One exact-pointer ledger is shared by policy and sources. Independently
 * authored equal contracts remain separate contributors, including overridden
 * ancestors. Unproven library references fall back to validated plain data.
 * @param {any} theme @param {string} binding @param {Set<string>} used
 * @param {string} [sourceExpression] @param {string} [policyContractExpression]
 * @param {{contract: any, expression: string}[]} [contractReferences]
 */
export function lowerBuiltIconContracts(
  theme,
  binding,
  used,
  sourceExpression,
  policyContractExpression,
  contractReferences = [],
) {
  const allocate = allocator(used);
  const contracts = theme.__iconContracts ?? [];
  const values = allocate(`${binding}IconContracts`);
  const defineContract = allocate(`${binding}DefineIconCapabilities`);
  /** @param {any} contract */
  const expression = contract => {
    const index = contracts.indexOf(contract);
    if (index === -1)
      throw new AstryxError(
        'A normalized Icon source or policy contract is missing from __iconContracts. Rebuild with a Core that retains complete Icon lineage.',
        undefined,
        ERROR_CODES.ERR_THEME_INVALID,
      );
    return `${values}[${index}]`;
  };
  /** @param {any} contract */
  const importedContract = contract => {
    /** @type {string[]} */
    const references = contractReferences
      .filter(value => value.contract === contract)
      .map(value => value.expression);
    if (
      policyContractExpression &&
      contract === theme.iconCapabilities?.contract
    )
      references.push(policyContractExpression);
    for (const [key, entry] of Object.entries(theme.__iconSources ?? {})) {
      if (
        sourceExpression &&
        entry &&
        typeof entry === 'object' &&
        Object.hasOwn(entry, 'capabilities') &&
        entry.capabilities === contract
      )
        references.push(
          `(${sourceExpression})[${JSON.stringify(key)}]?.capabilities`,
        );
    }
    return [...references, serializeIconData(contract, '__iconContracts')].join(
      ' ?? ',
    );
  };
  const fields = ['componentIcons', 'iconCapabilities', '__iconContracts']
    .map(field => {
      if (theme[field] === undefined) return '';
      let encoded;
      if (field === '__iconContracts') encoded = values;
      else if (
        field === 'iconCapabilities' &&
        theme[field].contract !== undefined
      ) {
        const {contract, ...policy} = theme[field];
        encoded = `{...${serializeIconData(policy, field)}, contract: ${expression(contract)}}`;
      } else encoded = serializeIconData(theme[field], field);
      return `  ${field}: ${encoded},\n`;
    })
    .join('');
  return {
    fields,
    expression,
    imports: contracts.length
      ? `import { defineIconCapabilities as ${defineContract} } from '@astryxdesign/core/Icon';\n`
      : '',
    declarations:
      theme.__iconContracts === undefined
        ? ''
        : `const ${values} = Object.freeze([${contracts.map((/** @type {any} */ contract) => `${defineContract}(${importedContract(contract)})`).join(', ')}]);\n`,
  };
}
