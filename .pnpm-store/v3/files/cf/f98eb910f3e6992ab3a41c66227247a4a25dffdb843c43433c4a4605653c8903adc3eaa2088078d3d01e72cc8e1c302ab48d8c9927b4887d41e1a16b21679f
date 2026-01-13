import React, { useCallback, useEffect } from 'react';
import { addons, types, useGlobals, useStorybookApi } from 'storybook/internal/manager-api';
import { IconButton } from 'storybook/internal/components';
import { RulerIcon } from '@storybook/icons';

var ADDON_ID="storybook/measure-addon",TOOL_ID=`${ADDON_ID}/tool`;var Tool=()=>{let[globals,updateGlobals]=useGlobals(),{measureEnabled}=globals,api=useStorybookApi(),toggleMeasure=useCallback(()=>updateGlobals({measureEnabled:!measureEnabled}),[updateGlobals,measureEnabled]);return useEffect(()=>{api.setAddonShortcut(ADDON_ID,{label:"Toggle Measure [M]",defaultShortcut:["M"],actionName:"measure",showInMenu:!1,action:toggleMeasure});},[toggleMeasure,api]),React.createElement(IconButton,{key:TOOL_ID,active:measureEnabled,title:"Enable measure",onClick:toggleMeasure},React.createElement(RulerIcon,null))};addons.register(ADDON_ID,()=>{addons.add(TOOL_ID,{type:types.TOOL,title:"Measure",match:({viewMode,tabId})=>viewMode==="story"&&!tabId,render:()=>React.createElement(Tool,null)});});
