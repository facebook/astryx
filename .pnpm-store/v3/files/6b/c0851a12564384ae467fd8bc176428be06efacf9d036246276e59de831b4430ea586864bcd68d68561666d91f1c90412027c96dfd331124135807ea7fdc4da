import 'std-env';
import { writeFile, rm } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { generateHash, calculateSuiteHash, someTasksAreOnly, interpretTaskModes, getTasks } from '@vitest/runner/utils';
import { TraceMap, generatedPositionFor } from '@vitest/utils/source-map';
import { relative, basename, dirname, resolve, join, extname } from 'pathe';
import { x as x$1 } from 'tinyexec';
import { parseAstAsync } from 'vite';
import nodeos__default from 'node:os';
import url from 'node:url';
import a$1 from 'node:path';
import fs from 'node:fs';
import Te from 'node:module';
import require$$0 from 'fs';
import { shuffle } from '@vitest/utils';
import { slash } from 'vite-node/utils';
import crypto from 'node:crypto';

const hash = crypto.hash ?? ((algorithm, data, outputEncoding) => crypto.createHash(algorithm).update(data).digest(outputEncoding));

const isNode = typeof process < "u" && typeof process.stdout < "u" && !process.versions?.deno && !globalThis.window;
const isDeno = typeof process < "u" && typeof process.stdout < "u" && process.versions?.deno !== void 0;
const isWindows = (isNode || isDeno) && process.platform === "win32";

const REGEXP_WRAP_PREFIX = "$$vitest:";
function getOutputFile(config, reporter) {
  if (!config?.outputFile) {
    return;
  }
  if (typeof config.outputFile === "string") {
    return config.outputFile;
  }
  return config.outputFile[reporter];
}
function wrapSerializableConfig(config) {
  let testNamePattern = config.testNamePattern;
  let defines = config.defines;
  if (testNamePattern && typeof testNamePattern !== "string") {
    testNamePattern = `${REGEXP_WRAP_PREFIX}${testNamePattern.toString()}`;
  }
  if (defines) {
    defines = { keys: Object.keys(defines), original: defines };
  }
  return {
    ...config,
    testNamePattern,
    defines
  };
}

// AST walker module for ESTree compatible trees


// An ancestor walk keeps an array of ancestor nodes (including the
// current node) and passes them to the callback as third parameter
// (and also as state parameter when no other state is present).
function ancestor(node, visitors, baseVisitor, state, override) {
  var ancestors = [];
  if (!baseVisitor) { baseVisitor = base
  ; }(function c(node, st, override) {
    var type = override || node.type;
    var isNew = node !== ancestors[ancestors.length - 1];
    if (isNew) { ancestors.push(node); }
    baseVisitor[type](node, st, c);
    if (visitors[type]) { visitors[type](node, st || ancestors, ancestors); }
    if (isNew) { ancestors.pop(); }
  })(node, state, override);
}

function skipThrough(node, st, c) { c(node, st); }
function ignore(_node, _st, _c) {}

// Node walkers.

var base = {};

base.Program = base.BlockStatement = base.StaticBlock = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var stmt = list[i];

    c(stmt, st, "Statement");
  }
};
base.Statement = skipThrough;
base.EmptyStatement = ignore;
base.ExpressionStatement = base.ParenthesizedExpression = base.ChainExpression =
  function (node, st, c) { return c(node.expression, st, "Expression"); };
base.IfStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Statement");
  if (node.alternate) { c(node.alternate, st, "Statement"); }
};
base.LabeledStatement = function (node, st, c) { return c(node.body, st, "Statement"); };
base.BreakStatement = base.ContinueStatement = ignore;
base.WithStatement = function (node, st, c) {
  c(node.object, st, "Expression");
  c(node.body, st, "Statement");
};
base.SwitchStatement = function (node, st, c) {
  c(node.discriminant, st, "Expression");
  for (var i = 0, list = node.cases; i < list.length; i += 1) {
    var cs = list[i];

    c(cs, st);
  }
};
base.SwitchCase = function (node, st, c) {
  if (node.test) { c(node.test, st, "Expression"); }
  for (var i = 0, list = node.consequent; i < list.length; i += 1)
    {
    var cons = list[i];

    c(cons, st, "Statement");
  }
};
base.ReturnStatement = base.YieldExpression = base.AwaitExpression = function (node, st, c) {
  if (node.argument) { c(node.argument, st, "Expression"); }
};
base.ThrowStatement = base.SpreadElement =
  function (node, st, c) { return c(node.argument, st, "Expression"); };
base.TryStatement = function (node, st, c) {
  c(node.block, st, "Statement");
  if (node.handler) { c(node.handler, st); }
  if (node.finalizer) { c(node.finalizer, st, "Statement"); }
};
base.CatchClause = function (node, st, c) {
  if (node.param) { c(node.param, st, "Pattern"); }
  c(node.body, st, "Statement");
};
base.WhileStatement = base.DoWhileStatement = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForStatement = function (node, st, c) {
  if (node.init) { c(node.init, st, "ForInit"); }
  if (node.test) { c(node.test, st, "Expression"); }
  if (node.update) { c(node.update, st, "Expression"); }
  c(node.body, st, "Statement");
};
base.ForInStatement = base.ForOfStatement = function (node, st, c) {
  c(node.left, st, "ForInit");
  c(node.right, st, "Expression");
  c(node.body, st, "Statement");
};
base.ForInit = function (node, st, c) {
  if (node.type === "VariableDeclaration") { c(node, st); }
  else { c(node, st, "Expression"); }
};
base.DebuggerStatement = ignore;

base.FunctionDeclaration = function (node, st, c) { return c(node, st, "Function"); };
base.VariableDeclaration = function (node, st, c) {
  for (var i = 0, list = node.declarations; i < list.length; i += 1)
    {
    var decl = list[i];

    c(decl, st);
  }
};
base.VariableDeclarator = function (node, st, c) {
  c(node.id, st, "Pattern");
  if (node.init) { c(node.init, st, "Expression"); }
};

base.Function = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  for (var i = 0, list = node.params; i < list.length; i += 1)
    {
    var param = list[i];

    c(param, st, "Pattern");
  }
  c(node.body, st, node.expression ? "Expression" : "Statement");
};

base.Pattern = function (node, st, c) {
  if (node.type === "Identifier")
    { c(node, st, "VariablePattern"); }
  else if (node.type === "MemberExpression")
    { c(node, st, "MemberPattern"); }
  else
    { c(node, st); }
};
base.VariablePattern = ignore;
base.MemberPattern = skipThrough;
base.RestElement = function (node, st, c) { return c(node.argument, st, "Pattern"); };
base.ArrayPattern = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Pattern"); }
  }
};
base.ObjectPattern = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1) {
    var prop = list[i];

    if (prop.type === "Property") {
      if (prop.computed) { c(prop.key, st, "Expression"); }
      c(prop.value, st, "Pattern");
    } else if (prop.type === "RestElement") {
      c(prop.argument, st, "Pattern");
    }
  }
};

