// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Repository icon-role discovery and mechanically checkable conformance.
 * @input Component source roots and their canonical slot types / owner declarations
 * @output Generated review rows, owner imports and actionable source diagnostics
 * @position Shared by the repository check and Storybook; never a shipped catalog
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import {isDeepStrictEqual} from 'node:util';
import {COMPONENT_PACKAGES} from '../component-packages.cjs';

export const inventoryFixture =
  'apps/storybook/stories/icon-role-inventory/roles.fixture.tsx';
export const inventoryStory =
  'apps/storybook/stories/IconRoleInventory.stories.tsx';

/** Read only known component source roots, excluding test-only declarations. */
export function iconSourceFiles(root) {
  const files = [];
  function walk(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (
          !['node_modules', 'dist', '__tests__', '__fixtures__'].includes(
            entry.name,
          )
        )
          walk(file);
      } else if (
        /\.tsx?$/.test(entry.name) &&
        !/\.(test|perf|fixture)\./.test(entry.name)
      ) {
        files.push(path.relative(root, file).split(path.sep).join('/'));
      }
    }
  }
  for (const pkg of COMPONENT_PACKAGES) walk(path.join(root, pkg.src));
  const themes = path.join(root, 'packages/themes');
  if (fs.existsSync(themes))
    for (const entry of fs.readdirSync(themes, {withFileTypes: true}))
      if (entry.isDirectory()) walk(path.join(themes, entry.name, 'src'));
  for (const fixture of [
    inventoryFixture,
    'apps/storybook/stories/icon-role-inventory/artwork.fixture.tsx',
  ])
    if (fs.existsSync(path.join(root, fixture))) files.push(fixture);
  return files.sort();
}

