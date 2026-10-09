// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icon-adapter-consumer-contract.test.mjs
 * @input Public adapter exports, an isolated consumer fixture, and owner-built Core
 * @output Source/emitted typing and browser-free direct-icon adapter compatibility
 * @position Node consumer contract; never builds, emits, or writes compiler fixtures
 *
 * --source-only uses the fresh source export condition. --emitted-only requires
 * a completed owner build. Each consumer gets a fresh in-memory CompilerHost in
 * Core's package scope and resolves only the actual public self-reference map.
 */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const filename = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(filename), '..');
const core = path.join(root, 'packages/core');
const fixtureDir = path.join(root, 'scripts/fixtures/icon-capabilities');
const direct =
  process.argv[1] !== undefined && path.resolve(process.argv[1]) === filename;
const {describe, it} = direct
  ? await import('node:test')
  : await import('vitest');
const sourceOnly = direct && process.argv.includes('--source-only');
const emittedOnly = direct && process.argv.includes('--emitted-only');
assert.ok(!(sourceOnly && emittedOnly), 'Choose one consumer lane or neither.');

function checkConsumer(fixture, source) {
  const consumer = path.join(core, `__icon-adapter-consumer-${fixture}`);
  const text = readFileSync(path.join(fixtureDir, fixture), 'utf8');
  const options = {
    strict: true,
    skipLibCheck: false,
    noEmit: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
    types: ['react', 'node'],
    ...(source ? {customConditions: ['source']} : {}),
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.readFile = file => (file === consumer ? text : readFile(file));
  host.fileExists = file => file === consumer || fileExists(file);
  host.getSourceFile = (
    file,
    languageVersion,
    onError,
    shouldCreateNewSourceFile,
  ) =>
    file === consumer
      ? ts.createSourceFile(
          file,
          text,
          languageVersion,
          true,
          ts.ScriptKind.TSX,
        )
      : getSourceFile(
          file,
          languageVersion,
          onError,
          shouldCreateNewSourceFile,
        );
  for (const [specifier, entry] of [
    ['@astryxdesign/core/Icon', 'Icon/index'],
    ['@astryxdesign/core/theme', 'theme/index'],
  ]) {
    const resolved = ts.resolveModuleName(
      specifier,
      consumer,
      options,
      host,
    ).resolvedModule;
    assert.equal(
      resolved?.resolvedFileName,
      path.join(
        core,
        source ? 'src' : 'dist',
        `${entry}${source ? '.ts' : '.d.ts'}`,
      ),
      `${fixture} must use the fresh ${source ? 'source' : 'emitted'} public ${specifier} export`,
    );
  }
  const program = ts.createProgram([consumer], options, host);
  return ts.getPreEmitDiagnostics(program).map(diagnostic => {
    const message = ts.flattenDiagnosticMessageText(
      diagnostic.messageText,
      '\n',
    );
    const location =
      diagnostic.file && diagnostic.start !== undefined
        ? ` (${path.relative(root, diagnostic.file.fileName)}:${diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start).line + 1})`
        : '';
    return `TS${diagnostic.code}: ${message}${location}`;
  });
}

function checkEmittedRuntime() {
  return execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import assert from 'node:assert/strict';
    import React from 'react';
    import {renderToStaticMarkup} from 'react-dom/server';
    import {Icon, createIconAdapter, defineIconCapabilities, getApplicationIconCapabilities} from '@astryxdesign/core/Icon';
    import {defineTheme, Theme} from '@astryxdesign/core/theme';

    assert.equal(typeof window, 'undefined');
    assert.equal(typeof document, 'undefined');
    const publicIcon = await import('@astryxdesign/core/Icon');
    assert.deepEqual(Object.keys(publicIcon).sort(), [
      'Icon', 'createIconAdapter', 'defineAdaptiveIcon', 'defineIconCapabilities',
      'getApplicationIconCapabilities', 'getExtendedIcon', 'getIcon', 'getIconRegistry',
      'registerIcons', 'renderIconSlot', 'resetIcons', 'useIcon',
    ].sort());
    const baseline = getApplicationIconCapabilities();
    const contract = defineIconCapabilities({
      appearances: ['outline', 'filled'],
      weights: {values: [400, 600]},
    });
    const requests = [];
    const received = [];
    function Artwork({variant = 'line', inkWeight = 400, monochrome = false, ...svgProps}) {
      received.push({variant, inkWeight, monochrome, svgProps});
      return React.createElement('svg', {...svgProps, 'data-version': variant, 'data-ink-weight': inkWeight});
    }
    const adapt = createIconAdapter({
      capabilities: contract,
      propNames: ['variant', 'inkWeight', 'monochrome'],
      resolveProps(request) {
        requests.push(request);
        return {
          variant: request.appearance === 'filled' ? 'solid' : 'line',
          inkWeight: request.weight,
          monochrome: request.appearance === 'filled' ? null : true,
        };
      },
    });
    const Wrapped = adapt(Artwork);
    assert.equal(adapt(Artwork), Wrapped);
    assert.equal(Object.hasOwn(Wrapped, 'capabilities'), false);
    assert.equal(Object.hasOwn(Wrapped, 'resolveProps'), false);
    assert.deepEqual(getApplicationIconCapabilities(), baseline);

    const ref = {current: null};
    const click = () => {};
    const ordinaryProps = {
      ref, onClick: click, role: 'img', 'aria-label': 'Product mark',
      className: 'consumer-mark', style: {opacity: 0.5},
      children: React.createElement('title', null, 'Product mark'),
    };
    const direct = renderToStaticMarkup(React.createElement(Wrapped, ordinaryProps));
    assert.equal(requests.length, 0);
    assert.equal(received.at(-1).svgProps.ref, ref);
    assert.equal(received.at(-1).svgProps.onClick, click);
    assert.equal(received.at(-1).svgProps.style, ordinaryProps.style);
    assert.equal(received.at(-1).svgProps.children, ordinaryProps.children);
    assert.equal(received.at(-1).svgProps['aria-label'], 'Product mark');
    assert.ok(direct.includes('data-version="line"'));
    assert.ok(direct.includes('<title>Product mark</title>'));

    const noIntent = renderToStaticMarkup(React.createElement(Icon, {icon: Wrapped}));
    assert.equal(requests.length, 0);
    assert.ok(noIntent.includes('aria-hidden="true"'));
    assert.ok(noIntent.includes('data-version="line"'));
    assert.equal(received.at(-1).svgProps.appearance, undefined);
    assert.equal(received.at(-1).svgProps.weight, undefined);
    renderToStaticMarkup(React.createElement(Icon, {icon: Wrapped, size: 'sm'}));
    assert.equal(requests.length, 0);
    assert.equal(received.at(-1).variant, 'line');
    assert.equal(received.at(-1).svgProps.size, undefined);

    const explicit = renderToStaticMarkup(React.createElement(Icon, {
      icon: Wrapped, appearance: 'filled', weight: 600,
      label: 'Product mark', ref, onClick: click,
    }));
    assert.equal(requests.length, 1);
    assert.equal(requests.at(-1).appearance, 'filled');
    assert.equal(requests.at(-1).weight, 600);
    assert.equal(Object.hasOwn(requests.at(-1), 'size'), false);
    assert.equal(Object.isFrozen(requests.at(-1)), true);
    assert.equal(received.at(-1).variant, 'solid');
    assert.equal(received.at(-1).inkWeight, 600);
    assert.equal(received.at(-1).monochrome, null);
    assert.equal(received.at(-1).svgProps.ref, ref);
    assert.equal(received.at(-1).svgProps.onClick, click);
    assert.equal(received.at(-1).svgProps.appearance, undefined);
    assert.equal(received.at(-1).svgProps.weight, undefined);
    assert.ok(explicit.includes('role="img"'));
    assert.ok(explicit.includes('aria-label="Product mark"'));
    assert.equal(explicit.includes('aria-hidden="true"'), false);
    assert.equal(/capabilities=|resolveProps=|iconAdapter=/.test(explicit), false);

    const theme = defineTheme({
      name: 'consumer-adapter-theme',
      iconCapabilities: {contract, presentation: {default: {appearance: 'filled', weight: 600}}},
    });
    renderToStaticMarkup(React.createElement(Theme, {theme}, React.createElement(Icon, {icon: Wrapped})));
    assert.equal(requests.length, 2);
    assert.equal(received.at(-1).variant, 'solid');
    assert.equal(received.at(-1).inkWeight, 600);

    renderToStaticMarkup(React.createElement(Theme, {theme}, React.createElement(Icon, {
      icon: Artwork, appearance: 'filled', weight: 600,
    })));
    assert.equal(requests.length, 2);
    assert.equal(received.at(-1).variant, 'line');
    assert.equal(received.at(-1).inkWeight, 400);
    assert.equal(received.at(-1).svgProps.appearance, undefined);
    assert.equal(received.at(-1).svgProps.weight, undefined);

    // Copying public-looking fields onto an ordinary component does not opt it in.
    let forgedCalls = 0;
    const Foreign = props => React.createElement(Artwork, props);
    Foreign.capabilities = contract;
    Foreign.resolveProps = () => { forgedCalls++; return {variant: 'solid'}; };
    renderToStaticMarkup(React.createElement(Icon, {
      icon: Foreign, appearance: 'filled', weight: 600,
    }));
    assert.equal(forgedCalls, 0);
    assert.equal(received.at(-1).variant, 'line');
    assert.equal(received.at(-1).inkWeight, 400);
    assert.equal(received.at(-1).svgProps.appearance, undefined);
    assert.equal(received.at(-1).svgProps.weight, undefined);

    renderToStaticMarkup(React.createElement(Icon, {
      icon: Wrapped, appearance: 'filled', label: 'Generated label',
      role: 'presentation', 'aria-label': 'Caller label', 'aria-hidden': false,
    }));
    assert.equal(received.at(-1).svgProps.role, 'presentation');
    assert.equal(received.at(-1).svgProps['aria-label'], 'Caller label');
    assert.equal(received.at(-1).svgProps['aria-hidden'], false);

    // An untyped malformed mapper cannot take ownership of caller semantics.
    const Unsafe = createIconAdapter({
      capabilities: contract,
      propNames: ['variant'],
      resolveProps: () => ({variant: 'solid', role: 'button'}),
    })(Artwork);
    const unsafe = renderToStaticMarkup(React.createElement(Icon, {
      icon: Unsafe, appearance: 'filled', label: 'Product mark', ref, onClick: click,
    }));
    assert.equal(received.at(-1).variant, 'line');
    assert.equal(received.at(-1).svgProps.role, 'img');
    assert.equal(received.at(-1).svgProps.ref, ref);
    assert.equal(received.at(-1).svgProps.onClick, click);
    assert.ok(unsafe.includes('aria-label="Product mark"'));
    assert.equal(unsafe.includes('role="button"'), false);

    const NonPrimitive = createIconAdapter({
      capabilities: contract,
      propNames: ['variant'],
      resolveProps: () => ({variant: {name: 'solid'}}),
    })(Artwork);
    renderToStaticMarkup(React.createElement(Icon, {icon: NonPrimitive, appearance: 'filled'}));
    assert.equal(received.at(-1).variant, 'line');
    assert.deepEqual(getApplicationIconCapabilities(), baseline);
    process.stdout.write('core-b-adapter-consumer-runtime-ok');
  `,
    ],
    {
      cwd: core,
      encoding: 'utf8',
      env: {...process.env, NODE_ENV: 'production'},
      timeout: 30_000,
      maxBuffer: 4 * 1024 * 1024,
    },
  );
}

describe('Core B public adapter consumer contract', () => {
  for (const source of emittedOnly
    ? [false]
    : sourceOnly
      ? [true]
      : [true, false]) {
    const lane = source ? 'source' : 'emitted declarations';
    it(`adapter requests and mapped props are typed through ${lane}`, () => {
      assert.deepEqual(checkConsumer('icon-adapter.fixture.tsx', source), []);
    });
    it(`adapter augmentation does not leak into a new legacy program (${lane})`, () => {
      assert.deepEqual(checkConsumer('icon-legacy.fixture.tsx', source), []);
    });
  }
  if (!sourceOnly) {
    it('preserves server defaults, opaque dispatch, SVG props, ref, and accessibility', () => {
      assert.equal(checkEmittedRuntime(), 'core-b-adapter-consumer-runtime-ok');
    });
  }
});