base.Expression = skipThrough;
base.ThisExpression = base.Super = base.MetaProperty = ignore;
base.ArrayExpression = function (node, st, c) {
  for (var i = 0, list = node.elements; i < list.length; i += 1) {
    var elt = list[i];

    if (elt) { c(elt, st, "Expression"); }
  }
};
base.ObjectExpression = function (node, st, c) {
  for (var i = 0, list = node.properties; i < list.length; i += 1)
    {
    var prop = list[i];

    c(prop, st);
  }
};
base.FunctionExpression = base.ArrowFunctionExpression = base.FunctionDeclaration;
base.SequenceExpression = function (node, st, c) {
  for (var i = 0, list = node.expressions; i < list.length; i += 1)
    {
    var expr = list[i];

    c(expr, st, "Expression");
  }
};
base.TemplateLiteral = function (node, st, c) {
  for (var i = 0, list = node.quasis; i < list.length; i += 1)
    {
    var quasi = list[i];

    c(quasi, st);
  }

  for (var i$1 = 0, list$1 = node.expressions; i$1 < list$1.length; i$1 += 1)
    {
    var expr = list$1[i$1];

    c(expr, st, "Expression");
  }
};
base.TemplateElement = ignore;
base.UnaryExpression = base.UpdateExpression = function (node, st, c) {
  c(node.argument, st, "Expression");
};
base.BinaryExpression = base.LogicalExpression = function (node, st, c) {
  c(node.left, st, "Expression");
  c(node.right, st, "Expression");
};
base.AssignmentExpression = base.AssignmentPattern = function (node, st, c) {
  c(node.left, st, "Pattern");
  c(node.right, st, "Expression");
};
base.ConditionalExpression = function (node, st, c) {
  c(node.test, st, "Expression");
  c(node.consequent, st, "Expression");
  c(node.alternate, st, "Expression");
};
base.NewExpression = base.CallExpression = function (node, st, c) {
  c(node.callee, st, "Expression");
  if (node.arguments)
    { for (var i = 0, list = node.arguments; i < list.length; i += 1)
      {
        var arg = list[i];

        c(arg, st, "Expression");
      } }
};
base.MemberExpression = function (node, st, c) {
  c(node.object, st, "Expression");
  if (node.computed) { c(node.property, st, "Expression"); }
};
base.ExportNamedDeclaration = base.ExportDefaultDeclaration = function (node, st, c) {
  if (node.declaration)
    { c(node.declaration, st, node.type === "ExportNamedDeclaration" || node.declaration.id ? "Statement" : "Expression"); }
  if (node.source) { c(node.source, st, "Expression"); }
};
base.ExportAllDeclaration = function (node, st, c) {
  if (node.exported)
    { c(node.exported, st); }
  c(node.source, st, "Expression");
};
base.ImportDeclaration = function (node, st, c) {
  for (var i = 0, list = node.specifiers; i < list.length; i += 1)
    {
    var spec = list[i];

    c(spec, st);
  }
  c(node.source, st, "Expression");
};
base.ImportExpression = function (node, st, c) {
  c(node.source, st, "Expression");
};
base.ImportSpecifier = base.ImportDefaultSpecifier = base.ImportNamespaceSpecifier = base.Identifier = base.PrivateIdentifier = base.Literal = ignore;

base.TaggedTemplateExpression = function (node, st, c) {
  c(node.tag, st, "Expression");
  c(node.quasi, st, "Expression");
};
base.ClassDeclaration = base.ClassExpression = function (node, st, c) { return c(node, st, "Class"); };
base.Class = function (node, st, c) {
  if (node.id) { c(node.id, st, "Pattern"); }
  if (node.superClass) { c(node.superClass, st, "Expression"); }
  c(node.body, st);
};
base.ClassBody = function (node, st, c) {
  for (var i = 0, list = node.body; i < list.length; i += 1)
    {
    var elt = list[i];

    c(elt, st);
  }
};
base.MethodDefinition = base.PropertyDefinition = base.Property = function (node, st, c) {
  if (node.computed) { c(node.key, st, "Expression"); }
  if (node.value) { c(node.value, st, "Expression"); }
};

async function collectTests(ctx, filepath) {
  const request = await ctx.vitenode.transformRequest(filepath, filepath);
  if (!request) {
    return null;
  }
  const ast = await parseAstAsync(request.code);
  const testFilepath = relative(ctx.config.root, filepath);
  const projectName = ctx.getName();
  const typecheckSubprojectName = projectName ? `${projectName}:__typecheck__` : "__typecheck__";
  const file = {
    filepath,
    type: "suite",
    id: generateHash(`${testFilepath}${typecheckSubprojectName}`),
    name: testFilepath,
    mode: "run",
    tasks: [],
    start: ast.start,
    end: ast.end,
    projectName,
    meta: { typecheck: true },
    file: null
  };
  file.file = file;
  const definitions = [];
  const getName = (callee) => {
    if (!callee) {
      return null;
    }
    if (callee.type === "Identifier") {
      return callee.name;
    }
    if (callee.type === "CallExpression") {
      return getName(callee.callee);
    }
    if (callee.type === "TaggedTemplateExpression") {
      return getName(callee.tag);
    }
    if (callee.type === "MemberExpression") {
      if (callee.object?.name?.startsWith("__vite_ssr_")) {
        return getName(callee.property);
      }
      return getName(callee.object?.property);
    }
    return null;
  };
  ancestor(ast, {
    CallExpression(node) {
      const { callee } = node;
      const name = getName(callee);
      if (!name) {
        return;
      }
      if (!["it", "test", "describe", "suite"].includes(name)) {
        return;
      }
      const property = callee?.property?.name;
      const mode = !property || property === name ? "run" : property;
      if (mode === "each" || mode === "skipIf" || mode === "runIf" || mode === "for") {
        return;
      }
      let start;
      const end = node.end;
      if (callee.type === "CallExpression") {
        start = callee.end;
      } else if (callee.type === "TaggedTemplateExpression") {
        start = callee.end + 1;
      } else {
        start = node.start;
      }
      const {
        arguments: [messageNode]
      } = node;
      if (!messageNode) {
        return;
      }
      const message = getNodeAsString(messageNode, request.code);
      definitions.push({
        start,
        end,
        name: message,
        type: name === "it" || name === "test" ? "test" : "suite",
        mode,
        task: null
      });
    }
  });
  let lastSuite = file;
  const updateLatestSuite = (index) => {
    while (lastSuite.suite && lastSuite.end < index) {
      lastSuite = lastSuite.suite;
    }
    return lastSuite;
  };
  definitions.sort((a, b) => a.start - b.start).forEach((definition) => {
    const latestSuite = updateLatestSuite(definition.start);
    let mode = definition.mode;
    if (latestSuite.mode !== "run") {
      mode = latestSuite.mode;
    }
    if (definition.type === "suite") {
      const task2 = {
        type: definition.type,
        id: "",
        suite: latestSuite,
        file,
        tasks: [],
        mode,
        name: definition.name,
        end: definition.end,
        start: definition.start,
        meta: {
          typecheck: true
        }
      };
      definition.task = task2;
      latestSuite.tasks.push(task2);
      lastSuite = task2;
      return;
    }
    const task = {
      type: definition.type,
      id: "",
      suite: latestSuite,
      file,
      mode,
      context: {},
      // not used in typecheck
      name: definition.name,
      end: definition.end,
      start: definition.start,
      meta: {
        typecheck: true
      }
    };
    definition.task = task;
    latestSuite.tasks.push(task);
  });
  calculateSuiteHash(file);
  const hasOnly = someTasksAreOnly(file);
  interpretTaskModes(
    file,
    ctx.config.testNamePattern,
    hasOnly,
    false,
    ctx.config.allowOnly
  );
  return {
    file,
    parsed: request.code,
    filepath,
    map: request.map,
    definitions
  };
}
function getNodeAsString(node, code) {
  if (node.type === "Literal") {
    return String(node.value);
  } else if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "TemplateLiteral") {
    return mergeTemplateLiteral(node, code);
  } else {
    return code.slice(node.start, node.end);
  }
}
function mergeTemplateLiteral(node, code) {
  let result = "";
  let expressionsIndex = 0;
  for (let quasisIndex = 0; quasisIndex < node.quasis.length; quasisIndex++) {
    result += node.quasis[quasisIndex].value.raw;
    if (expressionsIndex in node.expressions) {
      const expression = node.expressions[expressionsIndex];
      const string = expression.type === "Literal" ? expression.raw : getNodeAsString(expression, code);
      if (expression.type === "TemplateLiteral") {
        result += `\${\`${string}\`}`;
      } else {
        result += `\${${string}}`;
      }
      expressionsIndex++;
    }
  }
  return result;
}

