"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/icons.tsx
var icons_exports = {};
__export(icons_exports, {
  y2kIconRegistry: () => y2kIconRegistry
});
module.exports = __toCommonJS(icons_exports);
var import_lucide_react = require("lucide-react");
var import_jsx_runtime = require("react/jsx-runtime");
var iconProps = {
  size: "1em",
  "aria-hidden": true
};
var y2kIconRegistry = {
  close: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { ...iconProps }),
  chevronDown: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronDown, { ...iconProps }),
  chevronLeft: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronLeft, { ...iconProps }),
  chevronRight: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronRight, { ...iconProps }),
  check: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Check, { ...iconProps }),
  success: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CheckCircle, { ...iconProps }),
  error: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.XCircle, { ...iconProps }),
  warning: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { ...iconProps }),
  info: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Info, { ...iconProps }),
  calendar: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Calendar, { ...iconProps }),
  clock: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Clock, { ...iconProps }),
  externalLink: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ExternalLink, { ...iconProps }),
  menu: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Menu, { ...iconProps }),
  moreHorizontal: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.MoreHorizontal, { ...iconProps }),
  search: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Search, { ...iconProps }),
  arrowUp: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowUp, { ...iconProps }),
  arrowDown: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowDown, { ...iconProps }),
  arrowsUpDown: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowUpDown, { ...iconProps }),
  funnel: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Filter, { ...iconProps }),
  eyeSlash: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.EyeOff, { ...iconProps }),
  viewColumns: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Columns, { ...iconProps }),
  copy: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Copy, { ...iconProps }),
  checkDouble: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CheckCheck, { ...iconProps }),
  wrench: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Wrench, { ...iconProps }),
  stop: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Square, { ...iconProps }),
  microphone: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Mic, { ...iconProps })
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  y2kIconRegistry
});
