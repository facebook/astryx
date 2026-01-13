/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = BabelPluginSyntaxHermesParser;

var HermesParser = _interopRequireWildcard(require("hermes-parser"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function BabelPluginSyntaxHermesParser( // $FlowExpectedError[unclear-type] We don't have types for this.
api, options) {
  api.assertVersion('^7.0.0 || ^8.0.0-alpha.6');
  const {
    parseLangTypes = 'all'
  } = options;
  let curParserOpts = {};
  let curFilename = null;
  return {
    name: 'syntax-hermes-parser',

    manipulateOptions(opts) {
      curParserOpts = opts.parserOpts;
      curFilename = opts.filename;
    },

    // API suggested via https://babeljs.io/docs/babel-parser#will-the-babel-parser-support-a-plugin-system
    parserOverride(code) {
      const filename = curFilename;

      if (filename != null && (filename.endsWith('.ts') || filename.endsWith('.tsx'))) {
        return;
      }

      const parserOpts = {};

      for (const [key, value] of Object.entries(curParserOpts)) {
        if (HermesParser.ParserOptionsKeys.has(key)) {
          // $FlowExpectedError[incompatible-type]
          parserOpts[key] = value;
        }
      }

      if (parseLangTypes === 'flow' && !/@flow/.test(code)) {
        return;
      }

      return HermesParser.parse(code, { ...parserOpts,
        babel: true
      });
    },

    pre() {
      curParserOpts = {};
    }

  };
}