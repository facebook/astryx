import process$1 from 'process';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import a from 'node:path';
import process from 'node:process';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { x } from 'tinyexec';

const AGENTS = [
  "npm",
  "yarn",
  "yarn@berry",
  "pnpm",
  "pnpm@6",
  "bun"
];
const LOCKS = {
  "bun.lockb": "bun",
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "package-lock.json": "npm",
  "npm-shrinkwrap.json": "npm"
};

async function detect({ cwd, onUnknown } = {}) {
  for (const directory of lookup(cwd)) {
    for (const lock of Object.keys(LOCKS)) {
      if (await fileExists(a.join(directory, lock))) {
        const name = LOCKS[lock];
        const result2 = await parsePackageJson(a.join(directory, "package.json"), onUnknown);
        if (result2)
          return result2;
        else
          return { name, agent: name };
      }
    }
    const result = await parsePackageJson(a.join(directory, "package.json"), onUnknown);
    if (result)
      return result;
  }
  return null;
}
function* lookup(cwd = process.cwd()) {
  let directory = a.resolve(cwd);
  const { root } = a.parse(directory);
  while (directory && directory !== root) {
    yield directory;
    directory = a.dirname(directory);
  }
}
async function parsePackageJson(filepath, onUnknown) {
  if (!filepath || !await fileExists(filepath))
    return null;
  try {
    const pkg = JSON.parse(fs.readFileSync(filepath, "utf8"));
    let agent;
    if (typeof pkg.packageManager === "string") {
      const [name, ver] = pkg.packageManager.replace(/^\^/, "").split("@");
      let version = ver;
      if (name === "yarn" && Number.parseInt(ver) > 1) {
        agent = "yarn@berry";
        version = "berry";
        return { name, agent, version };
      } else if (name === "pnpm" && Number.parseInt(ver) < 7) {
        agent = "pnpm@6";
        return { name, agent, version };
      } else if (AGENTS.includes(name)) {
        agent = name;
        return { name, agent, version };
      } else {
        return onUnknown?.(pkg.packageManager) ?? null;
      }
    }
  } catch {
  }
  return null;
}
async function fileExists(filePath) {
  try {
    const stats = await fsp.stat(filePath);
    if (stats.isFile()) {
      return true;
    }
  } catch {
  }
  return false;
}

// src/detect.ts
async function detectPackageManager(cwd = process$1.cwd()) {
  const result = await detect({
    cwd,
    onUnknown(packageManager) {
      console.warn("[@antfu/install-pkg] Unknown packageManager:", packageManager);
      return void 0;
    }
  });
  return result?.agent || null;
}
async function installPackage(names, options = {}) {
  const detectedAgent = options.packageManager || await detectPackageManager(options.cwd) || "npm";
  const [agent] = detectedAgent.split("@");
  if (!Array.isArray(names))
    names = [names];
  const args = options.additionalArgs || [];
  if (options.preferOffline) {
    if (detectedAgent === "yarn@berry")
      args.unshift("--cached");
    else
      args.unshift("--prefer-offline");
  }
  if (agent === "pnpm" && existsSync(resolve(options.cwd ?? process$1.cwd(), "pnpm-workspace.yaml")))
    args.unshift("-w");
  return x(
    agent,
    [
      agent === "yarn" ? "add" : "install",
      options.dev ? "-D" : "",
      ...args,
      ...names
    ].filter(Boolean),
    {
      nodeOptions: {
        stdio: options.silent ? "ignore" : "inherit",
        cwd: options.cwd
      },
      throwOnError: true
    }
  );
}

export { detectPackageManager, installPackage };
