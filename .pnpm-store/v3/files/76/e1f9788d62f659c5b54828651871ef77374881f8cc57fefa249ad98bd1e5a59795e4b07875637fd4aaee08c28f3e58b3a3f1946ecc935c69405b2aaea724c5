export { __definePreview } from './chunk-ZGTCCPPZ.mjs';
import { entry_preview_exports, renderToCanvas } from './chunk-TENYCC3B.mjs';
import './chunk-EWIU6LHT.mjs';
import './chunk-XP5HYGXS.mjs';
import { global } from '@storybook/global';
import * as React from 'react';
import { setDefaultProjectAnnotations, setProjectAnnotations as setProjectAnnotations$1, composeStory as composeStory$1, composeStories as composeStories$1 } from 'storybook/internal/preview-api';

var{window:globalWindow}=global;globalWindow&&(globalWindow.STORYBOOK_ENV="react");function setProjectAnnotations(projectAnnotations){return setDefaultProjectAnnotations(INTERNAL_DEFAULT_PROJECT_ANNOTATIONS),setProjectAnnotations$1(projectAnnotations)}var INTERNAL_DEFAULT_PROJECT_ANNOTATIONS={...entry_preview_exports,renderToCanvas:async(renderContext,canvasElement)=>{if(renderContext.storyContext.testingLibraryRender==null)return renderToCanvas(renderContext,canvasElement);let{storyContext:{context,unboundStoryFn:Story,testingLibraryRender:render}}=renderContext,{unmount}=render(React.createElement(Story,{...context}),{container:context.canvasElement});return unmount}};function composeStory(story,componentAnnotations,projectAnnotations,exportsName){return composeStory$1(story,componentAnnotations,projectAnnotations,globalThis.globalProjectAnnotations??INTERNAL_DEFAULT_PROJECT_ANNOTATIONS,exportsName)}function composeStories(csfExports,projectAnnotations){return composeStories$1(csfExports,projectAnnotations,composeStory)}typeof module<"u"&&module?.hot?.decline();

export { INTERNAL_DEFAULT_PROJECT_ANNOTATIONS, composeStories, composeStory, setProjectAnnotations };
