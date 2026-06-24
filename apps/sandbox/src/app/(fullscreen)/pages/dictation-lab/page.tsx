// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useState, useCallback, useRef} from 'react';
import {VStack, HStack} from '@astryxdesign/core/Stack';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Divider} from '@astryxdesign/core/Divider';
import {Badge} from '@astryxdesign/core/Badge';
import {
  ChatComposer,
  ChatDictationButton,
  useChatDictation,
  ChatComposerInput,
} from '@astryxdesign/core/Chat';
import type {ChatComposerInputHandle} from '@astryxdesign/core/Chat';

// =============================================================================
// Shared AudioContext — Safari fix
// Mobile Safari blocks AudioContext created outside user gestures.
// We lazily create one shared context and reuse it across all tone functions.
// =============================================================================

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContext();
  }
  if (sharedAudioContext.state === 'suspended') {
    sharedAudioContext.resume();
  }
  return sharedAudioContext;
}

// =============================================================================
// Sound Mixer — Attack Styles × Note Patterns
// =============================================================================

type AttackStyleDef = {
  id: string;
  label: string;
  waveType: OscillatorType;
  noteDuration: number;
  pitchBend: number;
  attackTime: number;
  pitchDrop: number;
  harmonics: Array<{ratio: number; gain: number}>;
  volumeMultiplier: number;
  decayCurve: 'fast' | 'slow' | 'resonant';
};

type NotePatternDef = {
  id: string;
  label: string;
  desc: string;
  startNotes: Array<{freq: number; delay: number}>;
  stopNotes: Array<{freq: number; delay: number}>;
};

function playMixedNotes(
  notes: Array<{freq: number; delay: number}>,
  style: AttackStyleDef,
  volume: number,
) {
  const ctx = getAudioContext();
  const now = ctx.currentTime;
  notes.forEach(({freq, delay}) => {
    // Scale duration for low frequencies — bass needs more time to speak.
    // Below 200Hz, stretch proportionally (e.g. 65Hz gets ~3x the duration).
    const freqScale = freq < 200 ? Math.max(1, 200 / freq) : 1;
    const dur = style.noteDuration * Math.min(freqScale, 3);
    const allHarmonics: Array<{ratio: number; gain: number}> = [
      {ratio: 1, gain: 1},
      ...style.harmonics,
    ];
    allHarmonics.forEach(({ratio, gain: hGain}) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const f = freq * ratio;
      const v = volume * style.volumeMultiplier * hGain;

      osc.type = style.waveType;
      osc.frequency.setValueAtTime(f * style.pitchBend, now + delay);
      osc.frequency.exponentialRampToValueAtTime(
        f,
        now + delay + style.attackTime,
      );
      if (style.pitchDrop !== 1) {
        osc.frequency.exponentialRampToValueAtTime(
          f * style.pitchDrop,
          now + delay + dur,
        );
      }

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.setValueAtTime(v, now + delay);

      if (style.decayCurve === 'fast') {
        gainNode.gain.exponentialRampToValueAtTime(
          v * 0.2,
          now + delay + dur * 0.12,
        );
      } else if (style.decayCurve === 'slow') {
        gainNode.gain.exponentialRampToValueAtTime(
          v * 0.4,
          now + delay + dur * 0.3,
        );
      } else {
        gainNode.gain.exponentialRampToValueAtTime(
          v * 0.15,
          now + delay + dur * 0.1,
        );
      }
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });
  });
}

const attackStyles: AttackStyleDef[] = [
  {
    id: 'drip',
    label: 'Drip',
    waveType: 'sine',
    noteDuration: 0.09,
    pitchBend: 1.3,
    attackTime: 0.01,
    pitchDrop: 0.97,
    harmonics: [],
    volumeMultiplier: 1,
    decayCurve: 'fast',
  },
  {
    id: 'gentle',
    label: 'Gentle',
    waveType: 'triangle',
    noteDuration: 0.2,
    pitchBend: 1.3,
    attackTime: 0.01,
    pitchDrop: 0.97,
    harmonics: [],
    volumeMultiplier: 1,
    decayCurve: 'slow',
  },
  {
    id: 'resonant',
    label: 'Resonant',
    waveType: 'sine',
    noteDuration: 0.25,
    pitchBend: 1.15,
    attackTime: 0.008,
    pitchDrop: 1,
    harmonics: [{ratio: 2.4, gain: 0.3}],
    volumeMultiplier: 1,
    decayCurve: 'resonant',
  },
  {
    id: 'kalimba',
    label: 'Kalimba',
    waveType: 'sine',
    noteDuration: 0.15,
    pitchBend: 1.15,
    attackTime: 0.008,
    pitchDrop: 1,
    harmonics: [{ratio: 2.4, gain: 0.3}],
    volumeMultiplier: 1.2,
    decayCurve: 'resonant',
  },
  {
    id: 'plop',
    label: 'Plop',
    waveType: 'sine',
    noteDuration: 0.06,
    pitchBend: 1.3,
    attackTime: 0.01,
    pitchDrop: 0.93,
    harmonics: [],
    volumeMultiplier: 1,
    decayCurve: 'fast',
  },
  {
    id: 'singing-bowl',
    label: 'Singing Bowl',
    waveType: 'sine',
    noteDuration: 0.4,
    pitchBend: 1.08,
    attackTime: 0.01,
    pitchDrop: 1,
    harmonics: [{ratio: 2.0, gain: 0.25}],
    volumeMultiplier: 0.9,
    decayCurve: 'slow',
  },
];

