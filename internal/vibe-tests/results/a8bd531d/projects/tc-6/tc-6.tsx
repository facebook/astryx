import React, {useState} from 'react';
import {Heading} from '@astryxdesign/core/Heading';
import {Text} from '@astryxdesign/core/Text';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {RadioList} from '@astryxdesign/core/RadioList';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import stylex from '@stylexjs/stylex';

const styles = stylex.create({
  page: { maxWidth: 600, padding: 24, display: 'flex', flexDirection: 'column', gap: 24 },
  section: { display: 'flex', flexDirection: 'column', gap: 12 },
  preview: { padding: 24, borderRadius: 'var(--radius)', backgroundColor: 'var(--bg)', display: 'flex', flexDirection: 'column', gap: 8, border: '1px solid #e0e0e0' },
});

export default function AppearanceSettings() {
  const [radius, setRadius] = useState(8);
  const [fontSize, setFontSize] = useState(16);
  const [darkMode, setDarkMode] = useState(false);
  const [accentColor, setAccentColor] = useState('blue');

  return (
    <div {...stylex.props(styles.page)}>
      <Heading level={1}>Appearance</Heading>
      <Text type="supporting">Customize the look and feel of the application.</Text>

      <Card>
        <div {...stylex.props(styles.section)}>
          <RadioList label="Accent Color" value={accentColor} onChange={setAccentColor}>
            <RadioList.Item value="blue" label="Blue" />
            <RadioList.Item value="purple" label="Purple" />
            <RadioList.Item value="green" label="Green" />
            <RadioList.Item value="red" label="Red" />
          </RadioList>
        </div>
      </Card>

      <Card>
        <div {...stylex.props(styles.section)}>
          <Slider label="Border Radius" value={radius} onChange={setRadius} min={0} max={24} formatValue={(v) => `${v}px`} />
          <Slider label="Font Size" value={fontSize} onChange={setFontSize} min={12} max={24} formatValue={(v) => `${v}px`} />
        </div>
      </Card>

      <Card>
        <div {...stylex.props(styles.section)}>
          <Switch label="Dark mode" value={darkMode} onChange={setDarkMode} />
        </div>
      </Card>

      <Card>
        <Heading level={3}>Preview</Heading>
        <div style={{padding: 24, borderRadius: radius, fontSize, background: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#ffffff' : '#000000', border: '1px solid #e0e0e0'}}>
          <p style={{marginBottom: 8}}>This is a preview of your settings.</p>
          <Button label="Sample Button" variant="primary" />
        </div>
      </Card>
    </div>
  );
}
