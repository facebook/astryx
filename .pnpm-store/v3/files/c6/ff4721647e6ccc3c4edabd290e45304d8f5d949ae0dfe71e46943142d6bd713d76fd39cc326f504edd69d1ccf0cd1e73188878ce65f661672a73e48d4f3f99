'use strict';

var t = require('@babel/types');
var path = require('path');
var fs = require('fs');
var url = require('url');
var require$$0 = require('assert');
var importMetaResolve = require('@dual-bundle/import-meta-resolve');
var shared = require('@stylexjs/shared');
var core = require('@babel/core');
var traverse = require('@babel/traverse');
var stylex = require('@stylexjs/stylex');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var t__namespace = /*#__PURE__*/_interopNamespaceDefault(t);

var name = "@stylexjs/stylex";

const defaultMessage = expected => (value, name) => name ? `Expected (${name}) to be ${expected}, but got \`${JSON.stringify(value)}\`.` : expected;
const defaultUnionMessage = expected => (value, name) => name ? `Expected (${name}) to be ${expected}` : expected;
const defaultObjectMessage = expected => (value, name) => name ? `Expected (${name}) to be ${expected} but:` : expected;
const indent = str => str.split('\n').filter(line => !line.trim().startsWith('But got:')).map(line => line.includes(', but got') ? line.replace(/, but got.+$/, '') : line).map(line => line.trim()[0] === '-' ? line : `- ${line}`).map(line => `\n\t${line}`).join('');
const string = function () {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMessage('a string');
  return (value, name) => {
    if (typeof value !== 'string') {
      return new Error(message(value, name));
    }
    return value;
  };
};
const nullish = function () {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMessage('`null` or `undefined`');
  return (value, name) => value == null ? value : new Error(message(value, name));
};
const boolean = function () {
  let message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : defaultMessage('a boolean');
  return (value, name) => {
    if (typeof value !== 'boolean') {
      return new Error(message(value, name));
    }
    return value;
  };
};
const literal = function (expected) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMessage(`the literal ${JSON.stringify(expected)}`);
  return (value, name) => {
    if (value === expected) {
      return expected;
    }
    return new Error(message(value, name));
  };
};
const array = function (check) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMessage('an array');
  return function (value) {
    let name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'array';
    if (!Array.isArray(value)) {
      return new Error(message(value, name));
    }
    const validated = value.map((item, i) => check(item, name ? `${name}[${i}]` : undefined));
    const errors = validated.filter(item => item instanceof Error);
    if (errors.length > 0) {
      const errMessageList = errors.map(item => '\t' + item.message).join('\n');
      return new Error(`Failed to validate ${name}:\n${errMessageList}`);
    }
    return validated.filter(item => !(item instanceof Error));
  };
};
const object = function (shape) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultMessage('an object where:');
  return (value, name) => {
    if (typeof value !== 'object' || value == null) {
      return new Error(message(value, name));
    }
    const result = {};
    for (const key in shape) {
      const check = shape[key];
      const item = check(value[key], name ? `${name}.${key}` : `obj.${key}`);
      if (item instanceof Error) {
        const objectDescription = Object.entries(shape).map(_ref => {
          let [key, check] = _ref;
          let msg = check(Symbol()).message;
          if (msg.includes('\n')) {
            msg = indent(indent(msg)).split('\n').slice(1).join('\n');
          }
          return `\t- Expected "${key}": to be ${msg}`;
        }).join('\n');
        return new Error(`${message(value, name)}\n${objectDescription}\nBut got: ${indent(JSON.stringify(value))}`);
      }
      result[key] = item;
    }
    return result;
  };
};
const objectOf = function (check) {
  let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : defaultObjectMessage('an object');
  return (value, name) => {
    if (typeof value !== 'object' || value == null) {
      return new Error(message(value, name));
    }
    const result = {};
    for (const key in value) {
      const item = check(value[key], name ? `${name}.${key}` : `With the key '${key}':`);
      if (item instanceof Error) {
        return new Error(`${message(value, name)}${indent(item.message)}\nBut got: ${indent(JSON.stringify(value))}`);
      }
      result[key] = item;
    }
    return result;
  };
};
const unionOf = function (a, b) {
  let message = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : defaultUnionMessage('one of');
  return (value, name) => {
    const resultA = a(value);
    if (!(resultA instanceof Error)) {
      return resultA;
    }
    const resultB = b(value);
    if (!(resultB instanceof Error)) {
      return resultB;
    }
    return new Error(`${message(value, name)}${indent(resultA.message)}${indent(resultB.message)}\nBut got: ${JSON.stringify(value)}`);
  };
};
const unionOf3 = function (a, b, c) {
  let message = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : defaultUnionMessage('one of');
  return (value, name) => {
    const resultA = a(value);
    if (!(resultA instanceof Error)) {
      return resultA;
    }
    const resultB = b(value);
    if (!(resultB instanceof Error)) {
      return resultB;
    }
    const resultC = c(value);
    if (!(resultC instanceof Error)) {
      return resultC;
    }
    return new Error(`${message(value, name)}${indent(resultA.message)}${indent(resultB.message)}${indent(resultC.message)}\nBut got: ${JSON.stringify(value)}`);
  };
};
const logAndDefault = (check, value, def, name) => {
  const result = check(value, name);
  if (result instanceof Error) {
    console.error('[@stylexjs/babel-plugin]', result.message);
    return def;
  }
  return result;
};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var lib$1 = {};

var importInjector = {};

var importBuilder = {};

var hasRequiredImportBuilder;

function requireImportBuilder () {
	if (hasRequiredImportBuilder) return importBuilder;
	hasRequiredImportBuilder = 1;

	Object.defineProperty(importBuilder, "__esModule", {
	  value: true
	});
	importBuilder.default = void 0;
	var _assert = require$$0;
	var _t = t;
	const {
	  callExpression,
	  cloneNode,
	  expressionStatement,
	  identifier,
	  importDeclaration,
	  importDefaultSpecifier,
	  importNamespaceSpecifier,
	  importSpecifier,
	  memberExpression,
	  stringLiteral,
	  variableDeclaration,
	  variableDeclarator
	} = _t;
	class ImportBuilder {
	  constructor(importedSource, scope, hub) {
	    this._statements = [];
	    this._resultName = null;
	    this._importedSource = void 0;
	    this._scope = scope;
	    this._hub = hub;
	    this._importedSource = importedSource;
	  }
	  done() {
	    return {
	      statements: this._statements,
	      resultName: this._resultName
	    };
	  }
	  import() {
	    this._statements.push(importDeclaration([], stringLiteral(this._importedSource)));
	    return this;
	  }
	  require() {
	    this._statements.push(expressionStatement(callExpression(identifier("require"), [stringLiteral(this._importedSource)])));
	    return this;
	  }
	  namespace(name = "namespace") {
	    const local = this._scope.generateUidIdentifier(name);
	    const statement = this._statements[this._statements.length - 1];
	    _assert(statement.type === "ImportDeclaration");
	    _assert(statement.specifiers.length === 0);
	    statement.specifiers = [importNamespaceSpecifier(local)];
	    this._resultName = cloneNode(local);
	    return this;
	  }
	  default(name) {
	    const id = this._scope.generateUidIdentifier(name);
	    const statement = this._statements[this._statements.length - 1];
	    _assert(statement.type === "ImportDeclaration");
	    _assert(statement.specifiers.length === 0);
	    statement.specifiers = [importDefaultSpecifier(id)];
	    this._resultName = cloneNode(id);
	    return this;
	  }
	  named(name, importName) {
	    if (importName === "default") return this.default(name);
	    const id = this._scope.generateUidIdentifier(name);
	    const statement = this._statements[this._statements.length - 1];
	    _assert(statement.type === "ImportDeclaration");
	    _assert(statement.specifiers.length === 0);
	    statement.specifiers = [importSpecifier(id, identifier(importName))];
	    this._resultName = cloneNode(id);
	    return this;
	  }
	  var(name) {
	    const id = this._scope.generateUidIdentifier(name);
	    let statement = this._statements[this._statements.length - 1];
	    if (statement.type !== "ExpressionStatement") {
	      _assert(this._resultName);
	      statement = expressionStatement(this._resultName);
	      this._statements.push(statement);
	    }
	    this._statements[this._statements.length - 1] = variableDeclaration("var", [variableDeclarator(id, statement.expression)]);
	    this._resultName = cloneNode(id);
	    return this;
	  }
	  defaultInterop() {
	    return this._interop(this._hub.addHelper("interopRequireDefault"));
	  }
	  wildcardInterop() {
	    return this._interop(this._hub.addHelper("interopRequireWildcard"));
	  }
	  _interop(callee) {
	    const statement = this._statements[this._statements.length - 1];
	    if (statement.type === "ExpressionStatement") {
	      statement.expression = callExpression(callee, [statement.expression]);
	    } else if (statement.type === "VariableDeclaration") {
	      _assert(statement.declarations.length === 1);
	      statement.declarations[0].init = callExpression(callee, [statement.declarations[0].init]);
	    } else {
	      _assert.fail("Unexpected type.");
	    }
	    return this;
	  }
	  prop(name) {
	    const statement = this._statements[this._statements.length - 1];
	    if (statement.type === "ExpressionStatement") {
	      statement.expression = memberExpression(statement.expression, identifier(name));
	    } else if (statement.type === "VariableDeclaration") {
	      _assert(statement.declarations.length === 1);
	      statement.declarations[0].init = memberExpression(statement.declarations[0].init, identifier(name));
	    } else {
	      _assert.fail("Unexpected type:" + statement.type);
	    }
	    return this;
	  }
	  read(name) {
	    this._resultName = memberExpression(this._resultName, identifier(name));
	  }
	}
	importBuilder.default = ImportBuilder;

	
	return importBuilder;
}

var isModule = {};

var hasRequiredIsModule;

function requireIsModule () {
	if (hasRequiredIsModule) return isModule;
	hasRequiredIsModule = 1;

	Object.defineProperty(isModule, "__esModule", {
	  value: true
	});
	isModule.default = isModule$1;
	function isModule$1(path) {
	  return path.node.sourceType === "module";
	}

	
	return isModule;
}

var hasRequiredImportInjector;

function requireImportInjector () {
	if (hasRequiredImportInjector) return importInjector;
	hasRequiredImportInjector = 1;

	Object.defineProperty(importInjector, "__esModule", {
	  value: true
	});
	importInjector.default = void 0;
	var _assert = require$$0;
	var _t = t;
	var _importBuilder = requireImportBuilder();
	var _isModule = requireIsModule();
	const {
	  identifier,
	  importSpecifier,
	  numericLiteral,
	  sequenceExpression,
	  isImportDeclaration
	} = _t;
	class ImportInjector {
	  constructor(path, importedSource, opts) {
	    this._defaultOpts = {
	      importedSource: null,
	      importedType: "commonjs",
	      importedInterop: "babel",
	      importingInterop: "babel",
	      ensureLiveReference: false,
	      ensureNoContext: false,
	      importPosition: "before"
	    };
	    const programPath = path.find(p => p.isProgram());
	    this._programPath = programPath;
	    this._programScope = programPath.scope;
	    this._hub = programPath.hub;
	    this._defaultOpts = this._applyDefaults(importedSource, opts, true);
	  }
	  addDefault(importedSourceIn, opts) {
	    return this.addNamed("default", importedSourceIn, opts);
	  }
	  addNamed(importName, importedSourceIn, opts) {
	    _assert(typeof importName === "string");
	    return this._generateImport(this._applyDefaults(importedSourceIn, opts), importName);
	  }
	  addNamespace(importedSourceIn, opts) {
	    return this._generateImport(this._applyDefaults(importedSourceIn, opts), null);
	  }
	  addSideEffect(importedSourceIn, opts) {
	    return this._generateImport(this._applyDefaults(importedSourceIn, opts), void 0);
	  }
	  _applyDefaults(importedSource, opts, isInit = false) {
	    let newOpts;
	    if (typeof importedSource === "string") {
	      newOpts = Object.assign({}, this._defaultOpts, {
	        importedSource
	      }, opts);
	    } else {
	      _assert(!opts, "Unexpected secondary arguments.");
	      newOpts = Object.assign({}, this._defaultOpts, importedSource);
	    }
	    if (!isInit && opts) {
	      if (opts.nameHint !== undefined) newOpts.nameHint = opts.nameHint;
	      if (opts.blockHoist !== undefined) newOpts.blockHoist = opts.blockHoist;
	    }
	    return newOpts;
	  }
	  _generateImport(opts, importName) {
	    const isDefault = importName === "default";
	    const isNamed = !!importName && !isDefault;
	    const isNamespace = importName === null;
	    const {
	      importedSource,
	      importedType,
	      importedInterop,
	      importingInterop,
	      ensureLiveReference,
	      ensureNoContext,
	      nameHint,
	      importPosition,
	      blockHoist
	    } = opts;
	    let name = nameHint || importName;
	    const isMod = (0, _isModule.default)(this._programPath);
	    const isModuleForNode = isMod && importingInterop === "node";
	    const isModuleForBabel = isMod && importingInterop === "babel";
	    if (importPosition === "after" && !isMod) {
	      throw new Error(`"importPosition": "after" is only supported in modules`);
	    }
	    const builder = new _importBuilder.default(importedSource, this._programScope, this._hub);
	    if (importedType === "es6") {
	      if (!isModuleForNode && !isModuleForBabel) {
	        throw new Error("Cannot import an ES6 module from CommonJS");
	      }
	      builder.import();
	      if (isNamespace) {
	        builder.namespace(nameHint || importedSource);
	      } else if (isDefault || isNamed) {
	        builder.named(name, importName);
	      }
	    } else if (importedType !== "commonjs") {
	      throw new Error(`Unexpected interopType "${importedType}"`);
	    } else if (importedInterop === "babel") {
	      if (isModuleForNode) {
	        name = name !== "default" ? name : importedSource;
	        const es6Default = `${importedSource}$es6Default`;
	        builder.import();
	        if (isNamespace) {
	          builder.default(es6Default).var(name || importedSource).wildcardInterop();
	        } else if (isDefault) {
	          if (ensureLiveReference) {
	            builder.default(es6Default).var(name || importedSource).defaultInterop().read("default");
	          } else {
	            builder.default(es6Default).var(name).defaultInterop().prop(importName);
	          }
	        } else if (isNamed) {
	          builder.default(es6Default).read(importName);
	        }
	      } else if (isModuleForBabel) {
	        builder.import();
	        if (isNamespace) {
	          builder.namespace(name || importedSource);
	        } else if (isDefault || isNamed) {
	          builder.named(name, importName);
	        }
	      } else {
	        builder.require();
	        if (isNamespace) {
	          builder.var(name || importedSource).wildcardInterop();
	        } else if ((isDefault || isNamed) && ensureLiveReference) {
	          if (isDefault) {
	            name = name !== "default" ? name : importedSource;
	            builder.var(name).read(importName);
	            builder.defaultInterop();
	          } else {
	            builder.var(importedSource).read(importName);
	          }
	        } else if (isDefault) {
	          builder.var(name).defaultInterop().prop(importName);
	        } else if (isNamed) {
	          builder.var(name).prop(importName);
	        }
	      }
	    } else if (importedInterop === "compiled") {
	      if (isModuleForNode) {
	        builder.import();
	        if (isNamespace) {
	          builder.default(name || importedSource);
	        } else if (isDefault || isNamed) {
	          builder.default(importedSource).read(name);
	        }
	      } else if (isModuleForBabel) {
	        builder.import();
	        if (isNamespace) {
	          builder.namespace(name || importedSource);
	        } else if (isDefault || isNamed) {
	          builder.named(name, importName);
	        }
	      } else {
	        builder.require();
	        if (isNamespace) {
	          builder.var(name || importedSource);
	        } else if (isDefault || isNamed) {
	          if (ensureLiveReference) {
	            builder.var(importedSource).read(name);
	          } else {
	            builder.prop(importName).var(name);
	          }
	        }
	      }
	    } else if (importedInterop === "uncompiled") {
	      if (isDefault && ensureLiveReference) {
	        throw new Error("No live reference for commonjs default");
	      }
	      if (isModuleForNode) {
	        builder.import();
	        if (isNamespace) {
	          builder.default(name || importedSource);
	        } else if (isDefault) {
	          builder.default(name);
	        } else if (isNamed) {
	          builder.default(importedSource).read(name);
	        }
	      } else if (isModuleForBabel) {
	        builder.import();
	        if (isNamespace) {
	          builder.default(name || importedSource);
	        } else if (isDefault) {
	          builder.default(name);
	        } else if (isNamed) {
	          builder.named(name, importName);
	        }
	      } else {
	        builder.require();
	        if (isNamespace) {
	          builder.var(name || importedSource);
	        } else if (isDefault) {
	          builder.var(name);
	        } else if (isNamed) {
	          if (ensureLiveReference) {
	            builder.var(importedSource).read(name);
	          } else {
	            builder.var(name).prop(importName);
	          }
	        }
	      }
	    } else {
	      throw new Error(`Unknown importedInterop "${importedInterop}".`);
	    }
	    const {
	      statements,
	      resultName
	    } = builder.done();
	    this._insertStatements(statements, importPosition, blockHoist);
	    if ((isDefault || isNamed) && ensureNoContext && resultName.type !== "Identifier") {
	      return sequenceExpression([numericLiteral(0), resultName]);
	    }
	    return resultName;
	  }
	  _insertStatements(statements, importPosition = "before", blockHoist = 3) {
	    if (importPosition === "after") {
	      if (this._insertStatementsAfter(statements)) return;
	    } else {
	      if (this._insertStatementsBefore(statements, blockHoist)) return;
	    }
	    this._programPath.unshiftContainer("body", statements);
	  }
	  _insertStatementsBefore(statements, blockHoist) {
	    if (statements.length === 1 && isImportDeclaration(statements[0]) && isValueImport(statements[0])) {
	      const firstImportDecl = this._programPath.get("body").find(p => {
	        return p.isImportDeclaration() && isValueImport(p.node);
	      });
	      if ((firstImportDecl == null ? void 0 : firstImportDecl.node.source.value) === statements[0].source.value && maybeAppendImportSpecifiers(firstImportDecl.node, statements[0])) {
	        return true;
	      }
	    }
	    statements.forEach(node => {
	      node._blockHoist = blockHoist;
	    });
	    const targetPath = this._programPath.get("body").find(p => {
	      const val = p.node._blockHoist;
	      return Number.isFinite(val) && val < 4;
	    });
	    if (targetPath) {
	      targetPath.insertBefore(statements);
	      return true;
	    }
	    return false;
	  }
	  _insertStatementsAfter(statements) {
	    const statementsSet = new Set(statements);
	    const importDeclarations = new Map();
	    for (const statement of statements) {
	      if (isImportDeclaration(statement) && isValueImport(statement)) {
	        const source = statement.source.value;
	        if (!importDeclarations.has(source)) importDeclarations.set(source, []);
	        importDeclarations.get(source).push(statement);
	      }
	    }
	    let lastImportPath = null;
	    for (const bodyStmt of this._programPath.get("body")) {
	      if (bodyStmt.isImportDeclaration() && isValueImport(bodyStmt.node)) {
	        lastImportPath = bodyStmt;
	        const source = bodyStmt.node.source.value;
	        const newImports = importDeclarations.get(source);
	        if (!newImports) continue;
	        for (const decl of newImports) {
	          if (!statementsSet.has(decl)) continue;
	          if (maybeAppendImportSpecifiers(bodyStmt.node, decl)) {
	            statementsSet.delete(decl);
	          }
	        }
	      }
	    }
	    if (statementsSet.size === 0) return true;
	    if (lastImportPath) lastImportPath.insertAfter(Array.from(statementsSet));
	    return !!lastImportPath;
	  }
	}
	importInjector.default = ImportInjector;
	function isValueImport(node) {
	  return node.importKind !== "type" && node.importKind !== "typeof";
	}
	function hasNamespaceImport(node) {
	  return node.specifiers.length === 1 && node.specifiers[0].type === "ImportNamespaceSpecifier" || node.specifiers.length === 2 && node.specifiers[1].type === "ImportNamespaceSpecifier";
	}
	function hasDefaultImport(node) {
	  return node.specifiers.length > 0 && node.specifiers[0].type === "ImportDefaultSpecifier";
	}
	function maybeAppendImportSpecifiers(target, source) {
	  if (!target.specifiers.length) {
	    target.specifiers = source.specifiers;
	    return true;
	  }
	  if (!source.specifiers.length) return true;
	  if (hasNamespaceImport(target) || hasNamespaceImport(source)) return false;
	  if (hasDefaultImport(source)) {
	    if (hasDefaultImport(target)) {
	      source.specifiers[0] = importSpecifier(source.specifiers[0].local, identifier("default"));
	    } else {
	      target.specifiers.unshift(source.specifiers.shift());
	    }
	  }
	  target.specifiers.push(...source.specifiers);
	  return true;
	}

	
	return importInjector;
}

var hasRequiredLib$1;

function requireLib$1 () {
	if (hasRequiredLib$1) return lib$1;
	hasRequiredLib$1 = 1;
	(function (exports) {

		Object.defineProperty(exports, "__esModule", {
		  value: true
		});
		Object.defineProperty(exports, "ImportInjector", {
		  enumerable: true,
		  get: function () {
		    return _importInjector.default;
		  }
		});
		exports.addDefault = addDefault;
		exports.addNamed = addNamed;
		exports.addNamespace = addNamespace;
		exports.addSideEffect = addSideEffect;
		Object.defineProperty(exports, "isModule", {
		  enumerable: true,
		  get: function () {
		    return _isModule.default;
		  }
		});
		var _importInjector = requireImportInjector();
		var _isModule = requireIsModule();
		function addDefault(path, importedSource, opts) {
		  return new _importInjector.default(path).addDefault(importedSource, opts);
		}
		function addNamed(path, name, importedSource, opts) {
		  return new _importInjector.default(path).addNamed(name, importedSource, opts);
		}
		function addNamespace(path, importedSource, opts) {
		  return new _importInjector.default(path).addNamespace(importedSource, opts);
		}
		function addSideEffect(path, importedSource, opts) {
		  return new _importInjector.default(path).addSideEffect(importedSource, opts);
		}

		
	} (lib$1));
	return lib$1;
}

var libExports = requireLib$1();

