import fs, { existsSync, readFileSync, promises } from 'node:fs';
import { getTests, getTestName, hasFailed, getFullName, getSuites, getTasks } from '@vitest/runner/utils';
import * as pathe from 'pathe';
import { extname, relative, normalize, resolve, dirname } from 'pathe';
import c from 'tinyrainbow';
import { d as divider, F as F_POINTER, w as withLabel, f as formatProjectName, a as formatTimeString, g as getStateSymbol, t as taskFail, b as F_RIGHT, c as F_CHECK, r as renderSnapshotSummary, e as getStateString, h as countTestErrors, i as getCols, j as getHookStateSymbol } from './utils.DNoFbBUZ.js';
import { stripVTControlCharacters } from 'node:util';
import { highlight, isPrimitive, inspect, positionToOffset, lineSplitRE, toArray, notNullish } from '@vitest/utils';
import { performance } from 'node:perf_hooks';
import { parseErrorStacktrace, parseStacktrace } from '@vitest/utils/source-map';
import { a as TypeCheckError, R as RandomSequencer, g as getOutputFile, b as isNode, c as isDeno } from './RandomSequencer.CMRlh2v4.js';
import { isCI } from 'std-env';
import { mkdir, writeFile, readdir, stat, readFile } from 'node:fs/promises';
import { Writable } from 'node:stream';
import { Console } from 'node:console';
import process$1 from 'node:process';
import { g as getDefaultExportFromCjs, c as commonjsGlobal } from './_commonjsHelpers.BFTU3MAI.js';
import require$$0 from 'assert';
import require$$0$1 from 'events';
import { createRequire } from 'node:module';
import { hostname } from 'node:os';

class TestProject {
  /**
   * The global vitest instance.
   * @experimental The public Vitest API is experimental and does not follow semver.
   */
  vitest;
  /**
   * The workspace project this test project is associated with.
   * @experimental The public Vitest API is experimental and does not follow semver.
   */
  workspaceProject;
  /**
   * Vite's dev server instance. Every workspace project has its own server.
   */
  vite;
  /**
   * Resolved project configuration.
   */
  config;
  /**
   * Resolved global configuration. If there are no workspace projects, this will be the same as `config`.
   */
  globalConfig;
  /**
   * The name of the project or an empty string if not set.
   */
  name;
  constructor(workspaceProject) {
    this.workspaceProject = workspaceProject;
    this.vitest = workspaceProject.ctx;
    this.vite = workspaceProject.server;
    this.globalConfig = workspaceProject.ctx.config;
    this.config = workspaceProject.config;
    this.name = workspaceProject.getName();
  }
  /**
   * Serialized project configuration. This is the config that tests receive.
   */
  get serializedConfig() {
    return this.workspaceProject.getSerializableConfig();
  }
  /**
   * Custom context provided to the project.
   */
  context() {
    return this.workspaceProject.getProvidedContext();
  }
  /**
   * Provide a custom serializable context to the project. This context will be available for tests once they run.
   */
  provide(key, value) {
    this.workspaceProject.provide(key, value);
  }
  toJSON() {
    return {
      name: this.name,
      serializedConfig: this.serializedConfig,
      context: this.context()
    };
  }
}

class ReportedTaskImplementation {
  /**
   * Task instance.
   * @experimental Public runner task API is experimental and does not follow semver.
   */
  task;
  /**
   * The project assosiacted with the test or suite.
   */
  project;
  /**
   * Unique identifier.
   * This ID is deterministic and will be the same for the same test across multiple runs.
   * The ID is based on the project name, module url and test position.
   */
  id;
  /**
   * Location in the module where the test or suite is defined.
   */
  location;
  constructor(task, project) {
    this.task = task;
    this.project = project.testProject || (project.testProject = new TestProject(project));
    this.id = task.id;
    this.location = task.location;
  }
  /**
   * Creates a new reported task instance and stores it in the project's state for future use.
   */
  static register(task, project) {
    const state = new this(task, project);
    storeTask(project, task, state);
    return state;
  }
}
class TestCase extends ReportedTaskImplementation {
  #fullName;
  type = "test";
  /**
   * Direct reference to the test module where the test or suite is defined.
   */
  module;
  /**
   * Name of the test.
   */
  name;
  /**
   * Options that the test was initiated with.
   */
  options;
  /**
   * Parent suite. If the test was called directly inside the module, the parent will be the module itself.
   */
  parent;
  constructor(task, project) {
    super(task, project);
    this.name = task.name;
    this.module = getReportedTask(project, task.file);
    const suite = this.task.suite;
    if (suite) {
      this.parent = getReportedTask(project, suite);
    } else {
      this.parent = this.module;
    }
    this.options = buildOptions(task);
  }
  /**
   * Full name of the test including all parent suites separated with `>`.
   */
  get fullName() {
    if (this.#fullName === void 0) {
      if (this.parent.type !== "module") {
        this.#fullName = `${this.parent.fullName} > ${this.name}`;
      } else {
        this.#fullName = this.name;
      }
    }
    return this.#fullName;
  }
  /**
   * Test results. Will be `undefined` if test is not finished yet or was just collected.
   */
  result() {
    const result = this.task.result;
    if (!result || result.state === "run") {
      return void 0;
    }
    const state = result.state === "fail" ? "failed" : result.state === "pass" ? "passed" : "skipped";
    return {
      state,
      errors: result.errors
    };
  }
  /**
   * Checks if the test did not fail the suite.
   * If the test is not finished yet or was skipped, it will return `true`.
   */
  ok() {
    const result = this.result();
    return !result || result.state !== "failed";
  }
  /**
   * Custom metadata that was attached to the test during its execution.
   */
  meta() {
    return this.task.meta;
  }
  /**
   * Useful information about the test like duration, memory usage, etc.
   * Diagnostic is only available after the test has finished.
   */
  diagnostic() {
    const result = this.task.result;
    if (!result || result.state === "run" || !result.startTime) {
      return void 0;
    }
    const duration = result.duration || 0;
    const slow = duration > this.project.globalConfig.slowTestThreshold;
    return {
      slow,
      heap: result.heap,
      duration,
      startTime: result.startTime,
      retryCount: result.retryCount ?? 0,
      repeatCount: result.repeatCount ?? 0,
      flaky: !!result.retryCount && result.state === "pass" && result.retryCount > 0
    };
  }
}
class TestCollection {
  #task;
  #project;
  constructor(task, project) {
    this.#task = task;
    this.#project = project;
  }
  /**
   * Returns the test or suite at a specific index in the array.
   */
  at(index) {
    if (index < 0) {
      index = this.size + index;
    }
    return getReportedTask(this.#project, this.#task.tasks[index]);
  }
  /**
   * The number of tests and suites in the collection.
   */
  get size() {
    return this.#task.tasks.length;
  }
  /**
   * Returns the collection in array form for easier manipulation.
   */
  array() {
    return Array.from(this);
  }
  /**
   * Filters all tests that are part of this collection and its children.
   */
  *allTests(state) {
    for (const child of this) {
      if (child.type === "suite") {
        yield* child.children.allTests(state);
      } else if (state) {
        const testState = getTestState(child);
        if (state === testState) {
          yield child;
        }
      } else {
        yield child;
      }
    }
  }
  /**
   * Filters only the tests that are part of this collection.
   */
  *tests(state) {
    for (const child of this) {
      if (child.type !== "test") {
        continue;
      }
      if (state) {
        const testState = getTestState(child);
        if (state === testState) {
          yield child;
        }
      } else {
        yield child;
      }
    }
  }
  /**
   * Filters only the suites that are part of this collection.
   */
  *suites() {
    for (const child of this) {
      if (child.type === "suite") {
        yield child;
      }
    }
  }
  /**
   * Filters all suites that are part of this collection and its children.
   */
  *allSuites() {
    for (const child of this) {
      if (child.type === "suite") {
        yield child;
        yield* child.children.allSuites();
      }
    }
  }
  *[Symbol.iterator]() {
    for (const task of this.#task.tasks) {
      yield getReportedTask(this.#project, task);
    }
  }
}
class SuiteImplementation extends ReportedTaskImplementation {
  /**
   * Collection of suites and tests that are part of this suite.
   */
  children;
  constructor(task, project) {
    super(task, project);
    this.children = new TestCollection(task, project);
  }
}
class TestSuite extends SuiteImplementation {
  #fullName;
  type = "suite";
  /**
   * Name of the test or the suite.
   */
  name;
  /**
   * Direct reference to the test module where the test or suite is defined.
   */
  module;
  /**
   * Parent suite. If suite was called directly inside the module, the parent will be the module itself.
   */
  parent;
  /**
   * Options that suite was initiated with.
   */
  options;
  constructor(task, project) {
    super(task, project);
    this.name = task.name;
    this.module = getReportedTask(project, task.file);
    const suite = this.task.suite;
    if (suite) {
      this.parent = getReportedTask(project, suite);
    } else {
      this.parent = this.module;
    }
    this.options = buildOptions(task);
  }
  /**
   * Full name of the suite including all parent suites separated with `>`.
   */
  get fullName() {
    if (this.#fullName === void 0) {
      if (this.parent.type !== "module") {
        this.#fullName = `${this.parent.fullName} > ${this.name}`;
      } else {
        this.#fullName = this.name;
      }
    }
    return this.#fullName;
  }
}
class TestModule extends SuiteImplementation {
  type = "module";
  /**
   * This is usually an absolute UNIX file path.
   * It can be a virtual id if the file is not on the disk.
   * This value corresponds to Vite's `ModuleGraph` id.
   */
  moduleId;
  constructor(task, project) {
    super(task, project);
    this.moduleId = task.filepath;
  }
  /**
   * Useful information about the module like duration, memory usage, etc.
   * If the module was not executed yet, all diagnostic values will return `0`.
   */
  diagnostic() {
    const setupDuration = this.task.setupDuration || 0;
    const collectDuration = this.task.collectDuration || 0;
    const prepareDuration = this.task.prepareDuration || 0;
    const environmentSetupDuration = this.task.environmentLoad || 0;
    const duration = this.task.result?.duration || 0;
    return {
      environmentSetupDuration,
      prepareDuration,
      collectDuration,
      setupDuration,
      duration
    };
  }
}
function buildOptions(task) {
  return {
    each: task.each,
    concurrent: task.concurrent,
    shuffle: task.shuffle,
    retry: task.retry,
    repeats: task.repeats,
    mode: task.mode
  };
}
function getTestState(test) {
  const result = test.result();
  return result ? result.state : "running";
}
function storeTask(project, runnerTask, reportedTask) {
  project.ctx.state.reportedTasksMap.set(runnerTask, reportedTask);
}
function getReportedTask(project, runnerTask) {
  const reportedTask = project.ctx.state.getReportedEntity(runnerTask);
  if (!reportedTask) {
    throw new Error(
      `Task instance was not found for ${runnerTask.type} "${runnerTask.name}"`
    );
  }
  return reportedTask;
}

/// <reference types="../types/index.d.ts" />

// (c) 2020-present Andrea Giammarchi

const {parse: $parse, stringify: $stringify} = JSON;
const {keys} = Object;

const Primitive = String;   // it could be Number
const primitive = 'string'; // it could be 'number'

const ignore = {};
const object = 'object';

const noop = (_, value) => value;

const primitives = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const Primitives = (_, value) => (
  typeof value === primitive ? new Primitive(value) : value
);

const revive = (input, parsed, output, $) => {
  const lazy = [];
  for (let ke = keys(output), {length} = ke, y = 0; y < length; y++) {
    const k = ke[y];
    const value = output[k];
    if (value instanceof Primitive) {
      const tmp = input[value];
      if (typeof tmp === object && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k] = ignore;
        lazy.push({k, a: [input, parsed, tmp, $]});
      }
      else
        output[k] = $.call(output, k, tmp);
    }
    else if (output[k] !== ignore)
      output[k] = $.call(output, k, value);
  }
  for (let {length} = lazy, i = 0; i < length; i++) {
    const {k, a} = lazy[i];
    output[k] = $.call(output, k, revive.apply(null, a));
  }
  return output;
};

const set = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

/**
 * Converts a specialized flatted string into a JS value.
 * @param {string} text
 * @param {(this: any, key: string, value: any) => any} [reviver]
 * @returns {any}
 */
const parse = (text, reviver) => {
  const input = $parse(text, Primitives).map(primitives);
  const value = input[0];
  const $ = reviver || noop;
  const tmp = typeof value === object && value ?
              revive(input, new Set, value, $) :
              value;
  return $.call({'': tmp}, '', tmp);
};

/**
 * Converts a JS value into a specialized flatted string.
 * @param {any} value
 * @param {((this: any, key: string, value: any) => any) | (string | number)[] | null | undefined} [replacer]
 * @param {string | number | undefined} [space]
 * @returns {string}
 */
const stringify = (value, replacer, space) => {
  const $ = replacer && typeof replacer === object ?
            (k, v) => (k === '' || -1 < replacer.indexOf(k) ? v : void 0) :
            (replacer || noop);
  const known = new Map;
  const input = [];
  const output = [];
  let i = +set(known, input, $.call({'': value}, '', value));
  let firstRun = !i;
  while (i < input.length) {
    firstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';
  function replace(key, value) {
    if (firstRun) {
      firstRun = !firstRun;
      return value;
    }
    const after = $.call(this, key, value);
    switch (typeof after) {
      case object:
        if (after === null) return after;
      case primitive:
        return known.get(after) || set(known, input, after);
    }
    return after;
  }
};

const ESC$1 = '\u001B[';
const OSC = '\u001B]';
const BEL = '\u0007';
const SEP = ';';
const isTerminalApp = process.env.TERM_PROGRAM === 'Apple_Terminal';

const ansiEscapes = {};

ansiEscapes.cursorTo = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	if (typeof y !== 'number') {
		return ESC$1 + (x + 1) + 'G';
	}

	return ESC$1 + (y + 1) + ';' + (x + 1) + 'H';
};

ansiEscapes.cursorMove = (x, y) => {
	if (typeof x !== 'number') {
		throw new TypeError('The `x` argument is required');
	}

	let returnValue = '';

	if (x < 0) {
		returnValue += ESC$1 + (-x) + 'D';
	} else if (x > 0) {
		returnValue += ESC$1 + x + 'C';
	}

	if (y < 0) {
		returnValue += ESC$1 + (-y) + 'A';
	} else if (y > 0) {
		returnValue += ESC$1 + y + 'B';
	}

	return returnValue;
};

ansiEscapes.cursorUp = (count = 1) => ESC$1 + count + 'A';
ansiEscapes.cursorDown = (count = 1) => ESC$1 + count + 'B';
ansiEscapes.cursorForward = (count = 1) => ESC$1 + count + 'C';
ansiEscapes.cursorBackward = (count = 1) => ESC$1 + count + 'D';

ansiEscapes.cursorLeft = ESC$1 + 'G';
ansiEscapes.cursorSavePosition = isTerminalApp ? '\u001B7' : ESC$1 + 's';
ansiEscapes.cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC$1 + 'u';
ansiEscapes.cursorGetPosition = ESC$1 + '6n';
ansiEscapes.cursorNextLine = ESC$1 + 'E';
ansiEscapes.cursorPrevLine = ESC$1 + 'F';
ansiEscapes.cursorHide = ESC$1 + '?25l';
ansiEscapes.cursorShow = ESC$1 + '?25h';

ansiEscapes.eraseLines = count => {
	let clear = '';

	for (let i = 0; i < count; i++) {
		clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : '');
	}

	if (count) {
		clear += ansiEscapes.cursorLeft;
	}

	return clear;
};

ansiEscapes.eraseEndLine = ESC$1 + 'K';
ansiEscapes.eraseStartLine = ESC$1 + '1K';
ansiEscapes.eraseLine = ESC$1 + '2K';
ansiEscapes.eraseDown = ESC$1 + 'J';
ansiEscapes.eraseUp = ESC$1 + '1J';
ansiEscapes.eraseScreen = ESC$1 + '2J';
ansiEscapes.scrollUp = ESC$1 + 'S';
ansiEscapes.scrollDown = ESC$1 + 'T';

ansiEscapes.clearScreen = '\u001Bc';

ansiEscapes.clearTerminal = process.platform === 'win32' ?
	`${ansiEscapes.eraseScreen}${ESC$1}0f` :
	// 1. Erases the screen (Only done in case `2` is not supported)
	// 2. Erases the whole screen including scrollback buffer
	// 3. Moves cursor to the top-left position
	// More info: https://www.real-world-systems.com/docs/ANSIcode.html
	`${ansiEscapes.eraseScreen}${ESC$1}3J${ESC$1}H`;

ansiEscapes.beep = BEL;

ansiEscapes.link = (text, url) => {
	return [
		OSC,
		'8',
		SEP,
		SEP,
		url,
		BEL,
		text,
		OSC,
		'8',
		SEP,
		SEP,
		BEL
	].join('');
};

ansiEscapes.image = (buffer, options = {}) => {
	let returnValue = `${OSC}1337;File=inline=1`;

	if (options.width) {
		returnValue += `;width=${options.width}`;
	}

	if (options.height) {
		returnValue += `;height=${options.height}`;
	}

	if (options.preserveAspectRatio === false) {
		returnValue += ';preserveAspectRatio=0';
	}

	return returnValue + ':' + buffer.toString('base64') + BEL;
};

ansiEscapes.iTerm = {
	setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,

	annotation: (message, options = {}) => {
		let returnValue = `${OSC}1337;`;

		const hasX = typeof options.x !== 'undefined';
		const hasY = typeof options.y !== 'undefined';
		if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== 'undefined')) {
			throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
		}

		message = message.replace(/\|/g, '');

		returnValue += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation=';

		if (options.length > 0) {
			returnValue +=
					(hasX ?
						[message, options.length, options.x, options.y] :
						[options.length, message]).join('|');
		} else {
			returnValue += message;
		}

		return returnValue + BEL;
	}
};

var onetime$1 = {exports: {}};

var mimicFn = {exports: {}};

var hasRequiredMimicFn;

function requireMimicFn () {
	if (hasRequiredMimicFn) return mimicFn.exports;
	hasRequiredMimicFn = 1;

	const mimicFn$1 = (to, from) => {
		for (const prop of Reflect.ownKeys(from)) {
			Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
		}

		return to;
	};

	mimicFn.exports = mimicFn$1;
	// TODO: Remove this for the next major release
	mimicFn.exports.default = mimicFn$1;
	return mimicFn.exports;
}

var hasRequiredOnetime;

function requireOnetime () {
	if (hasRequiredOnetime) return onetime$1.exports;
	hasRequiredOnetime = 1;
	const mimicFn = requireMimicFn();

	const calledFunctions = new WeakMap();

	const onetime = (function_, options = {}) => {
		if (typeof function_ !== 'function') {
			throw new TypeError('Expected a function');
		}

		let returnValue;
		let callCount = 0;
		const functionName = function_.displayName || function_.name || '<anonymous>';

		const onetime = function (...arguments_) {
			calledFunctions.set(onetime, ++callCount);

			if (callCount === 1) {
				returnValue = function_.apply(this, arguments_);
				function_ = null;
			} else if (options.throw === true) {
				throw new Error(`Function \`${functionName}\` can only be called once`);
			}

			return returnValue;
		};

		mimicFn(onetime, function_);
		calledFunctions.set(onetime, callCount);

		return onetime;
	};

	onetime$1.exports = onetime;
	// TODO: Remove this for the next major release
	onetime$1.exports.default = onetime;

	onetime$1.exports.callCount = function_ => {
		if (!calledFunctions.has(function_)) {
			throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
		}

		return calledFunctions.get(function_);
	};
	return onetime$1.exports;
}

var onetimeExports = requireOnetime();
var onetime = /*@__PURE__*/getDefaultExportFromCjs(onetimeExports);

var signalExit$1 = {exports: {}};

var signals = {exports: {}};

var hasRequiredSignals;

