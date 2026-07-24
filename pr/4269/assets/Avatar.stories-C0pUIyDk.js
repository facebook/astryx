import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{i as n,n as r,t as i}from"./Avatar-t1EyN3Lb.js";import{O as a,t as o}from"./esm-S3-01pr3.js";var s,c,l,u,d,f,p,m,h,g,_,v,y,b,x;e((()=>{i(),o(),s=t(),c={title:`Core/Avatar`,component:n,tags:[`autodocs`],argTypes:{size:{control:`select`,options:[`xsm`,`sm`,`md`,`lg`,`xl`,16,20,24,32,36,40,48,60,64,72,96,128,144,180],description:`Size of the avatar`},src:{control:`text`,description:`Primary image source URL`},fallbackSrc:{control:`text`,description:`Fallback image when primary fails`},name:{control:`text`,description:`User name for initials and alt text`},alt:{control:`text`,description:`Alt text (falls back to name)`},status:{control:`boolean`,description:`Show status indicator dot`,mapping:{true:(0,s.jsx)(r,{}),false:void 0}}}},l={args:{name:`John Doe`,size:`lg`}},u={args:{src:`https://i.pravatar.cc/150?img=1`,name:`Jane Smith`,size:`lg`}},d={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`TY`,size:`xsm`}),(0,s.jsx)(n,{name:`XS`,size:`sm`}),(0,s.jsx)(n,{name:`SM`,size:`md`}),(0,s.jsx)(n,{name:`MD`,size:`lg`}),(0,s.jsx)(n,{name:`LG`,size:`xl`})]})]})},f={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Images (Different Sizes)`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=1`,name:`User 1`,size:`xsm`}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=2`,name:`User 2`,size:`sm`}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=3`,name:`User 3`,size:`md`}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=4`,name:`User 4`,size:`lg`}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=5`,name:`User 5`,size:`xl`})]})]})},p={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Initials Fallback`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`John Doe`,size:`lg`}),(0,s.jsx)(n,{name:`Alice`,size:`lg`}),(0,s.jsx)(n,{name:`Bob Smith Johnson`,size:`lg`}),(0,s.jsx)(n,{name:`Dr. Sarah Connor`,size:`lg`})]})]})},m={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Default Icon (No Image or Name)`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{size:`xsm`}),(0,s.jsx)(n,{size:`sm`}),(0,s.jsx)(n,{size:`md`}),(0,s.jsx)(n,{size:`lg`}),(0,s.jsx)(n,{size:`xl`})]})]})},h={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Fallback Chain Demo`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Valid src`}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=10`,name:`Test User`,size:`xl`})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Invalid src, valid fallbackSrc`}),(0,s.jsx)(n,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://i.pravatar.cc/150?img=11`,name:`Test User`,size:`xl`})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`Both invalid, has name`}),(0,s.jsx)(n,{src:`https://invalid-url.example/broken.jpg`,fallbackSrc:`https://also-invalid.example/broken.jpg`,name:`Test User`,size:`xl`})]}),(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`p`,{className:`xrcdmg7 x9ynric`,children:`All invalid, no name`}),(0,s.jsx)(n,{src:`https://invalid-url.example/broken.jpg`,size:`xl`})]})]})]})},g={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`With Status Indicators`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=20`,name:`Online User`,size:`xl`,status:(0,s.jsx)(r,{variant:`success`,label:`Online`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=21`,name:`Offline User`,size:`xl`,status:(0,s.jsx)(r,{variant:`neutral`,label:`Offline`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=22`,name:`Busy User`,size:`xl`,status:(0,s.jsx)(r,{variant:`error`,label:`Busy`})})]})]})},_={name:`Status Dot Across All Sizes`,render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status dot scales proportionally with avatar size`}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`TY`,size:`xsm`,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{name:`XS`,size:`sm`,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{name:`SM`,size:`md`,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{name:`MD`,size:`lg`,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{name:`LG`,size:`xl`,status:(0,s.jsx)(r,{variant:`success`})})]}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,s.jsx)(r,{variant:`error`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,s.jsx)(r,{variant:`neutral`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,s.jsx)(r,{variant:`success`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,s.jsx)(r,{variant:`success`})})]}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Colors at Medium`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=40`,name:`Positive`,size:`lg`,status:(0,s.jsx)(r,{variant:`success`,label:`Online`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=41`,name:`Neutral`,size:`lg`,status:(0,s.jsx)(r,{variant:`neutral`,label:`Offline`})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=42`,name:`Negative`,size:`lg`,status:(0,s.jsx)(r,{variant:`error`,label:`Busy`})})]})]})},v={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Status with Different Sizes`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`AB`,size:`md`,status:(0,s.jsx)(r,{})}),(0,s.jsx)(n,{name:`CD`,size:`lg`,status:(0,s.jsx)(r,{})}),(0,s.jsx)(n,{name:`EF`,size:`xl`,status:(0,s.jsx)(r,{})}),(0,s.jsx)(n,{name:`GH`,size:72,status:(0,s.jsx)(r,{})})]})]})},y={name:`Status Dot with Icon`,render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Icon inside status dot (hidden at tiny sizes where there isn't room)`}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Named Sizes`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`TY`,size:`xsm`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{name:`XS`,size:`sm`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{name:`SM`,size:`md`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=50`,name:`MD`,size:`lg`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=51`,name:`LG`,size:`xl`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})})]}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Sizes with Images`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=30`,name:`U1`,size:20,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=31`,name:`U2`,size:32,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=32`,name:`U3`,size:48,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=33`,name:`U4`,size:72,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=34`,name:`U5`,size:96,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=35`,name:`U6`,size:128,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})})]}),(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`All Variants with Icons`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=52`,name:`Positive`,size:`xl`,status:(0,s.jsx)(r,{variant:`success`,label:`Verified`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=53`,name:`Neutral`,size:`xl`,status:(0,s.jsx)(r,{variant:`neutral`,label:`Pending`,icon:(0,s.jsx)(a,{})})}),(0,s.jsx)(n,{src:`https://i.pravatar.cc/150?img=54`,name:`Negative`,size:`xl`,status:(0,s.jsx)(r,{variant:`error`,label:`Rejected`,icon:(0,s.jsx)(a,{})})})]})]})},b={render:()=>(0,s.jsxs)(`div`,{className:`x78zum5 xdt5ytf x1qh66ti`,children:[(0,s.jsx)(`h4`,{className:`xrcdmg7 x9ynric`,children:`Numeric Pixel Sizes`}),(0,s.jsxs)(`div`,{className:`x78zum5 x6s0dn4 x18g69wz`,children:[(0,s.jsx)(n,{name:`16`,size:16}),(0,s.jsx)(n,{name:`24`,size:24}),(0,s.jsx)(n,{name:`36`,size:36}),(0,s.jsx)(n,{name:`48`,size:48}),(0,s.jsx)(n,{name:`72`,size:72}),(0,s.jsx)(n,{name:`96`,size:96}),(0,s.jsx)(n,{name:`128`,size:128})]})]})},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'John Doe',
    size: 'lg'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
    size: 'lg'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Initials Fallback</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="John Doe" size="lg" />
        <Avatar name="Alice" size="lg" />
        <Avatar name="Bob Smith Johnson" size="lg" />
        <Avatar name="Dr. Sarah Connor" size="lg" />
      </div>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>With Status Indicators</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=20" name="Online User" size="xl" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=21" name="Offline User" size="xl" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=22" name="Busy User" size="xl" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  name: 'Status Dot Across All Sizes',
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>
        Status dot scales proportionally with avatar size
      </h4>

      <h4 {...stylex.props(styles.heading)}>Named Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="TY" size="xsm" status={<AvatarStatusDot variant="success" />} />
        <Avatar name="XS" size="sm" status={<AvatarStatusDot variant="success" />} />
        <Avatar name="SM" size="md" status={<AvatarStatusDot variant="success" />} />
        <Avatar name="MD" size="lg" status={<AvatarStatusDot variant="success" />} />
        <Avatar name="LG" size="xl" status={<AvatarStatusDot variant="success" />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>Numeric Sizes with Images</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=30" name="U1" size={20} status={<AvatarStatusDot variant="success" />} />
        <Avatar src="https://i.pravatar.cc/150?img=31" name="U2" size={32} status={<AvatarStatusDot variant="success" />} />
        <Avatar src="https://i.pravatar.cc/150?img=32" name="U3" size={48} status={<AvatarStatusDot variant="error" />} />
        <Avatar src="https://i.pravatar.cc/150?img=33" name="U4" size={72} status={<AvatarStatusDot variant="neutral" />} />
        <Avatar src="https://i.pravatar.cc/150?img=34" name="U5" size={96} status={<AvatarStatusDot variant="success" />} />
        <Avatar src="https://i.pravatar.cc/150?img=35" name="U6" size={128} status={<AvatarStatusDot variant="success" />} />
      </div>

      <h4 {...stylex.props(styles.heading)}>All Colors at Medium</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar src="https://i.pravatar.cc/150?img=40" name="Positive" size="lg" status={<AvatarStatusDot variant="success" label="Online" />} />
        <Avatar src="https://i.pravatar.cc/150?img=41" name="Neutral" size="lg" status={<AvatarStatusDot variant="neutral" label="Offline" />} />
        <Avatar src="https://i.pravatar.cc/150?img=42" name="Negative" size="lg" status={<AvatarStatusDot variant="error" label="Busy" />} />
      </div>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div {...stylex.props(styles.storyWrapper)}>
      <h4 {...stylex.props(styles.heading)}>Status with Different Sizes</h4>
      <div {...stylex.props(styles.row)}>
        <Avatar name="AB" size="md" status={<AvatarStatusDot />} />
        <Avatar name="CD" size="lg" status={<AvatarStatusDot />} />
        <Avatar name="EF" size="xl" status={<AvatarStatusDot />} />
        <Avatar name="GH" size={72} status={<AvatarStatusDot />} />
      </div>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x=[`Default`,`WithImage`,`AllSizes`,`WithImages`,`InitialsFallback`,`NoImageNoName`,`FallbackChain`,`WithStatus`,`StatusAcrossAllSizes`,`StatusWithSizes`,`StatusWithIcon`,`NumericSizes`]}))();export{d as AllSizes,l as Default,h as FallbackChain,p as InitialsFallback,m as NoImageNoName,b as NumericSizes,_ as StatusAcrossAllSizes,y as StatusWithIcon,v as StatusWithSizes,u as WithImage,f as WithImages,g as WithStatus,x as __namedExportsOrder,c as default};