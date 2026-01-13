'use strict';

var mdxReactShim = require('@storybook/addon-docs/dist/shims/mdx-react-shim');



Object.keys(mdxReactShim).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return mdxReactShim[k]; }
	});
});