const notePatterns: NotePatternDef[] = [
  {
    id: 'v-i',
    label: 'V \u2192 I',
    desc: 'G-B-D \u2192 C-E-G \u2014 the classic resolution',
    startNotes: [
      {freq: 392, delay: 0},
      {freq: 494, delay: 0.05},
      {freq: 587, delay: 0.1},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 659, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
  },
  {
    id: 'sus4-major',
    label: 'sus4 \u2192 major',
    desc: 'C-F-G \u2192 C-E-G \u2014 suspended tension releasing',
    startNotes: [
      {freq: 523, delay: 0},
      {freq: 698, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 659, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
  },
  {
    id: 'dim-major',
    label: 'dim \u2192 major',
    desc: 'B-D-F \u2192 C-E-G \u2014 maximum tension to clean',
    startNotes: [
      {freq: 494, delay: 0},
      {freq: 587, delay: 0.05},
      {freq: 698, delay: 0.1},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 659, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
  },
  {
    id: 'min-major',
    label: 'minor \u2192 major',
    desc: 'C-Eb-G \u2192 C-E-G \u2014 dark to bright',
    startNotes: [
      {freq: 523, delay: 0},
      {freq: 622, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 659, delay: 0.05},
      {freq: 784, delay: 0.1},
    ],
  },
  {
    id: 'maj7sharp11',
    label: 'Cmaj7#11',
    desc: 'C2-B3-G3-D4-F#4 \u2014 wide voicing, jazz/film tension',
    startNotes: [
      {freq: 65.4, delay: 0},
      {freq: 246.9, delay: 0.04},
      {freq: 196.0, delay: 0.07},
      {freq: 293.7, delay: 0.1},
      {freq: 370.0, delay: 0.13},
    ],
    stopNotes: [
      {freq: 65.4, delay: 0},
      {freq: 246.9, delay: 0.04},
      {freq: 164.8, delay: 0.07},
      {freq: 196.0, delay: 0.1},
    ],
  },
  {
    id: 'tritone-fifth',
    label: 'tritone \u2192 fifth',
    desc: 'F-B \u2192 C-G \u2014 dissonance to consonance',
    startNotes: [
      {freq: 349, delay: 0},
      {freq: 494, delay: 0.06},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 784, delay: 0.06},
    ],
  },
  {
    id: 'asc-fourth',
    label: 'ascending 4th',
    desc: 'G \u2192 C \u2014 simple doorbell, strong pull',
    startNotes: [
      {freq: 392, delay: 0},
      {freq: 523, delay: 0.07},
    ],
    stopNotes: [
      {freq: 523, delay: 0},
      {freq: 392, delay: 0.07},
    ],
  },
  {
    id: 'whole-tone',
    label: 'whole tone',
    desc: 'C-D-E \u2192 E-D-C, rising energy then settling',
    startNotes: [
      {freq: 523, delay: 0},
      {freq: 587, delay: 0.05},
      {freq: 659, delay: 0.1},
    ],
    stopNotes: [
      {freq: 659, delay: 0},
      {freq: 587, delay: 0.05},
      {freq: 523, delay: 0.1},
    ],
  },
  {
    id: 'triple-asc',
    label: 'triple ascending',
    desc: '400-600-850 \u2192 800-550-350',
    startNotes: [
      {freq: 400, delay: 0},
      {freq: 600, delay: 0.05},
      {freq: 850, delay: 0.1},
    ],
    stopNotes: [
      {freq: 800, delay: 0},
      {freq: 550, delay: 0.05},
      {freq: 350, delay: 0.1},
    ],
  },
];

// =============================================================================
// Sound bars button — volume-reactive bands + hue shift (for Live Demo)
// =============================================================================

function SoundBarsButton({
  dictation,
  size = 'md',
}: {
  dictation: ReturnType<typeof useChatDictation>;
  size?: 'sm' | 'md';
}) {
  const {isListening, bands, volume} = dictation;
  const isClipping = volume >= 0.1;

  const hueShift = isClipping ? Math.min((volume - 0.1) / 0.1, 1) * 60 : 0;
  const barColor = isClipping
    ? `hsl(calc(var(--accent-hue, 210) + ${hueShift}), 80%, 50%)`
    : 'var(--color-accent, hsl(210, 80%, 50%))';

  const boostedBands = bands.map(b => Math.min(Math.pow(b / 0.1, 0.5), 1));

  const barCount = 5;
  const barWidth = size === 'sm' ? 2 : 2.5;
  const barGap = size === 'sm' ? 1.5 : 2;
  const barMaxHeight = size === 'sm' ? 14 : 18;
  const barMinScale = 0.15;

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      {isListening && (
        <span
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: barGap,
            height: barMaxHeight,
            pointerEvents: 'none',
            zIndex: 1,
          }}>
          {boostedBands.slice(0, barCount).map((level, i) => {
            const scale = barMinScale + level * (1 - barMinScale);
            return (
              <span
                key={i}
                style={{
                  width: barWidth,
                  height: '100%',
                  borderRadius: barWidth / 2,
                  backgroundColor: barColor,
                  transformOrigin: 'center',
                  transform: `scaleY(${scale})`,
                  transition:
                    'transform 0.06s ease-out, background-color 0.15s ease-out',
                }}
              />
            );
          })}
        </span>
      )}
      <Button
        label={isListening ? 'Stop dictation' : 'Start dictation'}
        aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
        variant="ghost"
        size={size}
        icon={
          isListening ? undefined : <Icon icon="microphone" size={size} />
        }
        isIconOnly
        onClick={dictation.toggle}
      />
    </span>
  );
}

