import React, { memo, useCallback, useEffect } from 'react';
import { useGlobals, useStorybookApi, addons, types } from 'storybook/internal/manager-api';
import { IconButton } from 'storybook/internal/components';
import { OutlineIcon } from '@storybook/icons';

var ADDON_ID="storybook/outline",PARAM_KEY="outline";var OutlineSelector=memo(function(){let[globals,updateGlobals]=useGlobals(),api=useStorybookApi(),isActive=[!0,"true"].includes(globals[PARAM_KEY]),toggleOutline=useCallback(()=>updateGlobals({[PARAM_KEY]:!isActive}),[isActive]);return useEffect(()=>{api.setAddonShortcut(ADDON_ID,{label:"Toggle Outline",defaultShortcut:["alt","O"],actionName:"outline",showInMenu:!1,action:toggleOutline});},[toggleOutline,api]),React.createElement(IconButton,{key:"outline",active:isActive,title:"Apply outlines to the preview",onClick:toggleOutline},React.createElement(OutlineIcon,null))});addons.register(ADDON_ID,()=>{addons.add(ADDON_ID,{title:"Outline",type:types.TOOL,match:({viewMode,tabId})=>!!(viewMode&&viewMode.match(/^(story|docs)$/))&&!tabId,render:()=>React.createElement(OutlineSelector,null)});});
