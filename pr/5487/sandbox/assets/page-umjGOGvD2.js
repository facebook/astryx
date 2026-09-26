import{J as e,Z as t,q as n}from"./padding.stylex-C-GcuG1E.js";import{t as r}from"./Text-CTLH6SQs.js";import{t as i}from"./useMediaQuery-B4G481FR.js";import{t as a}from"./Icon-ChU1PKYl.js";import{t as o}from"./Heading-DKPTHgEU.js";import{t as s}from"./Button-DTeOy9lq.js";import{n as c,t as l}from"./LayoutContent-Bxqq0ePR.js";import{t as u}from"./ListItem-BcUrKUW3.js";import{t as d}from"./List-w_56QLOu.js";import{t as f}from"./StackItem-DR9d8ING.js";import{N as p,_ as m,bt as h,ft as g,g as _,h as v,j as y,pt as b}from"./index-YE218alC.js";import{t as x}from"./TextInput-BCUbZbPG.js";import{r as S,t as C}from"./Tab-ZLZxL99-.js";import{t as w}from"./DocumentTextIcon-DJbUARAn.js";import{t as T}from"./FolderIcon-DyiDG-gm.js";import{t as E}from"./MagnifyingGlassIcon-D149ixAy.js";import{n as D,t as O}from"./MetadataListItem-DxlCdKD5.js";var k=t(e(),1),A=n(),j={contentFill:{height:`100%`},terminalWrapper:{minHeight:0,overflow:`hidden`,display:`grid`},tabListPadding:{paddingTop:`var(--spacing-2)`},metadataCompact:{gap:`var(--spacing-1) var(--spacing-3)`},historyTimelineDot:{width:8,height:8,borderRadius:`50%`,backgroundColor:`var(--color-border-emphasized)`,marginTop:6,flexShrink:0},editorArea:{overflow:`auto`,minHeight:0},fileExplorer:{padding:16,minWidth:0},propertiesPanel:{height:`100%`},propertiesContent:{flex:1,minHeight:0},propertyActions:{marginTop:`auto`},terminalPanel:{flexShrink:0,overflow:`hidden`}},M=`import {useState, useCallback} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Text} from '@astryxdesign/core/Text';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  padding: 16,
};
const counterStyle = {
  fontSize: 48,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums',
};

export default function Counter() {
  const [count, setCount] = useState(0);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setCount(0);
  }, []);

  return (
    <div style={containerStyle}>
      <Text type="label">Counter</Text>
      <span style={counterStyle}>
        {count}
      </span>
      <Button label="Increment" onClick={increment} />
      <Button label="Reset" variant="secondary" onClick={reset} />
    </div>
  );
}`,N=`$ yarn dev
yarn run v1.22.22
$ next dev
   ▲ Next.js 15.5.15
   - Local:   http://localhost:3000

 ✓ Ready in 2.4s
 ○ Compiling /counter ...
 ✓ Compiled /counter in 1.2s (847 modules)
 GET /counter 200 in 1340ms

$ `;function P(e){let t=e=>(0,A.jsx)(r,{maxLines:1,children:e}),n=n=>({id:n,label:t(n),startContent:(0,A.jsx)(a,{icon:w,size:`xsm`}),onClick:()=>e(n)});return[{id:`src`,label:t(`src`),startContent:(0,A.jsx)(a,{icon:T,size:`xsm`}),isExpanded:!0,children:[{id:`components`,label:t(`components`),startContent:(0,A.jsx)(a,{icon:T,size:`xsm`}),isExpanded:!0,children:[n(`Counter.tsx`),n(`Header.tsx`),n(`Layout.tsx`)]},{id:`pages`,label:t(`pages`),startContent:(0,A.jsx)(a,{icon:T,size:`xsm`}),isExpanded:!0,children:[n(`index.tsx`),n(`about.tsx`)]},{id:`styles`,label:t(`styles`),startContent:(0,A.jsx)(a,{icon:T,size:`xsm`}),isExpanded:!0,children:[n(`tokens.ts`),n(`theme.ts`)]}]},n(`package.json`),n(`tsconfig.json`),n(`next.config.mjs`)]}var F=[{label:`Type`,value:`React Component`},{label:`Language`,value:`TypeScript`},{label:`Lines`,value:`42`},{label:`Size`,value:`1.2 KB`},{label:`Last modified`,value:`2 hours ago`},{label:`Imports`,value:`4 modules`},{label:`Exports`,value:`1 default`},{label:`Hooks`,value:`useState, useCallback`}],I=[{label:`Opened Counter.tsx`,time:`2 min ago`},{label:`Opened Layout.tsx`,time:`6 min ago`},{label:`Viewed tokens.ts`,time:`11 min ago`}];function L(){let[e,t]=(0,k.useState)(`Counter.tsx`),[n,a]=(0,k.useState)(`terminal`),[w,T]=(0,k.useState)(`properties`),L=(0,k.useMemo)(()=>P(t),[]),R=b({defaultSize:256,minSize:160,maxSize:400,collapsible:!0,collapsedSize:50}),z=b({defaultSize:320,minSize:180,maxSize:500,collapsible:!0,collapsedSize:50}),B=b({defaultSize:300,minSize:80,maxSize:1/0,direction:`vertical`,collapsible:!0,collapsedSize:40}),V=i(`(max-width: 768px)`);return(0,A.jsx)(c,{height:`fill`,content:(0,A.jsx)(l,{padding:0,children:(0,A.jsx)(c,{height:`fill`,start:V?void 0:(0,A.jsxs)(A.Fragment,{children:[!R.isCollapsed&&(0,A.jsx)(h,{width:R.size,hasDivider:!1,padding:0,children:(0,A.jsxs)(y,{direction:`vertical`,style:j.fileExplorer,gap:2,children:[(0,A.jsx)(x,{label:`Search files`,isLabelHidden:!0,value:``,placeholder:`Search`,size:`md`,startIcon:E}),(0,A.jsx)(v,{items:L,density:`compact`})]})}),(0,A.jsx)(g,{direction:`horizontal`,hasDivider:!0,isAlwaysVisible:!1,resizable:R.props,label:`Resize file explorer`})]}),content:(0,A.jsx)(l,{padding:0,children:(0,A.jsx)(c,{height:`fill`,content:(0,A.jsx)(l,{padding:0,children:(0,A.jsxs)(y,{direction:`vertical`,style:j.contentFill,children:[(0,A.jsx)(f,{size:`fill`,style:j.editorArea,children:(0,A.jsx)(p,{code:M,language:`typescript`,container:`section`,hasLanguageLabel:!1,hasLineNumbers:!0,highlightLines:[21],hasCopyButton:!1,size:`sm`,style:{width:`100%`,height:`100%`,borderWidth:0,borderRadius:0}})}),(0,A.jsx)(g,{direction:`vertical`,hasDivider:!0,isReversed:!0,isAlwaysVisible:!1,resizable:B.props,label:`Resize terminal`}),!B.isCollapsed&&(0,A.jsxs)(y,{direction:`vertical`,height:B.size,style:j.terminalPanel,children:[(0,A.jsxs)(S,{value:n,onChange:e=>a(e),size:`sm`,hasDivider:!1,style:j.tabListPadding,children:[(0,A.jsx)(C,{label:`Terminal`,value:`terminal`}),(0,A.jsx)(C,{label:`Problems`,value:`problems`}),(0,A.jsx)(C,{label:`Output`,value:`output`}),(0,A.jsx)(C,{label:`Debug`,value:`debug`})]}),(0,A.jsx)(f,{size:`fill`,style:j.terminalWrapper,children:(0,A.jsx)(p,{code:N,language:`bash`,container:`section`,hasLanguageLabel:!1,hasCopyButton:!1,size:`sm`,style:{width:`100%`,height:`100%`,borderWidth:0,borderRadius:0}})})]})]})}),end:V?void 0:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(g,{direction:`horizontal`,hasDivider:!0,isReversed:!0,isAlwaysVisible:!1,resizable:z.props,label:`Resize properties panel`}),!z.isCollapsed&&(0,A.jsx)(h,{width:z.size,hasDivider:!1,padding:4,children:(0,A.jsxs)(y,{direction:`vertical`,gap:3,style:j.propertiesPanel,children:[(0,A.jsxs)(m,{label:`Properties panel sections`,value:w,onChange:T,size:`sm`,layout:`fill`,children:[(0,A.jsx)(_,{label:`Properties`,value:`properties`}),(0,A.jsx)(_,{label:`History`,value:`history`})]}),w===`properties`?(0,A.jsxs)(y,{direction:`vertical`,gap:3,style:j.propertiesContent,children:[(0,A.jsxs)(y,{direction:`vertical`,gap:1,children:[(0,A.jsx)(o,{level:3,maxLines:1,children:e}),(0,A.jsxs)(r,{color:`secondary`,type:`supporting`,maxLines:1,children:[`src/components/`,e]})]}),(0,A.jsx)(D,{style:j.metadataCompact,children:F.map(e=>(0,A.jsx)(O,{label:e.label,children:e.value},e.label))}),(0,A.jsxs)(y,{direction:`vertical`,gap:2,style:j.propertyActions,children:[(0,A.jsx)(s,{label:`Format Document`,size:`sm`,variant:`secondary`}),(0,A.jsx)(s,{label:`Go to Definition`,size:`sm`,variant:`secondary`}),(0,A.jsx)(s,{label:`Find References`,size:`sm`,variant:`secondary`})]})]}):(0,A.jsx)(y,{direction:`vertical`,gap:1,children:(0,A.jsx)(d,{children:I.map(e=>(0,A.jsx)(u,{label:e.label,endContent:(0,A.jsx)(r,{type:`supporting`,color:`secondary`,maxLines:1,children:e.time}),startContent:(0,A.jsx)(`span`,{style:j.historyTimelineDot})},e.label))})})]})})]})})})})})})}export{L as default};