function requireSignals () {
	if (hasRequiredSignals) return signals.exports;
	hasRequiredSignals = 1;
	(function (module) {
		// This is not the set of all possible signals.
		//
		// It IS, however, the set of all signals that trigger
		// an exit on either Linux or BSD systems.  Linux is a
		// superset of the signal names supported on BSD, and
		// the unknown signals just fail to register, so we can
		// catch that easily enough.
		//
		// Don't bother with SIGKILL.  It's uncatchable, which
		// means that we can't fire any callbacks anyway.
		//
		// If a user does happen to register a handler on a non-
		// fatal signal like SIGWINCH or something, and then
		// exit, it'll end up firing `process.emit('exit')`, so
		// the handler will be fired anyway.
		//
		// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
		// artificially, inherently leave the process in a
		// state from which it is not safe to try and enter JS
		// listeners.
		module.exports = [
		  'SIGABRT',
		  'SIGALRM',
		  'SIGHUP',
		  'SIGINT',
		  'SIGTERM'
		];

		if (process.platform !== 'win32') {
		  module.exports.push(
		    'SIGVTALRM',
		    'SIGXCPU',
		    'SIGXFSZ',
		    'SIGUSR2',
		    'SIGTRAP',
		    'SIGSYS',
		    'SIGQUIT',
		    'SIGIOT'
		    // should detect profiler and enable/disable accordingly.
		    // see #21
		    // 'SIGPROF'
		  );
		}

		if (process.platform === 'linux') {
		  module.exports.push(
		    'SIGIO',
		    'SIGPOLL',
		    'SIGPWR',
		    'SIGSTKFLT',
		    'SIGUNUSED'
		  );
		} 
	} (signals));
	return signals.exports;
}

var hasRequiredSignalExit;

function requireSignalExit () {
	if (hasRequiredSignalExit) return signalExit$1.exports;
	hasRequiredSignalExit = 1;
	// Note: since nyc uses this module to output coverage, any lines
	// that are in the direct sync flow of nyc's outputCoverage are
	// ignored, since we can never get coverage for them.
	// grab a reference to node's real process object right away
	var process = commonjsGlobal.process;

	const processOk = function (process) {
	  return process &&
	    typeof process === 'object' &&
	    typeof process.removeListener === 'function' &&
	    typeof process.emit === 'function' &&
	    typeof process.reallyExit === 'function' &&
	    typeof process.listeners === 'function' &&
	    typeof process.kill === 'function' &&
	    typeof process.pid === 'number' &&
	    typeof process.on === 'function'
	};

	// some kind of non-node environment, just no-op
	/* istanbul ignore if */
	if (!processOk(process)) {
	  signalExit$1.exports = function () {
	    return function () {}
	  };
	} else {
	  var assert = require$$0;
	  var signals = requireSignals();
	  var isWin = /^win/i.test(process.platform);

	  var EE = require$$0$1;
	  /* istanbul ignore if */
	  if (typeof EE !== 'function') {
	    EE = EE.EventEmitter;
	  }

	  var emitter;
	  if (process.__signal_exit_emitter__) {
	    emitter = process.__signal_exit_emitter__;
	  } else {
	    emitter = process.__signal_exit_emitter__ = new EE();
	    emitter.count = 0;
	    emitter.emitted = {};
	  }

	  // Because this emitter is a global, we have to check to see if a
	  // previous version of this library failed to enable infinite listeners.
	  // I know what you're about to say.  But literally everything about
	  // signal-exit is a compromise with evil.  Get used to it.
	  if (!emitter.infinite) {
	    emitter.setMaxListeners(Infinity);
	    emitter.infinite = true;
	  }

	  signalExit$1.exports = function (cb, opts) {
	    /* istanbul ignore if */
	    if (!processOk(commonjsGlobal.process)) {
	      return function () {}
	    }
	    assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

	    if (loaded === false) {
	      load();
	    }

	    var ev = 'exit';
	    if (opts && opts.alwaysLast) {
	      ev = 'afterexit';
	    }

	    var remove = function () {
	      emitter.removeListener(ev, cb);
	      if (emitter.listeners('exit').length === 0 &&
	          emitter.listeners('afterexit').length === 0) {
	        unload();
	      }
	    };
	    emitter.on(ev, cb);

	    return remove
	  };

	  var unload = function unload () {
	    if (!loaded || !processOk(commonjsGlobal.process)) {
	      return
	    }
	    loaded = false;

	    signals.forEach(function (sig) {
	      try {
	        process.removeListener(sig, sigListeners[sig]);
	      } catch (er) {}
	    });
	    process.emit = originalProcessEmit;
	    process.reallyExit = originalProcessReallyExit;
	    emitter.count -= 1;
	  };
	  signalExit$1.exports.unload = unload;

	  var emit = function emit (event, code, signal) {
	    /* istanbul ignore if */
	    if (emitter.emitted[event]) {
	      return
	    }
	    emitter.emitted[event] = true;
	    emitter.emit(event, code, signal);
	  };

	  // { <signal>: <listener fn>, ... }
	  var sigListeners = {};
	  signals.forEach(function (sig) {
	    sigListeners[sig] = function listener () {
	      /* istanbul ignore if */
	      if (!processOk(commonjsGlobal.process)) {
	        return
	      }
	      // If there are no other listeners, an exit is coming!
	      // Simplest way: remove us and then re-send the signal.
	      // We know that this will kill the process, so we can
	      // safely emit now.
	      var listeners = process.listeners(sig);
	      if (listeners.length === emitter.count) {
	        unload();
	        emit('exit', null, sig);
	        /* istanbul ignore next */
	        emit('afterexit', null, sig);
	        /* istanbul ignore next */
	        if (isWin && sig === 'SIGHUP') {
	          // "SIGHUP" throws an `ENOSYS` error on Windows,
	          // so use a supported signal instead
	          sig = 'SIGINT';
	        }
	        /* istanbul ignore next */
	        process.kill(process.pid, sig);
	      }
	    };
	  });

	  signalExit$1.exports.signals = function () {
	    return signals
	  };

	  var loaded = false;

	  var load = function load () {
	    if (loaded || !processOk(commonjsGlobal.process)) {
	      return
	    }
	    loaded = true;

	    // This is the number of onSignalExit's that are in play.
	    // It's important so that we can count the correct number of
	    // listeners on signals, and don't wait for the other one to
	    // handle it instead of us.
	    emitter.count += 1;

	    signals = signals.filter(function (sig) {
	      try {
	        process.on(sig, sigListeners[sig]);
	        return true
	      } catch (er) {
	        return false
	      }
	    });

	    process.emit = processEmit;
	    process.reallyExit = processReallyExit;
	  };
	  signalExit$1.exports.load = load;

	  var originalProcessReallyExit = process.reallyExit;
	  var processReallyExit = function processReallyExit (code) {
	    /* istanbul ignore if */
	    if (!processOk(commonjsGlobal.process)) {
	      return
	    }
	    process.exitCode = code || /* istanbul ignore next */ 0;
	    emit('exit', process.exitCode, null);
	    /* istanbul ignore next */
	    emit('afterexit', process.exitCode, null);
	    /* istanbul ignore next */
	    originalProcessReallyExit.call(process, process.exitCode);
	  };

	  var originalProcessEmit = process.emit;
	  var processEmit = function processEmit (ev, arg) {
	    if (ev === 'exit' && processOk(commonjsGlobal.process)) {
	      /* istanbul ignore else */
	      if (arg !== undefined) {
	        process.exitCode = arg;
	      }
	      var ret = originalProcessEmit.apply(this, arguments);
	      /* istanbul ignore next */
	      emit('exit', process.exitCode, null);
	      /* istanbul ignore next */
	      emit('afterexit', process.exitCode, null);
	      /* istanbul ignore next */
	      return ret
	    } else {
	      return originalProcessEmit.apply(this, arguments)
	    }
	  };
	}
	return signalExit$1.exports;
}

var signalExitExports = requireSignalExit();
var signalExit = /*@__PURE__*/getDefaultExportFromCjs(signalExitExports);

const restoreCursor = onetime(() => {
	signalExit(() => {
		process$1.stderr.write('\u001B[?25h');
	}, {alwaysLast: true});
});

let isHidden = false;

const cliCursor = {};

cliCursor.show = (writableStream = process$1.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	isHidden = false;
	writableStream.write('\u001B[?25h');
};

cliCursor.hide = (writableStream = process$1.stderr) => {
	if (!writableStream.isTTY) {
		return;
	}

	restoreCursor();
	isHidden = true;
	writableStream.write('\u001B[?25l');
};

cliCursor.toggle = (force, writableStream) => {
	if (force !== undefined) {
		isHidden = force;
	}

	if (isHidden) {
		cliCursor.show(writableStream);
	} else {
		cliCursor.hide(writableStream);
	}
};

function ansiRegex({onlyFirst = false} = {}) {
	const pattern = [
	    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

const regex = ansiRegex();

function stripAnsi(string) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
	}

	// Even though the regex is global, we don't need to reset the `.lastIndex`
	// because unlike `.exec()` and `.test()`, `.replace()` does it automatically
	// and doing it manually has a performance penalty.
	return string.replace(regex, '');
}

var eastasianwidth = {exports: {}};

var hasRequiredEastasianwidth;

