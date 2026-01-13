'use strict';

var previewApi = require('storybook/internal/preview-api');
var instrumenter = require('@storybook/instrumenter');
require('@storybook/test');

var __defProp=Object.defineProperty;var __export=(target,all)=>{for(var name in all)__defProp(target,name,{get:all[name],enumerable:!0});};var preview_exports={};__export(preview_exports,{parameters:()=>parameters,runStep:()=>runStep});var runStep=instrumenter.instrument({step:(label,play,context)=>play(context)},{intercept:!0}).step,parameters={throwPlayFunctionExceptions:!1};var index_default=()=>previewApi.definePreview(preview_exports);

module.exports = index_default;
