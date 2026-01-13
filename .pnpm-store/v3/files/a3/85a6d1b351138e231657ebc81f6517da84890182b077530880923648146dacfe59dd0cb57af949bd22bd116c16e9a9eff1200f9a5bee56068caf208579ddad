import { makeDecorator, addons } from 'storybook/internal/preview-api';
import { STORY_CHANGED, SELECT_STORY } from 'storybook/internal/core-events';
import 'storybook/internal/csf';
import { global } from '@storybook/global';

var PARAM_KEY="links";var{document,HTMLElement}=global;var navigate=params=>addons.getChannel().emit(SELECT_STORY,params);var linksListener=e=>{let{target}=e;if(!(target instanceof HTMLElement))return;let element=target,{sbKind:kind,sbStory:story}=element.dataset;(kind||story)&&(e.preventDefault(),navigate({kind,story}));},hasListener=!1,on=()=>{hasListener||(hasListener=!0,document.addEventListener("click",linksListener));},off=()=>{hasListener&&(hasListener=!1,document.removeEventListener("click",linksListener));},withLinks=makeDecorator({name:"withLinks",parameterName:PARAM_KEY,wrapper:(getStory,context)=>(on(),addons.getChannel().once(STORY_CHANGED,off),getStory(context))});var decorators=[withLinks];

export { decorators };
