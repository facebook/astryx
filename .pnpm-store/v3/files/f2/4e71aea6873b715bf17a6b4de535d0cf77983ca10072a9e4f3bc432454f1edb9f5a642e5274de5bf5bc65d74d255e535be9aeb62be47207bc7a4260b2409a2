// This definition file follows a somewhat unusual format. ESTree allows
// runtime type checks based on the `type` parameter. In order to explain this
// to typescript we want to use discriminated union types:
// https://github.com/Microsoft/TypeScript/pull/9163
//
// For ESTree this is a bit tricky because the high level interfaces like
// Node or Function are pulling double duty. We want to pass common fields down
// to the interfaces that extend them (like Identifier or
// ArrowFunctionExpression), but you can't extend a type union or enforce
// common fields on them. So we've split the high level interfaces into two
// types, a base type which passes down inherited fields, and a type union of
// all types which extend the base type. Only the type union is exported, and
// the union is how other types refer to the collection of inheriting types.
//
// This makes the definitions file here somewhat more difficult to maintain,
// but it has the notable advantage of making ESTree much easier to use as
// an end user.

interface BaseNodeWithoutComments {
    // Every leaf interface that extends BaseNode must specify a type property.
    // The type property should be a string literal. For example, Identifier
    // has: `type: "Identifier"`
    type: string;
    loc?: SourceLocation | null | undefined;
    range?: [number, number] | undefined;
}

interface BaseNode extends BaseNodeWithoutComments {
    leadingComments?: Comment[] | undefined;
    trailingComments?: Comment[] | undefined;
}

interface NodeMap {
    AssignmentProperty: AssignmentProperty;
    CatchClause: CatchClause;
    Class: Class;
    ClassBody: ClassBody;
    Expression: Expression;
    Function: Function;
    Identifier: Identifier;
    Literal: Literal;
    MethodDefinition: MethodDefinition;
    ModuleDeclaration: ModuleDeclaration;
    ModuleSpecifier: ModuleSpecifier;
    Pattern: Pattern;
    PrivateIdentifier: PrivateIdentifier;
    Program: Program;
    Property: Property;
    PropertyDefinition: PropertyDefinition;
    SpreadElement: SpreadElement;
    Statement: Statement;
    Super: Super;
    SwitchCase: SwitchCase;
    TemplateElement: TemplateElement;
    VariableDeclarator: VariableDeclarator;
}

type Node$1 = NodeMap[keyof NodeMap];

interface Comment extends BaseNodeWithoutComments {
    type: "Line" | "Block";
    value: string;
}

interface SourceLocation {
    source?: string | null | undefined;
    start: Position;
    end: Position;
}

interface Position {
    /** >= 1 */
    line: number;
    /** >= 0 */
    column: number;
}

interface Program extends BaseNode {
    type: "Program";
    sourceType: "script" | "module";
    body: Array<Directive | Statement | ModuleDeclaration>;
    comments?: Comment[] | undefined;
}

interface Directive extends BaseNode {
    type: "ExpressionStatement";
    expression: Literal;
    directive: string;
}

interface BaseFunction extends BaseNode {
    params: Pattern[];
    generator?: boolean | undefined;
    async?: boolean | undefined;
    // The body is either BlockStatement or Expression because arrow functions
    // can have a body that's either. FunctionDeclarations and
    // FunctionExpressions have only BlockStatement bodies.
    body: BlockStatement | Expression;
}

type Function = FunctionDeclaration | FunctionExpression | ArrowFunctionExpression;

type Statement =
    | ExpressionStatement
    | BlockStatement
    | StaticBlock
    | EmptyStatement
    | DebuggerStatement
    | WithStatement
    | ReturnStatement
    | LabeledStatement
    | BreakStatement
    | ContinueStatement
    | IfStatement
    | SwitchStatement
    | ThrowStatement
    | TryStatement
    | WhileStatement
    | DoWhileStatement
    | ForStatement
    | ForInStatement
    | ForOfStatement
    | Declaration;

interface BaseStatement extends BaseNode {}

interface EmptyStatement extends BaseStatement {
    type: "EmptyStatement";
}

interface BlockStatement extends BaseStatement {
    type: "BlockStatement";
    body: Statement[];
    innerComments?: Comment[] | undefined;
}

interface StaticBlock extends Omit<BlockStatement, "type"> {
    type: "StaticBlock";
}

interface ExpressionStatement extends BaseStatement {
    type: "ExpressionStatement";
    expression: Expression;
}

