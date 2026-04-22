'use client';

import React, {useState} from 'react';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSButton} from '@xds/core/Button';
import {XDSCard} from '@xds/core/Card';
import {XDSAvatar} from '@xds/core/Avatar';
import {XDSBadge} from '@xds/core/Badge';
import {XDSBanner} from '@xds/core/Banner';
import {XDSCheckboxInput} from '@xds/core/CheckboxInput';
import {XDSDropdownMenu} from '@xds/core/DropdownMenu';
import {XDSProgressBar} from '@xds/core/ProgressBar';
import {XDSRadioList, XDSRadioListItem} from '@xds/core/RadioList';
import {XDSSlider} from '@xds/core/Slider';
import {XDSSpinner} from '@xds/core/Spinner';
import {XDSSwitch} from '@xds/core/Switch';
import {XDSTabList, XDSTab} from '@xds/core/TabList';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSSelector} from '@xds/core/Selector';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSToken} from '@xds/core/Token';
import {XDSTooltip} from '@xds/core/Tooltip';

export const COMPONENT_PREVIEW_LIST: {
  key: string;
  label: string;
  preview: React.ReactNode;
}[] = [
  {
    key: 'button',
    label: 'Button',
    preview: (
      <div
        style={{
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
        <XDSButton label="Primary" variant="primary" />
        <XDSButton label="Secondary" variant="secondary" />
        <XDSButton label="Ghost" variant="ghost" />
      </div>
    ),
  },
  {
    key: 'avatar',
    label: 'Avatar',
    preview: (
      <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
        <XDSAvatar name="Alice" size="small" />
        <XDSAvatar name="Bob" size="medium" />
        <XDSAvatar name="Charlie" size="large" />
      </div>
    ),
  },
  {
    key: 'badge',
    label: 'Badge',
    preview: (
      <div style={{display: 'flex', gap: 10, flexWrap: 'wrap'}}>
        <XDSBadge label="Default" />
        <XDSBadge label="Info" variant="info" />
        <XDSBadge label="Success" variant="success" />
        <XDSBadge label="Warning" variant="warning" />
        <XDSBadge label="Error" variant="error" />
      </div>
    ),
  },
  {
    key: 'card',
    label: 'Card',
    preview: (
      <XDSCard>
        <div style={{padding: 16}}>
          <XDSHeading level={4}>Card Title</XDSHeading>
          <div style={{marginTop: 8}}>
            <XDSText type="body" color="secondary">
              A flexible surface for grouping related content.
            </XDSText>
          </div>
        </div>
      </XDSCard>
    ),
  },
  {
    key: 'banner',
    label: 'Banner',
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          width: '100%',
        }}>
        <XDSBanner status="info" title="Information">
          <XDSText type="body">Informational message.</XDSText>
        </XDSBanner>
        <XDSBanner status="success" title="Success">
          <XDSText type="body">Operation completed.</XDSText>
        </XDSBanner>
      </div>
    ),
  },
  {
    key: 'textinput',
    label: 'TextInput',
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxWidth: 320,
        }}>
        <XDSTextInput label="Name" placeholder="Enter your name" value="" />
        <XDSTextInput label="Email" placeholder="you@example.com" value="" />
      </div>
    ),
  },
  {
    key: 'tablist',
    label: 'TabList',
    preview: <TabListPreview />,
  },
  {
    key: 'dropdownmenu',
    label: 'DropdownMenu',
    preview: (
      <div style={{display: 'flex', gap: 12}}>
        <XDSDropdownMenu
          button={{label: 'Actions', variant: 'secondary', size: 'md'}}
          items={[
            {label: 'Edit'},
            {label: 'Duplicate'},
            {label: 'Archive'},
            {label: 'Delete'},
          ]}
        />
        <XDSDropdownMenu
          button={{label: 'Options', variant: 'ghost', size: 'md'}}
          items={[{label: 'Settings'}, {label: 'Preferences'}, {label: 'Help'}]}
        />
      </div>
    ),
  },
  {
    key: 'switch',
    label: 'Switch',
    preview: <SwitchPreview />,
  },
  {
    key: 'checkbox',
    label: 'Checkbox',
    preview: <CheckboxPreview />,
  },
  {
    key: 'radiolist',
    label: 'RadioList',
    preview: <RadioListPreview />,
  },
  {
    key: 'progressbar',
    label: 'ProgressBar',
    preview: (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          width: '100%',
          minWidth: 280,
        }}>
        <div style={{width: '100%'}}>
          <XDSText type="supporting" color="secondary">
            25%
          </XDSText>
          <div style={{marginTop: 6, width: '100%'}}>
            <XDSProgressBar value={25} label="Progress" isLabelHidden />
          </div>
        </div>
        <div style={{width: '100%'}}>
          <XDSText type="supporting" color="secondary">
            60%
          </XDSText>
          <div style={{marginTop: 6, width: '100%'}}>
            <XDSProgressBar value={60} label="Progress" isLabelHidden />
          </div>
        </div>
        <div style={{width: '100%'}}>
          <XDSText type="supporting" color="secondary">
            100%
          </XDSText>
          <div style={{marginTop: 6, width: '100%'}}>
            <XDSProgressBar value={100} label="Progress" isLabelHidden />
          </div>
        </div>
      </div>
    ),
  },
  {
    key: 'slider',
    label: 'Slider',
    preview: <SliderPreview />,
  },
  {
    key: 'token',
    label: 'Token',
    preview: (
      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        <XDSToken label="Design" />
        <XDSToken label="Engineering" />
        <XDSToken label="Product" />
        <XDSToken label="Research" />
      </div>
    ),
  },
  {
    key: 'tooltip',
    label: 'Tooltip',
    preview: (
      <div style={{display: 'flex', gap: 12}}>
        <XDSTooltip content="Primary action">
          <XDSButton label="Hover me" variant="primary" />
        </XDSTooltip>
        <XDSTooltip content="Secondary action">
          <XDSButton label="Or me" variant="secondary" />
        </XDSTooltip>
      </div>
    ),
  },
  {
    key: 'selector',
    label: 'Selector',
    preview: <SelectorPreview />,
  },
  {
    key: 'spinner',
    label: 'Spinner',
    preview: (
      <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
        <XDSSpinner size="sm" />
        <XDSSpinner size="md" />
        <XDSSpinner size="lg" />
      </div>
    ),
  },
  {
    key: 'text',
    label: 'Text',
    preview: (
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        <XDSHeading level={2}>Heading</XDSHeading>
        <XDSText type="body">Body text for content and descriptions.</XDSText>
        <XDSText type="supporting" color="secondary">
          Supporting text for metadata.
        </XDSText>
      </div>
    ),
  },
  {
    key: 'textarea',
    label: 'TextArea',
    preview: (
      <div style={{width: '100%'}}>
        <XDSTextArea
          label="Message"
          placeholder="Write something..."
          value=""
        />
      </div>
    ),
  },
];

