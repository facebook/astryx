// Copyright (c) Meta Platforms, Inc. and affiliates.
import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import * as fs from 'node:fs'; import * as path from 'node:path';
import {init} from '../init.mjs'; import {remove} from './remove.mjs'; import {logger} from '../../logger.mjs';
let dir;
beforeEach(() => { dir = fs.mkdtempSync(path.join(process.cwd(), '.astryx-rm-')); fs.writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:'c',version:'1.0.0'})); });
afterEach(() => { fs.rmSync(dir,{recursive:true,force:true}); logger.setSilent(true); });
describe('init.remove says whether anything was removed', () => {
  it('false on clean', async () => { const r=await remove({cwd:dir}); expect(r.type).toBe('init.remove'); expect(r.data.removed).toBe(false); });
  it('true then false', async () => { await init({features:['agents']},{cwd:dir}); expect(fs.readFileSync(path.join(dir,'AGENTS.md'),'utf8')).toContain('<!-- ASTRYX:START -->'); const a=await remove({cwd:dir}); expect(a.data.removed).toBe(true); const b=await remove({cwd:dir}); expect(b.data.removed).toBe(false); });
  it('human line', async () => { const l=[]; const s=vi.spyOn(console,'log').mockImplementation((...a)=>l.push(a.join(' '))); logger.setSilent(false); try{await remove({cwd:dir});}finally{logger.setSilent(true);s.mockRestore();} expect(l.join('\n')).toContain('Nothing to remove'); });
});