const CheckModuleResolution = unionOf3(object({
  type: literal('commonJS'),
  rootDir: unionOf(nullish(), string()),
  themeFileExtension: unionOf(nullish(), string())
}), object({
  type: literal('haste'),
  themeFileExtension: unionOf(nullish(), string())
}), object({
  type: literal('experimental_crossFileParsing'),
  rootDir: string(),
  themeFileExtension: unionOf(nullish(), string())
}));
const checkImportSource = unionOf(string(), object({
  from: string(),
  as: string()
}));
const checkImportSources = array(checkImportSource);
const checkRuntimeInjection = unionOf3(boolean(), string(), object({
  from: string(),
  as: string()
}));
const DEFAULT_INJECT_PATH = '@stylexjs/stylex/lib/stylex-inject';
class StateManager {
  importPaths = (() => new Set())();
  stylexImport = (() => new Set())();
  stylexPropsImport = (() => new Set())();
  stylexAttrsImport = (() => new Set())();
  stylexCreateImport = (() => new Set())();
  stylexIncludeImport = (() => new Set())();
  stylexFirstThatWorksImport = (() => new Set())();
  stylexKeyframesImport = (() => new Set())();
  stylexDefineVarsImport = (() => new Set())();
  stylexCreateThemeImport = (() => new Set())();
  stylexTypesImport = (() => new Set())();
  injectImportInserted = null;
  styleMap = (() => new Map())();
  styleVars = (() => new Map())();
  styleVarsToKeep = (() => new Set())();
  inStyleXCreate = false;
  constructor(state) {
    this._state = state;
    state.file.metadata.stylex = [];
    this.options = this.setOptions(state.opts ?? {});
  }
  setOptions(options) {
    const dev = logAndDefault(boolean(), options.dev ?? false, false, 'options.dev');
    const debug = logAndDefault(boolean(), options.debug ?? dev, false, 'options.debug');
    const enableDebugClassNames = logAndDefault(boolean(), options.enableDebugClassNames ?? true, true, 'options.enableDebugClassNames');
    const enableDebugDataProp = logAndDefault(boolean(), options.enableDebugDataProp ?? true, true, 'options.enableDebugDataProp');
    const enableDevClassNames = logAndDefault(boolean(), options.enableDevClassNames ?? false, false, 'options.enableDevClassNames');
    const test = logAndDefault(boolean(), options.test ?? false, false, 'options.test');
    const configRuntimeInjection = logAndDefault(checkRuntimeInjection, options.runtimeInjection ?? dev, dev, 'options.runtimeInjection');
    const runtimeInjection = configRuntimeInjection === true ? DEFAULT_INJECT_PATH : configRuntimeInjection === false ? undefined : configRuntimeInjection;
    const classNamePrefix = logAndDefault(string(), options.classNamePrefix ?? 'x', 'x', 'options.classNamePrefix');
    const configuredImportSources = logAndDefault(checkImportSources, options.importSources ?? [], [], 'options.importSources');
    const importSources = [name, 'stylex', ...configuredImportSources];
    const genConditionalClasses = logAndDefault(boolean(), options.genConditionalClasses ?? false, false, 'options.genConditionalClasses');
    const useRemForFontSize = logAndDefault(boolean(), options.useRemForFontSize ?? false, false, 'options.useRemForFontSize');
    const styleResolution = logAndDefault(unionOf3(literal('application-order'), literal('property-specificity'), literal('legacy-expand-shorthands')), options.styleResolution ?? 'application-order', 'application-order', 'options.styleResolution');
    const unstable_moduleResolution = logAndDefault(unionOf(nullish(), CheckModuleResolution), options.unstable_moduleResolution, null, 'options.unstable_moduleResolution');
    const treeshakeCompensation = logAndDefault(boolean(), options.treeshakeCompensation ?? false, false, 'options.treeshakeCompensation');
    const aliasesOption = logAndDefault(unionOf(nullish(), objectOf(unionOf(string(), array(string())))), options.aliases, null, 'options.aliases');
    const aliases = aliasesOption == null ? aliasesOption : Object.fromEntries(Object.entries(aliasesOption).map(_ref => {
      let [key, value] = _ref;
      if (typeof value === 'string') {
        return [key, [value]];
      }
      return [key, value];
    }));
    const opts = {
      aliases,
      classNamePrefix,
      debug,
      definedStylexCSSVariables: {},
      dev,
      enableDebugClassNames,
      enableDebugDataProp,
      enableDevClassNames,
      genConditionalClasses,
      importSources,
      rewriteAliases: typeof options.rewriteAliases === 'boolean' ? options.rewriteAliases : false,
      runtimeInjection,
      styleResolution,
      test,
      treeshakeCompensation,
      unstable_moduleResolution,
      useRemForFontSize
    };
    return opts;
  }
  get importPathString() {
    if (this.importPaths.has('@stylexjs/stylex')) {
      return '@stylexjs/stylex';
    }
    if (this.importPaths.size > 0) {
      return [...this.importPaths][0];
    }
    return '@stylexjs/stylex';
  }
  get importSources() {
    return this.options.importSources.map(source => typeof source === 'string' ? source : source.from);
  }
  importAs(source) {
    for (const importSource of this.options.importSources) {
      if (typeof importSource !== 'string' && importSource.from === source) {
        return importSource.as;
      }
    }
    return null;
  }
  get canReferenceTheme() {
    return !!this.inStyleXCreate;
  }
  get metadata() {
    return this._state.file.metadata;
  }
  get runtimeInjection() {
    if (this.options.runtimeInjection == null) {
      return null;
    }
    const runInj = this.options.runtimeInjection;
    return typeof runInj === 'string' ? {
      from: runInj
    } : runInj || null;
  }
  addNamedImport(statementPath, as, from, options) {
    const identifier = libExports.addNamed(statementPath, as, from, options);
    const programPath = getProgramPath(statementPath);
    if (programPath == null) {
      return identifier;
    }
    const bodyPath = programPath.get('body');
    let targetImportIndex = -1;
    for (let i = 0; i < bodyPath.length; i++) {
      const statement = bodyPath[i];
      if (statement.isImportDeclaration()) {
        targetImportIndex = i;
        if (statement.node.specifiers.find(s => s.type === 'ImportSpecifier' && s.local.type === 'Identifier' && s.local.name === identifier.name)) {
          break;
        }
      }
    }
    if (targetImportIndex === -1) {
      return identifier;
    }
    const lastImport = bodyPath[targetImportIndex];
    if (lastImport == null) {
      return identifier;
    }
    const importName = statementPath.scope.generateUidIdentifier(as);
    lastImport.insertAfter(t__namespace.variableDeclaration('var', [t__namespace.variableDeclarator(importName, identifier)]));
    return importName;
  }
  addDefaultImport(statementPath, from, options) {
    const identifier = libExports.addDefault(statementPath, from, options);
    const programPath = getProgramPath(statementPath);
    if (programPath == null) {
      return identifier;
    }
    const bodyPath = programPath.get('body');
    let targetImportIndex = -1;
    for (let i = 0; i < bodyPath.length; i++) {
      const statement = bodyPath[i];
      if (statement.isImportDeclaration()) {
        targetImportIndex = i;
        if (statement.node.specifiers.find(s => s.type === 'ImportDefaultSpecifier' && s.local.type === 'Identifier' && s.local.name === identifier.name)) {
          break;
        }
      }
    }
    if (targetImportIndex === -1) {
      return identifier;
    }
    const lastImport = bodyPath[targetImportIndex];
    if (lastImport == null) {
      return identifier;
    }
    const importName = statementPath.scope.generateUidIdentifier('inject');
    lastImport.insertAfter(t__namespace.variableDeclaration('var', [t__namespace.variableDeclarator(importName, identifier)]));
    return importName;
  }
  get opts() {
    return {
      ...this.options
    };
  }
  get isDebug() {
    return !!this.options.debug;
  }
  get isDev() {
    return !!this.options.dev;
  }
  get isTest() {
    return !!this.options.test;
  }
  get filename() {
    return this._state.filename;
  }
  get cssVars() {
    return this.options.definedStylexCSSVariables;
  }
  get treeshakeCompensation() {
    return !!this.options.treeshakeCompensation;
  }
  get fileNameForHashing() {
    const filename = this.filename;
    const themeFileExtension = this.options.unstable_moduleResolution?.themeFileExtension ?? '.stylex';
    if (filename == null || !matchesFileSuffix(themeFileExtension)(filename) || this.options.unstable_moduleResolution == null) {
      return null;
    }
    switch (this.options.unstable_moduleResolution.type) {
      case 'haste':
        return path.basename(filename);
      default:
        return this.getCanonicalFilePath(filename);
    }
  }
  getPackageNameAndPath(filepath) {
    const folder = path.dirname(filepath);
    const hasPackageJSON = fs.existsSync(path.join(folder, 'package.json'));
    if (hasPackageJSON) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(path.join(folder, 'package.json'), 'utf8'));
        const name = packageJson.name;
        return [name, folder];
      } catch (err) {
        console.error(err);
        return null;
      }
    } else {
      if (folder === path.parse(folder).root || folder === '') {
        return null;
      }
      return this.getPackageNameAndPath(folder);
    }
  }
  getCanonicalFilePath(filePath) {
    const pkgNameAndPath = this.getPackageNameAndPath(filePath);
    if (pkgNameAndPath == null) {
      const rootDir = this.options.unstable_moduleResolution?.rootDir;
      if (rootDir != null) {
        return path.relative(rootDir, filePath);
      }
      const fileName = path.relative(path.dirname(filePath), filePath);
      return `_unknown_path_:${fileName}`;
    }
    const [packageName, packageDir] = pkgNameAndPath;
    return `${packageName}:${path.relative(packageDir, filePath)}`;
  }
  importPathResolver(importPath) {
    const sourceFilePath = this.filename;
    if (sourceFilePath == null) {
      return false;
    }
    switch (this.options.unstable_moduleResolution?.type) {
      case 'commonJS':
        {
          const aliases = this.options.aliases;
          const themeFileExtension = this.options.unstable_moduleResolution?.themeFileExtension ?? '.stylex';
          if (!matchesFileSuffix(themeFileExtension)(importPath)) {
            return false;
          }
          const resolvedFilePath = filePathResolver(importPath, sourceFilePath, aliases);
          return resolvedFilePath ? ['themeNameRef', this.getCanonicalFilePath(resolvedFilePath)] : false;
        }
      case 'haste':
        {
          const themeFileExtension = this.options.unstable_moduleResolution.themeFileExtension ?? '.stylex';
          if (!matchesFileSuffix(themeFileExtension)(importPath)) {
            return false;
          }
          return ['themeNameRef', addFileExtension(importPath, sourceFilePath)];
        }
      case 'experimental_crossFileParsing':
        {
          const aliases = this.options.aliases;
          const themeFileExtension = this.options.unstable_moduleResolution.themeFileExtension ?? '.stylex';
          if (!matchesFileSuffix(themeFileExtension)(importPath)) {
            return false;
          }
          const resolvedFilePath = filePathResolver(importPath, sourceFilePath, aliases);
          return resolvedFilePath ? ['filePath', resolvedFilePath] : false;
        }
      default:
        return false;
    }
  }
  addStyle(style) {
    this.metadata.stylex.push(style);
  }
  registerStyles(styles, path) {
    if (styles.length === 0) {
      return;
    }
    styles.forEach(style => this.addStyle(style));
    if (path == null || this.runtimeInjection == null) {
      return;
    }
    const runtimeInjection = this.runtimeInjection;
    const statementPath = path.parentPath != null && path.parentPath.isProgram() ? path : getProgramStatement(path);
    let injectName;
    if (this.injectImportInserted != null) {
      injectName = this.injectImportInserted;
    } else {
      const {
        from,
        as
      } = runtimeInjection;
      injectName = as != null ? this.addNamedImport(statementPath, as, from, {
        nameHint: 'inject'
      }) : this.addDefaultImport(statementPath, from, {
        nameHint: 'inject'
      });
      this.injectImportInserted = injectName;
    }
    for (const [_key, {
      ltr,
      rtl
    }, priority] of styles) {
      statementPath.insertBefore(t__namespace.expressionStatement(t__namespace.callExpression(injectName, [t__namespace.stringLiteral(ltr), t__namespace.numericLiteral(priority), ...(rtl != null ? [t__namespace.stringLiteral(rtl)] : [])])));
    }
  }
  markComposedNamespace(memberExpression) {
    this.styleVarsToKeep.add(memberExpression);
  }
}
function possibleAliasedPaths(importPath, aliases) {
  const result = [importPath];
  if (aliases == null || Object.keys(aliases).length === 0) {
    return result;
  }
  for (const [alias, value] of Object.entries(aliases)) {
    if (alias.includes('*')) {
      const [before, after] = alias.split('*');
      if (importPath.startsWith(before) && importPath.endsWith(after)) {
        const replacementString = importPath.slice(before.length, after.length > 0 ? -after.length : undefined);
        value.forEach(v => {
          result.push(v.split('*').join(replacementString));
        });
      }
    } else if (alias === importPath) {
      value.forEach(v => {
        result.push(v);
      });
    }
  }
  return result;
}
const getPossibleFilePaths = filePath => {
  const extension = path.extname(filePath);
  const filePathHasCodeExtension = EXTENSIONS.includes(extension);
  const filePathNoCodeExtension = filePathHasCodeExtension ? filePath.slice(0, -extension.length) : filePath;
  return [filePath, ...EXTENSIONS.map(ext => filePathNoCodeExtension + ext)];
};
const filePathResolver = (relativeFilePath, sourceFilePath, aliases) => {
  for (const importPathStr of getPossibleFilePaths(relativeFilePath)) {
    if (importPathStr.startsWith('.')) {
      try {
        return url.fileURLToPath(importMetaResolve.moduleResolve(importPathStr, url.pathToFileURL(sourceFilePath)));
      } catch {
        continue;
      }
    }
    const allAliases = possibleAliasedPaths(importPathStr, aliases);
    for (const possiblePath of allAliases) {
      try {
        return url.fileURLToPath(importMetaResolve.moduleResolve(possiblePath, url.pathToFileURL(sourceFilePath)));
      } catch {
        continue;
      }
    }
  }
  return null;
};
const EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs'];
const addFileExtension = (importedFilePath, sourceFile) => {
  if (EXTENSIONS.some(ext => importedFilePath.endsWith(ext))) {
    return importedFilePath;
  }
  const fileExtension = path.extname(sourceFile);
  return importedFilePath + fileExtension;
};
const matchesFileSuffix = allowedSuffix => filename => ['', ...EXTENSIONS].some(extension => filename.endsWith(`${allowedSuffix}${extension}`));
const getProgramPath = path => {
  let programPath = path;
  while (programPath != null && !programPath.isProgram()) {
    if (programPath.parentPath) {
      programPath = programPath.parentPath;
    } else {
      return null;
    }
  }
  return programPath;
};
const getProgramStatement = path => {
  let programPath = path;
  while (programPath.parentPath != null && !programPath.parentPath.isProgram() && programPath.parentPath != null) {
    programPath = programPath.parentPath;
  }
  return programPath;
};
function getRelativePath(from, to) {
  const relativePath = path.relative(path.parse(from).dir, to);
  return formatRelativePath(toPosixPath(relativePath));
}
function toPosixPath(filePath) {
  return filePath.split(path.sep).join(path.posix.sep);
}
function formatRelativePath(filePath) {
  return filePath.startsWith('.') ? filePath : './' + filePath;
}

function readImportDeclarations(path, state) {
  const {
    node
  } = path;
  if (node?.importKind === 'type' || node?.importKind === 'typeof') {
    return;
  }
  const sourcePath = node.source.value;
  if (state.importSources.includes(sourcePath)) {
    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier' && state.importAs(sourcePath) === null) {
        state.importPaths.add(sourcePath);
        state.stylexImport.add(specifier.local.name);
      }
      if (specifier.type === 'ImportNamespaceSpecifier' && state.importAs(sourcePath) === null) {
        state.importPaths.add(sourcePath);
        state.stylexImport.add(specifier.local.name);
      }
      if (specifier.type === 'ImportSpecifier') {
        if (specifier.imported.type === 'Identifier' || specifier.imported.type === 'StringLiteral') {
          const importedName = specifier.imported.type === 'Identifier' ? specifier.imported.name : specifier.imported.value;
          const localName = specifier.local.name;
          if (state.importAs(sourcePath) === importedName) {
            state.importPaths.add(sourcePath);
            state.stylexImport.add(localName);
          }
          if (state.importAs(sourcePath) === null) {
            state.importPaths.add(sourcePath);
            if (importedName === 'create') {
              state.stylexCreateImport.add(localName);
            }
            if (importedName === 'props') {
              state.stylexPropsImport.add(localName);
            }
            if (importedName === 'attrs') {
              state.stylexAttrsImport.add(localName);
            }
            if (importedName === 'keyframes') {
              state.stylexKeyframesImport.add(localName);
            }
            if (importedName === 'include') {
              state.stylexIncludeImport.add(localName);
            }
            if (importedName === 'firstThatWorks') {
              state.stylexFirstThatWorksImport.add(localName);
            }
            if (importedName === 'defineVars') {
              state.stylexDefineVarsImport.add(localName);
            }
            if (importedName === 'createTheme') {
              state.stylexCreateThemeImport.add(localName);
            }
            if (importedName === 'types') {
              state.stylexTypesImport.add(localName);
            }
          }
        }
      }
    }
  }
}
function readRequires(path, state) {
  const {
    node
  } = path;
  const init = node.init;
  if (init != null && init.type === 'CallExpression' && init.callee?.type === 'Identifier' && init.callee?.name === 'require' && init.arguments?.length === 1 && init.arguments?.[0].type === 'StringLiteral' && state.importSources.includes(init.arguments[0].value)) {
    const importPath = init.arguments[0].value;
    if (importPath == null) {
      return;
    }
    state.importPaths.add(importPath);
    if (node.id.type === 'Identifier') {
      state.stylexImport.add(node.id.name);
    }
    if (node.id.type === 'ObjectPattern') {
      for (const prop of node.id.properties) {
        if (prop.type === 'ObjectProperty' && prop.key.type === 'Identifier' && prop.value.type === 'Identifier') {
          const value = prop.value;
          if (prop.key.name === 'create') {
            state.stylexCreateImport.add(value.name);
          }
          if (prop.key.name === 'props') {
            state.stylexPropsImport.add(value.name);
          }
          if (prop.key.name === 'attrs') {
            state.stylexAttrsImport.add(value.name);
          }
          if (prop.key.name === 'keyframes') {
            state.stylexKeyframesImport.add(value.name);
          }
          if (prop.key.name === 'include') {
            state.stylexIncludeImport.add(value.name);
          }
          if (prop.key.name === 'firstThatWorks') {
            state.stylexFirstThatWorksImport.add(value.name);
          }
          if (prop.key.name === 'defineVars') {
            state.stylexDefineVarsImport.add(value.name);
          }
          if (prop.key.name === 'createTheme') {
            state.stylexCreateThemeImport.add(value.name);
          }
          if (prop.key.name === 'types') {
            state.stylexTypesImport.add(value.name);
          }
        }
      }
    }
  }
}

function getPackagePrefix(absolutePath) {
  const nodeModulesIndex = absolutePath.indexOf('node_modules');
  if (nodeModulesIndex !== -1) {
    const packageName = absolutePath.substring(nodeModulesIndex + 'node_modules'.length + 1);
    return packageName.split(path.sep)[0];
  }
  return undefined;
}
function getShortPath(relativePath) {
  return relativePath.split(path.sep).slice(-2).join('/');
}
function createShortFilename(absolutePath, state) {
  const isHaste = state.options.unstable_moduleResolution?.type === 'haste';
  const relativePath = path.relative(process.cwd(), absolutePath);
  const packagePrefix = getPackagePrefix(absolutePath);
  if (packagePrefix) {
    const shortPath = getShortPath(relativePath);
    return `${packagePrefix}:${shortPath}`;
  } else {
    if (isHaste) {
      return path.basename(absolutePath);
    }
    return getShortPath(relativePath);
  }
}
function addSourceMapData(obj, babelPath, state) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const currentFile = babelPath.hub.file;
    const sourceMap = currentFile.codeMap;
    const styleNodePath = babelPath.get('arguments.0.properties').find(prop => {
      return prop.node.key.name === key || String(prop.node.key.value) === key;
    });
    if (styleNodePath) {
      const generatedLineNumber = styleNodePath.node.loc?.start.line;
      let originalLineNumber = generatedLineNumber;
      if (sourceMap && originalLineNumber) {
        const originalPosition = sourceMap.originalPositionFor({
          line: generatedLineNumber,
          column: styleNodePath.node.loc?.start.column
        });
        if (originalPosition && originalPosition.line !== null) {
          originalLineNumber = originalPosition.line;
        } else {
          console.warn(`Could not determine original line number for key: ${key}`);
        }
      }
      const shortFilename = createShortFilename(currentFile.opts.filename || '', state);
      result[key] = {
        ...value,
        $$css: shortFilename !== '' && originalLineNumber ? `${shortFilename}:${originalLineNumber}` : true
      };
    } else {
      result[key] = value;
    }
  }
  return result;
}

function namespaceToDevClassName(namespace, varName, filename) {
  const basename = path.basename(filename).split('.')[0];
  const className = `${basename}__${varName ? `${varName}.` : ''}${namespace}`;
  return className.replace(/[^.a-zA-Z0-9_-]/g, '');
}
function injectDevClassNames(obj, varName, state) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const devClassName = namespaceToDevClassName(key, varName, state.filename ?? 'UnknownFile');
    result[key] = {
      [devClassName]: devClassName,
      ...value
    };
  }
  return result;
}
function convertToTestStyles(obj, varName, state) {
  const result = {};
  for (const [key, _value] of Object.entries(obj)) {
    const devClassName = namespaceToDevClassName(key, varName, state.filename ?? 'UnknownFile');
    result[key] = {
      [devClassName]: devClassName,
      $$css: true
    };
  }
  return result;
}

function convertObjectToAST(obj) {
  return t__namespace.objectExpression(Object.entries(obj).map(_ref => {
    let [key, value] = _ref;
    return t__namespace.objectProperty(canBeIdentifier(key) ? t__namespace.identifier(key) : t__namespace.stringLiteral(key), typeof value === 'string' ? t__namespace.stringLiteral(value) : typeof value === 'number' ? t__namespace.numericLiteral(value) : typeof value === 'boolean' ? t__namespace.booleanLiteral(value) : value === null ? t__namespace.nullLiteral() : convertObjectToAST(value));
  }));
}
function removeObjectsWithSpreads(obj) {
  return Object.fromEntries(Object.entries(obj).filter(Boolean));
}
function canBeIdentifier(str) {
  return str.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*$/) != null;
}

const IMPORT_FILE_PARSING_ERROR = `There was error when attempting to parse the imported file.
Please ensure that the 'babelrc' file is configured to be able to parse this file.
`;
const IMPORT_FILE_EVAL_ERROR = `There was an error when attempting to evaluate the imported file.
Please ensure that the imported file is self-contained and does not rely on dynamic behavior.
`;
const PATH_WITHOUT_NODE = `Unexpected error:
Could not resolve the code being evaluated.
`;
const UNEXPECTED_MEMBER_LOOKUP = `Unexpected error:
Could not determine the property being accessed.
`;
const IMPORT_PATH_RESOLUTION_ERROR = `Could not resolve the path to the imported file.
Please ensure that the theme file has a .stylex.js or .stylex.ts file extension and follows the
rules for defining variariables: 

https://stylexjs.com/docs/learn/theming/defining-variables/#rules-when-defining-variables
`;
const NON_CONSTANT = 'Referenced value is not a constant.\n\n';
const USED_BEFORE_DECLARATION = 'Referenced value is used before declaration.\n\n';
const UNINITIALIZED_CONST = 'Referenced constant is not initialized.\n\n';
const UNDEFINED_CONST = 'Referenced constant is not defined.';
const UNSUPPORTED_OPERATOR = op => `Unsupported operator: ${op}\n\n`;
const OBJECT_METHOD = 'Unsupported object method.\n\n';
const UNSUPPORTED_EXPRESSION = type => `Unsupported expression: ${type}\n\n`;

