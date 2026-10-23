// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file FunctionDoc for `render()` / `astryx experimental render`.
 * @position packages/cli/api/render — function documentation
 */

/** @type {import('@astryxdesign/cli/authoring').FunctionDoc} */
export const doc = {
  type: 'function',
  kind: 'api',
  name: 'render',
  namespace: 'cli/api',
  stability: 'experimental',
  displayName: 'render()',
  summary:
    'Render a page to one self-contained HTML file, or turn a rendered file back into a page.',
  description:
    "Renders the page module's default export on the server with the project's own React and Astryx components, and writes ONE static HTML file that needs nothing beside it: the page's own StyleX styles are compiled, Core's stylesheets are cut to the rules the markup uses (layer order, custom properties and keyframes kept), local images become data: URIs, and the page's source is embedded so it can be given back exactly. The file runs no script and loads nothing from the network, so it works inside a sandboxed frame with a strict content security policy, and its colors follow the viewer's light or dark scheme. Warnings name anything that may differ from what the author meant, such as a component that did not render the text it was given. With `reverse`, it writes the embedded source back byte for byte, and only the files a render embeds: the page and the stylesheets, JSON and images it imports; a file with Astryx markup but no embedded source is rebuilt from its component class names and data attributes (text and layout only); any other file is refused. Experimental: it may change or be removed in a patch release.",
  importPath: '@astryxdesign/cli/api/experimental',
  signature:
    'render(file: string, options?: RenderOptions): Promise<RenderPageResponse | RenderReverseResponse>',
  keywords: [
    'render',
    'static',
    'html',
    'export',
    'artifact',
    'snapshot',
    'self-contained',
    'reverse',
  ],
  params: [
    {
      name: 'file',
      type: 'string',
      description:
        'The page module (.tsx, .jsx, .ts, .js or .mjs) with a default export, or with `reverse` the rendered .html file.',
    },
    {
      name: 'options.out',
      type: 'string',
      description:
        "The file to write. Rendering: an .html file (default: the page's name with .html). Reversing: a page module (default: the page's original name beside the HTML file, or the HTML file's name with .tsx).",
    },
    {
      name: 'options.reverse',
      type: 'boolean',
      description: 'Turn a rendered HTML file back into a page module.',
      default: 'false',
    },
    {
      name: 'options.title',
      type: 'string',
      description:
        "The rendered page's title (default: its first top-level heading, else the file name). Rendering only.",
    },
    {
      name: 'options.overwrite',
      type: 'boolean',
      description:
        'Replace existing files when reversing. Rendering always replaces its HTML file.',
      default: 'false',
    },
    {
      name: 'options.cwd',
      type: 'string',
      description: 'Folder relative paths resolve from (default: the current directory).',
    },
  ],
  returns: [
    {
      type: 'render.page',
      description:
        'The page and the HTML file written, its size, the local modules embedded, the stylesheets inlined, the class and image counts, the CSS size, and any warnings.',
    },
    {
      type: 'render.reverse',
      description:
        "How the page came back (`embedded`, exact; or `rebuilt`, text and layout only), the files written, and for a rebuilt page the components it uses and what could not be rebuilt.",
    },
  ],
  throws: [
    {code: 'ERR_MISSING_ARGUMENT', when: 'no file is given'},
    {
      code: 'ERR_INVALID_ARGUMENT',
      when: 'the file or `out` has the wrong kind of extension, `out` is the input itself, `title` is given with `reverse`, or `overwrite` without it',
    },
    {code: 'ERR_FILE_NOT_FOUND', when: 'the file, or a local file the page imports, does not exist'},
    {code: 'ERR_FILE_EXISTS', when: 'reversing would replace an existing file and `overwrite` is not set'},
    {code: 'ERR_WRITE_FAILED', when: 'a file cannot be written, such as when `out` names a folder'},
    {code: 'ERR_RENDER_COMPILE', when: 'the page does not compile'},
    {code: 'ERR_RENDER_NO_DEFAULT_EXPORT', when: 'the page has no default export'},
    {code: 'ERR_RENDER_MISSING_DEPENDENCY', when: 'the page imports a package that is not installed; the suggestion is its install line'},
    {code: 'ERR_RENDER_BROWSER_API', when: 'the page reads a browser-only API, such as window or document, while rendering'},
    {code: 'ERR_RENDER_ASSET_TOO_LARGE', when: 'a local file the page uses is over 8 MB'},
    {code: 'ERR_RENDER_TIMEOUT', when: 'the page does not finish rendering within 60 seconds'},
    {code: 'ERR_RENDER_FAILED', when: 'the page throws while rendering for any other reason'},
    {
      code: 'ERR_RENDER_NOT_ASTRYX',
      when: 'reversing a file with no embedded source and no Astryx markup; the suggestion is `astryx build "<what the page is>"`',
    },
    {code: 'ERR_RENDER_SOURCE_DAMAGED', when: 'reversing a file whose embedded source is damaged, or carries a file a render never embeds (a dotfile or dot-folder, `node_modules`, a package manifest, lockfile or tool configuration, or any kind but a page module, stylesheet, JSON or image)'},
    {code: 'ERR_PATH_TRAVERSAL', when: 'a file would be written outside the current folder (symlinks followed): `out`, or with `reverse` the page or an embedded file'},
  ],
  examples: [
    {label: 'Render a page', code: "const {data} = await render('src/app/page.tsx', {out: 'page.html'});"},
    {label: 'Give it back', code: "await render('page.html', {reverse: true, out: 'page.tsx'});"},
  ],
  command: 'experimental render',
  related: ['template', 'build'],
};