interface IfStatement extends BaseStatement {
    type: "IfStatement";
    test: Expression;
    consequent: Statement;
    alternate?: Statement | null | undefined;
}

interface LabeledStatement extends BaseStatement {
    type: "LabeledStatement";
    label: Identifier;
    body: Statement;
}

interface BreakStatement extends BaseStatement {
    type: "BreakStatement";
    label?: Identifier | null | undefined;
}

interface ContinueStatement extends BaseStatement {
    type: "ContinueStatement";
    label?: Identifier | null | undefined;
}

interface WithStatement extends BaseStatement {
    type: "WithStatement";
    object: Expression;
    body: Statement;
}

interface SwitchStatement extends BaseStatement {
    type: "SwitchStatement";
    discriminant: Expression;
    cases: SwitchCase[];
}

interface ReturnStatement extends BaseStatement {
    type: "ReturnStatement";
    argument?: Expression | null | undefined;
}

interface ThrowStatement extends BaseStatement {
    type: "ThrowStatement";
    argument: Expression;
}

interface TryStatement extends BaseStatement {
    type: "TryStatement";
    block: BlockStatement;
    handler?: CatchClause | null | undefined;
    finalizer?: BlockStatement | null | undefined;
}

interface WhileStatement extends BaseStatement {
    type: "WhileStatement";
    test: Expression;
    body: Statement;
}

interface DoWhileStatement extends BaseStatement {
    type: "DoWhileStatement";
    body: Statement;
    test: Expression;
}

interface ForStatement extends BaseStatement {
    type: "ForStatement";
    init?: VariableDeclaration | Expression | null | undefined;
    test?: Expression | null | undefined;
    update?: Expression | null | undefined;
    body: Statement;
}

interface BaseForXStatement extends BaseStatement {
    left: VariableDeclaration | Pattern;
    right: Expression;
    body: Statement;
}

interface ForInStatement extends BaseForXStatement {
    type: "ForInStatement";
}

interface DebuggerStatement extends BaseStatement {
    type: "DebuggerStatement";
}

type Declaration = FunctionDeclaration | VariableDeclaration | ClassDeclaration;

interface BaseDeclaration extends BaseStatement {}

interface MaybeNamedFunctionDeclaration extends BaseFunction, BaseDeclaration {
    type: "FunctionDeclaration";
    /** It is null when a function declaration is a part of the `export default function` statement */
    id: Identifier | null;
    body: BlockStatement;
}

interface FunctionDeclaration extends MaybeNamedFunctionDeclaration {
    id: Identifier;
}

interface VariableDeclaration extends BaseDeclaration {
    type: "VariableDeclaration";
    declarations: VariableDeclarator[];
    kind: "var" | "let" | "const";
}

interface VariableDeclarator extends BaseNode {
    type: "VariableDeclarator";
    id: Pattern;
    init?: Expression | null | undefined;
}

interface ExpressionMap {
    ArrayExpression: ArrayExpression;
    ArrowFunctionExpression: ArrowFunctionExpression;
    AssignmentExpression: AssignmentExpression;
    AwaitExpression: AwaitExpression;
    BinaryExpression: BinaryExpression;
    CallExpression: CallExpression;
    ChainExpression: ChainExpression;
    ClassExpression: ClassExpression;
    ConditionalExpression: ConditionalExpression;
    FunctionExpression: FunctionExpression;
    Identifier: Identifier;
    ImportExpression: ImportExpression;
    Literal: Literal;
    LogicalExpression: LogicalExpression;
    MemberExpression: MemberExpression;
    MetaProperty: MetaProperty;
    NewExpression: NewExpression;
    ObjectExpression: ObjectExpression;
    SequenceExpression: SequenceExpression;
    TaggedTemplateExpression: TaggedTemplateExpression;
    TemplateLiteral: TemplateLiteral;
    ThisExpression: ThisExpression;
    UnaryExpression: UnaryExpression;
    UpdateExpression: UpdateExpression;
    YieldExpression: YieldExpression;
}

type Expression = ExpressionMap[keyof ExpressionMap];

interface BaseExpression extends BaseNode {}

type ChainElement = SimpleCallExpression | MemberExpression;

interface ChainExpression extends BaseExpression {
    type: "ChainExpression";
    expression: ChainElement;
}

interface ThisExpression extends BaseExpression {
    type: "ThisExpression";
}

interface ArrayExpression extends BaseExpression {
    type: "ArrayExpression";
    elements: Array<Expression | SpreadElement | null>;
}