const VALID_CALLEES = ['String', 'Number', 'Math', 'Object', 'Array'];
const INVALID_METHODS = ['random', 'assign', 'defineProperties', 'defineProperty', 'freeze', 'seal', 'splice'];
function isValidCallee(val) {
  return VALID_CALLEES.includes(val);
}
function isInvalidMethod(val) {
  return INVALID_METHODS.includes(val);
}
function deopt(path, state, reason) {
  if (!state.confident) return;
  state.deoptPath = path;
  state.confident = false;
  state.deoptReason = reason;
}
function evaluateImportedFile(filePath, namedExport, state, bindingPath) {
  const fs = require('fs');
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const ast = core.parseSync(fileContents, {
    babelrc: true
  });
  if (!ast || ast.errors || !t__namespace.isNode(ast)) {
    deopt(bindingPath, state, IMPORT_FILE_PARSING_ERROR);
    return;
  }
  const astNode = ast;
  let result;
  traverse(astNode, {
    ExportNamedDeclaration(path) {
      const declaration = path.get('declaration');
      if (declaration.isVariableDeclaration()) {
        const decls = declaration.get('declarations');
        const finder = decl => {
          if (decl.isVariableDeclarator()) {
            const id = decl.get('id');
            const init = decl.get('init');
            if (id.isIdentifier() && id.node.name === namedExport && init != null && init.isExpression()) {
              result = evaluateCached(init, state);
            }
          }
        };
        if (Array.isArray(decls)) {
          decls.forEach(finder);
        } else {
          finder(decls);
        }
      }
    }
  });
  if (state.confident) {
    return result;
  } else {
    deopt(bindingPath, state, IMPORT_FILE_EVAL_ERROR);
    return;
  }
}
function evaluateThemeRef(fileName, exportName, state) {
  const resolveKey = key => {
    if (key.startsWith('--')) {
      return `var(${key})`;
    }
    const strToHash = key === '__themeName__' ? shared.utils.genFileBasedIdentifier({
      fileName,
      exportName
    }) : shared.utils.genFileBasedIdentifier({
      fileName,
      exportName,
      key
    });
    const debug = state.traversalState.options.debug;
    const varName = debug === true ? key + '-' + state.traversalState.options.classNamePrefix + shared.utils.hash(strToHash) : state.traversalState.options.classNamePrefix + shared.utils.hash(strToHash);
    if (key === '__themeName__') {
      return varName;
    }
    return `var(--${varName})`;
  };
  const proxy = new Proxy({}, {
    get(_, key) {
      return resolveKey(key);
    },
    set(_, key, value) {
      throw new Error(`Cannot set value ${value} to key ${key} in theme ${fileName}`);
    }
  });
  return proxy;
}
function evaluateCached(path, state) {
  const {
    node
  } = path;
  const {
    seen
  } = state;
  const existing = seen.get(node);
  if (existing != null) {
    if (existing.resolved) {
      return existing.value;
    } else {
      deopt(path, state, existing.reason);
      return;
    }
  } else {
    const item = {
      resolved: false,
      reason: 'Currently evaluating'
    };
    seen.set(node, item);
    if (node == null) {
      deopt(path, state, PATH_WITHOUT_NODE);
      return;
    }
    const val = _evaluate(path, state);
    if (state.confident) {
      seen.set(node, {
        resolved: true,
        value: val
      });
    }
    return val;
  }
}
function _evaluate(path, state) {
  if (!state.confident) return;
  if (path.isArrowFunctionExpression()) {
    const body = path.get('body');
    const params = path.get('params');
    const identParams = params.filter(param => param.isIdentifier()).map(paramPath => paramPath.node.name);
    if (body.isExpression() && identParams.length === params.length) {
      const expr = body;
      return function () {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        const identifierEntries = identParams.map((ident, index) => [ident, args[index]]);
        const identifiersObj = Object.fromEntries(identifierEntries);
        const result = evaluate(expr, state.traversalState, {
          ...state.functions,
          identifiers: {
            ...state.functions.identifiers,
            ...identifiersObj
          }
        });
        return result.value;
      };
    }
  }
  if (path.isIdentifier()) {
    const name = path.node.name;
    if (Object.keys(state.functions?.identifiers ?? {}).includes(name)) {
      return state.functions.identifiers[name];
    }
  }
  if (path.isTSAsExpression()) {
    const expr = path.get('expression');
    return evaluateCached(expr, state);
  }
  if (path.node.type === 'TSSatisfiesExpression') {
    const expr = path.get('expression');
    return evaluateCached(expr, state);
  }
  if (path.isSequenceExpression()) {
    const exprs = path.get('expressions');
    return evaluateCached(exprs[exprs.length - 1], state);
  }
  if (path.isStringLiteral() || path.isNumericLiteral() || path.isBooleanLiteral()) {
    return path.node.value;
  }
  if (path.isNullLiteral()) {
    return null;
  }
  if (path.isTemplateLiteral()) {
    return evaluateQuasis(path, path.node.quasis, state);
  }
  const maybeTag = path.isTaggedTemplateExpression() && path.get('tag');
  if (path.isTaggedTemplateExpression() && maybeTag && maybeTag.isMemberExpression()) {
    const tag = maybeTag;
    const object = tag.get('object');
    if (object.isIdentifier()) {
      const name = object.node.name;
      const property = tag.get('property');
      if (name === 'String' && !path.scope.hasBinding(name) && property.isIdentifier() && property.node.name === 'raw') {
        return evaluateQuasis(path, path.node.quasi.quasis, state, true);
      }
    }
  }
  if (path.isConditionalExpression()) {
    const testResult = evaluateCached(path.get('test'), state);
    if (!state.confident) return;
    if (testResult) {
      return evaluateCached(path.get('consequent'), state);
    } else {
      return evaluateCached(path.get('alternate'), state);
    }
  }
  if (path.isExpressionWrapper()) {
    return evaluateCached(path.get('expression'), state);
  }
  if (path.isMemberExpression() && !path.parentPath.isCallExpression({
    callee: path.node
  })) {
    const object = evaluateCached(path.get('object'), state);
    if (!state.confident) {
      return;
    }
    const propPath = path.get('property');
    let property;
    if (path.node.computed) {
      property = evaluateCached(propPath, state);
      if (!state.confident) {
        return;
      }
    } else if (propPath.isIdentifier()) {
      property = propPath.node.name;
    } else if (propPath.isStringLiteral()) {
      property = propPath.node.value;
    } else {
      return deopt(propPath, state, UNEXPECTED_MEMBER_LOOKUP);
    }
    return object[property];
  }
  if (path.isReferencedIdentifier()) {
    const binding = path.scope?.getBinding(path.node.name);
    const bindingPath = binding?.path;
    if (binding && bindingPath && !bindingPath.isImportDefaultSpecifier() && !bindingPath.isImportNamespaceSpecifier() && bindingPath.isImportSpecifier()) {
      const importSpecifierPath = bindingPath;
      const importSpecifierNode = importSpecifierPath.node;
      const imported = importSpecifierNode.imported;
      const importedName = imported.type === 'Identifier' ? imported.name : imported.value;
      const importPath = binding.path.parentPath;
      if (importPath && importPath.isImportDeclaration()) {
        const absPath = state.traversalState.importPathResolver(importPath.node.source.value);
        if (!absPath) {
          return deopt(binding.path, state, IMPORT_PATH_RESOLUTION_ERROR);
        }
        const [type, value] = absPath;
        const returnValue = type === 'themeNameRef' ? evaluateThemeRef(value, importedName, state) : evaluateImportedFile(value, importedName, state, bindingPath);
        if (state.confident) {
          if (!state.addedImports.has(importPath.node.source.value) && state.traversalState.treeshakeCompensation) {
            importPath.insertBefore(t__namespace.importDeclaration([], importPath.node.source));
            state.addedImports.add(importPath.node.source.value);
          }
          return returnValue;
        } else {
          deopt(binding.path, state, IMPORT_FILE_EVAL_ERROR);
        }
      }
    }
    if (binding && bindingPath && bindingPath.isImportDefaultSpecifier()) {
      deopt(binding.path, state, IMPORT_FILE_EVAL_ERROR);
    }
    if (binding && binding.constantViolations.length > 0) {
      return deopt(binding.path, state, NON_CONSTANT);
    }
    if (binding && path.node.start < binding.path.node.end) {
      return deopt(binding.path, state, USED_BEFORE_DECLARATION);
    }
    if (binding && binding.hasValue) {
      return binding.value;
    } else {
      if (path.node.name === 'undefined') {
        return binding ? deopt(binding.path, state, UNINITIALIZED_CONST) : undefined;
      } else if (path.node.name === 'Infinity') {
        return binding ? deopt(binding.path, state, UNINITIALIZED_CONST) : Infinity;
      } else if (path.node.name === 'NaN') {
        return binding ? deopt(binding.path, state, UNINITIALIZED_CONST) : NaN;
      }
      const resolved = path.resolve();
      if (resolved === path) {
        return deopt(path, state, UNDEFINED_CONST);
      } else {
        return evaluateCached(resolved, state);
      }
    }
  }
  if (path.isUnaryExpression({
    prefix: true
  })) {
    if (path.node.operator === 'void') {
      return undefined;
    }
    const argument = path.get('argument');
    if (path.node.operator === 'typeof' && (argument.isFunction() || argument.isClass())) {
      return 'function';
    }
    const arg = evaluateCached(argument, state);
    if (!state.confident) return;
    switch (path.node.operator) {
      case '!':
        return !arg;
      case '+':
        return +arg;
      case '-':
        return -arg;
      case '~':
        return ~arg;
      case 'typeof':
        return typeof arg;
      case 'void':
        return undefined;
      default:
        return deopt(path, state, UNSUPPORTED_OPERATOR(path.node.operator));
    }
  }
  if (path.isArrayExpression()) {
    const arrPath = path;
    const arr = [];
    const elems = arrPath.get('elements');
    for (const elem of elems) {
      const elemValue = evaluate(elem, state.traversalState, state.functions);
      if (elemValue.confident) {
        arr.push(elemValue.value);
      } else {
        elemValue.deopt && deopt(elemValue.deopt, state, elemValue.reason ?? 'unknown error');
        return;
      }
    }
    return arr;
  }
  if (path.isObjectExpression()) {
    const obj = {};
    const props = path.get('properties');
    for (const prop of props) {
      if (prop.isObjectMethod()) {
        return deopt(prop, state, OBJECT_METHOD);
      }
      if (prop.isSpreadElement()) {
        const spreadExpression = evaluateCached(prop.get('argument'), state);
        if (!state.confident) {
          return deopt(prop, state, state.deoptReason ?? 'unknown error');
        }
        Object.assign(obj, spreadExpression);
        continue;
      }
      if (prop.isObjectProperty()) {
        const keyPath = prop.get('key');
        let key;
        if (prop.node.computed) {
          const {
            confident,
            deopt: resultDeopt,
            reason: deoptReason,
            value
          } = evaluate(keyPath, state.traversalState, state.functions);
          if (!confident) {
            resultDeopt && deopt(resultDeopt, state, deoptReason ?? 'unknown error');
            return;
          }
          key = value;
        } else if (keyPath.isIdentifier()) {
          key = keyPath.node.name;
        } else {
          key = keyPath.node.value;
        }
        const valuePath = prop.get('value');
        let value = evaluate(valuePath, state.traversalState, state.functions);
        if (!value.confident) {
          value.deopt && deopt(value.deopt, state, value.reason ?? 'unknown error');
          return;
        }
        value = value.value;
        obj[key] = value;
      }
    }
    return obj;
  }
  if (path.isLogicalExpression()) {
    const stateForLeft = {
      ...state,
      deoptPath: null,
      confident: true
    };
    const leftPath = path.get('left');
    const left = evaluateCached(leftPath, stateForLeft);
    const leftConfident = stateForLeft.confident;
    const stateForRight = {
      ...state,
      deoptPath: null,
      confident: true
    };
    const rightPath = path.get('right');
    const right = evaluateCached(rightPath, stateForRight);
    const rightConfident = stateForRight.confident;
    switch (path.node.operator) {
      case '||':
        {
          if (leftConfident && (!!left || rightConfident)) {
            return left || right;
          }
          if (!leftConfident) {
            deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
            return;
          }
          if (!rightConfident) {
            deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
            return;
          }
          deopt(path, state, 'unknown error');
          return;
        }
      case '&&':
        {
          if (leftConfident && (!left || rightConfident)) {
            return left && right;
          }
          if (!leftConfident) {
            deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
            return;
          }
          if (!rightConfident) {
            deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
            return;
          }
          deopt(path, state, 'unknown error');
          return;
        }
      case '??':
        {
          if (leftConfident && !!(left ?? rightConfident)) {
            return left ?? right;
          }
          if (!leftConfident) {
            deopt(leftPath, state, stateForLeft.deoptReason ?? 'unknown error');
            return;
          }
          if (!rightConfident) {
            deopt(rightPath, state, stateForRight.deoptReason ?? 'unknown error');
            return;
          }
          deopt(path, state, 'unknown error');
          return;
        }
      default:
        path.node.operator;
    }
  }
  if (path.isBinaryExpression()) {
    const left = evaluateCached(path.get('left'), state);
    if (!state.confident) return;
    const right = evaluateCached(path.get('right'), state);
    if (!state.confident) return;
    switch (path.node.operator) {
      case '-':
        return left - right;
      case '+':
        return left + right;
      case '/':
        return left / right;
      case '*':
        return left * right;
      case '%':
        return left % right;
      case '**':
        return left ** right;
      case '<':
        return left < right;
      case '>':
        return left > right;
      case '<=':
        return left <= right;
      case '>=':
        return left >= right;
      case '==':
        return left == right;
      case '!=':
        return left !== right;
      case '===':
        return left === right;
      case '!==':
        return left !== right;
      case '|':
        return left | right;
      case '&':
        return left & right;
      case '^':
        return left ^ right;
      case '<<':
        return left << right;
      case '>>':
        return left >> right;
      case '>>>':
        return left >>> right;
      case 'in':
        return left in right;
      case 'instanceof':
        return left instanceof right;
      default:
        return;
    }
  }
  if (path.isCallExpression()) {
    const callee = path.get('callee');
    let context;
    let func;
    if (callee.isIdentifier() && !path.scope.getBinding(callee.node.name) && isValidCallee(callee.node.name)) {
      func = global[callee.node.name];
    } else if (callee.isIdentifier() && state.functions.identifiers[callee.node.name]) {
      func = state.functions.identifiers[callee.node.name];
    } else if (callee.isIdentifier()) {
      const maybeFunction = evaluateCached(callee, state);
      if (state.confident) {
        func = maybeFunction;
      } else {
        deopt(callee, state, NON_CONSTANT);
      }
    }
    if (callee.isMemberExpression()) {
      const object = callee.get('object');
      const property = callee.get('property');
      if (object.isIdentifier() && property.isIdentifier()) {
        if (isValidCallee(object.node.name) && !isInvalidMethod(property.node.name)) {
          context = global[object.node.name];
          func = context[property.node.name];
        } else if (state.functions.memberExpressions[object.node.name] && state.functions.memberExpressions[object.node.name][property.node.name]) {
          context = state.functions.memberExpressions[object.node.name];
          func = context[property.node.name];
        }
      }
      if (object.isIdentifier() && property.isStringLiteral() && state.functions.memberExpressions[object.node.name] && state.functions.memberExpressions[object.node.name][property.node.value]) {
        context = state.functions.memberExpressions[object.node.name];
        func = context[property.node.value];
      }
      if ((object.isStringLiteral() || object.isNumericLiteral()) && property.isIdentifier()) {
        const val = object.node.value;
        func = val[property.node.name];
        if (typeof val === 'string') {
          context = object.node.value;
        }
      }
      if (func == null) {
        const parsedObj = evaluate(object, state.traversalState, state.functions);
        if (parsedObj.confident && property.isIdentifier()) {
          func = parsedObj.value[property.node.name];
          context = parsedObj.value;
        }
        if (parsedObj.confident && property.isStringLiteral()) {
          func = parsedObj.value[property.node.value];
          context = parsedObj.value;
        }
      }
    }
    if (func) {
      if (func.takesPath) {
        const args = path.get('arguments');
        return func.fn(...args);
      } else {
        const args = path.get('arguments').map(arg => evaluateCached(arg, state));
        if (!state.confident) return;
        if (func.fn) {
          return func.fn.apply(context, args);
        } else {
          return func.apply(context, args);
        }
      }
    }
  }
  deopt(path, state, UNSUPPORTED_EXPRESSION(path.node.type));
}
function evaluateQuasis(path, quasis, state) {
  let raw = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  let str = '';
  let i = 0;
  const exprs = path.isTemplateLiteral() ? path.get('expressions') : path.isTaggedTemplateExpression() ? path.get('quasi').get('expressions') : [];
  for (const elem of quasis) {
    if (!state.confident) break;
    str += raw ? elem.value.raw : elem.value.cooked;
    const expr = exprs[i++];
    if (expr) str += String(evaluateCached(expr, state));
  }
  if (!state.confident) return;
  return str;
}
const importsForState = new WeakMap();
function evaluate(path, traversalState) {
  let functions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    identifiers: {},
    memberExpressions: {}
  };
  const addedImports = importsForState.get(traversalState) ?? new Set();
  importsForState.set(traversalState, addedImports);
  const state = {
    confident: true,
    deoptPath: null,
    seen: new Map(),
    addedImports,
    functions,
    traversalState
  };
  let value = evaluateCached(path, state);
  if (!state.confident) value = undefined;
  return {
    confident: state.confident,
    deopt: state.deoptPath,
    reason: state.deoptReason,
    value: value
  };
}

var transformValue = {};

var normalizeValue = {};

var fontSizePxToRem = {};

var parse;
var hasRequiredParse;

function requireParse () {
	if (hasRequiredParse) return parse;
	hasRequiredParse = 1;
	var openParentheses = "(".charCodeAt(0);
	var closeParentheses = ")".charCodeAt(0);
	var singleQuote = "'".charCodeAt(0);
	var doubleQuote = '"'.charCodeAt(0);
	var backslash = "\\".charCodeAt(0);
	var slash = "/".charCodeAt(0);
	var comma = ",".charCodeAt(0);
	var colon = ":".charCodeAt(0);
	var star = "*".charCodeAt(0);
	var uLower = "u".charCodeAt(0);
	var uUpper = "U".charCodeAt(0);
	var plus = "+".charCodeAt(0);
	var isUnicodeRange = /^[a-f0-9?-]+$/i;

	parse = function(input) {
	  var tokens = [];
	  var value = input;

	  var next,
	    quote,
	    prev,
	    token,
	    escape,
	    escapePos,
	    whitespacePos,
	    parenthesesOpenPos;
	  var pos = 0;
	  var code = value.charCodeAt(pos);
	  var max = value.length;
	  var stack = [{ nodes: tokens }];
	  var balanced = 0;
	  var parent;

	  var name = "";
	  var before = "";
	  var after = "";

	  while (pos < max) {
	    // Whitespaces
	    if (code <= 32) {
	      next = pos;
	      do {
	        next += 1;
	        code = value.charCodeAt(next);
	      } while (code <= 32);
	      token = value.slice(pos, next);

	      prev = tokens[tokens.length - 1];
	      if (code === closeParentheses && balanced) {
	        after = token;
	      } else if (prev && prev.type === "div") {
	        prev.after = token;
	        prev.sourceEndIndex += token.length;
	      } else if (
	        code === comma ||
	        code === colon ||
	        (code === slash &&
	          value.charCodeAt(next + 1) !== star &&
	          (!parent ||
	            (parent && parent.type === "function" && parent.value !== "calc")))
	      ) {
	        before = token;
	      } else {
	        tokens.push({
	          type: "space",
	          sourceIndex: pos,
	          sourceEndIndex: next,
	          value: token
	        });
	      }

	      pos = next;

	      // Quotes
	    } else if (code === singleQuote || code === doubleQuote) {
	      next = pos;
	      quote = code === singleQuote ? "'" : '"';
	      token = {
	        type: "string",
	        sourceIndex: pos,
	        quote: quote
	      };
	      do {
	        escape = false;
	        next = value.indexOf(quote, next + 1);
	        if (~next) {
	          escapePos = next;
	          while (value.charCodeAt(escapePos - 1) === backslash) {
	            escapePos -= 1;
	            escape = !escape;
	          }
	        } else {
	          value += quote;
	          next = value.length - 1;
	          token.unclosed = true;
	        }
	      } while (escape);
	      token.value = value.slice(pos + 1, next);
	      token.sourceEndIndex = token.unclosed ? next : next + 1;
	      tokens.push(token);
	      pos = next + 1;
	      code = value.charCodeAt(pos);

	      // Comments
	    } else if (code === slash && value.charCodeAt(pos + 1) === star) {
	      next = value.indexOf("*/", pos);

	      token = {
	        type: "comment",
	        sourceIndex: pos,
	        sourceEndIndex: next + 2
	      };

	      if (next === -1) {
	        token.unclosed = true;
	        next = value.length;
	        token.sourceEndIndex = next;
	      }

	      token.value = value.slice(pos + 2, next);
	      tokens.push(token);

	      pos = next + 2;
	      code = value.charCodeAt(pos);

	      // Operation within calc
	    } else if (
	      (code === slash || code === star) &&
	      parent &&
	      parent.type === "function" &&
	      parent.value === "calc"
	    ) {
	      token = value[pos];
	      tokens.push({
	        type: "word",
	        sourceIndex: pos - before.length,
	        sourceEndIndex: pos + token.length,
	        value: token
	      });
	      pos += 1;
	      code = value.charCodeAt(pos);

	      // Dividers
	    } else if (code === slash || code === comma || code === colon) {
	      token = value[pos];

	      tokens.push({
	        type: "div",
	        sourceIndex: pos - before.length,
	        sourceEndIndex: pos + token.length,
	        value: token,
	        before: before,
	        after: ""
	      });
	      before = "";

	      pos += 1;
	      code = value.charCodeAt(pos);

	      // Open parentheses
	    } else if (openParentheses === code) {
	      // Whitespaces after open parentheses
	      next = pos;
	      do {
	        next += 1;
	        code = value.charCodeAt(next);
	      } while (code <= 32);
	      parenthesesOpenPos = pos;
	      token = {
	        type: "function",
	        sourceIndex: pos - name.length,
	        value: name,
	        before: value.slice(parenthesesOpenPos + 1, next)
	      };
	      pos = next;

	      if (name === "url" && code !== singleQuote && code !== doubleQuote) {
	        next -= 1;
	        do {
	          escape = false;
	          next = value.indexOf(")", next + 1);
	          if (~next) {
	            escapePos = next;
	            while (value.charCodeAt(escapePos - 1) === backslash) {
	              escapePos -= 1;
	              escape = !escape;
	            }
	          } else {
	            value += ")";
	            next = value.length - 1;
	            token.unclosed = true;
	          }
	        } while (escape);
	        // Whitespaces before closed
	        whitespacePos = next;
	        do {
	          whitespacePos -= 1;
	          code = value.charCodeAt(whitespacePos);
	        } while (code <= 32);
	        if (parenthesesOpenPos < whitespacePos) {
	          if (pos !== whitespacePos + 1) {
	            token.nodes = [
	              {
	                type: "word",
	                sourceIndex: pos,
	                sourceEndIndex: whitespacePos + 1,
	                value: value.slice(pos, whitespacePos + 1)
	              }
	            ];
	          } else {
	            token.nodes = [];
	          }
	          if (token.unclosed && whitespacePos + 1 !== next) {
	            token.after = "";
	            token.nodes.push({
	              type: "space",
	              sourceIndex: whitespacePos + 1,
	              sourceEndIndex: next,
	              value: value.slice(whitespacePos + 1, next)
	            });
	          } else {
	            token.after = value.slice(whitespacePos + 1, next);
	            token.sourceEndIndex = next;
	          }
	        } else {
	          token.after = "";
	          token.nodes = [];
	        }
	        pos = next + 1;
	        token.sourceEndIndex = token.unclosed ? next : pos;
	        code = value.charCodeAt(pos);
	        tokens.push(token);
	      } else {
	        balanced += 1;
	        token.after = "";
	        token.sourceEndIndex = pos + 1;
	        tokens.push(token);
	        stack.push(token);
	        tokens = token.nodes = [];
	        parent = token;
	      }
	      name = "";

	      // Close parentheses
	    } else if (closeParentheses === code && balanced) {
	      pos += 1;
	      code = value.charCodeAt(pos);

	      parent.after = after;
	      parent.sourceEndIndex += after.length;
	      after = "";
	      balanced -= 1;
	      stack[stack.length - 1].sourceEndIndex = pos;
	      stack.pop();
	      parent = stack[balanced];
	      tokens = parent.nodes;

	      // Words
	    } else {
	      next = pos;
	      do {
	        if (code === backslash) {
	          next += 1;
	        }
	        next += 1;
	        code = value.charCodeAt(next);
	      } while (
	        next < max &&
	        !(
	          code <= 32 ||
	          code === singleQuote ||
	          code === doubleQuote ||
	          code === comma ||
	          code === colon ||
	          code === slash ||
	          code === openParentheses ||
	          (code === star &&
	            parent &&
	            parent.type === "function" &&
	            parent.value === "calc") ||
	          (code === slash &&
	            parent.type === "function" &&
	            parent.value === "calc") ||
	          (code === closeParentheses && balanced)
	        )
	      );
	      token = value.slice(pos, next);

	      if (openParentheses === code) {
	        name = token;
	      } else if (
	        (uLower === token.charCodeAt(0) || uUpper === token.charCodeAt(0)) &&
	        plus === token.charCodeAt(1) &&
	        isUnicodeRange.test(token.slice(2))
	      ) {
	        tokens.push({
	          type: "unicode-range",
	          sourceIndex: pos,
	          sourceEndIndex: next,
	          value: token
	        });
	      } else {
	        tokens.push({
	          type: "word",
	          sourceIndex: pos,
	          sourceEndIndex: next,
	          value: token
	        });
	      }

	      pos = next;
	    }
	  }

	  for (pos = stack.length - 1; pos; pos -= 1) {
	    stack[pos].unclosed = true;
	    stack[pos].sourceEndIndex = value.length;
	  }

	  return stack[0].nodes;
	};
	return parse;
}

