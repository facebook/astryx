import { processError } from '@vitest/utils/error';
import { relative } from 'pathe';
import { toArray } from '@vitest/utils';

function createChainable(keys, fn) {
  function create(context) {
    const chain2 = function(...args) {
      return fn.apply(context, args);
    };
    Object.assign(chain2, fn);
    chain2.withContext = () => chain2.bind(context);
    chain2.setContext = (key, value) => {
      context[key] = value;
    };
    chain2.mergeContext = (ctx) => {
      Object.assign(context, ctx);
    };
    for (const key of keys) {
      Object.defineProperty(chain2, key, {
        get() {
          return create({ ...context, [key]: true });
        }
      });
    }
    return chain2;
  }
  const chain = create({});
  chain.fn = fn;
  return chain;
}

function interpretTaskModes(suite, namePattern, onlyMode, parentIsOnly, allowOnly) {
  const suiteIsOnly = parentIsOnly || suite.mode === "only";
  suite.tasks.forEach((t) => {
    const includeTask = suiteIsOnly || t.mode === "only";
    if (onlyMode) {
      if (t.type === "suite" && (includeTask || someTasksAreOnly(t))) {
        if (t.mode === "only") {
          checkAllowOnly(t, allowOnly);
          t.mode = "run";
        }
      } else if (t.mode === "run" && !includeTask) {
        t.mode = "skip";
      } else if (t.mode === "only") {
        checkAllowOnly(t, allowOnly);
        t.mode = "run";
      }
    }
    if (t.type === "test") {
      if (namePattern && !getTaskFullName(t).match(namePattern)) {
        t.mode = "skip";
      }
    } else if (t.type === "suite") {
      if (t.mode === "skip") {
        skipAllTasks(t);
      } else {
        interpretTaskModes(t, namePattern, onlyMode, includeTask, allowOnly);
      }
    }
  });
  if (suite.mode === "run") {
    if (suite.tasks.length && suite.tasks.every((i) => i.mode !== "run")) {
      suite.mode = "skip";
    }
  }
}
function getTaskFullName(task) {
  return `${task.suite ? `${getTaskFullName(task.suite)} ` : ""}${task.name}`;
}
function someTasksAreOnly(suite) {
  return suite.tasks.some(
    (t) => t.mode === "only" || t.type === "suite" && someTasksAreOnly(t)
  );
}
function skipAllTasks(suite) {
  suite.tasks.forEach((t) => {
    if (t.mode === "run") {
      t.mode = "skip";
      if (t.type === "suite") {
        skipAllTasks(t);
      }
    }
  });
}
function checkAllowOnly(task, allowOnly) {
  if (allowOnly) {
    return;
  }
  const error = processError(
    new Error(
      "[Vitest] Unexpected .only modifier. Remove it or pass --allowOnly argument to bypass this error"
    )
  );
  task.result = {
    state: "fail",
    errors: [error]
  };
}
function generateHash(str) {
  let hash = 0;
  if (str.length === 0) {
    return `${hash}`;
  }
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${hash}`;
}
function calculateSuiteHash(parent) {
  parent.tasks.forEach((t, idx) => {
    t.id = `${parent.id}_${idx}`;
    if (t.type === "suite") {
      calculateSuiteHash(t);
    }
  });
}
function createFileTask(filepath, root, projectName, pool) {
  const path = relative(root, filepath);
  const file = {
    id: generateHash(`${path}${projectName || ""}`),
    name: path,
    type: "suite",
    mode: "run",
    filepath,
    tasks: [],
    meta: /* @__PURE__ */ Object.create(null),
    projectName,
    file: void 0,
    pool
  };
  file.file = file;
  return file;
}

function limitConcurrency(concurrency = Infinity) {
  let count = 0;
  let head;
  let tail;
  const finish = () => {
    count--;
    if (head) {
      head[0]();
      head = head[1];
      tail = head && tail;
    }
  };
  return (func, ...args) => {
    return new Promise((resolve) => {
      if (count++ < concurrency) {
        resolve();
      } else if (tail) {
        tail = tail[1] = [resolve];
      } else {
        head = tail = [resolve];
      }
    }).then(() => {
      return func(...args);
    }).finally(finish);
  };
}

function partitionSuiteChildren(suite) {
  let tasksGroup = [];
  const tasksGroups = [];
  for (const c of suite.tasks) {
    if (tasksGroup.length === 0 || c.concurrent === tasksGroup[0].concurrent) {
      tasksGroup.push(c);
    } else {
      tasksGroups.push(tasksGroup);
      tasksGroup = [c];
    }
  }
  if (tasksGroup.length > 0) {
    tasksGroups.push(tasksGroup);
  }
  return tasksGroups;
}

function isAtomTest(s) {
  return s.type === "test" || s.type === "custom";
}
function getTests(suite) {
  const tests = [];
  const arraySuites = toArray(suite);
  for (const s of arraySuites) {
    if (isAtomTest(s)) {
      tests.push(s);
    } else {
      for (const task of s.tasks) {
        if (isAtomTest(task)) {
          tests.push(task);
        } else {
          const taskTests = getTests(task);
          for (const test of taskTests) {
            tests.push(test);
          }
        }
      }
    }
  }
  return tests;
}
function getTasks(tasks = []) {
  return toArray(tasks).flatMap(
    (s) => isAtomTest(s) ? [s] : [s, ...getTasks(s.tasks)]
  );
}
function getSuites(suite) {
  return toArray(suite).flatMap(
    (s) => s.type === "suite" ? [s, ...getSuites(s.tasks)] : []
  );
}
function hasTests(suite) {
  return toArray(suite).some(
    (s) => s.tasks.some((c) => isAtomTest(c) || hasTests(c))
  );
}
function hasFailed(suite) {
  return toArray(suite).some(
    (s) => {
      var _a;
      return ((_a = s.result) == null ? void 0 : _a.state) === "fail" || s.type === "suite" && hasFailed(s.tasks);
    }
  );
}
function getNames(task) {
  const names = [task.name];
  let current = task;
  while (current == null ? void 0 : current.suite) {
    current = current.suite;
    if (current == null ? void 0 : current.name) {
      names.unshift(current.name);
    }
  }
  if (current !== task.file) {
    names.unshift(task.file.name);
  }
  return names;
}
function getFullName(task, separator = " > ") {
  return getNames(task).join(separator);
}
function getTestName(task, separator = " > ") {
  return getNames(task).slice(1).join(separator);
}

export { calculateSuiteHash as a, createFileTask as b, createChainable as c, getFullName as d, getNames as e, getSuites as f, generateHash as g, getTasks as h, interpretTaskModes as i, getTestName as j, getTests as k, limitConcurrency as l, hasFailed as m, hasTests as n, isAtomTest as o, partitionSuiteChildren as p, someTasksAreOnly as s };