function requireEastasianwidth () {
	if (hasRequiredEastasianwidth) return eastasianwidth.exports;
	hasRequiredEastasianwidth = 1;
	(function (module) {
		var eaw = {};

		{
		  module.exports = eaw;
		}

		eaw.eastAsianWidth = function(character) {
		  var x = character.charCodeAt(0);
		  var y = (character.length == 2) ? character.charCodeAt(1) : 0;
		  var codePoint = x;
		  if ((0xD800 <= x && x <= 0xDBFF) && (0xDC00 <= y && y <= 0xDFFF)) {
		    x &= 0x3FF;
		    y &= 0x3FF;
		    codePoint = (x << 10) | y;
		    codePoint += 0x10000;
		  }

		  if ((0x3000 == codePoint) ||
		      (0xFF01 <= codePoint && codePoint <= 0xFF60) ||
		      (0xFFE0 <= codePoint && codePoint <= 0xFFE6)) {
		    return 'F';
		  }
		  if ((0x20A9 == codePoint) ||
		      (0xFF61 <= codePoint && codePoint <= 0xFFBE) ||
		      (0xFFC2 <= codePoint && codePoint <= 0xFFC7) ||
		      (0xFFCA <= codePoint && codePoint <= 0xFFCF) ||
		      (0xFFD2 <= codePoint && codePoint <= 0xFFD7) ||
		      (0xFFDA <= codePoint && codePoint <= 0xFFDC) ||
		      (0xFFE8 <= codePoint && codePoint <= 0xFFEE)) {
		    return 'H';
		  }
		  if ((0x1100 <= codePoint && codePoint <= 0x115F) ||
		      (0x11A3 <= codePoint && codePoint <= 0x11A7) ||
		      (0x11FA <= codePoint && codePoint <= 0x11FF) ||
		      (0x2329 <= codePoint && codePoint <= 0x232A) ||
		      (0x2E80 <= codePoint && codePoint <= 0x2E99) ||
		      (0x2E9B <= codePoint && codePoint <= 0x2EF3) ||
		      (0x2F00 <= codePoint && codePoint <= 0x2FD5) ||
		      (0x2FF0 <= codePoint && codePoint <= 0x2FFB) ||
		      (0x3001 <= codePoint && codePoint <= 0x303E) ||
		      (0x3041 <= codePoint && codePoint <= 0x3096) ||
		      (0x3099 <= codePoint && codePoint <= 0x30FF) ||
		      (0x3105 <= codePoint && codePoint <= 0x312D) ||
		      (0x3131 <= codePoint && codePoint <= 0x318E) ||
		      (0x3190 <= codePoint && codePoint <= 0x31BA) ||
		      (0x31C0 <= codePoint && codePoint <= 0x31E3) ||
		      (0x31F0 <= codePoint && codePoint <= 0x321E) ||
		      (0x3220 <= codePoint && codePoint <= 0x3247) ||
		      (0x3250 <= codePoint && codePoint <= 0x32FE) ||
		      (0x3300 <= codePoint && codePoint <= 0x4DBF) ||
		      (0x4E00 <= codePoint && codePoint <= 0xA48C) ||
		      (0xA490 <= codePoint && codePoint <= 0xA4C6) ||
		      (0xA960 <= codePoint && codePoint <= 0xA97C) ||
		      (0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
		      (0xD7B0 <= codePoint && codePoint <= 0xD7C6) ||
		      (0xD7CB <= codePoint && codePoint <= 0xD7FB) ||
		      (0xF900 <= codePoint && codePoint <= 0xFAFF) ||
		      (0xFE10 <= codePoint && codePoint <= 0xFE19) ||
		      (0xFE30 <= codePoint && codePoint <= 0xFE52) ||
		      (0xFE54 <= codePoint && codePoint <= 0xFE66) ||
		      (0xFE68 <= codePoint && codePoint <= 0xFE6B) ||
		      (0x1B000 <= codePoint && codePoint <= 0x1B001) ||
		      (0x1F200 <= codePoint && codePoint <= 0x1F202) ||
		      (0x1F210 <= codePoint && codePoint <= 0x1F23A) ||
		      (0x1F240 <= codePoint && codePoint <= 0x1F248) ||
		      (0x1F250 <= codePoint && codePoint <= 0x1F251) ||
		      (0x20000 <= codePoint && codePoint <= 0x2F73F) ||
		      (0x2B740 <= codePoint && codePoint <= 0x2FFFD) ||
		      (0x30000 <= codePoint && codePoint <= 0x3FFFD)) {
		    return 'W';
		  }
		  if ((0x0020 <= codePoint && codePoint <= 0x007E) ||
		      (0x00A2 <= codePoint && codePoint <= 0x00A3) ||
		      (0x00A5 <= codePoint && codePoint <= 0x00A6) ||
		      (0x00AC == codePoint) ||
		      (0x00AF == codePoint) ||
		      (0x27E6 <= codePoint && codePoint <= 0x27ED) ||
		      (0x2985 <= codePoint && codePoint <= 0x2986)) {
		    return 'Na';
		  }
		  if ((0x00A1 == codePoint) ||
		      (0x00A4 == codePoint) ||
		      (0x00A7 <= codePoint && codePoint <= 0x00A8) ||
		      (0x00AA == codePoint) ||
		      (0x00AD <= codePoint && codePoint <= 0x00AE) ||
		      (0x00B0 <= codePoint && codePoint <= 0x00B4) ||
		      (0x00B6 <= codePoint && codePoint <= 0x00BA) ||
		      (0x00BC <= codePoint && codePoint <= 0x00BF) ||
		      (0x00C6 == codePoint) ||
		      (0x00D0 == codePoint) ||
		      (0x00D7 <= codePoint && codePoint <= 0x00D8) ||
		      (0x00DE <= codePoint && codePoint <= 0x00E1) ||
		      (0x00E6 == codePoint) ||
		      (0x00E8 <= codePoint && codePoint <= 0x00EA) ||
		      (0x00EC <= codePoint && codePoint <= 0x00ED) ||
		      (0x00F0 == codePoint) ||
		      (0x00F2 <= codePoint && codePoint <= 0x00F3) ||
		      (0x00F7 <= codePoint && codePoint <= 0x00FA) ||
		      (0x00FC == codePoint) ||
		      (0x00FE == codePoint) ||
		      (0x0101 == codePoint) ||
		      (0x0111 == codePoint) ||
		      (0x0113 == codePoint) ||
		      (0x011B == codePoint) ||
		      (0x0126 <= codePoint && codePoint <= 0x0127) ||
		      (0x012B == codePoint) ||
		      (0x0131 <= codePoint && codePoint <= 0x0133) ||
		      (0x0138 == codePoint) ||
		      (0x013F <= codePoint && codePoint <= 0x0142) ||
		      (0x0144 == codePoint) ||
		      (0x0148 <= codePoint && codePoint <= 0x014B) ||
		      (0x014D == codePoint) ||
		      (0x0152 <= codePoint && codePoint <= 0x0153) ||
		      (0x0166 <= codePoint && codePoint <= 0x0167) ||
		      (0x016B == codePoint) ||
		      (0x01CE == codePoint) ||
		      (0x01D0 == codePoint) ||
		      (0x01D2 == codePoint) ||
		      (0x01D4 == codePoint) ||
		      (0x01D6 == codePoint) ||
		      (0x01D8 == codePoint) ||
		      (0x01DA == codePoint) ||
		      (0x01DC == codePoint) ||
		      (0x0251 == codePoint) ||
		      (0x0261 == codePoint) ||
		      (0x02C4 == codePoint) ||
		      (0x02C7 == codePoint) ||
		      (0x02C9 <= codePoint && codePoint <= 0x02CB) ||
		      (0x02CD == codePoint) ||
		      (0x02D0 == codePoint) ||
		      (0x02D8 <= codePoint && codePoint <= 0x02DB) ||
		      (0x02DD == codePoint) ||
		      (0x02DF == codePoint) ||
		      (0x0300 <= codePoint && codePoint <= 0x036F) ||
		      (0x0391 <= codePoint && codePoint <= 0x03A1) ||
		      (0x03A3 <= codePoint && codePoint <= 0x03A9) ||
		      (0x03B1 <= codePoint && codePoint <= 0x03C1) ||
		      (0x03C3 <= codePoint && codePoint <= 0x03C9) ||
		      (0x0401 == codePoint) ||
		      (0x0410 <= codePoint && codePoint <= 0x044F) ||
		      (0x0451 == codePoint) ||
		      (0x2010 == codePoint) ||
		      (0x2013 <= codePoint && codePoint <= 0x2016) ||
		      (0x2018 <= codePoint && codePoint <= 0x2019) ||
		      (0x201C <= codePoint && codePoint <= 0x201D) ||
		      (0x2020 <= codePoint && codePoint <= 0x2022) ||
		      (0x2024 <= codePoint && codePoint <= 0x2027) ||
		      (0x2030 == codePoint) ||
		      (0x2032 <= codePoint && codePoint <= 0x2033) ||
		      (0x2035 == codePoint) ||
		      (0x203B == codePoint) ||
		      (0x203E == codePoint) ||
		      (0x2074 == codePoint) ||
		      (0x207F == codePoint) ||
		      (0x2081 <= codePoint && codePoint <= 0x2084) ||
		      (0x20AC == codePoint) ||
		      (0x2103 == codePoint) ||
		      (0x2105 == codePoint) ||
		      (0x2109 == codePoint) ||
		      (0x2113 == codePoint) ||
		      (0x2116 == codePoint) ||
		      (0x2121 <= codePoint && codePoint <= 0x2122) ||
		      (0x2126 == codePoint) ||
		      (0x212B == codePoint) ||
		      (0x2153 <= codePoint && codePoint <= 0x2154) ||
		      (0x215B <= codePoint && codePoint <= 0x215E) ||
		      (0x2160 <= codePoint && codePoint <= 0x216B) ||
		      (0x2170 <= codePoint && codePoint <= 0x2179) ||
		      (0x2189 == codePoint) ||
		      (0x2190 <= codePoint && codePoint <= 0x2199) ||
		      (0x21B8 <= codePoint && codePoint <= 0x21B9) ||
		      (0x21D2 == codePoint) ||
		      (0x21D4 == codePoint) ||
		      (0x21E7 == codePoint) ||
		      (0x2200 == codePoint) ||
		      (0x2202 <= codePoint && codePoint <= 0x2203) ||
		      (0x2207 <= codePoint && codePoint <= 0x2208) ||
		      (0x220B == codePoint) ||
		      (0x220F == codePoint) ||
		      (0x2211 == codePoint) ||
		      (0x2215 == codePoint) ||
		      (0x221A == codePoint) ||
		      (0x221D <= codePoint && codePoint <= 0x2220) ||
		      (0x2223 == codePoint) ||
		      (0x2225 == codePoint) ||
		      (0x2227 <= codePoint && codePoint <= 0x222C) ||
		      (0x222E == codePoint) ||
		      (0x2234 <= codePoint && codePoint <= 0x2237) ||
		      (0x223C <= codePoint && codePoint <= 0x223D) ||
		      (0x2248 == codePoint) ||
		      (0x224C == codePoint) ||
		      (0x2252 == codePoint) ||
		      (0x2260 <= codePoint && codePoint <= 0x2261) ||
		      (0x2264 <= codePoint && codePoint <= 0x2267) ||
		      (0x226A <= codePoint && codePoint <= 0x226B) ||
		      (0x226E <= codePoint && codePoint <= 0x226F) ||
		      (0x2282 <= codePoint && codePoint <= 0x2283) ||
		      (0x2286 <= codePoint && codePoint <= 0x2287) ||
		      (0x2295 == codePoint) ||
		      (0x2299 == codePoint) ||
		      (0x22A5 == codePoint) ||
		      (0x22BF == codePoint) ||
		      (0x2312 == codePoint) ||
		      (0x2460 <= codePoint && codePoint <= 0x24E9) ||
		      (0x24EB <= codePoint && codePoint <= 0x254B) ||
		      (0x2550 <= codePoint && codePoint <= 0x2573) ||
		      (0x2580 <= codePoint && codePoint <= 0x258F) ||
		      (0x2592 <= codePoint && codePoint <= 0x2595) ||
		      (0x25A0 <= codePoint && codePoint <= 0x25A1) ||
		      (0x25A3 <= codePoint && codePoint <= 0x25A9) ||
		      (0x25B2 <= codePoint && codePoint <= 0x25B3) ||
		      (0x25B6 <= codePoint && codePoint <= 0x25B7) ||
		      (0x25BC <= codePoint && codePoint <= 0x25BD) ||
		      (0x25C0 <= codePoint && codePoint <= 0x25C1) ||
		      (0x25C6 <= codePoint && codePoint <= 0x25C8) ||
		      (0x25CB == codePoint) ||
		      (0x25CE <= codePoint && codePoint <= 0x25D1) ||
		      (0x25E2 <= codePoint && codePoint <= 0x25E5) ||
		      (0x25EF == codePoint) ||
		      (0x2605 <= codePoint && codePoint <= 0x2606) ||
		      (0x2609 == codePoint) ||
		      (0x260E <= codePoint && codePoint <= 0x260F) ||
		      (0x2614 <= codePoint && codePoint <= 0x2615) ||
		      (0x261C == codePoint) ||
		      (0x261E == codePoint) ||
		      (0x2640 == codePoint) ||
		      (0x2642 == codePoint) ||
		      (0x2660 <= codePoint && codePoint <= 0x2661) ||
		      (0x2663 <= codePoint && codePoint <= 0x2665) ||
		      (0x2667 <= codePoint && codePoint <= 0x266A) ||
		      (0x266C <= codePoint && codePoint <= 0x266D) ||
		      (0x266F == codePoint) ||
		      (0x269E <= codePoint && codePoint <= 0x269F) ||
		      (0x26BE <= codePoint && codePoint <= 0x26BF) ||
		      (0x26C4 <= codePoint && codePoint <= 0x26CD) ||
		      (0x26CF <= codePoint && codePoint <= 0x26E1) ||
		      (0x26E3 == codePoint) ||
		      (0x26E8 <= codePoint && codePoint <= 0x26FF) ||
		      (0x273D == codePoint) ||
		      (0x2757 == codePoint) ||
		      (0x2776 <= codePoint && codePoint <= 0x277F) ||
		      (0x2B55 <= codePoint && codePoint <= 0x2B59) ||
		      (0x3248 <= codePoint && codePoint <= 0x324F) ||
		      (0xE000 <= codePoint && codePoint <= 0xF8FF) ||
		      (0xFE00 <= codePoint && codePoint <= 0xFE0F) ||
		      (0xFFFD == codePoint) ||
		      (0x1F100 <= codePoint && codePoint <= 0x1F10A) ||
		      (0x1F110 <= codePoint && codePoint <= 0x1F12D) ||
		      (0x1F130 <= codePoint && codePoint <= 0x1F169) ||
		      (0x1F170 <= codePoint && codePoint <= 0x1F19A) ||
		      (0xE0100 <= codePoint && codePoint <= 0xE01EF) ||
		      (0xF0000 <= codePoint && codePoint <= 0xFFFFD) ||
		      (0x100000 <= codePoint && codePoint <= 0x10FFFD)) {
		    return 'A';
		  }

		  return 'N';
		};

		eaw.characterLength = function(character) {
		  var code = this.eastAsianWidth(character);
		  if (code == 'F' || code == 'W' || code == 'A') {
		    return 2;
		  } else {
		    return 1;
		  }
		};

		// Split a string considering surrogate-pairs.
		function stringToArray(string) {
		  return string.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || [];
		}

		eaw.length = function(string) {
		  var characters = stringToArray(string);
		  var len = 0;
		  for (var i = 0; i < characters.length; i++) {
		    len = len + this.characterLength(characters[i]);
		  }
		  return len;
		};

		eaw.slice = function(text, start, end) {
		  textLen = eaw.length(text);
		  start = start ? start : 0;
		  end = end ? end : 1;
		  if (start < 0) {
		      start = textLen + start;
		  }
		  if (end < 0) {
		      end = textLen + end;
		  }
		  var result = '';
		  var eawLen = 0;
		  var chars = stringToArray(text);
		  for (var i = 0; i < chars.length; i++) {
		    var char = chars[i];
		    var charLen = eaw.length(char);
		    if (eawLen >= start - (charLen == 2 ? 1 : 0)) {
		        if (eawLen + charLen <= end) {
		            result += char;
		        } else {
		            break;
		        }
		    }
		    eawLen += charLen;
		  }
		  return result;
		}; 
	} (eastasianwidth));
	return eastasianwidth.exports;
}

var eastasianwidthExports = requireEastasianwidth();
var eastAsianWidth$1 = /*@__PURE__*/getDefaultExportFromCjs(eastasianwidthExports);

var emojiRegex$2;
var hasRequiredEmojiRegex;

function requireEmojiRegex () {
	if (hasRequiredEmojiRegex) return emojiRegex$2;
	hasRequiredEmojiRegex = 1;

	emojiRegex$2 = function () {
	  // https://mths.be/emoji
	  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
	};
	return emojiRegex$2;
}

var emojiRegexExports = requireEmojiRegex();
var emojiRegex$1 = /*@__PURE__*/getDefaultExportFromCjs(emojiRegexExports);

function stringWidth$1(string, options = {}) {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	options = {
		ambiguousIsNarrow: true,
		...options
	};

	string = stripAnsi(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex$1(), '  ');

	const ambiguousCharacterWidth = options.ambiguousIsNarrow ? 1 : 2;
	let width = 0;

	for (const character of string) {
		const codePoint = character.codePointAt(0);

		// Ignore control characters
		if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (codePoint >= 0x300 && codePoint <= 0x36F) {
			continue;
		}

		const code = eastAsianWidth$1.eastAsianWidth(character);
		switch (code) {
			case 'F':
			case 'W':
				width += 2;
				break;
			case 'A':
				width += ambiguousCharacterWidth;
				break;
			default:
				width += 1;
		}
	}

	return width;
}

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

Object.keys(styles.modifier);
const foregroundColorNames = Object.keys(styles.color);
const backgroundColorNames = Object.keys(styles.bgColor);
[...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value: (red, green, blue) => {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value: hex => {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value: code => {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

const ESCAPES$1 = new Set([
	'\u001B',
	'\u009B',
]);

const END_CODE = 39;
const ANSI_ESCAPE_BELL = '\u0007';
const ANSI_CSI = '[';
const ANSI_OSC = ']';
const ANSI_SGR_TERMINATOR = 'm';
const ANSI_ESCAPE_LINK = `${ANSI_OSC}8;;`;

const wrapAnsiCode = code => `${ESCAPES$1.values().next().value}${ANSI_CSI}${code}${ANSI_SGR_TERMINATOR}`;
const wrapAnsiHyperlink = uri => `${ESCAPES$1.values().next().value}${ANSI_ESCAPE_LINK}${uri}${ANSI_ESCAPE_BELL}`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths = string => string.split(' ').map(character => stringWidth$1(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let isInsideLinkEscape = false;
	let visible = stringWidth$1(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth$1(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES$1.has(character)) {
			isInsideEscape = true;
			isInsideLinkEscape = characters.slice(index + 1).join('').startsWith(ANSI_ESCAPE_LINK);
		}

		if (isInsideEscape) {
			if (isInsideLinkEscape) {
				if (character === ANSI_ESCAPE_BELL) {
					isInsideEscape = false;
					isInsideLinkEscape = false;
				}
			} else if (character === ANSI_SGR_TERMINATOR) {
				isInsideEscape = false;
			}

			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight = string => {
	const words = string.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth$1(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return string;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let returnValue = '';
	let escapeCode;
	let escapeUrl;

	const lengths = wordLengths(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimStart();
		}

		let rowLength = stringWidth$1(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(row => stringVisibleTrimSpacesRight(row));
	}

	const pre = [...rows.join('\n')];

	for (const [index, character] of pre.entries()) {
		returnValue += character;

		if (ESCAPES$1.has(character)) {
			const {groups} = new RegExp(`(?:\\${ANSI_CSI}(?<code>\\d+)m|\\${ANSI_ESCAPE_LINK}(?<uri>.*)${ANSI_ESCAPE_BELL})`).exec(pre.slice(index).join('')) || {groups: {}};
			if (groups.code !== undefined) {
				const code = Number.parseFloat(groups.code);
				escapeCode = code === END_CODE ? undefined : code;
			} else if (groups.uri !== undefined) {
				escapeUrl = groups.uri.length === 0 ? undefined : groups.uri;
			}
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (pre[index + 1] === '\n') {
			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink('');
			}

			if (escapeCode && code) {
				returnValue += wrapAnsiCode(code);
			}
		} else if (character === '\n') {
			if (escapeCode && code) {
				returnValue += wrapAnsiCode(escapeCode);
			}

			if (escapeUrl) {
				returnValue += wrapAnsiHyperlink(escapeUrl);
			}
		}
	}

	return returnValue;
};

// For each newline, invoke the method separately
function wrapAnsi$1(string, columns, options) {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec(line, columns, options))
		.join('\n');
}

/* eslint-disable yoda */

function isFullwidthCodePoint(codePoint) {
	if (!Number.isInteger(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// https://unicode.org/Public/UNIDATA/EastAsianWidth.txt
	return codePoint >= 0x1100 && (
		codePoint <= 0x115F || // Hangul Jamo
		codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
		// CJK Unified Ideographs .. Yi Radicals
		(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
		// Hangul Jamo Extended-A
		(0xA960 <= codePoint && codePoint <= 0xA97C) ||
		// Hangul Syllables
		(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
		// CJK Compatibility Ideographs
		(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
		// Vertical Forms
		(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
		// CJK Compatibility Forms .. Small Form Variants
		(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
		// Halfwidth and Fullwidth Forms
		(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
		(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
		// Kana Supplement
		(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
		// Enclosed Ideographic Supplement
		(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		(0x20000 <= codePoint && codePoint <= 0x3FFFD)
	);
}

const astralRegex = /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/;

const ESCAPES = [
	'\u001B',
	'\u009B'
];

const wrapAnsi = code => `${ESCAPES[0]}[${code}m`;

const checkAnsi = (ansiCodes, isEscapes, endAnsiCode) => {
	let output = [];
	ansiCodes = [...ansiCodes];

	for (let ansiCode of ansiCodes) {
		const ansiCodeOrigin = ansiCode;
		if (ansiCode.includes(';')) {
			ansiCode = ansiCode.split(';')[0][0] + '0';
		}

		const item = ansiStyles.codes.get(Number.parseInt(ansiCode, 10));
		if (item) {
			const indexEscape = ansiCodes.indexOf(item.toString());
			if (indexEscape === -1) {
				output.push(wrapAnsi(isEscapes ? item : ansiCodeOrigin));
			} else {
				ansiCodes.splice(indexEscape, 1);
			}
		} else if (isEscapes) {
			output.push(wrapAnsi(0));
			break;
		} else {
			output.push(wrapAnsi(ansiCodeOrigin));
		}
	}

	if (isEscapes) {
		output = output.filter((element, index) => output.indexOf(element) === index);

		if (endAnsiCode !== undefined) {
			const fistEscapeCode = wrapAnsi(ansiStyles.codes.get(Number.parseInt(endAnsiCode, 10)));
			// TODO: Remove the use of `.reduce` here.
			// eslint-disable-next-line unicorn/no-array-reduce
			output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
		}
	}

	return output.join('');
};

function sliceAnsi(string, begin, end) {
	const characters = [...string];
	const ansiCodes = [];

	let stringEnd = typeof end === 'number' ? end : characters.length;
	let isInsideEscape = false;
	let ansiCode;
	let visible = 0;
	let output = '';

	for (const [index, character] of characters.entries()) {
		let leftEscape = false;

		if (ESCAPES.includes(character)) {
			const code = /\d[^m]*/.exec(string.slice(index, index + 18));
			ansiCode = code && code.length > 0 ? code[0] : undefined;

			if (visible < stringEnd) {
				isInsideEscape = true;

				if (ansiCode !== undefined) {
					ansiCodes.push(ansiCode);
				}
			}
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			leftEscape = true;
		}

		if (!isInsideEscape && !leftEscape) {
			visible++;
		}

		if (!astralRegex.test(character) && isFullwidthCodePoint(character.codePointAt())) {
			visible++;

			if (typeof end !== 'number') {
				stringEnd++;
			}
		}

		if (visible > begin && visible <= stringEnd) {
			output += character;
		} else if (visible === begin && !isInsideEscape && ansiCode !== undefined) {
			output = checkAnsi(ansiCodes);
		} else if (visible >= stringEnd) {
			output += checkAnsi(ansiCodes, true, ansiCode);
			break;
		}
	}

	return output;
}

const defaultTerminalHeight = 24;

const getWidth = stream => {
	const {columns} = stream;

	if (!columns) {
		return 80;
	}

	return columns;
};

const fitToTerminalHeight = (stream, text) => {
	const terminalHeight = stream.rows || defaultTerminalHeight;
	const lines = text.split('\n');

	const toRemove = lines.length - terminalHeight;
	if (toRemove <= 0) {
		return text;
	}

	return sliceAnsi(
		text,
		stripAnsi(lines.slice(0, toRemove).join('\n')).length + 1,
	);
};

function createLogUpdate(stream, {showCursor = false} = {}) {
	let previousLineCount = 0;
	let previousWidth = getWidth(stream);
	let previousOutput = '';

	const render = (...arguments_) => {
		if (!showCursor) {
			cliCursor.hide();
		}

		let output = arguments_.join(' ') + '\n';
		output = fitToTerminalHeight(stream, output);
		const width = getWidth(stream);
		if (output === previousOutput && previousWidth === width) {
			return;
		}

		previousOutput = output;
		previousWidth = width;
		output = wrapAnsi$1(output, width, {
			trim: false,
			hard: true,
			wordWrap: false,
		});
		stream.write(ansiEscapes.eraseLines(previousLineCount) + output);
		previousLineCount = output.split('\n').length;
	};

	render.clear = () => {
		stream.write(ansiEscapes.eraseLines(previousLineCount));
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;
	};

	render.done = () => {
		previousOutput = '';
		previousWidth = getWidth(stream);
		previousLineCount = 0;

		if (!showCursor) {
			cliCursor.show();
		}
	};

	return render;
}

createLogUpdate(process$1.stdout);

createLogUpdate(process$1.stderr);

const HIGHLIGHT_SUPPORTED_EXTS = new Set(
  ["js", "ts"].flatMap((lang) => [
    `.${lang}`,
    `.m${lang}`,
    `.c${lang}`,
    `.${lang}x`,
    `.m${lang}x`,
    `.c${lang}x`
  ])
);
function highlightCode(id, source, colors) {
  const ext = extname(id);
  if (!HIGHLIGHT_SUPPORTED_EXTS.has(ext)) {
    return source;
  }
  const isJsx = ext.endsWith("x");
  return highlight(source, { jsx: isJsx, colors: c });
}

// Generated code.

function isAmbiguous(x) {
	return x === 0xA1
		|| x === 0xA4
		|| x === 0xA7
		|| x === 0xA8
		|| x === 0xAA
		|| x === 0xAD
		|| x === 0xAE
		|| x >= 0xB0 && x <= 0xB4
		|| x >= 0xB6 && x <= 0xBA
		|| x >= 0xBC && x <= 0xBF
		|| x === 0xC6
		|| x === 0xD0
		|| x === 0xD7
		|| x === 0xD8
		|| x >= 0xDE && x <= 0xE1
		|| x === 0xE6
		|| x >= 0xE8 && x <= 0xEA
		|| x === 0xEC
		|| x === 0xED
		|| x === 0xF0
		|| x === 0xF2
		|| x === 0xF3
		|| x >= 0xF7 && x <= 0xFA
		|| x === 0xFC
		|| x === 0xFE
		|| x === 0x101
		|| x === 0x111
		|| x === 0x113
		|| x === 0x11B
		|| x === 0x126
		|| x === 0x127
		|| x === 0x12B
		|| x >= 0x131 && x <= 0x133
		|| x === 0x138
		|| x >= 0x13F && x <= 0x142
		|| x === 0x144
		|| x >= 0x148 && x <= 0x14B
		|| x === 0x14D
		|| x === 0x152
		|| x === 0x153
		|| x === 0x166
		|| x === 0x167
		|| x === 0x16B
		|| x === 0x1CE
		|| x === 0x1D0
		|| x === 0x1D2
		|| x === 0x1D4
		|| x === 0x1D6
		|| x === 0x1D8
		|| x === 0x1DA
		|| x === 0x1DC
		|| x === 0x251
		|| x === 0x261
		|| x === 0x2C4
		|| x === 0x2C7
		|| x >= 0x2C9 && x <= 0x2CB
		|| x === 0x2CD
		|| x === 0x2D0
		|| x >= 0x2D8 && x <= 0x2DB
		|| x === 0x2DD
		|| x === 0x2DF
		|| x >= 0x300 && x <= 0x36F
		|| x >= 0x391 && x <= 0x3A1
		|| x >= 0x3A3 && x <= 0x3A9
		|| x >= 0x3B1 && x <= 0x3C1
		|| x >= 0x3C3 && x <= 0x3C9
		|| x === 0x401
		|| x >= 0x410 && x <= 0x44F
		|| x === 0x451
		|| x === 0x2010
		|| x >= 0x2013 && x <= 0x2016
		|| x === 0x2018
		|| x === 0x2019
		|| x === 0x201C
		|| x === 0x201D
		|| x >= 0x2020 && x <= 0x2022
		|| x >= 0x2024 && x <= 0x2027
		|| x === 0x2030
		|| x === 0x2032
		|| x === 0x2033
		|| x === 0x2035
		|| x === 0x203B
		|| x === 0x203E
		|| x === 0x2074
		|| x === 0x207F
		|| x >= 0x2081 && x <= 0x2084
		|| x === 0x20AC
		|| x === 0x2103
		|| x === 0x2105
		|| x === 0x2109
		|| x === 0x2113
		|| x === 0x2116
		|| x === 0x2121
		|| x === 0x2122
		|| x === 0x2126
		|| x === 0x212B
		|| x === 0x2153
		|| x === 0x2154
		|| x >= 0x215B && x <= 0x215E
		|| x >= 0x2160 && x <= 0x216B
		|| x >= 0x2170 && x <= 0x2179
		|| x === 0x2189
		|| x >= 0x2190 && x <= 0x2199
		|| x === 0x21B8
		|| x === 0x21B9
		|| x === 0x21D2
		|| x === 0x21D4
		|| x === 0x21E7
		|| x === 0x2200
		|| x === 0x2202
		|| x === 0x2203
		|| x === 0x2207
		|| x === 0x2208
		|| x === 0x220B
		|| x === 0x220F
		|| x === 0x2211
		|| x === 0x2215
		|| x === 0x221A
		|| x >= 0x221D && x <= 0x2220
		|| x === 0x2223
		|| x === 0x2225
		|| x >= 0x2227 && x <= 0x222C
		|| x === 0x222E
		|| x >= 0x2234 && x <= 0x2237
		|| x === 0x223C
		|| x === 0x223D
		|| x === 0x2248
		|| x === 0x224C
		|| x === 0x2252
		|| x === 0x2260
		|| x === 0x2261
		|| x >= 0x2264 && x <= 0x2267
		|| x === 0x226A
		|| x === 0x226B
		|| x === 0x226E
		|| x === 0x226F
		|| x === 0x2282
		|| x === 0x2283
		|| x === 0x2286
		|| x === 0x2287
		|| x === 0x2295
		|| x === 0x2299
		|| x === 0x22A5
		|| x === 0x22BF
		|| x === 0x2312
		|| x >= 0x2460 && x <= 0x24E9
		|| x >= 0x24EB && x <= 0x254B
		|| x >= 0x2550 && x <= 0x2573
		|| x >= 0x2580 && x <= 0x258F
		|| x >= 0x2592 && x <= 0x2595
		|| x === 0x25A0
		|| x === 0x25A1
		|| x >= 0x25A3 && x <= 0x25A9
		|| x === 0x25B2
		|| x === 0x25B3
		|| x === 0x25B6
		|| x === 0x25B7
		|| x === 0x25BC
		|| x === 0x25BD
		|| x === 0x25C0
		|| x === 0x25C1
		|| x >= 0x25C6 && x <= 0x25C8
		|| x === 0x25CB
		|| x >= 0x25CE && x <= 0x25D1
		|| x >= 0x25E2 && x <= 0x25E5
		|| x === 0x25EF
		|| x === 0x2605
		|| x === 0x2606
		|| x === 0x2609
		|| x === 0x260E
		|| x === 0x260F
		|| x === 0x261C
		|| x === 0x261E
		|| x === 0x2640
		|| x === 0x2642
		|| x === 0x2660
		|| x === 0x2661
		|| x >= 0x2663 && x <= 0x2665
		|| x >= 0x2667 && x <= 0x266A
		|| x === 0x266C
		|| x === 0x266D
		|| x === 0x266F
		|| x === 0x269E
		|| x === 0x269F
		|| x === 0x26BF
		|| x >= 0x26C6 && x <= 0x26CD
		|| x >= 0x26CF && x <= 0x26D3
		|| x >= 0x26D5 && x <= 0x26E1
		|| x === 0x26E3
		|| x === 0x26E8
		|| x === 0x26E9
		|| x >= 0x26EB && x <= 0x26F1
		|| x === 0x26F4
		|| x >= 0x26F6 && x <= 0x26F9
		|| x === 0x26FB
		|| x === 0x26FC
		|| x === 0x26FE
		|| x === 0x26FF
		|| x === 0x273D
		|| x >= 0x2776 && x <= 0x277F
		|| x >= 0x2B56 && x <= 0x2B59
		|| x >= 0x3248 && x <= 0x324F
		|| x >= 0xE000 && x <= 0xF8FF
		|| x >= 0xFE00 && x <= 0xFE0F
		|| x === 0xFFFD
		|| x >= 0x1F100 && x <= 0x1F10A
		|| x >= 0x1F110 && x <= 0x1F12D
		|| x >= 0x1F130 && x <= 0x1F169
		|| x >= 0x1F170 && x <= 0x1F18D
		|| x === 0x1F18F
		|| x === 0x1F190
		|| x >= 0x1F19B && x <= 0x1F1AC
		|| x >= 0xE0100 && x <= 0xE01EF
		|| x >= 0xF0000 && x <= 0xFFFFD
		|| x >= 0x100000 && x <= 0x10FFFD;
}

function isFullWidth(x) {
	return x === 0x3000
		|| x >= 0xFF01 && x <= 0xFF60
		|| x >= 0xFFE0 && x <= 0xFFE6;
}

function isWide(x) {
	return x >= 0x1100 && x <= 0x115F
		|| x === 0x231A
		|| x === 0x231B
		|| x === 0x2329
		|| x === 0x232A
		|| x >= 0x23E9 && x <= 0x23EC
		|| x === 0x23F0
		|| x === 0x23F3
		|| x === 0x25FD
		|| x === 0x25FE
		|| x === 0x2614
		|| x === 0x2615
		|| x >= 0x2648 && x <= 0x2653
		|| x === 0x267F
		|| x === 0x2693
		|| x === 0x26A1
		|| x === 0x26AA
		|| x === 0x26AB
		|| x === 0x26BD
		|| x === 0x26BE
		|| x === 0x26C4
		|| x === 0x26C5
		|| x === 0x26CE
		|| x === 0x26D4
		|| x === 0x26EA
		|| x === 0x26F2
		|| x === 0x26F3
		|| x === 0x26F5
		|| x === 0x26FA
		|| x === 0x26FD
		|| x === 0x2705
		|| x === 0x270A
		|| x === 0x270B
		|| x === 0x2728
		|| x === 0x274C
		|| x === 0x274E
		|| x >= 0x2753 && x <= 0x2755
		|| x === 0x2757
		|| x >= 0x2795 && x <= 0x2797
		|| x === 0x27B0
		|| x === 0x27BF
		|| x === 0x2B1B
		|| x === 0x2B1C
		|| x === 0x2B50
		|| x === 0x2B55
		|| x >= 0x2E80 && x <= 0x2E99
		|| x >= 0x2E9B && x <= 0x2EF3
		|| x >= 0x2F00 && x <= 0x2FD5
		|| x >= 0x2FF0 && x <= 0x2FFF
		|| x >= 0x3001 && x <= 0x303E
		|| x >= 0x3041 && x <= 0x3096
		|| x >= 0x3099 && x <= 0x30FF
		|| x >= 0x3105 && x <= 0x312F
		|| x >= 0x3131 && x <= 0x318E
		|| x >= 0x3190 && x <= 0x31E3
		|| x >= 0x31EF && x <= 0x321E
		|| x >= 0x3220 && x <= 0x3247
		|| x >= 0x3250 && x <= 0x4DBF
		|| x >= 0x4E00 && x <= 0xA48C
		|| x >= 0xA490 && x <= 0xA4C6
		|| x >= 0xA960 && x <= 0xA97C
		|| x >= 0xAC00 && x <= 0xD7A3
		|| x >= 0xF900 && x <= 0xFAFF
		|| x >= 0xFE10 && x <= 0xFE19
		|| x >= 0xFE30 && x <= 0xFE52
		|| x >= 0xFE54 && x <= 0xFE66
		|| x >= 0xFE68 && x <= 0xFE6B
		|| x >= 0x16FE0 && x <= 0x16FE4
		|| x === 0x16FF0
		|| x === 0x16FF1
		|| x >= 0x17000 && x <= 0x187F7
		|| x >= 0x18800 && x <= 0x18CD5
		|| x >= 0x18D00 && x <= 0x18D08
		|| x >= 0x1AFF0 && x <= 0x1AFF3
		|| x >= 0x1AFF5 && x <= 0x1AFFB
		|| x === 0x1AFFD
		|| x === 0x1AFFE
		|| x >= 0x1B000 && x <= 0x1B122
		|| x === 0x1B132
		|| x >= 0x1B150 && x <= 0x1B152
		|| x === 0x1B155
		|| x >= 0x1B164 && x <= 0x1B167
		|| x >= 0x1B170 && x <= 0x1B2FB
		|| x === 0x1F004
		|| x === 0x1F0CF
		|| x === 0x1F18E
		|| x >= 0x1F191 && x <= 0x1F19A
		|| x >= 0x1F200 && x <= 0x1F202
		|| x >= 0x1F210 && x <= 0x1F23B
		|| x >= 0x1F240 && x <= 0x1F248
		|| x === 0x1F250
		|| x === 0x1F251
		|| x >= 0x1F260 && x <= 0x1F265
		|| x >= 0x1F300 && x <= 0x1F320
		|| x >= 0x1F32D && x <= 0x1F335
		|| x >= 0x1F337 && x <= 0x1F37C
		|| x >= 0x1F37E && x <= 0x1F393
		|| x >= 0x1F3A0 && x <= 0x1F3CA
		|| x >= 0x1F3CF && x <= 0x1F3D3
		|| x >= 0x1F3E0 && x <= 0x1F3F0
		|| x === 0x1F3F4
		|| x >= 0x1F3F8 && x <= 0x1F43E
		|| x === 0x1F440
		|| x >= 0x1F442 && x <= 0x1F4FC
		|| x >= 0x1F4FF && x <= 0x1F53D
		|| x >= 0x1F54B && x <= 0x1F54E
		|| x >= 0x1F550 && x <= 0x1F567
		|| x === 0x1F57A
		|| x === 0x1F595
		|| x === 0x1F596
		|| x === 0x1F5A4
		|| x >= 0x1F5FB && x <= 0x1F64F
		|| x >= 0x1F680 && x <= 0x1F6C5
		|| x === 0x1F6CC
		|| x >= 0x1F6D0 && x <= 0x1F6D2
		|| x >= 0x1F6D5 && x <= 0x1F6D7
		|| x >= 0x1F6DC && x <= 0x1F6DF
		|| x === 0x1F6EB
		|| x === 0x1F6EC
		|| x >= 0x1F6F4 && x <= 0x1F6FC
		|| x >= 0x1F7E0 && x <= 0x1F7EB
		|| x === 0x1F7F0
		|| x >= 0x1F90C && x <= 0x1F93A
		|| x >= 0x1F93C && x <= 0x1F945
		|| x >= 0x1F947 && x <= 0x1F9FF
		|| x >= 0x1FA70 && x <= 0x1FA7C
		|| x >= 0x1FA80 && x <= 0x1FA88
		|| x >= 0x1FA90 && x <= 0x1FABD
		|| x >= 0x1FABF && x <= 0x1FAC5
		|| x >= 0x1FACE && x <= 0x1FADB
		|| x >= 0x1FAE0 && x <= 0x1FAE8
		|| x >= 0x1FAF0 && x <= 0x1FAF8
		|| x >= 0x20000 && x <= 0x2FFFD
		|| x >= 0x30000 && x <= 0x3FFFD;
}

function validate(codePoint) {
	if (!Number.isSafeInteger(codePoint)) {
		throw new TypeError(`Expected a code point, got \`${typeof codePoint}\`.`);
	}
}

function eastAsianWidth(codePoint, {ambiguousAsWide = false} = {}) {
	validate(codePoint);

	if (
		isFullWidth(codePoint)
		|| isWide(codePoint)
		|| (ambiguousAsWide && isAmbiguous(codePoint))
	) {
		return 2;
	}

	return 1;
}

var emojiRegex = () => {
	// https://mths.be/emoji
	return /[#*0-9]\uFE0F?\u20E3|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26AA\u26B0\u26B1\u26BD\u26BE\u26C4\u26C8\u26CF\u26D1\u26E9\u26F0-\u26F5\u26F7\u26F8\u26FA\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2757\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B55\u3030\u303D\u3297\u3299]\uFE0F?|[\u261D\u270C\u270D](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\u270A\u270B](?:\uD83C[\uDFFB-\uDFFF])?|[\u23E9-\u23EC\u23F0\u23F3\u25FD\u2693\u26A1\u26AB\u26C5\u26CE\u26D4\u26EA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2795-\u2797\u27B0\u27BF\u2B50]|\u26D3\uFE0F?(?:\u200D\uD83D\uDCA5)?|\u26F9(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\u2764\uFE0F?(?:\u200D(?:\uD83D\uDD25|\uD83E\uDE79))?|\uD83C(?:[\uDC04\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]\uFE0F?|[\uDF85\uDFC2\uDFC7](?:\uD83C[\uDFFB-\uDFFF])?|[\uDFC4\uDFCA](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDFCB\uDFCC](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF43\uDF45-\uDF4A\uDF4C-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uDDE6\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF]|\uDDE7\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF]|\uDDE8\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF]|\uDDE9\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF]|\uDDEA\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA]|\uDDEB\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7]|\uDDEC\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE]|\uDDED\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA]|\uDDEE\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9]|\uDDEF\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5]|\uDDF0\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF]|\uDDF1\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE]|\uDDF2\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF]|\uDDF3\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF]|\uDDF4\uD83C\uDDF2|\uDDF5\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE]|\uDDF6\uD83C\uDDE6|\uDDF7\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC]|\uDDF8\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF]|\uDDF9\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF]|\uDDFA\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF]|\uDDFB\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA]|\uDDFC\uD83C[\uDDEB\uDDF8]|\uDDFD\uD83C\uDDF0|\uDDFE\uD83C[\uDDEA\uDDF9]|\uDDFF\uD83C[\uDDE6\uDDF2\uDDFC]|\uDF44(?:\u200D\uD83D\uDFEB)?|\uDF4B(?:\u200D\uD83D\uDFE9)?|\uDFC3(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDFF3\uFE0F?(?:\u200D(?:\u26A7\uFE0F?|\uD83C\uDF08))?|\uDFF4(?:\u200D\u2620\uFE0F?|\uDB40\uDC67\uDB40\uDC62\uDB40(?:\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDC73\uDB40\uDC63\uDB40\uDC74|\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F)?)|\uD83D(?:[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3]\uFE0F?|[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC](?:\uD83C[\uDFFB-\uDFFF])?|[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4\uDEB5](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD74\uDD90](?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?|[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC25\uDC27-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE41\uDE43\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEDC-\uDEDF\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB\uDFF0]|\uDC08(?:\u200D\u2B1B)?|\uDC15(?:\u200D\uD83E\uDDBA)?|\uDC26(?:\u200D(?:\u2B1B|\uD83D\uDD25))?|\uDC3B(?:\u200D\u2744\uFE0F?)?|\uDC41\uFE0F?(?:\u200D\uD83D\uDDE8\uFE0F?)?|\uDC68(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?\uDC68\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D\uDC68\uD83C[\uDFFB-\uDFFE])))?))?|\uDC69(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:\uDC8B\u200D\uD83D)?[\uDC68\uDC69]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D(?:[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?|\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFC-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFD-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFD\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D\uD83D(?:[\uDC68\uDC69]|\uDC8B\u200D\uD83D[\uDC68\uDC69])\uD83C[\uDFFB-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83D[\uDC68\uDC69]\uD83C[\uDFFB-\uDFFE])))?))?|\uDC6F(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDD75(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|\uDE2E(?:\u200D\uD83D\uDCA8)?|\uDE35(?:\u200D\uD83D\uDCAB)?|\uDE36(?:\u200D\uD83C\uDF2B\uFE0F?)?|\uDE42(?:\u200D[\u2194\u2195]\uFE0F?)?|\uDEB6(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?)|\uD83E(?:[\uDD0C\uDD0F\uDD18-\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5\uDEC3-\uDEC5\uDEF0\uDEF2-\uDEF8](?:\uD83C[\uDFFB-\uDFFF])?|[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD\uDDCF\uDDD4\uDDD6-\uDDDD](?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDDDE\uDDDF](?:\u200D[\u2640\u2642]\uFE0F?)?|[\uDD0D\uDD0E\uDD10-\uDD17\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCC\uDDD0\uDDE0-\uDDFF\uDE70-\uDE7C\uDE80-\uDE88\uDE90-\uDEBD\uDEBF-\uDEC2\uDECE-\uDEDB\uDEE0-\uDEE8]|\uDD3C(?:\u200D[\u2640\u2642]\uFE0F?|\uD83C[\uDFFB-\uDFFF])?|\uDDCE(?:\uD83C[\uDFFB-\uDFFF])?(?:\u200D(?:[\u2640\u2642]\uFE0F?(?:\u200D\u27A1\uFE0F?)?|\u27A1\uFE0F?))?|\uDDD1(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1|\uDDD1\u200D\uD83E\uDDD2(?:\u200D\uD83E\uDDD2)?|\uDDD2(?:\u200D\uD83E\uDDD2)?))|\uD83C(?:\uDFFB(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFC-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFC(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFD-\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFD(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFE(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFD\uDFFF]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?|\uDFFF(?:\u200D(?:[\u2695\u2696\u2708]\uFE0F?|\u2764\uFE0F?\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1\uD83C[\uDFFB-\uDFFE]|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E(?:[\uDDAF\uDDBC\uDDBD](?:\u200D\u27A1\uFE0F?)?|[\uDDB0-\uDDB3]|\uDD1D\u200D\uD83E\uDDD1\uD83C[\uDFFB-\uDFFF])))?))?|\uDEF1(?:\uD83C(?:\uDFFB(?:\u200D\uD83E\uDEF2\uD83C[\uDFFC-\uDFFF])?|\uDFFC(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFD-\uDFFF])?|\uDFFD(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])?|\uDFFE(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFD\uDFFF])?|\uDFFF(?:\u200D\uD83E\uDEF2\uD83C[\uDFFB-\uDFFE])?))?)/g;
};

function stringWidth(string, options = {}) {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	const {
		ambiguousIsNarrow = true,
		countAnsiEscapeCodes = false,
	} = options;

	if (!countAnsiEscapeCodes) {
		string = stripAnsi(string);
	}

	if (string.length === 0) {
		return 0;
	}

	let width = 0;

	for (const {segment: character} of new Intl.Segmenter().segment(string)) {
		const codePoint = character.codePointAt(0);

		// Ignore control characters
		if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (codePoint >= 0x3_00 && codePoint <= 0x3_6F) {
			continue;
		}

		if (emojiRegex().test(character)) {
			width += 2;
			continue;
		}

		width += eastAsianWidth(codePoint, {ambiguousAsWide: !ambiguousIsNarrow});
	}

	return width;
}

function getIndexOfNearestSpace(string, wantedIndex, shouldSearchRight) {
	if (string.charAt(wantedIndex) === ' ') {
		return wantedIndex;
	}

	const direction = shouldSearchRight ? 1 : -1;

	for (let index = 0; index <= 3; index++) {
		const finalIndex = wantedIndex + (index * direction);
		if (string.charAt(finalIndex) === ' ') {
			return finalIndex;
		}
	}

	return wantedIndex;
}

function cliTruncate(text, columns, options = {}) {
	const {
		position = 'end',
		space = false,
		preferTruncationOnSpace = false,
	} = options;

	let {truncationCharacter = '…'} = options;

	if (typeof text !== 'string') {
		throw new TypeError(`Expected \`input\` to be a string, got ${typeof text}`);
	}

	if (typeof columns !== 'number') {
		throw new TypeError(`Expected \`columns\` to be a number, got ${typeof columns}`);
	}

	if (columns < 1) {
		return '';
	}

	if (columns === 1) {
		return truncationCharacter;
	}

	const length = stringWidth(text);

	if (length <= columns) {
		return text;
	}

	if (position === 'start') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, length - columns + 1, true);
			return truncationCharacter + sliceAnsi(text, nearestSpace, length).trim();
		}

		if (space === true) {
			truncationCharacter += ' ';
		}

		return truncationCharacter + sliceAnsi(text, length - columns + stringWidth(truncationCharacter), length);
	}

	if (position === 'middle') {
		if (space === true) {
			truncationCharacter = ` ${truncationCharacter} `;
		}

		const half = Math.floor(columns / 2);

		if (preferTruncationOnSpace) {
			const spaceNearFirstBreakPoint = getIndexOfNearestSpace(text, half);
			const spaceNearSecondBreakPoint = getIndexOfNearestSpace(text, length - (columns - half) + 1, true);
			return sliceAnsi(text, 0, spaceNearFirstBreakPoint) + truncationCharacter + sliceAnsi(text, spaceNearSecondBreakPoint, length).trim();
		}

		return (
			sliceAnsi(text, 0, half)
				+ truncationCharacter
				+ sliceAnsi(text, length - (columns - half) + stringWidth(truncationCharacter), length)
		);
	}

	if (position === 'end') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, columns - 1);
			return sliceAnsi(text, 0, nearestSpace) + truncationCharacter;
		}

		if (space === true) {
			truncationCharacter = ` ${truncationCharacter}`;
		}

		return sliceAnsi(text, 0, columns - stringWidth(truncationCharacter)) + truncationCharacter;
	}

	throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${position}`);
}

function capturePrintError(error, ctx, options) {
  let output = "";
  const writable = new Writable({
    write(chunk, _encoding, callback) {
      output += String(chunk);
      callback();
    }
  });
  const logger = new Logger(ctx, writable, writable);
  const result = logger.printError(error, {
    showCodeFrame: false,
    ...options
  });
  return { nearest: result?.nearest, output };
}
function printError(error, project, options) {
  const { showCodeFrame = true, type, printProperties = true } = options;
  const logger = options.logger;
  let e = error;
  if (isPrimitive(e)) {
    e = {
      message: String(error).split(/\n/g)[0],
      stack: String(error)
    };
  }
  if (!e) {
    const error2 = new Error("unknown error");
    e = {
      message: e ?? error2.message,
      stack: error2.stack
    };
  }
  if (!project) {
    printErrorMessage(e, logger);
    return;
  }
  const stacks = options.parseErrorStacktrace(e);
  const nearest = error instanceof TypeCheckError ? error.stacks[0] : stacks.find((stack) => {
    try {
      return project.server && project.getModuleById(stack.file) && existsSync(stack.file);
    } catch {
      return false;
    }
  });
  if (type) {
    printErrorType(type, project.ctx);
  }
  printErrorMessage(e, logger);
  if (options.screenshotPaths?.length) {
    const length = options.screenshotPaths.length;
    logger.error(`
Failure screenshot${length > 1 ? "s" : ""}:`);
    logger.error(options.screenshotPaths.map((p) => `  - ${c.dim(relative(process.cwd(), p))}`).join("\n"));
    if (!e.diff) {
      logger.error();
    }
  }
  if (e.codeFrame) {
    logger.error(`${e.codeFrame}
`);
  }
  if ("__vitest_rollup_error__" in e) {
    const err = e.__vitest_rollup_error__;
    logger.error([
      err.plugin && `  Plugin: ${c.magenta(err.plugin)}`,
      err.id && `  File: ${c.cyan(err.id)}${err.loc ? `:${err.loc.line}:${err.loc.column}` : ""}`,
      err.frame && c.yellow(err.frame.split(/\r?\n/g).map((l) => ` `.repeat(2) + l).join(`
`))
    ].filter(Boolean).join("\n"));
  }
  if (e.diff) {
    displayDiff(e.diff, logger.console);
  }
  if (e.frame) {
    logger.error(c.yellow(e.frame));
  } else {
    const errorProperties = printProperties ? getErrorProperties(e) : {};
    printStack(logger, project, stacks, nearest, errorProperties, (s) => {
      if (showCodeFrame && s === nearest && nearest) {
        const sourceCode = readFileSync(nearest.file, "utf-8");
        logger.error(
          generateCodeFrame(
            sourceCode.length > 1e5 ? sourceCode : logger.highlight(nearest.file, sourceCode),
            4,
            s
          )
        );
      }
    });
  }
  const testPath = e.VITEST_TEST_PATH;
  const testName = e.VITEST_TEST_NAME;
  const afterEnvTeardown = e.VITEST_AFTER_ENV_TEARDOWN;
  if (testPath) {
    logger.error(
      c.red(
        `This error originated in "${c.bold(
          testPath
        )}" test file. It doesn't mean the error was thrown inside the file itself, but while it was running.`
      )
    );
  }
  if (testName) {
    logger.error(
      c.red(
        `The latest test that might've caused the error is "${c.bold(
          testName
        )}". It might mean one of the following:
- The error was thrown, while Vitest was running this test.
- If the error occurred after the test had been completed, this was the last documented test before it was thrown.`
      )
    );
  }
  if (afterEnvTeardown) {
    logger.error(
      c.red(
        "This error was caught after test environment was torn down. Make sure to cancel any running tasks before test finishes:\n- cancel timeouts using clearTimeout and clearInterval\n- wait for promises to resolve using the await keyword"
      )
    );
  }
  if (typeof e.cause === "object" && e.cause && "name" in e.cause) {
    e.cause.name = `Caused by: ${e.cause.name}`;
    printError(e.cause, project, {
      showCodeFrame: false,
      logger: options.logger,
      parseErrorStacktrace: options.parseErrorStacktrace
    });
  }
  handleImportOutsideModuleError(e.stack || e.stackStr || "", logger);
  return { nearest };
}
function printErrorType(type, ctx) {
  ctx.logger.error(`
${c.red(divider(c.bold(c.inverse(` ${type} `))))}`);
}
const skipErrorProperties = /* @__PURE__ */ new Set([
  "nameStr",
  "stack",
  "cause",
  "stacks",
  "stackStr",
  "type",
  "showDiff",
  "ok",
  "operator",
  "diff",
  "codeFrame",
  "actual",
  "expected",
  "diffOptions",
  "VITEST_TEST_NAME",
  "VITEST_TEST_PATH",
  "VITEST_AFTER_ENV_TEARDOWN",
  ...Object.getOwnPropertyNames(Error.prototype),
  ...Object.getOwnPropertyNames(Object.prototype)
]);
function getErrorProperties(e) {
  const errorObject = /* @__PURE__ */ Object.create(null);
  if (e.name === "AssertionError") {
    return errorObject;
  }
  for (const key of Object.getOwnPropertyNames(e)) {
    if (!skipErrorProperties.has(key)) {
      errorObject[key] = e[key];
    }
  }
  return errorObject;
}
const esmErrors = [
  "Cannot use import statement outside a module",
  "Unexpected token 'export'"
];
function handleImportOutsideModuleError(stack, logger) {
  if (!esmErrors.some((e) => stack.includes(e))) {
    return;
  }
  const path = normalize(stack.split("\n")[0].trim());
  let name = path.split("/node_modules/").pop() || "";
  if (name?.startsWith("@")) {
    name = name.split("/").slice(0, 2).join("/");
  } else {
    name = name.split("/")[0];
  }
  if (name) {
    printModuleWarningForPackage(logger, path, name);
  } else {
    printModuleWarningForSourceCode(logger, path);
  }
}
function printModuleWarningForPackage(logger, path, name) {
  logger.error(
    c.yellow(
      `Module ${path} seems to be an ES Module but shipped in a CommonJS package. You might want to create an issue to the package ${c.bold(
        `"${name}"`
      )} asking them to ship the file in .mjs extension or add "type": "module" in their package.json.

As a temporary workaround you can try to inline the package by updating your config:

` + c.gray(c.dim("// vitest.config.js")) + "\n" + c.green(`export default {
  test: {
    server: {
      deps: {
        inline: [
          ${c.yellow(c.bold(`"${name}"`))}
        ]
      }
    }
  }
}
`)
    )
  );
}
function printModuleWarningForSourceCode(logger, path) {
  logger.error(
    c.yellow(
      `Module ${path} seems to be an ES Module but shipped in a CommonJS package. To fix this issue, change the file extension to .mjs or add "type": "module" in your package.json.`
    )
  );
}
function displayDiff(diff, console) {
  if (diff) {
    console.error(`
${diff}
`);
  }
}
function printErrorMessage(error, logger) {
  const errorName = error.name || error.nameStr || "Unknown Error";
  if (!error.message) {
    logger.error(error);
    return;
  }
  if (error.message.length > 5e3) {
    logger.error(`${c.red(c.bold(errorName))}: ${error.message}`);
  } else {
    logger.error(c.red(`${c.bold(errorName)}: ${error.message}`));
  }
}
function printStack(logger, project, stack, highlight, errorProperties, onStack) {
  for (const frame of stack) {
    const color = frame === highlight ? c.cyan : c.gray;
    const path = relative(project.config.root, frame.file);
    logger.error(
      color(
        ` ${c.dim(F_POINTER)} ${[
          frame.method,
          `${path}:${c.dim(`${frame.line}:${frame.column}`)}`
        ].filter(Boolean).join(" ")}`
      )
    );
    onStack?.(frame);
  }
  if (stack.length) {
    logger.error();
  }
  if (hasProperties(errorProperties)) {
    logger.error(c.red(c.dim(divider())));
    const propertiesString = inspect(errorProperties);
    logger.error(c.red(c.bold("Serialized Error:")), c.gray(propertiesString));
  }
}
function hasProperties(obj) {
  for (const _key in obj) {
    return true;
  }
  return false;
}
function generateCodeFrame(source, indent = 0, loc, range = 2) {
  const start = typeof loc === "object" ? positionToOffset(source, loc.line, loc.column) : loc;
  const end = start;
  const lines = source.split(lineSplitRE);
  const nl = /\r\n/.test(source) ? 2 : 1;
  let count = 0;
  let res = [];
  const columns = process.stdout?.columns || 80;
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + nl;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length) {
          continue;
        }
        const lineLength = lines[j].length;
        if (stripVTControlCharacters(lines[j]).length > 200) {
          return "";
        }
        res.push(
          lineNo(j + 1) + cliTruncate(lines[j].replace(/\t/g, " "), columns - 5 - indent)
        );
        if (j === i) {
          const pad = start - (count - lineLength) + (nl - 1);
          const length = Math.max(
            1,
            end > count ? lineLength - pad : end - start
          );
          res.push(lineNo() + " ".repeat(pad) + c.red("^".repeat(length)));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(1, Math.min(end - count, lineLength));
            res.push(lineNo() + c.red("^".repeat(length)));
          }
          count += lineLength + 1;
        }
      }
      break;
    }
  }
  if (indent) {
    res = res.map((line) => " ".repeat(indent) + line);
  }
  return res.join("\n");
}
function lineNo(no = "") {
  return c.gray(`${String(no).padStart(3, " ")}| `);
}

const PAD = "      ";
const ESC = "\x1B[";
const ERASE_DOWN = `${ESC}J`;
const ERASE_SCROLLBACK = `${ESC}3J`;
const CURSOR_TO_START = `${ESC}1;1H`;
const CLEAR_SCREEN = "\x1Bc";
class Logger {
  constructor(ctx, outputStream = process.stdout, errorStream = process.stderr) {
    this.ctx = ctx;
    this.outputStream = outputStream;
    this.errorStream = errorStream;
    this.console = new Console({ stdout: outputStream, stderr: errorStream });
    this.logUpdate = createLogUpdate(this.outputStream);
    this._highlights.clear();
    this.registerUnhandledRejection();
  }
  logUpdate;
  _clearScreenPending;
  _highlights = /* @__PURE__ */ new Map();
  console;
  log(...args) {
    this._clearScreen();
    this.console.log(...args);
  }
  error(...args) {
    this._clearScreen();
    this.console.error(...args);
  }
  warn(...args) {
    this._clearScreen();
    this.console.warn(...args);
  }
  clearFullScreen(message = "") {
    if (!this.ctx.config.clearScreen) {
      this.console.log(message);
      return;
    }
    if (message) {
      this.console.log(`${CLEAR_SCREEN}${ERASE_SCROLLBACK}${message}`);
    } else {
      this.outputStream.write(`${CLEAR_SCREEN}${ERASE_SCROLLBACK}`);
    }
  }
  clearScreen(message, force = false) {
    if (!this.ctx.config.clearScreen) {
      this.console.log(message);
      return;
    }
    this._clearScreenPending = message;
    if (force) {
      this._clearScreen();
    }
  }
  _clearScreen() {
    if (this._clearScreenPending == null) {
      return;
    }
    const log = this._clearScreenPending;
    this._clearScreenPending = void 0;
    this.console.log(`${CURSOR_TO_START}${ERASE_DOWN}${log}`);
  }
  printError(err, options = {}) {
    const { fullStack = false, type } = options;
    const project = options.project ?? this.ctx.getCoreWorkspaceProject() ?? this.ctx.projects[0];
    return printError(err, project, {
      type,
      showCodeFrame: options.showCodeFrame ?? true,
      logger: this,
      printProperties: options.verbose,
      screenshotPaths: options.screenshotPaths,
      parseErrorStacktrace: (error) => {
        if (options.task?.file.pool === "browser" && project.browser) {
          return project.browser.parseErrorStacktrace(error, {
            ignoreStackEntries: fullStack ? [] : void 0
          });
        }
        return parseErrorStacktrace(error, {
          frameFilter: project.config.onStackTrace,
          ignoreStackEntries: fullStack ? [] : void 0
        });
      }
    });
  }
  clearHighlightCache(filename) {
    if (filename) {
      this._highlights.delete(filename);
    } else {
      this._highlights.clear();
    }
  }
  highlight(filename, source) {
    if (this._highlights.has(filename)) {
      return this._highlights.get(filename);
    }
    const code = highlightCode(filename, source);
    this._highlights.set(filename, code);
    return code;
  }
  printNoTestFound(filters) {
    const config = this.ctx.config;
    const comma = c.dim(", ");
    if (filters?.length) {
      this.console.error(c.dim("filter:  ") + c.yellow(filters.join(comma)));
    }
    const projectsFilter = toArray(config.project);
    if (projectsFilter.length) {
      this.console.error(
        c.dim("projects: ") + c.yellow(projectsFilter.join(comma))
      );
    }
    this.ctx.projects.forEach((project) => {
      const config2 = project.config;
      const name = project.getName();
      const output = project.isCore() || !name ? "" : `[${name}]`;
      if (output) {
        this.console.error(c.bgCyan(`${output} Config`));
      }
      if (config2.include) {
        this.console.error(
          c.dim("include: ") + c.yellow(config2.include.join(comma))
        );
      }
      if (config2.exclude) {
        this.console.error(
          c.dim("exclude:  ") + c.yellow(config2.exclude.join(comma))
        );
      }
      if (config2.typecheck.enabled) {
        this.console.error(
          c.dim("typecheck include: ") + c.yellow(config2.typecheck.include.join(comma))
        );
        this.console.error(
          c.dim("typecheck exclude: ") + c.yellow(config2.typecheck.exclude.join(comma))
        );
      }
    });
    if (config.watch && (config.changed || config.related?.length)) {
      this.log(`No affected ${config.mode} files found
`);
    } else {
      if (config.passWithNoTests) {
        this.log(`No ${config.mode} files found, exiting with code 0
`);
      } else {
        this.error(
          c.red(`
No ${config.mode} files found, exiting with code 1`)
        );
      }
    }
  }
  printBanner() {
    this.log();
    const color = this.ctx.config.watch ? "blue" : "cyan";
    const mode = this.ctx.config.watch ? "DEV" : "RUN";
    this.log(withLabel(color, mode, `v${this.ctx.version} `) + c.gray(this.ctx.config.root));
    if (this.ctx.config.sequence.sequencer === RandomSequencer) {
      this.log(PAD + c.gray(`Running tests with seed "${this.ctx.config.sequence.seed}"`));
    }
    if (this.ctx.config.ui) {
      const host = this.ctx.config.api?.host || "localhost";
      const port = this.ctx.server.config.server.port;
      const base = this.ctx.config.uiBase;
      this.log(PAD + c.dim(c.green(`UI started at http://${host}:${c.bold(port)}${base}`)));
    } else if (this.ctx.config.api?.port) {
      const resolvedUrls = this.ctx.server.resolvedUrls;
      const fallbackUrl = `http://${this.ctx.config.api.host || "localhost"}:${this.ctx.config.api.port}`;
      const origin = resolvedUrls?.local[0] ?? resolvedUrls?.network[0] ?? fallbackUrl;
      this.log(PAD + c.dim(c.green(`API started at ${new URL("/", origin)}`)));
    }
    if (this.ctx.coverageProvider) {
      this.log(PAD + c.dim("Coverage enabled with ") + c.yellow(this.ctx.coverageProvider.name));
    }
    if (this.ctx.config.standalone) {
      this.log(c.yellow(`
Vitest is running in standalone mode. Edit a test file to rerun tests.`));
    } else {
      this.log();
    }
  }
  printBrowserBanner(project) {
    if (!project.browser) {
      return;
    }
    const resolvedUrls = project.browser.vite.resolvedUrls;
    const origin = resolvedUrls?.local[0] ?? resolvedUrls?.network[0];
    if (!origin) {
      return;
    }
    const name = project.getName();
    const output = project.isCore() ? "" : formatProjectName(name);
    const provider = project.browser.provider.name;
    const providerString = provider === "preview" ? "" : ` by ${c.reset(c.bold(provider))}`;
    this.log(
      c.dim(
        `${output}Browser runner started${providerString} ${c.dim("at")} ${c.blue(new URL("/", origin))}
`
      )
    );
  }
  printUnhandledErrors(errors) {
    const errorMessage = c.red(
      c.bold(
        `
Vitest caught ${errors.length} unhandled error${errors.length > 1 ? "s" : ""} during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.`
      )
    );
    this.log(c.red(divider(c.bold(c.inverse(" Unhandled Errors ")))));
    this.log(errorMessage);
    errors.forEach((err) => {
      this.printError(err, {
        fullStack: true,
        type: err.type || "Unhandled Error"
      });
    });
    this.log(c.red(divider()));
  }
  printSourceTypeErrors(errors) {
    const errorMessage = c.red(
      c.bold(
        `
Vitest found ${errors.length} error${errors.length > 1 ? "s" : ""} not related to your test files.`
      )
    );
    this.log(c.red(divider(c.bold(c.inverse(" Source Errors ")))));
    this.log(errorMessage);
    errors.forEach((err) => {
      this.printError(err, { fullStack: true });
    });
    this.log(c.red(divider()));
  }
  registerUnhandledRejection() {
    const onUnhandledRejection = (err) => {
      process.exitCode = 1;
      this.printError(err, {
        fullStack: true,
        type: "Unhandled Rejection"
      });
      this.error("\n\n");
      process.exit();
    };
    process.on("unhandledRejection", onUnhandledRejection);
    this.ctx.onClose(() => {
      process.off("unhandledRejection", onUnhandledRejection);
    });
  }
}

class BlobReporter {
  ctx;
  options;
  constructor(options) {
    this.options = options;
  }
  onInit(ctx) {
    if (ctx.config.watch) {
      throw new Error("Blob reporter is not supported in watch mode");
    }
    this.ctx = ctx;
  }
  async onFinished(files = [], errors = [], coverage) {
    let outputFile = this.options.outputFile ?? getOutputFile(this.ctx.config, "blob");
    if (!outputFile) {
      const shard = this.ctx.config.shard;
      outputFile = shard ? `.vitest-reports/blob-${shard.index}-${shard.count}.json` : ".vitest-reports/blob.json";
    }
    const modules = this.ctx.projects.map(
      (project) => {
        return [
          project.getName(),
          [...project.server.moduleGraph.idToModuleMap.entries()].map((mod) => {
            if (!mod[1].file) {
              return null;
            }
            return [mod[0], mod[1].file, mod[1].url];
          }).filter((x) => x != null)
        ];
      }
    );
    const report = stringify([
      this.ctx.version,
      files,
      errors,
      modules,
      coverage
    ]);
    const reportFile = resolve(this.ctx.config.root, outputFile);
    const dir = dirname(reportFile);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(reportFile, report, "utf-8");
    this.ctx.logger.log("blob report written to", reportFile);
  }
}
async function readBlobs(currentVersion, blobsDirectory, projectsArray) {
  const resolvedDir = resolve(process.cwd(), blobsDirectory);
  const blobsFiles = await readdir(resolvedDir);
  const promises = blobsFiles.map(async (filename) => {
    const fullPath = resolve(resolvedDir, filename);
    const stats = await stat(fullPath);
    if (!stats.isFile()) {
      throw new TypeError(
        `vitest.mergeReports() expects all paths in "${blobsDirectory}" to be files generated by the blob reporter, but "${filename}" is not a file`
      );
    }
    const content = await readFile(fullPath, "utf-8");
    const [version, files2, errors2, moduleKeys, coverage] = parse(
      content
    );
    if (!version) {
      throw new TypeError(
        `vitest.mergeReports() expects all paths in "${blobsDirectory}" to be files generated by the blob reporter, but "${filename}" is not a valid blob file`
      );
    }
    return { version, files: files2, errors: errors2, moduleKeys, coverage, file: filename };
  });
  const blobs = await Promise.all(promises);
  if (!blobs.length) {
    throw new Error(
      `vitest.mergeReports() requires at least one blob file in "${blobsDirectory}" directory, but none were found`
    );
  }
  const versions = new Set(blobs.map((blob) => blob.version));
  if (versions.size > 1) {
    throw new Error(
      `vitest.mergeReports() requires all blob files to be generated by the same Vitest version, received

${blobs.map((b) => `- "${b.file}" uses v${b.version}`).join("\n")}`
    );
  }
  if (!versions.has(currentVersion)) {
    throw new Error(
      `the blobs in "${blobsDirectory}" were generated by a different version of Vitest. Expected v${currentVersion}, but received v${blobs[0].version}`
    );
  }
  const projects = Object.fromEntries(
    projectsArray.map((p) => [p.getName(), p])
  );
  blobs.forEach((blob) => {
    blob.moduleKeys.forEach(([projectName, moduleIds]) => {
      const project = projects[projectName];
      if (!project) {
        return;
      }
      moduleIds.forEach(([moduleId, file, url]) => {
        const moduleNode = project.server.moduleGraph.createFileOnlyEntry(file);
        moduleNode.url = url;
        moduleNode.id = moduleId;
        project.server.moduleGraph.idToModuleMap.set(moduleId, moduleNode);
      });
    });
  });
  const files = blobs.flatMap((blob) => blob.files).sort((f1, f2) => {
    const time1 = f1.result?.startTime || 0;
    const time2 = f2.result?.startTime || 0;
    return time1 - time2;
  });
  const errors = blobs.flatMap((blob) => blob.errors);
  const coverages = blobs.map((blob) => blob.coverage);
  return {
    files,
    errors,
    coverages
  };
}

function hasFailedSnapshot(suite) {
  return getTests(suite).some((s) => {
    return s.result?.errors?.some(
      (e) => typeof e?.message === "string" && e.message.match(/Snapshot .* mismatched/)
    );
  });
}

const BADGE_PADDING = "       ";
const LAST_RUN_LOG_TIMEOUT = 1500;
class BaseReporter {
  start = 0;
  end = 0;
  watchFilters;
  failedUnwatchedFiles = [];
  isTTY;
  ctx = void 0;
  verbose = false;
  _filesInWatchMode = /* @__PURE__ */ new Map();
  _timeStart = formatTimeString(/* @__PURE__ */ new Date());
  _lastRunTimeout = 0;
  _lastRunTimer;
  _lastRunCount = 0;
  constructor(options = {}) {
    this.isTTY = options.isTTY ?? ((isNode || isDeno) && process.stdout?.isTTY && !isCI);
  }
  onInit(ctx) {
    this.ctx = ctx;
    this.ctx.logger.printBanner();
    this.start = performance.now();
  }
  log(...messages) {
    this.ctx.logger.log(...messages);
  }
  error(...messages) {
    this.ctx.logger.error(...messages);
  }
  relative(path) {
    return relative(this.ctx.config.root, path);
  }
  onFinished(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    this.end = performance.now();
    this.reportSummary(files, errors);
  }
  onTaskUpdate(packs) {
    if (this.isTTY) {
      return;
    }
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0]);
      if (task) {
        this.printTask(task);
      }
    }
  }
  printTask(task) {
    if (!("filepath" in task) || !task.result?.state || task.result?.state === "run") {
      return;
    }
    const tests = getTests(task);
    const failed = tests.filter((t) => t.result?.state === "fail");
    const skipped = tests.filter((t) => t.mode === "skip" || t.mode === "todo");
    let state = c.dim(`${tests.length} test${tests.length > 1 ? "s" : ""}`);
    if (failed.length) {
      state += c.dim(" | ") + c.red(`${failed.length} failed`);
    }
    if (skipped.length) {
      state += c.dim(" | ") + c.yellow(`${skipped.length} skipped`);
    }
    let suffix = c.dim("(") + state + c.dim(")") + this.getDurationPrefix(task);
    if (this.ctx.config.logHeapUsage && task.result.heap != null) {
      suffix += c.magenta(` ${Math.floor(task.result.heap / 1024 / 1024)} MB heap used`);
    }
    let title = getStateSymbol(task);
    if (task.meta.typecheck) {
      title += ` ${c.bgBlue(c.bold(" TS "))}`;
    }
    if (task.projectName) {
      title += ` ${formatProjectName(task.projectName, "")}`;
    }
    this.log(` ${title} ${task.name} ${suffix}`);
    for (const test of tests) {
      const duration = test.result?.duration;
      if (test.result?.state === "fail") {
        const suffix2 = this.getDurationPrefix(test);
        this.log(c.red(`   ${taskFail} ${getTestName(test, c.dim(" > "))}${suffix2}`));
        test.result?.errors?.forEach((e) => {
          this.log(c.red(`     ${F_RIGHT} ${e?.message}`));
        });
      } else if (duration && duration > this.ctx.config.slowTestThreshold) {
        this.log(
          `   ${c.yellow(c.dim(F_CHECK))} ${getTestName(test, c.dim(" > "))} ${c.yellow(Math.round(duration) + c.dim("ms"))}`
        );
      }
    }
  }
  getDurationPrefix(task) {
    if (!task.result?.duration) {
      return "";
    }
    const color = task.result.duration > this.ctx.config.slowTestThreshold ? c.yellow : c.gray;
    return color(` ${Math.round(task.result.duration)}${c.dim("ms")}`);
  }
  onWatcherStart(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    this.resetLastRunLog();
    const failed = errors.length > 0 || hasFailed(files);
    if (failed) {
      this.log(withLabel("red", "FAIL", "Tests failed. Watching for file changes..."));
    } else if (this.ctx.isCancelling) {
      this.log(withLabel("red", "CANCELLED", "Test run cancelled. Watching for file changes..."));
    } else {
      this.log(withLabel("green", "PASS", "Waiting for file changes..."));
    }
    const hints = [c.dim("press ") + c.bold("h") + c.dim(" to show help")];
    if (hasFailedSnapshot(files)) {
      hints.unshift(c.dim("press ") + c.bold(c.yellow("u")) + c.dim(" to update snapshot"));
    } else {
      hints.push(c.dim("press ") + c.bold("q") + c.dim(" to quit"));
    }
    this.log(BADGE_PADDING + hints.join(c.dim(", ")));
    if (this._lastRunCount) {
      const LAST_RUN_TEXT = `rerun x${this._lastRunCount}`;
      const LAST_RUN_TEXTS = [
        c.blue(LAST_RUN_TEXT),
        c.gray(LAST_RUN_TEXT),
        c.dim(c.gray(LAST_RUN_TEXT))
      ];
      this.ctx.logger.logUpdate(BADGE_PADDING + LAST_RUN_TEXTS[0]);
      this._lastRunTimeout = 0;
      this._lastRunTimer = setInterval(() => {
        this._lastRunTimeout += 1;
        if (this._lastRunTimeout >= LAST_RUN_TEXTS.length) {
          this.resetLastRunLog();
        } else {
          this.ctx.logger.logUpdate(
            BADGE_PADDING + LAST_RUN_TEXTS[this._lastRunTimeout]
          );
        }
      }, LAST_RUN_LOG_TIMEOUT / LAST_RUN_TEXTS.length);
    }
  }
  resetLastRunLog() {
    clearInterval(this._lastRunTimer);
    this._lastRunTimer = void 0;
    this.ctx.logger.logUpdate.clear();
  }
  onWatcherRerun(files, trigger) {
    this.resetLastRunLog();
    this.watchFilters = files;
    this.failedUnwatchedFiles = this.ctx.state.getFiles().filter(
      (file) => !files.includes(file.filepath) && hasFailed(file)
    );
    files.forEach((filepath) => {
      let reruns = this._filesInWatchMode.get(filepath) ?? 0;
      this._filesInWatchMode.set(filepath, ++reruns);
    });
    let banner = trigger ? c.dim(`${this.relative(trigger)} `) : "";
    if (files.length > 1 || !files.length) {
      this._lastRunCount = 0;
    } else if (files.length === 1) {
      const rerun = this._filesInWatchMode.get(files[0]) ?? 1;
      banner += c.blue(`x${rerun} `);
    }
    this.ctx.logger.clearFullScreen();
    this.log(withLabel("blue", "RERUN", banner));
    if (this.ctx.configOverride.project) {
      this.log(BADGE_PADDING + c.dim(" Project name: ") + c.blue(toArray(this.ctx.configOverride.project).join(", ")));
    }
    if (this.ctx.filenamePattern) {
      this.log(BADGE_PADDING + c.dim(" Filename pattern: ") + c.blue(this.ctx.filenamePattern));
    }
    if (this.ctx.configOverride.testNamePattern) {
      this.log(BADGE_PADDING + c.dim(" Test name pattern: ") + c.blue(String(this.ctx.configOverride.testNamePattern)));
    }
    this.log("");
    if (!this.isTTY) {
      for (const task of this.failedUnwatchedFiles) {
        this.printTask(task);
      }
    }
    this._timeStart = formatTimeString(/* @__PURE__ */ new Date());
    this.start = performance.now();
  }
  onUserConsoleLog(log) {
    if (!this.shouldLog(log)) {
      return;
    }
    const output = log.type === "stdout" ? this.ctx.logger.outputStream : this.ctx.logger.errorStream;
    const write = (msg) => output.write(msg);
    let headerText = "unknown test";
    const task = log.taskId ? this.ctx.state.idMap.get(log.taskId) : void 0;
    if (task) {
      headerText = getFullName(task, c.dim(" > "));
    } else if (log.taskId && log.taskId !== "__vitest__unknown_test__") {
      headerText = log.taskId;
    }
    write(c.gray(log.type + c.dim(` | ${headerText}
`)) + log.content);
    if (log.origin) {
      if (log.browser) {
        write("\n");
      }
      const project = log.taskId ? this.ctx.getProjectByTaskId(log.taskId) : this.ctx.getCoreWorkspaceProject();
      const stack = log.browser ? project.browser?.parseStacktrace(log.origin) || [] : parseStacktrace(log.origin);
      const highlight = task && stack.find((i) => i.file === task.file.filepath);
      for (const frame of stack) {
        const color = frame === highlight ? c.cyan : c.gray;
        const path = relative(project.config.root, frame.file);
        const positions = [
          frame.method,
          `${path}:${c.dim(`${frame.line}:${frame.column}`)}`
        ].filter(Boolean).join(" ");
        write(color(` ${c.dim(F_POINTER)} ${positions}
`));
      }
    }
    write("\n");
  }
  onTestRemoved(trigger) {
    this.log(c.yellow("Test removed...") + (trigger ? c.dim(` [ ${this.relative(trigger)} ]
`) : ""));
  }
  shouldLog(log) {
    if (this.ctx.config.silent) {
      return false;
    }
    const shouldLog = this.ctx.config.onConsoleLog?.(log.content, log.type);
    if (shouldLog === false) {
      return shouldLog;
    }
    return true;
  }
  onServerRestart(reason) {
    this.log(c.bold(c.magenta(
      reason === "config" ? "\nRestarting due to config changes..." : "\nRestarting Vitest..."
    )));
  }
  reportSummary(files, errors) {
    this.printErrorsSummary(files, errors);
    if (this.ctx.config.mode === "benchmark") {
      this.reportBenchmarkSummary(files);
    } else {
      this.reportTestSummary(files, errors);
    }
  }
  reportTestSummary(files, errors) {
    const affectedFiles = [
      ...this.failedUnwatchedFiles,
      ...files
    ];
    const tests = getTests(affectedFiles);
    const snapshotOutput = renderSnapshotSummary(
      this.ctx.config.root,
      this.ctx.snapshot.summary
    );
    for (const [index, snapshot] of snapshotOutput.entries()) {
      const title = index === 0 ? "Snapshots" : "";
      this.log(`${padTitle(title)} ${snapshot}`);
    }
    if (snapshotOutput.length > 1) {
      this.log();
    }
    this.log(padTitle("Test Files"), getStateString(affectedFiles));
    this.log(padTitle("Tests"), getStateString(tests));
    if (this.ctx.projects.some((c2) => c2.config.typecheck.enabled)) {
      const failed = tests.filter((t) => t.meta?.typecheck && t.result?.errors?.length);
      this.log(
        padTitle("Type Errors"),
        failed.length ? c.bold(c.red(`${failed.length} failed`)) : c.dim("no errors")
      );
    }
    if (errors.length) {
      this.log(
        padTitle("Errors"),
        c.bold(c.red(`${errors.length} error${errors.length > 1 ? "s" : ""}`))
      );
    }
    this.log(padTitle("Start at"), this._timeStart);
    const collectTime = sum(files, (file) => file.collectDuration);
    const testsTime = sum(files, (file) => file.result?.duration);
    const setupTime = sum(files, (file) => file.setupDuration);
    if (this.watchFilters) {
      this.log(padTitle("Duration"), time(collectTime + testsTime + setupTime));
    } else {
      const executionTime = this.end - this.start;
      const environmentTime = sum(files, (file) => file.environmentLoad);
      const prepareTime = sum(files, (file) => file.prepareDuration);
      const transformTime = sum(this.ctx.projects, (project) => project.vitenode.getTotalDuration());
      const typecheck = sum(this.ctx.projects, (project) => project.typechecker?.getResult().time);
      const timers = [
        `transform ${time(transformTime)}`,
        `setup ${time(setupTime)}`,
        `collect ${time(collectTime)}`,
        `tests ${time(testsTime)}`,
        `environment ${time(environmentTime)}`,
        `prepare ${time(prepareTime)}`,
        typecheck && `typecheck ${time(typecheck)}`
      ].filter(Boolean).join(", ");
      this.log(padTitle("Duration"), time(executionTime) + c.dim(` (${timers})`));
    }
    this.log();
  }
  printErrorsSummary(files, errors) {
    const suites = getSuites(files);
    const tests = getTests(files);
    const failedSuites = suites.filter((i) => i.result?.errors);
    const failedTests = tests.filter((i) => i.result?.state === "fail");
    const failedTotal = countTestErrors(failedSuites) + countTestErrors(failedTests);
    let current = 1;
    const errorDivider = () => this.error(`${c.red(c.dim(divider(`[${current++}/${failedTotal}]`, void 0, 1)))}
`);
    if (failedSuites.length) {
      this.error(`${errorBanner(`Failed Suites ${failedSuites.length}`)}
`);
      this.printTaskErrors(failedSuites, errorDivider);
    }
    if (failedTests.length) {
      this.error(`${errorBanner(`Failed Tests ${failedTests.length}`)}
`);
      this.printTaskErrors(failedTests, errorDivider);
    }
    if (errors.length) {
      this.ctx.logger.printUnhandledErrors(errors);
      this.error();
    }
  }
  reportBenchmarkSummary(files) {
    const benches = getTests(files);
    const topBenches = benches.filter((i) => i.result?.benchmark?.rank === 1);
    this.log(withLabel("cyan", "BENCH", "Summary\n"));
    for (const bench of topBenches) {
      const group = bench.suite || bench.file;
      if (!group) {
        continue;
      }
      const groupName = getFullName(group, c.dim(" > "));
      this.log(`  ${bench.name}${c.dim(` - ${groupName}`)}`);
      const siblings = group.tasks.filter((i) => i.meta.benchmark && i.result?.benchmark && i !== bench).sort((a, b) => a.result.benchmark.rank - b.result.benchmark.rank);
      for (const sibling of siblings) {
        const number = (sibling.result.benchmark.mean / bench.result.benchmark.mean).toFixed(2);
        this.log(c.green(`    ${number}x `) + c.gray("faster than ") + sibling.name);
      }
      this.log("");
    }
  }
  printTaskErrors(tasks, errorDivider) {
    const errorsQueue = [];
    for (const task of tasks) {
      task.result?.errors?.forEach((error) => {
        let previous;
        if (error?.stackStr) {
          previous = errorsQueue.find((i) => {
            if (i[0]?.stackStr !== error.stackStr) {
              return false;
            }
            const currentProjectName = task?.projectName || task.file?.projectName || "";
            const projectName = i[1][0]?.projectName || i[1][0].file?.projectName || "";
            return projectName === currentProjectName;
          });
        }
        if (previous) {
          previous[1].push(task);
        } else {
          errorsQueue.push([error, [task]]);
        }
      });
    }
    for (const [error, tasks2] of errorsQueue) {
      for (const task of tasks2) {
        const filepath = task?.filepath || "";
        const projectName = task?.projectName || task.file?.projectName || "";
        let name = getFullName(task, c.dim(" > "));
        if (filepath) {
          name += c.dim(` [ ${this.relative(filepath)} ]`);
        }
        this.ctx.logger.error(
          `${c.red(c.bold(c.inverse(" FAIL ")))}${formatProjectName(projectName)} ${name}`
        );
      }
      const screenshotPaths = tasks2.map((t) => t.meta?.failScreenshotPath).filter((screenshot) => screenshot != null);
      this.ctx.logger.printError(error, {
        project: this.ctx.getProjectByTaskId(tasks2[0].id),
        verbose: this.verbose,
        screenshotPaths,
        task: tasks2[0]
      });
      errorDivider();
    }
  }
}
function errorBanner(message) {
  return c.red(divider(c.bold(c.inverse(` ${message} `))));
}
function padTitle(str) {
  return c.dim(`${str.padStart(11)} `);
}
function time(time2) {
  if (time2 > 1e3) {
    return `${(time2 / 1e3).toFixed(2)}s`;
  }
  return `${Math.round(time2)}ms`;
}
function sum(items, cb) {
  return items.reduce((total, next) => {
    return total + Math.max(cb(next) || 0, 0);
  }, 0);
}

class BasicReporter extends BaseReporter {
  constructor() {
    super();
    this.isTTY = false;
  }
  reportSummary(files, errors) {
    this.ctx.logger.log();
    return super.reportSummary(files, errors);
  }
}

const outputMap$1 = /* @__PURE__ */ new WeakMap();
function formatFilepath$1(path) {
  const lastSlash = Math.max(path.lastIndexOf("/") + 1, 0);
  const basename = path.slice(lastSlash);
  let firstDot = basename.indexOf(".");
  if (firstDot < 0) {
    firstDot = basename.length;
  }
  firstDot += lastSlash;
  return c.dim(path.slice(0, lastSlash)) + path.slice(lastSlash, firstDot) + c.dim(path.slice(firstDot));
}
function formatNumber$1(number) {
  const res = String(number.toFixed(number < 100 ? 4 : 2)).split(".");
  return res[0].replace(/(?=(?:\d{3})+$)\B/g, ",") + (res[1] ? `.${res[1]}` : "");
}
function renderHookState(task, hookName, level = 0) {
  const state = task.result?.hooks?.[hookName];
  if (state && state === "run") {
    return `${"  ".repeat(level)} ${getHookStateSymbol(task, hookName)} ${c.dim(
      `[ ${hookName} ]`
    )}`;
  }
  return "";
}
function renderBenchmarkItems$1(result) {
  return [
    result.name,
    formatNumber$1(result.hz || 0),
    formatNumber$1(result.p99 || 0),
    `\xB1${result.rme.toFixed(2)}%`,
    result.samples.length.toString()
  ];
}
function renderBenchmark$1(task, tasks) {
  const result = task.result?.benchmark;
  if (!result) {
    return task.name;
  }
  const benches = tasks.map((i) => i.meta?.benchmark ? i.result?.benchmark : void 0).filter(notNullish);
  const allItems = benches.map(renderBenchmarkItems$1);
  const items = renderBenchmarkItems$1(result);
  const padded = items.map((i, idx) => {
    const width = Math.max(...allItems.map((i2) => i2[idx].length));
    return idx ? i.padStart(width, " ") : i.padEnd(width, " ");
  });
  return [
    padded[0],
    // name
    c.dim("  "),
    c.blue(padded[1]),
    c.dim(" ops/sec "),
    c.cyan(padded[3]),
    c.dim(` (${padded[4]} samples)`),
    result.rank === 1 ? c.bold(c.green(" fastest")) : result.rank === benches.length && benches.length > 2 ? c.bold(c.gray(" slowest")) : ""
  ].join("");
}
function renderTree$1(tasks, options, level = 0, maxRows) {
  const output = [];
  let currentRowCount = 0;
  for (const task of [...tasks].reverse()) {
    const taskOutput = [];
    let suffix = "";
    let prefix = ` ${getStateSymbol(task)} `;
    if (level === 0 && task.type === "suite" && "projectName" in task) {
      prefix += formatProjectName(task.projectName);
    }
    if (level === 0 && task.type === "suite" && task.meta.typecheck) {
      prefix += c.bgBlue(c.bold(" TS "));
      prefix += " ";
    }
    if (task.type === "test" && task.result?.retryCount && task.result.retryCount > 0) {
      suffix += c.yellow(` (retry x${task.result.retryCount})`);
    }
    if (task.type === "suite") {
      const tests = getTests(task);
      suffix += c.dim(` (${tests.length})`);
    }
    if (task.mode === "skip" || task.mode === "todo") {
      suffix += ` ${c.dim(c.gray("[skipped]"))}`;
    }
    if (task.type === "test" && task.result?.repeatCount && task.result.repeatCount > 0) {
      suffix += c.yellow(` (repeat x${task.result.repeatCount})`);
    }
    if (task.result?.duration != null) {
      if (task.result.duration > options.slowTestThreshold) {
        suffix += c.yellow(
          ` ${Math.round(task.result.duration)}${c.dim("ms")}`
        );
      }
    }
    if (options.showHeap && task.result?.heap != null) {
      suffix += c.magenta(
        ` ${Math.floor(task.result.heap / 1024 / 1024)} MB heap used`
      );
    }
    let name = task.name;
    if (level === 0) {
      name = formatFilepath$1(name);
    }
    const padding = "  ".repeat(level);
    const body = task.meta?.benchmark ? renderBenchmark$1(task, tasks) : name;
    taskOutput.push(padding + prefix + body + suffix);
    if (task.result?.state !== "pass" && outputMap$1.get(task) != null) {
      let data = outputMap$1.get(task);
      if (typeof data === "string") {
        data = stripVTControlCharacters(data.trim().split("\n").filter(Boolean).pop());
        if (data === "") {
          data = void 0;
        }
      }
      if (data != null) {
        const out = `${"  ".repeat(level)}${F_RIGHT} ${data}`;
        taskOutput.push(`   ${c.gray(cliTruncate(out, getCols(-3)))}`);
      }
    }
    taskOutput.push(renderHookState(task, "beforeAll", level + 1));
    taskOutput.push(renderHookState(task, "beforeEach", level + 1));
    if (task.type === "suite" && task.tasks.length > 0) {
      if (task.result?.state === "fail" || task.result?.state === "run" || options.renderSucceed) {
        if (options.logger.ctx.config.hideSkippedTests) {
          const filteredTasks = task.tasks.filter(
            (t) => t.mode !== "skip" && t.mode !== "todo"
          );
          taskOutput.push(
            renderTree$1(filteredTasks, options, level + 1, maxRows)
          );
        } else {
          taskOutput.push(renderTree$1(task.tasks, options, level + 1, maxRows));
        }
      }
    }
    taskOutput.push(renderHookState(task, "afterAll", level + 1));
    taskOutput.push(renderHookState(task, "afterEach", level + 1));
    const rows = taskOutput.filter(Boolean);
    output.push(rows.join("\n"));
    currentRowCount += rows.length;
    if (maxRows && currentRowCount >= maxRows) {
      break;
    }
  }
  return output.reverse().join("\n");
}
function createListRenderer(_tasks, options) {
  let tasks = _tasks;
  let timer;
  const log = options.logger.logUpdate;
  function update() {
    if (options.logger.ctx.config.hideSkippedTests) {
      const filteredTasks = tasks.filter(
        (t) => t.mode !== "skip" && t.mode !== "todo"
      );
      log(
        renderTree$1(
          filteredTasks,
          options,
          0,
          // log-update already limits the amount of printed rows to fit the current terminal
          // but we can optimize performance by doing it ourselves
          process.stdout.rows
        )
      );
    } else {
      log(
        renderTree$1(
          tasks,
          options,
          0,
          // log-update already limits the amount of printed rows to fit the current terminal
          // but we can optimize performance by doing it ourselves
          process.stdout.rows
        )
      );
    }
  }
  return {
    start() {
      if (timer) {
        return this;
      }
      timer = setInterval(update, 16);
      return this;
    },
    update(_tasks2) {
      tasks = _tasks2;
      return this;
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = void 0;
      }
      log.clear();
      if (options.logger.ctx.config.hideSkippedTests) {
        const filteredTasks = tasks.filter(
          (t) => t.mode !== "skip" && t.mode !== "todo"
        );
        options.logger.log(renderTree$1(filteredTasks, options));
      } else {
        options.logger.log(renderTree$1(tasks, options));
      }
      return this;
    },
    clear() {
      log.clear();
    }
  };
}

class DefaultReporter extends BaseReporter {
  renderer;
  rendererOptions = {};
  renderSucceedDefault;
  onPathsCollected(paths = []) {
    if (this.isTTY) {
      if (this.renderSucceedDefault === void 0) {
        this.renderSucceedDefault = !!this.rendererOptions.renderSucceed;
      }
      if (this.renderSucceedDefault !== true) {
        this.rendererOptions.renderSucceed = paths.length <= 1;
      }
    }
  }
  async onTestRemoved(trigger) {
    this.stopListRender();
    this.ctx.logger.clearScreen(
      c.yellow("Test removed...") + (trigger ? c.dim(` [ ${this.relative(trigger)} ]
`) : ""),
      true
    );
    const files = this.ctx.state.getFiles(this.watchFilters);
    createListRenderer(files, this.rendererOptions).stop();
    this.ctx.logger.log();
    super.reportSummary(files, this.ctx.state.getUnhandledErrors());
    super.onWatcherStart();
  }
  onCollected() {
    if (this.isTTY) {
      this.rendererOptions.logger = this.ctx.logger;
      this.rendererOptions.showHeap = this.ctx.config.logHeapUsage;
      this.rendererOptions.slowTestThreshold = this.ctx.config.slowTestThreshold;
      this.rendererOptions.mode = this.ctx.config.mode;
      const files = this.ctx.state.getFiles(this.watchFilters);
      if (!this.renderer) {
        this.renderer = createListRenderer(files, this.rendererOptions).start();
      } else {
        this.renderer.update(files);
      }
    }
  }
  onFinished(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    this.renderer?.update([
      ...this.failedUnwatchedFiles,
      ...files
    ]);
    this.stopListRender();
    this.ctx.logger.log();
    super.onFinished(files, errors);
  }
  async onWatcherStart(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    this.stopListRender();
    await super.onWatcherStart(files, errors);
  }
  stopListRender() {
    this.renderer?.stop();
    this.renderer = void 0;
  }
  async onWatcherRerun(files, trigger) {
    this.stopListRender();
    await super.onWatcherRerun(files, trigger);
  }
  onUserConsoleLog(log) {
    if (!this.shouldLog(log)) {
      return;
    }
    this.renderer?.clear();
    super.onUserConsoleLog(log);
  }
}

const check = { char: "\xB7", color: c.green };
const cross = { char: "x", color: c.red };
const pending = { char: "*", color: c.yellow };
const skip = { char: "-", color: (char) => c.dim(c.gray(char)) };
function getIcon(task) {
  if (task.mode === "skip" || task.mode === "todo") {
    return skip;
  }
  switch (task.result?.state) {
    case "pass":
      return check;
    case "fail":
      return cross;
    default:
      return pending;
  }
}
function render(tasks, width) {
  const all = getTests(tasks);
  let currentIcon = pending;
  let currentTasks = 0;
  let previousLineWidth = 0;
  let output = "";
  const addOutput = () => {
    const { char, color } = currentIcon;
    const availableWidth = width - previousLineWidth;
    if (availableWidth > currentTasks) {
      output += color(char.repeat(currentTasks));
      previousLineWidth += currentTasks;
    } else {
      let buf = `${char.repeat(availableWidth)}
`;
      const remaining = currentTasks - availableWidth;
      const fullRows = Math.floor(remaining / width);
      buf += `${char.repeat(width)}
`.repeat(fullRows);
      const partialRow = remaining % width;
      if (partialRow > 0) {
        buf += char.repeat(partialRow);
        previousLineWidth = partialRow;
      } else {
        previousLineWidth = 0;
      }
      output += color(buf);
    }
  };
  for (const task of all) {
    const icon = getIcon(task);
    if (icon === currentIcon) {
      currentTasks++;
      continue;
    }
    addOutput();
    currentTasks = 1;
    currentIcon = icon;
  }
  addOutput();
  return output;
}
function createDotRenderer(_tasks, options) {
  let tasks = _tasks;
  let timer;
  const { logUpdate: log, outputStream } = options.logger;
  const columns = "columns" in outputStream ? outputStream.columns : 80;
  function update() {
    log(render(tasks, columns));
  }
  return {
    start() {
      if (timer) {
        return this;
      }
      timer = setInterval(update, 16);
      return this;
    },
    update(_tasks2) {
      tasks = _tasks2;
      return this;
    },
    async stop() {
      if (timer) {
        clearInterval(timer);
        timer = void 0;
      }
      log.clear();
      options.logger.log(render(tasks, columns));
      return this;
    },
    clear() {
      log.clear();
    }
  };
}

class DotReporter extends BaseReporter {
  renderer;
  onCollected() {
    if (this.isTTY) {
      const files = this.ctx.state.getFiles(this.watchFilters);
      if (!this.renderer) {
        this.renderer = createDotRenderer(files, {
          logger: this.ctx.logger
        }).start();
      } else {
        this.renderer.update(files);
      }
    }
  }
  async onFinished(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    await this.stopListRender();
    this.ctx.logger.log();
    super.onFinished(files, errors);
  }
  async onWatcherStart() {
    await this.stopListRender();
    super.onWatcherStart();
  }
  async stopListRender() {
    this.renderer?.stop();
    this.renderer = void 0;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  async onWatcherRerun(files, trigger) {
    await this.stopListRender();
    super.onWatcherRerun(files, trigger);
  }
  onUserConsoleLog(log) {
    this.renderer?.clear();
    super.onUserConsoleLog(log);
  }
}

class GithubActionsReporter {
  ctx = void 0;
  onInit(ctx) {
    this.ctx = ctx;
  }
  onFinished(files = [], errors = []) {
    const projectErrors = new Array();
    for (const error of errors) {
      projectErrors.push({
        project: this.ctx.getCoreWorkspaceProject(),
        title: "Unhandled error",
        error
      });
    }
    for (const file of files) {
      const tasks = getTasks(file);
      const project = this.ctx.getProjectByTaskId(file.id);
      for (const task of tasks) {
        if (task.result?.state !== "fail") {
          continue;
        }
        const title = getFullName(task, " > ");
        for (const error of task.result?.errors ?? []) {
          projectErrors.push({
            project,
            title,
            error,
            file
          });
        }
      }
    }
    for (const { project, title, error, file } of projectErrors) {
      const result = capturePrintError(error, this.ctx, { project, task: file });
      const stack = result?.nearest;
      if (!stack) {
        continue;
      }
      const formatted = formatMessage({
        command: "error",
        properties: {
          file: stack.file,
          title,
          line: String(stack.line),
          column: String(stack.column)
        },
        message: stripVTControlCharacters(result.output)
      });
      this.ctx.logger.log(`
${formatted}`);
    }
  }
}
function formatMessage({
  command,
  properties,
  message
}) {
  let result = `::${command}`;
  Object.entries(properties).forEach(([k, v], i) => {
    result += i === 0 ? " " : ",";
    result += `${k}=${escapeProperty(v)}`;
  });
  result += `::${escapeData(message)}`;
  return result;
}
function escapeData(s) {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}
function escapeProperty(s) {
  return s.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
}

class HangingProcessReporter {
  whyRunning;
  onInit() {
    const _require = createRequire(import.meta.url);
    this.whyRunning = _require("why-is-node-running");
  }
  onProcessTimeout() {
    this.whyRunning?.();
  }
}

const StatusMap = {
  fail: "failed",
  only: "pending",
  pass: "passed",
  run: "pending",
  skip: "skipped",
  todo: "todo"
};
class JsonReporter {
  start = 0;
  ctx;
  options;
  constructor(options) {
    this.options = options;
  }
  onInit(ctx) {
    this.ctx = ctx;
    this.start = Date.now();
  }
  async logTasks(files) {
    const suites = getSuites(files);
    const numTotalTestSuites = suites.length;
    const tests = getTests(files);
    const numTotalTests = tests.length;
    const numFailedTestSuites = suites.filter((s) => s.result?.state === "fail").length;
    const numPendingTestSuites = suites.filter(
      (s) => s.result?.state === "run" || s.mode === "todo"
    ).length;
    const numPassedTestSuites = numTotalTestSuites - numFailedTestSuites - numPendingTestSuites;
    const numFailedTests = tests.filter(
      (t) => t.result?.state === "fail"
    ).length;
    const numPassedTests = tests.filter((t) => t.result?.state === "pass").length;
    const numPendingTests = tests.filter(
      (t) => t.result?.state === "run" || t.mode === "skip" || t.result?.state === "skip"
    ).length;
    const numTodoTests = tests.filter((t) => t.mode === "todo").length;
    const testResults = [];
    const success = numFailedTestSuites === 0 && numFailedTests === 0;
    for (const file of files) {
      const tests2 = getTests([file]);
      let startTime = tests2.reduce(
        (prev, next) => Math.min(prev, next.result?.startTime ?? Number.POSITIVE_INFINITY),
        Number.POSITIVE_INFINITY
      );
      if (startTime === Number.POSITIVE_INFINITY) {
        startTime = this.start;
      }
      const endTime = tests2.reduce(
        (prev, next) => Math.max(
          prev,
          (next.result?.startTime ?? 0) + (next.result?.duration ?? 0)
        ),
        startTime
      );
      const assertionResults = tests2.map((t) => {
        const ancestorTitles = [];
        let iter = t.suite;
        while (iter) {
          ancestorTitles.push(iter.name);
          iter = iter.suite;
        }
        ancestorTitles.reverse();
        return {
          ancestorTitles,
          fullName: t.name ? [...ancestorTitles, t.name].join(" ") : ancestorTitles.join(" "),
          status: StatusMap[t.result?.state || t.mode] || "skipped",
          title: t.name,
          duration: t.result?.duration,
          failureMessages: t.result?.errors?.map((e) => e.stack || e.message) || [],
          location: t.location,
          meta: t.meta
        };
      });
      if (tests2.some((t) => t.result?.state === "run")) {
        this.ctx.logger.warn(
          "WARNING: Some tests are still running when generating the JSON report.This is likely an internal bug in Vitest.Please report it to https://github.com/vitest-dev/vitest/issues"
        );
      }
      const hasFailedTests = tests2.some((t) => t.result?.state === "fail");
      testResults.push({
        assertionResults,
        startTime,
        endTime,
        status: file.result?.state === "fail" || hasFailedTests ? "failed" : "passed",
        message: file.result?.errors?.[0]?.message ?? "",
        name: file.filepath
      });
    }
    const result = {
      numTotalTestSuites,
      numPassedTestSuites,
      numFailedTestSuites,
      numPendingTestSuites,
      numTotalTests,
      numPassedTests,
      numFailedTests,
      numPendingTests,
      numTodoTests,
      snapshot: this.ctx.snapshot.summary,
      startTime: this.start,
      success,
      testResults
    };
    await this.writeReport(JSON.stringify(result));
  }
  async onFinished(files = this.ctx.state.getFiles()) {
    await this.logTasks(files);
  }
  /**
   * Writes the report to an output file if specified in the config,
   * or logs it to the console otherwise.
   * @param report
   */
  async writeReport(report) {
    const outputFile = this.options.outputFile ?? getOutputFile(this.ctx.config, "json");
    if (outputFile) {
      const reportFile = resolve(this.ctx.config.root, outputFile);
      const outputDirectory = dirname(reportFile);
      if (!existsSync(outputDirectory)) {
        await promises.mkdir(outputDirectory, { recursive: true });
      }
      await promises.writeFile(reportFile, report, "utf-8");
      this.ctx.logger.log(`JSON report written to ${reportFile}`);
    } else {
      this.ctx.logger.log(report);
    }
  }
}

class IndentedLogger {
  constructor(baseLog) {
    this.baseLog = baseLog;
  }
  currentIndent = "";
  indent() {
    this.currentIndent += "    ";
  }
  unindent() {
    this.currentIndent = this.currentIndent.substring(
      0,
      this.currentIndent.length - 4
    );
  }
  log(text) {
    return this.baseLog(this.currentIndent + text);
  }
}

function flattenTasks$1(task, baseName = "") {
  const base = baseName ? `${baseName} > ` : "";
  if (task.type === "suite") {
    return task.tasks.flatMap(
      (child) => flattenTasks$1(child, `${base}${task.name}`)
    );
  } else {
    return [
      {
        ...task,
        name: `${base}${task.name}`
      }
    ];
  }
}
function removeInvalidXMLCharacters(value, removeDiscouragedChars) {
  let regex = /([\0-\x08\v\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
  value = String(value || "").replace(regex, "");
  {
    regex = new RegExp(
      /* eslint-disable regexp/prefer-character-class, regexp/no-obscure-range, regexp/no-useless-non-capturing-group */
      "([\\x7F-\\x84]|[\\x86-\\x9F]|[\\uFDD0-\\uFDEF]|\\uD83F[\\uDFFE\\uDFFF]|(?:\\uD87F[\\uDFFE\\uDFFF])|\\uD8BF[\\uDFFE\\uDFFF]|\\uD8FF[\\uDFFE\\uDFFF]|(?:\\uD93F[\\uDFFE\\uDFFF])|\\uD97F[\\uDFFE\\uDFFF]|\\uD9BF[\\uDFFE\\uDFFF]|\\uD9FF[\\uDFFE\\uDFFF]|\\uDA3F[\\uDFFE\\uDFFF]|\\uDA7F[\\uDFFE\\uDFFF]|\\uDABF[\\uDFFE\\uDFFF]|(?:\\uDAFF[\\uDFFE\\uDFFF])|\\uDB3F[\\uDFFE\\uDFFF]|\\uDB7F[\\uDFFE\\uDFFF]|(?:\\uDBBF[\\uDFFE\\uDFFF])|\\uDBFF[\\uDFFE\\uDFFF](?:[\\0-\\t\\v\\f\\x0E-\\u2027\\u202A-\\uD7FF\\uE000-\\uFFFF]|[\\uD800-\\uDBFF][\\uDC00-\\uDFFF]|[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?:[^\\uD800-\\uDBFF]|^)[\\uDC00-\\uDFFF]))",
      "g"
      /* eslint-enable */
    );
    value = value.replace(regex, "");
  }
  return value;
}
function escapeXML(value) {
  return removeInvalidXMLCharacters(
    String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
}
function executionTime(durationMS) {
  return (durationMS / 1e3).toLocaleString("en-US", {
    useGrouping: false,
    maximumFractionDigits: 10
  });
}
function getDuration(task) {
  const duration = task.result?.duration ?? 0;
  return executionTime(duration);
}
class JUnitReporter {
  ctx;
  reportFile;
  baseLog;
  logger;
  _timeStart = /* @__PURE__ */ new Date();
  fileFd;
  options;
  constructor(options) {
    this.options = { ...options };
    this.options.includeConsoleOutput ??= true;
  }
  async onInit(ctx) {
    this.ctx = ctx;
    const outputFile = this.options.outputFile ?? getOutputFile(this.ctx.config, "junit");
    if (outputFile) {
      this.reportFile = resolve(this.ctx.config.root, outputFile);
      const outputDirectory = dirname(this.reportFile);
      if (!existsSync(outputDirectory)) {
        await promises.mkdir(outputDirectory, { recursive: true });
      }
      const fileFd = await promises.open(this.reportFile, "w+");
      this.fileFd = fileFd;
      this.baseLog = async (text) => {
        if (!this.fileFd) {
          this.fileFd = await promises.open(this.reportFile, "w+");
        }
        await promises.writeFile(this.fileFd, `${text}
`);
      };
    } else {
      this.baseLog = async (text) => this.ctx.logger.log(text);
    }
    this._timeStart = /* @__PURE__ */ new Date();
    this.logger = new IndentedLogger(this.baseLog);
  }
  async writeElement(name, attrs, children) {
    const pairs = [];
    for (const key in attrs) {
      const attr = attrs[key];
      if (attr === void 0) {
        continue;
      }
      pairs.push(`${key}="${escapeXML(attr)}"`);
    }
    await this.logger.log(
      `<${name}${pairs.length ? ` ${pairs.join(" ")}` : ""}>`
    );
    this.logger.indent();
    await children.call(this);
    this.logger.unindent();
    await this.logger.log(`</${name}>`);
  }
  async writeLogs(task, type) {
    if (task.logs == null || task.logs.length === 0) {
      return;
    }
    const logType = type === "err" ? "stderr" : "stdout";
    const logs = task.logs.filter((log) => log.type === logType);
    if (logs.length === 0) {
      return;
    }
    await this.writeElement(`system-${type}`, {}, async () => {
      for (const log of logs) {
        await this.baseLog(escapeXML(log.content));
      }
    });
  }
  async writeTasks(tasks, filename) {
    for (const task of tasks) {
      await this.writeElement(
        "testcase",
        {
          classname: this.options.classname ?? filename,
          file: this.options.addFileAttribute ? filename : void 0,
          name: task.name,
          time: getDuration(task)
        },
        async () => {
          if (this.options.includeConsoleOutput) {
            await this.writeLogs(task, "out");
            await this.writeLogs(task, "err");
          }
          if (task.mode === "skip" || task.mode === "todo") {
            await this.logger.log("<skipped/>");
          }
          if (task.result?.state === "fail") {
            const errors = task.result.errors || [];
            for (const error of errors) {
              await this.writeElement(
                "failure",
                {
                  message: error?.message,
                  type: error?.name ?? error?.nameStr
                },
                async () => {
                  if (!error) {
                    return;
                  }
                  const result = capturePrintError(
                    error,
                    this.ctx,
                    { project: this.ctx.getProjectByTaskId(task.id), task }
                  );
                  await this.baseLog(
                    escapeXML(stripVTControlCharacters(result.output.trim()))
                  );
                }
              );
            }
          }
        }
      );
    }
  }
  async onFinished(files = this.ctx.state.getFiles()) {
    await this.logger.log('<?xml version="1.0" encoding="UTF-8" ?>');
    const transformed = files.map((file) => {
      const tasks = file.tasks.flatMap((task) => flattenTasks$1(task));
      const stats2 = tasks.reduce(
        (stats3, task) => {
          return {
            passed: stats3.passed + Number(task.result?.state === "pass"),
            failures: stats3.failures + Number(task.result?.state === "fail"),
            skipped: stats3.skipped + Number(task.mode === "skip" || task.mode === "todo")
          };
        },
        {
          passed: 0,
          failures: 0,
          skipped: 0
        }
      );
      const suites = getSuites(file);
      for (const suite of suites) {
        if (suite.result?.errors) {
          tasks.push(suite);
          stats2.failures += 1;
        }
      }
      if (tasks.length === 0 && file.result?.state === "fail") {
        stats2.failures = 1;
        tasks.push({
          id: file.id,
          type: "test",
          name: file.name,
          mode: "run",
          result: file.result,
          meta: {},
          // NOTE: not used in JUnitReporter
          context: null,
          suite: null,
          file: null
        });
      }
      return {
        ...file,
        tasks,
        stats: stats2
      };
    });
    const stats = transformed.reduce(
      (stats2, file) => {
        stats2.tests += file.tasks.length;
        stats2.failures += file.stats.failures;
        return stats2;
      },
      {
        name: this.options.suiteName || "vitest tests",
        tests: 0,
        failures: 0,
        errors: 0,
        // we cannot detect those
        time: executionTime((/* @__PURE__ */ new Date()).getTime() - this._timeStart.getTime())
      }
    );
    await this.writeElement("testsuites", stats, async () => {
      for (const file of transformed) {
        const filename = relative(this.ctx.config.root, file.filepath);
        await this.writeElement(
          "testsuite",
          {
            name: filename,
            timestamp: (/* @__PURE__ */ new Date()).toISOString(),
            hostname: hostname(),
            tests: file.tasks.length,
            failures: file.stats.failures,
            errors: 0,
            // An errored test is one that had an unanticipated problem. We cannot detect those.
            skipped: file.stats.skipped,
            time: getDuration(file)
          },
          async () => {
            await this.writeTasks(file.tasks, filename);
          }
        );
      }
    });
    if (this.reportFile) {
      this.ctx.logger.log(`JUNIT report written to ${this.reportFile}`);
    }
    await this.fileFd?.close();
    this.fileFd = void 0;
  }
}

function yamlString(str) {
  return `"${str.replace(/"/g, '\\"')}"`;
}
function tapString(str) {
  return str.replace(/\\/g, "\\\\").replace(/#/g, "\\#").replace(/\n/g, " ");
}
class TapReporter {
  ctx;
  logger;
  onInit(ctx) {
    this.ctx = ctx;
    this.logger = new IndentedLogger(ctx.logger.log.bind(ctx.logger));
  }
  static getComment(task) {
    if (task.mode === "skip") {
      return " # SKIP";
    } else if (task.mode === "todo") {
      return " # TODO";
    } else if (task.result?.duration != null) {
      return ` # time=${task.result.duration.toFixed(2)}ms`;
    } else {
      return "";
    }
  }
  logErrorDetails(error, stack) {
    const errorName = error.name || error.nameStr || "Unknown Error";
    this.logger.log(`name: ${yamlString(String(errorName))}`);
    this.logger.log(`message: ${yamlString(String(error.message))}`);
    if (stack) {
      this.logger.log(
        `stack: ${yamlString(`${stack.file}:${stack.line}:${stack.column}`)}`
      );
    }
  }
  logTasks(tasks) {
    this.logger.log(`1..${tasks.length}`);
    for (const [i, task] of tasks.entries()) {
      const id = i + 1;
      const ok = task.result?.state === "pass" || task.mode === "skip" || task.mode === "todo" ? "ok" : "not ok";
      const comment = TapReporter.getComment(task);
      if (task.type === "suite" && task.tasks.length > 0) {
        this.logger.log(`${ok} ${id} - ${tapString(task.name)}${comment} {`);
        this.logger.indent();
        this.logTasks(task.tasks);
        this.logger.unindent();
        this.logger.log("}");
      } else {
        this.logger.log(`${ok} ${id} - ${tapString(task.name)}${comment}`);
        const project = this.ctx.getProjectByTaskId(task.id);
        if (task.result?.state === "fail" && task.result.errors) {
          this.logger.indent();
          task.result.errors.forEach((error) => {
            const stacks = task.file.pool === "browser" ? project.browser?.parseErrorStacktrace(error) || [] : parseErrorStacktrace(error, {
              frameFilter: this.ctx.config.onStackTrace
            });
            const stack = stacks[0];
            this.logger.log("---");
            this.logger.log("error:");
            this.logger.indent();
            this.logErrorDetails(error);
            this.logger.unindent();
            if (stack) {
              this.logger.log(
                `at: ${yamlString(
                  `${stack.file}:${stack.line}:${stack.column}`
                )}`
              );
            }
            if (error.showDiff) {
              this.logger.log(`actual: ${yamlString(error.actual)}`);
              this.logger.log(`expected: ${yamlString(error.expected)}`);
            }
          });
          this.logger.log("...");
          this.logger.unindent();
        }
      }
    }
  }
  onFinished(files = this.ctx.state.getFiles()) {
    this.logger.log("TAP version 13");
    this.logTasks(files);
  }
}

function flattenTasks(task, baseName = "") {
  const base = baseName ? `${baseName} > ` : "";
  if (task.type === "suite" && task.tasks.length > 0) {
    return task.tasks.flatMap(
      (child) => flattenTasks(child, `${base}${task.name}`)
    );
  } else {
    return [
      {
        ...task,
        name: `${base}${task.name}`
      }
    ];
  }
}
class TapFlatReporter extends TapReporter {
  onInit(ctx) {
    super.onInit(ctx);
  }
  onFinished(files = this.ctx.state.getFiles()) {
    this.ctx.logger.log("TAP version 13");
    const flatTasks = files.flatMap((task) => flattenTasks(task));
    this.logTasks(flatTasks);
  }
}

class VerboseReporter extends DefaultReporter {
  verbose = true;
  constructor() {
    super();
    this.rendererOptions.renderSucceed = true;
  }
  onTaskUpdate(packs) {
    if (this.isTTY) {
      return;
    }
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0]);
      if (task && task.type === "test" && task.result?.state && task.result?.state !== "run") {
        let title = ` ${getStateSymbol(task)} `;
        if (task.file.projectName) {
          title += formatProjectName(task.file.projectName);
        }
        title += getFullName(task, c.dim(" > "));
        if (task.result.duration != null && task.result.duration > this.ctx.config.slowTestThreshold) {
          title += c.yellow(
            ` ${Math.round(task.result.duration)}${c.dim("ms")}`
          );
        }
        if (this.ctx.config.logHeapUsage && task.result.heap != null) {
          title += c.magenta(
            ` ${Math.floor(task.result.heap / 1024 / 1024)} MB heap used`
          );
        }
        this.ctx.logger.log(title);
        if (task.result.state === "fail") {
          task.result.errors?.forEach((error) => {
            this.ctx.logger.log(c.red(`   ${F_RIGHT} ${error?.message}`));
          });
        }
      }
    }
  }
}

const outputMap = /* @__PURE__ */ new WeakMap();
function formatFilepath(path) {
  const lastSlash = Math.max(path.lastIndexOf("/") + 1, 0);
  const basename = path.slice(lastSlash);
  let firstDot = basename.indexOf(".");
  if (firstDot < 0) {
    firstDot = basename.length;
  }
  firstDot += lastSlash;
  return c.dim(path.slice(0, lastSlash)) + path.slice(lastSlash, firstDot) + c.dim(path.slice(firstDot));
}
function formatNumber(number) {
  const res = String(number.toFixed(number < 100 ? 4 : 2)).split(".");
  return res[0].replace(/(?=(?:\d{3})+$)\B/g, ",") + (res[1] ? `.${res[1]}` : "");
}
const tableHead = [
  "name",
  "hz",
  "min",
  "max",
  "mean",
  "p75",
  "p99",
  "p995",
  "p999",
  "rme",
  "samples"
];
function renderBenchmarkItems(result) {
  return [
    result.name,
    formatNumber(result.hz || 0),
    formatNumber(result.min || 0),
    formatNumber(result.max || 0),
    formatNumber(result.mean || 0),
    formatNumber(result.p75 || 0),
    formatNumber(result.p99 || 0),
    formatNumber(result.p995 || 0),
    formatNumber(result.p999 || 0),
    `\xB1${(result.rme || 0).toFixed(2)}%`,
    (result.sampleCount || 0).toString()
  ];
}
function computeColumnWidths(results) {
  const rows = [tableHead, ...results.map((v) => renderBenchmarkItems(v))];
  return Array.from(tableHead, (_, i) => Math.max(...rows.map((row) => stripVTControlCharacters(row[i]).length)));
}
function padRow(row, widths) {
  return row.map(
    (v, i) => i ? v.padStart(widths[i], " ") : v.padEnd(widths[i], " ")
    // name
  );
}
function renderTableHead(widths) {
  return " ".repeat(3) + padRow(tableHead, widths).map(c.bold).join("  ");
}
function renderBenchmark(result, widths) {
  const padded = padRow(renderBenchmarkItems(result), widths);
  return [
    padded[0],
    // name
    c.blue(padded[1]),
    // hz
    c.cyan(padded[2]),
    // min
    c.cyan(padded[3]),
    // max
    c.cyan(padded[4]),
    // mean
    c.cyan(padded[5]),
    // p75
    c.cyan(padded[6]),
    // p99
    c.cyan(padded[7]),
    // p995
    c.cyan(padded[8]),
    // p999
    c.dim(padded[9]),
    // rem
    c.dim(padded[10])
    // sample
  ].join("  ");
}
function renderTree(tasks, options, level = 0, shallow = false) {
  const output = [];
  const benchMap = {};
  for (const t of tasks) {
    if (t.meta.benchmark && t.result?.benchmark) {
      benchMap[t.id] = {
        current: t.result.benchmark
      };
      const baseline = options.compare?.[t.id];
      if (baseline) {
        benchMap[t.id].baseline = baseline;
      }
    }
  }
  const benchCount = Object.entries(benchMap).length;
  const columnWidths = computeColumnWidths(
    Object.values(benchMap).flatMap((v) => [v.current, v.baseline]).filter(notNullish)
  );
  let idx = 0;
  for (const task of tasks) {
    const padding = "  ".repeat(level ? 1 : 0);
    let prefix = "";
    if (idx === 0 && task.meta?.benchmark) {
      prefix += `${renderTableHead(columnWidths)}
${padding}`;
    }
    prefix += ` ${getStateSymbol(task)} `;
    let suffix = "";
    if (task.type === "suite") {
      suffix += c.dim(` (${getTests(task).length})`);
    }
    if (task.mode === "skip" || task.mode === "todo") {
      suffix += ` ${c.dim(c.gray("[skipped]"))}`;
    }
    if (task.result?.duration != null) {
      if (task.result.duration > options.slowTestThreshold) {
        suffix += c.yellow(
          ` ${Math.round(task.result.duration)}${c.dim("ms")}`
        );
      }
    }
    if (options.showHeap && task.result?.heap != null) {
      suffix += c.magenta(
        ` ${Math.floor(task.result.heap / 1024 / 1024)} MB heap used`
      );
    }
    let name = task.name;
    if (level === 0) {
      name = formatFilepath(name);
    }
    const bench = benchMap[task.id];
    if (bench) {
      let body = renderBenchmark(bench.current, columnWidths);
      if (options.compare && bench.baseline) {
        if (bench.current.hz) {
          const diff = bench.current.hz / bench.baseline.hz;
          const diffFixed = diff.toFixed(2);
          if (diffFixed === "1.0.0") {
            body += `  ${c.gray(`[${diffFixed}x]`)}`;
          }
          if (diff > 1) {
            body += `  ${c.blue(`[${diffFixed}x] \u21D1`)}`;
          } else {
            body += `  ${c.red(`[${diffFixed}x] \u21D3`)}`;
          }
        }
        output.push(padding + prefix + body + suffix);
        const bodyBaseline = renderBenchmark(bench.baseline, columnWidths);
        output.push(`${padding}   ${bodyBaseline}  ${c.dim("(baseline)")}`);
      } else {
        if (bench.current.rank === 1 && benchCount > 1) {
          body += `  ${c.bold(c.green(" fastest"))}`;
        }
        if (bench.current.rank === benchCount && benchCount > 2) {
          body += `  ${c.bold(c.gray(" slowest"))}`;
        }
        output.push(padding + prefix + body + suffix);
      }
    } else {
      output.push(padding + prefix + name + suffix);
    }
    if (task.result?.state !== "pass" && outputMap.get(task) != null) {
      let data = outputMap.get(task);
      if (typeof data === "string") {
        data = stripVTControlCharacters(data.trim().split("\n").filter(Boolean).pop());
        if (data === "") {
          data = void 0;
        }
      }
      if (data != null) {
        const out = `${"  ".repeat(level)}${F_RIGHT} ${data}`;
        output.push(`   ${c.gray(cliTruncate(out, getCols(-3)))}`);
      }
    }
    if (!shallow && task.type === "suite" && task.tasks.length > 0) {
      if (task.result?.state) {
        output.push(renderTree(task.tasks, options, level + 1));
      }
    }
    idx++;
  }
  return output.filter(Boolean).join("\n");
}
function createTableRenderer(_tasks, options) {
  let tasks = _tasks;
  let timer;
  const log = options.logger.logUpdate;
  function update() {
    log(renderTree(tasks, options));
  }
  return {
    start() {
      if (timer) {
        return this;
      }
      timer = setInterval(update, 200);
      return this;
    },
    update(_tasks2) {
      tasks = _tasks2;
      update();
      return this;
    },
    stop() {
      if (timer) {
        clearInterval(timer);
        timer = void 0;
      }
      log.clear();
      options.logger.log(renderTree(tasks, options));
      return this;
    },
    clear() {
      log.clear();
    }
  };
}

class TableReporter extends BaseReporter {
  renderer;
  rendererOptions = {};
  onTestRemoved(trigger) {
    this.stopListRender();
    this.ctx.logger.clearScreen(
      c.yellow("Test removed...") + (trigger ? c.dim(` [ ${this.relative(trigger)} ]
`) : ""),
      true
    );
    const files = this.ctx.state.getFiles(this.watchFilters);
    createTableRenderer(files, this.rendererOptions).stop();
    this.ctx.logger.log();
    super.reportSummary(files, this.ctx.state.getUnhandledErrors());
    super.onWatcherStart();
  }
  async onCollected() {
    this.rendererOptions.logger = this.ctx.logger;
    this.rendererOptions.showHeap = this.ctx.config.logHeapUsage;
    this.rendererOptions.slowTestThreshold = this.ctx.config.slowTestThreshold;
    if (this.ctx.config.benchmark?.compare) {
      const compareFile = pathe.resolve(
        this.ctx.config.root,
        this.ctx.config.benchmark?.compare
      );
      try {
        this.rendererOptions.compare = flattenFormattedBenchmarkReport(
          JSON.parse(
            await fs.promises.readFile(compareFile, "utf-8")
          )
        );
      } catch (e) {
        this.ctx.logger.error(`Failed to read '${compareFile}'`, e);
      }
    }
    if (this.isTTY) {
      const files = this.ctx.state.getFiles(this.watchFilters);
      if (!this.renderer) {
        this.renderer = createTableRenderer(
          files,
          this.rendererOptions
        ).start();
      } else {
        this.renderer.update(files);
      }
    }
  }
  onTaskUpdate(packs) {
    if (this.isTTY) {
      return;
    }
    for (const pack of packs) {
      const task = this.ctx.state.idMap.get(pack[0]);
      if (task && task.type === "suite" && task.result?.state && task.result?.state !== "run") {
        const benches = task.tasks.filter((t) => t.meta.benchmark);
        if (benches.length > 0 && benches.every((t) => t.result?.state !== "run")) {
          let title = ` ${getStateSymbol(task)} ${getFullName(
            task,
            c.dim(" > ")
          )}`;
          if (task.result.duration != null && task.result.duration > this.ctx.config.slowTestThreshold) {
            title += c.yellow(
              ` ${Math.round(task.result.duration)}${c.dim("ms")}`
            );
          }
          this.ctx.logger.log(title);
          this.ctx.logger.log(
            renderTree(benches, this.rendererOptions, 1, true)
          );
        }
      }
    }
  }
  async onFinished(files = this.ctx.state.getFiles(), errors = this.ctx.state.getUnhandledErrors()) {
    this.stopListRender();
    this.ctx.logger.log();
    super.onFinished(files, errors);
    let outputFile = this.ctx.config.benchmark?.outputJson;
    if (outputFile) {
      outputFile = pathe.resolve(this.ctx.config.root, outputFile);
      const outputDirectory = pathe.dirname(outputFile);
      if (!fs.existsSync(outputDirectory)) {
        await fs.promises.mkdir(outputDirectory, { recursive: true });
      }
      const output = createFormattedBenchmarkReport(files);
      await fs.promises.writeFile(outputFile, JSON.stringify(output, null, 2));
      this.ctx.logger.log(`Benchmark report written to ${outputFile}`);
    }
  }
  async onWatcherStart() {
    this.stopListRender();
    await super.onWatcherStart();
  }
  stopListRender() {
    this.renderer?.stop();
    this.renderer = void 0;
  }
  async onWatcherRerun(files, trigger) {
    this.stopListRender();
    await super.onWatcherRerun(files, trigger);
  }
  onUserConsoleLog(log) {
    if (!this.shouldLog(log)) {
      return;
    }
    this.renderer?.clear();
    super.onUserConsoleLog(log);
  }
}
function createFormattedBenchmarkReport(files) {
  const report = { files: [] };
  for (const file of files) {
    const groups = [];
    for (const task of getTasks(file)) {
      if (task && task.type === "suite") {
        const benchmarks = [];
        for (const t of task.tasks) {
          const benchmark = t.meta.benchmark && t.result?.benchmark;
          if (benchmark) {
            benchmarks.push({ id: t.id, ...benchmark, samples: [] });
          }
        }
        if (benchmarks.length) {
          groups.push({
            fullName: getFullName(task, " > "),
            benchmarks
          });
        }
      }
    }
    report.files.push({
      filepath: file.filepath,
      groups
    });
  }
  return report;
}
function flattenFormattedBenchmarkReport(report) {
  const flat = {};
  for (const file of report.files) {
    for (const group of file.groups) {
      for (const t of group.benchmarks) {
        flat[t.id] = t;
      }
    }
  }
  return flat;
}

const BenchmarkReportsMap = {
  default: TableReporter,
  verbose: VerboseReporter
};

const TestFile = TestModule;
const ReportersMap = {
  "default": DefaultReporter,
  "basic": BasicReporter,
  "blob": BlobReporter,
  "verbose": VerboseReporter,
  "dot": DotReporter,
  "json": JsonReporter,
  "tap": TapReporter,
  "tap-flat": TapFlatReporter,
  "junit": JUnitReporter,
  "hanging-process": HangingProcessReporter,
  "github-actions": GithubActionsReporter
};

export { BasicReporter as B, DefaultReporter as D, GithubActionsReporter as G, HangingProcessReporter as H, JsonReporter as J, Logger as L, ReportersMap as R, TapFlatReporter as T, VerboseReporter as V, DotReporter as a, JUnitReporter as b, TapReporter as c, TestFile as d, TestCase as e, TestModule as f, TestSuite as g, BenchmarkReportsMap as h, TestProject as i, generateCodeFrame as j, BlobReporter as k, parse as p, readBlobs as r, stringify as s };
