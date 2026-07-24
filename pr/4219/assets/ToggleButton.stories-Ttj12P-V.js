import{i as e,s as t}from"./preload-helper-CT_b8DTk.js";import{t as n}from"./react-B7Te67-h.js";import{t as r}from"./jsx-runtime-DqZldVDK.js";import{n as i,t as a}from"./Icon-Csbga5uN.js";import{ct as o,st as s,ut as c}from"./iframe-B2M4pHB5.js";import{J as l,K as u,S as d,X as f,b as p,f as m,gn as h,it as g,mn as _,t as v,un as y,vn as b,w as x}from"./esm-DA7gAIBC.js";import{I as S,M as C,i as w,m as T,o as E,t as D,v as O}from"./esm-S3-01pr3.js";var k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;e((()=>{k=t(n()),s(),v(),D(),a(),A=r(),j={width:16,height:16},M={title:`Core/ToggleButton`,component:o,tags:[`autodocs`],argTypes:{label:{control:`text`},isPressed:{control:`boolean`},size:{control:`select`,options:[`sm`,`md`,`lg`]},isDisabled:{control:`boolean`},isLoading:{control:`boolean`}}},N={render:function(){let[e,t]=(0,k.useState)(!1);return(0,A.jsx)(o,{label:`Bold`,icon:(0,A.jsx)(_,{style:j}),isPressed:e,onPressedChange:t,isIconOnly:!0})}},P={render:function(){let[e,t]=(0,k.useState)(!1),[n,r]=(0,k.useState)(!0);return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,A.jsx)(o,{label:`Favorite`,icon:(0,A.jsx)(d,{style:j}),pressedIcon:(0,A.jsx)(E,{style:j}),isPressed:e,onPressedChange:t,isIconOnly:!0}),(0,A.jsx)(o,{label:`Bookmark`,icon:(0,A.jsx)(y,{style:j}),pressedIcon:(0,A.jsx)(C,{style:j}),isPressed:n,onPressedChange:r,isIconOnly:!0})]})}},F={render:function(){let[e,t]=(0,k.useState)(!1);return(0,A.jsx)(o,{label:`Active`,isPressed:e,onPressedChange:t,children:`Active`})}},I={args:{label:`Disabled toggle`,isPressed:!1,isDisabled:!0,icon:(0,A.jsx)(_,{style:j})}},L={args:{label:`Loading toggle`,isPressed:!0,isLoading:!0,icon:(0,A.jsx)(d,{style:j})}},R={render:function(){let[e,t]=(0,k.useState)({}),n=e=>t(t=>({...t,[e]:!t[e]}));return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:8,alignItems:`center`},children:[(0,A.jsx)(o,{label:`Small`,size:`sm`,icon:(0,A.jsx)(_,{style:j}),isPressed:!!e.sm,onPressedChange:()=>n(`sm`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Medium`,size:`md`,icon:(0,A.jsx)(_,{style:j}),isPressed:!!e.md,onPressedChange:()=>n(`md`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Large`,size:`lg`,icon:(0,A.jsx)(_,{style:{width:20,height:20}}),isPressed:!!e.lg,onPressedChange:()=>n(`lg`),isIconOnly:!0})]})}},z={render:function(){let[e,t]=(0,k.useState)(`list`);return(0,A.jsxs)(c,{value:e,onChange:t,label:`View mode`,children:[(0,A.jsx)(o,{value:`list`,label:`List view`,icon:(0,A.jsx)(u,{style:j}),isIconOnly:!0}),(0,A.jsx)(o,{value:`grid`,label:`Grid view`,icon:(0,A.jsx)(x,{style:j}),isIconOnly:!0})]})}},B={render:function(){let[e,t]=(0,k.useState)([]);return(0,A.jsxs)(c,{type:`multiple`,value:e,onChange:t,label:`Text formatting`,children:[(0,A.jsx)(o,{value:`bold`,label:`Bold`,icon:(0,A.jsx)(_,{style:j}),isIconOnly:!0}),(0,A.jsx)(o,{value:`italic`,label:`Italic`,icon:(0,A.jsx)(f,{style:j}),isIconOnly:!0}),(0,A.jsx)(o,{value:`underline`,label:`Underline`,icon:(0,A.jsx)(m,{style:j}),isIconOnly:!0})]})}},V={render:function(){let[e,t]=(0,k.useState)(!1);return(0,A.jsx)(o,{label:e?`Unmute notifications`:`Mute notifications`,icon:(0,A.jsx)(h,{style:j}),pressedIcon:(0,A.jsx)(b,{style:j}),isPressed:e,onPressedChange:t,isIconOnly:!0})}},H={render:function(){let[e,t]=(0,k.useState)({bold:!0,italic:!1,underline:!0,strikethrough:!1,link:!1}),n=e=>t(t=>({...t,[e]:!t[e]}));return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:4},children:[(0,A.jsx)(o,{label:`Bold`,icon:(0,A.jsx)(i,{icon:_,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:S,size:`sm`,color:`accent`}),isPressed:e.bold,onPressedChange:()=>n(`bold`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Italic`,icon:(0,A.jsx)(i,{icon:f,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:T,size:`sm`,color:`accent`}),isPressed:e.italic,onPressedChange:()=>n(`italic`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Underline`,icon:(0,A.jsx)(i,{icon:m,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:w,size:`sm`,color:`accent`}),isPressed:e.underline,onPressedChange:()=>n(`underline`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Strikethrough`,icon:(0,A.jsx)(i,{icon:p,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:p,size:`sm`,color:`accent`}),isPressed:e.strikethrough,onPressedChange:()=>n(`strikethrough`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Link`,icon:(0,A.jsx)(i,{icon:l,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:l,size:`sm`,color:`success`}),isPressed:e.link,onPressedChange:()=>n(`link`),isIconOnly:!0})]})}},U={render:function(){let[e,t]=(0,k.useState)({star:!1,heart:!1,bookmark:!0,bell:!1}),n=e=>t(t=>({...t,[e]:!t[e]}));return(0,A.jsxs)(`div`,{style:{display:`flex`,gap:8},children:[(0,A.jsx)(o,{label:`Star`,icon:(0,A.jsx)(i,{icon:d,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:E,size:`sm`,color:`yellow`}),isPressed:e.star,onPressedChange:()=>n(`star`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Like`,icon:(0,A.jsx)(i,{icon:g,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:O,size:`sm`,color:`red`}),isPressed:e.heart,onPressedChange:()=>n(`heart`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Save`,icon:(0,A.jsx)(i,{icon:y,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:C,size:`sm`,color:`blue`}),isPressed:e.bookmark,onPressedChange:()=>n(`bookmark`),isIconOnly:!0}),(0,A.jsx)(o,{label:`Follow`,icon:(0,A.jsx)(i,{icon:h,size:`sm`,color:`secondary`}),pressedIcon:(0,A.jsx)(i,{icon:h,size:`sm`,color:`accent`}),isPressed:e.bell,onPressedChange:()=>n(`bell`),isIconOnly:!0})]})}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isPressed, setIsPressed] = useState(false);
    return <ToggleButton label="Bold" icon={<BoldIcon style={iconSize} />} isPressed={isPressed} onPressedChange={setIsPressed} isIconOnly />;
  }
}`,...N.parameters?.docs?.source},description:{story:`Interactive standalone toggle — click to toggle.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isFavorited, setIsFavorited] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(true);
    return <div style={{
      display: 'flex',
      gap: 8
    }}>
        <ToggleButton label="Favorite" icon={<StarIcon style={iconSize} />} pressedIcon={<StarIconSolid style={iconSize} />} isPressed={isFavorited} onPressedChange={setIsFavorited} isIconOnly />
        <ToggleButton label="Bookmark" icon={<BookmarkIcon style={iconSize} />} pressedIcon={<BookmarkIconSolid style={iconSize} />} isPressed={isBookmarked} onPressedChange={setIsBookmarked} isIconOnly />
      </div>;
  }
}`,...P.parameters?.docs?.source},description:{story:`Icon-only toggles with icon swap.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isActive, setIsActive] = useState(false);
    return <ToggleButton label="Active" isPressed={isActive} onPressedChange={setIsActive}>
        Active
      </ToggleButton>;
  }
}`,...F.parameters?.docs?.source},description:{story:`Toggle with visible label text — shows font weight shift on press.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Disabled toggle',
    isPressed: false,
    isDisabled: true,
    icon: <BoldIcon style={iconSize} />
  }
}`,...I.parameters?.docs?.source},description:{story:`Disabled state.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Loading toggle',
    isPressed: true,
    isLoading: true,
    icon: <StarIcon style={iconSize} />
  }
}`,...L.parameters?.docs?.source},description:{story:`Loading state.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({});
    const toggle = (key: string) => setPressed(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }}>
        <ToggleButton label="Small" size="sm" icon={<BoldIcon style={iconSize} />} isPressed={!!pressed.sm} onPressedChange={() => toggle('sm')} isIconOnly />
        <ToggleButton label="Medium" size="md" icon={<BoldIcon style={iconSize} />} isPressed={!!pressed.md} onPressedChange={() => toggle('md')} isIconOnly />
        <ToggleButton label="Large" size="lg" icon={<BoldIcon style={{
        width: 20,
        height: 20
      }} />} isPressed={!!pressed.lg} onPressedChange={() => toggle('lg')} isIconOnly />
      </div>;
  }
}`,...R.parameters?.docs?.source},description:{story:`All sizes side by side.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [view, setView] = useState<string | null>('list');
    return <ToggleButtonGroup value={view} onChange={setView} label="View mode">
        <ToggleButton value="list" label="List view" icon={<ListBulletIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="grid" label="Grid view" icon={<Squares2X2Icon style={iconSize} />} isIconOnly />
      </ToggleButtonGroup>;
  }
}`,...z.parameters?.docs?.source},description:{story:`Single-select group — view mode switcher. Click active to deselect.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [formats, setFormats] = useState<string[]>([]);
    return <ToggleButtonGroup type="multiple" value={formats} onChange={setFormats} label="Text formatting">
        <ToggleButton value="bold" label="Bold" icon={<BoldIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="italic" label="Italic" icon={<ItalicIcon style={iconSize} />} isIconOnly />
        <ToggleButton value="underline" label="Underline" icon={<UnderlineIcon style={iconSize} />} isIconOnly />
      </ToggleButtonGroup>;
  }
}`,...B.parameters?.docs?.source},description:{story:`Multi-select group — text formatting toolbar.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [isMuted, setIsMuted] = useState(false);
    return <ToggleButton label={isMuted ? 'Unmute notifications' : 'Mute notifications'} icon={<BellIcon style={iconSize} />} pressedIcon={<BellSlashIcon style={iconSize} />} isPressed={isMuted} onPressedChange={setIsMuted} isIconOnly />;
  }
}`,...V.parameters?.docs?.source},description:{story:`Notification toggle — icon swap between bell and bell-slash.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      bold: true,
      italic: false,
      underline: true,
      strikethrough: false,
      link: false
    });
    const toggle = (key: string) => setPressed(p => ({
      ...p,
      [key]: !p[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 4
    }}>
        <ToggleButton label="Bold" icon={<Icon icon={BoldIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BoldIconSolid} size="sm" color="accent" />} isPressed={pressed.bold} onPressedChange={() => toggle('bold')} isIconOnly />
        <ToggleButton label="Italic" icon={<Icon icon={ItalicIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={ItalicIconSolid} size="sm" color="accent" />} isPressed={pressed.italic} onPressedChange={() => toggle('italic')} isIconOnly />
        <ToggleButton label="Underline" icon={<Icon icon={UnderlineIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={UnderlineIconSolid} size="sm" color="accent" />} isPressed={pressed.underline} onPressedChange={() => toggle('underline')} isIconOnly />
        <ToggleButton label="Strikethrough" icon={<Icon icon={StrikethroughIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={StrikethroughIcon} size="sm" color="accent" />} isPressed={pressed.strikethrough} onPressedChange={() => toggle('strikethrough')} isIconOnly />
        <ToggleButton label="Link" icon={<Icon icon={LinkIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={LinkIcon} size="sm" color="success" />} isPressed={pressed.link} onPressedChange={() => toggle('link')} isIconOnly />
      </div>;
  }
}`,...H.parameters?.docs?.source},description:{story:`Formatting toolbar with colored icons — icon shifts to accent color when pressed.
Uses outline → solid icon swap + Icon color prop to reinforce state.`,...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  render: function Render() {
    const [pressed, setPressed] = useState<Record<string, boolean>>({
      star: false,
      heart: false,
      bookmark: true,
      bell: false
    });
    const toggle = (key: string) => setPressed(p => ({
      ...p,
      [key]: !p[key]
    }));
    return <div style={{
      display: 'flex',
      gap: 8
    }}>
        <ToggleButton label="Star" icon={<Icon icon={StarIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={StarIconSolid} size="sm" color="yellow" />} isPressed={pressed.star} onPressedChange={() => toggle('star')} isIconOnly />
        <ToggleButton label="Like" icon={<Icon icon={HeartIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={HeartIconSolid} size="sm" color="red" />} isPressed={pressed.heart} onPressedChange={() => toggle('heart')} isIconOnly />
        <ToggleButton label="Save" icon={<Icon icon={BookmarkIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BookmarkIconSolid} size="sm" color="blue" />} isPressed={pressed.bookmark} onPressedChange={() => toggle('bookmark')} isIconOnly />
        <ToggleButton label="Follow" icon={<Icon icon={BellIcon} size="sm" color="secondary" />} pressedIcon={<Icon icon={BellIcon} size="sm" color="accent" />} isPressed={pressed.bell} onPressedChange={() => toggle('bell')} isIconOnly />
      </div>;
  }
}`,...U.parameters?.docs?.source},description:{story:`Reaction buttons — semantic icon colors (yellow star, red heart, blue bookmark).
Shows icon swap (outline → solid) paired with color to reinforce the pressed state.`,...U.parameters?.docs?.description}}},W=[`Standalone`,`IconSwap`,`WithLabel`,`Disabled`,`Loading`,`Sizes`,`GroupSingle`,`GroupMultiple`,`NotificationToggle`,`ColoredIconToolbar`,`ColoredIconReactions`]}))();export{U as ColoredIconReactions,H as ColoredIconToolbar,I as Disabled,B as GroupMultiple,z as GroupSingle,P as IconSwap,L as Loading,V as NotificationToggle,R as Sizes,N as Standalone,F as WithLabel,W as __namedExportsOrder,M as default};