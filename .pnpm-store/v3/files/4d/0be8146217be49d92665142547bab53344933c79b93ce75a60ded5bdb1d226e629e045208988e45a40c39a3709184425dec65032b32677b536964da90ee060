'use strict';

var path = require('path');
var preset = require('@storybook/addon-docs/dist/preset');

var __require=(x=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(x,{get:(a,b)=>(typeof require<"u"?require:a)[b]}):x)(function(x){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+x+'" is not supported')});var mdxLoaderOptions=async config=>(config.mdxCompileOptions.providerImportSource=path.join(path.dirname(__require.resolve("@storybook/addon-docs/package.json")),"/dist/shims/mdx-react-shim.mjs"),config);

exports.mdxLoaderOptions = mdxLoaderOptions;
Object.keys(preset).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return preset[k]; }
	});
});
