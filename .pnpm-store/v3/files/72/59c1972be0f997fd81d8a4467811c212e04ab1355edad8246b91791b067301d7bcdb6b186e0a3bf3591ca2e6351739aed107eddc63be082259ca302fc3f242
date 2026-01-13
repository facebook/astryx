'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var previewApi = require('storybook/internal/preview-api');
var coreEvents = require('storybook/internal/core-events');
var csf = require('storybook/internal/csf');
var global = require('@storybook/global');

var __defProp=Object.defineProperty;var __export=(target,all)=>{for(var name in all)__defProp(target,name,{get:all[name],enumerable:!0});};var preview_exports={};__export(preview_exports,{decorators:()=>decorators});var decorators=[withLinks];var PARAM_KEY="links";var{document,HTMLElement}=global.global;function parseQuery(queryString){let query={},pairs=(queryString[0]==="?"?queryString.substring(1):queryString).split("&").filter(Boolean);for(let i=0;i<pairs.length;i++){let pair=pairs[i].split("=");query[decodeURIComponent(pair[0])]=decodeURIComponent(pair[1]||"");}return query}var navigate=params=>previewApi.addons.getChannel().emit(coreEvents.SELECT_STORY,params),hrefTo=(title,name)=>new Promise(resolve=>{let{location}=document,existingId=parseQuery(location.search).id,titleToLink=title||existingId.split("--",2)[0],path=`/story/${csf.toId(titleToLink,name)}`,sbPath=location.pathname.replace(/iframe\.html$/,""),url=`${location.origin+sbPath}?${Object.entries({path}).map(item=>`${item[0]}=${item[1]}`).join("&")}`;resolve(url);}),valueOrCall=args=>value=>typeof value=="function"?value(...args):value,linkTo=(idOrTitle,nameInput)=>(...args)=>{let resolver=valueOrCall(args),title=resolver(idOrTitle),name=nameInput?resolver(nameInput):!1;title?.match(/--/)&&!name?navigate({storyId:title}):name&&title?navigate({kind:title,story:name}):title?navigate({kind:title}):name&&navigate({story:name});},linksListener=e=>{let{target}=e;if(!(target instanceof HTMLElement))return;let element=target,{sbKind:kind,sbStory:story}=element.dataset;(kind||story)&&(e.preventDefault(),navigate({kind,story}));},hasListener=!1,on=()=>{hasListener||(hasListener=!0,document.addEventListener("click",linksListener));},off=()=>{hasListener&&(hasListener=!1,document.removeEventListener("click",linksListener));},withLinks=previewApi.makeDecorator({name:"withLinks",parameterName:PARAM_KEY,wrapper:(getStory,context)=>(on(),previewApi.addons.getChannel().once(coreEvents.STORY_CHANGED,off),getStory(context))});var index_default=()=>previewApi.definePreview(preview_exports);

exports.default = index_default;
exports.hrefTo = hrefTo;
exports.linkTo = linkTo;
exports.navigate = navigate;
exports.withLinks = withLinks;