// =============================================================================
// Page-level styles
// =============================================================================

// =============================================================================
// Page
// =============================================================================

export default function DictationLabPage() {
  const [volume, setVolume] = useState(0.25);
  const [messages, setMessages] = useState<string[]>([]);
  const [selectedAttack, setSelectedAttack] = useState('drip');
  const [selectedPattern, setSelectedPattern] = useState('v-i');
  const inputRef = useRef<ChatComposerInputHandle>(null);

  const dictation = useChatDictation({
    inputRef,
    hasSounds: true,
    onResult: text => {
      console.log('Final:', text);
    },
  });

  const handleSubmit = useCallback((value: string) => {
    setMessages(prev => [...prev, value]);
  }, []);

  // Simulated volume for each visual variant

  return (
    <div style={{maxWidth: 800, margin: '0 auto', padding: 32}}>
      <VStack gap={6}>
        <VStack gap={2}>
          <Heading level={2}>Dictation Lab</Heading>
          <Text type="body" color="secondary">
            Test voice dictation, tune sound effects, and explore animation
            variants.
          </Text>
        </VStack>

        <Divider />

        {/* ---- Live Demo ---- */}
        <VStack gap={3}>
          <Heading level={3}>Live Demo</Heading>
          <Text type="supporting" color="secondary">
            
            Click the mic button to start dictating. Speak naturally; the
            volume ring reacts to your voice.
          </Text>

          {messages.length > 0 && (
            <Card>
              <VStack gap={2} style={{padding: 12}}>
                {messages.map((msg, i) => (
                  <Text type="body" key={i}>
                    {msg}
                  </Text>
                ))}
              </VStack>
            </Card>
          )}

          <ChatComposer
            onSubmit={handleSubmit}
            input={<ChatComposerInput handleRef={inputRef} />}
            sendActions={<ChatDictationButton dictation={dictation} />}
          />

          {dictation.isListening && (
            <HStack gap={3} vAlign="center">
              <Badge label="Listening" variant="red" />
              <div
                style={{
                  flex: 1,
                  height: 6,
                  backgroundColor: 'var(--color-background-muted, #eee)',
                  borderRadius: 3,
                  overflow: 'hidden',
                }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor:
                      dictation.volume > 0.1
                        ? `hsl(calc(var(--accent-hue, 210) + ${Math.min((dictation.volume - 0.1) / 0.1, 1) * 60}), 80%, 50%)`
                        : 'var(--color-success, #22c55e)',
                    borderRadius: 3,
                    transition: 'width 0.08s ease-out',
                    width: `${Math.min(dictation.volume * 200, 100)}%`,
                  }}
                />
              </div>
              <Text
                type="supporting"
                style={{fontFamily: 'monospace', minWidth: 40}}>
                {dictation.volume.toFixed(2)}
              </Text>
            </HStack>
          )}

          {/* Debug: Raw vs Calibrated bands */}
          {dictation.isListening && (
            <VStack gap={1}>
              <Text type="supporting" weight="semibold">
                Band Debug (raw vs calibrated)
              </Text>
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  fontFamily: 'monospace',
                  fontSize: 11,
                }}>
                {['170-340', '340-860', '860-1.7k', '1.7-3k', '3k+'].map(
                  (label, i) => {
                    const raw = dictation.rawBands[i] ?? 0;
                    const clean = dictation.bands[i] ?? 0;
                    const barH = 40;
                    return (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: 2,
                          flex: 1,
                        }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-end',
                            height: barH,
                          }}>
                          <div
                            style={{
                              width: 8,
                              backgroundColor: 'rgba(200,200,200,0.5)',
                              height: Math.min(raw * barH * 5, barH),
                              borderRadius: 2,
                            }}
                          />
                          <div
                            style={{
                              width: 8,
                              backgroundColor:
                                'var(--color-accent, hsl(210, 80%, 50%))',
                              height: Math.min(clean * barH * 5, barH),
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span style={{opacity: 0.5, fontSize: 9}}>{label}</span>
                        <span style={{opacity: 0.4}}>r:{raw.toFixed(3)}</span>
                        <span
                          style={{
                            color: 'var(--color-accent, hsl(210, 80%, 50%))',
                          }}>
                          c:{clean.toFixed(3)}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
              <Text type="supporting" color="disabled">
                Gray = raw mic input, Blue = after noise floor subtraction
              </Text>
            </VStack>
          )}

          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Sound bars variant:
            </Text>
            <SoundBarsButton dictation={dictation} />
          </HStack>

          {!dictation.isSupported && (
            <Badge
              label="SpeechRecognition not supported in this browser"
              variant="yellow"
            />
          )}
        </VStack>

        <Divider />

        {/* ---- Sound Mixer ---- */}
        <VStack gap={3}>
          <Heading level={3}>Sound Mixer</Heading>
          <Text type="supporting" color="secondary">
            
            Combine any attack style with any note pattern. All synthesized: no
            audio files.
          </Text>

          <HStack gap={3} vAlign="center">
            <Text type="supporting">Volume</Text>
            <input
              type="range"
              min={0.05}
              max={0.5}
              step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              style={{flex: 1, maxWidth: 200}}
            />
            <Text
              type="supporting"
              style={{fontFamily: 'monospace', minWidth: 40}}>
              {volume.toFixed(2)}
            </Text>
          </HStack>

          <VStack gap={1}>
            <Text type="label">Attack Style</Text>
            <HStack gap={1} wrap="wrap">
              {attackStyles.map(s => (
                <Button
                  key={s.id}
                  label={s.label}
                  variant={selectedAttack === s.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedAttack(s.id)}
                />
              ))}
            </HStack>
          </VStack>

          <VStack gap={1}>
            <Text type="label">Note Pattern</Text>
            <HStack gap={1} wrap="wrap">
              {notePatterns.map(p => (
                <Button
                  key={p.id}
                  label={p.label}
                  variant={selectedPattern === p.id ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPattern(p.id)}
                />
              ))}
            </HStack>
          </VStack>

          <HStack gap={3} vAlign="center">
            <Text type="body" weight="medium">
              {attackStyles.find(s => s.id === selectedAttack)?.label}
              {' \u00d7 '}
              {notePatterns.find(p => p.id === selectedPattern)?.label}
            </Text>
            <Button
              label="Preview Start"
              variant="secondary"
              size="sm"
              onClick={() => {
                const style = attackStyles.find(s => s.id === selectedAttack);
                const pattern = notePatterns.find(
                  p => p.id === selectedPattern,
                );
                if (style && pattern) {
                  playMixedNotes(pattern.startNotes, style, volume);
                }
              }}
            />
            <Button
              label="Preview Stop"
              variant="ghost"
              size="sm"
              onClick={() => {
                const style = attackStyles.find(s => s.id === selectedAttack);
                const pattern = notePatterns.find(
                  p => p.id === selectedPattern,
                );
                if (style && pattern) {
                  playMixedNotes(pattern.stopNotes, style, volume);
                }
              }}
            />
          </HStack>

          <Text type="supporting" color="secondary">
            {notePatterns.find(p => p.id === selectedPattern)?.desc}
          </Text>
        </VStack>
      </VStack>
    </div>
  );
}
