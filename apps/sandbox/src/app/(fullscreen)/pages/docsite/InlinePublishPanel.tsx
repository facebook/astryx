'use client';

import React, {useState} from 'react';
import {XDSButton} from '@xds/core/Button';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSTextInput} from '@xds/core/TextInput';
import {XDSTextArea} from '@xds/core/TextArea';
import {XDSTokenizer} from '@xds/core/Tokenizer';
import {createStaticSource} from '@xds/core/Typeahead';
import {PUBLISH_TAGS} from './constants';
import {ArrowLeftIcon} from './docsite-icons';

// ---------------------------------------------------------------------------
// InlinePublishPanel — publish flow rendered inline in the left panel
// ---------------------------------------------------------------------------

export function InlinePublishPanel({
  templateName,
  isVisible: _isVisible,
  onBack,
}: {
  templateName: string;
  isVisible: boolean;
  onBack: () => void;
}) {
  const [name, setName] = useState(templateName);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([] as {id: string; label: string}[]);
  const tagSource = createStaticSource(
    PUBLISH_TAGS.map(t => ({id: t, label: t})),
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 20,
        overflowY: 'auto' as const,
        flex: 1,
      }}>
      {/* Back button */}
      <XDSButton
        label="Back"
        variant="ghost"
        size="sm"
        icon={<ArrowLeftIcon />}
        onClick={onBack}
        style={{marginLeft: -8, alignSelf: 'flex-start'}}
      />

      {/* Header */}
      <XDSHeading level={3}>Publish to community</XDSHeading>
      <XDSText type="supporting" color="secondary">
        Share your work so others on the team can use it as a starting point.
      </XDSText>

      {/* Template name input */}
      <XDSTextInput
        label="Template name"
        value={name}
        onChange={v => setName(v)}
        size="lg"
      />

      {/* Description textarea */}
      <XDSTextArea
        label="Description"
        placeholder="Describe what makes this template unique..."
        value={description}
        onChange={v => setDescription(v)}
        rows={3}
      />

      {/* Tags */}
      <XDSTokenizer
        label="Tags"
        searchSource={tagSource}
        value={tags}
        onChange={items => setTags(items)}
        placeholder="Add tags..."
        hasEntriesOnFocus
        hasCreate
        size="md"
      />

      {/* Publish button */}
      <XDSButton
        variant="primary"
        label="Publish template"
        size="lg"
        style={{width: '100%'}}
      />
    </div>
  );
}
