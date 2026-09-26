import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{t as i}from"./Text-BXEuttRu.js";import{t as a}from"./Button-BPD_GmpK.js";import{t as o}from"./Button-CIR94wUk.js";import{t as s}from"./Text-CRXEW_aT.js";import{i as c,t as l}from"./Link-CP7lu01Y.js";import{Br as u,Fr as d,Gr as f,Hr as p,Ir as m,Jr as ee,Kr as te,Rr as ne,Ur as re,Vr as ie,Wr as ae,Xr as oe,Yr as se,qr as ce,zr as le}from"./iframe-C7baUxNR.js";function ue(e,t){if(typeof e!=`object`||!e)return e;let n=t?.get(e);if(n!=null)return n;if(Array.isArray(e)){let n=[];t??=new Map,t.set(e,n);for(let r of e)n.push(ue(r,t));return n}if(Object.getPrototypeOf(e)!==Object.prototype)return e;let r={},i=t;for(let t in e){let n=e[t];typeof n==`object`&&n?(i===void 0&&(i=new Map,i.set(e,r)),r[t]=ue(n,i)):r[t]=n}return r}function de(e,t,n){if(!n||t>=e.length)return t+1;let r=e.charCodeAt(t);if(r<55296||r>56319||t+1>=e.length)return t+1;let i=e.charCodeAt(t+1);return i>=56320&&i<=57343?t+2:t+1}function fe(e,t,n,r,i){let a=t.pattern.ignoreCase?void 0:t.requiredSubstrings;if(a!=null&&!a.some(t=>e.includes(t)))return null;let o=i.busy?new RegExp(t.pattern.source,t.pattern.flags):i.pattern,s=o!==i.pattern;s||(i.busy=!0),o.lastIndex=0;let c=[],l=0,d=!1,f;for(;(f=o.exec(e))!=null;){let i=f.index,a=i+f[0].length,s=t.getEndIndex?.(e,f)??a;if(s===!1){f[0].length===0&&(o.lastIndex=de(e,o.lastIndex,o.unicode||o.flags.includes(`v`)));continue}if(!Number.isInteger(s)||s<a||s<i||s>e.length)throw TypeError(`Markdown text transform returned an invalid end index`);if(i<l)continue;i>l&&c.push({type:`text`,value:e.slice(l,i)});let p=t.replace(f,{parentType:n});if(Array.isArray(p)){let e=[];for(let t of p)e.push(h.has(t)?ue(t):t);ie(e,r);for(let t of e)h.add(t);c.push(...e)}else{let e=p,t=h.has(e)?ue(e):e;u(t,r),h.add(t),c.push(t)}l=s,o.lastIndex=s===i?de(e,o.lastIndex,o.unicode||o.flags.includes(`v`)):Math.max(o.lastIndex,s),d=!0}return s||(i.busy=!1),d?(l<e.length&&c.push({type:`text`,value:e.slice(l)}),c):null}function pe(e,t,n,r,i){let a;for(let o=0;o<e.length;o++){let s=e[o];if(s.type===`text`){let c=fe(s.value,t,n,r,i);if(c==null){a?.push(s);continue}a??=e.slice(0,o);for(let e of c)a.push(e);continue}if(s.type===`strong`||s.type===`emphasis`||s.type===`delete`){let n=pe(s.children,t,s.type,r,i);if(n===s.children){a?.push(s);continue}a??=e.slice(0,o),a.push({...s,children:n});continue}a?.push(s)}return a??e}function me(e,t,n){let r=n.requiredSubstrings;if(t===void 0||r===void 0)return!0;let i=e.position?.start.offset,a=e.position?.end.offset;if(typeof i!=`number`||typeof a!=`number`)return!0;for(let e of r){let n=t.indexOf(e,i);if(n>=0&&n<a)return!0}return!1}function he(e,t,n,r,i){let a;for(let o=0;o<e.length;o++){let s=e[o];if(!me(s,i,t)){a?.push(s);continue}let c;switch(s.type){case`heading`:case`paragraph`:{let e=pe(s.children,t,s.type,n,r);c=e===s.children?s:{...s,children:e};break}case`blockquote`:{let e=he(s.children,t,n,r,i);c=e===s.children?s:{...s,children:e};break}case`list`:{let e;for(let a=0;a<s.children.length;a++){let o=s.children[a],c=he(o.children,t,n,r,i);if(c===o.children){e?.push(o);continue}e??=s.children.slice(0,a),e.push({...o,children:c})}c=e==null?s:{...s,children:e};break}case`table`:{let e;for(let i=0;i<s.children.length;i++){let a=s.children[i],o;for(let e=0;e<a.children.length;e++){let i=a.children[e],s=pe(i.children,t,`tableCell`,n,r);if(s===i.children){o?.push(i);continue}o??=a.children.slice(0,e),o.push({...i,children:s})}if(o==null){e?.push(a);continue}e??=s.children.slice(0,i),e.push({...a,children:o})}c=e==null?s:{...s,children:e};break}case`code`:case`math`:case`image`:case`thematicBreak`:case`extension`:c=s;break}a===void 0&&c!==s&&(a=e.slice(0,o)),a?.push(c)}return a??e}function ge(e){if(!e.pattern.global)throw TypeError(`Markdown text transform patterns must use the global flag`);if(e.requiredSubstrings!=null&&(!Array.isArray(e.requiredSubstrings)||e.requiredSubstrings.length===0||e.requiredSubstrings.some(e=>typeof e!=`string`||e===``)))throw TypeError(`Markdown text transform requiredSubstrings must be non-empty strings`);let t=e.requiredSubstrings==null?void 0:Object.freeze([...e.requiredSubstrings]),n=Object.freeze({pattern:new RegExp(e.pattern.source,e.pattern.flags),requiredSubstrings:t,getEndIndex:e.getEndIndex,replace:e.replace}),r=ee((e,r)=>{let i=ae(r)??_e,a=he(e.children,n,i,{pattern:new RegExp(n.pattern.source,n.pattern.flags),busy:!1},i.sourceUnchanged&&t!=null&&!n.pattern.ignoreCase?r.source:void 0);return a===e.children?e:{...e,children:a}});return t==null||e.pattern.ignoreCase?r:ce(r,e=>t.some(t=>e.includes(t)))}var _e,h,ve=e((()=>{f(),_e=Object.freeze({pluginName:`\0unowned`,hasRenderer:()=>!1,sourceUnchanged:!1}),h=new WeakSet}));function ye(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function be(e){if(typeof e!=`object`||!e)return e;if(Array.isArray(e))return Object.freeze(e.map(be));let t={};for(let[n,r]of Object.entries(e))t[n]=be(r);return Object.freeze(t)}function xe(e){throw TypeError(`Markdown source decoration: ${e}`)}function Se(e,t){let n=[],r=new Set;for(let i of t){(!Number.isInteger(i.start)||!Number.isInteger(i.end)||i.start<0||i.end<=i.start)&&xe(`ranges must be ordered, non-empty, non-negative UTF-16 offsets`),i.data!==void 0&&!te(i.data)&&xe(`range data must be finite JSON-like plugin data`);let t=i.data===void 0?void 0:be(i.data),a=`${i.start}\u0000${i.end}\u0000${t===void 0?``:JSON.stringify(t)}`;r.has(a)||(r.add(a),n.push({start:i.start,end:i.end,entry:Object.freeze(t===void 0?{name:e}:{name:e,data:t}),key:a}))}return n.sort((e,t)=>e.start-t.start||e.end-t.end||(e.key<t.key?-1:+(e.key>t.key))),Object.freeze(n.map(({start:e,end:t,entry:n})=>Object.freeze({start:e,end:t,entry:n})))}function g(e){if(e===void 0)return-1;let t=e.start.offset,n=e.end.offset;return typeof t==`number`&&typeof n==`number`&&t>=0&&n>=t?t:-1}function Ce(e){if(e===void 0)return;if(!ye(e))return null;let t=e[Pe];if(t!==void 0)return!ye(t)||t.kind!==Fe||t.version!==Ie||!Array.isArray(t.entries)||!t.entries.every(we)?null:t.entries}function we(e){return ye(e)&&typeof e.name==`string`}function Te(e){return{kind:Fe,version:Ie,entries:e}}function Ee(e){e.hasReported||(e.hasReported=!0,e.report(`skipped a node whose data is not a Core-owned source-decoration envelope`))}function De(e,t,n){let r=Ce(e.data);if(r===null){Ee(n);return}let i=Te(r===void 0?t:[...r,...t]);return e.data===void 0?{[Pe]:i}:{...e.data,[Pe]:i}}function Oe(e){let t=-1;for(let n=0;n<e.length;n++){let r=g(e[n].position);if(!(r<0)){if(r<t){let t=[];for(let n=0;n<e.length;n++)g(e[n].position)>=0&&t.push(n);return t.sort((t,n)=>g(e[t].position)-g(e[n].position)||t-n),t}t=r}}}function ke(e,t,n,r){let i=0,a=n;for(;i<a;){let n=i+a>>>1,o=e[t?.[n]??n].position?.end.offset;typeof o==`number`&&o<=r?i=n+1:a=n}return i}function Ae(e,t,n){let r=Oe(e),i=r?.length??e.length,a,o=0,s=[],c=r===void 0?ke(e,r,i,t[0].start):0;for(;c<i&&!(o>=t.length&&s.length===0);c++){let l=r?.[c]??c,u=e[l],d=g(u.position);if(d<0)continue;let f=u.position?.end.offset;for(;o<t.length&&t[o].start<f;)s.push(t[o++]);let p=0;for(let e=0;e<s.length;e++)s[e].end>d&&(s[p++]=s[e]);if(s.length=p,p===0){if(r===void 0&&o<t.length&&t[o].start>f){let n=ke(e,r,i,t[o].start);n>c&&(c=n-1)}continue}let m=je(u,s,n);m!==u&&(a??=e.slice(),a[l]=m)}return a??e}function je(e,t,n){if(e.type===`extension`)return e;let r=De(e,t.map(e=>e.entry),n);return r===void 0?e:{...e,data:r}}function Me(e){(typeof e.name!=`string`||e.name.trim()===``)&&xe(`name must be a non-empty string`),Array.isArray(e.ranges)||xe(`ranges must be an array`);let t=Se(e.name,e.ranges),n=t.length===0?-1:t[0].start;return ee(ce((e,n)=>{if(!n.isFinal||t.length===0)return e;let r=t[t.length-1].start<n.source.length?t:t.filter(e=>e.start<n.source.length);if(r.length===0)return e;let i=e;if(i.children==null)return e;let a=Ae(i.children,r,{report:e=>n.report(e),hasReported:!1});return a===i.children?e:{...e,children:a}},e=>n>=0&&e.length>n))}function Ne(e){let t=Ce(e.data);return t==null||t.length===0?Le:t}var Pe,Fe,Ie,Le,Re=e((()=>{f(),Pe=`astryx:sourceDecorations`,Fe=`astryx.markdown.sourceDecorations`,Ie=1,Le=Object.freeze([])}));function ze(e){return typeof e==`object`&&e&&!Array.isArray(e)?e:{}}function Be(e){if(typeof e!=`object`||!e||Array.isArray(e))return;let t=e;return t.brand===We&&t.version===Ge&&t.values!=null&&typeof t.values==`object`&&!Array.isArray(t.values)?t:void 0}function Ve(e){let t=e.startsWith(`---\r
`)?5:e.startsWith(`---
`)?4:0;if(t===0)return{status:`none`};let n=e.slice(t),r=/(?:^|\r?\n)---(?=\r?\n|$)/.exec(n);if(r==null)return{status:`defer`};let i=Object.create(null);for(let e of n.slice(0,r.index).split(/\r?\n/)){if(e.trim()===``)continue;let t=e.indexOf(`:`),n=e.slice(0,t).trim();if(t<=0||n===``||Object.hasOwn(i,n))return{status:`none`};i[n]=e.slice(t+1).trim()}let a=t+r.index+r[0].length;return e.startsWith(`\r
`,a)?a+=2:e[a]===`
`&&(a+=1),{status:`match`,end:a,fields:Object.freeze(i)}}function He(e){if(e.name.trim()===``)throw TypeError(`Markdown frontmatter name must be non-empty`);let t=e.name,n=(t,n=!0)=>{let r=Ve(t);if(r.status===`defer`)return n?{status:`none`}:r;if(r.status===`none`)return r;let i=e.parse(r.fields);if(!te(i))throw TypeError(`Markdown frontmatter metadata must be finite JSON-like data`);return{status:`match`,contentStart:r.end,metadata:re(i)}},r=p({name:t,apiVersion:1,transform:ee((e,r)=>{let i=n(r.source,r.isFinal);if(i.status===`none`)return e;if(i.status===`defer`)return{...e,children:[]};let a=ze(e.data),o=Be(a[Ue]),s=Object.freeze({brand:We,version:Ge,values:Object.freeze({...o?.values,[t]:i.metadata})});return{...e,data:Object.freeze({...a,[Ue]:s}),children:e.children.filter(e=>(e.position?.end.offset??1/0)>i.contentStart)}})});return Object.freeze({plugin:r,parse:n,getMetadata(e){return Be(ze(e.data)[Ue])?.values[t]}})}var Ue,We,Ge,Ke=e((()=>{f(),Ue=`astryx:frontmatter`,We=`astryx.markdown.frontmatter`,Ge=1})),qe=e((()=>{f(),ve(),le(),Re(),Ke()}));function Je(e,t){let n=!1,r=new Promise(e=>{setTimeout(()=>{n=!0,e()},t)});return{read(){if(!n)throw r;return e}}}function Ye({label:e}){return(0,_.jsxs)(`mark`,{children:[`@`,e.read()]})}function Xe(e=3e3){let t=new Map;return p({...Qe,renderers:{mention:{render:({node:n})=>{let r=t.get(n.data.label);return r??(r=Je(n.data.label,e),t.set(n.data.label,r)),(0,_.jsx)(Ye,{label:r})},toText:e=>`@${e.data.label}`}}})}function Ze(e,t){let n=e.indexOf(t),r=[];return{plugins:[p({name:`demo-search-hits`,apiVersion:1,transform:Me({name:`search-hit`,ranges:n<0?[]:[{start:n,end:n+t.length,data:{query:t}}]})}),p({name:`demo-decoration-readout`,apiVersion:1,transform(e){return r.length=0,e.children.forEach((e,t)=>{for(let n of Ne(e))r.push(`block ${t} (${e.type}) — ${n.name}`)}),e}})],readout:r}}var _,Qe,$e,et,tt,nt,rt,v,it=e((()=>{qe(),_=r(),Qe={name:`demo-mentions`,apiVersion:1,parseKey:`v1`,syntax:{inline:[{startsWith:[`@{`],maxSpan:80,tokenize({source:e,offset:t,end:n,isFinal:r}){let i=e.indexOf(`}`,t+2);return i<0||i>=n?r?{status:`no-match`}:{status:`defer`}:{status:`match`,end:i+1,node:{type:`extension`,plugin:`demo-mentions`,name:`mention`,display:`inline`,data:{label:e.slice(t+2,i)}}}}}]},renderers:{mention:{render:({node:e})=>(0,_.jsxs)(`mark`,{children:[`@`,e.data.label]}),toText:e=>`@${e.data.label}`}}},$e={name:`demo-callouts`,apiVersion:1,parseKey:`v1`,syntax:{block:[{startsWith:[`:::note`],maxSpan:500,tokenize({source:e,offset:t,end:n,isFinal:r}){let i=e.indexOf(`
:::`,t+7);return i<0||i+4>n?r?{status:`no-match`}:{status:`defer`}:{status:`match`,end:i+4,node:{type:`extension`,plugin:`demo-callouts`,name:`callout`,display:`block`,data:{body:e.slice(t+7,i).trim()}}}}}]},renderers:{callout:{render:({node:e})=>(0,_.jsx)(`aside`,{role:`note`,"aria-label":`Note`,children:e.data.body}),toText:e=>e.data.body}}},et=p({name:`demo-todos`,apiVersion:1,transform:ge({pattern:/\bTODO\b/g,requiredSubstrings:[`TODO`],replace:()=>({type:`extension`,plugin:`demo-todos`,name:`todo`,display:`inline`,data:{label:`TODO`}})}),renderers:{todo:{render:({node:e})=>(0,_.jsx)(`mark`,{children:e.data.label}),toText:e=>e.data.label}}}),tt=p({name:`demo-semantic-fences`,apiVersion:1,transform:ne({languages:[`diagram`],createNode:({code:e,meta:t})=>({type:`extension`,plugin:`demo-semantic-fences`,name:`diagram`,display:`block`,data:{code:e,...t==null?{}:{label:t}}})}),renderers:{diagram:{render:({node:e})=>(0,_.jsxs)(`figure`,{"aria-label":e.data.label??`Workflow diagram`,children:[(0,_.jsx)(`figcaption`,{children:e.data.label??`Workflow diagram`}),(0,_.jsx)(`pre`,{children:e.data.code})]}),toText:e=>e.data.code}}}),nt=tt,rt=He({name:`demo-document-metadata`,parse:e=>({title:e.title??`Untitled`,status:e.status??`unknown`})}),v=[p(Qe),p($e),et]}));function at(){return{failed:!1,reason:null}}function y(e){E!=null&&!E.failed&&(E.failed=!0,E.reason=e);let t=new Bt(e);throw Vt.set(t,e),t}function ot(e,t){let n=E;E=e;try{return t()}finally{E=n}}function st(e){if(typeof e!=`object`&&typeof e!=`function`||e===null)return!1;let t;try{t=e.then}catch{return!0}if(typeof t!=`function`)return!1;try{t.call(e,()=>{},()=>{})}catch{}return!0}function b(e){return typeof e==`string`&&(Object.prototype.hasOwnProperty.call(w,e)||Rt.has(e))?e:`unknown`}function ct(e){let t=typeof e==`symbol`?`unknown`:e;return D.has(t)||zt.has(t)?t:`unknown`}function lt(e,t){return t===`position`||t===`data`||t===`type`||Nt.includes(t)||(w[e]?.includes(t)??!1)?t:`unknown`}function x(e){if(typeof e!=`object`||!e||Array.isArray(e))return!1;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null}function ut(e,t){if(!x(e)||!x(t))return!1;for(let n of[e,t])for(let e of Object.keys(n))if(!Ht.includes(e))return!1;return Ht.every(n=>e[n]===t[n])}function dt(e,t){if(e===void 0||t===void 0)return e===t;if(!x(e)||!x(t))return!1;for(let n of[e,t])for(let e of Object.keys(n))if(!Ut.includes(e))return!1;return ut(e.start,t.start)&&ut(e.end,t.end)}function ft(e){if(!x(e))return;let t={};return typeof e.line==`number`&&(t.line=e.line),typeof e.column==`number`&&(t.column=e.column),typeof e.offset==`number`&&(t.offset=e.offset),t}function pt(e){if(!x(e))return;let t=ft(e.start),n=ft(e.end);return t==null||n==null?void 0:{start:t,end:n}}function mt(e){if(Array.isArray(e)){let t=[];for(let n of e)t.push(mt(n));return t}if(x(e)){let t={};for(let[n,r]of Object.entries(e))t[n]=mt(r);return t}return e}function ht(e,t){if(e===t)return!0;if(Array.isArray(e)&&Array.isArray(t))return e.length===t.length&&e.every((e,n)=>ht(e,t[n]));if(x(e)&&x(t)){let n=Object.keys(e),r=Object.keys(t);return n.length===r.length&&n.every(n=>n in t&&ht(e[n],t[n]))}return!1}function gt(){return{all:new Set}}function _t(e,t){t.all.add(e)}function S(e,t){return Array.isArray(e)?e.map(e=>vt(e,t)):[]}function vt(e,t){_t(e,t);let n={type:e.type};switch(e.type){case`root`:case`paragraph`:case`blockquote`:case`strong`:case`emphasis`:case`delete`:case`tableRow`:case`tableCell`:case`listItem`:e.type===`listItem`&&typeof e.checked==`boolean`&&(n.checked=e.checked),n.children=S(e.children,t);break;case`heading`:n.depth=e.depth,n.children=S(e.children,t);break;case`text`:case`inlineCode`:case`inlineMath`:case`math`:n.value=e.value;break;case`code`:n.lang=e.lang??null,n.meta=e.meta??null,n.value=e.value;break;case`link`:n.url=e.url,n.title=null,n.children=S(e.children,t);break;case`image`:n.url=e.url,n.title=null,n.alt=e.alt;break;case`list`:n.ordered=e.ordered,e.start!==void 0&&(n.start=e.start),e.spread!==void 0&&(n.spread=e.spread),e.delimiter!==void 0&&(n.delimiter=e.delimiter),n.children=S(e.children,t);break;case`table`:n.align=Array.isArray(e.align)?[...e.align]:[],n.children=S(e.children,t);break;case`citation`:n.sourceId=e.sourceId;break;case`extension`:n.plugin=e.plugin,n.name=e.name,n.display=e.display,e.source!==void 0&&(n.source=e.source);break;default:break}e.data!==void 0&&(n.data=mt(e.data));let r=pt(e.position);return r!=null&&(n.position=r),Object.defineProperty(n,Mt,{configurable:!1,enumerable:!0,value:e,writable:!1}),n}function yt(e,t,n){let r=e[Mt];return r===void 0?null:((!x(r)||!n.index.all.has(r))&&y(`a "${b(t)}" node carries forged provenance`),r.type!==t&&y(`a source "${b(r.type)}" node cannot be retyped`),n.used.has(r)&&y(`a source "${b(t)}" node cannot be duplicated`),n.used.add(r),r)}function bt(e,t){let n=w[e];for(let r of Object.keys(t))r!==`type`&&r!==`position`&&r!==`data`&&!n.includes(r)&&y(`a "${b(e)}" node cannot carry the unsupported field "${lt(e,r)}"`)}function xt(e,t){if(t!==void 0){if(x(t))for(let n of Nt)n in t&&y(`a "${b(e)}" node cannot carry the raw-markup data channel "${n}"`);return te(t)||y(`a "${b(e)}" node's data must be finite JSON-like values`),mt(t)}}function St(e,t,n){return typeof n!=`string`&&y(`a "${b(e)}" node requires a string "${lt(e,t)}"`),n}function Ct(e,t,n){n!=null&&n!==``&&y(`a "${b(e)}" node's "${lt(e,t)}" has no Astryx representation`)}function wt(e,t,n,r){if(n==null)return;e===`root`&&y(`a document can only contain one root`);let i=e===`extension`?t.display:void 0,a=Pt.has(e)||i===`inline`,o=Ft.has(e)||i===`block`;(It.has(n)&&!a||Lt.has(n)&&!o||n===`list`&&e!==`listItem`||n===`table`&&e!==`tableRow`||n===`tableRow`&&e!==`tableCell`)&&y(`a "${b(e)}" node cannot be a child of a "${b(n)}" node`),r&&e===`link`&&y(`a link cannot be nested inside another link`)}function Tt(e,t){let n=Object.keys(e).filter(t=>t!==`type`&&e[t]!==void 0),r=Object.keys(t).filter(e=>t[e]!==void 0);if(n.length!==r.length)return!1;for(let n of r){let r=t[n],i=e[n];if(r!==i){if(Array.isArray(r)&&Array.isArray(i)){if(r.length!==i.length||r.some((e,t)=>e!==i[t]))return!1;continue}if(!ht(r,i))return!1}}return!0}function Et(e,t,n){if(n!=null&&Tt(n,t))return n;let r={type:e,...t};if(n!=null)for(let e of Object.getOwnPropertySymbols(n))Object.prototype.propertyIsEnumerable.call(n,e)&&Object.defineProperty(r,e,{configurable:!1,enumerable:!0,value:n[e],writable:!1});return r}function C(e,t,n,r){return Array.isArray(e)||y(`a "${b(t)}" node requires a children array`),e.map(e=>Dt(e,t,n||t===`link`,r))}function Dt(e,t,n,r){x(e)||y(`every transformed node must be a plain object`);let i=e.type;typeof i!=`string`&&y(`every transformed node requires a string type`),i===`html`&&y(`raw HTML has no Astryx representation`),i in w||y(`the node type "${b(i)}" is outside the supported MDAST subset`),bt(i,e),wt(i,e,t,n);let a=yt(e,i,r);a==null?e.position!==void 0&&y(`a new "${b(i)}" node cannot carry a source position`):dt(e.position,a.position)||y(`a source "${b(i)}" node's position must stay exactly as Core authored it`);let o={};switch(i){case`root`:case`paragraph`:case`blockquote`:case`strong`:case`emphasis`:case`delete`:case`tableRow`:case`tableCell`:o.children=C(e.children,i,n,r);break;case`heading`:{let t=e.depth;(typeof t!=`number`||!Number.isInteger(t)||t<1||t>6)&&y(`a heading requires a depth between 1 and 6`),a!=null&&a.depth!==t&&y(`a source heading's depth cannot change`),o.depth=t,o.children=C(e.children,i,n,r);break}case`listItem`:{let t=e.checked;t!=null&&(typeof t!=`boolean`&&y(`a list item requires a boolean "checked" value`),o.checked=t),e.spread===!0&&y(`a loose list item has no Astryx representation`),o.children=C(e.children,i,n,r);break}case`text`:case`inlineCode`:case`inlineMath`:case`math`:o.value=St(i,`value`,e.value);break;case`code`:{let t=e.lang;t!=null&&typeof t!=`string`&&y(`a code node requires a string or null "lang"`);let n=e.meta;n!=null&&typeof n!=`string`&&y(`a code node requires a string or null "meta"`),o.lang=t??null,n!=null&&n!==``&&(o.meta=n),o.value=St(i,`value`,e.value);break}case`link`:{let t=St(i,`url`,e.url);oe(t)||y(`a link destination was rejected by the navigation owner`),Ct(i,`title`,e.title),o.url=t,o.children=C(e.children,i,n,r);break}case`image`:{let t=St(i,`url`,e.url);oe(t)||y(`an image source was rejected by the resource owner`),Ct(i,`title`,e.title),typeof e.alt!=`string`&&y(`an image requires its text alternative`),o.url=t,o.alt=e.alt;break}case`list`:{typeof e.ordered!=`boolean`&&y(`a list requires a boolean "ordered" value`),o.ordered=e.ordered;let t=e.start;t!=null&&((typeof t!=`number`||!Number.isFinite(t))&&y(`a list requires a finite "start" value`),o.start=t),typeof e.spread==`boolean`&&(o.spread=e.spread);let a=e.delimiter;a!==void 0&&(a!==`.`&&a!==`)`&&y(`a list requires a "." or ")" delimiter`),o.delimiter=a),o.children=C(e.children,i,n,r);break}case`table`:{let t=e.align;(!Array.isArray(t)||!t.every(e=>e===null||e===`left`||e===`center`||e===`right`))&&y(`a table requires normalized alignment values`),o.align=[...t],o.children=C(e.children,i,n,r);break}case`thematicBreak`:case`break`:break;case`citation`:case`extension`:return a!=null&&ht(e.data,a.data)&&(i===`citation`?e.sourceId===a.sourceId:e.plugin===a.plugin&&e.name===a.name&&e.display===a.display&&e.source===a.source)||y(`an Astryx "${b(i)}" node cannot be authored or changed here`),a;default:y(`the node type "${b(i)}" is outside the supported MDAST subset`)}let s=xt(i,e.data);s!==void 0&&(o.data=s),a!=null&&a.position!==void 0&&(o.position=a.position);let c=Et(i,o,a);if(i===`table`&&c!==a){let e=o.children,t=e[0]?.children?.length??0;e.some(e=>e.children?.length!==t)&&y(`a transformed table cannot have ragged rows`)}return c}function Ot(e,t,n){let r=e instanceof Error?e.message:e;return{reason:r,fatal:!1,place:t??null,ruleId:n??null,toString(){return r}}}function kt(e){let t=[],n={data:{}},r={get value(){return e},get data(){return n.data},get messages(){return t},message(e,n,r){let i=Ot(e,n,r);return t.push(i),i},fail(e,n,r){let i=Ot(e,n,r);i.fatal=!0,t.push(i),y(T)},toString(){return e}};return{file:new Proxy(r,{get(e,t,n){return typeof t==`symbol`||D.has(t)||y(`the file has no "${ct(t)}" in this profile`),Reflect.get(r,t,n)},set(e,t){y(`the file's "${ct(t)}" cannot be assigned in this profile`)},defineProperty(e,t){y(`the file's "${ct(t)}" cannot be assigned in this profile`)},deleteProperty(e,t){y(`the file's "${ct(t)}" cannot be assigned in this profile`)},has(e,t){return typeof t==`symbol`||D.has(t)},ownKeys(){return[...D]},getOwnPropertyDescriptor(e,t){return typeof t!=`symbol`&&!D.has(t)?void 0:Reflect.getOwnPropertyDescriptor(r,t)}}),state:n}}function At(e){return(e instanceof Bt?Vt.get(e):void 0)??`the plugin threw an error`}function jt(e,...t){if(typeof e!=`function`)throw TypeError(`Markdown Remark adapter: plugin must be a function`);let n=!1,r=null,i=null,a=()=>{n=!0;let a=at();ot(a,()=>{try{let n=e.apply(Wt,t),o=st(n);if(a.failed&&y(a.reason??T),o&&y(`an asynchronous plugin is outside the adapter`),typeof n!=`function`){i=`only a transform-only plugin returning one synchronous transformer is supported`;return}if(n.length>=3){i=`a callback-style (asynchronous) transformer is outside the adapter`;return}r=n}catch(e){i=At(e)}}),a.failed&&i==null&&(i=a.reason,r=null)};return(e,t)=>{n||a();let o=r;if(o==null)return t.report(`Remark adapter: ${i??`the plugin failed`}`),e;let s=gt(),{file:c,state:l}=kt(t.source),u=at();return ot(u,()=>{try{let n=vt(e,s),r=o(n,c),i=st(r);u.failed&&y(u.reason??T),i&&y(`an asynchronous transformer is outside the adapter`);let a=r??n;te(l.data)||y(`file data must be finite JSON-like values`);let d=Dt(a,null,!1,{index:s,used:new Set});d.type!==`root`&&y(`a transformer must return the document root`);let f=d.children;return t.display===`inline`&&(f.length!==1||f[0]?.type!==`paragraph`)&&y(`an inline document must stay one paragraph of phrasing content`),u.failed&&y(u.reason??T),d}catch(n){return t.report(`Remark adapter: ${u.reason??At(n)}`),e}})}}var Mt,Nt,Pt,Ft,It,Lt,w,Rt,zt,T,Bt,Vt,E,Ht,Ut,D,O,Wt,Gt=e((()=>{f(),se(),Mt=Symbol(`astryx.markdown.remarkOrigin`),Nt=[`hName`,`hProperties`,`hChildren`],Pt=new Set([`text`,`inlineCode`,`inlineMath`,`break`,`strong`,`emphasis`,`delete`,`link`,`image`,`citation`]),Ft=new Set([`heading`,`paragraph`,`code`,`math`,`blockquote`,`list`,`table`,`thematicBreak`,`image`]),It=new Set([`heading`,`paragraph`,`strong`,`emphasis`,`delete`,`link`,`tableCell`]),Lt=new Set([`root`,`blockquote`,`listItem`]),w={root:[`children`],paragraph:[`children`],heading:[`depth`,`children`],blockquote:[`children`],strong:[`children`],emphasis:[`children`],delete:[`children`],tableRow:[`children`],tableCell:[`children`],text:[`value`],inlineCode:[`value`],inlineMath:[`value`],math:[`value`],code:[`lang`,`meta`,`value`],link:[`url`,`title`,`children`],image:[`url`,`title`,`alt`],list:[`ordered`,`start`,`spread`,`delimiter`,`children`],listItem:[`checked`,`spread`,`children`],table:[`align`,`children`],thematicBreak:[],break:[],citation:[`sourceId`],extension:[`plugin`,`name`,`display`,`source`]},Rt=new Set([`html`,`yaml`,`toml`,`definition`,`footnote`,`footnoteDefinition`,`footnoteReference`,`imageReference`,`linkReference`,`containerDirective`,`leafDirective`,`textDirective`,`mdxjsEsm`,`mdxFlowExpression`,`mdxTextExpression`,`mdxJsxFlowElement`,`mdxJsxTextElement`]),zt=new Set([`path`,`cwd`,`history`,`basename`,`dirname`,`extname`,`stem`,`stored`,`result`,`map`,`contents`]),T=`the plugin reported the document as unsupported`,Bt=class extends Error{},Vt=new WeakMap,E=null,Ht=[`line`,`column`,`offset`],Ut=[`start`,`end`],D=new Set([`value`,`data`,`messages`,`message`,`fail`,`toString`]),O=`processor registration is outside the adapter`,Wt=new Proxy(Object.freeze({}),{get(){y(O)},set(){y(O)},defineProperty(){y(O)},deleteProperty(){y(O)},apply(){y(O)},has(){return!1},ownKeys(){return[]}})}));function Kt(e,t){t(e);for(let n of[...e.children??[]])Kt(n,t)}var qt,Jt,Yt,Xt,Zt,Qt,$t,en,tn,nn=e((()=>{qe(),Gt(),qt=r(),Jt=/\bSPEC-\d+\b/,Yt=({basePath:e})=>t=>{Kt(t,t=>{t.children==null||t.type===`link`||(t.children=t.children.flatMap(t=>{if(t.type!==`text`||typeof t.value!=`string`)return[t];let n=t.value.split(RegExp(`(${Jt.source})`,`g`));return n.length===1?[t]:n.filter(e=>e!==``).map(t=>RegExp(`^${Jt.source}$`).test(t)?{type:`link`,url:`${e}/${t.slice(5)}`,title:null,children:[{type:`text`,value:t}]}:{type:`text`,value:t})}))})},Xt=()=>e=>{e.children?.push({type:`html`,value:`<button onclick="alert(1)">Injected</button>`})},Zt=()=>e=>{Kt(e,e=>{e.type===`link`&&(e.url=`javascript:alert(1)`)})},Qt=p({name:`demo-spec-badges`,apiVersion:1,transform:ge({pattern:new RegExp(Jt.source,`g`),requiredSubstrings:[`SPEC-`],replace:e=>({type:`extension`,plugin:`demo-spec-badges`,name:`badge`,display:`inline`,data:{label:e[0]}})}),renderers:{badge:{render:({node:e})=>(0,qt.jsx)(`mark`,{"data-spec-badge":!0,children:e.data.label}),toText:e=>e.data.label}}}),$t=p({name:`demo-remark-spec-links`,apiVersion:1,transform:jt(Yt,{basePath:`/specs`})}),en=p({name:`demo-remark-raw-html`,apiVersion:1,transform:jt(Xt)}),tn=p({name:`demo-remark-unsafe-links`,apiVersion:1,transform:jt(Zt)})})),k,A,j,rn,M,an,on,sn,N,P,F,I,L,R,z,B,cn,V,H,U,ln,W,G,K,q,un,J,dn,fn,pn,Y,X,Z,Q,$,mn;e((()=>{k=t(n()),d(),o(),l(),s(),it(),nn(),A=r(),{expect:j,userEvent:rn,within:M}=__STORYBOOK_MODULE_TEST__,an={title:`Core/Markdown`,component:m,tags:[`autodocs`],argTypes:{density:{control:`select`,options:[`default`,`compact`]},headingLevelStart:{control:`select`,options:[1,2,3,4,5,6]},isStreaming:{control:`boolean`},display:{control:`select`,options:[`block`,`inline`]}}},on=[`# Markdown Demo`,``,`Renders **markdown** with *design-system-consistent* styling.`,``,`## Features`,``,`- Headings mapped to Astryx type scale`,`- **Bold**, *italic*, and ~~strikethrough~~ text`,`- [Links](https://example.com) with external detection`,"- Inline `code` and fenced code blocks",``,`### Code Block`,``,"```typescript",`interface User {`,`  id: string;`,`  name: string;`,`}`,``,`function greet(user: User) {`,"  return `Hello, ${user.name}!`;",`}`,"```",``,`### Blockquote`,``,`> Design systems free teams to focus on problems that matter.`,``,`### Table`,``,`| Component | Status | Tests |`,`|:----------|:------:|------:|`,`| Markdown | Active | 73 |`,`| CodeBlock | Active | 44 |`,``,`### Task List`,``,`- [x] Parser`,`- [x] Renderer`,`- [ ] Storybook stories`,``,`---`,``,`1. First ordered item`,`2. Second ordered item`].join(`
`),sn=[`## Setting Up a Design System`,``,`A design system is more than a component library — it's a **shared language** between design and engineering. Here's how to build one that scales.`,``,`### 1. Start with Tokens`,``,`Design tokens are the atomic values that define your visual language:`,``,"```typescript",`const tokens = {`,`  color: {`,`    primary: '#0066FF',`,`    secondary: '#6B7280',`,`    success: '#10B981',`,`    danger: '#EF4444',`,`  },`,`  spacing: {`,`    xs: '4px',`,`    sm: '8px',`,`    md: '16px',`,`    lg: '24px',`,`    xl: '32px',`,`  },`,`  radius: {`,`    sm: '4px',`,`    md: '8px',`,`    lg: '16px',`,`    full: '9999px',`,`  },`,`};`,"```",``,`These tokens should be the *single source of truth* for every component.`,``,`### 2. Component Architecture`,``,`Good components follow these principles:`,``,`- **Composable** — small pieces that combine into complex UIs`,`- **Accessible** — keyboard navigation and screen reader support built-in`,`- **Themeable** — visual customization without forking`,`- **Documented** — usage examples, props tables, and do/don't guidelines`,``,`> The best design systems are *opinionated enough* to ensure consistency, but *flexible enough* to handle edge cases gracefully.`,``,`### 3. Adoption Strategy`,``,`Rolling out a design system requires planning:`,``,`| Phase | Duration | Goal |`,`|:------|:--------:|:-----|`,`| Alpha | 4 weeks | Core components, internal dogfooding |`,`| Beta | 8 weeks | Expanded component set, 2-3 pilot teams |`,`| GA | Ongoing | Full adoption, migration support |`,``,`Key metrics to track:`,``,`1. **Component coverage** — what percentage of UI patterns are served`,`2. **Adoption rate** — teams actively using the system`,`3. **Contribution rate** — external PRs and feature requests`,`4. **Consistency score** — visual audits across products`,``,`### 4. Maintenance`,``,`A design system is a *living product*. Plan for:`,``,`- [x] Automated visual regression testing`,`- [x] Semantic versioning with changelogs`,`- [ ] Breaking change codemods`,`- [ ] Cross-platform support (web, mobile, native)`,``,`---`,``,`The most important thing? **Ship early, iterate often.** A design system that exists and is used beats a perfect one that's still in planning.`].join(`
`),N={args:{children:on}},P={args:{children:on,density:`compact`}},F={name:`AI Response`,args:{children:sn,density:`compact`,headingLevelStart:3}},I={name:`Shifted Headings (start at h3)`,args:{children:on,headingLevelStart:3}},L={name:`Inline Display`,render:()=>(0,A.jsxs)(`div`,{style:{maxWidth:680,display:`grid`,gap:16},children:[(0,A.jsx)(i,{type:`large`,display:`block`,children:(0,A.jsx)(m,{display:`inline`,children:"Use `value` with **controlled state** and [read the docs](https://example.com) without creating block wrappers."})}),(0,A.jsxs)(`div`,{style:{border:`1px solid #ddd`,borderRadius:8,padding:12,display:`grid`,gap:6},children:[(0,A.jsx)(i,{type:`body`,weight:`bold`,display:`block`,children:`Prop description`}),(0,A.jsx)(i,{type:`body`,color:`secondary`,display:`block`,children:(0,A.jsx)(m,{display:`inline`,children:'Accepts an action item `{label, onClick?, icon?}`, a divider `{type: "divider"}`, or a section `{type: "section", items: [...]}`.'})})]})]})},R={name:`Table`,args:{children:[`## Comparison Table`,``,`| Feature | React | Vue | Svelte |`,`|:--------|:-----:|:---:|-------:|`,`| Virtual DOM | Yes | Yes | No |`,`| Bundle Size | ~40KB | ~30KB | ~2KB |`,`| TypeScript | Native | Plugin | Native |`,`| Learning Curve | Medium | Easy | Easy |`].join(`
`)}},z={render:()=>{let e=sn,[t,n]=(0,k.useState)(0),[r,i]=(0,k.useState)(!0),[o,s]=(0,k.useState)(0);return(0,k.useEffect)(()=>{if(!r)return;if(t>=e.length){i(!1);return}let a=Math.floor(Math.random()*8)+2,o=30+Math.random()*60,s=setTimeout(()=>{n(t=>Math.min(t+a,e.length))},o);return()=>clearTimeout(s)},[t,r,e]),(0,A.jsxs)(`div`,{children:[(0,A.jsxs)(`div`,{style:{marginBlockEnd:12,display:`flex`,gap:8,alignItems:`center`},children:[(0,A.jsx)(a,{label:`Replay`,variant:`secondary`,size:`sm`,onClick:(0,k.useCallback)(()=>{n(0),i(!0),s(e=>e+1)},[]),isDisabled:r}),(0,A.jsx)(`span`,{style:{fontSize:12,color:`var(--color-text-secondary)`},children:r?`Streaming... ${t}/${e.length}`:`Complete`})]}),(0,A.jsx)(m,{isStreaming:r,density:`compact`,headingLevelStart:3,children:e.slice(0,t)},o)]})}},B={name:`With Images`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:800},children:(0,A.jsx)(m,{children:`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
`})})},cn=`
# Content Alignment

This paragraph is constrained by \`contentWidth\`. Notice how it's narrower than the code block and table below. The alignment prop controls where this narrow prose sits within the wider container.

Here's a bullet list that also respects prose width:
- First item with some explanation text
- Second item that wraps to show the width constraint
- Third item for good measure

\`\`\`typescript
// Code blocks break out to full container width regardless of contentAlign
export function calculateLayout(items: Item[], containerWidth: number): Layout {
  const columns = Math.floor(containerWidth / COLUMN_MIN_WIDTH);
  return { columns, gap: GRID_GAP, items: distributeItems(items, columns) };
}
\`\`\`

Back to prose — this paragraph is aligned according to the \`contentAlign\` prop while the code block above spans the full width.

| Component | Status | Notes |
|-----------|--------|-------|
| Button | Stable | Full API |
| CodeBlock | Stable | With collapsible |
| Markdown | In progress | Adding alignment |

Final paragraph after the table.
`,V={name:`Content Align: Start`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:900,border:`1px dashed #ccc`,padding:16},children:(0,A.jsx)(m,{contentWidth:580,contentAlign:`start`,children:cn})})},H={name:`Content Align: Center`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:900,border:`1px dashed #ccc`,padding:16},children:(0,A.jsx)(m,{contentWidth:580,contentAlign:`center`,children:cn})})},U={name:`Inline Plugins`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{inlinePlugins:[{pattern:/\b([A-Z][A-Z0-9]+-\d+)\b/g,render:(e,t)=>(0,A.jsx)(c,{href:`https://issues.example.com/browse/${e[1]}`,isExternalLink:!0,weight:`semibold`,children:e[0]},t)},{pattern:/#(\d+)/g,render:(e,t)=>(0,A.jsx)(c,{href:`https://github.com/org/repo/issues/${e[1]}`,isExternalLink:!0,weight:`semibold`,children:e[0]},t)}],density:`compact`,headingLevelStart:2,children:[`## Release Notes — v2.1.0`,``,`This release fixes several issues reported in PROJ-42 and introduces`,`the inline plugins feature requested in #1873.`,``,`### Bug Fixes`,``,`- Fixed crash in streaming mode (BUG-789)`,`- Resolved memory leak in chat components (PROJ-101)`,`- **Bold context**: Plugin works inside **PROJ-55 formatting**`,``,`### Code Example (not linkified)`,``,"```typescript",`// PROJ-999 and BUG-888 should NOT become links inside code blocks`,`const ticketId = "PROJ-999";`,"```",``,"Inline code is also safe: `PROJ-999` stays as plain text.",``,`### Migration Guide`,``,`See PROJ-200 for the full pattern. Also check [the docs](/docs/markdown)`,`for usage alongside regular markdown links.`].join(`
`)})})},ln=({value:e,display:t})=>(0,A.jsx)(t===`block`?`div`:`span`,{role:`math`,"aria-label":`Formula: ${e}`,style:{display:t===`block`?`block`:`inline`,padding:t===`block`?`12px 16px`:`1px 4px`,marginBlock:t===`block`?12:void 0,border:`1px solid var(--color-border)`,borderRadius:6,fontFamily:`serif`,fontStyle:`italic`,textAlign:t===`block`?`center`:void 0},children:e}),W={name:`Custom Math Renderer`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{components:{math:ln},children:`A renderer can typeset inline math such as $E = mc^2$ without preprocessing the source.

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

Code remains opaque: \`$not_math$\`.`})})},G={name:`Syntax Plugins`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{plugins:v,children:`# Plugin composition

Hello @{Ada}. Ordinary **Markdown** keeps its behavior, while TODO becomes a transform-owned node.

:::note
This callout and mention are typed extension nodes.
:::

Protected contexts stay literal: \`TODO @{Linus}\` and [TODO @{Grace}](/people).`})})},K={name:`Plugin renderer with Suspense`,render:()=>{let[e,t]=(0,k.useState)(0),n=(0,k.useMemo)(()=>Xe(),[e]);return(0,A.jsxs)(`div`,{style:{maxWidth:680},children:[(0,A.jsx)(`div`,{style:{marginBlockEnd:12},children:(0,A.jsx)(a,{label:`Replay delayed renderer`,variant:`secondary`,size:`sm`,onClick:()=>t(e=>e+1)})}),(0,A.jsx)(m,{plugins:[n],children:`Before the async node.

Hello @{Ada}. This sibling Markdown renders immediately.

After the async node.`},e)]})}},q={name:`Semantic Fence`,render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{plugins:[nt],children:"# Build flow\n\n```diagram Checkout to deploy\nCheckout --> Test --> Deploy\n```\n\nThe plugin renderer presents typed data only for declared languages. Other fences keep the ordinary copyable code fallback:\n\n```text\npnpm test\n```"})})},un=`# Release notes

The parser now streams incrementally.

Everything else is unchanged.`,J={name:`Source Decoration Metadata`,render:()=>{let{plugins:e,readout:t}=Ze(un,`The parser now streams incrementally.`);return(0,A.jsxs)(`div`,{style:{maxWidth:680},children:[(0,A.jsx)(m,{plugins:e,children:un}),(0,A.jsxs)(i,{children:[`Decorations recorded while rendering: `,t.join(`, `)||`none`,`. The document above is identical with and without them because the helper records metadata rather than visual presentation.`]})]})}},dn=[`# Plugin composition`,``,`Hello @{Ada}. TODO becomes a transform-owned node, and SPEC-4821 is claimed`,`by whichever plugin runs first, next to an [Authored link](/people).`,``,`:::note`,`Native syntax and an adapted Remark transform share one ordered list.`,`:::`,``,"Protected contexts stay literal: `TODO @{Linus} SPEC-9999`.",``,"```txt",`SPEC-9999 stays copyable`,"```"].join(`
`),fn=[...v,Qt,$t],pn=[...v,$t,Qt],Y={name:`Native and Remark plugins`,parameters:{docs:{description:{story:`Native syntax plugins and one adapted synchronous Remark transform run in the same ordered list, and the order decides the outcome. Both claim SPEC-4821: running the native badge first leaves the Remark transform nothing to link, and running the Remark transform first puts the text inside a link, which the native helper treats as a protected context. Astryx keeps ownership of the transformed destination, and code stays copyable either way.`}}},render:()=>(0,A.jsxs)(`div`,{style:{display:`grid`,gap:24,maxWidth:680},children:[(0,A.jsxs)(`section`,{"data-order":`native-first`,children:[(0,A.jsx)(i,{children:`Native badge plugin first`}),(0,A.jsx)(m,{plugins:fn,children:dn})]}),(0,A.jsxs)(`section`,{"data-order":`remark-first`,children:[(0,A.jsx)(i,{children:`Adapted Remark plugin first`}),(0,A.jsx)(m,{plugins:pn,children:dn})]})]}),play:async({canvasElement:e})=>{let t=M(e),n=t=>{let n=e.querySelector(`[data-order="${t}"]`);if(n==null)throw Error(`missing pane: ${t}`);return n},r=M(n(`native-first`)),i=M(n(`remark-first`));await j(r.getByText(`@Ada`)).toBeInTheDocument(),await j(r.getByLabelText(`Note`)).toBeInTheDocument(),await j(r.getByText(`TODO`)).toBeInTheDocument();let a=r.getByText(`SPEC-4821`);await j(a).toHaveAttribute(`data-spec-badge`),await j(r.queryByRole(`link`,{name:`SPEC-4821`})).not.toBeInTheDocument();let o=i.getByRole(`link`,{name:`SPEC-4821`});await j(o).toHaveAttribute(`href`,`/specs/4821`),await j(i.getByText(`SPEC-4821`)).not.toHaveAttribute(`data-spec-badge`),await j(t.getAllByText(`TODO @{Linus} SPEC-9999`)).toHaveLength(2),await j(t.getAllByText(`SPEC-9999 stays copyable`)).toHaveLength(2),await j(i.getAllByRole(`link`).map(e=>e.textContent)).toEqual([`SPEC-4821`,`Authored link`]),o.focus(),await j(o).toHaveFocus(),await rn.tab(),await j(i.getByRole(`link`,{name:`Authored link`})).toHaveFocus()}},X=[`---`,`title: Plugin rollout`,`status: ready`,`---`,`# Plugin rollout`,``,`Hello @{Ada}. TODO tracks SPEC-4821.`,``,"```diagram Release path",`Author --> Review --> Publish`,"```"].join(`
`),Z={name:`Native frontmatter with full plugin stack`,render:()=>{let e=rt.parse(X),{plugins:t}=Ze(X,`Plugin rollout`),n=[rt.plugin,...v,nt,$t,...t];return(0,A.jsxs)(`div`,{style:{maxWidth:680},children:[(0,A.jsxs)(i,{children:[`Document metadata: `,e.status===`match`?`${e.metadata.title} — ${e.metadata.status}`:`No document metadata`]}),(0,A.jsx)(m,{plugins:n,children:X})]})},play:async({canvasElement:e})=>{let t=M(e);await j(t.getByText(`Document metadata: Plugin rollout — ready`)).toBeInTheDocument(),await j(t.getByRole(`heading`,{name:`Plugin rollout`})).toBeInTheDocument(),await j(t.getByText(`@Ada`)).toBeInTheDocument(),await j(t.getByText(`TODO`)).toBeInTheDocument(),await j(t.getByRole(`link`,{name:`SPEC-4821`})).toHaveAttribute(`href`,`/specs/4821`),await j(t.getByRole(`figure`,{name:`Release path`})).toBeVisible(),await j(t.queryByText(`title: Plugin rollout`)).not.toBeInTheDocument()}},Q={name:`Remark outside the profile`,parameters:{docs:{description:{story:`A plugin that emits raw HTML or a rejected destination falls closed: the last valid document stays readable, no markup is injected, and the authored destination survives.`}}},render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{plugins:[en,tn],children:`# Still readable

Prose survives with its [authored link](/people).`})}),play:async({canvasElement:e})=>{let t=M(e);await j(t.getByRole(`heading`,{name:`Still readable`})).toBeInTheDocument(),await j(t.getByRole(`link`,{name:`authored link`})).toHaveAttribute(`href`,`/people`),await j(t.queryByText(`Injected`)).not.toBeInTheDocument()}},$={name:`Plugins omitted baseline`,parameters:{docs:{description:{story:`The same source without plugins. Extension syntax stays literal, no badge or transformed link exists, so opting in is the only thing that changes behavior.`}}},render:()=>(0,A.jsx)(`div`,{style:{maxWidth:680},children:(0,A.jsx)(m,{children:dn})}),play:async({canvasElement:e})=>{let t=M(e);await j(t.queryByRole(`link`,{name:`SPEC-4821`})).not.toBeInTheDocument(),await j(t.queryByLabelText(`Note`)).not.toBeInTheDocument(),await j(t.getByText(/Hello @\{Ada\}/)).toBeInTheDocument(),await j(t.getByRole(`link`,{name:`Authored link`})).toBeInTheDocument()}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    children: SAMPLE_MD
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    children: SAMPLE_MD,
    density: 'compact'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'AI Response',
  args: {
    children: STREAMING_RESPONSE,
    density: 'compact',
    headingLevelStart: 3
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Shifted Headings (start at h3)',
  args: {
    children: SAMPLE_MD,
    headingLevelStart: 3
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Inline Display',
  render: () => <div style={{
    maxWidth: 680,
    display: 'grid',
    gap: 16
  }}>
      <Text type="large" display="block">
        <Markdown display="inline">
          {'Use \`value\` with **controlled state** and [read the docs](https://example.com) without creating block wrappers.'}
        </Markdown>
      </Text>

      <div style={{
      border: '1px solid #ddd',
      borderRadius: 8,
      padding: 12,
      display: 'grid',
      gap: 6
    }}>
        <Text type="body" weight="bold" display="block">
          Prop description
        </Text>
        <Text type="body" color="secondary" display="block">
          <Markdown display="inline">
            {'Accepts an action item \`{label, onClick?, icon?}\`, a divider \`{type: "divider"}\`, or a section \`{type: "section", items: [...]}\`.'}
          </Markdown>
        </Text>
      </div>
    </div>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Table',
  args: {
    children: ['## Comparison Table', '', '| Feature | React | Vue | Svelte |', '|:--------|:-----:|:---:|-------:|', '| Virtual DOM | Yes | Yes | No |', '| Bundle Size | ~40KB | ~30KB | ~2KB |', '| TypeScript | Native | Plugin | Native |', '| Learning Curve | Medium | Easy | Easy |'].join('\\n')
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const text = STREAMING_RESPONSE;
    const [charIndex, setCharIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(true);
    const [key, setKey] = useState(0);
    useEffect(() => {
      if (!isStreaming) {
        return;
      }
      if (charIndex >= text.length) {
        setIsStreaming(false);
        return;
      }
      const chunkSize = Math.floor(Math.random() * 8) + 2;
      const delay = 30 + Math.random() * 60;
      const timer = setTimeout(() => {
        setCharIndex(prev => Math.min(prev + chunkSize, text.length));
      }, delay);
      return () => clearTimeout(timer);
    }, [charIndex, isStreaming, text]);
    const replay = useCallback(() => {
      setCharIndex(0);
      setIsStreaming(true);
      setKey(k => k + 1);
    }, []);
    return <div>
        <div style={{
        marginBlockEnd: 12,
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }}>
          <Button label="Replay" variant="secondary" size="sm" onClick={replay} isDisabled={isStreaming} />
          <span style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)'
        }}>
            {isStreaming ? \`Streaming... \${charIndex}/\${text.length}\` : 'Complete'}
          </span>
        </div>
        <Markdown key={key} isStreaming={isStreaming} density="compact" headingLevelStart={3}>
          {text.slice(0, charIndex)}
        </Markdown>
      </div>;
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  name: 'With Images',
  render: () => <div style={{
    maxWidth: 800
  }}>
      <Markdown>{\`
Here is some text before the image.

![A landscape photo](https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=680&h=400&fit=crop&auto=format)

Text between two images.

![A tall portrait photo](https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=600&fit=crop&auto=format)

And here's a really wide one:

![Wide panoramic shot](https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=300&fit=crop&auto=format)

Final paragraph after all images.
\`}</Markdown>
    </div>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  name: 'Content Align: Start',
  render: () => <div style={{
    maxWidth: 900,
    border: '1px dashed #ccc',
    padding: 16
  }}>
      <Markdown contentWidth={580} contentAlign="start">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
    </div>
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Content Align: Center',
  render: () => <div style={{
    maxWidth: 900,
    border: '1px dashed #ccc',
    padding: 16
  }}>
      <Markdown contentWidth={580} contentAlign="center">
        {CONTENT_ALIGN_TEXT}
      </Markdown>
    </div>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Inline Plugins',
  render: () => {
    const inlinePlugins = [{
      // JIRA-style ticket references: PROJ-123, BUG-456, etc.
      pattern: /\\b([A-Z][A-Z0-9]+-\\d+)\\b/g,
      render: (match: RegExpMatchArray, key: string) => <Link key={key} href={\`https://issues.example.com/browse/\${match[1]}\`} isExternalLink weight="semibold">
            {match[0]}
          </Link>
    }, {
      // GitHub-style issue references: #123, #456, etc.
      pattern: /#(\\d+)/g,
      render: (match: RegExpMatchArray, key: string) => <Link key={key} href={\`https://github.com/org/repo/issues/\${match[1]}\`} isExternalLink weight="semibold">
            {match[0]}
          </Link>
    }];
    const markdown = ['## Release Notes — v2.1.0', '', 'This release fixes several issues reported in PROJ-42 and introduces', 'the inline plugins feature requested in #1873.', '', '### Bug Fixes', '', '- Fixed crash in streaming mode (BUG-789)', '- Resolved memory leak in chat components (PROJ-101)', '- **Bold context**: Plugin works inside **PROJ-55 formatting**', '', '### Code Example (not linkified)', '', '\`\`\`typescript', '// PROJ-999 and BUG-888 should NOT become links inside code blocks', 'const ticketId = "PROJ-999";', '\`\`\`', '', 'Inline code is also safe: \`PROJ-999\` stays as plain text.', '', '### Migration Guide', '', 'See PROJ-200 for the full pattern. Also check [the docs](/docs/markdown)', 'for usage alongside regular markdown links.'].join('\\n');
    return <div style={{
      maxWidth: 680
    }}>
        <Markdown inlinePlugins={inlinePlugins} density="compact" headingLevelStart={2}>
          {markdown}
        </Markdown>
      </div>;
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Custom Math Renderer',
  render: () => <div style={{
    maxWidth: 680
  }}>
      <Markdown components={{
      math: StoryMath
    }}>
        {'A renderer can typeset inline math such as $E = mc^2$ without preprocessing the source.\\n\\n$$\\n\\\\sum_{i=1}^{n} i = \\\\frac{n(n+1)}{2}\\n$$\\n\\nCode remains opaque: \`$not_math$\`.'}
      </Markdown>
    </div>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Syntax Plugins',
  render: () => <div style={{
    maxWidth: 680
  }}>
      <Markdown plugins={markdownDemoPlugins}>
        {'# Plugin composition\\n\\nHello @{Ada}. Ordinary **Markdown** keeps its behavior, while TODO becomes a transform-owned node.\\n\\n:::note\\nThis callout and mention are typed extension nodes.\\n:::\\n\\nProtected contexts stay literal: \`TODO @{Linus}\` and [TODO @{Grace}](/people).'}
      </Markdown>
    </div>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Plugin renderer with Suspense',
  render: () => {
    const [run, setRun] = useState(0);
    const delayedPlugin = useMemo(() => createDelayedMarkdownDemoPlugin(), [run]);
    return <div style={{
      maxWidth: 680
    }}>
        <div style={{
        marginBlockEnd: 12
      }}>
          <Button label="Replay delayed renderer" variant="secondary" size="sm" onClick={() => setRun(value => value + 1)} />
        </div>
        <Markdown key={run} plugins={[delayedPlugin]}>
          {'Before the async node.\\n\\nHello @{Ada}. This sibling Markdown renders immediately.\\n\\nAfter the async node.'}
        </Markdown>
      </div>;
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:"{\n  name: 'Semantic Fence',\n  render: () => <div style={{\n    maxWidth: 680\n  }}>\n      <Markdown plugins={[markdownSemanticFenceDemoPlugin]}>\n        {'# Build flow\\n\\n```diagram Checkout to deploy\\nCheckout --> Test --> Deploy\\n```\\n\\nThe plugin renderer presents typed data only for declared languages. Other fences keep the ordinary copyable code fallback:\\n\\n```text\\npnpm test\\n```'}\n      </Markdown>\n    </div>\n}",...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  name: 'Source Decoration Metadata',
  render: () => {
    const {
      plugins,
      readout
    } = createSourceDecorationDemo(decorationSource, 'The parser now streams incrementally.');
    return <div style={{
      maxWidth: 680
    }}>
        <Markdown plugins={plugins}>{decorationSource}</Markdown>
        <Text>
          Decorations recorded while rendering: {readout.join(', ') || 'none'}.
          The document above is identical with and without them because the
          helper records metadata rather than visual presentation.
        </Text>
      </div>;
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Native and Remark plugins',
  parameters: {
    docs: {
      description: {
        story: 'Native syntax plugins and one adapted synchronous Remark transform run in the same ordered list, and the order decides the outcome. Both claim SPEC-4821: running the native badge first leaves the Remark transform nothing to link, and running the Remark transform first puts the text inside a link, which the native helper treats as a protected context. Astryx keeps ownership of the transformed destination, and code stays copyable either way.'
      }
    }
  },
  render: () => <div style={{
    display: 'grid',
    gap: 24,
    maxWidth: 680
  }}>
      <section data-order="native-first">
        <Text>Native badge plugin first</Text>
        <Markdown plugins={nativeFirst}>{nativeAndRemarkSource}</Markdown>
      </section>
      <section data-order="remark-first">
        <Text>Adapted Remark plugin first</Text>
        <Markdown plugins={remarkFirst}>{nativeAndRemarkSource}</Markdown>
      </section>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const pane = (order: string): HTMLElement => {
      const element = canvasElement.querySelector<HTMLElement>(\`[data-order="\${order}"]\`);
      if (element == null) {
        throw new Error(\`missing pane: \${order}\`);
      }
      return element;
    };
    const nativeFirstPane = within(pane('native-first'));
    const remarkFirstPane = within(pane('remark-first'));

    // Native syntax and transform plugins still own their own nodes.
    await expect(nativeFirstPane.getByText('@Ada')).toBeInTheDocument();
    await expect(nativeFirstPane.getByLabelText('Note')).toBeInTheDocument();
    await expect(nativeFirstPane.getByText('TODO')).toBeInTheDocument();

    // Native first: the badge consumed the prose, so no link was produced.
    const badge = nativeFirstPane.getByText('SPEC-4821');
    await expect(badge).toHaveAttribute('data-spec-badge');
    await expect(nativeFirstPane.queryByRole('link', {
      name: 'SPEC-4821'
    })).not.toBeInTheDocument();

    // Reversed: the Remark transform consumed it, and the native helper left
    // the link's children alone — so the same source renders differently.
    const specLink = remarkFirstPane.getByRole('link', {
      name: 'SPEC-4821'
    });
    await expect(specLink).toHaveAttribute('href', '/specs/4821');
    await expect(remarkFirstPane.getByText('SPEC-4821')).not.toHaveAttribute('data-spec-badge');

    // Protected contexts and copyable code are untouched in both orders.
    await expect(canvas.getAllByText('TODO @{Linus} SPEC-9999')).toHaveLength(2);
    await expect(canvas.getAllByText('SPEC-9999 stays copyable')).toHaveLength(2);

    // Keyboard order follows document order: the transformed link is an
    // ordinary tab stop that hands focus on to the authored link.
    await expect(remarkFirstPane.getAllByRole('link').map(link => link.textContent)).toEqual(['SPEC-4821', 'Authored link']);
    specLink.focus();
    await expect(specLink).toHaveFocus();
    await userEvent.tab();
    await expect(remarkFirstPane.getByRole('link', {
      name: 'Authored link'
    })).toHaveFocus();
  }
}`,...Y.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Native frontmatter with full plugin stack',
  render: () => {
    const metadata = markdownFrontmatterDemo.parse(fullStackFrontmatterSource);
    const {
      plugins: decorationPlugins
    } = createSourceDecorationDemo(fullStackFrontmatterSource, 'Plugin rollout');
    const plugins = [markdownFrontmatterDemo.plugin, ...markdownDemoPlugins, markdownSemanticFenceDemoPlugin, remarkSpecLinkPlugin, ...decorationPlugins];
    const label = metadata.status === 'match' ? \`\${metadata.metadata.title} — \${metadata.metadata.status}\` : 'No document metadata';
    return <div style={{
      maxWidth: 680
    }}>
        <Text>Document metadata: {label}</Text>
        <Markdown plugins={plugins}>{fullStackFrontmatterSource}</Markdown>
      </div>;
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Document metadata: Plugin rollout — ready')).toBeInTheDocument();
    await expect(canvas.getByRole('heading', {
      name: 'Plugin rollout'
    })).toBeInTheDocument();
    await expect(canvas.getByText('@Ada')).toBeInTheDocument();
    await expect(canvas.getByText('TODO')).toBeInTheDocument();
    await expect(canvas.getByRole('link', {
      name: 'SPEC-4821'
    })).toHaveAttribute('href', '/specs/4821');
    await expect(canvas.getByRole('figure', {
      name: 'Release path'
    })).toBeVisible();
    await expect(canvas.queryByText('title: Plugin rollout')).not.toBeInTheDocument();
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  name: 'Remark outside the profile',
  parameters: {
    docs: {
      description: {
        story: 'A plugin that emits raw HTML or a rejected destination falls closed: the last valid document stays readable, no markup is injected, and the authored destination survives.'
      }
    }
  },
  render: () => <div style={{
    maxWidth: 680
  }}>
      <Markdown plugins={[remarkRawHtmlPlugin, remarkUnsafeLinkPlugin]}>
        {'# Still readable\\n\\nProse survives with its [authored link](/people).'}
      </Markdown>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('heading', {
      name: 'Still readable'
    })).toBeInTheDocument();
    await expect(canvas.getByRole('link', {
      name: 'authored link'
    })).toHaveAttribute('href', '/people');
    await expect(canvas.queryByText('Injected')).not.toBeInTheDocument();
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  name: 'Plugins omitted baseline',
  parameters: {
    docs: {
      description: {
        story: 'The same source without plugins. Extension syntax stays literal, no badge or transformed link exists, so opting in is the only thing that changes behavior.'
      }
    }
  },
  render: () => <div style={{
    maxWidth: 680
  }}>
      <Markdown>{nativeAndRemarkSource}</Markdown>
    </div>,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('link', {
      name: 'SPEC-4821'
    })).not.toBeInTheDocument();
    await expect(canvas.queryByLabelText('Note')).not.toBeInTheDocument();
    await expect(canvas.getByText(/Hello @\\{Ada\\}/)).toBeInTheDocument();
    await expect(canvas.getByRole('link', {
      name: 'Authored link'
    })).toBeInTheDocument();
  }
}`,...$.parameters?.docs?.source}}},mn=[`Default`,`Compact`,`AIResponse`,`ShiftedHeadings`,`InlineDisplay`,`TableFocused`,`Streaming`,`WithImages`,`ContentAlignStart`,`ContentAlignCenter`,`InlinePlugins`,`CustomMath`,`SyntaxPlugins`,`SuspenseRenderer`,`SemanticFence`,`SourceDecoration`,`NativeAndRemarkPlugins`,`NativeFrontmatterWithFullStack`,`RemarkOutsideTheProfile`,`PluginsOmittedBaseline`]}))();export{F as AIResponse,P as Compact,H as ContentAlignCenter,V as ContentAlignStart,W as CustomMath,N as Default,L as InlineDisplay,U as InlinePlugins,Y as NativeAndRemarkPlugins,Z as NativeFrontmatterWithFullStack,$ as PluginsOmittedBaseline,Q as RemarkOutsideTheProfile,q as SemanticFence,I as ShiftedHeadings,J as SourceDecoration,z as Streaming,K as SuspenseRenderer,G as SyntaxPlugins,R as TableFocused,B as WithImages,mn as __namedExportsOrder,an as default};