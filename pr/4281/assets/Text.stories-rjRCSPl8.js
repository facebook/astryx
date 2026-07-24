import{i as e}from"./preload-helper-CT_b8DTk.js";import{t}from"./jsx-runtime-DqZldVDK.js";import{t as n}from"./Text-Iat6xWeA.js";import{t as r}from"./Text-BUJwo4gL.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k;e((()=>{r(),i=t(),a={title:`Core/Text`,component:n,tags:[`autodocs`],argTypes:{type:{control:`select`,options:[`body`,`large`,`label`,`supporting`,`code`],description:`Semantic text type`},size:{control:`select`,options:[`4xs`,`3xs`,`2xs`,`xsm`,`sm`,`base`,`lg`,`xl`,`2xl`,`3xl`,`4xl`],description:`Explicit font size override`},color:{control:`select`,options:[`primary`,`secondary`,`disabled`,`placeholder`,`accent`,`inherit`],description:`Text color`},weight:{control:`select`,options:[`normal`,`medium`,`semibold`,`bold`],description:`Font weight override`},display:{control:`select`,options:[`inline`,`block`],description:`Display mode`},maxLines:{control:`number`,description:`Maximum lines before truncation (0 = no truncation)`},textWrap:{control:`select`,options:[`wrap`,`nowrap`,`balance`,`pretty`],description:`Text wrapping behavior`},wordBreak:{control:`select`,options:[`break-word`,`break-all`],description:`Word break behavior`},hasStrikethrough:{control:`boolean`,description:`Apply strikethrough decoration`},hasTabularNumbers:{control:`boolean`,description:`Use tabular (monospace) numbers`},hasCapsize:{control:`boolean`,description:`Enable optical alignment (text-box-trim)`},as:{control:`select`,options:[`span`,`p`,`div`,`label`],description:`HTML element to render`}}},o={args:{type:`body`,children:`Body text - the bulk of content (14px)`}},s={args:{type:`large`,children:`Large text - emphasized content, quotes, descriptions (16px)`}},c={args:{type:`label`,children:`Label text - form/chart/table labels (14px medium)`}},l={args:{type:`supporting`,children:`Supporting text - helper text, supplemental info (12px, secondary color)`}},u={args:{type:`code`,children:`const x = 1; // Inline code (14px monospace)`}},d={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`12px`},children:[(0,i.jsx)(n,{type:`body`,children:`Body: The bulk of content (14px)`}),(0,i.jsx)(n,{type:`large`,children:`Large: Emphasized content (16px)`}),(0,i.jsx)(n,{type:`label`,children:`Label: Form/chart labels (14px medium)`}),(0,i.jsx)(n,{type:`supporting`,children:`Supporting: Helper text (12px secondary)`}),(0,i.jsx)(n,{type:`code`,children:`Code: const x = 1; (14px monospace)`})]})},f={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,i.jsx)(n,{type:`body`,color:`primary`,children:`Primary color (default for body)`}),(0,i.jsx)(n,{type:`body`,color:`secondary`,children:`Secondary color`}),(0,i.jsx)(n,{type:`body`,color:`disabled`,children:`Disabled color`}),(0,i.jsx)(n,{type:`body`,color:`placeholder`,children:`Placeholder color`}),(0,i.jsx)(n,{type:`body`,color:`accent`,children:`Active color (accent)`}),(0,i.jsx)(`div`,{style:{color:`purple`},children:(0,i.jsx)(n,{type:`body`,color:`inherit`,children:`Inherit color (from parent)`})})]})},p={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,i.jsx)(n,{type:`body`,weight:`normal`,children:`Normal weight (400)`}),(0,i.jsx)(n,{type:`body`,weight:`medium`,children:`Medium weight (500)`}),(0,i.jsx)(n,{type:`body`,weight:`semibold`,children:`Semibold weight (600)`}),(0,i.jsx)(n,{type:`body`,weight:`bold`,children:`Bold weight (700)`})]})},m={render:()=>(0,i.jsxs)(`div`,{children:[(0,i.jsxs)(`div`,{style:{marginBottom:`16px`},children:[(0,i.jsxs)(n,{type:`body`,display:`inline`,children:[`Inline text`,` `]}),(0,i.jsxs)(n,{type:`body`,display:`inline`,children:[`flows together`,` `]}),(0,i.jsx)(n,{type:`body`,display:`inline`,children:`on the same line.`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`body`,display:`block`,children:`Block text takes its own line.`}),(0,i.jsx)(n,{type:`body`,display:`block`,children:`Each block is on a separate line.`})]})]})},h={render:()=>(0,i.jsx)(`div`,{style:{width:`300px`,border:`1px solid #ccc`,padding:`12px`},children:(0,i.jsx)(n,{type:`body`,maxLines:1,children:`This is a very long text that will be truncated to a single line. Hover over it to see the full content in a tooltip.`})})},g={render:()=>(0,i.jsx)(`div`,{style:{width:`300px`,border:`1px solid #ccc`,padding:`12px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,children:`This is a very long text that will be truncated to exactly two lines. When you hover over it, a tooltip will appear showing the full text content. This is useful for displaying preview text in cards and lists.`})})},_={render:()=>(0,i.jsx)(`div`,{style:{width:`300px`,border:`1px solid #ccc`,padding:`12px`},children:(0,i.jsx)(n,{type:`body`,maxLines:1,hasTruncateTooltip:!1,children:`This text is truncated but has no tooltip on hover. Sometimes you don't want a tooltip.`})})},v={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`300px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`1 Line:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:1,children:`This is a very long text that will be truncated to one line with ellipsis.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`2 Lines:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,children:`This is a very long text that will be truncated to two lines. The second line will end with an ellipsis if the content is too long.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`3 Lines:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:3,children:`This is a very long text that will be truncated to three lines. It allows for more content to be shown but still limits the vertical space. The third line will end with an ellipsis.`})})]})]})},y={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`24px`,maxWidth:`280px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`maxLines=1 (always worked):`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:1,children:`This single-line text is long enough to be truncated with an ellipsis. Hover to see the full content in a tooltip.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`maxLines=2 (was broken, now fixed):`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,children:`This two-line text should show a tooltip on hover when it overflows past two lines. Previously the tooltip never appeared because truncation was not detected. Now it works correctly.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`maxLines=3 (was broken, now fixed):`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:3,children:`This three-line text has even more content to demonstrate that the fix works for any maxLines value greater than one. The tooltip should appear on hover showing the full untruncated text. Previously this was broken because the browser reported clamped dimensions.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`maxLines=2, short text (no tooltip expected):`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,children:`Short text. No tooltip.`})})]})]})},b={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`16px`,maxWidth:`600px`},children:[(0,i.jsxs)(`div`,{style:{flex:1},children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`break-word (default for multi-line):`}),(0,i.jsx)(`div`,{style:{width:`150px`,border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,wordBreak:`break-word`,children:`Thisisaverylongwordthatneedstobreakatwordlevel`})})]}),(0,i.jsxs)(`div`,{style:{flex:1},children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`break-all (default for single-line):`}),(0,i.jsx)(`div`,{style:{width:`150px`,border:`1px solid #ccc`,padding:`8px`},children:(0,i.jsx)(n,{type:`body`,maxLines:2,wordBreak:`break-all`,children:`Thisisaverylongwordthatneedstobreakatanylevel`})})]})]})},x={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`,maxWidth:`400px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`wrap (default):`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`,width:`200px`},children:(0,i.jsx)(n,{type:`body`,textWrap:`wrap`,children:`This text wraps normally at word boundaries when it reaches the edge.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`nowrap:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`,width:`200px`,overflow:`hidden`},children:(0,i.jsx)(n,{type:`body`,textWrap:`nowrap`,children:`This text does not wrap and will overflow its container.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`balance:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`,width:`200px`},children:(0,i.jsx)(n,{type:`body`,textWrap:`balance`,children:`This text is balanced for better visual appearance across lines.`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`pretty:`}),(0,i.jsx)(`div`,{style:{border:`1px solid #ccc`,padding:`8px`,width:`200px`},children:(0,i.jsx)(n,{type:`body`,textWrap:`pretty`,children:`This text uses pretty wrap to avoid orphans at the end of paragraphs.`})})]})]})},S={args:{type:`body`,hasStrikethrough:!0,children:`This text has a strikethrough decoration`}},C={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`Without tabular numbers:`}),(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`},children:[(0,i.jsx)(n,{type:`body`,children:`1,234.56`}),(0,i.jsx)(n,{type:`body`,children:`99,999.99`}),(0,i.jsx)(n,{type:`body`,children:`111.11`})]})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`With tabular numbers:`}),(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`},children:[(0,i.jsx)(n,{type:`body`,hasTabularNumbers:!0,children:`1,234.56`}),(0,i.jsx)(n,{type:`body`,hasTabularNumbers:!0,children:`99,999.99`}),(0,i.jsx)(n,{type:`body`,hasTabularNumbers:!0,children:`111.11`})]})]})]})},w={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`Without capsize (red border shows extra space):`}),(0,i.jsx)(`div`,{style:{border:`1px solid red`,display:`inline-block`},children:(0,i.jsx)(n,{type:`large`,children:`Regular text with line-height space`})})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`With capsize (optically aligned):`}),(0,i.jsx)(`div`,{style:{border:`1px solid red`,display:`inline-block`},children:(0,i.jsx)(n,{type:`large`,hasCapsize:!0,children:`Capsize removes extra space`})})]})]})},T={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,flexDirection:`column`,gap:`8px`},children:[(0,i.jsx)(n,{type:`body`,as:`span`,children:`As span (default, inline)`}),(0,i.jsx)(n,{type:`body`,as:`p`,children:`As paragraph element`}),(0,i.jsx)(n,{type:`body`,as:`div`,children:`As div element`}),(0,i.jsx)(n,{type:`body`,as:`label`,children:`As label element`})]})},E={render:()=>(0,i.jsxs)(`div`,{style:{maxWidth:`300px`,padding:`16px`,borderRadius:`8px`,border:`1px solid #e0e0e0`,boxShadow:`0 2px 4px rgba(0,0,0,0.1)`},children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`Product Name`}),(0,i.jsx)(n,{type:`body`,maxLines:2,display:`block`,children:`This is a product description that might be quite long and needs to be truncated after two lines to keep the card compact.`}),(0,i.jsx)(n,{type:`supporting`,display:`block`,children:`Updated 5 minutes ago`})]})},D={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`24px`},children:[(0,i.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,i.jsx)(n,{type:`body`,color:`secondary`,display:`block`,children:`Revenue`}),(0,i.jsx)(n,{type:`large`,weight:`bold`,hasTabularNumbers:!0,children:`$1,234,567.89`})]}),(0,i.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,i.jsx)(n,{type:`body`,color:`secondary`,display:`block`,children:`Users`}),(0,i.jsx)(n,{type:`large`,weight:`bold`,hasTabularNumbers:!0,children:`12,345`})]}),(0,i.jsxs)(`div`,{style:{textAlign:`start`},children:[(0,i.jsx)(n,{type:`body`,color:`secondary`,display:`block`,children:`Conversion`}),(0,i.jsx)(n,{type:`large`,weight:`bold`,color:`accent`,hasTabularNumbers:!0,children:`23.4%`})]})]})},O={render:()=>(0,i.jsxs)(`div`,{style:{maxWidth:`300px`,display:`flex`,flexDirection:`column`,gap:`16px`},children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`Section title as label`}),(0,i.jsx)(n,{type:`body`,display:`block`,children:`Body text provides the main content or instructions for this section.`}),(0,i.jsx)(n,{type:`supporting`,display:`block`,children:`Supporting text adds extra context or constraints.`})]}),(0,i.jsxs)(`div`,{children:[(0,i.jsx)(n,{type:`label`,display:`block`,children:`Another section`}),(0,i.jsx)(n,{type:`body`,display:`block`,children:`These text types create a natural visual hierarchy without any additional styling.`}),(0,i.jsx)(n,{type:`supporting`,color:`accent`,display:`block`,children:`Active supporting text draws attention to important details.`})]})]})},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'body',
    children: 'Body text - the bulk of content (14px)'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'large',
    children: 'Large text - emphasized content, quotes, descriptions (16px)'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'label',
    children: 'Label text - form/chart/table labels (14px medium)'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'supporting',
    children: 'Supporting text - helper text, supplemental info (12px, secondary color)'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'code',
    children: 'const x = 1; // Inline code (14px monospace)'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  }}>
      <Text type="body">Body: The bulk of content (14px)</Text>
      <Text type="large">Large: Emphasized content (16px)</Text>
      <Text type="label">Label: Form/chart labels (14px medium)</Text>
      <Text type="supporting">Supporting: Helper text (12px secondary)</Text>
      <Text type="code">Code: const x = 1; (14px monospace)</Text>
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Text type="body" color="primary">
        Primary color (default for body)
      </Text>
      <Text type="body" color="secondary">
        Secondary color
      </Text>
      <Text type="body" color="disabled">
        Disabled color
      </Text>
      <Text type="body" color="placeholder">
        Placeholder color
      </Text>
      <Text type="body" color="accent">
        Active color (accent)
      </Text>
      <div style={{
      color: 'purple'
    }}>
        <Text type="body" color="inherit">
          Inherit color (from parent)
        </Text>
      </div>
    </div>
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Text type="body" weight="normal">
        Normal weight (400)
      </Text>
      <Text type="body" weight="medium">
        Medium weight (500)
      </Text>
      <Text type="body" weight="semibold">
        Semibold weight (600)
      </Text>
      <Text type="body" weight="bold">
        Bold weight (700)
      </Text>
    </div>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div>
      <div style={{
      marginBottom: '16px'
    }}>
        <Text type="body" display="inline">
          Inline text{' '}
        </Text>
        <Text type="body" display="inline">
          flows together{' '}
        </Text>
        <Text type="body" display="inline">
          on the same line.
        </Text>
      </div>
      <div>
        <Text type="body" display="block">
          Block text takes its own line.
        </Text>
        <Text type="body" display="block">
          Each block is on a separate line.
        </Text>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    border: '1px solid #ccc',
    padding: '12px'
  }}>
      <Text type="body" maxLines={1}>
        This is a very long text that will be truncated to a single line. Hover
        over it to see the full content in a tooltip.
      </Text>
    </div>
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    border: '1px solid #ccc',
    padding: '12px'
  }}>
      <Text type="body" maxLines={2}>
        This is a very long text that will be truncated to exactly two lines.
        When you hover over it, a tooltip will appear showing the full text
        content. This is useful for displaying preview text in cards and lists.
      </Text>
    </div>
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: '300px',
    border: '1px solid #ccc',
    padding: '12px'
  }}>
      <Text type="body" maxLines={1} hasTruncateTooltip={false}>
        This text is truncated but has no tooltip on hover. Sometimes you don't
        want a tooltip.
      </Text>
    </div>
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '300px'
  }}>
      <div>
        <Text type="label" display="block">
          1 Line:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={1}>
            This is a very long text that will be truncated to one line with
            ellipsis.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          2 Lines:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={2}>
            This is a very long text that will be truncated to two lines. The
            second line will end with an ellipsis if the content is too long.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          3 Lines:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={3}>
            This is a very long text that will be truncated to three lines. It
            allows for more content to be shown but still limits the vertical
            space. The third line will end with an ellipsis.
          </Text>
        </div>
      </div>
    </div>
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    maxWidth: '280px'
  }}>
      <div>
        <Text type="label" display="block">
          maxLines=1 (always worked):
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={1}>
            This single-line text is long enough to be truncated with an
            ellipsis. Hover to see the full content in a tooltip.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          maxLines=2 (was broken, now fixed):
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={2}>
            This two-line text should show a tooltip on hover when it overflows
            past two lines. Previously the tooltip never appeared because
            truncation was not detected. Now it works correctly.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          maxLines=3 (was broken, now fixed):
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={3}>
            This three-line text has even more content to demonstrate that the
            fix works for any maxLines value greater than one. The tooltip
            should appear on hover showing the full untruncated text. Previously
            this was broken because the browser reported clamped dimensions.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          maxLines=2, short text (no tooltip expected):
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={2}>
            Short text. No tooltip.
          </Text>
        </div>
      </div>
    </div>
}`,...y.parameters?.docs?.source},description:{story:"Demonstrates the fix for #1710: multi-line truncation tooltip now works.\nPreviously, hovering over clamped multi-line text never showed a tooltip\nbecause `-webkit-line-clamp` caused `scrollHeight === offsetHeight`.",...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '16px',
    maxWidth: '600px'
  }}>
      <div style={{
      flex: 1
    }}>
        <Text type="label" display="block">
          break-word (default for multi-line):
        </Text>
        <div style={{
        width: '150px',
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={2} wordBreak="break-word">
            Thisisaverylongwordthatneedstobreakatwordlevel
          </Text>
        </div>
      </div>
      <div style={{
      flex: 1
    }}>
        <Text type="label" display="block">
          break-all (default for single-line):
        </Text>
        <div style={{
        width: '150px',
        border: '1px solid #ccc',
        padding: '8px'
      }}>
          <Text type="body" maxLines={2} wordBreak="break-all">
            Thisisaverylongwordthatneedstobreakatanylevel
          </Text>
        </div>
      </div>
    </div>
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    maxWidth: '400px'
  }}>
      <div>
        <Text type="label" display="block">
          wrap (default):
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px',
        width: '200px'
      }}>
          <Text type="body" textWrap="wrap">
            This text wraps normally at word boundaries when it reaches the
            edge.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          nowrap:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px',
        width: '200px',
        overflow: 'hidden'
      }}>
          <Text type="body" textWrap="nowrap">
            This text does not wrap and will overflow its container.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          balance:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px',
        width: '200px'
      }}>
          <Text type="body" textWrap="balance">
            This text is balanced for better visual appearance across lines.
          </Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          pretty:
        </Text>
        <div style={{
        border: '1px solid #ccc',
        padding: '8px',
        width: '200px'
      }}>
          <Text type="body" textWrap="pretty">
            This text uses pretty wrap to avoid orphans at the end of
            paragraphs.
          </Text>
        </div>
      </div>
    </div>
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'body',
    hasStrikethrough: true,
    children: 'This text has a strikethrough decoration'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <div>
        <Text type="label" display="block">
          Without tabular numbers:
        </Text>
        <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
          <Text type="body">1,234.56</Text>
          <Text type="body">99,999.99</Text>
          <Text type="body">111.11</Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          With tabular numbers:
        </Text>
        <div style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
          <Text type="body" hasTabularNumbers>
            1,234.56
          </Text>
          <Text type="body" hasTabularNumbers>
            99,999.99
          </Text>
          <Text type="body" hasTabularNumbers>
            111.11
          </Text>
        </div>
      </div>
    </div>
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <div>
        <Text type="label" display="block">
          Without capsize (red border shows extra space):
        </Text>
        <div style={{
        border: '1px solid red',
        display: 'inline-block'
      }}>
          <Text type="large">Regular text with line-height space</Text>
        </div>
      </div>
      <div>
        <Text type="label" display="block">
          With capsize (optically aligned):
        </Text>
        <div style={{
        border: '1px solid red',
        display: 'inline-block'
      }}>
          <Text type="large" hasCapsize>
            Capsize removes extra space
          </Text>
        </div>
      </div>
    </div>
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  }}>
      <Text type="body" as="span">
        As span (default, inline)
      </Text>
      <Text type="body" as="p">
        As paragraph element
      </Text>
      <Text type="body" as="div">
        As div element
      </Text>
      <Text type="body" as="label">
        As label element
      </Text>
    </div>
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: '300px',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
      <Text type="label" display="block">
        Product Name
      </Text>
      <Text type="body" maxLines={2} display="block">
        This is a product description that might be quite long and needs to be
        truncated after two lines to keep the card compact.
      </Text>
      <Text type="supporting" display="block">
        Updated 5 minutes ago
      </Text>
    </div>
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: '24px'
  }}>
      <div style={{
      textAlign: 'start'
    }}>
        <Text type="body" color="secondary" display="block">
          Revenue
        </Text>
        <Text type="large" weight="bold" hasTabularNumbers>
          $1,234,567.89
        </Text>
      </div>
      <div style={{
      textAlign: 'start'
    }}>
        <Text type="body" color="secondary" display="block">
          Users
        </Text>
        <Text type="large" weight="bold" hasTabularNumbers>
          12,345
        </Text>
      </div>
      <div style={{
      textAlign: 'start'
    }}>
        <Text type="body" color="secondary" display="block">
          Conversion
        </Text>
        <Text type="large" weight="bold" color="accent" hasTabularNumbers>
          23.4%
        </Text>
      </div>
    </div>
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    maxWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>
      <div>
        <Text type="label" display="block">
          Section title as label
        </Text>
        <Text type="body" display="block">
          Body text provides the main content or instructions for this section.
        </Text>
        <Text type="supporting" display="block">
          Supporting text adds extra context or constraints.
        </Text>
      </div>
      <div>
        <Text type="label" display="block">
          Another section
        </Text>
        <Text type="body" display="block">
          These text types create a natural visual hierarchy without any
          additional styling.
        </Text>
        <Text type="supporting" color="accent" display="block">
          Active supporting text draws attention to important details.
        </Text>
      </div>
    </div>
}`,...O.parameters?.docs?.source},description:{story:`Text types in a form-like context. Note: for actual forms, prefer
TextInput or TextArea which include built-in labels and
descriptions. This example shows how Text types pair with content.`,...O.parameters?.docs?.description}}},k=[`Body`,`Large`,`Label`,`Supporting`,`Code`,`AllTypes`,`ColorVariants`,`WeightVariants`,`DisplayModes`,`SingleLineTruncation`,`MultiLineTruncation`,`TruncationWithoutTooltip`,`TruncationVariants`,`MultiLineTruncationTooltip`,`WordBreakVariants`,`TextWrapVariants`,`Strikethrough`,`TabularNumbers`,`Capsize`,`AsElements`,`CardExample`,`MetricsExample`,`FormLikeContext`]}))();export{d as AllTypes,T as AsElements,o as Body,w as Capsize,E as CardExample,u as Code,f as ColorVariants,m as DisplayModes,O as FormLikeContext,c as Label,s as Large,D as MetricsExample,g as MultiLineTruncation,y as MultiLineTruncationTooltip,h as SingleLineTruncation,S as Strikethrough,l as Supporting,C as TabularNumbers,x as TextWrapVariants,v as TruncationVariants,_ as TruncationWithoutTooltip,p as WeightVariants,b as WordBreakVariants,k as __namedExportsOrder,a as default};