export const COMPONENT_PREVIEWS: {[key: string]: React.ReactNode} =
  Object.fromEntries(COMPONENT_PREVIEW_LIST.map(c => [c.key, c.preview]));

function SwitchPreview() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 240,
      }}>
      <XDSSwitch label="Notifications" value={a} onChange={v => setA(v)} />
      <XDSSwitch label="Dark mode" value={b} onChange={v => setB(v)} />
    </div>
  );
}

function TabListPreview() {
  const [tab, setTab] = useState('overview');
  return (
    <XDSTabList value={tab} onChange={setTab}>
      <XDSTab value="overview" label="Overview" />
      <XDSTab value="analytics" label="Analytics" />
      <XDSTab value="settings" label="Settings" />
    </XDSTabList>
  );
}

function CheckboxPreview() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(false);
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <XDSCheckboxInput
        label="Accept terms"
        value={a}
        onChange={v => setA(v)}
      />
      <XDSCheckboxInput
        label="Subscribe to newsletter"
        value={b}
        onChange={v => setB(v)}
      />
      <XDSCheckboxInput label="Remember me" value={c} onChange={v => setC(v)} />
    </div>
  );
}

function RadioListPreview() {
  const [val, setVal] = useState('medium');
  return (
    <XDSRadioList label="Size" value={val} onChange={setVal}>
      <XDSRadioListItem value="small" label="Small" />
      <XDSRadioListItem value="medium" label="Medium" />
      <XDSRadioListItem value="large" label="Large" />
    </XDSRadioList>
  );
}

function SliderPreview() {
  const [val, setVal] = useState(50);
  return (
    <div style={{width: '100%'}}>
      <XDSSlider label="Volume" value={val} onChange={setVal} />
    </div>
  );
}

function SelectorPreview() {
  const [val, setVal] = useState('option1');
  return (
    <div style={{width: '100%'}}>
      <XDSSelector
        label="Category"
        value={val}
        onChange={setVal}
        options={[
          {value: 'option1', label: 'Design'},
          {value: 'option2', label: 'Engineering'},
          {value: 'option3', label: 'Product'},
        ]}
      />
    </div>
  );
}