var walk;
var hasRequiredWalk;

function requireWalk () {
	if (hasRequiredWalk) return walk;
	hasRequiredWalk = 1;
	walk = function walk(nodes, cb, bubble) {
	  var i, max, node, result;

	  for (i = 0, max = nodes.length; i < max; i += 1) {
	    node = nodes[i];
	    if (!bubble) {
	      result = cb(node, i, nodes);
	    }

	    if (
	      result !== false &&
	      node.type === "function" &&
	      Array.isArray(node.nodes)
	    ) {
	      walk(node.nodes, cb, bubble);
	    }

	    if (bubble) {
	      cb(node, i, nodes);
	    }
	  }
	};
	return walk;
}

var stringify_1;
var hasRequiredStringify;

function requireStringify () {
	if (hasRequiredStringify) return stringify_1;
	hasRequiredStringify = 1;
	function stringifyNode(node, custom) {
	  var type = node.type;
	  var value = node.value;
	  var buf;
	  var customResult;

	  if (custom && (customResult = custom(node)) !== undefined) {
	    return customResult;
	  } else if (type === "word" || type === "space") {
	    return value;
	  } else if (type === "string") {
	    buf = node.quote || "";
	    return buf + value + (node.unclosed ? "" : buf);
	  } else if (type === "comment") {
	    return "/*" + value + (node.unclosed ? "" : "*/");
	  } else if (type === "div") {
	    return (node.before || "") + value + (node.after || "");
	  } else if (Array.isArray(node.nodes)) {
	    buf = stringify(node.nodes, custom);
	    if (type !== "function") {
	      return buf;
	    }
	    return (
	      value +
	      "(" +
	      (node.before || "") +
	      buf +
	      (node.after || "") +
	      (node.unclosed ? "" : ")")
	    );
	  }
	  return value;
	}

	function stringify(nodes, custom) {
	  var result, i;

	  if (Array.isArray(nodes)) {
	    result = "";
	    for (i = nodes.length - 1; ~i; i -= 1) {
	      result = stringifyNode(nodes[i], custom) + result;
	    }
	    return result;
	  }
	  return stringifyNode(nodes, custom);
	}

	stringify_1 = stringify;
	return stringify_1;
}

var unit;
var hasRequiredUnit;

function requireUnit () {
	if (hasRequiredUnit) return unit;
	hasRequiredUnit = 1;
	var minus = "-".charCodeAt(0);
	var plus = "+".charCodeAt(0);
	var dot = ".".charCodeAt(0);
	var exp = "e".charCodeAt(0);
	var EXP = "E".charCodeAt(0);

	// Check if three code points would start a number
	// https://www.w3.org/TR/css-syntax-3/#starts-with-a-number
	function likeNumber(value) {
	  var code = value.charCodeAt(0);
	  var nextCode;

	  if (code === plus || code === minus) {
	    nextCode = value.charCodeAt(1);

	    if (nextCode >= 48 && nextCode <= 57) {
	      return true;
	    }

	    var nextNextCode = value.charCodeAt(2);

	    if (nextCode === dot && nextNextCode >= 48 && nextNextCode <= 57) {
	      return true;
	    }

	    return false;
	  }

	  if (code === dot) {
	    nextCode = value.charCodeAt(1);

	    if (nextCode >= 48 && nextCode <= 57) {
	      return true;
	    }

	    return false;
	  }

	  if (code >= 48 && code <= 57) {
	    return true;
	  }

	  return false;
	}

	// Consume a number
	// https://www.w3.org/TR/css-syntax-3/#consume-number
	unit = function(value) {
	  var pos = 0;
	  var length = value.length;
	  var code;
	  var nextCode;
	  var nextNextCode;

	  if (length === 0 || !likeNumber(value)) {
	    return false;
	  }

	  code = value.charCodeAt(pos);

	  if (code === plus || code === minus) {
	    pos++;
	  }

	  while (pos < length) {
	    code = value.charCodeAt(pos);

	    if (code < 48 || code > 57) {
	      break;
	    }

	    pos += 1;
	  }

	  code = value.charCodeAt(pos);
	  nextCode = value.charCodeAt(pos + 1);

	  if (code === dot && nextCode >= 48 && nextCode <= 57) {
	    pos += 2;

	    while (pos < length) {
	      code = value.charCodeAt(pos);

	      if (code < 48 || code > 57) {
	        break;
	      }

	      pos += 1;
	    }
	  }

	  code = value.charCodeAt(pos);
	  nextCode = value.charCodeAt(pos + 1);
	  nextNextCode = value.charCodeAt(pos + 2);

	  if (
	    (code === exp || code === EXP) &&
	    ((nextCode >= 48 && nextCode <= 57) ||
	      ((nextCode === plus || nextCode === minus) &&
	        nextNextCode >= 48 &&
	        nextNextCode <= 57))
	  ) {
	    pos += nextCode === plus || nextCode === minus ? 3 : 2;

	    while (pos < length) {
	      code = value.charCodeAt(pos);

	      if (code < 48 || code > 57) {
	        break;
	      }

	      pos += 1;
	    }
	  }

	  return {
	    number: value.slice(0, pos),
	    unit: value.slice(pos)
	  };
	};
	return unit;
}

var lib;
var hasRequiredLib;

function requireLib () {
	if (hasRequiredLib) return lib;
	hasRequiredLib = 1;
	var parse = requireParse();
	var walk = requireWalk();
	var stringify = requireStringify();

	function ValueParser(value) {
	  if (this instanceof ValueParser) {
	    this.nodes = parse(value);
	    return this;
	  }
	  return new ValueParser(value);
	}

	ValueParser.prototype.toString = function() {
	  return Array.isArray(this.nodes) ? stringify(this.nodes) : "";
	};

	ValueParser.prototype.walk = function(cb, bubble) {
	  walk(this.nodes, cb, bubble);
	  return this;
	};

	ValueParser.unit = requireUnit();

	ValueParser.walk = walk;

	ValueParser.stringify = stringify;

	lib = ValueParser;
	return lib;
}

var hasRequiredFontSizePxToRem;

function requireFontSizePxToRem () {
	if (hasRequiredFontSizePxToRem) return fontSizePxToRem;
	hasRequiredFontSizePxToRem = 1;

	Object.defineProperty(fontSizePxToRem, "__esModule", {
	  value: true
	});
	fontSizePxToRem.default = convertFontSizeToRem;
	var _postcssValueParser = _interopRequireDefault(requireLib());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const ROOT_FONT_SIZE = 16;
	function convertFontSizeToRem(ast, key) {
	  if (key !== 'fontSize') {
	    return ast;
	  }
	  ast.walk(node => {
	    if (node.type !== 'word') {
	      return;
	    }
	    const dimension = _postcssValueParser.default.unit(node.value);
	    if (dimension && dimension.unit === 'px') {
	      node.value = `${parseFloat(dimension.number) / ROOT_FONT_SIZE}rem`;
	    }
	  });
	  return ast;
	}
	return fontSizePxToRem;
}

var leadingZero = {};

var hasRequiredLeadingZero;

function requireLeadingZero () {
	if (hasRequiredLeadingZero) return leadingZero;
	hasRequiredLeadingZero = 1;

	Object.defineProperty(leadingZero, "__esModule", {
	  value: true
	});
	leadingZero.default = normalizeLeadingZero;
	var _postcssValueParser = _interopRequireDefault(requireLib());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	function normalizeLeadingZero(ast, _) {
	  ast.walk(node => {
	    if (node.type !== 'word') {
	      return;
	    }
	    const value = Number.parseFloat(node.value);
	    if (Number.isNaN(value)) {
	      return;
	    }
	    const dimension = _postcssValueParser.default.unit(node.value);
	    if (value < 1 && value >= 0) {
	      node.value = value.toString().replace('0.', '.') + (dimension ? dimension.unit : '');
	    }
	  });
	  return ast;
	}
	return leadingZero;
}

var quotes = {};

var hasRequiredQuotes;

function requireQuotes () {
	if (hasRequiredQuotes) return quotes;
	hasRequiredQuotes = 1;

	Object.defineProperty(quotes, "__esModule", {
	  value: true
	});
	quotes.default = normalizeQuotes;
	function normalizeQuotes(ast, _) {
	  ast.walk(node => {
	    if (node.type !== 'string') {
	      return;
	    }
	    if (node.value === '') {
	      node.quote = '"';
	    }
	  });
	  return ast;
	}
	return quotes;
}

var timings = {};

var hasRequiredTimings;

function requireTimings () {
	if (hasRequiredTimings) return timings;
	hasRequiredTimings = 1;

	Object.defineProperty(timings, "__esModule", {
	  value: true
	});
	timings.default = normalizeTimings;
	var _postcssValueParser = _interopRequireDefault(requireLib());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	function normalizeTimings(ast, _) {
	  ast.walk(node => {
	    if (node.type !== 'word') {
	      return;
	    }
	    const value = Number.parseFloat(node.value);
	    if (Number.isNaN(value)) {
	      return;
	    }
	    const dimension = _postcssValueParser.default.unit(node.value);
	    if (!dimension || dimension.unit !== 'ms' || value < 10) {
	      return;
	    }
	    node.value = value / 1000 + 's';
	  });
	  return ast;
	}
	return timings;
}

var whitespace = {};

var hasRequiredWhitespace;

function requireWhitespace () {
	if (hasRequiredWhitespace) return whitespace;
	hasRequiredWhitespace = 1;

	Object.defineProperty(whitespace, "__esModule", {
	  value: true
	});
	whitespace.default = normalizeWhitespace;
	function normalizeWhitespace(ast, _) {
	  if (ast.nodes[0].type === 'space') {
	    ast.nodes.shift();
	  }
	  if (ast.nodes[ast.nodes.length - 1].type === 'space') {
	    ast.nodes.pop();
	  }
	  ast.walk((node, idx) => {
	    switch (node.type) {
	      case 'space':
	        {
	          node.value = ' ';
	          break;
	        }
	      case 'div':
	        {
	          if (node.value === ',') {
	            node.before = '';
	            node.after = '';
	          } else {
	            node.before = ' ';
	            node.after = ' ';
	          }
	          break;
	        }
	      case 'function':
	        {
	          node.before = '';
	          node.after = '';
	          break;
	        }
	      case 'word':
	        {
	          if (node.value === '!important') {
	            if (ast.nodes[idx - 1] && ast.nodes[idx - 1].type === 'space') {
	              ast.nodes.splice(idx - 1, 1);
	            }
	          }
	          break;
	        }
	    }
	  });
	  return ast;
	}
	return whitespace;
}

var zeroDimensions = {};

var hasRequiredZeroDimensions;

function requireZeroDimensions () {
	if (hasRequiredZeroDimensions) return zeroDimensions;
	hasRequiredZeroDimensions = 1;

	Object.defineProperty(zeroDimensions, "__esModule", {
	  value: true
	});
	zeroDimensions.default = normalizeZeroDimensions;
	var _postcssValueParser = _interopRequireDefault(requireLib());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const angles = ['deg', 'grad', 'turn', 'rad'];
	const timings = ['ms', 's'];
	const fraction = 'fr';
	const percentage = '%';
	function normalizeZeroDimensions(ast, _) {
	  let endFunction = 0;
	  ast.walk(node => {
	    if (node.type === 'function' && !endFunction) {
	      endFunction = node.sourceEndIndex ?? 0;
	    }
	    if (endFunction > 0 && node.sourceIndex > endFunction) {
	      endFunction = 0;
	    }
	    if (node.type !== 'word') {
	      return;
	    }
	    const dimension = _postcssValueParser.default.unit(node.value);
	    if (!dimension || dimension.number !== '0') {
	      return;
	    }
	    if (angles.indexOf(dimension.unit) !== -1) {
	      node.value = '0deg';
	    } else if (timings.indexOf(dimension.unit) !== -1) {
	      node.value = '0s';
	    } else if (dimension.unit === fraction) {
	      node.value = '0fr';
	    } else if (dimension.unit === percentage) {
	      node.value = '0%';
	    } else if (!endFunction) {
	      node.value = '0';
	    }
	  });
	  return ast;
	}
	return zeroDimensions;
}

var detectUnclosedFns = {};

var messages = {};

var hasRequiredMessages;

function requireMessages () {
	if (hasRequiredMessages) return messages;
	hasRequiredMessages = 1;

	Object.defineProperty(messages, "__esModule", {
	  value: true
	});
	messages.UNKNOWN_PROP_KEY = messages.UNKNOWN_NAMESPACE = messages.UNEXPECTED_ARGUMENT = messages.UNBOUND_STYLEX_CALL_VALUE = messages.ONLY_TOP_LEVEL = messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS = messages.NO_PROJECT_ROOT_DIRECTORY = messages.NO_PARENT_PATH = messages.NO_CONDITIONAL_SHORTHAND = messages.NON_STATIC_VALUE = messages.NON_STATIC_KEYFRAME_VALUE = messages.NON_OBJECT_KEYFRAME = messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL = messages.NON_OBJECT_FOR_STYLEX_CALL = messages.NON_EXPORT_NAMED_DECLARATION = messages.NON_CONTIGUOUS_VARS = messages.LOCAL_ONLY = messages.LINT_UNCLOSED_FUNCTION = messages.INVALID_SPREAD = messages.INVALID_PSEUDO_OR_AT_RULE = messages.INVALID_PSEUDO = messages.ILLEGAL_PROP_VALUE = messages.ILLEGAL_PROP_ARRAY_VALUE = messages.ILLEGAL_NESTED_PSEUDO = messages.ILLEGAL_NAMESPACE_VALUE = messages.ILLEGAL_NAMESPACE_TYPE = messages.ILLEGAL_ARG_LENGTH_FOR_KEYFRAMES = messages.ILLEGAL_ARGUMENT_LENGTH = messages.EXPECTED_FUNCTION_CALL = messages.ESCAPED_STYLEX_VALUE = messages.DUPLICATE_CONDITIONAL = messages.ANONYMOUS_THEME = void 0;
	messages.ILLEGAL_ARGUMENT_LENGTH = 'stylex.create() should have 1 argument.';
	messages.ILLEGAL_ARG_LENGTH_FOR_KEYFRAMES = 'stylex.keyframes() should have 1 argument.';
	messages.NON_STATIC_VALUE = 'Only static values are allowed inside of a stylex.create() call.';
	messages.NON_STATIC_KEYFRAME_VALUE = 'Only static values are allowed inside of a stylex.keyframes() call.';
	messages.ESCAPED_STYLEX_VALUE = 'Escaping a stylex.create() value is not allowed.';
	messages.UNBOUND_STYLEX_CALL_VALUE = 'stylex.create calls must be bound to a bare variable.';
	messages.ONLY_TOP_LEVEL = 'stylex.create() is only allowed at the root of a program.';
	messages.NON_OBJECT_FOR_STYLEX_CALL = 'stylex.create() can only accept a style object.';
	messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL = 'stylex.keyframes() can only accept an object.';
	messages.UNKNOWN_PROP_KEY = 'Unknown property key';
	messages.INVALID_PSEUDO = 'Invalid pseudo selector, not on the whitelist.';
	messages.INVALID_PSEUDO_OR_AT_RULE = 'Invalid pseudo or at-rule.';
	messages.NO_CONDITIONAL_SHORTHAND = 'You cannot use conditional style values for a shorthand property.';
	messages.ILLEGAL_NAMESPACE_TYPE = 'Only a string literal namespace is allowed here.';
	messages.UNKNOWN_NAMESPACE = 'Unknown namespace';
	messages.ILLEGAL_NESTED_PSEUDO = "Pseudo objects can't be nested more than one level deep.";
	messages.ILLEGAL_PROP_VALUE = 'A style value can only contain an array, string or number.';
	messages.ILLEGAL_PROP_ARRAY_VALUE = 'A style array value can only contain strings or numbers.';
	messages.ILLEGAL_NAMESPACE_VALUE = 'A stylex namespace must be an object.';
	messages.NON_OBJECT_KEYFRAME = 'Every frame within a stylex.keyframes() call must be an object.';
	messages.INVALID_SPREAD = 'Imported styles spread with a stylex.create call must be type cast as `XStyle<>` to verify their type.';
	messages.LINT_UNCLOSED_FUNCTION = 'Rule contains an unclosed function';
	messages.LOCAL_ONLY = 'The return value of stylex.create() should not be exported.';
	messages.UNEXPECTED_ARGUMENT = 'Unexpected argument passed to the stylex() function.';
	messages.EXPECTED_FUNCTION_CALL = 'Expected a simple function call but found something else.';
	messages.NO_PARENT_PATH = 'Unexpected AST node without a parent path.';
	messages.DUPLICATE_CONDITIONAL = 'The same pseudo selector or at-rule cannot be used more than once.';
	messages.NO_PROJECT_ROOT_DIRECTORY = 'The project root directory `rootDir` is not configured.';
	messages.NON_EXPORT_NAMED_DECLARATION = 'The return value of stylex.defineVars() must be bound to a named export.';
	messages.ANONYMOUS_THEME = 'stylex.createTheme() must be bound to a named constant.';
	messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS = 'Only named parameters are allowed in Dynamic Style functions. Destructuring, spreading or default values are not allowed.';
	messages.NON_CONTIGUOUS_VARS = 'All variables passed to `stylex.firstThatWorks` must be contiguous.';
	return messages;
}

var hasRequiredDetectUnclosedFns;

