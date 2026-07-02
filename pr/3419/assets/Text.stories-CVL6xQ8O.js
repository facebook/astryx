import{T as t,a1 as e}from"./iframe-JfpySt6L.js";import"./preload-helper-Ct5FWWRu.js";const W={title:"Core/Text",component:t,tags:["autodocs"],argTypes:{type:{control:"select",options:["body","large","label","supporting","code"],description:"Semantic text type"},size:{control:"select",options:["4xs","3xs","2xs","xsm","sm","base","lg","xl","2xl","3xl","4xl"],description:"Explicit font size override"},color:{control:"select",options:["primary","secondary","disabled","placeholder","accent","inherit"],description:"Text color"},weight:{control:"select",options:["normal","medium","semibold","bold"],description:"Font weight override"},display:{control:"select",options:["inline","block"],description:"Display mode"},maxLines:{control:"number",description:"Maximum lines before truncation (0 = no truncation)"},textWrap:{control:"select",options:["wrap","nowrap","balance","pretty"],description:"Text wrapping behavior"},wordBreak:{control:"select",options:["break-word","break-all"],description:"Word break behavior"},hasStrikethrough:{control:"boolean",description:"Apply strikethrough decoration"},hasTabularNumbers:{control:"boolean",description:"Use tabular (monospace) numbers"},hasCapsize:{control:"boolean",description:"Enable optical alignment (text-box-trim)"},as:{control:"select",options:["span","p","div","label"],description:"HTML element to render"}}},o={args:{type:"body",children:"Body text - the bulk of content (14px)"}},s={args:{type:"large",children:"Large text - emphasized content, quotes, descriptions (16px)"}},l={args:{type:"label",children:"Label text - form/chart/table labels (14px medium)"}},a={args:{type:"supporting",children:"Supporting text - helper text, supplemental info (12px, secondary color)"}},d={args:{type:"code",children:"const x = 1; // Inline code (14px monospace)"}},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[e.jsx(t,{type:"body",children:"Body: The bulk of content (14px)"}),e.jsx(t,{type:"large",children:"Large: Emphasized content (16px)"}),e.jsx(t,{type:"label",children:"Label: Form/chart labels (14px medium)"}),e.jsx(t,{type:"supporting",children:"Supporting: Helper text (12px secondary)"}),e.jsx(t,{type:"code",children:"Code: const x = 1; (14px monospace)"})]})},p={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(t,{type:"body",color:"primary",children:"Primary color (default for body)"}),e.jsx(t,{type:"body",color:"secondary",children:"Secondary color"}),e.jsx(t,{type:"body",color:"disabled",children:"Disabled color"}),e.jsx(t,{type:"body",color:"placeholder",children:"Placeholder color"}),e.jsx(t,{type:"body",color:"accent",children:"Active color (accent)"}),e.jsx("div",{style:{color:"purple"},children:e.jsx(t,{type:"body",color:"inherit",children:"Inherit color (from parent)"})})]})},c={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(t,{type:"body",weight:"normal",children:"Normal weight (400)"}),e.jsx(t,{type:"body",weight:"medium",children:"Medium weight (500)"}),e.jsx(t,{type:"body",weight:"semibold",children:"Semibold weight (600)"}),e.jsx(t,{type:"body",weight:"bold",children:"Bold weight (700)"})]})},x={render:()=>e.jsxs("div",{children:[e.jsxs("div",{style:{marginBottom:"16px"},children:[e.jsxs(t,{type:"body",display:"inline",children:["Inline text"," "]}),e.jsxs(t,{type:"body",display:"inline",children:["flows together"," "]}),e.jsx(t,{type:"body",display:"inline",children:"on the same line."})]}),e.jsxs("div",{children:[e.jsx(t,{type:"body",display:"block",children:"Block text takes its own line."}),e.jsx(t,{type:"body",display:"block",children:"Each block is on a separate line."})]})]})},y={render:()=>e.jsx("div",{style:{width:"300px",border:"1px solid #ccc",padding:"12px"},children:e.jsx(t,{type:"body",maxLines:1,children:"This is a very long text that will be truncated to a single line. Hover over it to see the full content in a tooltip."})})},h={render:()=>e.jsx("div",{style:{width:"300px",border:"1px solid #ccc",padding:"12px"},children:e.jsx(t,{type:"body",maxLines:2,children:"This is a very long text that will be truncated to exactly two lines. When you hover over it, a tooltip will appear showing the full text content. This is useful for displaying preview text in cards and lists."})})},b={render:()=>e.jsx("div",{style:{width:"300px",border:"1px solid #ccc",padding:"12px"},children:e.jsx(t,{type:"body",maxLines:1,hasTruncateTooltip:!1,children:"This text is truncated but has no tooltip on hover. Sometimes you don't want a tooltip."})})},u={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"300px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"1 Line:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:1,children:"This is a very long text that will be truncated to one line with ellipsis."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"2 Lines:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:2,children:"This is a very long text that will be truncated to two lines. The second line will end with an ellipsis if the content is too long."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"3 Lines:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:3,children:"This is a very long text that will be truncated to three lines. It allows for more content to be shown but still limits the vertical space. The third line will end with an ellipsis."})})]})]})},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",maxWidth:"280px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"maxLines=1 (always worked):"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:1,children:"This single-line text is long enough to be truncated with an ellipsis. Hover to see the full content in a tooltip."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"maxLines=2 (was broken, now fixed):"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:2,children:"This two-line text should show a tooltip on hover when it overflows past two lines. Previously the tooltip never appeared because truncation was not detected. Now it works correctly."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"maxLines=3 (was broken, now fixed):"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:3,children:"This three-line text has even more content to demonstrate that the fix works for any maxLines value greater than one. The tooltip should appear on hover showing the full untruncated text. Previously this was broken because the browser reported clamped dimensions."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"maxLines=2, short text (no tooltip expected):"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:2,children:"Short text. No tooltip."})})]})]})},m={render:()=>e.jsxs("div",{style:{display:"flex",gap:"16px",maxWidth:"600px"},children:[e.jsxs("div",{style:{flex:1},children:[e.jsx(t,{type:"label",display:"block",children:"break-word (default for multi-line):"}),e.jsx("div",{style:{width:"150px",border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:2,wordBreak:"break-word",children:"Thisisaverylongwordthatneedstobreakatwordlevel"})})]}),e.jsxs("div",{style:{flex:1},children:[e.jsx(t,{type:"label",display:"block",children:"break-all (default for single-line):"}),e.jsx("div",{style:{width:"150px",border:"1px solid #ccc",padding:"8px"},children:e.jsx(t,{type:"body",maxLines:2,wordBreak:"break-all",children:"Thisisaverylongwordthatneedstobreakatanylevel"})})]})]})},v={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",maxWidth:"400px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"wrap (default):"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px",width:"200px"},children:e.jsx(t,{type:"body",textWrap:"wrap",children:"This text wraps normally at word boundaries when it reaches the edge."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"nowrap:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px",width:"200px",overflow:"hidden"},children:e.jsx(t,{type:"body",textWrap:"nowrap",children:"This text does not wrap and will overflow its container."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"balance:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px",width:"200px"},children:e.jsx(t,{type:"body",textWrap:"balance",children:"This text is balanced for better visual appearance across lines."})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"pretty:"}),e.jsx("div",{style:{border:"1px solid #ccc",padding:"8px",width:"200px"},children:e.jsx(t,{type:"body",textWrap:"pretty",children:"This text uses pretty wrap to avoid orphans at the end of paragraphs."})})]})]})},T={args:{type:"body",hasStrikethrough:!0,children:"This text has a strikethrough decoration"}},g={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"Without tabular numbers:"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx(t,{type:"body",children:"1,234.56"}),e.jsx(t,{type:"body",children:"99,999.99"}),e.jsx(t,{type:"body",children:"111.11"})]})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"With tabular numbers:"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column"},children:[e.jsx(t,{type:"body",hasTabularNumbers:!0,children:"1,234.56"}),e.jsx(t,{type:"body",hasTabularNumbers:!0,children:"99,999.99"}),e.jsx(t,{type:"body",hasTabularNumbers:!0,children:"111.11"})]})]})]})},w={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"Without capsize (red border shows extra space):"}),e.jsx("div",{style:{border:"1px solid red",display:"inline-block"},children:e.jsx(t,{type:"large",children:"Regular text with line-height space"})})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"With capsize (optically aligned):"}),e.jsx("div",{style:{border:"1px solid red",display:"inline-block"},children:e.jsx(t,{type:"large",hasCapsize:!0,children:"Capsize removes extra space"})})]})]})},j={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:[e.jsx(t,{type:"body",as:"span",children:"As span (default, inline)"}),e.jsx(t,{type:"body",as:"p",children:"As paragraph element"}),e.jsx(t,{type:"body",as:"div",children:"As div element"}),e.jsx(t,{type:"body",as:"label",children:"As label element"})]})},f={render:()=>e.jsxs("div",{style:{maxWidth:"300px",padding:"16px",borderRadius:"8px",border:"1px solid #e0e0e0",boxShadow:"0 2px 4px rgba(0,0,0,0.1)"},children:[e.jsx(t,{type:"label",display:"block",children:"Product Name"}),e.jsx(t,{type:"body",maxLines:2,display:"block",children:"This is a product description that might be quite long and needs to be truncated after two lines to keep the card compact."}),e.jsx(t,{type:"supporting",display:"block",children:"Updated 5 minutes ago"})]})},k={render:()=>e.jsxs("div",{style:{display:"flex",gap:"24px"},children:[e.jsxs("div",{style:{textAlign:"start"},children:[e.jsx(t,{type:"body",color:"secondary",display:"block",children:"Revenue"}),e.jsx(t,{type:"large",weight:"bold",hasTabularNumbers:!0,children:"$1,234,567.89"})]}),e.jsxs("div",{style:{textAlign:"start"},children:[e.jsx(t,{type:"body",color:"secondary",display:"block",children:"Users"}),e.jsx(t,{type:"large",weight:"bold",hasTabularNumbers:!0,children:"12,345"})]}),e.jsxs("div",{style:{textAlign:"start"},children:[e.jsx(t,{type:"body",color:"secondary",display:"block",children:"Conversion"}),e.jsx(t,{type:"large",weight:"bold",color:"accent",hasTabularNumbers:!0,children:"23.4%"})]})]})},r={render:()=>e.jsxs("div",{style:{maxWidth:"300px",display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"Section title as label"}),e.jsx(t,{type:"body",display:"block",children:"Body text provides the main content or instructions for this section."}),e.jsx(t,{type:"supporting",display:"block",children:"Supporting text adds extra context or constraints."})]}),e.jsxs("div",{children:[e.jsx(t,{type:"label",display:"block",children:"Another section"}),e.jsx(t,{type:"body",display:"block",children:"These text types create a natural visual hierarchy without any additional styling."}),e.jsx(t,{type:"supporting",color:"accent",display:"block",children:"Active supporting text draws attention to important details."})]})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'body',
    children: 'Body text - the bulk of content (14px)'
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'large',
    children: 'Large text - emphasized content, quotes, descriptions (16px)'
  }
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'label',
    children: 'Label text - form/chart/table labels (14px medium)'
  }
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'supporting',
    children: 'Supporting text - helper text, supplemental info (12px, secondary color)'
  }
}`,...a.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'code',
    children: 'const x = 1; // Inline code (14px monospace)'
  }
}`,...d.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
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
}`,...n.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source},description:{story:"Demonstrates the fix for #1710: multi-line truncation tooltip now works.\nPreviously, hovering over clamped multi-line text never showed a tooltip\nbecause `-webkit-line-clamp` caused `scrollHeight === offsetHeight`.",...i.parameters?.docs?.description}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'body',
    hasStrikethrough: true,
    children: 'This text has a strikethrough decoration'
  }
}`,...T.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
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
}`,...j.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...r.parameters?.docs?.source},description:{story:`Text types in a form-like context. Note: for actual forms, prefer
TextInput or TextArea which include built-in labels and
descriptions. This example shows how Text types pair with content.`,...r.parameters?.docs?.description}}};const D=["Body","Large","Label","Supporting","Code","AllTypes","ColorVariants","WeightVariants","DisplayModes","SingleLineTruncation","MultiLineTruncation","TruncationWithoutTooltip","TruncationVariants","MultiLineTruncationTooltip","WordBreakVariants","TextWrapVariants","Strikethrough","TabularNumbers","Capsize","AsElements","CardExample","MetricsExample","FormLikeContext"];export{n as AllTypes,j as AsElements,o as Body,w as Capsize,f as CardExample,d as Code,p as ColorVariants,x as DisplayModes,r as FormLikeContext,l as Label,s as Large,k as MetricsExample,h as MultiLineTruncation,i as MultiLineTruncationTooltip,y as SingleLineTruncation,T as Strikethrough,a as Supporting,g as TabularNumbers,v as TextWrapVariants,u as TruncationVariants,b as TruncationWithoutTooltip,c as WeightVariants,m as WordBreakVariants,D as __namedExportsOrder,W as default};