/** Types, not source-text regular expressions, resolve finite aliases and constants. */
export function discoverIconRoles(root, files = iconSourceFiles(root)) {
  const program = ts.createProgram(
    files.map(file => path.join(root, file)),
    {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      jsx: ts.JsxEmit.ReactJSX,
      baseUrl: root,
      paths: {
        '@astryxdesign/core/*': ['packages/core/src/*'],
        '@astryxdesign/core': ['packages/core/src/index.ts'],
      },
      skipLibCheck: true,
    },
  );
  const checker = program.getTypeChecker();
  const slots = new Map();
  const declarations = new Map();
  const uses = [];
  const policies = [];
  const errors = [];
  const sources = files
    .map(file => program.getSourceFile(path.join(root, file)))
    .filter(Boolean);
  const name = node =>
    node && (ts.isIdentifier(node) || ts.isStringLiteralLike(node))
      ? node.text
      : undefined;
  const fail = (file, node, message) => {
    const line = file.getLineAndCharacterOfPosition(node.getStart()).line + 1;
    errors.push(
      `${path.relative(root, file.fileName).split(path.sep).join('/')}:${line}: ${message}`,
    );
  };
  function literalValues(type) {
    if (type.isUnion()) return type.types.flatMap(literalValues);
    if (type.isStringLiteral()) return [type.value];
    return [];
  }
  const values = node =>
    node ? literalValues(checker.getTypeAtLocation(node)) : [];
  function unwrapped(node, seen = new Set()) {
    if (!node || seen.has(node)) return node;
    seen.add(node);
    while (
      node &&
      (ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isParenthesizedExpression(node))
    )
      node = node.expression;
    if (node && ts.isIdentifier(node)) {
      let symbol =
        node.parent && ts.isShorthandPropertyAssignment(node.parent)
          ? checker.getShorthandAssignmentValueSymbol(node.parent)
          : checker.getSymbolAtLocation(node);
      if (symbol?.flags & ts.SymbolFlags.Alias)
        symbol = checker.getAliasedSymbol(symbol);
      const declaration = symbol?.valueDeclaration;
      if (
        declaration &&
        ts.isVariableDeclaration(declaration) &&
        declaration.initializer
      )
        return unwrapped(declaration.initializer, seen);
    }
    return node;
  }
  function field(node, key) {
    node = unwrapped(node);
    if (!node || !ts.isObjectLiteralExpression(node)) return undefined;
    // Last assignment wins; finite constant object spreads are still discoverable.
    let result;
    for (const property of node.properties) {
      if (ts.isSpreadAssignment(property))
        result = field(property.expression, key) ?? result;
      else if (name(property.name) === key)
        result = ts.isPropertyAssignment(property)
          ? property.initializer
          : ts.isShorthandPropertyAssignment(property)
            ? unwrapped(property.name)
            : undefined;
    }
    return result;
  }
  function tupleValues(node, seen = new Set()) {
    node = unwrapped(node);
    if (!node || seen.has(node)) return [];
    seen.add(node);
    if (ts.isArrayLiteralExpression(node))
      return node.elements.flatMap(item =>
        ts.isSpreadElement(item)
          ? tupleValues(item.expression, new Set(seen))
          : values(item),
      );
    return values(node);
  }
  function callName(node) {
    const expression = unwrapped(node.expression);
    let symbol = checker.getSymbolAtLocation(
      ts.isPropertyAccessExpression(expression) ? expression.name : expression,
    );
    if (symbol?.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol);
    return symbol?.name ?? name(expression);
  }
  function visit(file, node) {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.text === 'ComponentIconSlotMap'
    ) {
      // Ignore similarly named local interfaces: only the public owner or its augmentation.
      const parent = node.parent.parent;
      const canonical =
        path.relative(root, file.fileName).split(path.sep).join('/') ===
        'packages/core/src/Icon/index.ts';
      const augmentation =
        parent &&
        ts.isModuleDeclaration(parent) &&
        name(parent.name) === '@astryxdesign/core/Icon';
      if (canonical || augmentation)
        for (const member of node.members) {
          if (!ts.isPropertySignature(member) || !member.type) continue;
          const slot = name(member.name);
          if (!slot || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)+$/.test(slot)) {
            fail(file, member, 'slot must name a component-owned purpose');
            continue;
          }
          const type = checker.getTypeAtLocation(member.type);
          const marker = type.getProperty('slot');
          const markerType =
            marker && checker.getTypeOfSymbolAtLocation(marker, member);
          if (
            checker.typeToString(type) !== 'true' &&
            (!markerType || checker.typeToString(markerType) !== 'true')
          )
            fail(file, member, `${slot}: slot marker must be true`);
          const state = type.getProperty('states');
          const stateType =
            state && checker.getTypeOfSymbolAtLocation(state, member);
          const states = stateType ? literalValues(stateType) : [];
          if (
            stateType &&
            (!states.length ||
              (stateType.isUnion() ? stateType.types : [stateType]).some(
                t => !t.isStringLiteral(),
              ))
          )
            fail(file, member, `${slot}: states must be a finite string union`);
          const entry = {
            slot,
            states: [...new Set(states)].sort(),
            owner: path.relative(root, file.fileName).split(path.sep).join('/'),
            fixture:
              files.includes(inventoryFixture) &&
              file.fileName === path.join(root, inventoryFixture),
          };
          if (slots.has(slot))
            fail(file, member, `${slot}: duplicate slot declaration`);
          slots.set(slot, entry);
        }
    }
    if (ts.isCallExpression(node)) {
      const operation = callName(node);
      if (operation === 'declareComponentIconRole') {
        const input = node.arguments[0];
        const roleNames = values(field(input, 'slot'));
        const defaultSize = values(field(input, 'defaultSize'));
        const order = unwrapped(field(input, 'statePrecedence'));
        const states = tupleValues(order);
        if (
          roleNames.length !== 1 ||
          defaultSize.length !== 1 ||
          !states.length
        )
          fail(
            file,
            node,
            'role declaration must expose one slot, a named default size and finite precedence to the inventory',
          );
        for (const slot of roleNames) {
          if (/^(?:\d|\.)|\d(?:px|rem|em)$/.test(defaultSize[0] ?? ''))
            fail(
              file,
              node,
              `${slot}: defaultSize is a size name, never pixel metadata`,
            );
          if (declarations.has(slot))
            fail(file, node, `${slot}: duplicate runtime role declaration`);
          declarations.set(slot, {
            file,
            node,
            defaultSize: defaultSize[0],
            states,
            module: path
              .relative(root, file.fileName)
              .split(path.sep)
              .join('/'),
          });
        }
      }
      if (
        [
          'getComponentIconState',
          'renderComponentIconSlot',
          'getComponentIconName',
          'getComponentIcon',
          'useComponentIconName',
          'useComponentIcon',
        ].includes(operation)
      ) {
        for (const slot of values(node.arguments[0])) {
          // A generic parameter in the shared seam is not a concrete owner use.
          uses.push({slot, file, node, operation});
          if (operation === 'getComponentIconState') {
            const conditions = unwrapped(node.arguments[1]);
            if (conditions && ts.isObjectLiteralExpression(conditions))
              for (const property of conditions.properties) {
                if (property.name)
                  uses.push({
                    slot,
                    state: name(property.name),
                    file,
                    node: property,
                    operation,
                  });
              }
          }
          if (operation === 'renderComponentIconSlot')
            for (const state of values(node.arguments[3]))
              uses.push({slot, state, file, node, operation});
        }
      }
      // Default policy never owns geometry; byState never owns weight or size.
      const policy = field(node.arguments[0], 'iconCapabilities');
      const presentation = field(policy, 'presentation');
      if (policy) policies.push({policy, presentation, file, node});
      for (const key of ['size', 'defaultSize', 'dimension', 'width', 'height'])
        if (field(field(presentation, 'default'), key))
          fail(
            file,
            node,
            `presentation.default must not contain ${key} pixel/size metadata`,
          );
    }
    ts.forEachChild(node, child => visit(file, child));
  }
  for (const file of sources) visit(file, file);
  for (const {policy, presentation, file, node} of policies) {
    const roleSizes = unwrapped(field(policy, 'roleSizeOverrides'));
    if (roleSizes && ts.isObjectLiteralExpression(roleSizes))
      for (const property of roleSizes.properties) {
        if (property.name && !slots.get(name(property.name))?.states.length)
          fail(
            file,
            property,
            `${name(property.name)}: roleSizeOverrides requires a declared participating role`,
          );
      }
    const byState = unwrapped(field(presentation, 'byState'));
    const states = new Set([...slots.values()].flatMap(slot => slot.states));
    if (byState && ts.isObjectLiteralExpression(byState))
      for (const property of byState.properties) {
        if (property.name && !states.has(name(property.name)))
          fail(
            file,
            property,
            `${name(property.name)}: undeclared presentation state`,
          );
        if (ts.isPropertyAssignment(property)) {
          const value = unwrapped(property.initializer);
          if (value && ts.isObjectLiteralExpression(value))
            for (const key of value.properties)
              if (name(key.name) !== 'appearance')
                fail(file, node, 'presentation.byState is appearance-only');
        }
      }
  }
  for (const [slot, declaration] of declarations) {
    const owner = slots.get(slot);
    if (!owner?.states.length)
      fail(
        declaration.file,
        declaration.node,
        `${slot}: undeclared metadata-bearing role (true slots do not participate)`,
      );
    else if (
      JSON.stringify([...declaration.states].sort()) !==
      JSON.stringify(owner.states)
    )
      fail(
        declaration.file,
        declaration.node,
        `${slot}: precedence must cover every declared state exactly once`,
      );
  }
  for (const use of uses) {
    const owner = slots.get(use.slot);
    if (!owner) fail(use.file, use.node, `${use.slot}: undeclared slot`);
    else if (use.state && !owner.states.includes(use.state))
      fail(use.file, use.node, `${use.slot}: undeclared state ${use.state}`);
  }
  for (const owner of slots.values()) {
    const declaration = declarations.get(owner.slot);
    if (owner.states.length && !declaration)
      errors.push(
        `${owner.owner}: ${owner.slot}: missing runtime declaration / inventory coverage`,
      );
    owner.module = declaration?.module;
  }
  // Only enrolled owner modules are checked, not shipped nonparticipating components.
  const enrolled = new Set([...declarations.values()].map(item => item.module));
  for (const use of uses)
    if (slots.get(use.slot)?.states.length)
      enrolled.add(
        path.relative(root, use.file.fileName).split(path.sep).join('/'),
      );
  for (const file of sources) {
    const relative = path
      .relative(root, file.fileName)
      .split(path.sep)
      .join('/');
    if (
      !enrolled.has(relative) ||
      relative === inventoryFixture ||
      relative.startsWith('packages/core/src/Icon/')
    )
      continue;
    function rendering(node) {
      if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
        let symbol = checker.getSymbolAtLocation(unwrapped(node.tagName));
        if (symbol?.flags & ts.SymbolFlags.Alias)
          symbol = checker.getAliasedSymbol(symbol);
        if (node.tagName.getText() === 'svg' || symbol?.name === 'Icon')
          fail(
            file,
            node,
            'enrolled owner bypasses renderComponentIconSlot with hardcoded SVG / bare Icon',
          );
      }
      if (
        (ts.isPropertyAccessExpression(node) &&
          node.name.text === 'componentIcons') ||
        (ts.isElementAccessExpression(node) &&
          values(node.argumentExpression).includes('componentIcons')) ||
        (ts.isBindingElement(node) &&
          ts.isObjectBindingPattern(node.parent) &&
          name(node.propertyName ?? node.name) === 'componentIcons')
      )
        fail(
          file,
          node,
          'enrolled owner reads componentIcons directly instead of the shared lookup',
        );
      if (ts.isCallExpression(node) && callName(node) === 'renderIconSlot')
        fail(
          file,
          node,
          'enrolled owner bypasses role rendering with renderIconSlot',
        );
      ts.forEachChild(node, rendering);
    }
    rendering(file);
  }
  return {
    slots: [...slots.values()].sort((a, b) => a.slot.localeCompare(b.slot)),
    errors: [...new Set(errors)].sort(),
  };
}