interface ObjectExpression extends BaseExpression {
    type: "ObjectExpression";
    properties: Array<Property | SpreadElement>;
}

interface PrivateIdentifier extends BaseNode {
    type: "PrivateIdentifier";
    name: string;
}

interface Property extends BaseNode {
    type: "Property";
    key: Expression | PrivateIdentifier;
    value: Expression | Pattern; // Could be an AssignmentProperty
    kind: "init" | "get" | "set";
    method: boolean;
    shorthand: boolean;
    computed: boolean;
}

interface PropertyDefinition extends BaseNode {
    type: "PropertyDefinition";
    key: Expression | PrivateIdentifier;
    value?: Expression | null | undefined;
    computed: boolean;
    static: boolean;
}

interface FunctionExpression extends BaseFunction, BaseExpression {
    id?: Identifier | null | undefined;
    type: "FunctionExpression";
    body: BlockStatement;
}

interface SequenceExpression extends BaseExpression {
    type: "SequenceExpression";
    expressions: Expression[];
}

interface UnaryExpression extends BaseExpression {
    type: "UnaryExpression";
    operator: UnaryOperator;
    prefix: true;
    argument: Expression;
}

interface BinaryExpression extends BaseExpression {
    type: "BinaryExpression";
    operator: BinaryOperator;
    left: Expression;
    right: Expression;
}

interface AssignmentExpression extends BaseExpression {
    type: "AssignmentExpression";
    operator: AssignmentOperator;
    left: Pattern | MemberExpression;
    right: Expression;
}

interface UpdateExpression extends BaseExpression {
    type: "UpdateExpression";
    operator: UpdateOperator;
    argument: Expression;
    prefix: boolean;
}

interface LogicalExpression extends BaseExpression {
    type: "LogicalExpression";
    operator: LogicalOperator;
    left: Expression;
    right: Expression;
}

interface ConditionalExpression extends BaseExpression {
    type: "ConditionalExpression";
    test: Expression;
    alternate: Expression;
    consequent: Expression;
}

interface BaseCallExpression extends BaseExpression {
    callee: Expression | Super;
    arguments: Array<Expression | SpreadElement>;
}
type CallExpression = SimpleCallExpression | NewExpression;

interface SimpleCallExpression extends BaseCallExpression {
    type: "CallExpression";
    optional: boolean;
}

interface NewExpression extends BaseCallExpression {
    type: "NewExpression";
}

interface MemberExpression extends BaseExpression, BasePattern {
    type: "MemberExpression";
    object: Expression | Super;
    property: Expression | PrivateIdentifier;
    computed: boolean;
    optional: boolean;
}

type Pattern = Identifier | ObjectPattern | ArrayPattern | RestElement | AssignmentPattern | MemberExpression;

interface BasePattern extends BaseNode {}

interface SwitchCase extends BaseNode {
    type: "SwitchCase";
    test?: Expression | null | undefined;
    consequent: Statement[];
}

interface CatchClause extends BaseNode {
    type: "CatchClause";
    param: Pattern | null;
    body: BlockStatement;
}

interface Identifier extends BaseNode, BaseExpression, BasePattern {
    type: "Identifier";
    name: string;
}

type Literal = SimpleLiteral | RegExpLiteral | BigIntLiteral;

interface SimpleLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value: string | boolean | number | null;
    raw?: string | undefined;
}

interface RegExpLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: RegExp | null | undefined;
    regex: {
        pattern: string;
        flags: string;
    };
    raw?: string | undefined;
}

interface BigIntLiteral extends BaseNode, BaseExpression {
    type: "Literal";
    value?: bigint | null | undefined;
    bigint: string;
    raw?: string | undefined;
}

type UnaryOperator = "-" | "+" | "!" | "~" | "typeof" | "void" | "delete";

type BinaryOperator =
    | "=="
    | "!="
    | "==="
    | "!=="
    | "<"
    | "<="
    | ">"
    | ">="
    | "<<"
    | ">>"
    | ">>>"
    | "+"
    | "-"
    | "*"
    | "/"
    | "%"
    | "**"
    | "|"
    | "^"
    | "&"
    | "in"
    | "instanceof";

type LogicalOperator = "||" | "&&" | "??";

type AssignmentOperator =
    | "="
    | "+="
    | "-="
    | "*="
    | "/="
    | "%="
    | "**="
    | "<<="
    | ">>="
    | ">>>="
    | "|="
    | "^="
    | "&="
    | "||="
    | "&&="
    | "??=";

type UpdateOperator = "++" | "--";