const A=r=>r!==null&&typeof r=="object",a=(r,t)=>Object.assign(new Error(`[${r}]: ${t}`),{code:r}),_="ERR_INVALID_PACKAGE_CONFIG",E="ERR_INVALID_PACKAGE_TARGET",I$1="ERR_PACKAGE_PATH_NOT_EXPORTED",R$1=/^\d+$/,O=/^(\.{1,2}|node_modules)$/i,w=/\/|\\/;var h$1=(r=>(r.Export="exports",r.Import="imports",r))(h$1||{});const f=(r,t,e,o,c)=>{if(t==null)return [];if(typeof t=="string"){const[n,...i]=t.split(w);if(n===".."||i.some(l=>O.test(l)))throw a(E,`Invalid "${r}" target "${t}" defined in the package config`);return [c?t.replace(/\*/g,c):t]}if(Array.isArray(t))return t.flatMap(n=>f(r,n,e,o,c));if(A(t)){for(const n of Object.keys(t)){if(R$1.test(n))throw a(_,"Cannot contain numeric property keys");if(n==="default"||o.includes(n))return f(r,t[n],e,o,c)}return []}throw a(E,`Invalid "${r}" target "${t}"`)},s="*",m=(r,t)=>{const e=r.indexOf(s),o=t.indexOf(s);return e===o?t.length>r.length:o>e};function d(r,t){if(!t.includes(s)&&r.hasOwnProperty(t))return [t];let e,o;for(const c of Object.keys(r))if(c.includes(s)){const[n,i,l]=c.split(s);if(l===void 0&&t.startsWith(n)&&t.endsWith(i)){const g=t.slice(n.length,-i.length||void 0);g&&(!e||m(e,c))&&(e=c,o=g);}}return [e,o]}const p=r=>Object.keys(r).reduce((t,e)=>{const o=e===""||e[0]!==".";if(t===void 0||t===o)return o;throw a(_,'"exports" cannot contain some keys starting with "." and some not')},void 0),u=/^\w+:/,v=(r,t,e)=>{if(!r)throw new Error('"exports" is required');t=t===""?".":`./${t}`,(typeof r=="string"||Array.isArray(r)||A(r)&&p(r))&&(r={".":r});const[o,c]=d(r,t),n=f(h$1.Export,r[o],t,e,c);if(n.length===0)throw a(I$1,t==="."?'No "exports" main defined':`Package subpath '${t}' is not defined by "exports"`);for(const i of n)if(!i.startsWith("./")&&!u.test(i))throw a(E,`Invalid "exports" target "${i}" defined in the package config`);return n};

