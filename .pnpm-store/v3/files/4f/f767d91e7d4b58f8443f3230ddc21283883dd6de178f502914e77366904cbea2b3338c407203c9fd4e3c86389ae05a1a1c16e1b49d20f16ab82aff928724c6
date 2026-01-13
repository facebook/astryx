'use strict';

var previewApi = require('storybook/internal/preview-api');
var coreEvents = require('storybook/internal/core-events');
require('storybook/internal/csf');
var global = require('@storybook/global');

var PARAM_KEY="links";var{document,HTMLElement}=global.global;var navigate=params=>previewApi.addons.getChannel().emit(coreEvents.SELECT_STORY,params);var linksListener=e=>{let{target}=e;if(!(target instanceof HTMLElement))return;let element=target,{sbKind:kind,sbStory:story}=element.dataset;(kind||story)&&(e.preventDefault(),navigate({kind,story}));},hasListener=!1,on=()=>{hasListener||(hasListener=!0,document.addEventListener("click",linksListener));},off=()=>{hasListener&&(hasListener=!1,document.removeEventListener("click",linksListener));},withLinks=previewApi.makeDecorator({name:"withLinks",parameterName:PARAM_KEY,wrapper:(getStory,context)=>(on(),previewApi.addons.getChannel().once(coreEvents.STORY_CHANGED,off),getStory(context))});var decorators=[withLinks];

exports.decorators = decorators;
