'use client';

import {XDSChatDictationButton} from '@xds/core/Chat';
import type {UseSpeechRecognitionReturn} from '@xds/core/Chat';

const noop = () => {};

const base: UseSpeechRecognitionReturn = {
  volume: 0,
  rawBands: [0, 0, 0, 0, 0],
  bands: [0, 0, 0, 0, 0],
  isSupported: true,
  isListening: false,
  isSpeaking: false,
  interimTranscript: '',
  start: noop,
  stop: noop,
  abort: noop,
  toggle: noop,
};

const idle: UseSpeechRecognitionReturn = {...base};

const listening: UseSpeechRecognitionReturn = {
  ...base,
  volume: 0.05,
  rawBands: [0.08, 0.06, 0.04, 0.02, 0.01],
  bands: [0.08, 0.06, 0.04, 0.02, 0.01],
  isListening: true,
};

const speaking: UseSpeechRecognitionReturn = {
  ...base,
  volume: 0.12,
  rawBands: [0.15, 0.12, 0.08, 0.05, 0.02],
  bands: [0.15, 0.12, 0.08, 0.05, 0.02],
  isListening: true,
  isSpeaking: true,
  interimTranscript: 'hello world',
};

export default function ChatDictationDictationStates() {
  return (
    <div style={{display: 'flex', gap: 24, alignItems: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <XDSChatDictationButton dictation={idle} />
        <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>Idle</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <XDSChatDictationButton dictation={listening} />
        <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>Listening</span>
      </div>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
        <XDSChatDictationButton dictation={speaking} />
        <span style={{fontSize: 12, color: 'var(--color-text-secondary)'}}>Speaking</span>
      </div>
    </div>
  );
}