var ve=Object.defineProperty;var l=(e,t)=>ve(e,"name",{value:t,configurable:!0});function B(e){return e.startsWith("\\\\?\\")?e:e.replace(/\\/g,"/")}l(B,"slash");const R=l(e=>{const t=fs[e];return (i,...n)=>{const o=`${e}:${n.join(":")}`;let s=i==null?void 0:i.get(o);return s===void 0&&(s=Reflect.apply(t,fs,n),i==null||i.set(o,s)),s}},"cacheFs"),F=R("existsSync"),je=R("readFileSync"),P=R("statSync"),ne=l((e,t,i)=>{for(;;){const n=a$1.posix.join(e,t);if(F(i,n))return n;const o=a$1.dirname(e);if(o===e)return;e=o;}},"findUp"),J=/^\.{1,2}(\/.*)?$/,M=l(e=>{const t=B(e);return J.test(t)?t:`./${t}`},"normalizeRelativePath");function _e(e,t=!1){const i=e.length;let n=0,o="",s=0,r=16,f=0,u=0,p=0,T=0,w=0;function O(c,m){let g=0,y=0;for(;g<c||!m;){let j=e.charCodeAt(n);if(j>=48&&j<=57)y=y*16+j-48;else if(j>=65&&j<=70)y=y*16+j-65+10;else if(j>=97&&j<=102)y=y*16+j-97+10;else break;n++,g++;}return g<c&&(y=-1),y}l(O,"scanHexDigits");function v(c){n=c,o="",s=0,r=16,w=0;}l(v,"setPosition");function A(){let c=n;if(e.charCodeAt(n)===48)n++;else for(n++;n<e.length&&N(e.charCodeAt(n));)n++;if(n<e.length&&e.charCodeAt(n)===46)if(n++,n<e.length&&N(e.charCodeAt(n)))for(n++;n<e.length&&N(e.charCodeAt(n));)n++;else return w=3,e.substring(c,n);let m=n;if(n<e.length&&(e.charCodeAt(n)===69||e.charCodeAt(n)===101))if(n++,(n<e.length&&e.charCodeAt(n)===43||e.charCodeAt(n)===45)&&n++,n<e.length&&N(e.charCodeAt(n))){for(n++;n<e.length&&N(e.charCodeAt(n));)n++;m=n;}else w=3;return e.substring(c,m)}l(A,"scanNumber");function b(){let c="",m=n;for(;;){if(n>=i){c+=e.substring(m,n),w=2;break}const g=e.charCodeAt(n);if(g===34){c+=e.substring(m,n),n++;break}if(g===92){if(c+=e.substring(m,n),n++,n>=i){w=2;break}switch(e.charCodeAt(n++)){case 34:c+='"';break;case 92:c+="\\";break;case 47:c+="/";break;case 98:c+="\b";break;case 102:c+="\f";break;case 110:c+=`
`;break;case 114:c+="\r";break;case 116:c+="	";break;case 117:const j=O(4,!0);j>=0?c+=String.fromCharCode(j):w=4;break;default:w=5;}m=n;continue}if(g>=0&&g<=31)if(h(g)){c+=e.substring(m,n),w=2;break}else w=6;n++;}return c}l(b,"scanString");function $(){if(o="",w=0,s=n,u=f,T=p,n>=i)return s=i,r=17;let c=e.charCodeAt(n);if(G(c)){do n++,o+=String.fromCharCode(c),c=e.charCodeAt(n);while(G(c));return r=15}if(h(c))return n++,o+=String.fromCharCode(c),c===13&&e.charCodeAt(n)===10&&(n++,o+=`
`),f++,p=n,r=14;switch(c){case 123:return n++,r=1;case 125:return n++,r=2;case 91:return n++,r=3;case 93:return n++,r=4;case 58:return n++,r=6;case 44:return n++,r=5;case 34:return n++,o=b(),r=10;case 47:const m=n-1;if(e.charCodeAt(n+1)===47){for(n+=2;n<i&&!h(e.charCodeAt(n));)n++;return o=e.substring(m,n),r=12}if(e.charCodeAt(n+1)===42){n+=2;const g=i-1;let y=!1;for(;n<g;){const j=e.charCodeAt(n);if(j===42&&e.charCodeAt(n+1)===47){n+=2,y=!0;break}n++,h(j)&&(j===13&&e.charCodeAt(n)===10&&n++,f++,p=n);}return y||(n++,w=1),o=e.substring(m,n),r=13}return o+=String.fromCharCode(c),n++,r=16;case 45:if(o+=String.fromCharCode(c),n++,n===i||!N(e.charCodeAt(n)))return r=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return o+=A(),r=11;default:for(;n<i&&U(c);)n++,c=e.charCodeAt(n);if(s!==n){switch(o=e.substring(s,n),o){case"true":return r=8;case"false":return r=9;case"null":return r=7}return r=16}return o+=String.fromCharCode(c),n++,r=16}}l($,"scanNext");function U(c){if(G(c)||h(c))return !1;switch(c){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return !1}return !0}l(U,"isUnknownContentCharacter");function E(){let c;do c=$();while(c>=12&&c<=15);return c}return l(E,"scanNextNonTrivia"),{setPosition:v,getPosition:l(()=>n,"getPosition"),scan:t?E:$,getToken:l(()=>r,"getToken"),getTokenValue:l(()=>o,"getTokenValue"),getTokenOffset:l(()=>s,"getTokenOffset"),getTokenLength:l(()=>n-s,"getTokenLength"),getTokenStartLine:l(()=>u,"getTokenStartLine"),getTokenStartCharacter:l(()=>s-T,"getTokenStartCharacter"),getTokenError:l(()=>w,"getTokenError")}}l(_e,"createScanner");function G(e){return e===32||e===9}l(G,"isWhiteSpace");function h(e){return e===10||e===13}l(h,"isLineBreak");function N(e){return e>=48&&e<=57}l(N,"isDigit");var te;((function(e){e[e.lineFeed=10]="lineFeed",e[e.carriageReturn=13]="carriageReturn",e[e.space=32]="space",e[e._0=48]="_0",e[e._1=49]="_1",e[e._2=50]="_2",e[e._3=51]="_3",e[e._4=52]="_4",e[e._5=53]="_5",e[e._6=54]="_6",e[e._7=55]="_7",e[e._8=56]="_8",e[e._9=57]="_9",e[e.a=97]="a",e[e.b=98]="b",e[e.c=99]="c",e[e.d=100]="d",e[e.e=101]="e",e[e.f=102]="f",e[e.g=103]="g",e[e.h=104]="h",e[e.i=105]="i",e[e.j=106]="j",e[e.k=107]="k",e[e.l=108]="l",e[e.m=109]="m",e[e.n=110]="n",e[e.o=111]="o",e[e.p=112]="p",e[e.q=113]="q",e[e.r=114]="r",e[e.s=115]="s",e[e.t=116]="t",e[e.u=117]="u",e[e.v=118]="v",e[e.w=119]="w",e[e.x=120]="x",e[e.y=121]="y",e[e.z=122]="z",e[e.A=65]="A",e[e.B=66]="B",e[e.C=67]="C",e[e.D=68]="D",e[e.E=69]="E",e[e.F=70]="F",e[e.G=71]="G",e[e.H=72]="H",e[e.I=73]="I",e[e.J=74]="J",e[e.K=75]="K",e[e.L=76]="L",e[e.M=77]="M",e[e.N=78]="N",e[e.O=79]="O",e[e.P=80]="P",e[e.Q=81]="Q",e[e.R=82]="R",e[e.S=83]="S",e[e.T=84]="T",e[e.U=85]="U",e[e.V=86]="V",e[e.W=87]="W",e[e.X=88]="X",e[e.Y=89]="Y",e[e.Z=90]="Z",e[e.asterisk=42]="asterisk",e[e.backslash=92]="backslash",e[e.closeBrace=125]="closeBrace",e[e.closeBracket=93]="closeBracket",e[e.colon=58]="colon",e[e.comma=44]="comma",e[e.dot=46]="dot",e[e.doubleQuote=34]="doubleQuote",e[e.minus=45]="minus",e[e.openBrace=123]="openBrace",e[e.openBracket=91]="openBracket",e[e.plus=43]="plus",e[e.slash=47]="slash",e[e.formFeed=12]="formFeed",e[e.tab=9]="tab";}))(te||(te={})),new Array(20).fill(0).map((e,t)=>" ".repeat(t));const D=200;new Array(D).fill(0).map((e,t)=>`
`+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>"\r"+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>`\r
`+" ".repeat(t)),new Array(D).fill(0).map((e,t)=>`
`+"	".repeat(t)),new Array(D).fill(0).map((e,t)=>"\r"+"	".repeat(t)),new Array(D).fill(0).map((e,t)=>`\r
`+"	".repeat(t));var x;(function(e){e.DEFAULT={allowTrailingComma:!1};})(x||(x={}));function $e(e,t=[],i=x.DEFAULT){let n=null,o=[];const s=[];function r(u){Array.isArray(o)?o.push(u):n!==null&&(o[n]=u);}return l(r,"onValue"),ye(e,{onObjectBegin:l(()=>{const u={};r(u),s.push(o),o=u,n=null;},"onObjectBegin"),onObjectProperty:l(u=>{n=u;},"onObjectProperty"),onObjectEnd:l(()=>{o=s.pop();},"onObjectEnd"),onArrayBegin:l(()=>{const u=[];r(u),s.push(o),o=u,n=null;},"onArrayBegin"),onArrayEnd:l(()=>{o=s.pop();},"onArrayEnd"),onLiteralValue:r,onError:l((u,p,T)=>{t.push({error:u,offset:p,length:T});},"onError")},i),o[0]}l($e,"parse$1");function ye(e,t,i=x.DEFAULT){const n=_e(e,!1),o=[];function s(k){return k?()=>k(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}l(s,"toNoArgVisit");function r(k){return k?()=>k(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>o.slice()):()=>!0}l(r,"toNoArgVisitWithPath");function f(k){return k?_=>k(_,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}l(f,"toOneArgVisit");function u(k){return k?_=>k(_,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>o.slice()):()=>!0}l(u,"toOneArgVisitWithPath");const p=r(t.onObjectBegin),T=u(t.onObjectProperty),w=s(t.onObjectEnd),O=r(t.onArrayBegin),v=s(t.onArrayEnd),A=u(t.onLiteralValue),b=f(t.onSeparator),$=s(t.onComment),U=f(t.onError),E=i&&i.disallowComments,c=i&&i.allowTrailingComma;function m(){for(;;){const k=n.scan();switch(n.getTokenError()){case 4:g(14);break;case 5:g(15);break;case 3:g(13);break;case 1:E||g(11);break;case 2:g(12);break;case 6:g(16);break}switch(k){case 12:case 13:E?g(10):$();break;case 16:g(1);break;case 15:case 14:break;default:return k}}}l(m,"scanNext");function g(k,_=[],C=[]){if(U(k),_.length+C.length>0){let d=n.getToken();for(;d!==17;){if(_.indexOf(d)!==-1){m();break}else if(C.indexOf(d)!==-1)break;d=m();}}}l(g,"handleError");function y(k){const _=n.getTokenValue();return k?A(_):(T(_),o.push(_)),m(),!0}l(y,"parseString");function j(){switch(n.getToken()){case 11:const k=n.getTokenValue();let _=Number(k);isNaN(_)&&(g(2),_=0),A(_);break;case 7:A(null);break;case 8:A(!0);break;case 9:A(!1);break;default:return !1}return m(),!0}l(j,"parseLiteral");function ke(){return n.getToken()!==10?(g(3,[],[2,5]),!1):(y(!1),n.getToken()===6?(b(":"),m(),V()||g(4,[],[2,5])):g(5,[],[2,5]),o.pop(),!0)}l(ke,"parseProperty");function be(){p(),m();let k=!1;for(;n.getToken()!==2&&n.getToken()!==17;){if(n.getToken()===5){if(k||g(4,[],[]),b(","),m(),n.getToken()===2&&c)break}else k&&g(6,[],[]);ke()||g(4,[],[2,5]),k=!0;}return w(),n.getToken()!==2?g(7,[2],[]):m(),!0}l(be,"parseObject");function we(){O(),m();let k=!0,_=!1;for(;n.getToken()!==4&&n.getToken()!==17;){if(n.getToken()===5){if(_||g(4,[],[]),b(","),m(),n.getToken()===4&&c)break}else _&&g(6,[],[]);k?(o.push(0),k=!1):o[o.length-1]++,V()||g(4,[],[4,5]),_=!0;}return v(),k||o.pop(),n.getToken()!==4?g(8,[4],[]):m(),!0}l(we,"parseArray");function V(){switch(n.getToken()){case 3:return we();case 1:return be();case 10:return y(!0);default:return j()}}return l(V,"parseValue"),m(),n.getToken()===17?i.allowEmptyContent?!0:(g(4,[],[]),!1):V()?(n.getToken()!==17&&g(9,[],[]),!0):(g(4,[],[]),!1)}l(ye,"visit");var ie;(function(e){e[e.None=0]="None",e[e.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=2]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",e[e.InvalidUnicode=4]="InvalidUnicode",e[e.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",e[e.InvalidCharacter=6]="InvalidCharacter";})(ie||(ie={}));var oe;(function(e){e[e.OpenBraceToken=1]="OpenBraceToken",e[e.CloseBraceToken=2]="CloseBraceToken",e[e.OpenBracketToken=3]="OpenBracketToken",e[e.CloseBracketToken=4]="CloseBracketToken",e[e.CommaToken=5]="CommaToken",e[e.ColonToken=6]="ColonToken",e[e.NullKeyword=7]="NullKeyword",e[e.TrueKeyword=8]="TrueKeyword",e[e.FalseKeyword=9]="FalseKeyword",e[e.StringLiteral=10]="StringLiteral",e[e.NumericLiteral=11]="NumericLiteral",e[e.LineCommentTrivia=12]="LineCommentTrivia",e[e.BlockCommentTrivia=13]="BlockCommentTrivia",e[e.LineBreakTrivia=14]="LineBreakTrivia",e[e.Trivia=15]="Trivia",e[e.Unknown=16]="Unknown",e[e.EOF=17]="EOF";})(oe||(oe={}));const Be=$e;var se;(function(e){e[e.InvalidSymbol=1]="InvalidSymbol",e[e.InvalidNumberFormat=2]="InvalidNumberFormat",e[e.PropertyNameExpected=3]="PropertyNameExpected",e[e.ValueExpected=4]="ValueExpected",e[e.ColonExpected=5]="ColonExpected",e[e.CommaExpected=6]="CommaExpected",e[e.CloseBraceExpected=7]="CloseBraceExpected",e[e.CloseBracketExpected=8]="CloseBracketExpected",e[e.EndOfFileExpected=9]="EndOfFileExpected",e[e.InvalidCommentToken=10]="InvalidCommentToken",e[e.UnexpectedEndOfComment=11]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=12]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=13]="UnexpectedEndOfNumber",e[e.InvalidUnicode=14]="InvalidUnicode",e[e.InvalidEscapeCharacter=15]="InvalidEscapeCharacter",e[e.InvalidCharacter=16]="InvalidCharacter";})(se||(se={}));const le=l((e,t)=>Be(je(t,e,"utf8")),"readJsonc"),z=Symbol("implicitBaseUrl"),L="${configDir}",Fe=l(()=>{const{findPnpApi:e}=Te;return e&&e(process.cwd())},"getPnpApi"),Q=l((e,t,i,n)=>{const o=`resolveFromPackageJsonPath:${e}:${t}:${i}`;if(n!=null&&n.has(o))return n.get(o);const s=le(e,n);if(!s)return;let r=t||"tsconfig.json";if(!i&&s.exports)try{const[f]=v(s.exports,t,["require","types"]);r=f;}catch{return !1}else !t&&s.tsconfig&&(r=s.tsconfig);return r=a$1.join(e,"..",r),n==null||n.set(o,r),r},"resolveFromPackageJsonPath"),H="package.json",X="tsconfig.json",Le=l((e,t,i)=>{let n=e;if(e===".."&&(n=a$1.join(n,X)),e[0]==="."&&(n=a$1.resolve(t,n)),a$1.isAbsolute(n)){if(F(i,n)){if(P(i,n).isFile())return n}else if(!n.endsWith(".json")){const v=`${n}.json`;if(F(i,v))return v}return}const[o,...s]=e.split("/"),r=o[0]==="@"?`${o}/${s.shift()}`:o,f=s.join("/"),u=Fe();if(u){const{resolveRequest:v}=u;try{if(r===e){const A=v(a$1.join(r,H),t);if(A){const b=Q(A,f,!1,i);if(b&&F(i,b))return b}}else {let A;try{A=v(e,t,{extensions:[".json"]});}catch{A=v(a$1.join(e,X),t);}if(A)return A}}catch{}}const p=ne(a$1.resolve(t),a$1.join("node_modules",r),i);if(!p||!P(i,p).isDirectory())return;const T=a$1.join(p,H);if(F(i,T)){const v=Q(T,f,!1,i);if(v===!1)return;if(v&&F(i,v)&&P(i,v).isFile())return v}const w=a$1.join(p,f),O=w.endsWith(".json");if(!O){const v=`${w}.json`;if(F(i,v))return v}if(F(i,w)){if(P(i,w).isDirectory()){const v=a$1.join(w,H);if(F(i,v)){const b=Q(v,"",!0,i);if(b&&F(i,b))return b}const A=a$1.join(w,X);if(F(i,A))return A}else if(O)return w}},"resolveExtendsPath"),Y=l((e,t)=>M(a$1.relative(e,t)),"pathRelative"),re=["files","include","exclude"],Ue=l((e,t,i,n)=>{const o=Le(e,t,n);if(!o)throw new Error(`File '${e}' not found.`);if(i.has(o))throw new Error(`Circularity detected while resolving configuration: ${o}`);i.add(o);const s=a$1.dirname(o),r=ue(o,n,i);delete r.references;const{compilerOptions:f}=r;if(f){const{baseUrl:u}=f;u&&!u.startsWith(L)&&(f.baseUrl=B(a$1.relative(t,a$1.join(s,u)))||"./");let{outDir:p}=f;p&&(p.startsWith(L)||(p=a$1.relative(t,a$1.join(s,p))),f.outDir=B(p)||"./");}for(const u of re){const p=r[u];p&&(r[u]=p.map(T=>T.startsWith(L)?T:B(a$1.relative(t,a$1.join(s,T)))));}return r},"resolveExtends"),Ee=["outDir","declarationDir"],ue=l((e,t,i=new Set)=>{let n;try{n=le(e,t)||{};}catch{throw new Error(`Cannot resolve tsconfig at path: ${e}`)}if(typeof n!="object")throw new SyntaxError(`Failed to parse tsconfig at: ${e}`);const o=a$1.dirname(e);if(n.compilerOptions){const{compilerOptions:s}=n;s.paths&&!s.baseUrl&&(s[z]=o);}if(n.extends){const s=Array.isArray(n.extends)?n.extends:[n.extends];delete n.extends;for(const r of s.reverse()){const f=Ue(r,o,new Set(i),t),u={...f,...n,compilerOptions:{...f.compilerOptions,...n.compilerOptions}};f.watchOptions&&(u.watchOptions={...f.watchOptions,...n.watchOptions}),n=u;}}if(n.compilerOptions){const{compilerOptions:s}=n,r=["baseUrl","rootDir"];for(const f of r){const u=s[f];if(u&&!u.startsWith(L)){const p=a$1.resolve(o,u),T=Y(o,p);s[f]=T;}}for(const f of Ee){let u=s[f];u&&(Array.isArray(n.exclude)||(n.exclude=[]),n.exclude.includes(u)||n.exclude.push(u),u.startsWith(L)||(u=M(u)),s[f]=u);}}else n.compilerOptions={};if(n.include?(n.include=n.include.map(B),n.files&&delete n.files):n.files&&(n.files=n.files.map(s=>s.startsWith(L)?s:M(s))),n.watchOptions){const{watchOptions:s}=n;s.excludeDirectories&&(s.excludeDirectories=s.excludeDirectories.map(r=>B(a$1.resolve(o,r))));}return n},"_parseTsconfig"),I=l((e,t)=>{if(e.startsWith(L))return B(a$1.join(t,e.slice(L.length)))},"interpolateConfigDir"),Ne=["outDir","declarationDir","outFile","rootDir","baseUrl","tsBuildInfoFile"],fe=l((e,t=new Map)=>{const i=a$1.resolve(e),n=ue(i,t),o=a$1.dirname(i),{compilerOptions:s}=n;if(s){for(const f of Ne){const u=s[f];if(u){const p=I(u,o);s[f]=p?Y(o,p):u;}}for(const f of ["rootDirs","typeRoots"]){const u=s[f];u&&(s[f]=u.map(p=>{const T=I(p,o);return T?Y(o,T):p}));}const{paths:r}=s;if(r)for(const f of Object.keys(r))r[f]=r[f].map(u=>{var p;return (p=I(u,o))!=null?p:u});}for(const r of re){const f=n[r];f&&(n[r]=f.map(u=>{var p;return (p=I(u,o))!=null?p:u}));}return n},"parseTsconfig"),De=l((e=process.cwd(),t="tsconfig.json",i=new Map)=>{const n=ne(B(e),t,i);if(!n)return null;const o=fe(n,i);return {path:n,config:o}},"getTsconfig"),he=/\*/g,ce=l((e,t)=>{const i=e.match(he);if(i&&i.length>1)throw new Error(t)},"assertStarCount"),de=l(e=>{if(e.includes("*")){const[t,i]=e.split("*");return {prefix:t,suffix:i}}return e},"parsePattern"),Pe=l(({prefix:e,suffix:t},i)=>i.startsWith(e)&&i.endsWith(t),"isPatternMatch"),xe=l((e,t,i)=>Object.entries(e).map(([n,o])=>(ce(n,`Pattern '${n}' can have at most one '*' character.`),{pattern:de(n),substitutions:o.map(s=>{if(ce(s,`Substitution '${s}' in pattern '${n}' can have at most one '*' character.`),!t&&!J.test(s))throw new Error("Non-relative paths are not allowed when 'baseUrl' is not set. Did you forget a leading './'?");return a$1.resolve(i,s)})})),"parsePaths");l(e=>{const{compilerOptions:t}=e.config;if(!t)return null;const{baseUrl:i,paths:n}=t;if(!i&&!n)return null;const o=z in t&&t[z],s=a$1.resolve(a$1.dirname(e.path),i||o||"."),r=n?xe(n,i,s):[];return f=>{if(J.test(f))return [];const u=[];for(const O of r){if(O.pattern===f)return O.substitutions.map(B);typeof O.pattern!="string"&&u.push(O);}let p,T=-1;for(const O of u)Pe(O.pattern,f)&&O.pattern.prefix.length>T&&(T=O.pattern.prefix.length,p=O);if(!p)return i?[B(a$1.join(s,f))]:[];const w=f.slice(p.pattern.prefix.length,f.length-p.pattern.suffix.length);return p.substitutions.map(O=>B(O.replace("*",w)))}},"createPathsMatcher");const pe=l(e=>{let t="";for(let i=0;i<e.length;i+=1){const n=e[i],o=n.toUpperCase();t+=n===o?n.toLowerCase():o;}return t},"s"),Se=65,We=97,Ve=l(()=>Math.floor(Math.random()*26),"m"),Re=l(e=>Array.from({length:e},()=>String.fromCodePoint(Ve()+(Math.random()>.5?Se:We))).join(""),"S"),Je=l((e=require$$0)=>{const t=process.execPath;if(e.existsSync(t))return !e.existsSync(pe(t));const i=`/${Re(10)}`;e.writeFileSync(i,"");const n=!e.existsSync(pe(i));return e.unlinkSync(i),n},"l"),{join:S}=a$1.posix,Z={ts:[".ts",".tsx",".d.ts"],cts:[".cts",".d.cts"],mts:[".mts",".d.mts"]},Me=l(e=>{const t=[...Z.ts],i=[...Z.cts],n=[...Z.mts];return e!=null&&e.allowJs&&(t.push(".js",".jsx"),i.push(".cjs"),n.push(".mjs")),[...t,...i,...n]},"getSupportedExtensions"),Ge=l(e=>{const t=[];if(!e)return t;const{outDir:i,declarationDir:n}=e;return i&&t.push(i),n&&t.push(n),t},"getDefaultExcludeSpec"),ae=l(e=>e.replaceAll(/[.*+?^${}()|[\]\\]/g,String.raw`\$&`),"escapeForRegexp"),ze=["node_modules","bower_components","jspm_packages"],q=`(?!(${ze.join("|")})(/|$))`,Qe=/(?:^|\/)[^.*?]+$/,ge="**/*",W="[^/]",K="[^./]",me=process.platform==="win32";l(({config:e,path:t},i=Je())=>{if("extends"in e)throw new Error("tsconfig#extends must be resolved. Use getTsconfig or parseTsconfig to resolve it.");if(!a$1.isAbsolute(t))throw new Error("The tsconfig path must be absolute");me&&(t=B(t));const n=a$1.dirname(t),{files:o,include:s,exclude:r,compilerOptions:f}=e,u=o==null?void 0:o.map(b=>S(n,b)),p=Me(f),T=i?"":"i",O=(r||Ge(f)).map(b=>{const $=S(n,b),U=ae($).replaceAll(String.raw`\*\*/`,"(.+/)?").replaceAll(String.raw`\*`,`${W}*`).replaceAll(String.raw`\?`,W);return new RegExp(`^${U}($|/)`,T)}),v=o||s?s:[ge],A=v?v.map(b=>{let $=S(n,b);Qe.test($)&&($=S($,ge));const U=ae($).replaceAll(String.raw`/\*\*`,`(/${q}${K}${W}*)*?`).replaceAll(/(\/)?\\\*/g,(E,c)=>{const m=`(${K}|(\\.(?!min\\.js$))?)*`;return c?`/${q}${K}${m}`:m}).replaceAll(/(\/)?\\\?/g,(E,c)=>{const m=W;return c?`/${q}${m}`:m});return new RegExp(`^${U}$`,T)}):void 0;return b=>{if(!a$1.isAbsolute(b))throw new Error("filePath must be absolute");if(me&&(b=B(b)),u!=null&&u.includes(b))return e;if(!(!p.some($=>b.endsWith($))||O.some($=>$.test(b)))&&A&&A.some($=>$.test(b)))return e}},"createFilesMatcher");

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const newLineRegExp = /\r?\n/;
const errCodeRegExp = /error TS(?<errCode>\d+)/;
async function makeTscErrorInfo(errInfo) {
  const [errFilePathPos = "", ...errMsgRawArr] = errInfo.split(":");
  if (!errFilePathPos || errMsgRawArr.length === 0 || errMsgRawArr.join("").length === 0) {
    return ["unknown filepath", null];
  }
  const errMsgRaw = errMsgRawArr.join("").trim();
  const [errFilePath, errPos] = errFilePathPos.slice(0, -1).split("(");
  if (!errFilePath || !errPos) {
    return ["unknown filepath", null];
  }
  const [errLine, errCol] = errPos.split(",");
  if (!errLine || !errCol) {
    return [errFilePath, null];
  }
  const execArr = errCodeRegExp.exec(errMsgRaw);
  if (!execArr) {
    return [errFilePath, null];
  }
  const errCodeStr = execArr.groups?.errCode ?? "";
  if (!errCodeStr) {
    return [errFilePath, null];
  }
  const line = Number(errLine);
  const col = Number(errCol);
  const errCode = Number(errCodeStr);
  return [
    errFilePath,
    {
      filePath: errFilePath,
      errCode,
      line,
      column: col,
      errMsg: errMsgRaw.slice(`error TS${errCode} `.length)
    }
  ];
}
async function getTsconfig(root, config) {
  const configName = config.tsconfig ? basename(config.tsconfig) : void 0;
  const configSearchPath = config.tsconfig ? dirname(resolve(root, config.tsconfig)) : root;
  const tsconfig = De(configSearchPath, configName);
  if (!tsconfig) {
    throw new Error("no tsconfig.json found");
  }
  const tempConfigPath = join(
    dirname(tsconfig.path),
    "tsconfig.vitest-temp.json"
  );
  try {
    const tmpTsConfig = { ...tsconfig.config };
    tmpTsConfig.compilerOptions = tmpTsConfig.compilerOptions || {};
    tmpTsConfig.compilerOptions.emitDeclarationOnly = false;
    tmpTsConfig.compilerOptions.incremental = true;
    tmpTsConfig.compilerOptions.tsBuildInfoFile = join(
      process.versions.pnp ? join(nodeos__default.tmpdir(), "vitest") : __dirname,
      "tsconfig.tmp.tsbuildinfo"
    );
    const tsconfigFinalContent = JSON.stringify(tmpTsConfig, null, 2);
    await writeFile(tempConfigPath, tsconfigFinalContent);
    return { path: tempConfigPath, config: tmpTsConfig };
  } catch (err) {
    throw new Error("failed to write tsconfig.temp.json", { cause: err });
  }
}
async function getRawErrsMapFromTsCompile(tscErrorStdout) {
  const rawErrsMap = /* @__PURE__ */ new Map();
  const infos = await Promise.all(
    tscErrorStdout.split(newLineRegExp).reduce((prev, next) => {
      if (!next) {
        return prev;
      } else if (!next.startsWith(" ")) {
        prev.push(next);
      } else {
        prev[prev.length - 1] += `
${next}`;
      }
      return prev;
    }, []).map((errInfoLine) => makeTscErrorInfo(errInfoLine))
  );
  infos.forEach(([errFilePath, errInfo]) => {
    if (!errInfo) {
      return;
    }
    if (!rawErrsMap.has(errFilePath)) {
      rawErrsMap.set(errFilePath, [errInfo]);
    } else {
      rawErrsMap.get(errFilePath)?.push(errInfo);
    }
  });
  return rawErrsMap;
}

