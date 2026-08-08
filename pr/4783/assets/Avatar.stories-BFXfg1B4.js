import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{s as n}from"./useTheme-COnUYSpT.js";import{i as r,n as i,t as a}from"./Avatar-CakpLnsK.js";import{t as o,x as s}from"./theme-TX5zTLRI.js";import{O as c,t as l}from"./esm-S3-01pr3.js";var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{a(),o(),l(),u=t(),d={title:`Core/Avatar`,component:r,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`,`xl`,16,20,24,32,36,40,48,60,64,72,96,128,144,180],description:`Size of the avatar`},src:{control:`text`,description:`Primary image source URL`},fallbackSrc:{control:`text`,description:`Fallback image when primary fails`},name:{control:`text`,description:`User name for initials and alt text`},alt:{control:`text`,description:`Alt text (falls back to name)`},tooltip:{control:`text`,description:`Hover/focus tooltip. Omitted or true shows the name; a string shows that text; false disables it. Set false when wrapping in your own Tooltip/HoverCard.`},status:{control:`boolean`,description:`Show status indicator dot`,mapping:{true:(0,u.jsx)(i,{label:`Online`}),false:void 0}}}},f={args:{name:`John Doe`,size:`lg`}},p={args:{src:`https://i.pravatar.cc/150?img=1`,name:`Jane Smith`,size:`lg`}},m={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`TY`,size:`xsm`}),(0,u.jsx)(r,{name:`XS`,size:`sm`}),(0,u.jsx)(r,{name:`SM`,size:`md`}),(0,u.jsx)(r,{name:`MD`,size:`lg`}),(0,u.jsx)(r,{name:`LG`,size:`xl`})]})]})},h={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Images (Different Sizes)`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=1`,name:`User 1`,size:`xsm`}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=2`,name:`User 2`,size:`sm`}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=3`,name:`User 3`,size:`md`}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=4`,name:`User 4`,size:`lg`}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=5`,name:`User 5`,size:`xl`})]})]})},g={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Initials Fallback`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`John Doe`,size:`lg`}),(0,u.jsx)(r,{name:`Alice`,size:`lg`}),(0,u.jsx)(r,{name:`Bob Smith Johnson`,size:`lg`}),(0,u.jsx)(r,{name:`Dr. Sarah Connor`,size:`lg`})]})]})},_={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default Icon (No Image or Name)`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{size:`xsm`}),(0,u.jsx)(r,{size:`sm`}),(0,u.jsx)(r,{size:`md`}),(0,u.jsx)(r,{size:`lg`}),(0,u.jsx)(r,{size:`xl`})]})]})},v={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Fallback Chain Demo`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Valid src`}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=10`,name:`Test User`,size:`xl`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Invalid src, valid fallbackSrc`}),(0,u.jsx)(r,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://i.pravatar.cc/150?img=11`,name:`Test User`,size:`xl`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Both invalid, has name`}),(0,u.jsx)(r,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://also-invalid.example/broken.jpg`,name:`Test User`,size:`xl`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`All invalid, no name`}),(0,u.jsx)(r,{src:`https://invalid-url.example/broken.jpg`,size:`xl`})]})]})]})},y={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Status Indicators`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=20`,name:`Online User`,size:`xl`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=21`,name:`Offline User`,size:`xl`,status:(0,u.jsx)(i,{variant:`neutral`,label:`Offline`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=22`,name:`Busy User`,size:`xl`,status:(0,u.jsx)(i,{variant:`error`,label:`Busy`})})]})]})},b={name:`Status Dot Across All Sizes`,render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status dot scales proportionally with avatar size`}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`TY`,size:`xsm`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`XS`,size:`sm`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`SM`,size:`md`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`MD`,size:`lg`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`LG`,size:`xl`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,u.jsx)(i,{variant:`error`,label:`Busy`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,u.jsx)(i,{variant:`neutral`,label:`Offline`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Colors at Medium`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=40`,name:`Positive`,size:`lg`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=41`,name:`Neutral`,size:`lg`,status:(0,u.jsx)(i,{variant:`neutral`,label:`Offline`})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=42`,name:`Negative`,size:`lg`,status:(0,u.jsx)(i,{variant:`error`,label:`Busy`})})]})]})},x={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status with Different Sizes`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`AB`,size:`md`,status:(0,u.jsx)(i,{label:`Online`})}),(0,u.jsx)(r,{name:`CD`,size:`lg`,status:(0,u.jsx)(i,{label:`Online`})}),(0,u.jsx)(r,{name:`EF`,size:`xl`,status:(0,u.jsx)(i,{label:`Online`})}),(0,u.jsx)(r,{name:`GH`,size:72,status:(0,u.jsx)(i,{label:`Online`})})]})]})},S={name:`Status Shapes at Small Sizes`,render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Each variant pairs colour with a distinct shape (filled, ring, minus) so status never relies on colour alone — including the smallest sizes, where icons cannot render`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`ON`,size:`xsm`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`OF`,size:`xsm`,status:(0,u.jsx)(i,{variant:`neutral`,label:`Offline`})}),(0,u.jsx)(r,{name:`BU`,size:`xsm`,status:(0,u.jsx)(i,{variant:`error`,label:`Busy`})}),(0,u.jsx)(r,{name:`ON`,size:`md`,status:(0,u.jsx)(i,{variant:`success`,label:`Online`})}),(0,u.jsx)(r,{name:`OF`,size:`md`,status:(0,u.jsx)(i,{variant:`neutral`,label:`Offline`})}),(0,u.jsx)(r,{name:`BU`,size:`md`,status:(0,u.jsx)(i,{variant:`error`,label:`Busy`})})]})]})},C={name:`Status Dot with Icon`,render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Icon inside status dot (hidden at tiny sizes where there isn't room)`}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`TY`,size:`xsm`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{name:`XS`,size:`sm`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{name:`SM`,size:`md`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=50`,name:`MD`,size:`lg`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=51`,name:`LG`,size:`xl`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Variants with Icons`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=52`,name:`Positive`,size:`xl`,status:(0,u.jsx)(i,{variant:`success`,label:`Verified`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=53`,name:`Neutral`,size:`xl`,status:(0,u.jsx)(i,{variant:`neutral`,label:`Pending`,icon:(0,u.jsx)(c,{})})}),(0,u.jsx)(r,{src:`https://i.pravatar.cc/150?img=54`,name:`Negative`,size:`xl`,status:(0,u.jsx)(i,{variant:`error`,label:`Rejected`,icon:(0,u.jsx)(c,{})})})]})]})},w={render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Pixel Sizes`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`16`,size:16}),(0,u.jsx)(r,{name:`24`,size:24}),(0,u.jsx)(r,{name:`36`,size:36}),(0,u.jsx)(r,{name:`48`,size:48}),(0,u.jsx)(r,{name:`72`,size:72}),(0,u.jsx)(r,{name:`96`,size:96}),(0,u.jsx)(r,{name:`128`,size:128})]})]})},T=n({name:`avatar-fallback-scale`,components:{"avatar-fallback":{base:{fontWeight:`var(--font-weight-normal)`,color:`var(--color-text-blue)`,backgroundColor:`var(--color-background-blue)`},"size:xsm":{fontSize:`8px`},"size:sm":{fontSize:`9px`},"size:md":{fontSize:`13px`},"size:lg":{fontSize:`16px`},"size:xl":{fontSize:`40px`}}}}),E={name:`Themed Fallback Type Scale`,render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default fallback (size × 0.4)`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`TY`,size:`xsm`}),(0,u.jsx)(r,{name:`XS`,size:`sm`}),(0,u.jsx)(r,{name:`SM`,size:`md`}),(0,u.jsx)(r,{name:`MD`,size:`lg`}),(0,u.jsx)(r,{name:`LG`,size:`xl`})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Themed fallback (per-size scale, regular weight, blue wash)`}),(0,u.jsx)(s,{theme:T,mode:`light`,children:(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`TY`,size:`xsm`}),(0,u.jsx)(r,{name:`XS`,size:`sm`}),(0,u.jsx)(r,{name:`SM`,size:`md`}),(0,u.jsx)(r,{name:`MD`,size:`lg`}),(0,u.jsx)(r,{name:`LG`,size:`xl`})]})})]})},D=n({name:`avatar-fallback-background`,components:{"avatar-fallback":{base:{backgroundColor:`var(--color-accent)`,color:`var(--color-on-accent)`}}}}),O={name:`Themed Fallback Background`,render:()=>(0,u.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default fallback background`}),(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`Ada Lovelace`,size:`lg`}),(0,u.jsx)(r,{name:`Grace Hopper`,size:`lg`}),(0,u.jsx)(r,{size:`lg`})]}),(0,u.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Themed fallback background (solid accent on initials and icon)`}),(0,u.jsx)(s,{theme:D,mode:`light`,children:(0,u.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,u.jsx)(r,{name:`Ada Lovelace`,size:`lg`}),(0,u.jsx)(r,{name:`Grace Hopper`,size:`lg`}),(0,u.jsx)(r,{size:`lg`})]})})]})},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'John Doe',
    size: 'lg'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
    size: 'lg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Initials Fallback</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="John Doe" size="lg" />
        <Avatar name="Alice" size="lg" />
        <Avatar name="Bob Smith Johnson" size="lg" />
        <Avatar name="Dr. Sarah Connor" size="lg" />
      </div>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Status Indicators</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=20" name="Online User" size="xl" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=21" name="Offline User" size="xl" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=22" name="Busy User" size="xl" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Status with Different Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="AB" size="md" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="CD" size="lg" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="EF" size="xl" status={<AvatarStatusDot label="Online" />} />
        <Avatar name="GH" size={72} status={<AvatarStatusDot label="Online" />} />
      </div>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
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
}`,...O.parameters?.docs?.source}}},k=[`Default`,`WithImage`,`AllSizes`,`WithImages`,`InitialsFallback`,`NoImageNoName`,`FallbackChain`,`WithStatus`,`StatusAcrossAllSizes`,`StatusWithSizes`,`StatusShapesAtSmallSizes`,`StatusWithIcon`,`NumericSizes`,`ThemedFallbackScale`,`ThemedFallbackBackground`]}))();export{m as AllSizes,f as Default,v as FallbackChain,g as InitialsFallback,_ as NoImageNoName,w as NumericSizes,b as StatusAcrossAllSizes,S as StatusShapesAtSmallSizes,C as StatusWithIcon,x as StatusWithSizes,O as ThemedFallbackBackground,E as ThemedFallbackScale,p as WithImage,h as WithImages,y as WithStatus,k as __namedExportsOrder,d as default};