function requireDetectUnclosedFns () {
	if (hasRequiredDetectUnclosedFns) return detectUnclosedFns;
	hasRequiredDetectUnclosedFns = 1;

	Object.defineProperty(detectUnclosedFns, "__esModule", {
	  value: true
	});
	detectUnclosedFns.default = detectUnclosedFns$1;
	var messages = _interopRequireWildcard(requireMessages());
	function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
	function _interopRequireWildcard(e, r) { if (e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
	function detectUnclosedFns$1(ast, _) {
	  ast.walk(node => {
	    if (node.type === 'function' && node.unclosed) {
	      throw new Error(messages.LINT_UNCLOSED_FUNCTION);
	    }
	  });
	  return ast;
	}
	return detectUnclosedFns;
}

var convertCamelCaseValues = {};

var dashify = {};

var hasRequiredDashify;

function requireDashify () {
	if (hasRequiredDashify) return dashify;
	hasRequiredDashify = 1;

	Object.defineProperty(dashify, "__esModule", {
	  value: true
	});
	dashify.default = dashify$1;
	function dashify$1(str) {
	  return str.replace(/(^|[a-z])([A-Z])/g, '$1-$2').toLowerCase();
	}
	return dashify;
}

var hasRequiredConvertCamelCaseValues;

function requireConvertCamelCaseValues () {
	if (hasRequiredConvertCamelCaseValues) return convertCamelCaseValues;
	hasRequiredConvertCamelCaseValues = 1;

	Object.defineProperty(convertCamelCaseValues, "__esModule", {
	  value: true
	});
	convertCamelCaseValues.default = convertCamelCasedValues;
	var _dashify = _interopRequireDefault(requireDashify());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	function convertCamelCasedValues(ast, key) {
	  if (key !== 'transitionProperty' && key !== 'willChange') {
	    return ast;
	  }
	  const nodes = ast.nodes;
	  if (!nodes) {
	    return ast;
	  }
	  nodes.forEach(node => {
	    if (node.type === 'word' && !node.value.startsWith('--')) {
	      node.value = (0, _dashify.default)(node.value);
	    }
	  });
	  return ast;
	}
	return convertCamelCaseValues;
}

var hasRequiredNormalizeValue;

function requireNormalizeValue () {
	if (hasRequiredNormalizeValue) return normalizeValue;
	hasRequiredNormalizeValue = 1;

	Object.defineProperty(normalizeValue, "__esModule", {
	  value: true
	});
	normalizeValue.default = normalizeValue$1;
	var _fontSizePxToRem = _interopRequireDefault(requireFontSizePxToRem());
	var _leadingZero = _interopRequireDefault(requireLeadingZero());
	var _quotes = _interopRequireDefault(requireQuotes());
	var _timings = _interopRequireDefault(requireTimings());
	var _whitespace = _interopRequireDefault(requireWhitespace());
	var _zeroDimensions = _interopRequireDefault(requireZeroDimensions());
	var _detectUnclosedFns = _interopRequireDefault(requireDetectUnclosedFns());
	var _postcssValueParser = _interopRequireDefault(requireLib());
	var _convertCamelCaseValues = _interopRequireDefault(requireConvertCamelCaseValues());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const normalizers = [_detectUnclosedFns.default, _whitespace.default, _timings.default, _zeroDimensions.default, _leadingZero.default, _quotes.default, _convertCamelCaseValues.default];
	function normalizeValue$1(value, key, _ref) {
	  let {
	    useRemForFontSize
	  } = _ref;
	  if (value == null) {
	    return value;
	  }
	  const parsedAST = (0, _postcssValueParser.default)(value);
	  const relevantNormalizers = useRemForFontSize ? [...normalizers, _fontSizePxToRem.default] : normalizers;
	  return relevantNormalizers.reduce((ast, fn) => fn(ast, key), parsedAST).toString();
	}
	return normalizeValue;
}

var hasRequiredTransformValue;

function requireTransformValue () {
	if (hasRequiredTransformValue) return transformValue;
	hasRequiredTransformValue = 1;

	Object.defineProperty(transformValue, "__esModule", {
	  value: true
	});
	transformValue.default = transformValue$1;
	transformValue.getNumberSuffix = getNumberSuffix;
	transformValue.timeUnits = transformValue.lengthUnits = void 0;
	var _normalizeValue = _interopRequireDefault(requireNormalizeValue());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	function transformValue$1(key, rawValue, options) {
	  const value = typeof rawValue === 'number' ? String(Math.round(rawValue * 10000) / 10000) + getNumberSuffix(key) : rawValue;
	  if ((key === 'content' || key === 'hyphenateCharacter' || key === 'hyphenate-character') && typeof value === 'string') {
	    const val = value.trim();
	    const cssContentFunctions = ['attr(', 'counter(', 'counters(', 'url(', 'linear-gradient(', 'image-set('];
	    const cssContentKeywords = new Set(['normal', 'none', 'open-quote', 'close-quote', 'no-open-quote', 'no-close-quote', 'inherit', 'initial', 'revert', 'revert-layer', 'unset']);
	    const isCssFunction = cssContentFunctions.some(func => val.includes(func));
	    const isKeyword = cssContentKeywords.has(val);
	    const hasMatchingQuotes = (val.match(/"/g)?.length ?? 0) >= 2 || (val.match(/'/g)?.length ?? 0) >= 2;
	    if (isCssFunction || isKeyword || hasMatchingQuotes) {
	      return val;
	    }
	    return `"${val}"`;
	  }
	  return (0, _normalizeValue.default)(value, key, options);
	}
	function getNumberSuffix(key) {
	  if (unitlessNumberProperties.has(key) || key.startsWith('--')) {
	    return '';
	  }
	  if (!(key in numberPropertySuffixes)) {
	    return 'px';
	  }
	  const suffix = numberPropertySuffixes[key];
	  if (suffix == null) {
	    return 'px';
	  } else {
	    return suffix;
	  }
	}
	const unitlessNumberProperties = new Set(['WebkitLineClamp', 'animationIterationCount', 'aspectRatio', 'borderImageOutset', 'borderImageSlice', 'borderImageWidth', 'counterSet', 'counterReset', 'columnCount', 'flex', 'flexGrow', 'flexShrink', 'flexOrder', 'gridRow', 'gridRowStart', 'gridRowEnd', 'gridColumn', 'gridColumnStart', 'gridColumnEnd', 'gridArea', 'fontWeight', 'hyphenateLimitChars', 'lineClamp', 'lineHeight', 'maskBorderOutset', 'maskBorderSlice', 'maskBorderWidth', 'opacity', 'order', 'orphans', 'tabSize', 'widows', 'zIndex', 'fillOpacity', 'floodOpacity', 'rotate', 'scale', 'shapeImageThreshold', 'stopOpacity', 'strokeDasharray', 'strokeDashoffset', 'strokeMiterlimit', 'strokeOpacity', 'strokeWidth', 'scale', 'mathDepth']);
	const numberPropertySuffixes = {
	  animationDelay: 'ms',
	  animationDuration: 'ms',
	  transitionDelay: 'ms',
	  transitionDuration: 'ms',
	  voiceDuration: 'ms'
	};
	transformValue.timeUnits = new Set(Object.keys(numberPropertySuffixes));
	transformValue.lengthUnits = new Set(['backgroundPositionX', 'backgroundPositionY', 'blockSize', 'borderBlockEndWidth', 'borderBlockStartWidth', 'borderBlockWidth', 'borderVerticalWidth', 'borderVerticalWidth', 'borderBottomLeftRadius', 'borderBottomRightRadius', 'borderBottomWidth', 'borderEndEndRadius', 'borderEndStartRadius', 'borderInlineEndWidth', 'borderEndWidth', 'borderInlineStartWidth', 'borderStartWidth', 'borderInlineWidth', 'borderHorizontalWidth', 'borderLeftWidth', 'borderRightWidth', 'borderSpacing', 'borderStartEndRadius', 'borderStartStartRadius', 'borderTopLeftRadius', 'borderTopRightRadius', 'borderTopWidth', 'bottom', 'columnGap', 'columnRuleWidth', 'columnWidth', 'containIntrinsicBlockSize', 'containIntrinsicHeight', 'containIntrinsicInlineSize', 'containIntrinsicWidth', 'flexBasis', 'fontSize', 'fontSmooth', 'height', 'inlineSize', 'insetBlockEnd', 'insetBlockStart', 'insetInlineEnd', 'insetInlineStart', 'left', 'letterSpacing', 'marginBlockEnd', 'marginBlockStart', 'marginBottom', 'marginInlineEnd', 'marginEnd', 'marginInlineStart', 'marginStart', 'marginLeft', 'marginRight', 'marginTop', 'maxBlockSize', 'maxHeight', 'maxInlineSize', 'maxWidth', 'minBlockSize', 'minHeight', 'minInlineSize', 'minWidth', 'offsetDistance', 'outlineOffset', 'outlineWidth', 'overflowClipMargin', 'paddingBlockEnd', 'paddingBlockStart', 'paddingBottom', 'paddingInlineEnd', 'paddingEnd', 'paddingInlineStart', 'paddingStart', 'paddingLeft', 'paddingRight', 'paddingTop', 'perspective', 'right', 'rowGap', 'scrollMarginBlockEnd', 'scrollMarginBlockStart', 'scrollMarginBottom', 'scrollMarginInlineEnd', 'scrollMarginInlineStart', 'scrollMarginLeft', 'scrollMarginRight', 'scrollMarginTop', 'scrollPaddingBlockEnd', 'scrollPaddingBlockStart', 'scrollPaddingBottom', 'scrollPaddingInlineEnd', 'scrollPaddingInlineStart', 'scrollPaddingLeft', 'scrollPaddingRight', 'scrollPaddingTop', 'scrollSnapMarginBottom', 'scrollSnapMarginLeft', 'scrollSnapMarginRight', 'scrollSnapMarginTop', 'shapeMargin', 'tabSize', 'textDecorationThickness', 'textIndent', 'textUnderlineOffset', 'top', 'transformOrigin', 'translate', 'verticalAlign', 'width', 'wordSpacing', 'border', 'borderBlock', 'borderBlockEnd', 'borderBlockStart', 'borderBottom', 'borderLeft', 'borderRadius', 'borderRight', 'borderTop', 'borderWidth', 'columnRule', 'containIntrinsicSize', 'gap', 'inset', 'insetBlock', 'insetInline', 'margin', 'marginBlock', 'marginVertical', 'marginInline', 'marginHorizontal', 'offset', 'outline', 'padding', 'paddingBlock', 'paddingVertical', 'paddingInline', 'paddingHorizontal', 'scrollMargin', 'scrollMarginBlock', 'scrollMarginInline', 'scrollPadding', 'scrollPaddingBlock', 'scrollPaddingInline', 'scrollSnapMargin']);
	return transformValue;
}

var transformValueExports = requireTransformValue();

function evaluateStyleXCreateArg(path, traversalState) {
  let functions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    identifiers: {},
    memberExpressions: {}
  };
  if (!path.isObjectExpression()) {
    return evaluate(path, traversalState, functions);
  }
  const value = {};
  const fns = {};
  for (const prop of path.get('properties')) {
    if (!prop.isObjectProperty()) {
      return evaluate(path, traversalState, functions);
    }
    const objPropPath = prop;
    const keyResult = evaluateObjKey(objPropPath, traversalState, functions);
    if (!keyResult.confident) {
      return {
        confident: false,
        deopt: keyResult.deopt,
        value: null
      };
    }
    const key = keyResult.value;
    const valPath = prop.get('value');
    if (!valPath.isArrowFunctionExpression()) {
      const val = evaluate(valPath, traversalState, functions);
      if (!val.confident) {
        return val;
      }
      value[key] = val.value;
      continue;
    }
    const fnPath = valPath;
    const allParams = fnPath.get('params');
    validateDynamicStyleParams(fnPath, allParams);
    const params = allParams.filter(param => param.isIdentifier()).map(param => param.node);
    const fnBody = fnPath.get('body');
    if (!fnBody.isObjectExpression()) {
      return evaluate(path, traversalState, functions);
    }
    const fnObjectBody = fnBody;
    const evalResult = evaluatePartialObjectRecursively(fnObjectBody, traversalState, functions);
    if (!evalResult.confident) {
      const {
        confident,
        value: v,
        deopt
      } = evalResult;
      return {
        confident,
        value: v,
        deopt
      };
    }
    const {
      value: v,
      inlineStyles
    } = evalResult;
    value[key] = v;
    fns[key] = [params, inlineStyles ?? {}];
  }
  return {
    value,
    confident: true,
    fns
  };
}
function evaluatePartialObjectRecursively(path, traversalState) {
  let functions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {
    identifiers: {},
    memberExpressions: {}
  };
  let keyPath = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : [];
  const obj = {};
  const inlineStyles = {};
  const props = path.get('properties');
  for (const prop of props) {
    if (prop.isObjectMethod()) {
      return {
        value: null,
        confident: false
      };
    }
    if (prop.isSpreadElement()) {
      const result = evaluate(prop.get('argument'), traversalState, functions);
      if (!result.confident) {
        return result;
      }
      Object.assign(obj, result.value);
      continue;
    }
    if (prop.isObjectProperty()) {
      const keyResult = evaluateObjKey(prop, traversalState, functions);
      if (!keyResult.confident) {
        return {
          confident: false,
          deopt: keyResult.deopt,
          value: null
        };
      }
      let key = keyResult.value;
      if (key.startsWith('var(') && key.endsWith(')')) {
        key = key.slice(4, -1);
      }
      const valuePath = prop.get('value');
      if (valuePath.isObjectExpression()) {
        const result = evaluatePartialObjectRecursively(valuePath, traversalState, functions, [...keyPath, key]);
        if (!result.confident) {
          return {
            confident: false,
            deopt: result.deopt,
            value: null
          };
        }
        obj[key] = result.value;
        Object.assign(inlineStyles, result.inlineStyles);
      } else {
        const result = evaluate(valuePath, traversalState, functions);
        if (!result.confident) {
          const fullKeyPath = [...keyPath, key];
          const varName = '--' + (keyPath.length > 0 ? shared.utils.hash([...keyPath, key].join('_')) : key);
          obj[key] = `var(${varName})`;
          const node = valuePath.node;
          if (!t__namespace.isExpression(node)) {
            throw valuePath.buildCodeFrameError('Expected expression as style value', SyntaxError);
          }
          const expression = node;
          const propName = fullKeyPath.find(k => !k.startsWith(':') && !k.startsWith('@') && k !== 'default') ?? key;
          const unit = transformValueExports.timeUnits.has(propName) || transformValueExports.lengthUnits.has(propName) ? transformValueExports.getNumberSuffix(propName) : '';
          const inlineStyleExpression = unit !== '' ? t__namespace.callExpression(t__namespace.arrowFunctionExpression([t__namespace.identifier('val')], t__namespace.conditionalExpression(t__namespace.binaryExpression('===', t__namespace.unaryExpression('typeof', t__namespace.identifier('val')), t__namespace.stringLiteral('number')), t__namespace.binaryExpression('+', t__namespace.identifier('val'), t__namespace.stringLiteral(unit)), t__namespace.conditionalExpression(t__namespace.binaryExpression('!=', t__namespace.identifier('val'), t__namespace.nullLiteral()), t__namespace.identifier('val'), t__namespace.identifier('undefined')))), [expression]) : t__namespace.conditionalExpression(t__namespace.binaryExpression('!=', expression, t__namespace.nullLiteral()), expression, t__namespace.identifier('undefined'));
          inlineStyles[varName] = {
            path: [...keyPath, key],
            originalExpression: expression,
            expression: inlineStyleExpression
          };
        } else {
          obj[key] = result.value;
        }
      }
    }
  }
  return {
    value: obj,
    confident: true,
    inlineStyles
  };
}
function evaluateObjKey(prop, traversalState, functions) {
  const keyPath = prop.get('key');
  let key;
  if (prop.node.computed) {
    const result = evaluate(keyPath, traversalState, functions);
    if (!result.confident) {
      return {
        confident: false,
        deopt: result.deopt
      };
    }
    key = result.value;
  } else if (keyPath.isIdentifier()) {
    key = keyPath.node.name;
  } else {
    key = keyPath.node.value;
  }
  return {
    confident: true,
    value: String(key)
  };
}
function validateDynamicStyleParams(path, params) {
  if (params.some(param => !param.isIdentifier())) {
    throw path.buildCodeFrameError(shared.messages.ONLY_NAMED_PARAMETERS_IN_DYNAMIC_STYLE_FUNCTIONS, SyntaxError);
  }
}

var preprocessRules = {};

var applicationOrder = {};

var hasRequiredApplicationOrder;

function requireApplicationOrder () {
	if (hasRequiredApplicationOrder) return applicationOrder;
	hasRequiredApplicationOrder = 1;

	Object.defineProperty(applicationOrder, "__esModule", {
	  value: true
	});
	applicationOrder.default = void 0;
	const shorthands = {
	  all: _ => {
	    throw new Error('all is not supported');
	  },
	  animation: value => [['animation', value], ['animationComposition', null], ['animationName', null], ['animationDuration', null], ['animationTimingFunction', null], ['animationDelay', null], ['animationIterationCount', null], ['animationDirection', null], ['animationFillMode', null], ['animationPlayState', null], ...shorthands.animationRange(null), ['animationTimeline', null]],
	  animationRange: value => [['animationRange', value], ['animationRangeEnd', null], ['animationRangeStart', null]],
	  background: value => [['background', value], ['backgroundAttachment', null], ['backgroundClip', null], ['backgroundColor', null], ['backgroundImage', null], ['backgroundOrigin', null], ...shorthands.backgroundPosition(null), ['backgroundRepeat', null], ['backgroundSize', null]],
	  backgroundPosition: value => [['backgroundPosition', value], ['backgroundPositionX', null], ['backgroundPositionY', null]],
	  border: rawValue => [['border', rawValue], ...shorthands.borderWidth(null), ...shorthands.borderStyle(null), ...shorthands.borderColor(null)],
	  borderInline: rawValue => [['borderInline', rawValue], ...shorthands.borderInlineWidth(null), ...shorthands.borderInlineStyle(null), ...shorthands.borderInlineColor(null)],
	  borderBlock: rawValue => [['borderBlock', rawValue], ...shorthands.borderBlockWidth(null), ...shorthands.borderBlockStyle(null), ...shorthands.borderBlockColor(null)],
	  borderTop: rawValue => [['borderTop', rawValue], ['borderTopWidth', null], ['borderTopStyle', null], ['borderTopColor', null]],
	  borderInlineEnd: rawValue => [['borderInlineEnd', rawValue], ...shorthands.borderInlineEndWidth(null), ...shorthands.borderInlineEndStyle(null), ...shorthands.borderInlineEndColor(null)],
	  borderRight: rawValue => [['borderRight', rawValue], ...shorthands.borderRightWidth(null), ...shorthands.borderRightStyle(null), ...shorthands.borderRightColor(null)],
	  borderBottom: rawValue => [['borderBottom', rawValue], ['borderBottomWidth', null], ['borderBottomStyle', null], ['borderBottomColor', null]],
	  borderInlineStart: rawValue => [['borderInlineStart', rawValue], ...shorthands.borderInlineStartWidth(null), ...shorthands.borderInlineStartStyle(null), ...shorthands.borderInlineStartColor(null)],
	  borderLeft: rawValue => [['borderLeft', rawValue], ...shorthands.borderLeftWidth(null), ...shorthands.borderLeftStyle(null), ...shorthands.borderLeftColor(null)],
	  borderInlineWidth: rawValue => [['borderInlineWidth', rawValue], ['borderInlineStartWidth', null], ['borderLeftWidth', null], ['borderInlineEndWidth', null], ['borderRightWidth', null]],
	  borderInlineStyle: rawValue => [['borderInlineStyle', rawValue], ['borderInlineStartStyle', null], ['borderLeftStyle', null], ['borderInlineEndStyle', null], ['borderRightStyle', null]],
	  borderInlineColor: rawValue => [['borderInlineColor', rawValue], ['borderInlineStartColor', null], ['borderLeftColor', null], ['borderInlineEndColor', null], ['borderRightColor', null]],
	  borderBlockWidth: rawValue => [['borderBlockWidth', rawValue], ['borderTopWidth', null], ['borderBottomWidth', null]],
	  borderBlockStyle: rawValue => [['borderBlockStyle', rawValue], ['borderTopStyle', null], ['borderBottomStyle', null]],
	  borderBlockColor: rawValue => [['borderBlockColor', rawValue], ['borderTopColor', null], ['borderBottomColor', null]],
	  borderColor: value => [['borderColor', value], ...shorthands.borderInlineColor(null), ...shorthands.borderBlockColor(null)],
	  borderStyle: value => [['borderStyle', value], ...shorthands.borderInlineStyle(null), ...shorthands.borderBlockStyle(null)],
	  borderWidth: value => [['borderWidth', value], ...shorthands.borderInlineWidth(null), ...shorthands.borderBlockWidth(null)],
	  borderInlineStartColor: value => [['borderInlineStartColor', value], ['borderLeftColor', null], ['borderRightColor', null]],
	  borderInlineEndColor: value => [['borderInlineEndColor', value], ['borderLeftColor', null], ['borderRightColor', null]],
	  borderInlineStartStyle: value => [['borderInlineStartStyle', value], ['borderLeftStyle', null], ['borderRightStyle', null]],
	  borderInlineEndStyle: value => [['borderInlineEndStyle', value], ['borderLeftStyle', null], ['borderRightStyle', null]],
	  borderInlineStartWidth: value => [['borderInlineStartWidth', value], ['borderLeftWidth', null], ['borderRightWidth', null]],
	  borderInlineEndWidth: value => [['borderInlineEndWidth', value], ['borderLeftWidth', null], ['borderRightWidth', null]],
	  borderLeftColor: value => [['borderLeftColor', value], ['borderInlineStartColor', null], ['borderInlineEndColor', null]],
	  borderRightColor: value => [['borderRightColor', value], ['borderInlineStartColor', null], ['borderInlineEndColor', null]],
	  borderLeftStyle: value => [['borderLeftStyle', value], ['borderInlineStartStyle', null], ['borderInlineEndStyle', null]],
	  borderRightStyle: value => [['borderRightStyle', value], ['borderInlineStartStyle', null], ['borderInlineEndStyle', null]],
	  borderLeftWidth: value => [['borderLeftWidth', value], ['borderInlineStartWidth', null], ['borderInlineEndWidth', null]],
	  borderRightWidth: value => [['borderRightWidth', value], ['borderInlineStartWidth', null], ['borderInlineEndWidth', null]],
	  borderRadius: value => [['borderRadius', value], ['borderStartStartRadius', null], ['borderStartEndRadius', null], ['borderEndStartRadius', null], ['borderEndEndRadius', null], ['borderTopLeftRadius', null], ['borderTopRightRadius', null], ['borderBottomLeftRadius', null], ['borderBottomRightRadius', null]],
	  borderStartStartRadius: value => [['borderStartStartRadius', value], ['borderTopLeftRadius', null], ['borderTopRightRadius', null]],
	  borderStartEndRadius: value => [['borderStartEndRadius', value], ['borderTopLeftRadius', null], ['borderTopRightRadius', null]],
	  borderEndStartRadius: value => [['borderEndStartRadius', value], ['borderBottomLeftRadius', null], ['borderBottomRightRadius', null]],
	  borderEndEndRadius: value => [['borderEndEndRadius', value], ['borderBottomLeftRadius', null], ['borderBottomRightRadius', null]],
	  borderTopLeftRadius: value => [['borderTopLeftRadius', value], ['borderStartStartRadius', null], ['borderStartEndRadius', null]],
	  borderTopRightRadius: value => [['borderTopRightRadius', value], ['borderStartStartRadius', null], ['borderStartEndRadius', null]],
	  borderBottomLeftRadius: value => [['borderBottomLeftRadius', value], ['borderEndStartRadius', null], ['borderEndEndRadius', null]],
	  borderBottomRightRadius: value => [['borderBottomRightRadius', value], ['borderEndStartRadius', null], ['borderEndEndRadius', null]],
	  borderImage: value => [['borderImage', value], ['borderImageOutset', null], ['borderImageRepeat', null], ['borderImageSlice', null], ['borderImageSource', null], ['borderImageWidth', null]],
	  columnRule: value => [['columnRule', value], ['columnRuleColor', null], ['columnRuleStyle', null], ['columnRuleWidth', null]],
	  columns: value => [['columns', value], ['columnCount', null], ['columnWidth', null]],
	  container: value => [['container', value], ['containerName', null], ['containerType', null]],
	  containIntrinsicSize: value => [['containIntrinsicSize', value], ['containIntrinsicWidth', null], ['containIntrinsicHeight', null]],
	  flex: value => [['flex', value], ['flexGrow', null], ['flexShrink', null], ['flexBasis', null]],
	  flexFlow: value => [['flexFlow', value], ['flexDirection', null], ['flexWrap', null]],
	  font: value => [['font', value], ['fontFamily', null], ['fontSize', null], ['fontStretch', null], ['fontStyle', null], ...shorthands.fontVariant(null), ['fontWeight', null], ['lineHeight', null]],
	  fontVariant: value => [['fontVariant', value], ['fontVariantAlternates', null], ['fontVariantCaps', null], ['fontVariantEastAsian', null], ['fontVariantEmoji', null], ['fontVariantLigatures', null], ['fontVariantNumeric', null], ['fontVariantPosition', null]],
	  gap: value => [['gap', value], ['rowGap', null], ['columnGap', null]],
	  grid: value => [['grid', value], ...shorthands.gridTemplate(null), ['gridAutoRows', null], ['gridAutoColumns', null], ['gridAutoFlow', null]],
	  gridArea: value => [['gridArea', value], ['gridRow', null], ['gridRowStart', null], ['gridRowEnd', null], ['gridColumn', null], ['gridColumnStart', null], ['gridColumnEnd', null]],
	  gridRow: value => [['gridRow', value], ['gridRowStart', null], ['gridRowEnd', null]],
	  gridColumn: value => [['gridColumn', value], ['gridColumnStart', null], ['gridColumnEnd', null]],
	  gridTemplate: value => [['gridTemplate', value], ['gridTemplateAreas', null], ['gridTemplateColumns', null], ['gridTemplateRows', null]],
	  inset: value => [['inset', value], ...shorthands.insetInline(null), ...shorthands.insetBlock(null)],
	  insetInline: value => [['insetInline', value], ['insetInlineStart', null], ['insetInlineEnd', null], ['left', null], ['right', null]],
	  insetBlock: value => [['insetBlock', value], ['top', null], ['bottom', null]],
	  insetInlineStart: value => [['insetInlineStart', value], ['left', null], ['right', null]],
	  insetInlineEnd: value => [['insetInlineEnd', value], ['left', null], ['right', null]],
	  left: value => [['left', value], ['insetInlineStart', null], ['insetInlineEnd', null]],
	  right: value => [['right', value], ['insetInlineStart', null], ['insetInlineEnd', null]],
	  listStyle: value => [['listStyle', value], ['listStyleImage', null], ['listStylePosition', null], ['listStyleType', null]],
	  margin: value => [['margin', value], ...shorthands.marginInline(null), ...shorthands.marginBlock(null)],
	  marginInline: value => [['marginInline', value], ['marginInlineStart', null], ['marginLeft', null], ['marginInlineEnd', null], ['marginRight', null]],
	  marginBlock: value => [['marginBlock', value], ['marginTop', null], ['marginBottom', null]],
	  marginInlineStart: value => [['marginInlineStart', value], ['marginLeft', null], ['marginRight', null]],
	  marginInlineEnd: value => [['marginInlineEnd', value], ['marginLeft', null], ['marginRight', null]],
	  marginLeft: value => [['marginLeft', value], ['marginInlineStart', null], ['marginInlineEnd', null]],
	  marginRight: value => [['marginRight', value], ['marginInlineStart', null], ['marginInlineEnd', null]],
	  mask: value => [['mask', value], ['maskClip', null], ['maskComposite', null], ['maskImage', null], ['maskMode', null], ['maskOrigin', null], ['maskPosition', null], ['maskRepeat', null], ['maskSize', null]],
	  maskBorder: value => [['maskBorder', value], ['maskBorderMode', null], ['maskBorderOutset', null], ['maskBorderRepeat', null], ['maskBorderSlice', null], ['maskBorderSource', null], ['maskBorderWidth', null]],
	  offset: value => [['offset', value], ['offsetAnchor', null], ['offsetDistance', null], ['offsetPath', null], ['offsetPosition', null], ['offsetRotate', null]],
	  outline: value => [['outline', value], ['outlineColor', null], ['outlineOffset', null], ['outlineStyle', null], ['outlineWidth', null]],
	  overflow: value => [['overflow', value], ['overflowX', null], ['overflowY', null]],
	  padding: rawValue => {
	    return [['padding', rawValue], ...shorthands.paddingInline(null), ...shorthands.paddingBlock(null)];
	  },
	  paddingInline: rawValue => [['paddingInline', rawValue], ['paddingStart', null], ['paddingLeft', null], ['paddingEnd', null], ['paddingRight', null]],
	  paddingBlock: rawValue => [['paddingBlock', rawValue], ['paddingTop', null], ['paddingBottom', null]],
	  paddingInlineStart: value => [['paddingInlineStart', value], ['paddingLeft', null], ['paddingRight', null]],
	  paddingInlineEnd: value => [['paddingInlineEnd', value], ['paddingLeft', null], ['paddingRight', null]],
	  paddingLeft: value => [['paddingLeft', value], ['paddingInlineStart', null], ['paddingInlineEnd', null]],
	  paddingRight: value => [['paddingRight', value], ['paddingInlineStart', null], ['paddingInlineEnd', null]],
	  placeContent: value => [['placeContent', value], ['alignContent', null], ['justifyContent', null]],
	  placeItems: value => [['placeItems', value], ['alignItems', null], ['justifyItems', null]],
	  placeSelf: value => [['placeSelf', value], ['alignSelf', null], ['justifySelf', null]],
	  scrollMargin: value => [['scrollMargin', value], ...shorthands.scrollMarginBlock(null), ...shorthands.scrollMarginInline(null)],
	  scrollMarginBlock: value => [['scrollMarginBlock', value], ['scrollMarginTop', null], ['scrollMarginBottom', null]],
	  scrollMarginInline: value => [['scrollMarginInline', value], ['scrollMarginInlineStart', null], ['scrollMarginInlineEnd', null], ['scrollMarginLeft', null], ['scrollMarginRight', null]],
	  scrollMarginInlineStart: value => [['scrollMarginInlineStart', value], ['scrollMarginLeft', null], ['scrollMarginRight', null]],
	  scrollMarginInlineEnd: value => [['scrollMarginInlineEnd', value], ['scrollMarginLeft', null], ['scrollMarginRight', null]],
	  scrollMarginLeft: value => [['scrollMarginLeft', value], ['scrollMarginInlineStart', null], ['scrollMarginInlineEnd', null]],
	  scrollMarginRight: value => [['scrollMarginRight', value], ['scrollMarginInlineStart', null], ['scrollMarginInlineEnd', null]],
	  scrollPadding: value => [['scrollPadding', value], ...shorthands.scrollPaddingBlock(null), ...shorthands.scrollPaddingInline(null)],
	  scrollPaddingBlock: value => [['scrollPaddingBlock', value], ['scrollPaddingTop', null], ['scrollPaddingBottom', null]],
	  scrollPaddingInline: value => [['scrollPaddingInline', value], ['scrollPaddingInlineStart', null], ['scrollPaddingInlineEnd', null], ['scrollPaddingLeft', null], ['scrollPaddingRight', null]],
	  scrollPaddingInlineStart: value => [['scrollPaddingInlineStart', value], ['scrollPaddingLeft', null], ['scrollPaddingRight', null]],
	  scrollPaddingInlineEnd: value => [['scrollPaddingInlineEnd', value], ['scrollPaddingLeft', null], ['scrollPaddingRight', null]],
	  scrollPaddingLeft: value => [['scrollPaddingLeft', value], ['scrollPaddingInlineStart', null], ['scrollPaddingInlineEnd', null]],
	  scrollPaddingRight: value => [['scrollPaddingRight', value], ['scrollPaddingInlineStart', null], ['scrollPaddingInlineEnd', null]],
	  scrollSnapType: value => [['scrollSnapType', value], ['scrollSnapTypeX', null], ['scrollSnapTypeY', null]],
	  scrollTimeline: value => [['scrollTimeline', value], ['scrollTimelineName', null], ['scrollTimelineAxis', null]],
	  textDecoration: value => [['textDecoration', value], ['textDecorationColor', null], ['textDecorationLine', null], ['textDecorationStyle', null], ['textDecorationThickness', null]],
	  textEmphasis: value => [['textEmphasis', value], ['textEmphasisColor', null], ['textEmphasisStyle', null]],
	  transition: value => [['transition', value], ['transitionBehavior', null], ['transitionDelay', null], ['transitionDuration', null], ['transitionProperty', null], ['transitionTimingFunction', null]]
	};
	const aliases = {
	  borderHorizontal: shorthands.borderInline,
	  borderVertical: shorthands.borderBlock,
	  borderBlockStart: shorthands.borderTop,
	  borderEnd: shorthands.borderInlineEnd,
	  borderBlockEnd: shorthands.borderBottom,
	  borderStart: shorthands.borderInlineStart,
	  blockSize: val => [['height', val]],
	  inlineSize: val => [['width', val]],
	  minBlockSize: val => [['minHeight', val]],
	  minInlineSize: val => [['minWidth', val]],
	  maxBlockSize: val => [['maxHeight', val]],
	  maxInlineSize: val => [['maxWidth', val]],
	  borderHorizontalWidth: shorthands.borderInlineWidth,
	  borderHorizontalStyle: shorthands.borderInlineStyle,
	  borderHorizontalColor: shorthands.borderInlineColor,
	  borderVerticalWidth: shorthands.borderBlockWidth,
	  borderVerticalStyle: shorthands.borderBlockStyle,
	  borderVerticalColor: shorthands.borderBlockColor,
	  borderBlockStartColor: value => [['borderTopColor', value]],
	  borderBlockEndColor: value => [['borderBottomColor', value]],
	  borderBlockStartStyle: value => [['borderTopStyle', value]],
	  borderBlockEndStyle: value => [['borderBottomStyle', value]],
	  borderBlockStartWidth: value => [['borderTopWidth', value]],
	  borderBlockEndWidth: value => [['borderBottomWidth', value]],
	  borderStartColor: shorthands.borderInlineStartColor,
	  borderEndColor: shorthands.borderInlineEndColor,
	  borderStartStyle: shorthands.borderInlineStartStyle,
	  borderEndStyle: shorthands.borderInlineEndStyle,
	  borderStartWidth: shorthands.borderInlineStartWidth,
	  borderEndWidth: shorthands.borderInlineEndWidth,
	  borderTopStartRadius: value => [['borderStartStartRadius', value]],
	  borderTopEndRadius: value => [['borderStartEndRadius', value]],
	  borderBottomStartRadius: value => [['borderEndStartRadius', value]],
	  borderBottomEndRadius: value => [['borderEndEndRadius', value]],
	  containIntrinsicBlockSize: value => [['containIntrinsicHeight', value]],
	  containIntrinsicInlineSize: value => [['containIntrinsicWidth', value]],
	  gridGap: shorthands.gap,
	  gridRowGap: value => [['rowGap', value]],
	  gridColumnGap: value => [['columnGap', value]],
	  marginBlockStart: value => [['marginTop', value]],
	  marginBlockEnd: value => [['marginBottom', value]],
	  marginStart: shorthands.marginInlineStart,
	  marginEnd: shorthands.marginInlineEnd,
	  marginHorizontal: shorthands.marginInline,
	  marginVertical: shorthands.marginBlock,
	  overflowBlock: value => [['overflowY', value]],
	  overflowInline: value => [['overflowX', value]],
	  paddingBlockStart: rawValue => [['paddingTop', rawValue]],
	  paddingBlockEnd: rawValue => [['paddingBottom', rawValue]],
	  paddingStart: shorthands.paddingInlineStart,
	  paddingEnd: shorthands.paddingInlineEnd,
	  paddingHorizontal: shorthands.paddingInline,
	  paddingVertical: shorthands.paddingBlock,
	  scrollMarginBlockStart: value => [['scrollMarginTop', value]],
	  scrollMarginBlockEnd: value => [['scrollMarginBottom', value]],
	  insetBlockStart: value => [['top', value]],
	  insetBlockEnd: value => [['bottom', value]],
	  start: shorthands.insetInlineStart,
	  end: shorthands.insetInlineEnd
	};
	const expansions = {
	  ...shorthands,
	  ...aliases
	};
	applicationOrder.default = expansions;
	return applicationOrder;
}

var legacyExpandShorthands$1 = {};

var splitCssValue = {};

var hasRequiredSplitCssValue;

function requireSplitCssValue () {
	if (hasRequiredSplitCssValue) return splitCssValue;
	hasRequiredSplitCssValue = 1;

	Object.defineProperty(splitCssValue, "__esModule", {
	  value: true
	});
	splitCssValue.default = splitValue;
	var _postcssValueParser = _interopRequireDefault(requireLib());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	function printNode(node) {
	  switch (node.type) {
	    case 'word':
	    case 'string':
	      return `${node.value}`;
	    case 'function':
	      return `${node.value}(${node.nodes.map(printNode).join('')})`;
	    default:
	      return node.value;
	  }
	}
	function splitValue(str) {
	  if (str == null || typeof str === 'number') {
	    return [str];
	  }
	  if (Array.isArray(str)) {
	    return str;
	  }
	  const parsed = (0, _postcssValueParser.default)(str.trim());
	  const nodes = parsed.nodes.filter(node => node.type !== 'space' && node.type !== 'div').map(printNode);
	  if (nodes.length > 1 && nodes[nodes.length - 1].toLowerCase() === '!important') {
	    return nodes.slice(0, nodes.length - 1).map(node => node + ' !important');
	  }
	  return nodes;
	}
	return splitCssValue;
}

var hasRequiredLegacyExpandShorthands;

function requireLegacyExpandShorthands () {
	if (hasRequiredLegacyExpandShorthands) return legacyExpandShorthands$1;
	hasRequiredLegacyExpandShorthands = 1;

	Object.defineProperty(legacyExpandShorthands$1, "__esModule", {
	  value: true
	});
	legacyExpandShorthands$1.default = void 0;
	var _splitCssValue = _interopRequireDefault(requireSplitCssValue());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const shorthands = {
	  border: rawValue => {
	    return [['borderTop', rawValue], ['borderEnd', rawValue], ['borderBottom', rawValue], ['borderStart', rawValue]];
	  },
	  borderColor: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['borderTopColor', top], ['borderEndColor', right], ['borderBottomColor', bottom], ['borderStartColor', left]];
	  },
	  borderHorizontal: rawValue => {
	    return [['borderStart', rawValue], ['borderEnd', rawValue]];
	  },
	  borderStyle: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['borderTopStyle', top], ['borderEndStyle', right], ['borderBottomStyle', bottom], ['borderStartStyle', left]];
	  },
	  borderVertical: rawValue => {
	    return [['borderTop', rawValue], ['borderBottom', rawValue]];
	  },
	  borderWidth: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['borderTopWidth', top], ['borderEndWidth', right], ['borderBottomWidth', bottom], ['borderStartWidth', left]];
	  },
	  borderHorizontalColor: rawValue => [['borderStartColor', rawValue], ['borderEndColor', rawValue]],
	  borderHorizontalStyle: rawValue => [['borderStartStyle', rawValue], ['borderEndStyle', rawValue]],
	  borderHorizontalWidth: rawValue => [['borderStartWidth', rawValue], ['borderEndWidth', rawValue]],
	  borderVerticalColor: rawValue => [['borderTopColor', rawValue], ['borderBottomColor', rawValue]],
	  borderVerticalStyle: rawValue => [['borderTopStyle', rawValue], ['borderBottomStyle', rawValue]],
	  borderVerticalWidth: rawValue => [['borderTopWidth', rawValue], ['borderBottomWidth', rawValue]],
	  borderRadius: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['borderTopStartRadius', top], ['borderTopEndRadius', right], ['borderBottomEndRadius', bottom], ['borderBottomStartRadius', left]];
	  },
	  containIntrinsicSize: rawValue => {
	    const parts = (0, _splitCssValue.default)(rawValue);
	    const [width, height = width] = parts.reduce((coll, part) => {
	      const lastElement = coll[coll.length - 1];
	      if (lastElement === 'auto' && part != null) {
	        return [...coll.slice(0, -1), `auto ${part}`];
	      }
	      return [...coll, part];
	    }, []);
	    return [['containIntrinsicWidth', width], ['containIntrinsicHeight', height]];
	  },
	  inset: rawValue => [['top', rawValue], ['end', rawValue], ['bottom', rawValue], ['start', rawValue]],
	  insetInline: rawValue => [...shorthands.start(rawValue), ...shorthands.end(rawValue)],
	  insetBlock: rawValue => [['top', rawValue], ['bottom', rawValue]],
	  start: rawValue => [['start', rawValue], ['left', null], ['right', null]],
	  end: rawValue => [['end', rawValue], ['left', null], ['right', null]],
	  left: rawValue => [['left', rawValue], ['start', null], ['end', null]],
	  right: rawValue => [['right', rawValue], ['start', null], ['end', null]],
	  gap: rawValue => {
	    const [row, column = row] = (0, _splitCssValue.default)(rawValue);
	    return [['rowGap', row], ['columnGap', column]];
	  },
	  margin: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['marginTop', top], ['marginEnd', right], ['marginBottom', bottom], ['marginStart', left]];
	  },
	  marginHorizontal: rawValue => [...shorthands.marginStart(rawValue), ...shorthands.marginEnd(rawValue)],
	  marginStart: rawValue => [['marginStart', rawValue], ['marginLeft', null], ['marginRight', null]],
	  marginEnd: rawValue => [['marginEnd', rawValue], ['marginLeft', null], ['marginRight', null]],
	  marginLeft: rawValue => [['marginLeft', rawValue], ['marginStart', null], ['marginEnd', null]],
	  marginRight: rawValue => [['marginRight', rawValue], ['marginStart', null], ['marginEnd', null]],
	  marginVertical: rawValue => {
	    return [['marginTop', rawValue], ['marginBottom', rawValue]];
	  },
	  overflow: rawValue => {
	    const [x, y = x] = (0, _splitCssValue.default)(rawValue);
	    return [['overflowX', x], ['overflowY', y]];
	  },
	  padding: rawValue => {
	    const [top, right = top, bottom = top, left = right] = (0, _splitCssValue.default)(rawValue);
	    return [['paddingTop', top], ['paddingEnd', right], ['paddingBottom', bottom], ['paddingStart', left]];
	  },
	  paddingHorizontal: val => [...shorthands.paddingStart(val), ...shorthands.paddingEnd(val)],
	  paddingStart: val => [['paddingStart', val], ['paddingLeft', null], ['paddingRight', null]],
	  paddingEnd: val => [['paddingEnd', val], ['paddingLeft', null], ['paddingRight', null]],
	  paddingLeft: val => [['paddingLeft', val], ['paddingStart', null], ['paddingEnd', null]],
	  paddingRight: val => [['paddingRight', val], ['paddingStart', null], ['paddingEnd', null]],
	  paddingVertical: val => [['paddingTop', val], ['paddingBottom', val]]
	};
	const aliases = {
	  insetBlockStart: val => [['top', val]],
	  insetBlockEnd: val => [['bottom', val]],
	  insetInlineStart: shorthands.start,
	  insetInlineEnd: shorthands.end,
	  blockSize: val => [['height', val]],
	  inlineSize: val => [['width', val]],
	  minBlockSize: val => [['minHeight', val]],
	  minInlineSize: val => [['minWidth', val]],
	  maxBlockSize: val => [['maxHeight', val]],
	  maxInlineSize: val => [['maxWidth', val]],
	  borderBlockWidth: shorthands.borderVerticalWidth,
	  borderBlockStyle: shorthands.borderVerticalStyle,
	  borderBlockColor: shorthands.borderVerticalColor,
	  borderBlockStartWidth: val => [['borderTopWidth', val]],
	  borderBlockStartStyle: val => [['borderTopStyle', val]],
	  borderBlockStartColor: val => [['borderTopColor', val]],
	  borderBlockEndWidth: val => [['borderBottomWidth', val]],
	  borderBlockEndStyle: val => [['borderBottomStyle', val]],
	  borderBlockEndColor: val => [['borderBottomColor', val]],
	  borderInlineWidth: shorthands.borderHorizontalWidth,
	  borderInlineStyle: shorthands.borderHorizontalStyle,
	  borderInlineColor: shorthands.borderHorizontalColor,
	  borderInlineStartWidth: val => [['borderStartWidth', val]],
	  borderInlineStartStyle: val => [['borderStartStyle', val]],
	  borderInlineStartColor: val => [['borderStartColor', val]],
	  borderInlineEndWidth: val => [['borderEndWidth', val]],
	  borderInlineEndStyle: val => [['borderEndStyle', val]],
	  borderInlineEndColor: val => [['borderEndColor', val]],
	  borderStartStartRadius: val => [['borderTopStartRadius', val]],
	  borderStartEndRadius: val => [['borderTopEndRadius', val]],
	  borderEndStartRadius: val => [['borderBottomStartRadius', val]],
	  borderEndEndRadius: val => [['borderBottomEndRadius', val]],
	  gridGap: shorthands.gap,
	  gridRowGap: value => [['rowGap', value]],
	  gridColumnGap: value => [['columnGap', value]],
	  marginBlock: shorthands.marginVertical,
	  marginBlockStart: val => [['marginTop', val]],
	  marginBlockEnd: val => [['marginBottom', val]],
	  marginInline: shorthands.marginHorizontal,
	  marginInlineStart: val => [['marginStart', val]],
	  marginInlineEnd: val => [['marginEnd', val]],
	  overflowBlock: value => [['overflowY', value]],
	  overflowInline: value => [['overflowX', value]],
	  paddingBlock: shorthands.paddingVertical,
	  paddingBlockStart: val => [['paddingTop', val]],
	  paddingBlockEnd: val => [['paddingBottom', val]],
	  paddingInline: shorthands.paddingHorizontal,
	  paddingInlineStart: val => [['paddingStart', val]],
	  paddingInlineEnd: val => [['paddingEnd', val]],
	  scrollMarginBlockStart: value => [['scrollMarginTop', value]],
	  scrollMarginBlockEnd: value => [['scrollMarginBottom', value]]
	};
	const expansions = {
	  ...shorthands,
	  ...aliases
	};
	legacyExpandShorthands$1.default = expansions;
	return legacyExpandShorthands$1;
}

