// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file blog command — read the Astryx blog from the published feed.
 *
 * A normal, agent-facing command: it appears in `--help` + the manifest and
 * supports `--json`. It reads the blog the same way any feed reader would — over
 * the public RSS feed — and prints a post's plaintext (.txt) variant. Nothing
 * about the blog's structure has to change for this to work; the CLI is just a
 * consumer of the feed.
 *
 *   astryx blog                    List posts from the feed
 *   astryx blog <slug>             Print a post as plaintext
 *   astryx blog --json             Structured list/detail envelope
 */

import {getRunPrefix} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, record, records, code} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {blog as blogApi} from '../../../api/blog/blog.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as blogCommand} from './blog.doc.mjs';
import {doc as blogFn} from '../../../api/blog/blog.doc.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerBlog(program) {
  defineCommand(program, blogCommand, {
    fn: blogFn,
    action: async (/** @type {string | undefined} */ slug) => {
      const run = getRunPrefix();
      /** @type {import('../../../api/blog/blog.type.mjs').BlogListResponse | import('../../../api/blog/blog.type.mjs').BlogDetailResponse} */
      let result;
      try {
        result = await blogApi(slug);
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {
          suggestions: err.suggestions || [],
          code: err.code,
        });
        return;
      }

      if (program.opts().json) {
        jsonOut(result);
        return;
      }

      if (result.type === 'blog.list') {
        const {feedUrl, posts} = result.data;
        if (posts.length === 0) {
          emit(
            section('Astryx blog', `feed: ${feedUrl}`),
            text('No posts found in the feed.'),
          );
          return;
        }
        // One record per post — fields mirror the JSON post shape; empty
        // fields (type/textUrl) are skipped by record().
        emit(
          section('Astryx blog', `feed: ${feedUrl}`),
          records(posts, {fields: ['slug', 'title', 'type', 'textUrl']}),
          text(`Read one: ${run} astryx blog <slug>`),
        );
      } else {
        // blog.detail — the feed URL, then the post body emitted verbatim
        // (code() so article typography/spacing isn't ASCII-normalized).
        emit(record({feed: result.data.feedUrl}), code(result.data.text));
      }
    },
  });
}