interface ForOfStatement extends BaseForXStatement {
    type: "ForOfStatement";
    await: boolean;
}

interface Super extends BaseNode {
    type: "Super";
}

interface SpreadElement extends BaseNode {
    type: "SpreadElement";
    argument: Expression;
}

interface ArrowFunctionExpression extends BaseExpression, BaseFunction {
    type: "ArrowFunctionExpression";
    expression: boolean;
    body: BlockStatement | Expression;
}

interface YieldExpression extends BaseExpression {
    type: "YieldExpression";
    argument?: Expression | null | undefined;
    delegate: boolean;
}

interface TemplateLiteral extends BaseExpression {
    type: "TemplateLiteral";
    quasis: TemplateElement[];
    expressions: Expression[];
}

interface TaggedTemplateExpression extends BaseExpression {
    type: "TaggedTemplateExpression";
    tag: Expression;
    quasi: TemplateLiteral;
}

interface TemplateElement extends BaseNode {
    type: "TemplateElement";
    tail: boolean;
    value: {
        /** It is null when the template literal is tagged and the text has an invalid escape (e.g. - tag`\unicode and \u{55}`) */
        cooked?: string | null | undefined;
        raw: string;
    };
}

interface AssignmentProperty extends Property {
    value: Pattern;
    kind: "init";
    method: boolean; // false
}

interface ObjectPattern extends BasePattern {
    type: "ObjectPattern";
    properties: Array<AssignmentProperty | RestElement>;
}

interface ArrayPattern extends BasePattern {
    type: "ArrayPattern";
    elements: Array<Pattern | null>;
}

interface RestElement extends BasePattern {
    type: "RestElement";
    argument: Pattern;
}

interface AssignmentPattern extends BasePattern {
    type: "AssignmentPattern";
    left: Pattern;
    right: Expression;
}

type Class = ClassDeclaration | ClassExpression;
interface BaseClass extends BaseNode {
    superClass?: Expression | null | undefined;
    body: ClassBody;
}

interface ClassBody extends BaseNode {
    type: "ClassBody";
    body: Array<MethodDefinition | PropertyDefinition | StaticBlock>;
}

interface MethodDefinition extends BaseNode {
    type: "MethodDefinition";
    key: Expression | PrivateIdentifier;
    value: FunctionExpression;
    kind: "constructor" | "method" | "get" | "set";
    computed: boolean;
    static: boolean;
}

interface MaybeNamedClassDeclaration extends BaseClass, BaseDeclaration {
    type: "ClassDeclaration";
    /** It is null when a class declaration is a part of the `export default class` statement */
    id: Identifier | null;
}

interface ClassDeclaration extends MaybeNamedClassDeclaration {
    id: Identifier;
}

interface ClassExpression extends BaseClass, BaseExpression {
    type: "ClassExpression";
    id?: Identifier | null | undefined;
}

interface MetaProperty extends BaseExpression {
    type: "MetaProperty";
    meta: Identifier;
    property: Identifier;
}

type ModuleDeclaration =
    | ImportDeclaration
    | ExportNamedDeclaration
    | ExportDefaultDeclaration
    | ExportAllDeclaration;
interface BaseModuleDeclaration extends BaseNode {}

type ModuleSpecifier = ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier | ExportSpecifier;
interface BaseModuleSpecifier extends BaseNode {
    local: Identifier;
}

interface ImportDeclaration extends BaseModuleDeclaration {
    type: "ImportDeclaration";
    specifiers: Array<ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier>;
    source: Literal;
}

interface ImportSpecifier extends BaseModuleSpecifier {
    type: "ImportSpecifier";
    imported: Identifier;
}

interface ImportExpression extends BaseExpression {
    type: "ImportExpression";
    source: Expression;
}

interface ImportDefaultSpecifier extends BaseModuleSpecifier {
    type: "ImportDefaultSpecifier";
}

interface ImportNamespaceSpecifier extends BaseModuleSpecifier {
    type: "ImportNamespaceSpecifier";
}

interface ExportNamedDeclaration extends BaseModuleDeclaration {
    type: "ExportNamedDeclaration";
    declaration?: Declaration | null | undefined;
    specifiers: ExportSpecifier[];
    source?: Literal | null | undefined;
}

interface ExportSpecifier extends BaseModuleSpecifier {
    type: "ExportSpecifier";
    exported: Identifier;
}

interface ExportDefaultDeclaration extends BaseModuleDeclaration {
    type: "ExportDefaultDeclaration";
    declaration: MaybeNamedFunctionDeclaration | MaybeNamedClassDeclaration | Expression;
}

