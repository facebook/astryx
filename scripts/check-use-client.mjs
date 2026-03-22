/**
 * Post-build check: verify all dist files using React client APIs
 * have "use client" directive.
 *
 * Run after `yarn build` to catch missing directives in shared chunks.
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const CLIENT_APIS = [
  'createContext',
  'useContext',
  'useState',
  'useEffect',
  'useRef',
  'useCallback',
  'useMemo',
  'useReducer',
  'useId',
  'useTransition',
  'useOptimistic',
  'useSyncExternalStore',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'packages/core/dist');

function findMjsFiles(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes: true, recursive: true});
  return entries
    .filter(e => !e.isDirectory() && e.name.endsWith('.mjs'))
    .map(e => path.join(e.parentPath ?? e.path, e.name));
}

function check() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`❌ Dist directory not found: ${DIST_DIR}`);
    console.error('   Run "yarn build" first.');
    process.exit(1);
  }

  const files = findMjsFiles(DIST_DIR);
  const failures = [];

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const usesClientAPI = CLIENT_APIS.some(api => content.includes(api));
    if (!usesClientAPI) continue;

    const firstLine = content.split('\n')[0].trim();
    const hasDirective =
      firstLine === '"use client";' || firstLine === "'use client';";
    if (!hasDirective) {
      failures.push(path.relative(DIST_DIR, file));
    }
  }

  if (failures.length > 0) {
    console.error('❌ Missing "use client" directive in dist files:');
    for (const f of failures) {
      console.error(`   ${f}`);
    }
    process.exit(1);
  }

  console.log(
    `✅ All ${files.length} dist .mjs files checked — "use client" directives present where needed.`,
  );
}

check();