var propertySpecificity = {};

var hasRequiredPropertySpecificity;

function requirePropertySpecificity () {
	if (hasRequiredPropertySpecificity) return propertySpecificity;
	hasRequiredPropertySpecificity = 1;

	Object.defineProperty(propertySpecificity, "__esModule", {
	  value: true
	});
	propertySpecificity.default = void 0;
	const shorthands = {
	  all: _ => {
	    throw new Error('all is not supported');
	  },
	  animation: _value => {
	    throw new Error('animation is not supported');
	  },
	  background: _value => {
	    throw new Error('background is not supported. Use background-color, border-image etc. instead.');
	  },
	  border: _rawValue => {
	    throw new Error('border is not supported. Use border-width, border-style and border-color instead.');
	  },
	  borderInline: _rawValue => {
	    throw new Error('borderInline is not supported. Use borderInlineWidth, borderInlineStyle and borderInlineColor instead.');
	  },
	  borderBlock: _rawValue => {
	    throw new Error('borderBlock is not supported. Use borderBlockWidth, borderBlockStyle and borderBlockColor instead.');
	  },
	  borderTop: _rawValue => {
	    throw new Error('borderTop is not supported. Use borderTopWidth, borderTopStyle and borderTopColor instead.');
	  },
	  borderInlineEnd: _rawValue => {
	    throw new Error('borderInlineEnd is not supported. Use borderInlineEndWidth, borderInlineEndStyle and borderInlineEndColor instead.');
	  },
	  borderRight: _rawValue => {
	    throw new Error('borderRight is not supported. Use borderRightWidth, borderRightStyle and borderRightColor instead.');
	  },
	  borderBottom: _rawValue => {
	    throw new Error('borderBottom is not supported. Use borderBottomWidth, borderBottomStyle and borderBottomColor instead.');
	  },
	  borderInlineStart: _rawValue => {
	    throw new Error('borderInlineStart is not supported. Use borderInlineStartWidth, borderInlineStartStyle and borderInlineStartColor instead.');
	  },
	  borderLeft: _rawValue => {
	    throw new Error(['`borderLeft` is not supported.', 'You could use `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`,', 'but it is preferable to use `borderInlineStartWidth`, `borderInlineStartStyle` and `borderInlineStartColor`.'].join(' '));
	  }
	};
	const aliases = {
	  borderHorizontal: shorthands.borderInline,
	  borderVertical: shorthands.borderBlock,
	  borderBlockStart: shorthands.borderTop,
	  borderEnd: shorthands.borderInlineEnd,
	  borderBlockEnd: shorthands.borderBottom,
	  borderStart: shorthands.borderInlineStart,
	  blockSize: val => [['height', val]],
	  inlineSize: val => [['width', val]],
	  minBlockSize: val => [['minHeight', val]],
	  minInlineSize: val => [['minWidth', val]],
	  maxBlockSize: val => [['maxHeight', val]],
	  maxInlineSize: val => [['maxWidth', val]],
	  borderHorizontalWidth: val => [['borderInlineWidth', val]],
	  borderHorizontalStyle: val => [['borderInlineStyle', val]],
	  borderHorizontalColor: val => [['borderInlineColor', val]],
	  borderVerticalWidth: val => [['borderBlockWidth', val]],
	  borderVerticalStyle: val => [['borderBlockStyle', val]],
	  borderVerticalColor: val => [['borderBlockColor', val]],
	  borderBlockStartColor: value => [['borderTopColor', value]],
	  borderBlockEndColor: value => [['borderBottomColor', value]],
	  borderBlockStartStyle: value => [['borderTopStyle', value]],
	  borderBlockEndStyle: value => [['borderBottomStyle', value]],
	  borderBlockStartWidth: value => [['borderTopWidth', value]],
	  borderBlockEndWidth: value => [['borderBottomWidth', value]],
	  borderStartColor: val => [['borderInlineStartColor', val]],
	  borderEndColor: val => [['borderInlineEndColor', val]],
	  borderStartStyle: val => [['borderInlineStartStyle', val]],
	  borderEndStyle: val => [['borderInlineEndStyle', val]],
	  borderStartWidth: val => [['borderInlineStartWidth', val]],
	  borderEndWidth: val => [['borderInlineEndWidth', val]],
	  borderTopStartRadius: value => [['borderStartStartRadius', value]],
	  borderTopEndRadius: value => [['borderStartEndRadius', value]],
	  borderBottomStartRadius: value => [['borderEndStartRadius', value]],
	  borderBottomEndRadius: value => [['borderEndEndRadius', value]],
	  containIntrinsicBlockSize: value => [['containIntrinsicHeight', value]],
	  containIntrinsicInlineSize: value => [['containIntrinsicWidth', value]],
	  marginBlockStart: value => [['marginTop', value]],
	  marginBlockEnd: value => [['marginBottom', value]],
	  marginStart: val => [['marginInlineStart', val]],
	  marginEnd: val => [['marginInlineEnd', val]],
	  marginHorizontal: val => [['marginInline', val]],
	  marginVertical: val => [['marginBlock', val]],
	  overflowBlock: value => [['overflowY', value]],
	  overflowInline: value => [['overflowX', value]],
	  paddingBlockStart: rawValue => [['paddingTop', rawValue]],
	  paddingBlockEnd: rawValue => [['paddingBottom', rawValue]],
	  paddingStart: val => [['paddingInlineStart', val]],
	  paddingEnd: val => [['paddingInlineEnd', val]],
	  paddingHorizontal: val => [['paddingInline', val]],
	  paddingVertical: val => [['paddingBlock', val]],
	  scrollMarginBlockStart: value => [['scrollMarginTop', value]],
	  scrollMarginBlockEnd: value => [['scrollMarginBottom', value]],
	  insetBlockStart: value => [['top', value]],
	  insetBlockEnd: value => [['bottom', value]],
	  start: val => [['insetInlineStart', val]],
	  end: val => [['insetInlineEnd', val]]
	};
	const expansions = {
	  ...shorthands,
	  ...aliases
	};
	propertySpecificity.default = expansions;
	return propertySpecificity;
}

var hasRequiredPreprocessRules;

function requirePreprocessRules () {
	if (hasRequiredPreprocessRules) return preprocessRules;
	hasRequiredPreprocessRules = 1;

	Object.defineProperty(preprocessRules, "__esModule", {
	  value: true
	});
	preprocessRules.default = flatMapExpandedShorthands;
	preprocessRules.getExpandedKeys = getExpandedKeys;
	var _applicationOrder = _interopRequireDefault(requireApplicationOrder());
	var _legacyExpandShorthands = _interopRequireDefault(requireLegacyExpandShorthands());
	var _propertySpecificity = _interopRequireDefault(requirePropertySpecificity());
	function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
	const expansions = {
	  'application-order': _applicationOrder.default,
	  'property-specificity': _propertySpecificity.default,
	  'legacy-expand-shorthands': _legacyExpandShorthands.default
	};
	function getExpandedKeys(options) {
	  return Object.keys(expansions[options.styleResolution ?? 'application-order']);
	}
	function flatMapExpandedShorthands(objEntry, options) {
	  let [key, value] = objEntry;
	  if (key.startsWith('var(') && key.endsWith(')')) {
	    key = key.slice(4, -1);
	  }
	  const expansion = expansions[options.styleResolution ?? 'application-order'][key];
	  if (expansion) {
	    if (Array.isArray(value)) {
	      throw new Error('Cannot use fallbacks for shorthands. Use the expansion instead.');
	    }
	    return expansion(value);
	  }
	  return [[key, value]];
	}
	return preprocessRules;
}

var preprocessRulesExports = requirePreprocessRules();
var flatMapExpandedShorthands = /*@__PURE__*/getDefaultExportFromCjs(preprocessRulesExports);