interface ExportAllDeclaration extends BaseModuleDeclaration {
    type: "ExportAllDeclaration";
    exported: Identifier | null;
    source: Literal;
}

interface AwaitExpression extends BaseExpression {
    type: "AwaitExpression";
    argument: Expression;
}

type Positioned<T> = T & {
    start: number;
    end: number;
};
type Node = Positioned<Node$1>;
interface IdentifierInfo {
    /**
     * If the identifier is used in a property shorthand
     * { foo } -> { foo: __import_x__.foo }
     */
    hasBindingShortcut: boolean;
    /**
     * The identifier is used in a class declaration
     */
    classDeclaration: boolean;
    /**
     * The identifier is a name for a class expression
     */
    classExpression: boolean;
}
interface Visitors {
    onIdentifier?: (node: Positioned<Identifier>, info: IdentifierInfo, parentStack: Node[]) => void;
    onImportMeta?: (node: Node) => void;
    onDynamicImport?: (node: Positioned<ImportExpression>) => void;
    onCallExpression?: (node: Positioned<CallExpression>) => void;
}
declare function setIsNodeInPattern(node: Property): WeakSet<Node$1>;
declare function isNodeInPattern(node: Node$1): node is Property;
/**
 * Same logic from \@vue/compiler-core & \@vue/compiler-sfc
 * Except this is using acorn AST
 */
declare function esmWalker(root: Node, { onIdentifier, onImportMeta, onDynamicImport, onCallExpression }: Visitors): void;
declare function isStaticProperty(node: Node$1): node is Property;
declare function isStaticPropertyKey(node: Node$1, parent: Node$1): boolean;
declare function isFunctionNode(node: Node$1): node is Function;
declare function isInDestructuringAssignment(parent: Node$1, parentStack: Node$1[]): boolean;

export { type ArrayExpression, type ArrayPattern, type ArrowFunctionExpression, type AssignmentExpression, type AssignmentOperator, type AssignmentPattern, type AssignmentProperty, type AwaitExpression, type BaseCallExpression, type BaseClass, type BaseDeclaration, type BaseExpression, type BaseForXStatement, type BaseFunction, type BaseModuleDeclaration, type BaseModuleSpecifier, type BaseNode, type BaseNodeWithoutComments, type BasePattern, type BaseStatement, type BigIntLiteral, type BinaryExpression, type BinaryOperator, type BlockStatement, type BreakStatement, type CallExpression, type CatchClause, type ChainElement, type ChainExpression, type Class, type ClassBody, type ClassDeclaration, type ClassExpression, type Comment, type ConditionalExpression, type ContinueStatement, type DebuggerStatement, type Declaration, type Directive, type DoWhileStatement, type EmptyStatement, type ExportAllDeclaration, type ExportDefaultDeclaration, type ExportNamedDeclaration, type ExportSpecifier, type Expression, type ExpressionMap, type ExpressionStatement, type ForInStatement, type ForOfStatement, type ForStatement, type Function, type FunctionDeclaration, type FunctionExpression, type Identifier, type IfStatement, type ImportDeclaration, type ImportDefaultSpecifier, type ImportExpression, type ImportNamespaceSpecifier, type ImportSpecifier, type LabeledStatement, type Literal, type LogicalExpression, type LogicalOperator, type MaybeNamedClassDeclaration, type MaybeNamedFunctionDeclaration, type MemberExpression, type MetaProperty, type MethodDefinition, type ModuleDeclaration, type ModuleSpecifier, type NewExpression, type Node, type NodeMap, type ObjectExpression, type ObjectPattern, type Pattern, type Position, type Positioned, type PrivateIdentifier, type Program, type Property, type PropertyDefinition, type RegExpLiteral, type RestElement, type ReturnStatement, type SequenceExpression, type SimpleCallExpression, type SimpleLiteral, type SourceLocation, type SpreadElement, type Statement, type StaticBlock, type Super, type SwitchCase, type SwitchStatement, type TaggedTemplateExpression, type TemplateElement, type TemplateLiteral, type ThisExpression, type ThrowStatement, type TryStatement, type UnaryExpression, type UnaryOperator, type UpdateExpression, type UpdateOperator, type VariableDeclaration, type VariableDeclarator, type WhileStatement, type WithStatement, type YieldExpression, esmWalker, isFunctionNode, isInDestructuringAssignment, isNodeInPattern, isStaticProperty, isStaticPropertyKey, setIsNodeInPattern };
