'use strict';

var previewApi = require('storybook/internal/preview-api');
var actionsAddon = require('@storybook/addon-actions');
var backgroundsAddon = require('@storybook/addon-backgrounds');
var docsAddon = require('@storybook/addon-docs/preview');
var highlightAddon = require('@storybook/addon-highlight');
var measureAddon = require('@storybook/addon-measure');
var outlineAddon = require('@storybook/addon-outline');
var viewportAddon = require('@storybook/addon-viewport');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
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

var actionsAddon__default = /*#__PURE__*/_interopDefault(actionsAddon);
var backgroundsAddon__default = /*#__PURE__*/_interopDefault(backgroundsAddon);
var docsAddon__namespace = /*#__PURE__*/_interopNamespace(docsAddon);
var highlightAddon__default = /*#__PURE__*/_interopDefault(highlightAddon);
var measureAddon__default = /*#__PURE__*/_interopDefault(measureAddon);
var outlineAddon__default = /*#__PURE__*/_interopDefault(outlineAddon);
var viewportAddon__default = /*#__PURE__*/_interopDefault(viewportAddon);

var preview_default=previewApi.composeConfigs([actionsAddon__default.default(),docsAddon__namespace,backgroundsAddon__default.default(),viewportAddon__default.default(),measureAddon__default.default(),outlineAddon__default.default(),highlightAddon__default.default()]);

module.exports = preview_default;
