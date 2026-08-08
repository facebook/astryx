import{a as e,n as t}from"./rolldown-runtime-DkW27tQK.js";import{t as n}from"./react-BZJXY1be.js";import{n as r,t as i}from"./stylex-Dft6gtPK.js";import{n as a,t as o}from"./Theme-os0aoGDw.js";import{n as s}from"./mergeProps-JRyAvMxc.js";import{n as c,t as l}from"./themeProps-CREkzZh6.js";import{n as u}from"./isRenderable-Cp8ef9AQ.js";import{t as d}from"./jsx-runtime-DeHZSEgm.js";import{a as f,o as p}from"./useTheme-CAaDofyu.js";import{c as m,n as h,s as ee,t as g}from"./Avatar-DiNe9zDi.js";function _(e){return e<=36?{dotSize:10,borderWidth:1,iconSize:0,tier:`small`}:e<=72?{dotSize:20,borderWidth:2,iconSize:12,tier:`medium`}:{dotSize:32,borderWidth:4,iconSize:18,tier:`large`}}function v({shape:e,field:t,stroke:n}){let r=t/2;return(0,x.jsx)(`svg`,{"aria-hidden":`true`,viewBox:`0 0 ${t} ${t}`,width:t,height:t,fill:`none`,...c(`avatar-status-dot-glyph`,{shape:e}),children:e===`ring`?(0,x.jsx)(`circle`,{cx:r,cy:r,r:(t-n)/2,fill:`none`,stroke:`currentColor`,strokeWidth:n}):(0,x.jsx)(`line`,{x1:t*.25/2+n/2,y1:r,x2:t*1.75/2-n/2,y2:r,stroke:`currentColor`,strokeWidth:n,strokeLinecap:`round`})})}function y({ref:e,variant:t=`success`,label:n,icon:i,xstyle:a,className:o,style:l,...d}){let{dotSize:f,borderWidth:p,iconSize:m,tier:h}=_((0,b.use)(ee)),g=u(i)&&m>0,y=g?void 0:E[t];return(0,x.jsxs)(`div`,{...d,ref:e,...n?{role:`img`,"aria-label":n}:void 0,...s(c(`avatar-status-dot`,{variant:t}),r(S.dot,T[t],w.size(f,p),a),o,l),children:[g&&(0,x.jsx)(`span`,{"aria-hidden":`true`,...r(S.icon,w.iconSize(m)),children:i}),y&&(0,x.jsx)(v,{shape:y,field:f-p*2,stroke:D[h]})]})}var b,x,S,C,w,T,E,D;function O(){return(O=t((()=>{b=e(n(),1),i(),m(),l(),x=d(),S={dot:{kaIpWk:`astryxjspbzw`,ksu8eU:`astryx1y0btm7`,kVAM5u:`astryx1touxvs`,kB7OPa:`astryx9f619`,k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,$$css:!0},success:{kWkggS:`astryxdsz4j9`,kMwMTN:`astryxrkvqaz`,$$css:!0},neutral:{kWkggS:`astryx10xzikg`,kMwMTN:`astryxv1l7n4`,$$css:!0},error:{kWkggS:`astryx1pjz0fi`,kMwMTN:`astryxrkvqaz`,$$css:!0},icon:{k1xSpc:`astryx78zum5`,kGNEyG:`astryx6s0dn4`,kjj79g:`astryxl56j7k`,kLWn49:`astryx14ju556`,$$css:!0}},C={kjGldf:``,k2ei4v:``,kZ1KPB:``,ke9TFa:``,kWqL5O:``,kLoX6v:``,kEafiO:``,kt9PQ7:``,$$css:!0},w={size:(e,t)=>[C,{kzqmXN:e==null?e:`astryx5lhr3w`,kZKoxP:e==null?e:`astryx16ye13r`,kMzoRj:t==null?t:`astryx1mw0n95`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-borderWidth":(e=>typeof e==`number`?e+`px`:e??void 0)(t)}],iconSize:e=>[{kzqmXN:e==null?e:`astryx5lhr3w`,kZKoxP:e==null?e:`astryx16ye13r`,$$css:!0},{"--x-width":(e=>typeof e==`number`?e+`px`:e??void 0)(e),"--x-height":(e=>typeof e==`number`?e+`px`:e??void 0)(e)}]},T={success:S.success,neutral:S.neutral,error:S.error},E={neutral:`ring`,error:`minus`},D={small:1,medium:1.5,large:2},y.displayName=`AvatarStatusDot`,y.__docgenInfo={description:`A status indicator dot that automatically scales to match the parent
Avatar's size.

Each variant pairs a colour with a distinct built-in shape (filled dot,
ring, minus bar) so status stays distinguishable without colour
perception (WCAG 2.1 SC 1.4.1). Themes can target the shape glyph via
the \`astryx-avatar-status-dot-glyph\` class and its \`data-shape\`
attribute.

Must be used inside an Avatar's \`status\` prop so it can read
the avatar size from context.

@example
\`\`\`
<Avatar
  name="John Doe"
  size="lg"
  status={<AvatarStatusDot variant="success" label="Online" />}
/>
<Avatar
  name="Jane Smith"
  size="xl"
  status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />}
/>
\`\`\``,methods:[],displayName:`AvatarStatusDot`,props:{xstyle:{required:!1,tsType:{name:`StyleXStyles`},description:"StyleX styles created via `stylex.create()`. Merged with the component's\nbase styles inside a single `stylex.props()` call for optimal deduplication.\n\n@example\n```\nconst overrides = stylex.create({ root: { marginBottom: 8 } });\n<Component xstyle={overrides.root} />\n```"},ref:{required:!1,tsType:{name:`ReactRef`,raw:`React.Ref<HTMLDivElement>`,elements:[{name:`HTMLDivElement`}]},description:``},variant:{required:!1,tsType:{name:`AvatarStatusDotVariantMap`},description:"The semantic variant of the dot. Each variant pairs a colour with a\ndistinct built-in shape so status is never conveyed by colour alone\n(WCAG 2.1 SC 1.4.1):\n- `success` — filled green dot (e.g. online, accepted)\n- `neutral` — grey ring (e.g. away, offline, pending)\n- `error` — red dot with a minus bar (e.g. busy, do not disturb)\n\nMatches the `variant` naming convention from `StatusDot`.\n@default 'success'",defaultValue:{value:`'success'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:`Accessible label for the status dot.
Describes the meaning of the indicator for screen readers
(e.g. "Online", "Accepted", "John Doe is busy").

Note: inside an Avatar the dot sits in the avatar's \`role="img"\`
subtree, where descendant semantics are pruned — the dot is never its
own stop there. Instead, Avatar reads this \`label\` and composes it into
its own accessible name (e.g. "Jane Doe, Online"), which is how the
status reaches assistive tech (WCAG 4.1.2). Standalone dots (outside an
Avatar) expose \`role="img"\` with this label directly.`},icon:{required:!1,tsType:{name:`ReactNode`},description:`Optional icon to render centered inside the dot.
Accepts any ReactNode (typically an SVG icon).
The icon is automatically sized to fit the dot and hidden
at the smallest avatar sizes where there isn't enough room.

A rendered icon replaces the variant's built-in shape glyph, so use a
different icon per status — the same icon on every variant leaves the
statuses distinguishable by colour alone (WCAG 1.4.1). At the smallest
avatar sizes the built-in glyph still shows instead of the icon.
Booleans and empty strings are ignored (safe for \`cond && <Icon />\`),
but a component that renders nothing still counts as an icon and
suppresses the glyph.

@example
\`\`\`
<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />
\`\`\``}},composes:[`Omit`]}})))()}function k({title:e,titleId:t,...n},r){return A.createElement(`svg`,Object.assign({xmlns:`http://www.w3.org/2000/svg`,viewBox:`0 0 24 24`,fill:`currentColor`,"aria-hidden":`true`,"data-slot":`icon`,ref:r,"aria-labelledby":t},n),e?A.createElement(`title`,{id:t},e):null,A.createElement(`path`,{fillRule:`evenodd`,d:`M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z`,clipRule:`evenodd`}))}var A,j;function M(){return(M=t((()=>{A=e(n()),j=A.forwardRef(k)})))()}var N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=t((()=>{h(),O(),a(),p(),M(),N=d(),P={title:`Core/Avatar`,component:g,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`,`xl`,16,20,24,32,36,40,48,60,64,72,96,128,144,180],description:`Size of the avatar`},src:{control:`text`,description:`Primary image source URL`},fallbackSrc:{control:`text`,description:`Fallback image when primary fails`},name:{control:`text`,description:`User name for initials and alt text`},alt:{control:`text`,description:`Alt text (falls back to name)`},tooltip:{control:`text`,description:`Hover/focus tooltip. Omitted or true shows the name; a string shows that text; false disables it. Set false when wrapping in your own Tooltip/HoverCard.`},status:{control:`boolean`,description:`Show status indicator dot`,mapping:{true:(0,N.jsx)(y,{label:`Online`}),false:void 0}}}},F={args:{name:`John Doe`,size:`lg`}},I={args:{src:`https://i.pravatar.cc/150?img=1`,name:`Jane Smith`,size:`lg`}},L={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`TY`,size:`xsm`}),(0,N.jsx)(g,{name:`XS`,size:`sm`}),(0,N.jsx)(g,{name:`SM`,size:`md`}),(0,N.jsx)(g,{name:`MD`,size:`lg`}),(0,N.jsx)(g,{name:`LG`,size:`xl`})]})]})},R={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Images (Different Sizes)`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=1`,name:`User 1`,size:`xsm`}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=2`,name:`User 2`,size:`sm`}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=3`,name:`User 3`,size:`md`}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=4`,name:`User 4`,size:`lg`}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=5`,name:`User 5`,size:`xl`})]})]})},z={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Initials Fallback`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`John Doe`,size:`lg`}),(0,N.jsx)(g,{name:`Alice`,size:`lg`}),(0,N.jsx)(g,{name:`Bob Smith Johnson`,size:`lg`}),(0,N.jsx)(g,{name:`Dr. Sarah Connor`,size:`lg`})]})]})},B={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default Icon (No Image or Name)`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{size:`xsm`}),(0,N.jsx)(g,{size:`sm`}),(0,N.jsx)(g,{size:`md`}),(0,N.jsx)(g,{size:`lg`}),(0,N.jsx)(g,{size:`xl`})]})]})},V={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Fallback Chain Demo`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Valid src`}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=10`,name:`Test User`,size:`xl`})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Invalid src, valid fallbackSrc`}),(0,N.jsx)(g,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://i.pravatar.cc/150?img=11`,name:`Test User`,size:`xl`})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Both invalid, has name`}),(0,N.jsx)(g,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://also-invalid.example/broken.jpg`,name:`Test User`,size:`xl`})]}),(0,N.jsxs)(`div`,{children:[(0,N.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`All invalid, no name`}),(0,N.jsx)(g,{src:`https://invalid-url.example/broken.jpg`,size:`xl`})]})]})]})},H={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Status Indicators`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=20`,name:`Online User`,size:`xl`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=21`,name:`Offline User`,size:`xl`,status:(0,N.jsx)(y,{variant:`neutral`,label:`Offline`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=22`,name:`Busy User`,size:`xl`,status:(0,N.jsx)(y,{variant:`error`,label:`Busy`})})]})]})},U={name:`Status Dot Across All Sizes`,render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status dot scales proportionally with avatar size`}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`TY`,size:`xsm`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`XS`,size:`sm`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`SM`,size:`md`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`MD`,size:`lg`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`LG`,size:`xl`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,N.jsx)(y,{variant:`error`,label:`Busy`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,N.jsx)(y,{variant:`neutral`,label:`Offline`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Colors at Medium`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=40`,name:`Positive`,size:`lg`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=41`,name:`Neutral`,size:`lg`,status:(0,N.jsx)(y,{variant:`neutral`,label:`Offline`})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=42`,name:`Negative`,size:`lg`,status:(0,N.jsx)(y,{variant:`error`,label:`Busy`})})]})]})},W={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status with Different Sizes`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`AB`,size:`md`,status:(0,N.jsx)(y,{label:`Online`})}),(0,N.jsx)(g,{name:`CD`,size:`lg`,status:(0,N.jsx)(y,{label:`Online`})}),(0,N.jsx)(g,{name:`EF`,size:`xl`,status:(0,N.jsx)(y,{label:`Online`})}),(0,N.jsx)(g,{name:`GH`,size:72,status:(0,N.jsx)(y,{label:`Online`})})]})]})},G={name:`Status Shapes at Small Sizes`,render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Each variant pairs colour with a distinct shape (filled, ring, minus) so status never relies on colour alone — including the smallest sizes, where icons cannot render`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`ON`,size:`xsm`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`OF`,size:`xsm`,status:(0,N.jsx)(y,{variant:`neutral`,label:`Offline`})}),(0,N.jsx)(g,{name:`BU`,size:`xsm`,status:(0,N.jsx)(y,{variant:`error`,label:`Busy`})}),(0,N.jsx)(g,{name:`ON`,size:`md`,status:(0,N.jsx)(y,{variant:`success`,label:`Online`})}),(0,N.jsx)(g,{name:`OF`,size:`md`,status:(0,N.jsx)(y,{variant:`neutral`,label:`Offline`})}),(0,N.jsx)(g,{name:`BU`,size:`md`,status:(0,N.jsx)(y,{variant:`error`,label:`Busy`})})]})]})},K={name:`Status Dot with Icon`,render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Icon inside status dot (hidden at tiny sizes where there isn't room)`}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`TY`,size:`xsm`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{name:`XS`,size:`sm`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{name:`SM`,size:`md`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=50`,name:`MD`,size:`lg`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=51`,name:`LG`,size:`xl`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Variants with Icons`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=52`,name:`Positive`,size:`xl`,status:(0,N.jsx)(y,{variant:`success`,label:`Verified`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=53`,name:`Neutral`,size:`xl`,status:(0,N.jsx)(y,{variant:`neutral`,label:`Pending`,icon:(0,N.jsx)(j,{})})}),(0,N.jsx)(g,{src:`https://i.pravatar.cc/150?img=54`,name:`Negative`,size:`xl`,status:(0,N.jsx)(y,{variant:`error`,label:`Rejected`,icon:(0,N.jsx)(j,{})})})]})]})},q={render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Pixel Sizes`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`16`,size:16}),(0,N.jsx)(g,{name:`24`,size:24}),(0,N.jsx)(g,{name:`36`,size:36}),(0,N.jsx)(g,{name:`48`,size:48}),(0,N.jsx)(g,{name:`72`,size:72}),(0,N.jsx)(g,{name:`96`,size:96}),(0,N.jsx)(g,{name:`128`,size:128})]})]})},J=f({name:`avatar-fallback-scale`,components:{"avatar-fallback":{base:{fontWeight:`var(--font-weight-normal)`,color:`var(--color-text-blue)`,backgroundColor:`var(--color-background-blue)`},"size:xsm":{fontSize:`8px`},"size:sm":{fontSize:`9px`},"size:md":{fontSize:`13px`},"size:lg":{fontSize:`16px`},"size:xl":{fontSize:`40px`}}}}),Y={name:`Themed Fallback Type Scale`,render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default fallback (size × 0.4)`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`TY`,size:`xsm`}),(0,N.jsx)(g,{name:`XS`,size:`sm`}),(0,N.jsx)(g,{name:`SM`,size:`md`}),(0,N.jsx)(g,{name:`MD`,size:`lg`}),(0,N.jsx)(g,{name:`LG`,size:`xl`})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Themed fallback (per-size scale, regular weight, blue wash)`}),(0,N.jsx)(o,{theme:J,mode:`light`,children:(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`TY`,size:`xsm`}),(0,N.jsx)(g,{name:`XS`,size:`sm`}),(0,N.jsx)(g,{name:`SM`,size:`md`}),(0,N.jsx)(g,{name:`MD`,size:`lg`}),(0,N.jsx)(g,{name:`LG`,size:`xl`})]})})]})},X=f({name:`avatar-fallback-background`,components:{"avatar-fallback":{base:{backgroundColor:`var(--color-accent)`,color:`var(--color-on-accent)`}}}}),Z={name:`Themed Fallback Background`,render:()=>(0,N.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default fallback background`}),(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`Ada Lovelace`,size:`lg`}),(0,N.jsx)(g,{name:`Grace Hopper`,size:`lg`}),(0,N.jsx)(g,{size:`lg`})]}),(0,N.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Themed fallback background (solid accent on initials and icon)`}),(0,N.jsx)(o,{theme:X,mode:`light`,children:(0,N.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,N.jsx)(g,{name:`Ada Lovelace`,size:`lg`}),(0,N.jsx)(g,{name:`Grace Hopper`,size:`lg`}),(0,N.jsx)(g,{size:`lg`})]})})]})},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'John Doe',
    size: 'lg'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
    size: 'lg'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="xsm" />
        <Avatar name="XS" size="sm" />
        <Avatar name="SM" size="md" />
        <Avatar name="MD" size="lg" />
        <Avatar name="LG" size="xl" />
      </div>
    </div>
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Images (Different Sizes)</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=1" name="User 1" size="xsm" />
        <Avatar src="https://i.pravatar.cc/150?img=2" name="User 2" size="sm" />
        <Avatar src="https://i.pravatar.cc/150?img=3" name="User 3" size="md" />
        <Avatar src="https://i.pravatar.cc/150?img=4" name="User 4" size="lg" />
        <Avatar src="https://i.pravatar.cc/150?img=5" name="User 5" size="xl" />
      </div>
    </div>
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Initials Fallback</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="John Doe" size="lg" />
        <Avatar name="Alice" size="lg" />
        <Avatar name="Bob Smith Johnson" size="lg" />
        <Avatar name="Dr. Sarah Connor" size="lg" />
      </div>
    </div>
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Default Icon (No Image or Name)</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar size="xsm" />
        <Avatar size="sm" />
        <Avatar size="md" />
        <Avatar size="lg" />
        <Avatar size="xl" />
      </div>
    </div>
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Fallback Chain Demo</h4>
      <div {...stylex.props(styles.row)}>
        <div>
          <p {...stylex.props(styles.heading)}>Valid src</p>
          <Avatar src="https://i.pravatar.cc/150?img=10" name="Test User" size="xl" />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>
            Invalid src, valid fallbackSrc
          </p>
          <Avatar src="https://invalid-url.example/broken.jpg" fallbackSrc="https://i.pravatar.cc/150?img=11" name="Test User" size="xl" />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>Both invalid, has name</p>
          <Avatar src="https://invalid-url.example/broken.jpg" fallbackSrc="https://also-invalid.example/broken.jpg" name="Test User" size="xl" />
        </div>
        <div>
          <p {...stylex.props(styles.heading)}>All invalid, no name</p>
          <Avatar src="https://invalid-url.example/broken.jpg" size="xl" />
        </div>
      </div>
    </div>
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Status Indicators</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=20" name="Online User" size="xl" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=21" name="Offline User" size="xl" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=22" name="Busy User" size="xl" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  name: 'Status Dot Across All Sizes',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Status dot scales proportionally with avatar size
      </h4>

      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="xsm" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="XS" size="sm" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="SM" size="md" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="MD" size="lg" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="LG" size="xl" status={<AvatarStatusDot variant="success" label="Online" />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=30" name="U1" size={20} status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=31" name="U2" size={32} status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=32" name="U3" size={48} status={<AvatarStatusDot variant="error" label="Busy" />} />
        <Avatar src="https://i.pravatar.cc/150?img=33" name="U4" size={72} status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=34" name="U5" size={96} status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=35" name="U6" size={128} status={<AvatarStatusDot variant="success" label="Online" />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Colors at Medium</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=40" name="Positive" size="lg" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=41" name="Neutral" size="lg" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=42" name="Negative" size="lg" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Status with Different Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="AB" size="md" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="CD" size="lg" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="EF" size="xl" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="GH" size={72} status={<AvatarStatusDot label="Online" />} />
      </div>
    </div>
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Status Shapes at Small Sizes',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Each variant pairs colour with a distinct shape (filled, ring, minus) so
        status never relies on colour alone — including the smallest sizes,
        where icons cannot render
      </h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="ON" size="xsm" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="OF" size="xsm" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar name="BU" size="xsm" status={<AvatarStatusDot variant="error" label="Busy" />} />
        <Avatar name="ON" size="md" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar name="OF" size="md" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar name="BU" size="md" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  name: 'Status Dot with Icon',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Icon inside status dot (hidden at tiny sizes where there isn't room)
      </h4>

      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="xsm" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar name="XS" size="sm" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar name="SM" size="md" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=50" name="MD" size="lg" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=51" name="LG" size="xl" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=30" name="U1" size={20} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=31" name="U2" size={32} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=32" name="U3" size={48} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=33" name="U4" size={72} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=34" name="U5" size={96} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=35" name="U6" size={128} status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Variants with Icons</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=52" name="Positive" size="xl" status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=53" name="Neutral" size="xl" status={<AvatarStatusDot variant="neutral" label="Pending" icon={<CheckIcon />} />} />
        <Avatar src="https://i.pravatar.cc/150?img=54" name="Negative" size="xl" status={<AvatarStatusDot variant="error" label="Rejected" icon={<CheckIcon />} />} />
      </div>
    </div>
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Numeric Pixel Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="16" size={16} />
        <Avatar name="24" size={24} />
        <Avatar name="36" size={36} />
        <Avatar name="48" size={48} />
        <Avatar name="72" size={72} />
        <Avatar name="96" size={96} />
        <Avatar name="128" size={128} />
      </div>
    </div>
}`,...q.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  name: 'Themed Fallback Type Scale',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Default fallback (size × 0.4)</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="xsm" />
        <Avatar name="XS" size="sm" />
        <Avatar name="SM" size="md" />
        <Avatar name="MD" size="lg" />
        <Avatar name="LG" size="xl" />
      </div>

      <h4 {...stylex.props(styles.heading)}>
        Themed fallback (per-size scale, regular weight, blue wash)
      </h4>
      <Theme theme={fallbackScaleTheme} mode="light">
        <div {...stylex.props(styles.row)}>
          <Avatar name="TY" size="xsm" />
          <Avatar name="XS" size="sm" />
          <Avatar name="SM" size="md" />
          <Avatar name="MD" size="lg" />
          <Avatar name="LG" size="xl" />
        </div>
      </Theme>
    </div>
}`,...Y.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  name: 'Themed Fallback Background',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Default fallback background</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="Ada Lovelace" size="lg" />
        <Avatar name="Grace Hopper" size="lg" />
        <Avatar size="lg" />
      </div>

      <h4 {...stylex.props(styles.heading)}>
        Themed fallback background (solid accent on initials and icon)
      </h4>
      <Theme theme={fallbackBackgroundTheme} mode="light">
        <div {...stylex.props(styles.row)}>
          <Avatar name="Ada Lovelace" size="lg" />
          <Avatar name="Grace Hopper" size="lg" />
          <Avatar size="lg" />
        </div>
      </Theme>
    </div>
}`,...Z.parameters?.docs?.source}}},Q=[`Default`,`WithImage`,`AllSizes`,`WithImages`,`InitialsFallback`,`NoImageNoName`,`FallbackChain`,`WithStatus`,`StatusAcrossAllSizes`,`StatusWithSizes`,`StatusShapesAtSmallSizes`,`StatusWithIcon`,`NumericSizes`,`ThemedFallbackScale`,`ThemedFallbackBackground`]})))()}$();export{L as AllSizes,F as Default,V as FallbackChain,z as InitialsFallback,B as NoImageNoName,q as NumericSizes,U as StatusAcrossAllSizes,G as StatusShapesAtSmallSizes,K as StatusWithIcon,W as StatusWithSizes,Z as ThemedFallbackBackground,Y as ThemedFallbackScale,I as WithImage,R as WithImages,H as WithStatus,Q as __namedExportsOrder,P as default};