/** The entry point must actually pass the generated roster, not merely import it. */
export function hasGeneratedIconInventoryCoverage(source) {
  const file = ts.createSourceFile(
    'inventory.stories.tsx',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let slotsName;
  const components = new Set();
  for (const node of file.statements) {
    if (
      !ts.isImportDeclaration(node) ||
      !node.importClause?.namedBindings ||
      !ts.isNamedImports(node.importClause.namedBindings)
    )
      continue;
    for (const binding of node.importClause.namedBindings.elements) {
      const imported = binding.propertyName?.text ?? binding.name.text;
      if (
        node.moduleSpecifier.text === 'virtual:astryx-icon-roles' &&
        imported === 'slots'
      )
        slotsName = binding.name.text;
      if (
        /\/Inventory$/.test(node.moduleSpecifier.text) &&
        imported === 'IconRoleInventory'
      )
        components.add(binding.name.text);
    }
  }
  let covered = false;
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      components.has(node.tagName.getText())
    ) {
      covered ||= node.attributes.properties.some(
        property =>
          ts.isJsxAttribute(property) &&
          property.name.getText() === 'slots' &&
          property.initializer &&
          ts.isJsxExpression(property.initializer) &&
          property.initializer.expression &&
          ts.isIdentifier(property.initializer.expression) &&
          property.initializer.expression.text === slotsName,
      );
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return covered;
}

/** No persisted output: each load rebuilds rows and imports from owner source. */
export function generateIconInventoryModule(result, root = process.cwd()) {
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  const imports = [
    ...new Set(result.slots.map(slot => slot.module).filter(Boolean)),
  ].sort();
  return (
    imports
      .map(
        file =>
          `import ${JSON.stringify('/@fs/' + path.resolve(root, file).split(path.sep).join('/'))};`,
      )
      .join('\n') + `\nexport const slots = ${JSON.stringify(result.slots)};\n`
  );
}

/** Conformance of the introduced non-CSS data on actual source/built objects. */
export function assertIconPolicyParity(source, built) {
  const data = theme => ({
    componentIcons: theme.componentIcons,
    roleSizeOverrides: theme.iconCapabilities?.roleSizeOverrides,
    byState: theme.iconCapabilities?.presentation?.byState,
  });
  if (!isDeepStrictEqual(data(source), data(built)))
    throw new Error(
      'Icon conformance: build dropped or changed componentIcons, roleSizeOverrides or presentation.byState',
    );
}
