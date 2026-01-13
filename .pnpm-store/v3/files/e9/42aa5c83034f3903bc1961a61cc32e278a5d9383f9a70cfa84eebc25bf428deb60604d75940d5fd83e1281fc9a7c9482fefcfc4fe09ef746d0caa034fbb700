'use strict';

var coreEvents = require('storybook/internal/core-events');
var previewApi = require('storybook/internal/preview-api');
var global = require('@storybook/global');

var ADDON_ID="storybook/highlight",HIGHLIGHT_STYLE_ID="storybookHighlight",HIGHLIGHT=`${ADDON_ID}/add`,RESET_HIGHLIGHT=`${ADDON_ID}/reset`;var{document}=global.global,highlightStyle=(color="#FF4785",style="dashed")=>`
  outline: 2px ${style} ${color};
  outline-offset: 2px;
  box-shadow: 0 0 0 6px rgba(255,255,255,0.6);
`,channel=previewApi.addons.getChannel(),highlight=infos=>{let id=HIGHLIGHT_STYLE_ID;resetHighlight();let elements=Array.from(new Set(infos.elements)),sheet=document.createElement("style");sheet.setAttribute("id",id),sheet.innerHTML=elements.map(target=>`${target}{
          ${highlightStyle(infos.color,infos.style)}
         }`).join(" "),document.head.appendChild(sheet);},resetHighlight=()=>{let id=HIGHLIGHT_STYLE_ID,sheetToBeRemoved=document.getElementById(id);sheetToBeRemoved&&sheetToBeRemoved.parentNode?.removeChild(sheetToBeRemoved);};channel.on(coreEvents.STORY_CHANGED,resetHighlight);channel.on(RESET_HIGHLIGHT,resetHighlight);channel.on(HIGHLIGHT,highlight);