function createIndexMap(source) {
  const map = /* @__PURE__ */ new Map();
  let index = 0;
  let line = 1;
  let column = 1;
  for (const char of source) {
    map.set(`${line}:${column}`, index++);
    if (char === "\n" || char === "\r\n") {
      line++;
      column = 0;
    } else {
      column++;
    }
  }
  return map;
}

class TypeCheckError extends Error {
  constructor(message, stacks) {
    super(message);
    this.message = message;
    this.stacks = stacks;
  }
  name = "TypeCheckError";
}
class Typechecker {
  constructor(ctx) {
    this.ctx = ctx;
  }
  _onParseStart;
  _onParseEnd;
  _onWatcherRerun;
  _result = {
    files: [],
    sourceErrors: [],
    time: 0
  };
  _startTime = 0;
  _output = "";
  _tests = {};
  tempConfigPath;
  allowJs;
  process;
  files = [];
  setFiles(files) {
    this.files = files;
  }
  onParseStart(fn) {
    this._onParseStart = fn;
  }
  onParseEnd(fn) {
    this._onParseEnd = fn;
  }
  onWatcherRerun(fn) {
    this._onWatcherRerun = fn;
  }
  async collectFileTests(filepath) {
    return collectTests(this.ctx, filepath);
  }
  getFiles() {
    return this.files.filter((filename) => {
      const extension = extname(filename);
      return extension !== ".js" || this.allowJs;
    });
  }
  async collectTests() {
    const tests = (await Promise.all(
      this.getFiles().map((filepath) => this.collectFileTests(filepath))
    )).reduce((acc, data) => {
      if (!data) {
        return acc;
      }
      acc[data.filepath] = data;
      return acc;
    }, {});
    this._tests = tests;
    return tests;
  }
  markPassed(file) {
    if (!file.result?.state) {
      file.result = {
        state: "pass"
      };
    }
    const markTasks = (tasks) => {
      for (const task of tasks) {
        if ("tasks" in task) {
          markTasks(task.tasks);
        }
        if (!task.result?.state && task.mode === "run") {
          task.result = {
            state: "pass"
          };
        }
      }
    };
    markTasks(file.tasks);
  }
  async prepareResults(output) {
    const typeErrors = await this.parseTscLikeOutput(output);
    const testFiles = new Set(this.getFiles());
    if (!this._tests) {
      this._tests = await this.collectTests();
    }
    const sourceErrors = [];
    const files = [];
    testFiles.forEach((path) => {
      const { file, definitions, map, parsed } = this._tests[path];
      const errors = typeErrors.get(path);
      files.push(file);
      if (!errors) {
        this.markPassed(file);
        return;
      }
      const sortedDefinitions = [
        ...definitions.sort((a, b) => b.start - a.start)
      ];
      const traceMap = map && new TraceMap(map);
      const indexMap = createIndexMap(parsed);
      const markState = (task, state) => {
        task.result = {
          state: task.mode === "run" || task.mode === "only" ? state : task.mode
        };
        if (task.suite) {
          markState(task.suite, state);
        } else if (task.file && task !== task.file) {
          markState(task.file, state);
        }
      };
      errors.forEach(({ error, originalError }) => {
        const processedPos = traceMap ? generatedPositionFor(traceMap, {
          line: originalError.line,
          column: originalError.column,
          source: basename(path)
        }) : originalError;
        const line = processedPos.line ?? originalError.line;
        const column = processedPos.column ?? originalError.column;
        const index = indexMap.get(`${line}:${column}`);
        const definition = index != null && sortedDefinitions.find(
          (def) => def.start <= index && def.end >= index
        );
        const suite = definition ? definition.task : file;
        const state = suite.mode === "run" || suite.mode === "only" ? "fail" : suite.mode;
        const errors2 = suite.result?.errors || [];
        suite.result = {
          state,
          errors: errors2
        };
        errors2.push(error);
        if (state === "fail") {
          if (suite.suite) {
            markState(suite.suite, "fail");
          } else if (suite.file && suite !== suite.file) {
            markState(suite.file, "fail");
          }
        }
      });
      this.markPassed(file);
    });
    typeErrors.forEach((errors, path) => {
      if (!testFiles.has(path)) {
        sourceErrors.push(...errors.map(({ error }) => error));
      }
    });
    return {
      files,
      sourceErrors,
      time: performance.now() - this._startTime
    };
  }
  async parseTscLikeOutput(output) {
    const errorsMap = await getRawErrsMapFromTsCompile(output);
    const typesErrors = /* @__PURE__ */ new Map();
    errorsMap.forEach((errors, path) => {
      const filepath = resolve(this.ctx.config.root, path);
      const suiteErrors = errors.map((info) => {
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        const errMsg = info.errMsg.replace(
          /\r?\n\s*(Type .* has no call signatures)/g,
          " $1"
        );
        const error = new TypeCheckError(errMsg, [
          {
            file: filepath,
            line: info.line,
            column: info.column,
            method: ""
          }
        ]);
        Error.stackTraceLimit = limit;
        return {
          originalError: info,
          error: {
            name: error.name,
            nameStr: String(error.name),
            message: errMsg,
            stacks: error.stacks,
            stack: "",
            stackStr: ""
          }
        };
      });
      typesErrors.set(filepath, suiteErrors);
    });
    return typesErrors;
  }
  async clear() {
    if (this.tempConfigPath) {
      await rm(this.tempConfigPath, { force: true });
    }
  }
  async stop() {
    await this.clear();
    this.process?.kill();
    this.process = void 0;
  }
  async ensurePackageInstalled(ctx, checker) {
    if (checker !== "tsc" && checker !== "vue-tsc") {
      return;
    }
    const packageName = checker === "tsc" ? "typescript" : "vue-tsc";
    await ctx.packageInstaller.ensureInstalled(packageName, ctx.config.root);
  }
  async prepare() {
    const { root, typecheck } = this.ctx.config;
    const { config, path } = await getTsconfig(root, typecheck);
    this.tempConfigPath = path;
    this.allowJs = typecheck.allowJs || config.allowJs || false;
  }
  getExitCode() {
    return this.process?.exitCode != null && this.process.exitCode;
  }
  getOutput() {
    return this._output;
  }
  async start() {
    if (this.process) {
      return;
    }
    if (!this.tempConfigPath) {
      throw new Error("tsconfig was not initialized");
    }
    const { root, watch, typecheck } = this.ctx.config;
    const args = ["--noEmit", "--pretty", "false", "-p", this.tempConfigPath];
    if (watch) {
      args.push("--watch");
    }
    if (typecheck.allowJs) {
      args.push("--allowJs", "--checkJs");
    }
    this._output = "";
    this._startTime = performance.now();
    const child = x$1(typecheck.checker, args, {
      nodeOptions: {
        cwd: root,
        stdio: "pipe"
      },
      throwOnError: false
    });
    this.process = child.process;
    await this._onParseStart?.();
    let rerunTriggered = false;
    child.process?.stdout?.on("data", (chunk) => {
      this._output += chunk;
      if (!watch) {
        return;
      }
      if (this._output.includes("File change detected") && !rerunTriggered) {
        this._onWatcherRerun?.();
        this._startTime = performance.now();
        this._result.sourceErrors = [];
        this._result.files = [];
        this._tests = null;
        rerunTriggered = true;
      }
      if (/Found \w+ errors*. Watching for/.test(this._output)) {
        rerunTriggered = false;
        this.prepareResults(this._output).then((result) => {
          this._result = result;
          this._onParseEnd?.(result);
        });
        this._output = "";
      }
    });
    if (!watch) {
      await child;
      this._result = await this.prepareResults(this._output);
      await this._onParseEnd?.(this._result);
    }
  }
  getResult() {
    return this._result;
  }
  getTestFiles() {
    return Object.values(this._tests || {}).map((i) => i.file);
  }
  getTestPacks() {
    return Object.values(this._tests || {}).map(({ file }) => getTasks(file)).flat().map((i) => [i.id, i.result, { typecheck: true }]);
  }
}

