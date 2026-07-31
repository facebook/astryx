// Copyright (c) Meta Platforms, Inc. and affiliates.

/** Shared XLE/XLO AST + registry type surface for the .mjs pipeline. */

/** A key=value attribute token. */
export interface KvAttr {
  kind: 'kv';
  key: string;
  value: XLEValue;
  raw?: string;
  line: number;
  col: number;
}

/** A bare flag attribute token (e.g. `scroll`). */
export interface FlagAttr {
  kind: 'flag';
  key: string;
  line: number;
  col: number;
}

/** A negated flag attribute token (e.g. `!scroll`). */
export interface NegAttr {
  kind: 'neg';
  key: string;
  line: number;
  col: number;
}

export type Attr = KvAttr | FlagAttr | NegAttr;

/** Parsed `{name +flag :arg}` block hint body. */
export interface Hint {
  name: string;
  flags: string[];
  arg: string | null;
  /** Set by the validator when the hint resolves to a known block. */
  block?: {name: string; description?: string; category?: string};
}

/** An idref value like `#foo`. */
export interface IdRef {
  idref: string;
}

/** A sub-expression value carrying parsed items. */
export interface SubExprValue {
  subexpr: XLEItem[];
}

/** A hint value nested inside a slot. */
export interface HintValue {
  hint: Hint;
}

/** The value of a slot token. */
export type SlotValue = string | IdRef | SubExprValue | HintValue | null;

/** A slot token (`@key=...`). */
export interface Slot {
  kind: 'slot';
  key: string;
  value: SlotValue;
  line: number;
  col: number;
}

/** Any scalar/structured value an attribute or prop can hold. */
export type XLEValue =
  | string
  | number
  | boolean
  | IdRef
  | {subexpr: XLEItem[]}
  | {hint: Hint}
  | {__expr: string}
  | XLEValue[]
  | {[key: string]: XLEValue};

/** A raw prop entry from a component's `.doc.mjs`. */
export interface DocProp {
  name: string;
  type?: string;
  required?: boolean;
}

/** Registry prop metadata. */
export interface RegistryProp {
  name: string;
  type: string;
  required: boolean;
  enumValues: Array<string | number> | null;
  isBoolean: boolean;
  isFunction: boolean;
  isNode: boolean;
}

/** A resolved registry component entry. */
export interface RegistryComponent {
  name: string;
  exportName: string;
  dirName: string;
  importPath: string;
  undocumented?: boolean;
  props: Map<string, RegistryProp>;
}

/** The hydrated registry shape used by validate()/expand(). */
export interface Registry {
  components: Map<string, RegistryComponent>;
  aliases: Map<string, string>;
  componentNames: string[];
}

/** Binding info attached to a node by the validator. */
export interface BoundInfo {
  component: RegistryComponent;
  props: Map<string, XLEValue>;
  slots: Slot[];
  stray: unknown[];
}

/** A parsed element node. */
export interface XLENode {
  kind: 'node';
  name: string | null;
  id: string | null;
  enumMods: string[];
  payload: string | null;
  payload2: string | null;
  attrs: Attr[];
  slots: Slot[];
  hint: Hint | null;
  repeat: number | null;
  selected: boolean;
  children: XLEItem[];
  line: number;
  col: number;
  /** Set by validate(); null when the name could not be resolved. */
  bound?: BoundInfo | null;
}

/** A parenthesized grouping term. */
export interface XLEGroup {
  kind: 'group';
  repeat: number | null;
  children: XLEItem[];
  line: number;
  col: number;
}

/** Any AST item: an element node or a group. */
export type XLEItem = XLENode | XLEGroup;

/** The parsed document. */
export interface XLEDoc {
  roots: XLEItem[];
  overlays: XLEItem[];
  form: 'compact' | 'outline';
}

/** A parsed import statement (from splice.mjs). */
export interface ParsedImport {
  source: string;
  isType: boolean;
  default: string | null;
  namespace: string | null;
  named: string[];
  sideEffect: boolean;
}

/** A merged import map entry (emitter imports). */
export interface ImportEntry {
  named: Set<string>;
  types: Set<string>;
  default: string | null;
  namespace: string | null;
  sideEffect: boolean;
}

/** A prepared block module for splicing. */
export interface PreparedSpliceModule {
  componentName: string;
  imports: ParsedImport[];
  body: string;
}

/** A prepared block module reference (import or splice mode). */
export interface BlockModule {
  mode: 'import' | 'splice';
  componentName: string;
  importPath: string;
  source: string;
}

/** Emitter emission context. */ export interface EmitContext {
  inStack?: boolean;
}

/** A scaffolded useState entry. */
export interface StateEntry {
  name: string;
  setter: string;
  initial: string;
}

/** Internal validation issue (pre-formatting). */
export interface RawIssue {
  message: string;
  line?: number;
  col?: number;
  suggestions?: string[];
}
