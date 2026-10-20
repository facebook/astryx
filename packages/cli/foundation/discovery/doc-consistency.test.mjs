// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file What an integration's docs say that no reader serves: a prop listed
 * twice, an overlay's text for a prop the doc lacks, an empty section, two
 * sections with one key, a replaces/extends target that is no topic, and an
 * overlay of no topic. Each is a warning with a fix.
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {integrationDocConsistency} from './doc-consistency.mjs';

/** @type {string} */
let pkg;

beforeEach(() => {
  pkg = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-doc-consistency-'));
});

afterEach(() => {
  fs.rmSync(pkg, {recursive: true, force: true});
});

/** @param {string} rel @param {string} text */
function write(rel, text) {
  const file = path.join(pkg, rel);
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, text);
}

const WIDGET = {
  type: 'component',
  name: 'Widget',
  displayName: 'Widget',
  props: [
    {name: 'label', type: 'string', description: 'Text.', required: true},
    {name: 'size', type: "'sm' | 'md'", description: 'Size.'},
  ],
};

/** @param {object} [fields] */
const topic = (fields = {}) => ({
  type: 'generic',
  name: 'deploying',
  title: 'Deploying',
  description: 'How to deploy.',
  sections: [{title: 'Overview', content: [{type: 'prose', text: 'Ship it.'}]}],
  ...fields,
});

function check() {
  return integrationDocConsistency(
    {
      components: path.join(pkg, 'components'),
      docs: path.join(pkg, 'docs'),
    },
    pkg,
  );
}

