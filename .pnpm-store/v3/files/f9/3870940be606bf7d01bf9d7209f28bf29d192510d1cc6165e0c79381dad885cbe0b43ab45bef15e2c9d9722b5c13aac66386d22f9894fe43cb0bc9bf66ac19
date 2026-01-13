import React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { ADDON_ID, PANEL_ID, PARAM_KEY, SNIPPET_RENDERED } from 'storybook/internal/docs-tools';
import { addons, types, useParameter, useChannel } from 'storybook/internal/manager-api';
import { useTheme, styled, ignoreSsrWarning } from 'storybook/internal/theming';
import { Source } from '@storybook/blocks';

addons.register(ADDON_ID,api=>{addons.add(PANEL_ID,{title:"Code",type:types.PANEL,paramKey:PARAM_KEY,disabled:parameters=>!parameters?.docs?.codePanel,match:({viewMode})=>viewMode==="story",render:({active})=>{let parameter=useParameter(PARAM_KEY,{source:{code:""},theme:"dark"}),[codeSnippet,setSourceCode]=React.useState({});useChannel({[SNIPPET_RENDERED]:({source,format})=>{setSourceCode({source,format});}});let isDark=useTheme().base!=="light";return React.createElement(AddonPanel,{active:!!active},React.createElement(SourceStyles,null,React.createElement(Source,{...parameter.source,code:parameter.source.code||codeSnippet.source,format:parameter.source.format||codeSnippet.format,dark:isDark})))}});});var SourceStyles=styled.div(()=>({height:"100%",[`> :first-child${ignoreSsrWarning}`]:{margin:0,height:"100%",boxShadow:"none"}}));
