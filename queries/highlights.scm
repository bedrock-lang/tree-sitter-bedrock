(IDENT) @variable

(line_comment) @comment

(INTEGER) @number
(FLOAT) @number.float
(CHAR) @character
(STRING) @string
(BOOL) @boolean

[
  "import"
  "type"
  "struct"
  "enum"
  "extern"
  "static"
  "where"
] @keyword

[
  "func"
  "proc"
  "inline"
] @keyword.function

[
  "var"
  "const"
] @keyword.storage

(pub) @keyword.modifier

[
  "if"
  "elif"
  "else"
  "match"
  "case"
  "orelse"
] @keyword.control.conditional

[ "for" "while" "in" ] @keyword.control.repeat

"return" @keyword.control.return

"try" @keyword.control.exception

[
  "defer"
  "unsafe"
  "comptime"
] @keyword

"end" @keyword

[
  "i8" "i16" "i32" "i64"
  "u8" "u16" "u32" "u64"
  "usize" "isize"
  "f32" "f64"
  "bool" "char" "str"
] @type.builtin

(named_type (IDENT) @type)
(type_param (IDENT) @type.parameter)

(function (IDENT) @function)
(proc_def (IDENT) @function)
(method_def (IDENT) @function.method)
(extern_def (IDENT) @function)

(struct_def (IDENT) @type.definition)
(enum_def (IDENT) @type.definition)
(enum_variant (IDENT) @constant)

(struct_literal (IDENT) @type)
(field_init (IDENT) @property)
(variant_pattern (IDENT) @constant)

(param (IDENT) @variable.parameter)
(extern_param (IDENT) @variable.parameter)
(struct_field (IDENT) @property)

(suffix "." (IDENT) @property)
(place_expr "." (IDENT) @property)

(postfix
  (primary (IDENT) @function.call)
  (suffix "("))

(var_stmt (IDENT) @variable)
(var_def (IDENT) @variable)
(local_static_var_stmt (IDENT) @variable)
(const_def (IDENT) @constant)
(for_expr (IDENT) @variable)

"_" @variable.builtin

[
  "=" "+=" "-=" "*=" "/=" "%="
  "&=" "|=" "^=" "<<=" ">>="
  "==" "!=" "<" ">" "<=" ">="
  "&&" "||" "!"
  "+" "-" "*" "/" "%"
  "&" "|" "^" "~" "<<" ">>"
  ".." "..="
  "->"
  "?"
] @operator

"..." @punctuation.special

[ "(" ")" "[" "]" ] @punctuation.bracket
[ "," ":" ";" ] @punctuation.delimiter
"." @punctuation.delimiter