class BaseSequencer {
  ctx;
  constructor(ctx) {
    this.ctx = ctx;
  }
  // async so it can be extended by other sequelizers
  async shard(files) {
    const { config } = this.ctx;
    const { index, count } = config.shard;
    const shardSize = Math.ceil(files.length / count);
    const shardStart = shardSize * (index - 1);
    const shardEnd = shardSize * index;
    return [...files].map((spec) => {
      const fullPath = resolve(slash(config.root), slash(spec.moduleId));
      const specPath = fullPath?.slice(config.root.length);
      return {
        spec,
        hash: hash("sha1", specPath, "hex")
      };
    }).sort((a, b) => a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0).slice(shardStart, shardEnd).map(({ spec }) => spec);
  }
  // async so it can be extended by other sequelizers
  async sort(files) {
    const cache = this.ctx.cache;
    return [...files].sort((a, b) => {
      const keyA = `${a.project.name}:${relative(this.ctx.config.root, a.moduleId)}`;
      const keyB = `${b.project.name}:${relative(this.ctx.config.root, b.moduleId)}`;
      const aState = cache.getFileTestResults(keyA);
      const bState = cache.getFileTestResults(keyB);
      if (!aState || !bState) {
        const statsA = cache.getFileStats(keyA);
        const statsB = cache.getFileStats(keyB);
        if (!statsA || !statsB) {
          return !statsA && statsB ? -1 : !statsB && statsA ? 1 : 0;
        }
        return statsB.size - statsA.size;
      }
      if (aState.failed && !bState.failed) {
        return -1;
      }
      if (!aState.failed && bState.failed) {
        return 1;
      }
      return bState.duration - aState.duration;
    });
  }
}

class RandomSequencer extends BaseSequencer {
  async sort(files) {
    const { sequence } = this.ctx.config;
    return shuffle(files, sequence.seed);
  }
}

export { BaseSequencer as B, RandomSequencer as R, Typechecker as T, TypeCheckError as a, isNode as b, isDeno as c, getOutputFile as g, hash as h, isWindows as i, wrapSerializableConfig as w };