describe('integrationDocConsistency', () => {
  it('passes docs a reader serves whole, overlays with a name included', async () => {
    write(
      'components/Widget.doc.mjs',
      `export default ${JSON.stringify(WIDGET)};\nexport const docsZh = {name: 'Widget', displayName: '小部件', propDescriptions: {label: '文本'}};\n`,
    );
    write(
      'docs/deploying.doc.mjs',
      `export const docs = ${JSON.stringify(topic({replaces: 'theme'}))};\n`,
    );
    write(
      'docs/deploying.doc.zh.mjs',
      "export const docsZh = {title: '部署'};\n",
    );
    write(
      'docs/more.doc.mjs',
      `export const docs = ${JSON.stringify(topic({name: 'more', extends: 'deploying'}))};\n`,
    );

    expect(await check()).toEqual([]);
  });

  it('names a prop documented twice and an overlay key that names no prop, with the fix', async () => {
    write(
      'components/Widget.doc.mjs',
      `export default ${JSON.stringify({
        ...WIDGET,
        props: [
          ...WIDGET.props,
          {name: 'label', type: 'string', description: 'Again.'},
        ],
      })};\nexport const docsDense = {propDescriptions: {labell: 'txt', nothinglike: 'x'}};\n`,
    );

    const issues = await check();

    expect(issues.map(issue => issue.code)).toEqual([
      'duplicate_prop',
      'unknown_translated_prop',
      'unknown_translated_prop',
    ]);
    expect(issues.every(issue => issue.severity === 'warning')).toBe(true);
    expect(issues[0]).toMatchObject({
      message: `Widget's prop "label" is documented twice: props[0] and props[2].`,
      fix: 'In components/Widget.doc.mjs, delete props[2] (the second "label" entry), keeping what it adds in props[0].',
      file: 'components/Widget.doc.mjs',
    });
    expect(issues[1].fix).toBe(
      'In components/Widget.doc.mjs, rename the key "labell" in docsDense.propDescriptions to "label".',
    );
    expect(issues[2].fix).toBe(
      'In components/Widget.doc.mjs, remove "nothinglike" from docsDense.propDescriptions, or document the prop "nothinglike" first.',
    );
  });

  it("checks a sub-component overlay's keys against that sub-component's props", async () => {
    write(
      'components/Group.doc.mjs',
      `export default ${JSON.stringify({
        type: 'component',
        name: 'Group',
        components: [
          {
            name: 'GroupItem',
            props: [{name: 'value', type: 'string', description: 'V.'}],
          },
        ],
      })};\nexport const docsZh = {components: [{name: 'GroupItem', description: '项', propDescriptions: {valu: '值'}}]};\n`,
    );

    const issues = await check();

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'unknown_translated_prop',
        message: expect.stringContaining(
          'docsZh.components[0].propDescriptions names "valu", but GroupItem',
        ),
      }),
    ]);
  });

  it('names an empty section and two sections whose keys collide, however their titles are written', async () => {
    write(
      'docs/deploying.doc.mjs',
      `export const docs = ${JSON.stringify(
        topic({
          sections: [
            {title: 'Overview', content: [{type: 'prose', text: 'One.'}]},
            {title: 'Next steps', content: []},
            {title: 'overview!', content: [{type: 'prose', text: 'Two.'}]},
          ],
        }),
      )};\n`,
    );

    const issues = await check();

    expect(issues.map(issue => issue.code)).toEqual([
      'empty_section',
      'duplicate_section_key',
    ]);
    expect(issues[0].fix).toContain('give sections[1] content');
    expect(issues[1]).toMatchObject({
      message:
        'Topic "deploying": sections[0] "Overview" and sections[2] "overview!" both have the key "overview", so `astryx docs deploying overview` opens only sections[0].',
      fix: "In docs/deploying.doc.mjs, give sections[2] its own title, or a distinct id such as id: 'overview-3'.",
    });
  });

  it('names a replaces or extends target that is a near miss of a Core or own topic', async () => {
    write(
      'docs/deploying.doc.mjs',
      `export const docs = ${JSON.stringify(topic({replaces: 'theem'}))};\n`,
    );
    write(
      'docs/themes.doc.mjs',
      `export const docs = ${JSON.stringify(topic({name: 'themes', extends: 'deployng'}))};\n`,
    );

    const issues = await check();

    expect(issues.map(issue => [issue.code, issue.file])).toEqual([
      ['unknown_topic_target', 'docs/deploying.doc.mjs'],
      ['unknown_topic_target', 'docs/themes.doc.mjs'],
    ]);
    expect(issues[0]).toMatchObject({
      severity: 'warning',
      fix: "In docs/deploying.doc.mjs, change replaces: 'theem' to replaces: 'theme'.",
    });
    expect(issues[1].fix).toBe(
      "In docs/themes.doc.mjs, change extends: 'deployng' to extends: 'deploying'.",
    );
  });

  it("never flags a target that may be another integration's topic: one the project sees, a qualified one, or one near no known topic", async () => {
    write(
      'docs/deploying.doc.mjs',
      `export const docs = ${JSON.stringify(topic({replaces: 'other-kit-guide'}))};\n`,
    );
    write(
      'docs/themes.doc.mjs',
      `export const docs = ${JSON.stringify(topic({name: 'themes', extends: 'theem'}))};\n`,
    );
    write(
      'docs/more.doc.mjs',
      `export const docs = ${JSON.stringify(topic({name: 'more', replaces: 'no-such-core-topic'}))};\n`,
    );
    write(
      'docs/qualified.doc.mjs',
      `export const docs = ${JSON.stringify(topic({name: 'qualified', replaces: '@other/kit:theem'}))};\n`,
    );

    const issues = await integrationDocConsistency(
      {docs: path.join(pkg, 'docs')},
      pkg,
      {visibleTopic: name => ['other-kit-guide', 'theem'].includes(name)},
    );

    expect(issues).toEqual([]);
  });

  it('names an overlay file beside no topic file', async () => {
    write(
      'docs/deploying.doc.mjs',
      `export const docs = ${JSON.stringify(topic())};\n`,
    );
    write('docs/ghost.doc.zh.mjs', "export default {title: '幽灵'};\n");
    write('docs/deployng.doc.dense.mjs', "export default {title: 'x'};\n");

    const issues = await check();

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'orphan_doc_overlay',
        file: 'docs/deployng.doc.dense.mjs',
        fix: 'Rename docs/deployng.doc.dense.mjs to docs/deploying.doc.dense.mjs, the overlay of deploying.doc.mjs.',
      }),
      expect.objectContaining({
        code: 'orphan_doc_overlay',
        file: 'docs/ghost.doc.zh.mjs',
        message:
          'docs/ghost.doc.zh.mjs overlays a topic file ghost.doc.mjs that does not exist, so it ships and is never read.',
        fix: 'Delete docs/ghost.doc.zh.mjs, or add the topic it translates as docs/ghost.doc.mjs.',
      }),
    ]);
  });
});
