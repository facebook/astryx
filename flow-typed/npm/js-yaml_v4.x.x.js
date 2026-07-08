// flow-typed signature: 653406de19061c8dabf31c65ca9e577c
// flow-typed version: 081baee5a4/js-yaml_v4.x.x/flow_>=v0.104.x

declare module 'js-yaml' {
  declare type Mark = {|
    buffer: string,
    column: number,
    line: number,
    name: string,
    position: number,
    snippet: string,
  |};

  declare class YAMLException extends Error {
    constructor(reason?: string, mark?: Mark): this;

    toString(compact?: boolean): string;

    name: string;

    reason: string;

    message: string;

    mark: Mark;
  }

  declare type TypeConstructorOptions = {|
    kind?: "sequence" | "scalar" | "mapping",
    resolve?: (data: any) => boolean,
    construct?: (data: any, type?: string) => any,
    instanceOf?: { ... },
    predicate?: (data: { ... }) => boolean,
    represent?: ((data: { ... }) => any) | { [x: string]: (data: { ... }) => any },
    representName?: (data: { ... }) => any,
    defaultStyle?: string,
    multi?: boolean,
    styleAliases?: { [x: string]: any },
  |};

  declare class Type {
    constructor(tag: string, opts?: TypeConstructorOptions): this;
    kind: "sequence" | "scalar" | "mapping" | null;
    resolve(data: any): boolean;
    construct(data: any, type?: string): any;
    instanceOf: { ... } | null;
    predicate: ((data: { ... }) => boolean) | null;
    represent: ((data: { ... }) => any) | { [x: string]: (data: { ... }) => any } | null;
    representName: ((data: { ... }) => any) | null;
    defaultStyle: string | null;
    multi: boolean;
    styleAliases: { [x: string]: any };
  }

  declare type State = {|
    input: string,
    filename: string | null,
    schema: Schema,
    onWarning: (this: null, e: YAMLException) => void,
    json: boolean,
    length: number,
    position: number,
    line: number,
    lineStart: number,
    lineIndent: number,
    version: null | number,
    checkLineBreaks: boolean,
    kind: string,
    result: any,
    implicitTypes: Type[],
  |};

  declare type EventType = "open" | "close";

  declare type LoadOptions = {|
    /** string to be used as a file path in error/warning messages. */
    filename?: string,
    /** function to call on warning messages. */
    onWarning?: (this: null, e: YAMLException) => void,
    /** specifies a schema to use. */
    schema?: Schema,
    /** compatibility with JSON.parse behaviour. */
    json?: boolean,
    /** listener for parse events */
    listener?: (this: State, eventType: EventType, state: State) => void,
  |};

  declare type LoadReturn = string | number | { [key: string]: any } | null | void;

  declare type SchemaDefinition = {|
    implicit?: Type[],
    explicit?: Type[],
  |};

  declare class Schema {
      constructor(definition: SchemaDefinition | Type[] | Type): this;
      extend(types: SchemaDefinition | Type[] | Type): Schema;
  }

  declare type DumpOptions = {|
    /** indentation width to use (in spaces). */
    indent?: number,
    /** when true, will not add an indentation level to array elements */
    noArrayIndent?: boolean,
    /** do not throw on invalid types (like function in the safe schema) and skip pairs and single values with such types. */
    skipInvalid?: boolean,
    /** specifies level of nesting, when to switch from block to flow style for collections. -1 means block style everwhere */
    flowLevel?: number,
    /** Each tag may have own set of styles.    - "tag" => "style" map. */
    styles?: { [x: string]: any },
    /** specifies a schema to use. */
    schema?: Schema,
    /** if true, sort keys when dumping YAML. If a function, use the function to sort the keys. (default: false) */
    sortKeys?: boolean | ((a: any, b: any) => number),
    /** set max line width. (default: 80) */
    lineWidth?: number,
    /** if true, don't convert duplicate objects into references (default: false) */
    noRefs?: boolean,
    /** if true don't try to be compatible with older yaml versions. Currently: don't quote "yes", "no" and so on, as required for YAML 1.1 (default: false) */
    noCompatMode?: boolean,
    /**
     * if true flow sequences will be condensed, omitting the space between `key: value` or `a, b`. Eg. `'[a,b]'` or `{a:{b:c}}`.
     * Can be useful when using yaml for pretty URL query params as spaces are %-encoded. (default: false).
     */
    condenseFlow?: boolean,
    /** strings will be quoted using this quoting style. If you specify single quotes, double quotes will still be used for non-printable characters. (default: `'`) */
    quotingType?: "'" | "\"",
    /** if true, all non-key strings will be quoted even if they normally don't need to. (default: false) */
    forceQuotes?: boolean,
    /** callback `function (key, value)` called recursively on each key/value in source object (see `replacer` docs for `JSON.stringify`). */
    replacer?: (key: string, value: any) => any,
  |};

  declare class Exports {
    load(str: string, opts?: LoadOptions): LoadReturn;
    loadAll(str: string, iterator?: null, opts?: LoadOptions): LoadReturn[];
    loadAll(str: string, iterator: (doc: LoadReturn) => void, opts?: LoadOptions): void;
    dump(obj: any, opts?: DumpOptions): string;
    Schema: typeof Schema,
    YAMLException: typeof YAMLException,
    /** only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346 */
    FAILSAFE_SCHEMA: Schema,
    /** only strings, arrays and plain objects: http://www.yaml.org/spec/1.2/spec.html#id2802346 */
    JSON_SCHEMA: Schema,
    /** same as JSON_SCHEMA: http://www.yaml.org/spec/1.2/spec.html#id2804923 */
    CORE_SCHEMA: Schema,
    /** all supported YAML types */
    DEFAULT_SCHEMA: Schema,
  }

  declare module.exports: Exports;
}
