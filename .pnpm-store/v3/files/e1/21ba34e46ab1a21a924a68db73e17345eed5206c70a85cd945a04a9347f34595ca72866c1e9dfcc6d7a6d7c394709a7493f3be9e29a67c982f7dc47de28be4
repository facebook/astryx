'use strict';

var React = require('react');
var coreEvents = require('storybook/internal/core-events');
var csf = require('storybook/internal/csf');
var previewApi = require('storybook/internal/preview-api');
var global = require('@storybook/global');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

var PARAM_KEY="links";var{document,HTMLElement}=global.global;function parseQuery(queryString){let query={},pairs=(queryString[0]==="?"?queryString.substring(1):queryString).split("&").filter(Boolean);for(let i=0;i<pairs.length;i++){let pair=pairs[i].split("=");query[decodeURIComponent(pair[0])]=decodeURIComponent(pair[1]||"");}return query}var navigate=params=>previewApi.addons.getChannel().emit(coreEvents.SELECT_STORY,params),hrefTo=(title,name)=>new Promise(resolve=>{let{location}=document,existingId=parseQuery(location.search).id,titleToLink=title||existingId.split("--",2)[0],path=`/story/${csf.toId(titleToLink,name)}`,sbPath=location.pathname.replace(/iframe\.html$/,""),url=`${location.origin+sbPath}?${Object.entries({path}).map(item=>`${item[0]}=${item[1]}`).join("&")}`;resolve(url);});var linksListener=e=>{let{target}=e;if(!(target instanceof HTMLElement))return;let element=target,{sbKind:kind,sbStory:story}=element.dataset;(kind||story)&&(e.preventDefault(),navigate({kind,story}));},hasListener=!1,on=()=>{hasListener||(hasListener=!0,document.addEventListener("click",linksListener));},off=()=>{hasListener&&(hasListener=!1,document.removeEventListener("click",linksListener));};previewApi.makeDecorator({name:"withLinks",parameterName:PARAM_KEY,wrapper:(getStory,context)=>(on(),previewApi.addons.getChannel().once(coreEvents.STORY_CHANGED,off),getStory(context))});var LEFT_BUTTON=0,isPlainLeftClick=e=>e.button===LEFT_BUTTON&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey,cancelled=(e,cb=_e=>{})=>{isPlainLeftClick(e)&&(e.preventDefault(),cb(e));},LinkTo=class extends React.PureComponent{constructor(){super(...arguments);this.state={href:"/"};this.updateHref=async()=>{let{kind,title=kind,story,name=story}=this.props;if(title&&name){let href=await hrefTo(title,name);this.setState({href});}};this.handleClick=()=>{let{kind,title=kind,story,name=story}=this.props;title&&name&&navigate({title,name});};}componentDidMount(){this.updateHref();}componentDidUpdate(prevProps){let{kind,title,story,name}=this.props;(prevProps.kind!==kind||prevProps.story!==story||prevProps.title!==title||prevProps.name!==name)&&this.updateHref();}render(){let{kind,title=kind,story,name=story,children,...rest}=this.props,{href}=this.state;return React__default.default.createElement("a",{href,onClick:e=>cancelled(e,this.handleClick),...rest},children)}};LinkTo.defaultProps={children:void 0};var react_default=LinkTo;

module.exports = react_default;