function transformStyleXCreate(path, state) {
  const {
    node
  } = path;
  if (node.type !== 'CallExpression') {
    return;
  }
  if (node.callee.type === 'Identifier' && state.stylexCreateImport.has(node.callee.name) || node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'create' && state.stylexImport.has(node.callee.object.name)) {
    validateStyleXCreate(path);
    const args = path.get('arguments');
    const firstArg = args[0];
    state.inStyleXCreate = true;
    const injectedKeyframes = {};
    function keyframes(animation) {
      const [animationName, injectedStyle] = shared.keyframes(animation, state.options);
      injectedKeyframes[animationName] = injectedStyle;
      return animationName;
    }
    const identifiers = {};
    const memberExpressions = {};
    state.stylexFirstThatWorksImport.forEach(name => {
      identifiers[name] = {
        fn: shared.firstThatWorks
      };
    });
    state.stylexKeyframesImport.forEach(name => {
      identifiers[name] = {
        fn: keyframes
      };
    });
    state.stylexImport.forEach(name => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].firstThatWorks = {
        fn: shared.firstThatWorks
      };
      memberExpressions[name].keyframes = {
        fn: keyframes
      };
    });
    const {
      confident,
      value,
      fns,
      reason,
      deopt
    } = evaluateStyleXCreateArg(firstArg, state, {
      identifiers,
      memberExpressions
    });
    if (!confident) {
      throw (deopt ?? path).buildCodeFrameError(reason ?? shared.messages.NON_STATIC_VALUE, SyntaxError);
    }
    const plainObject = value;
    const injectedInheritStyles = {};
    if (fns != null) {
      const dynamicFnsNames = Object.values(fns)?.map(entry => Object.keys(entry[1])).flat();
      dynamicFnsNames.forEach(fnsName => {
        injectedInheritStyles[fnsName] = {
          priority: 0,
          ltr: `@property ${fnsName} { syntax: "*"; inherits: false;}`,
          rtl: null
        };
      });
    }
    let [compiledStyles, injectedStylesSansKeyframes, classPathsPerNamespace] = shared.create(plainObject, state.options);
    const injectedStyles = {
      ...injectedKeyframes,
      ...injectedStylesSansKeyframes,
      ...injectedInheritStyles
    };
    let varName = null;
    if (path.parentPath.isVariableDeclarator()) {
      const idNode = path.parentPath.node.id;
      if (idNode.type === 'Identifier') {
        varName = idNode.name;
      }
    }
    if (state.isDebug && state.opts.enableDebugDataProp) {
      compiledStyles = {
        ...addSourceMapData(compiledStyles, path, state)
      };
    }
    if (state.isDev && state.opts.enableDevClassNames) {
      compiledStyles = {
        ...injectDevClassNames(compiledStyles, varName, state)
      };
    }
    if (state.isTest) {
      compiledStyles = {
        ...convertToTestStyles(compiledStyles, varName, state)
      };
    }
    if (varName != null) {
      const stylesToRemember = removeObjectsWithSpreads(compiledStyles);
      state.styleMap.set(varName, stylesToRemember);
      state.styleVars.set(varName, path.parentPath);
    }
    const resultAst = convertObjectToAST(compiledStyles);
    if (fns != null) {
      resultAst.properties = resultAst.properties.map(prop => {
        if (t__namespace.isObjectProperty(prop)) {
          const key = prop.key.type === 'Identifier' && !prop.computed ? prop.key.name : prop.key.type === 'StringLiteral' ? prop.key.value : null;
          if (key != null && Object.keys(fns).includes(key)) {
            const [params, inlineStyles] = fns[key];
            const origClassPaths = {};
            for (const [className, classPaths] of Object.entries(classPathsPerNamespace[key])) {
              origClassPaths[className] = classPaths.join('_');
            }
            let dynamicStyles = Object.entries(inlineStyles).map(_ref => {
              let [_key, v] = _ref;
              return {
                expression: v.originalExpression,
                key: v.path.slice(0, v.path.findIndex(p => !p.startsWith(':') && !p.startsWith('@')) + 1).join('_'),
                path: v.path.join('_')
              };
            });
            if (state.options.styleResolution === 'legacy-expand-shorthands') {
              dynamicStyles = legacyExpandShorthands(dynamicStyles);
            }
            if (t__namespace.isObjectExpression(prop.value)) {
              const value = prop.value;
              value.properties = value.properties.map(prop => {
                if (!t__namespace.isObjectProperty(prop)) {
                  return prop;
                }
                const objProp = prop;
                const propKey = objProp.key.type === 'Identifier' && !objProp.computed ? objProp.key.name : objProp.key.type === 'StringLiteral' ? objProp.key.value : null;
                if (propKey != null) {
                  const dynamicMatch = dynamicStyles.filter(_ref2 => {
                    let {
                      key
                    } = _ref2;
                    return key === propKey;
                  });
                  if (dynamicMatch.length > 0) {
                    const value = objProp.value;
                    if (t__namespace.isStringLiteral(value)) {
                      const classList = value.value.split(' ');
                      if (classList.length === 1) {
                        const cls = classList[0];
                        const expr = dynamicMatch.find(_ref3 => {
                          let {
                            path
                          } = _ref3;
                          return origClassPaths[cls] === path;
                        })?.expression;
                        if (expr != null) {
                          objProp.value = t__namespace.conditionalExpression(t__namespace.binaryExpression('==', expr, t__namespace.nullLiteral()), t__namespace.nullLiteral(), value);
                        }
                      } else if (classList.some(cls => dynamicMatch.find(_ref4 => {
                        let {
                          path
                        } = _ref4;
                        return origClassPaths[cls] === path;
                      }))) {
                        const exprArray = classList.map((cls, index) => {
                          const expr = dynamicMatch.find(_ref5 => {
                            let {
                              path
                            } = _ref5;
                            return origClassPaths[cls] === path;
                          })?.expression;
                          const suffix = index === classList.length - 1 ? '' : ' ';
                          if (expr != null) {
                            return t__namespace.conditionalExpression(t__namespace.binaryExpression('==', expr, t__namespace.nullLiteral()), t__namespace.stringLiteral(''), t__namespace.stringLiteral(cls + suffix));
                          }
                          return t__namespace.stringLiteral(cls + suffix);
                        });
                        const [first, ...rest] = exprArray;
                        objProp.value = rest.reduce((acc, curr) => {
                          return t__namespace.binaryExpression('+', acc, curr);
                        }, first);
                      }
                    }
                  }
                }
                return objProp;
              });
              prop.value = t__namespace.arrowFunctionExpression(params, t__namespace.arrayExpression([value, t__namespace.objectExpression(Object.entries(inlineStyles).map(_ref6 => {
                let [key, value] = _ref6;
                return t__namespace.objectProperty(t__namespace.stringLiteral(key), value.expression);
              }))]));
            }
          }
        }
        return prop;
      });
    }
    const listOfStyles = Object.entries(injectedStyles).map(_ref7 => {
      let [key, {
        priority,
        ...rest
      }] = _ref7;
      return [key, rest, priority];
    });
    state.registerStyles(listOfStyles, path);
    path.replaceWith(resultAst);
    if (Object.keys(injectedStyles).length === 0) {
      return;
    }
  }
  state.inStyleXCreate = false;
}
function validateStyleXCreate(path) {
  if (path.parentPath == null || path.parentPath.isExpressionStatement()) {
    throw path.buildCodeFrameError(shared.messages.UNBOUND_STYLEX_CALL_VALUE, SyntaxError);
  }
  const nearestStatement = findNearestStatementAncestor(path);
  if (!nearestStatement.parentPath.isProgram() && !nearestStatement.parentPath.isExportNamedDeclaration()) {
    throw path.buildCodeFrameError(shared.messages.ONLY_TOP_LEVEL, SyntaxError);
  }
  if (path.node.arguments.length !== 1) {
    throw path.buildCodeFrameError(shared.messages.ILLEGAL_ARGUMENT_LENGTH, SyntaxError);
  }
  if (path.node.arguments[0].type !== 'ObjectExpression') {
    throw path.buildCodeFrameError(shared.messages.NON_OBJECT_FOR_STYLEX_CALL, SyntaxError);
  }
}
function findNearestStatementAncestor(path) {
  if (path.isStatement()) {
    return path;
  }
  if (path.parentPath == null) {
    throw new Error('Unexpected Path found that is not part of the AST.');
  }
  return findNearestStatementAncestor(path.parentPath);
}
function legacyExpandShorthands(dynamicStyles) {
  const expandedKeysToKeyPaths = dynamicStyles.flatMap((_ref8, i) => {
    let {
      key
    } = _ref8;
    return flatMapExpandedShorthands([key, 'p' + i], {
      styleResolution: 'legacy-expand-shorthands'
    });
  }).map(_ref9 => {
    let [key, value] = _ref9;
    if (typeof value !== 'string') {
      return null;
    }
    const index = parseInt(value.slice(1), 10);
    const thatDynStyle = dynamicStyles[index];
    return {
      ...thatDynStyle,
      key,
      path: thatDynStyle.path === thatDynStyle.key ? key : thatDynStyle.path.includes(thatDynStyle.key + '_') ? thatDynStyle.path.replace(thatDynStyle.key + '_', key + '_') : thatDynStyle.path.replace('_' + thatDynStyle.key, '_' + key)
    };
  }).filter(Boolean);
  return expandedKeysToKeyPaths;
}

function transformStyleXDefineVars(callExpressionPath, state) {
  const callExpressionNode = callExpressionPath.node;
  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }
  if (callExpressionNode.callee.type === 'Identifier' && state.stylexDefineVarsImport.has(callExpressionNode.callee.name) || callExpressionNode.callee.type === 'MemberExpression' && callExpressionNode.callee.property.name === 'defineVars' && callExpressionNode.callee.object.type === 'Identifier' && callExpressionNode.callee.property.type === 'Identifier' && state.stylexImport.has(callExpressionNode.callee.object.name)) {
    validateStyleXDefineVars(callExpressionPath);
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }
    const variableDeclaratorNode = variableDeclaratorPath.node;
    if (variableDeclaratorNode.id.type !== 'Identifier') {
      return;
    }
    const varId = variableDeclaratorNode.id;
    const args = callExpressionPath.get('arguments');
    const firstArg = args[0];
    const injectedKeyframes = {};
    function keyframes(animation) {
      const [animationName, injectedStyle] = shared.keyframes(animation, state.options);
      injectedKeyframes[animationName] = injectedStyle;
      return animationName;
    }
    const identifiers = {};
    const memberExpressions = {};
    state.stylexKeyframesImport.forEach(name => {
      identifiers[name] = {
        fn: keyframes
      };
    });
    state.stylexTypesImport.forEach(name => {
      identifiers[name] = shared.types;
    });
    state.stylexImport.forEach(name => {
      if (memberExpressions[name] === undefined) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].keyframes = {
        fn: keyframes
      };
      identifiers[name] = {
        ...(identifiers[name] ?? {}),
        types: shared.types
      };
    });
    const {
      confident,
      value
    } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions
    });
    if (!confident) {
      throw callExpressionPath.buildCodeFrameError(shared.messages.NON_STATIC_VALUE, SyntaxError);
    }
    if (typeof value !== 'object' || value == null) {
      throw callExpressionPath.buildCodeFrameError(shared.messages.NON_OBJECT_FOR_STYLEX_CALL, SyntaxError);
    }
    const fileName = state.fileNameForHashing;
    if (fileName == null) {
      throw new Error('No filename found for generating theme name.');
    }
    const exportName = varId.name;
    const [variablesObj, injectedStylesSansKeyframes] = shared.defineVars(value, {
      ...state.options,
      themeName: shared.utils.genFileBasedIdentifier({
        fileName,
        exportName
      })
    });
    const injectedStyles = {
      ...injectedKeyframes,
      ...injectedStylesSansKeyframes
    };
    callExpressionPath.replaceWith(convertObjectToAST(variablesObj));
    const listOfStyles = Object.entries(injectedStyles).map(_ref => {
      let [key, {
        priority,
        ...rest
      }] = _ref;
      return [key, rest, priority];
    });
    state.registerStyles(listOfStyles, variableDeclaratorPath);
  }
}
function validateStyleXDefineVars(callExpressionPath) {
  const variableDeclaratorPath = callExpressionPath.parentPath;
  const exportNamedDeclarationPath = variableDeclaratorPath.parentPath?.parentPath;
  if (variableDeclaratorPath == null || variableDeclaratorPath.isExpressionStatement() || !variableDeclaratorPath.isVariableDeclarator() || variableDeclaratorPath.node.id.type !== 'Identifier') {
    throw callExpressionPath.buildCodeFrameError(shared.messages.UNBOUND_STYLEX_CALL_VALUE, SyntaxError);
  }
  if (exportNamedDeclarationPath == null || !exportNamedDeclarationPath.isExportNamedDeclaration()) {
    throw callExpressionPath.buildCodeFrameError(shared.messages.NON_EXPORT_NAMED_DECLARATION, SyntaxError);
  }
  if (callExpressionPath.node.arguments.length !== 1) {
    throw callExpressionPath.buildCodeFrameError(shared.messages.ILLEGAL_ARGUMENT_LENGTH, SyntaxError);
  }
}

function transformStyleXCreateTheme(callExpressionPath, state) {
  const callExpressionNode = callExpressionPath.node;
  if (callExpressionNode.type !== 'CallExpression') {
    return;
  }
  if (callExpressionNode.callee.type === 'Identifier' && state.stylexCreateThemeImport.has(callExpressionNode.callee.name) || callExpressionNode.callee.type === 'MemberExpression' && callExpressionNode.callee.object.type === 'Identifier' && callExpressionNode.callee.property.type === 'Identifier' && callExpressionNode.callee.property.name === 'createTheme' && state.stylexImport.has(callExpressionNode.callee.object.name)) {
    validateStyleXCreateTheme(callExpressionPath);
    const variableDeclaratorPath = callExpressionPath.parentPath;
    if (!variableDeclaratorPath.isVariableDeclarator()) {
      return;
    }
    const id = variableDeclaratorPath.get('id');
    if (!id.isIdentifier()) {
      return;
    }
    const variableName = id.node.name;
    const args = callExpressionPath.get('arguments');
    const firstArg = args[0];
    const secondArg = args[1];
    const {
      confident: confident1,
      value: variables
    } = evaluate(firstArg, state);
    if (!confident1) {
      throw callExpressionPath.buildCodeFrameError(shared.messages.NON_STATIC_VALUE, SyntaxError);
    }
    const injectedKeyframes = {};
    function keyframes(animation) {
      const [animationName, injectedStyle] = shared.keyframes(animation, state.options);
      injectedKeyframes[animationName] = injectedStyle;
      return animationName;
    }
    const identifiers = {};
    const memberExpressions = {};
    state.stylexKeyframesImport.forEach(name => {
      identifiers[name] = {
        fn: keyframes
      };
    });
    state.stylexTypesImport.forEach(name => {
      identifiers[name] = shared.types;
    });
    state.stylexImport.forEach(name => {
      if (memberExpressions[name] === undefined) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].keyframes = {
        fn: keyframes
      };
      identifiers[name] = {
        ...(identifiers[name] ?? {}),
        types: shared.types
      };
    });
    const {
      confident: confident2,
      value: overrides
    } = evaluate(secondArg, state, {
      identifiers,
      memberExpressions
    });
    if (!confident2) {
      throw callExpressionPath.buildCodeFrameError(shared.messages.NON_STATIC_VALUE, SyntaxError);
    }
    if (typeof overrides !== 'object' || overrides == null) {
      throw callExpressionPath.buildCodeFrameError(shared.messages.NON_OBJECT_FOR_STYLEX_CALL, SyntaxError);
    }
    if (typeof variables.__themeName__ !== 'string' || variables.__themeName__ === '') {
      throw callExpressionPath.buildCodeFrameError('Can only override variables theme created with stylex.defineVars().', SyntaxError);
    }
    let [overridesObj, injectedStyles] = shared.createTheme(variables, overrides, state.options);
    if (state.isTest) {
      const fileName = state.filename ?? 'UnknownFile';
      const basename = path.basename(fileName).split('.')[0];
      const devClassName = `${basename}__${variableName}`;
      overridesObj = {
        [devClassName]: devClassName,
        $$css: true
      };
    } else if (state.isDev) {
      const fileName = state.filename ?? 'UnknownFile';
      const basename = path.basename(fileName).split('.')[0];
      const devClassName = `${basename}__${variableName}`;
      overridesObj = {
        [devClassName]: devClassName,
        ...overridesObj
      };
    }
    callExpressionPath.replaceWith(convertObjectToAST(overridesObj));
    const listOfStyles = Object.entries({
      ...injectedKeyframes,
      ...injectedStyles
    }).map(_ref => {
      let [key, {
        priority,
        ...rest
      }] = _ref;
      return [key, rest, priority];
    });
    state.registerStyles(listOfStyles, variableDeclaratorPath);
  }
}
function validateStyleXCreateTheme(callExpressionPath) {
  const variableDeclaratorPath = callExpressionPath.parentPath;
  if (variableDeclaratorPath == null || variableDeclaratorPath.isExpressionStatement() || !variableDeclaratorPath.isVariableDeclarator() || variableDeclaratorPath.node.id.type !== 'Identifier') {
    throw callExpressionPath.buildCodeFrameError(shared.messages.UNBOUND_STYLEX_CALL_VALUE, SyntaxError);
  }
  if (callExpressionPath.node.arguments.length !== 2) {
    throw callExpressionPath.buildCodeFrameError(shared.messages.ILLEGAL_ARGUMENT_LENGTH, SyntaxError);
  }
}

function transformStyleXKeyframes(path, state) {
  const {
    node
  } = path;
  if (node.init?.type !== 'CallExpression') {
    return;
  }
  if (node.id.type !== 'Identifier') {
    return;
  }
  const nodeInit = node.init;
  if (nodeInit.callee.type === 'Identifier' && state.stylexKeyframesImport.has(nodeInit.callee.name) || nodeInit.callee.type === 'MemberExpression' && nodeInit.callee.object.type === 'Identifier' && nodeInit.callee.property.name === 'keyframes' && nodeInit.callee.property.type === 'Identifier' && state.stylexImport.has(nodeInit.callee.object.name)) {
    if (nodeInit.arguments.length !== 1) {
      throw path.buildCodeFrameError(shared.messages.ILLEGAL_ARGUMENT_LENGTH, SyntaxError);
    }
    if (nodeInit.arguments[0].type !== 'ObjectExpression') {
      throw path.buildCodeFrameError(shared.messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL, SyntaxError);
    }
    const init = path.get('init');
    if (init == null || !init.isCallExpression()) {
      throw path.buildCodeFrameError(shared.messages.NON_STATIC_KEYFRAME_VALUE, SyntaxError);
    }
    const args = init.get('arguments');
    const firstArg = args[0];
    const identifiers = {};
    const memberExpressions = {};
    state.stylexFirstThatWorksImport.forEach(name => {
      identifiers[name] = {
        fn: shared.firstThatWorks
      };
    });
    state.stylexImport.forEach(name => {
      if (memberExpressions[name] == null) {
        memberExpressions[name] = {};
      }
      memberExpressions[name].firstThatWorks = {
        fn: shared.firstThatWorks
      };
    });
    const {
      confident,
      value
    } = evaluate(firstArg, state, {
      identifiers,
      memberExpressions
    });
    if (!confident) {
      throw path.buildCodeFrameError(shared.messages.NON_STATIC_VALUE, SyntaxError);
    }
    const plainObject = value;
    assertValidKeyframes(path, plainObject);
    const [animationName, {
      ltr,
      priority,
      rtl
    }] = shared.keyframes(plainObject, state.options);
    init.replaceWith(t__namespace.stringLiteral(animationName));
    state.registerStyles([[animationName, {
      ltr,
      rtl
    }, priority]], path);
  }
}
function assertValidKeyframes(path, obj) {
  if (typeof obj !== 'object' || Array.isArray(obj) || obj == null) {
    throw path.buildCodeFrameError(shared.messages.NON_OBJECT_FOR_STYLEX_KEYFRAMES_CALL, SyntaxError);
  }
  for (const [_key, value] of Object.entries(obj)) {
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw path.buildCodeFrameError(shared.messages.NON_OBJECT_KEYFRAME, SyntaxError);
    }
  }
}

function skipStylexMergeChildren(path, state) {
  const {
    node
  } = path;
  if (node == null || node.callee.type !== 'Identifier' || !state.stylexImport.has(node.callee.name)) {
    return;
  }
  path.skip();
}
function transformStyleXMerge(path, state) {
  const {
    node
  } = path;
  if (node == null || node.callee.type !== 'Identifier' || !state.stylexImport.has(node.callee.name)) {
    return;
  }
  let bailOut = false;
  let conditional = 0;
  let currentIndex = -1;
  let bailOutIndex = null;
  const resolvedArgs = [];
  for (const arg of node.arguments) {
    currentIndex++;
    switch (arg.type) {
      case 'MemberExpression':
        {
          const resolved = parseNullableStyle$2(arg, state);
          if (resolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push(resolved);
          }
          break;
        }
      case 'ConditionalExpression':
        {
          const {
            test,
            consequent,
            alternate
          } = arg;
          const primary = parseNullableStyle$2(consequent, state);
          const fallback = parseNullableStyle$2(alternate, state);
          if (primary === 'other' || fallback === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([test, primary, fallback]);
            conditional++;
          }
          break;
        }
      case 'LogicalExpression':
        {
          if (arg.operator !== '&&') {
            bailOutIndex = currentIndex;
            bailOut = true;
            break;
          }
          const {
            left,
            right
          } = arg;
          const leftResolved = parseNullableStyle$2(left, state);
          const rightResolved = parseNullableStyle$2(right, state);
          if (leftResolved !== 'other' || rightResolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([left, rightResolved, null]);
            conditional++;
          }
          break;
        }
      default:
        bailOutIndex = currentIndex;
        bailOut = true;
        break;
    }
    if (conditional > 4) {
      bailOut = true;
    }
    if (bailOut) {
      break;
    }
  }
  if (!state.options.genConditionalClasses && conditional) {
    bailOut = true;
  }
  if (bailOut) {
    const argumentPaths = path.get('arguments');
    let nonNullProps = [];
    let index = -1;
    for (const argPath of argumentPaths) {
      index++;
      function MemberExpression(path) {
        const object = path.get('object').node;
        const property = path.get('property').node;
        const computed = path.node.computed;
        let objName = null;
        let propName = null;
        if (object.type === 'Identifier' && state.styleMap.has(object.name)) {
          objName = object.name;
          if (property.type === 'Identifier' && !computed) {
            propName = property.name;
          }
          if ((property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
            propName = property.value;
          }
        }
        let styleNonNullProps = [];
        if (bailOutIndex != null && index > bailOutIndex) {
          nonNullProps = true;
          styleNonNullProps = true;
        }
        if (nonNullProps === true) {
          styleNonNullProps = true;
        } else {
          const {
            confident,
            value: styleValue
          } = evaluate(path, state);
          if (!confident || styleValue == null) {
            nonNullProps = true;
            styleNonNullProps = true;
          } else {
            styleNonNullProps = nonNullProps === true ? true : [...nonNullProps];
            if (nonNullProps !== true) {
              nonNullProps = [...nonNullProps, ...Object.keys(styleValue).filter(key => styleValue[key] !== null)];
            }
          }
        }
        if (objName != null) {
          state.styleVarsToKeep.add([objName, propName != null ? String(propName) : true, styleNonNullProps]);
        }
      }
      if (argPath.isMemberExpression()) {
        MemberExpression(argPath);
      } else {
        argPath.traverse({
          MemberExpression
        });
      }
    }
  } else {
    path.skip();
    const stringExpression = makeStringExpression$2(resolvedArgs);
    path.replaceWith(stringExpression);
  }
}
function parseNullableStyle$2(node, state) {
  if (t__namespace.isNullLiteral(node) || t__namespace.isIdentifier(node) && node.name === 'undefined') {
    return null;
  }
  if (t__namespace.isMemberExpression(node)) {
    const {
      object,
      property,
      computed: computed
    } = node;
    let objName = null;
    let propName = null;
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && property.type === 'Identifier' && !computed) {
      objName = object.name;
      propName = property.name;
    }
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && (property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
      objName = object.name;
      propName = property.value;
    }
    if (objName != null && propName != null) {
      const style = state.styleMap.get(objName);
      if (style != null && style[String(propName)] != null) {
        return style[String(propName)];
      }
    }
  }
  return 'other';
}
function makeStringExpression$2(values) {
  const conditions = values.filter(v => Array.isArray(v)).map(v => v[0]);
  if (conditions.length === 0) {
    return t__namespace.stringLiteral(stylex.legacyMerge(...values));
  }
  const conditionPermutations = genConditionPermutations$2(conditions.length);
  const objEntries = conditionPermutations.map(permutation => {
    let i = 0;
    const args = values.map(v => {
      if (Array.isArray(v)) {
        const [_test, primary, fallback] = v;
        return permutation[i++] ? primary : fallback;
      } else {
        return v;
      }
    });
    const key = permutation.reduce((soFar, bool) => soFar << 1 | (bool ? 1 : 0), 0);
    return t__namespace.objectProperty(t__namespace.numericLiteral(key), t__namespace.stringLiteral(stylex.legacyMerge(...args)));
  });
  const objExpressions = t__namespace.objectExpression(objEntries);
  const conditionsToKey = genBitwiseOrOfConditions$2(conditions);
  return t__namespace.memberExpression(objExpressions, conditionsToKey, true);
}
function genConditionPermutations$2(count) {
  const result = [];
  for (let i = 0; i < 2 ** count; i++) {
    const combination = [];
    for (let j = 0; j < count; j++) {
      combination.push(Boolean(i & 1 << j));
    }
    result.push(combination);
  }
  return result;
}
function genBitwiseOrOfConditions$2(conditions) {
  const binaryExpressions = conditions.map((condition, i) => {
    const shift = conditions.length - i - 1;
    return t__namespace.binaryExpression('<<', t__namespace.unaryExpression('!', t__namespace.unaryExpression('!', condition)), t__namespace.numericLiteral(shift));
  });
  return binaryExpressions.reduce((acc, expr) => {
    return t__namespace.binaryExpression('|', acc, expr);
  });
}

