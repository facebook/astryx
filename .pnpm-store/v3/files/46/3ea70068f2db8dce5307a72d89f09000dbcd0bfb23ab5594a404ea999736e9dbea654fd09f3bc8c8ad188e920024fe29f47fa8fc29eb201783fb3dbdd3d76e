"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var runCode_exports = {};
__export(runCode_exports, {
  default: () => runCode_default
});
module.exports = __toCommonJS(runCode_exports);
var import_vm = __toESM(require("vm"));
var import_utils = require("playwright-core/lib/utils");
var import_bundle = require("../../sdk/bundle");
var import_tool = require("./tool");
const codeSchema = import_bundle.z.object({
  code: import_bundle.z.string().describe(`Playwright code snippet to run. The snippet should access the \`page\` object to interact with the page. Can make multiple statements. For example: \`await page.getByRole('button', { name: 'Submit' }).click();\``)
});
const runCode = (0, import_tool.defineTabTool)({
  capability: "core",
  schema: {
    name: "browser_run_code",
    title: "Run Playwright code",
    description: "Run Playwright code snippet",
    inputSchema: codeSchema,
    type: "action"
  },
  handle: async (tab, params, response) => {
    response.setIncludeSnapshot();
    response.addCode(params.code);
    const __end__ = new import_utils.ManualPromise();
    const context = {
      page: tab.page,
      __end__
    };
    import_vm.default.createContext(context);
    await tab.waitForCompletion(async () => {
      const snippet = `(async () => {
        try {
          ${params.code};
          __end__.resolve();
        } catch (e) {
          __end__.reject(e);
        }
      })()`;
      import_vm.default.runInContext(snippet, context);
      await __end__;
    });
  }
});
var runCode_default = [
  runCode
];
