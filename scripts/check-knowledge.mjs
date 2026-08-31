// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global console, process */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const {
  parseAuthority,
  parseOwnerFile,
} = require('../.github/scripts/knowledge-frontmatter.cjs');

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = path.resolve(HERE, '..');

export function parseKnowledgeDocument(content, filePath = '<document>') {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return {
      frontmatter: new Map(),
      sections: [],
      problems: [`${filePath}: missing frontmatter.`],
    };
  }

  function parseScalar(raw) {
    let value = raw.trim();
    if (value === 'null' || value === '~') return null;
    if (/^\[.*\]$/.test(value)) {
      const inner = value.slice(1, -1).trim();
      return inner
        ? inner
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
            .map(item => item.replace(/^['"]|['"]$/g, ''))
        : [];
    }
    if (/^[0-9]+$/.test(value)) return Number(value);
    return value.replace(/^['"]|['"]$/g, '');
  }

  const frontmatter = new Map();
  const problems = [];
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (
      /^\s/.test(line) ||
      line.trim() === '' ||
      line.trimStart().startsWith('#')
    )
      continue;
    const field = line.match(/^([a-z][a-z0-9_]*):\s*(.*)$/);
    if (!field) continue;
    let raw = field[2].trim();
    if (raw === '') {
      const block = [];
      while (index + 1 < lines.length && /^\s/.test(lines[index + 1])) {
        block.push(lines[index + 1].trim());
        index += 1;
      }
      if (block[0] === '[' && block.at(-1) === ']') {
        raw = `[${block.slice(1, -1).join('')}]`;
      } else if (block.every(item => item.startsWith('- '))) {
        raw = `[${block.map(item => item.slice(2)).join(',')}]`;
      }
    }
    if (frontmatter.has(field[1])) {
      problems.push(`${filePath}: duplicate frontmatter field ${field[1]}.`);
      continue;
    }
    frontmatter.set(field[1], parseScalar(raw));
  }

  try {
    const authority = parseAuthority(content, filePath);
    if (authority !== frontmatter.get('authority')) {
      problems.push(`${filePath}: authority could not be parsed consistently.`);
    }
  } catch (error) {
    problems.push(error.message);
  }

  const sections = [...content.matchAll(/^## (.+?)\s*$/gm)].map(
    section => section[1],
  );
  return {frontmatter, sections, problems};
}

function immediateDirectories(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(directory, entry.name));
}

function matchingFiles(directory, predicate) {
  if (!fs.existsSync(directory)) return [];
  return fs
    .readdirSync(directory, {withFileTypes: true})
    .filter(entry => entry.isFile() && predicate(entry.name))
    .map(entry => path.join(directory, entry.name));
}

export function discoverKnowledgeRecords(root = DEFAULT_ROOT) {
  const records = [];

  for (const specDirectory of immediateDirectories(
    path.join(root, 'docs/specs'),
  )) {
    for (const name of ['spec.md', 'plan.md']) {
      const candidate = path.join(specDirectory, name);
      if (fs.existsSync(candidate)) records.push(candidate);
    }
  }

  records.push(
    ...matchingFiles(
      path.join(root, 'docs/families'),
      name => name.endsWith('.md') && name !== 'README.md',
    ),
    ...matchingFiles(
      path.join(root, 'docs/architecture'),
      name => name.endsWith('.md') && name !== 'README.md',
    ),
    ...matchingFiles(
      path.join(root, 'docs/design'),
      name => name.endsWith('.md') && name !== 'README.md',
    ),
  );

  for (const packageName of ['core', 'lab']) {
    for (const componentDirectory of immediateDirectories(
      path.join(root, `packages/${packageName}/src`),
    )) {
      records.push(
        ...matchingFiles(componentDirectory, name => name.endsWith('.spec.md')),
      );
    }
  }

  return records.sort();
}

function validateAgainstSchema(
  document,
  schema,
  schemaPath,
  filePath,
  isTemplate,
  currentTemplateVersion,
  designApprovalOwners = [],
) {
  const problems = [...document.problems];
  const {frontmatter, sections} = document;
  const kind = frontmatter.get('kind');
  const kindSchema = schema.kinds[kind];

  if (!kindSchema) {
    problems.push(
      `${filePath}: unknown knowledge kind ${JSON.stringify(kind)}.`,
    );
    return problems;
  }

  for (const field of kindSchema.requiredFrontmatter) {
    if (!frontmatter.has(field))
      problems.push(`${filePath}: missing frontmatter field ${field}.`);
  }
  for (const section of kindSchema.requiredSections) {
    if (!sections.includes(section))
      problems.push(`${filePath}: missing section "${section}".`);
  }

  const templateVersion = frontmatter.get('template_version');
  if (!Number.isInteger(templateVersion) || templateVersion < 1) {
    problems.push(`${filePath}: template_version must be a positive integer.`);
  } else if (templateVersion > currentTemplateVersion) {
    problems.push(
      `${filePath}: template_version ${templateVersion} is newer than ${currentTemplateVersion}.`,
    );
  }

  const schemaVersion = frontmatter.get('schema_version');
  if (schemaVersion !== schema.schemaVersion) {
    problems.push(
      `${filePath}: schema_version ${JSON.stringify(schemaVersion)} does not match ${schema.schemaVersion} from ${schemaPath}.`,
    );
  }

  if (isTemplate) {
    if (templateVersion !== currentTemplateVersion) {
      problems.push(
        `${filePath}: template_version must equal ${currentTemplateVersion}.`,
      );
    }
    const extraFields = [...frontmatter.keys()].filter(
      field => !kindSchema.requiredFrontmatter.includes(field),
    );
    if (extraFields.length) {
      problems.push(
        `${filePath}: template fields are missing from the schema: ${extraFields.join(', ')}.`,
      );
    }
    if (
      JSON.stringify(sections) !== JSON.stringify(kindSchema.requiredSections)
    ) {
      problems.push(
        `${filePath}: template section order must exactly match the schema; bump the schema and migrate active records for a structural change.`,
      );
    }
    return problems;
  }

  const owners = frontmatter.get('owners');
  if (!Array.isArray(owners) || owners.length === 0) {
    problems.push(`${filePath}: owners must be a non-empty inline list.`);
  }

  const authority = frontmatter.get('authority');
  if (!schema.authorities.includes(authority)) {
    problems.push(
      `${filePath}: authority must be ${schema.authorities.join(', ')}.`,
    );
  }
  if (authority === 'current') {
    for (const field of kindSchema.currentNonEmptyFields ?? []) {
      const value = frontmatter.get(field);
      if (!Array.isArray(value) || value.length === 0) {
        problems.push(
          `${filePath}: current records require non-empty ${field}.`,
        );
      }
    }
    const approvedBy = frontmatter.get('approved_by');
    const approvedAt = frontmatter.get('approved_at');
    const authorizedOwners =
      kind === 'design'
        ? [...new Set([...schema.approvalOwners, ...designApprovalOwners])]
        : schema.approvalOwners;
    if (!authorizedOwners.includes(approvedBy)) {
      problems.push(
        `${filePath}: current records require approved_by to name an authorized owner.`,
      );
    }
    if (
      typeof approvedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(approvedAt)
    ) {
      problems.push(
        `${filePath}: current records require approved_at as YYYY-MM-DD.`,
      );
    }
  }
  if (authority === 'archived') {
    const reason = frontmatter.get('archive_reason');
    if (!schema.archiveReasons.includes(reason)) {
      problems.push(
        `${filePath}: archived records require archive_reason (${schema.archiveReasons.join(', ')}).`,
      );
    }
    if (reason === 'superseded' && !frontmatter.get('superseded_by')) {
      problems.push(`${filePath}: superseded records require superseded_by.`);
    }
  }

  return problems;
}

export function validateSchemaEvolution(baseSchemas, currentSchemas) {
  const problems = [];
  let highestBaseVersion = -1;
  for (const [filePath, baseContent] of baseSchemas) {
    const match = filePath.match(/v([0-9]+)\.json$/);
    if (match)
      highestBaseVersion = Math.max(highestBaseVersion, Number(match[1]));
    if (!currentSchemas.has(filePath)) {
      problems.push(
        `${filePath}: versioned schemas are append-only and cannot be deleted.`,
      );
    } else if (currentSchemas.get(filePath) !== baseContent) {
      problems.push(
        `${filePath}: versioned schemas are immutable; add a new version and migrate active records.`,
      );
    }
  }
  for (const filePath of currentSchemas.keys()) {
    if (baseSchemas.has(filePath)) continue;
    const version = Number(filePath.match(/v([0-9]+)\.json$/)?.[1]);
    if (!Number.isInteger(version) || version <= highestBaseVersion) {
      problems.push(
        `${filePath}: new schema versions must be greater than ${highestBaseVersion}.`,
      );
    }
  }
  return problems;
}

function schemaFilesAtRevision(root, revision) {
  let output;
  try {
    output = execFileSync(
      'git',
      [
        '-C',
        root,
        'ls-tree',
        '-r',
        '--name-only',
        revision,
        '--',
        'docs/schemas/knowledge',
      ],
      {encoding: 'utf8'},
    );
  } catch (error) {
    throw new Error(`Could not read knowledge schemas at ${revision}.`, {
      cause: error,
    });
  }
  const schemas = new Map();
  for (const filePath of output
    .split(/\r?\n/)
    .filter(path => /^docs\/schemas\/knowledge\/v[0-9]+\.json$/.test(path))) {
    schemas.set(
      filePath,
      execFileSync('git', ['-C', root, 'show', `${revision}:${filePath}`], {
        encoding: 'utf8',
      }),
    );
  }
  return schemas;
}

function currentSchemaFiles(root) {
  return new Map(
    matchingFiles(path.join(root, 'docs/schemas/knowledge'), name =>
      /^v[0-9]+\.json$/.test(name),
    ).map(filePath => [
      path.relative(root, filePath),
      fs.readFileSync(filePath, 'utf8'),
    ]),
  );
}

export function validateKnowledgeRoot(root = DEFAULT_ROOT) {
  const schemaDirectory = path.join(root, 'docs/schemas/knowledge');
  const schemas = new Map(
    matchingFiles(schemaDirectory, name => /^v[0-9]+\.json$/.test(name)).map(
      schemaPath => {
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        const fileVersion = Number(
          path.basename(schemaPath).match(/^v([0-9]+)\.json$/)[1],
        );
        if (schema.schemaVersion !== fileVersion) {
          throw new Error(
            `${path.relative(root, schemaPath)} declares schemaVersion ${schema.schemaVersion}; expected ${fileVersion}.`,
          );
        }
        return [schema.schemaVersion, {schema, schemaPath}];
      },
    ),
  );
  if (schemas.size === 0)
    return ['docs/schemas/knowledge: no versioned schemas found.'];
  const latestVersion = Math.max(...schemas.keys());
  const {schema, schemaPath} = schemas.get(latestVersion);
  const relativeSchemaPath = path.relative(root, schemaPath);
  const templateVersions = JSON.parse(
    fs.readFileSync(
      path.join(root, 'docs/templates/knowledge/versions.json'),
      'utf8',
    ),
  );
  const designOwnersPath = path.join(root, '.github/DESIGNOWNERS');
  const designApprovalOwners = fs.existsSync(designOwnersPath)
    ? parseOwnerFile(fs.readFileSync(designOwnersPath, 'utf8'))
    : [];
  const problems = [];
  const ids = new Map();
  const records = [];

  for (const [kind, kindSchema] of Object.entries(schema.kinds)) {
    if (
      !Number.isInteger(templateVersions[kind]) ||
      templateVersions[kind] < 1
    ) {
      problems.push(
        `docs/templates/knowledge/versions.json: missing valid version for ${kind}.`,
      );
      continue;
    }
    const templatePath = path.join(root, kindSchema.template);
    if (!fs.existsSync(templatePath)) {
      problems.push(
        `${kindSchema.template}: template for ${kind} does not exist.`,
      );
      continue;
    }
    const template = parseKnowledgeDocument(
      fs.readFileSync(templatePath, 'utf8'),
      kindSchema.template,
    );
    problems.push(
      ...validateAgainstSchema(
        template,
        schema,
        relativeSchemaPath,
        kindSchema.template,
        true,
        templateVersions[kind],
        designApprovalOwners,
      ),
    );
    if (template.frontmatter.get('kind') !== kind) {
      problems.push(`${kindSchema.template}: template kind must be ${kind}.`);
    }
  }

  for (const absolutePath of discoverKnowledgeRecords(root)) {
    const filePath = path.relative(root, absolutePath);
    const document = parseKnowledgeDocument(
      fs.readFileSync(absolutePath, 'utf8'),
      filePath,
    );
    const recordVersion = document.frontmatter.get('schema_version');
    const versionedSchema = schemas.get(recordVersion);
    if (!versionedSchema) {
      problems.push(
        `${filePath}: schema_version ${JSON.stringify(recordVersion)} has no schema file.`,
      );
      continue;
    }
    problems.push(
      ...validateAgainstSchema(
        document,
        versionedSchema.schema,
        path.relative(root, versionedSchema.schemaPath),
        filePath,
        false,
        templateVersions[document.frontmatter.get('kind')],
        designApprovalOwners,
      ),
    );
    if (
      versionedSchema.schema.activeAuthorities.includes(
        document.frontmatter.get('authority'),
      ) &&
      recordVersion !== latestVersion
    ) {
      problems.push(
        `${filePath}: active records must use latest schema_version ${latestVersion}.`,
      );
    }
    const id = document.frontmatter.get('id');
    if (id) {
      if (ids.has(id))
        problems.push(
          `${filePath}: duplicate id ${id}; first declared in ${ids.get(id).filePath}.`,
        );
      else {
        ids.set(id, {
          filePath,
          authority: document.frontmatter.get('authority'),
        });
      }
    }
    records.push({filePath, document});
  }

  for (const {filePath, document} of records) {
    if (document.frontmatter.get('authority') !== 'current') continue;
    const kindSchema = schema.kinds[document.frontmatter.get('kind')];
    for (const field of kindSchema.referenceFields ?? []) {
      const references = document.frontmatter.get(field);
      if (!Array.isArray(references)) continue;
      for (const reference of references) {
        const targetId = reference.replace(/\/DEC-[0-9]+$/, '');
        const target = ids.get(targetId);
        if (!target) {
          problems.push(
            `${filePath}: ${field} reference ${reference} does not resolve.`,
          );
        } else if (target.authority !== 'current') {
          problems.push(
            `${filePath}: current records may not rely on non-current ${reference} (${target.filePath}).`,
          );
        }
      }
    }
  }

  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = validateKnowledgeRoot();
  const baseIndex = process.argv.indexOf('--base');
  if (baseIndex !== -1) {
    const baseRevision = process.argv[baseIndex + 1];
    if (!baseRevision) throw new Error('--base requires a revision.');
    problems.push(
      ...validateSchemaEvolution(
        schemaFilesAtRevision(DEFAULT_ROOT, baseRevision),
        currentSchemaFiles(DEFAULT_ROOT),
      ),
    );
  }
  if (problems.length) {
    console.error(`Knowledge validation failed (${problems.length}):\n`);
    for (const problem of problems) console.error(`- ${problem}`);
    process.exit(1);
  }
  console.log('Knowledge templates and records are aligned.');
}
