// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {stripTemplateAssetRefs, template} from './template.mjs';

describe('stripTemplateAssetRefs', () => {
  it('replaces a /template-assets image path with an inline data URI', () => {
    const src =
      "const hero = '/template-assets/colorful-home-horizontal-1.png';";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces a /template-assets block-avatar image path', () => {
    const src = 'src="/template-assets/avatar-profile-05.jpg"';
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('replaces every /template-assets reference, not just the first', () => {
    const src = [
      "'/template-assets/colorful-home-horizontal-1.png'",
      "'/template-assets/illustrative-horizontal-3.png'",
      "'/template-assets/moody-scene-horizontal-1.png'",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(3);
  });

  it('preserves surrounding source structure', () => {
    const src =
      "const data = [{src: '/template-assets/x.png', alt: 'X'}];";
    const out = stripTemplateAssetRefs(src);
    expect(out).toContain("alt: 'X'");
    expect(out).toContain('const data = [{src:');
  });

  it('leaves non-Meta third-party image URLs untouched', () => {
    const src = [
      'src="https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png"',
      'src="https://raw.githubusercontent.com/aaronfagan/svg-credit-card-payment-icons/main/flat/visa.svg"',
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });

  it('leaves unrelated local paths untouched', () => {
    const src = "import x from './local.png'; const y = '/public/logo.svg';";
    const out = stripTemplateAssetRefs(src);
    expect(out).toBe(src);
  });

  // A video source swapped for the image placeholder produces a `<video>`
  // pointed at SVG data — the scaffolded LightboxVideo block could not play.
  it('replaces a /template-assets video path with a video data URI', () => {
    const src = "src: '/template-assets/Nature-1.mp4',";
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:video/mp4;base64,');
    expect(out).not.toContain('data:image/svg+xml,');
  });

  it('picks the placeholder per reference when a file mixes image and video', () => {
    const src = [
      "{src: '/template-assets/light-product-1.png', type: 'image'}",
      "{src: '/template-assets/Nature-1.mp4', type: 'video'}",
    ].join('\n');
    const out = stripTemplateAssetRefs(src);
    expect(out).not.toContain('/template-assets/');
    expect(out.match(/data:image\/svg\+xml,/g)).toHaveLength(1);
    expect(out.match(/data:video\/mp4;base64,/g)).toHaveLength(1);
    // Each placeholder lands on its own reference, not swapped.
    expect(out).toMatch(/data:image\/svg\+xml,[^\n]*type: 'image'/);
    expect(out).toMatch(/data:video\/mp4;base64,[^\n]*type: 'video'/);
  });

  it.each(['mp4', 'webm', 'mov', 'm4v', 'ogv'])('treats .%s as video', ext => {
    const out = stripTemplateAssetRefs(`'/template-assets/clip.${ext}'`);
    expect(out).toContain('data:video/mp4;base64,');
  });

  it('matches video extensions case-insensitively', () => {
    const out = stripTemplateAssetRefs("'/template-assets/Nature-1.MP4'");
    expect(out).toContain('data:video/mp4;base64,');
  });

  // The kind is decided by the LAST dotted segment. A single-segment pattern
  // read `min` out of `clip.min.mp4`, picked the image placeholder for a video,
  // and left a stray `.mp4` welded to the end of the data URI.
  it('reads the extension from the last dotted segment', () => {
    const out = stripTemplateAssetRefs("src: '/template-assets/clip.min.mp4',");
    expect(out).toContain('data:video/mp4;base64,');
    expect(out).not.toContain('data:image/svg+xml,');
    expect(out).not.toContain('.mp4');
  });

  it('does not treat a trailing non-media suffix as the extension', () => {
    const out = stripTemplateAssetRefs("'/template-assets/clip.mp4.bak'");
    expect(out).toContain('data:image/svg+xml,');
    expect(out).not.toContain('.bak');
  });

  // The demo-media dir ships `@2x` variants; a reference to one used to fall
  // straight through the pattern and 404 in the scaffolded project.
  it('replaces @2x filenames instead of leaving them behind', () => {
    const out = stripTemplateAssetRefs("'/template-assets/DATA-Ami-Pena@2x.png'");
    expect(out).not.toContain('/template-assets/');
    expect(out).toContain('data:image/svg+xml,');
  });

  it('leaves a reference with no extension alone', () => {
    const src = "'/template-assets/no-extension'";
    expect(stripTemplateAssetRefs(src)).toBe(src);
  });

  it('inlines an MP4 for video references', () => {
    const out = stripTemplateAssetRefs("'/template-assets/clip.mp4'");
    const encoded = out.match(/data:video\/mp4;base64,([A-Za-z0-9+/=]+)/);
    expect(encoded).not.toBeNull();
    const bytes = Buffer.from(encoded[1], 'base64');
    expect(bytes.subarray(4, 8).toString('ascii')).toBe('ftyp');
  });
});

// The inline video placeholder cannot be reviewed by reading it, so every
// property its source comment claims is asserted here against the actual bytes.
// Without this, the comment drifted: it advertised a two-second clip while the
// encoded movie was a single frame lasting 33ms.
describe('the inline video placeholder is what its docs claim', () => {
  /** Boxes that hold other boxes rather than a payload. */
  const CONTAINERS = new Set([
    'moov',
    'trak',
    'mdia',
    'minf',
    'stbl',
    'moof',
    'traf',
    'mvex',
    'dinf',
    'edts',
  ]);

  /**
   * Walk an ISO base media file, yielding every box with its byte range. This
   * doubles as the integrity check: a header running past the end of its
   * parent, or a size below the 8-byte header, throws. One byte added or
   * dropped anywhere in the file trips one of those.
   *
   * @param {Buffer} bytes
   * @param {number} [start]
   * @param {number} [end]
   * @returns {Generator<{type: string, body: number, end: number}>}
   */
  function* boxes(bytes, start = 0, end = bytes.length) {
    let offset = start;
    while (offset < end) {
      if (end - offset < 8) {
        throw new Error(`truncated box header at byte ${offset}`);
      }
      const size = bytes.readUInt32BE(offset);
      const type = bytes.toString('ascii', offset + 4, offset + 8);
      if (size < 8 || offset + size > end) {
        throw new Error(
          `box "${type}" at byte ${offset} declares ${size} bytes, past its parent`,
        );
      }
      yield {type, body: offset + 8, end: offset + size};
      if (CONTAINERS.has(type)) {
        yield* boxes(bytes, offset + 8, offset + size);
      } else if (type === 'stsd') {
        // Full box: version/flags then entry_count, then the sample entries.
        yield* boxes(bytes, offset + 16, offset + size);
      } else if (type === 'avc1') {
        // VisualSampleEntry: 78 bytes of fixed fields before its child boxes.
        yield* boxes(bytes, offset + 86, offset + size);
      }
      offset += size;
    }
  }

  /** @returns {Buffer} the decoded placeholder */
  // Decoded on first use, not while the suite is being collected: a broken
  // transform should fail these tests, not take the whole file down with it.
  let cached;
  function placeholder() {
    if (!cached) {
      const out = stripTemplateAssetRefs("'/template-assets/clip.mp4'");
      const encoded = out.match(/data:video\/mp4;base64,([A-Za-z0-9+/=]+)/);
      if (!encoded) {
        throw new Error('the transform produced no video data URI');
      }
      const decoded = Buffer.from(encoded[1], 'base64');
      cached = {bytes: decoded, parsed: [...boxes(decoded)]};
    }
    return cached;
  }

  const only = (parsed, type) => {
    const found = parsed.filter(b => b.type === type);
    if (found.length !== 1) {
      throw new Error(`expected exactly one "${type}" box, found ${found.length}`);
    }
    return found[0];
  };

  it('is a structurally intact MP4', () => {
    // Getting a parse at all means every box tiled its parent exactly.
    const {parsed} = placeholder();
    expect(parsed.map(b => b.type)).toEqual(
      expect.arrayContaining(['ftyp', 'moov', 'mdat']),
    );
  });

  it('carries one video track and no audio', () => {
    const {bytes, parsed} = placeholder();
    expect(parsed.filter(b => b.type === 'trak')).toHaveLength(1);
    const hdlr = only(parsed, 'hdlr');
    expect(bytes.toString('ascii', hdlr.body + 8, hdlr.body + 12)).toBe('vide');
    // An audio track would bring a sound media header and an audio sample entry.
    expect(parsed.some(b => b.type === 'smhd')).toBe(false);
    expect(parsed.some(b => b.type === 'mp4a')).toBe(false);
  });

  it('is 640x360', () => {
    const {bytes, parsed} = placeholder();
    const tkhd = only(parsed, 'tkhd');
    const wide = bytes[tkhd.body] === 1;
    // version/flags, times, track id, reserved, duration, reserved, layer,
    // alternate group, volume, reserved, then the 36-byte matrix.
    const dims =
      tkhd.body + 4 + (wide ? 16 : 8) + 8 + (wide ? 8 : 4) + 8 + 8 + 36;
    // 16.16 fixed point.
    expect(bytes.readUInt32BE(dims) / 65536).toBe(640);
    expect(bytes.readUInt32BE(dims + 4) / 65536).toBe(360);
  });

  /** Read an unsigned 32- or 64-bit big-endian field. */
  const uint = (bytes, at, wide) =>
    wide ? Number(bytes.readBigUInt64BE(at)) : bytes.readUInt32BE(at);

  /** Seconds of media the sample tables actually describe. */
  function sampleTable() {
    const {bytes, parsed} = placeholder();
    const mdhd = only(parsed, 'mdhd');
    const wide = bytes[mdhd.body] === 1;
    const timescale = bytes.readUInt32BE(mdhd.body + 4 + (wide ? 16 : 8));
    let frames = 0;
    let ticks = 0;
    for (const trun of parsed.filter(b => b.type === 'trun')) {
      const flags = bytes.readUInt32BE(trun.body) & 0xffffff;
      const count = bytes.readUInt32BE(trun.body + 4);
      let at = trun.body + 8;
      if (flags & 0x1) at += 4; // data offset
      if (flags & 0x4) at += 4; // first sample flags
      for (let i = 0; i < count; i++) {
        if (flags & 0x100) {
          ticks += bytes.readUInt32BE(at);
          at += 4;
        }
        if (flags & 0x200) at += 4; // sample size
        if (flags & 0x400) at += 4; // sample flags
        if (flags & 0x800) at += 4; // composition offset
        frames++;
      }
    }
    return {frames, seconds: ticks / timescale};
  }

  it('is a real clip, not a single frame', () => {
    // A single-frame movie is what shipped first: it declared 33ms and gave a
    // <video> nothing to scrub. Guard both the frame count and the timeline.
    const {frames, seconds} = sampleTable();
    expect(frames).toBeGreaterThan(1);
    expect(seconds).toBeGreaterThan(1);
    expect(seconds).toBeLessThan(3);
  });

  // The recorder wrote the movie-timescale duration into the media header, so
  // mdhd claimed 1/30th of the real length. A player that takes the track
  // duration from mdhd would show a scrubber 30x too short.
  it('agrees with itself about how long it is', () => {
    const {bytes, parsed} = placeholder();
    const {seconds} = sampleTable();

    const mvhd = only(parsed, 'mvhd');
    const mvWide = bytes[mvhd.body] === 1;
    const movieTimescale = bytes.readUInt32BE(
      mvhd.body + 4 + (mvWide ? 16 : 8),
    );
    const movieSeconds =
      uint(bytes, mvhd.body + 4 + (mvWide ? 16 : 8) + 4, mvWide) /
      movieTimescale;

    const tkhd = only(parsed, 'tkhd');
    const tkWide = bytes[tkhd.body] === 1;
    // version/flags, times, track id, reserved, then duration — in movie units.
    const trackSeconds =
      uint(bytes, tkhd.body + 4 + (tkWide ? 16 : 8) + 8, tkWide) /
      movieTimescale;

    const mdhd = only(parsed, 'mdhd');
    const mdWide = bytes[mdhd.body] === 1;
    const mediaTimescale = bytes.readUInt32BE(
      mdhd.body + 4 + (mdWide ? 16 : 8),
    );
    const mediaSeconds =
      uint(bytes, mdhd.body + 4 + (mdWide ? 16 : 8) + 4, mdWide) /
      mediaTimescale;

    for (const [name, value] of [
      ['mvhd', movieSeconds],
      ['tkhd', trackSeconds],
      ['mdhd', mediaSeconds],
    ]) {
      expect(`${name}=${value.toFixed(3)}s`).toBe(`${name}=${seconds.toFixed(3)}s`);
    }
  });

  it('is encoded as the H.264 profile the comment names', () => {
    const {bytes, parsed} = placeholder();
    const avcC = only(parsed, 'avcC');
    // configurationVersion, then profile / compatibility / level.
    const codec = [1, 2, 3]
      .map(i => bytes[avcC.body + i].toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    expect(codec).toBe('42C01F');
  });
});

describe('template --skeleton component extraction (prefix-agnostic)', () => {
  // Regression guard: templates author bare component names post un-prefix
  // migration (P2380608025). The extractors previously matched only the
  // `XDS`-prefixed form, so `--skeleton` returned an empty components list and
  // an empty skeleton body for bare templates.
  it('extracts components and a skeleton from a bare-named template', async () => {
    const result = await template('contact-form', {skeleton: true});

    expect(result.type).toBe('template.skeleton');
    expect(Array.isArray(result.data.components)).toBe(true);
    expect(result.data.components.length).toBeGreaterThan(0);
    // The contact-form template composes a Card + form inputs.
    expect(result.data.components).toContain('Card');
    expect(result.data.components).toContain('TextInput');

    // Skeleton body is non-empty and uses bare component tags (no XDS prefix).
    expect(result.data.skeleton.trim().length).toBeGreaterThan(0);
    expect(result.data.skeleton).toMatch(/<[A-Z]\w+/);
    expect(result.data.skeleton).not.toContain('<XDS');

    expect(result.data.skeleton).toContain('columns={{minWidth: 200}}');
  });
});