function skipStylexPropsChildren(path, state) {
  if (!isCalleeIdentifier$1(path, state) && !isCalleeMemberExpression$1(path, state)) {
    return;
  }
  path.skip();
}
function transformStylexProps(path, state) {
  const {
    node
  } = path;
  if (!isCalleeIdentifier$1(path, state) && !isCalleeMemberExpression$1(path, state)) {
    return;
  }
  let bailOut = false;
  let conditional = 0;
  const args = node.arguments.flatMap(arg => arg.type === 'ArrayExpression' ? arg.elements : [arg]);
  let currentIndex = -1;
  let bailOutIndex = null;
  const resolvedArgs = [];
  for (const arg of args) {
    currentIndex++;
    switch (arg.type) {
      case 'MemberExpression':
        {
          const resolved = parseNullableStyle$1(arg, state);
          if (resolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push(resolved);
          }
          break;
        }
      case 'ConditionalExpression':
        {
          const {
            test,
            consequent,
            alternate
          } = arg;
          const primary = parseNullableStyle$1(consequent, state);
          const fallback = parseNullableStyle$1(alternate, state);
          if (primary === 'other' || fallback === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([test, primary, fallback]);
            conditional++;
          }
          break;
        }
      case 'LogicalExpression':
        {
          if (arg.operator !== '&&') {
            bailOutIndex = currentIndex;
            bailOut = true;
            break;
          }
          const {
            left,
            right
          } = arg;
          const leftResolved = parseNullableStyle$1(left, state);
          const rightResolved = parseNullableStyle$1(right, state);
          if (leftResolved !== 'other' || rightResolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([left, rightResolved, null]);
            conditional++;
          }
          break;
        }
      default:
        bailOutIndex = currentIndex;
        bailOut = true;
        break;
    }
    if (conditional > 4) {
      bailOut = true;
    }
    if (bailOut) {
      break;
    }
  }
  if (!state.options.genConditionalClasses && conditional) {
    bailOut = true;
  }
  if (bailOut) {
    const argumentPaths = path.get('arguments');
    let nonNullProps = [];
    let index = -1;
    for (const argPath of argumentPaths) {
      index++;
      function MemberExpression(path) {
        const object = path.get('object').node;
        const property = path.get('property').node;
        const computed = path.node.computed;
        let objName = null;
        let propName = null;
        if (object.type === 'Identifier' && state.styleMap.has(object.name)) {
          objName = object.name;
          if (property.type === 'Identifier' && !computed) {
            propName = property.name;
          }
          if ((property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
            propName = property.value;
          }
        }
        let styleNonNullProps = [];
        if (bailOutIndex != null && index > bailOutIndex) {
          nonNullProps = true;
          styleNonNullProps = true;
        }
        if (nonNullProps === true) {
          styleNonNullProps = true;
        } else {
          const {
            confident,
            value: styleValue
          } = evaluate(path, state);
          if (!confident || styleValue == null) {
            nonNullProps = true;
            styleNonNullProps = true;
          } else {
            styleNonNullProps = nonNullProps === true ? true : [...nonNullProps];
            if (nonNullProps !== true) {
              nonNullProps = [...nonNullProps, ...Object.keys(styleValue).filter(key => styleValue[key] !== null)];
            }
          }
        }
        if (objName != null) {
          state.styleVarsToKeep.add([objName, propName != null ? String(propName) : true, styleNonNullProps]);
        }
      }
      if (argPath.isMemberExpression()) {
        MemberExpression(argPath);
      } else {
        argPath.traverse({
          MemberExpression
        });
      }
    }
  } else {
    path.skip();
    const stringExpression = makeStringExpression$1(resolvedArgs);
    path.replaceWith(stringExpression);
  }
}
function parseNullableStyle$1(node, state) {
  if (t__namespace.isNullLiteral(node) || t__namespace.isIdentifier(node) && node.name === 'undefined') {
    return null;
  }
  if (t__namespace.isMemberExpression(node)) {
    const {
      object,
      property,
      computed: computed
    } = node;
    let objName = null;
    let propName = null;
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && property.type === 'Identifier' && !computed) {
      objName = object.name;
      propName = property.name;
    }
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && (property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
      objName = object.name;
      propName = property.value;
    }
    if (objName != null && propName != null) {
      const style = state.styleMap.get(objName);
      if (style != null && style[String(propName)] != null) {
        return style[String(propName)];
      }
    }
  }
  return 'other';
}
function makeStringExpression$1(values) {
  const conditions = values.filter(v => Array.isArray(v)).map(v => v[0]);
  if (conditions.length === 0) {
    const result = stylex.props(values);
    return convertObjectToAST(result);
  }
  const conditionPermutations = genConditionPermutations$1(conditions.length);
  const objEntries = conditionPermutations.map(permutation => {
    let i = 0;
    const args = values.map(v => {
      if (Array.isArray(v)) {
        const [_test, primary, fallback] = v;
        return permutation[i++] ? primary : fallback;
      } else {
        return v;
      }
    });
    const key = permutation.reduce((soFar, bool) => soFar << 1 | (bool ? 1 : 0), 0);
    return t__namespace.objectProperty(t__namespace.numericLiteral(key), convertObjectToAST(stylex.props(args)));
  });
  const objExpressions = t__namespace.objectExpression(objEntries);
  const conditionsToKey = genBitwiseOrOfConditions$1(conditions);
  return t__namespace.memberExpression(objExpressions, conditionsToKey, true);
}
function genConditionPermutations$1(count) {
  const result = [];
  for (let i = 0; i < 2 ** count; i++) {
    const combination = [];
    for (let j = 0; j < count; j++) {
      combination.push(Boolean(i & 1 << j));
    }
    result.push(combination);
  }
  return result;
}
function genBitwiseOrOfConditions$1(conditions) {
  const binaryExpressions = conditions.map((condition, i) => {
    const shift = conditions.length - i - 1;
    return t__namespace.binaryExpression('<<', t__namespace.unaryExpression('!', t__namespace.unaryExpression('!', condition)), t__namespace.numericLiteral(shift));
  });
  return binaryExpressions.reduce((acc, expr) => {
    return t__namespace.binaryExpression('|', acc, expr);
  });
}
function isCalleeIdentifier$1(path, state) {
  const {
    node
  } = path;
  return node != null && node.callee != null && node.callee.type === 'Identifier' && state.stylexPropsImport.has(node.callee.name);
}
function isCalleeMemberExpression$1(path, state) {
  const {
    node
  } = path;
  return node != null && node.callee != null && node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'props' && state.stylexImport.has(node.callee.object.name);
}

function skipStylexAttrsChildren(path, state) {
  if (!isCalleeIdentifier(path, state) && !isCalleeMemberExpression(path, state)) {
    return;
  }
  path.skip();
}
function transformStylexAttrs(path, state) {
  const {
    node
  } = path;
  if (!isCalleeIdentifier(path, state) && !isCalleeMemberExpression(path, state)) {
    return;
  }
  let bailOut = false;
  let conditional = 0;
  const args = node.arguments.flatMap(arg => arg.type === 'ArrayExpression' ? arg.elements : [arg]);
  let currentIndex = -1;
  let bailOutIndex = null;
  const resolvedArgs = [];
  for (const arg of args) {
    currentIndex++;
    switch (arg.type) {
      case 'MemberExpression':
        {
          const resolved = parseNullableStyle(arg, state);
          if (resolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push(resolved);
          }
          break;
        }
      case 'ConditionalExpression':
        {
          const {
            test,
            consequent,
            alternate
          } = arg;
          const primary = parseNullableStyle(consequent, state);
          const fallback = parseNullableStyle(alternate, state);
          if (primary === 'other' || fallback === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([test, primary, fallback]);
            conditional++;
          }
          break;
        }
      case 'LogicalExpression':
        {
          if (arg.operator !== '&&') {
            bailOutIndex = currentIndex;
            bailOut = true;
            break;
          }
          const {
            left,
            right
          } = arg;
          const leftResolved = parseNullableStyle(left, state);
          const rightResolved = parseNullableStyle(right, state);
          if (leftResolved !== 'other' || rightResolved === 'other') {
            bailOutIndex = currentIndex;
            bailOut = true;
          } else {
            resolvedArgs.push([left, rightResolved, null]);
            conditional++;
          }
          break;
        }
      default:
        bailOutIndex = currentIndex;
        bailOut = true;
        break;
    }
    if (conditional > 4) {
      bailOut = true;
    }
    if (bailOut) {
      break;
    }
  }
  if (!state.options.genConditionalClasses && conditional) {
    bailOut = true;
  }
  if (bailOut) {
    const argumentPaths = path.get('arguments');
    let nonNullProps = [];
    let index = -1;
    for (const argPath of argumentPaths) {
      index++;
      function MemberExpression(path) {
        const object = path.get('object').node;
        const property = path.get('property').node;
        const computed = path.node.computed;
        let objName = null;
        let propName = null;
        if (object.type === 'Identifier' && state.styleMap.has(object.name)) {
          objName = object.name;
          if (property.type === 'Identifier' && !computed) {
            propName = property.name;
          }
          if ((property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
            propName = property.value;
          }
        }
        let styleNonNullProps = [];
        if (bailOutIndex != null && index > bailOutIndex) {
          nonNullProps = true;
          styleNonNullProps = true;
        }
        if (nonNullProps === true) {
          styleNonNullProps = true;
        } else {
          const {
            confident,
            value: styleValue
          } = evaluate(path, state);
          if (!confident || styleValue == null) {
            nonNullProps = true;
            styleNonNullProps = true;
          } else {
            styleNonNullProps = nonNullProps === true ? true : [...nonNullProps];
            if (nonNullProps !== true) {
              nonNullProps = [...nonNullProps, ...Object.keys(styleValue).filter(key => styleValue[key] !== null)];
            }
          }
        }
        if (objName != null) {
          state.styleVarsToKeep.add([objName, propName != null ? String(propName) : true, styleNonNullProps]);
        }
      }
      if (argPath.isMemberExpression()) {
        MemberExpression(argPath);
      } else {
        argPath.traverse({
          MemberExpression
        });
      }
    }
  } else {
    path.skip();
    const stringExpression = makeStringExpression(resolvedArgs);
    path.replaceWith(stringExpression);
  }
}
function parseNullableStyle(node, state) {
  if (t__namespace.isNullLiteral(node) || t__namespace.isIdentifier(node) && node.name === 'undefined') {
    return null;
  }
  if (t__namespace.isMemberExpression(node)) {
    const {
      object,
      property,
      computed: computed
    } = node;
    let objName = null;
    let propName = null;
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && property.type === 'Identifier' && !computed) {
      objName = object.name;
      propName = property.name;
    }
    if (object.type === 'Identifier' && state.styleMap.has(object.name) && (property.type === 'StringLiteral' || property.type === 'NumericLiteral') && computed) {
      objName = object.name;
      propName = property.value;
    }
    if (objName != null && propName != null) {
      const style = state.styleMap.get(objName);
      if (style != null && style[String(propName)] != null) {
        return style[String(propName)];
      }
    }
  }
  return 'other';
}
function makeStringExpression(values) {
  const conditions = values.filter(v => Array.isArray(v)).map(v => v[0]);
  if (conditions.length === 0) {
    const result = stylex.attrs(values);
    return convertObjectToAST(result);
  }
  const conditionPermutations = genConditionPermutations(conditions.length);
  const objEntries = conditionPermutations.map(permutation => {
    let i = 0;
    const args = values.map(v => {
      if (Array.isArray(v)) {
        const [_test, primary, fallback] = v;
        return permutation[i++] ? primary : fallback;
      } else {
        return v;
      }
    });
    const key = permutation.reduce((soFar, bool) => soFar << 1 | (bool ? 1 : 0), 0);
    return t__namespace.objectProperty(t__namespace.numericLiteral(key), convertObjectToAST(stylex.attrs(args)));
  });
  const objExpressions = t__namespace.objectExpression(objEntries);
  const conditionsToKey = genBitwiseOrOfConditions(conditions);
  return t__namespace.memberExpression(objExpressions, conditionsToKey, true);
}
function genConditionPermutations(count) {
  const result = [];
  for (let i = 0; i < 2 ** count; i++) {
    const combination = [];
    for (let j = 0; j < count; j++) {
      combination.push(Boolean(i & 1 << j));
    }
    result.push(combination);
  }
  return result;
}
function genBitwiseOrOfConditions(conditions) {
  const binaryExpressions = conditions.map((condition, i) => {
    const shift = conditions.length - i - 1;
    return t__namespace.binaryExpression('<<', t__namespace.unaryExpression('!', t__namespace.unaryExpression('!', condition)), t__namespace.numericLiteral(shift));
  });
  return binaryExpressions.reduce((acc, expr) => {
    return t__namespace.binaryExpression('|', acc, expr);
  });
}
function isCalleeIdentifier(path, state) {
  const {
    node
  } = path;
  return node != null && node.callee != null && node.callee.type === 'Identifier' && state.stylexAttrsImport.has(node.callee.name);
}
function isCalleeMemberExpression(path, state) {
  const {
    node
  } = path;
  return node != null && node.callee != null && node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.property.type === 'Identifier' && node.callee.property.name === 'attrs' && state.stylexImport.has(node.callee.object.name);
}

const NAME = 'stylex';
function styleXTransform() {
  let state;
  return {
    name: NAME,
    visitor: {
      Program: {
        enter: (path, s) => {
          state = new StateManager(s);
          for (const block of path.get('body')) {
            if (block.isImportDeclaration()) {
              readImportDeclarations(block, state);
            }
            if (block.isVariableDeclaration()) {
              for (const decl of block.get('declarations')) {
                readRequires(decl, state);
              }
            }
          }
        },
        exit: path => {
          path.traverse({
            ImportDeclaration(path) {
              const filename = state.filename;
              if (filename == null || !state.options.rewriteAliases) {
                return;
              }
              const source = path.node.source.value;
              const aliases = state.options.aliases;
              const themeFileExtension = '.stylex';
              if (!matchesFileSuffix(themeFileExtension)(source)) {
                return;
              }
              const resolvedFilePath = filePathResolver(source, filename, aliases);
              if (resolvedFilePath == null) {
                return;
              }
              let relativeFilePath = getRelativePath(filename, resolvedFilePath);
              const extension = EXTENSIONS.find(ext => relativeFilePath.endsWith(ext));
              if (extension != null) {
                relativeFilePath = relativeFilePath.slice(0, -extension.length);
              }
              path.node.source.value = relativeFilePath;
            },
            Identifier(path) {
              if (path.isReferencedIdentifier()) {
                const {
                  name
                } = path.node;
                if (state.styleMap.has(name)) {
                  const parentPath = path.parentPath;
                  if (parentPath.isMemberExpression()) {
                    const {
                      property,
                      computed
                    } = parentPath.node;
                    if (property.type === 'Identifier' && !computed) {
                      state.markComposedNamespace([name, property.name, true]);
                    } else if (property.type === 'StringLiteral' && computed) {
                      state.markComposedNamespace([name, property.value, true]);
                    } else if (property.type === 'NumericLiteral' && computed) {
                      state.markComposedNamespace([name, String(property.value), true]);
                    } else {
                      state.markComposedNamespace([name, true, true]);
                    }
                  } else {
                    state.markComposedNamespace([name, true, true]);
                  }
                }
              }
            },
            CallExpression(path) {
              skipStylexMergeChildren(path, state);
              skipStylexPropsChildren(path, state);
              skipStylexAttrsChildren(path, state);
            }
          });
          path.traverse({
            CallExpression(path) {
              transformStyleXMerge(path, state);
              transformStylexProps(path, state);
              transformStylexAttrs(path, state);
            }
          });
          const varsToKeep = {};
          for (const [varName, namespaceName] of state.styleVarsToKeep) {
            if (varsToKeep[varName] === true) {
              continue;
            }
            if (varsToKeep[varName] == null) {
              varsToKeep[varName] = namespaceName === true ? true : [namespaceName];
            } else if (Array.isArray(varsToKeep[varName])) {
              if (namespaceName === true) {
                varsToKeep[varName] = true;
              } else {
                varsToKeep[varName].push(namespaceName);
              }
            }
          }
          const varsToKeepOld = new Set([...state.styleVarsToKeep.values()].map(_ref => {
            let [varName, _namespaceName] = _ref;
            return varName;
          }));
          state.styleVars.forEach((path, varName) => {
            if (isExported(path)) {
              return;
            }
            if (varsToKeep[varName] === true) {
              return;
            }
            const namespacesToKeep = varsToKeep[varName];
            if (namespacesToKeep == null) {
              path.remove();
              return;
            }
            if (path.isVariableDeclarator()) {
              const init = path.get('init');
              if (init != null && init.isObjectExpression()) {
                for (const prop of init.get('properties')) {
                  if (prop.isObjectProperty()) {
                    const key = prop.get('key').node;
                    const keyAsString = key.type === 'Identifier' ? key.name : key.type === 'StringLiteral' ? key.value : key.type === 'NumericLiteral' ? String(key.value) : null;
                    if (keyAsString != null) {
                      if (!namespacesToKeep.includes(keyAsString)) {
                        prop.remove();
                      } else {
                        const allNullsToKeep = [...state.styleVarsToKeep.values()].filter(_ref2 => {
                          let [v, namespaceName] = _ref2;
                          return v === varName && namespaceName === keyAsString;
                        }).map(_ref3 => {
                          let [_v, _namespaceName, nullPropsToKeep] = _ref3;
                          return nullPropsToKeep;
                        });
                        if (!allNullsToKeep.includes(true)) {
                          const nullsToKeep = new Set(allNullsToKeep.filter(x => x !== true).flat());
                          const styleObject = prop.get('value');
                          if (styleObject.isObjectExpression()) {
                            for (const styleProp of styleObject.get('properties')) {
                              if (styleProp.isObjectProperty() && styleProp.get('value').isNullLiteral()) {
                                const styleKey = styleProp.get('key').node;
                                const styleKeyAsString = styleKey.type === 'Identifier' ? styleKey.name : styleKey.type === 'StringLiteral' ? styleKey.value : styleKey.type === 'NumericLiteral' ? String(styleKey.value) : null;
                                if (styleKeyAsString != null && !nullsToKeep.has(styleKeyAsString)) {
                                  styleProp.remove();
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            if (!varsToKeepOld.has(varName) && !isExported(path)) {
              path.remove();
            }
          });
        }
      },
      CallExpression(path) {
        if (path.parentPath.isVariableDeclarator()) {
          transformStyleXKeyframes(path.parentPath, state);
        }
        transformStyleXDefineVars(path, state);
        transformStyleXCreateTheme(path, state);
        transformStyleXCreate(path, state);
      }
    }
  };
}
function stylexPluginWithOptions(options) {
  return [styleXTransform, options];
}
styleXTransform.withOptions = stylexPluginWithOptions;
function isExported(path) {
  if (path == null || path.isProgram()) {
    return false;
  }
  if (path.isExportNamedDeclaration() || path.isExportDefaultDeclaration()) {
    return true;
  }
  return isExported(path.parentPath);
}
function processStylexRules(rules) {
  let useLayers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  if (rules.length === 0) {
    return '';
  }
  const sortedRules = rules.sort((_ref4, _ref5) => {
    let [_1, {
      ltr: rule1
    }, firstPriority] = _ref4;
    let [_2, {
      ltr: rule2
    }, secondPriority] = _ref5;
    const priorityComparison = firstPriority - secondPriority;
    if (priorityComparison !== 0) return priorityComparison;
    if (rule1.startsWith('@') && !rule2.startsWith('@')) {
      const query1 = rule1.slice(0, rule1.indexOf('{'));
      const query2 = rule2.slice(0, rule2.indexOf('{'));
      if (query1 !== query2) {
        return query1.localeCompare(query2);
      }
    }
    const property1 = rule1.slice(rule1.lastIndexOf('{'));
    const property2 = rule2.slice(rule2.lastIndexOf('{'));
    return property1.localeCompare(property2);
  });
  let lastKPri = -1;
  const grouped = sortedRules.reduce((acc, rule) => {
    const [_key, _value, priority] = rule;
    const priorityLevel = Math.floor(priority / 1000);
    if (priorityLevel === lastKPri) {
      const last = acc[acc.length - 1];
      last.push(rule);
      return acc;
    }
    lastKPri = priorityLevel;
    acc.push([rule]);
    return acc;
  }, []);
  const header = useLayers ? '\n@layer ' + grouped.map((_, index) => `priority${index + 1}`).join(', ') + ';\n' : '';
  const collectedCSS = grouped.map((group, index) => {
    const collectedCSS = Array.from(new Map(group.map(_ref6 => {
      let [a, b, _c] = _ref6;
      return [a, b];
    })).values()).flatMap(_ref7 => {
      let {
        ltr,
        rtl
      } = _ref7;
      let ltrRule = ltr,
        rtlRule = rtl;
      if (!useLayers) {
        ltrRule = addSpecificityLevel(ltrRule, index);
        rtlRule = rtlRule && addSpecificityLevel(rtlRule, index);
      }
      return rtlRule != null ? [addAncestorSelector(ltrRule, "html:not([dir='rtl'])"), addAncestorSelector(rtlRule, "html[dir='rtl']")] : [ltrRule];
    }).join('\n');
    return useLayers ? `@layer priority${index + 1}{\n${collectedCSS}\n}` : collectedCSS;
  }).join('\n');
  return header + collectedCSS;
}
styleXTransform.processStylexRules = processStylexRules;
function addAncestorSelector(selector, ancestorSelector) {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  if (!selector.startsWith('@')) {
    return `${ancestorSelector} ${selector}`;
  }
  const lastAtRule = selector.lastIndexOf('@');
  const atRuleBracketIndex = selector.indexOf('{', lastAtRule);
  const mediaQueryPart = selector.slice(0, atRuleBracketIndex + 1);
  const rest = selector.slice(atRuleBracketIndex + 1);
  return `${mediaQueryPart}${ancestorSelector} ${rest}`;
}
function addSpecificityLevel(selector, index) {
  if (selector.startsWith('@keyframes')) {
    return selector;
  }
  const pseudo = Array.from({
    length: index
  }).map(() => ':not(#\\#)').join('');
  const lastOpenCurly = selector.includes('::') ? selector.indexOf('::') : selector.lastIndexOf('{');
  const beforeCurly = selector.slice(0, lastOpenCurly);
  const afterCurly = selector.slice(lastOpenCurly);
  return `${beforeCurly}${pseudo}${afterCurly}`;
}

module.exports = styleXTransform;
