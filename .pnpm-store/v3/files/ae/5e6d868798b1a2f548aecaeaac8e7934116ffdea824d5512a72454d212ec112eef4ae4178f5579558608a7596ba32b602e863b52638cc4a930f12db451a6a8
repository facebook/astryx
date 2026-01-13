import { stripVTControlCharacters } from 'node:util';
import { slash } from '@vitest/utils';
import { isAbsolute, relative, dirname, basename } from 'pathe';
import c from 'tinyrainbow';

const F_RIGHT = "\u2192";
const F_DOWN = "\u2193";
const F_DOWN_RIGHT = "\u21B3";
const F_POINTER = "\u276F";
const F_DOT = "\xB7";
const F_CHECK = "\u2713";
const F_CROSS = "\xD7";
const F_LONG_DASH = "\u23AF";

const spinnerMap = /* @__PURE__ */ new WeakMap();
const hookSpinnerMap = /* @__PURE__ */ new WeakMap();
const pointer = c.yellow(F_POINTER);
const skipped = c.dim(c.gray(F_DOWN));
const benchmarkPass = c.green(F_DOT);
const testPass = c.green(F_CHECK);
const taskFail = c.red(F_CROSS);
const suiteFail = c.red(F_POINTER);
const pending = c.gray("\xB7");
function getCols(delta = 0) {
  let length = process.stdout?.columns;
  if (!length || Number.isNaN(length)) {
    length = 30;
  }
  return Math.max(length + delta, 0);
}
function divider(text, left, right) {
  const cols = getCols();
  if (text) {
    const textLength = stripVTControlCharacters(text).length;
    if (left == null && right != null) {
      left = cols - textLength - right;
    } else {
      left = left ?? Math.floor((cols - textLength) / 2);
      right = cols - textLength - left;
    }
    left = Math.max(0, left);
    right = Math.max(0, right);
    return `${F_LONG_DASH.repeat(left)}${text}${F_LONG_DASH.repeat(right)}`;
  }
  return F_LONG_DASH.repeat(cols);
}
function formatTestPath(root, path) {
  if (isAbsolute(path)) {
    path = relative(root, path);
  }
  const dir = dirname(path);
  const ext = path.match(/(\.(spec|test)\.[cm]?[tj]sx?)$/)?.[0] || "";
  const base = basename(path, ext);
  return slash(c.dim(`${dir}/`) + c.bold(base)) + c.dim(ext);
}
function renderSnapshotSummary(rootDir, snapshots) {
  const summary = [];
  if (snapshots.added) {
    summary.push(c.bold(c.green(`${snapshots.added} written`)));
  }
  if (snapshots.unmatched) {
    summary.push(c.bold(c.red(`${snapshots.unmatched} failed`)));
  }
  if (snapshots.updated) {
    summary.push(c.bold(c.green(`${snapshots.updated} updated `)));
  }
  if (snapshots.filesRemoved) {
    if (snapshots.didUpdate) {
      summary.push(c.bold(c.green(`${snapshots.filesRemoved} files removed `)));
    } else {
      summary.push(
        c.bold(c.yellow(`${snapshots.filesRemoved} files obsolete `))
      );
    }
  }
  if (snapshots.filesRemovedList && snapshots.filesRemovedList.length) {
    const [head, ...tail] = snapshots.filesRemovedList;
    summary.push(`${c.gray(F_DOWN_RIGHT)} ${formatTestPath(rootDir, head)}`);
    tail.forEach((key) => {
      summary.push(`  ${c.gray(F_DOT)} ${formatTestPath(rootDir, key)}`);
    });
  }
  if (snapshots.unchecked) {
    if (snapshots.didUpdate) {
      summary.push(c.bold(c.green(`${snapshots.unchecked} removed`)));
    } else {
      summary.push(c.bold(c.yellow(`${snapshots.unchecked} obsolete`)));
    }
    snapshots.uncheckedKeysByFile.forEach((uncheckedFile) => {
      summary.push(
        `${c.gray(F_DOWN_RIGHT)} ${formatTestPath(
          rootDir,
          uncheckedFile.filePath
        )}`
      );
      uncheckedFile.keys.forEach(
        (key) => summary.push(`  ${c.gray(F_DOT)} ${key}`)
      );
    });
  }
  return summary;
}
function countTestErrors(tasks) {
  return tasks.reduce((c2, i) => c2 + (i.result?.errors?.length || 0), 0);
}
function getStateString(tasks, name = "tests", showTotal = true) {
  if (tasks.length === 0) {
    return c.dim(`no ${name}`);
  }
  const passed = tasks.filter((i) => i.result?.state === "pass");
  const failed = tasks.filter((i) => i.result?.state === "fail");
  const skipped2 = tasks.filter((i) => i.mode === "skip");
  const todo = tasks.filter((i) => i.mode === "todo");
  return [
    failed.length ? c.bold(c.red(`${failed.length} failed`)) : null,
    passed.length ? c.bold(c.green(`${passed.length} passed`)) : null,
    skipped2.length ? c.yellow(`${skipped2.length} skipped`) : null,
    todo.length ? c.gray(`${todo.length} todo`) : null
  ].filter(Boolean).join(c.dim(" | ")) + (showTotal ? c.gray(` (${tasks.length})`) : "");
}
function getStateSymbol(task) {
  if (task.mode === "skip" || task.mode === "todo") {
    return skipped;
  }
  if (!task.result) {
    return pending;
  }
  if (task.result.state === "run") {
    if (task.type === "suite") {
      return pointer;
    }
    let spinner = spinnerMap.get(task);
    if (!spinner) {
      spinner = elegantSpinner();
      spinnerMap.set(task, spinner);
    }
    return c.yellow(spinner());
  }
  if (task.result.state === "pass") {
    return task.meta?.benchmark ? benchmarkPass : testPass;
  }
  if (task.result.state === "fail") {
    return task.type === "suite" ? suiteFail : taskFail;
  }
  return " ";
}
function getHookStateSymbol(task, hookName) {
  const state = task.result?.hooks?.[hookName];
  if (state && state === "run") {
    let spinnerMap2 = hookSpinnerMap.get(task);
    if (!spinnerMap2) {
      spinnerMap2 = /* @__PURE__ */ new Map();
      hookSpinnerMap.set(task, spinnerMap2);
    }
    let spinner = spinnerMap2.get(hookName);
    if (!spinner) {
      spinner = elegantSpinner();
      spinnerMap2.set(hookName, spinner);
    }
    return c.yellow(spinner());
  }
}
const spinnerFrames = process.platform === "win32" ? ["-", "\\", "|", "/"] : ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
function elegantSpinner() {
  let index = 0;
  return () => {
    index = ++index % spinnerFrames.length;
    return spinnerFrames[index];
  };
}
function formatTimeString(date) {
  return date.toTimeString().split(" ")[0];
}
function formatProjectName(name, suffix = " ") {
  if (!name) {
    return "";
  }
  const index = name.split("").reduce((acc, v, idx) => acc + v.charCodeAt(0) + idx, 0);
  const colors = [c.blue, c.yellow, c.cyan, c.green, c.magenta];
  return colors[index % colors.length](`|${name}|`) + suffix;
}
function withLabel(color, label, message) {
  return `${c.bold(c.inverse(c[color](` ${label} `)))} ${c[color](message)}`;
}

var utils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  benchmarkPass: benchmarkPass,
  countTestErrors: countTestErrors,
  divider: divider,
  elegantSpinner: elegantSpinner,
  formatProjectName: formatProjectName,
  formatTestPath: formatTestPath,
  formatTimeString: formatTimeString,
  getCols: getCols,
  getHookStateSymbol: getHookStateSymbol,
  getStateString: getStateString,
  getStateSymbol: getStateSymbol,
  hookSpinnerMap: hookSpinnerMap,
  pending: pending,
  pointer: pointer,
  renderSnapshotSummary: renderSnapshotSummary,
  skipped: skipped,
  spinnerFrames: spinnerFrames,
  spinnerMap: spinnerMap,
  suiteFail: suiteFail,
  taskFail: taskFail,
  testPass: testPass,
  withLabel: withLabel
});

export { F_POINTER as F, formatTimeString as a, F_RIGHT as b, F_CHECK as c, divider as d, getStateString as e, formatProjectName as f, getStateSymbol as g, countTestErrors as h, getCols as i, getHookStateSymbol as j, renderSnapshotSummary as r, taskFail as t, utils as u, withLabel as w };
