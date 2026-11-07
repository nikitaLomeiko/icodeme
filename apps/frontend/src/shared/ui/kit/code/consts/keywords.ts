export const KEYWORDS = new Set([
  // JavaScript / TypeScript
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new',
  'this', 'super', 'import', 'export', 'from', 'default', 'as', 'try',
  'catch', 'finally', 'throw', 'async', 'await', 'yield', 'of', 'in',
  'typeof', 'instanceof', 'void', 'delete', 'with', 'debugger', 'interface',
  'type', 'enum', 'implements', 'abstract', 'private', 'protected', 'public',
  'static', 'readonly', 'declare', 'namespace', 'module', 'global',
  'undefined', 'null', 'true', 'false', 'NaN', 'Infinity',
  // Python
  'def', 'elif', 'except', 'finally', 'lambda', 'nonlocal', 'pass', 'raise',
  'yield', 'and', 'or', 'not', 'is', 'True', 'False', 'None', 'self', 'cls',
  'with', 'as',
  // Java
  'package', 'import', 'synchronized', 'volatile', 'transient', 'native',
  'strictfp', 'assert', 'throws', 'throw', 'final', 'finally',
  // C / C++
  '#include', '#define', '#ifdef', '#ifndef', '#endif', '#pragma',
  'struct', 'union', 'typedef', 'const', 'volatile', 'register',
  'extern', 'inline', 'friend', 'virtual', 'override', 'explicit',
  'mutable', 'typename', 'template', 'operator', 'namespace', 'using',
  'goto', 'sizeof', 'auto', 'register',
  // Rust
  'fn', 'mut', 'pub', 'crate', 'mod', 'impl', 'trait', 'where', 'ref',
  'match', 'move', 'dyn', 'loop', 'unsafe', 'extern',
  'Some', 'None', 'Ok', 'Err',
  // Go
  'package', 'func', 'defer', 'go', 'chan', 'select', 'range', 'map',
  'fallthrough', 'nil', 'true', 'false', 'iota',
  // C#
  'get', 'set', 'value', 'partial', 'readonly', 'event', 'delegate',
  'checked', 'unchecked', 'fixed', 'unsafe', 'stackalloc', 'sizeof',
  'nameof', 'is', 'as', 'in', 'out', 'ref', 'params',
  // Ruby
  'def', 'end', 'module', 'yield', 'alias', 'undef', 'begin', 'rescue',
  'ensure', 'redo', 'retry', 'nil', 'self', 'super',
  // Swift
  'let', 'var', 'func', 'guard', 'defer', 'where', 'associatedtype',
  'rethrows', 'subscript', 'indirect', 'convenience', 'didSet', 'willSet',
  'lazy', 'dynamic', 'optional', 'required', 'unowned', 'weak',
  // Kotlin
  'val', 'var', 'fun', 'data', 'sealed', 'inner', 'companion', 'object',
  'init', 'constructor', 'by', 'lateinit', 'tailrec', 'operator',
  'infix', 'crossinline', 'noinline', 'reified', 'suspend',
  // PHP
  'echo', 'print', 'die', 'exit', 'include', 'require', 'once',
  'clone', 'instanceof', '__construct', '__destruct', '__call',
  // Haskell / Elm
  'data', 'type', 'class', 'instance', 'where', 'let', 'in', 'of',
  'case', 'if', 'then', 'else', 'do', 'module', 'import', 'hiding',
  'qualified', 'deriving', 'infix', 'infixl', 'infixr',
  // Lua
  'local', 'repeat', 'until', 'goto', 'and', 'or', 'not',
  'nil', 'true', 'false',
  // Dart
  'var', 'final', 'late', 'required', 'deferred', 'factory', 'mixin',
  'covariant', 'typedef', 'extension', 'show', 'hide',
  // Scala
  'val', 'var', 'def', 'trait', 'object', 'case', 'sealed', 'implicit',
  'match', 'do', 'yield', 'macro',
  // Assembly (common directives)
  'section', 'global', 'extern', 'align', 'db', 'dw', 'dd', 'dq',
  'mov', 'add', 'sub', 'mul', 'div', 'jmp', 'call', 'ret', 'cmp',
  'je', 'jne', 'jg', 'jl', 'jge', 'jle', 'push', 'pop', 'int', 'syscall',
]);