module.exports = grammar({
  name: 'bedrock',

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  externals: $ => [],

  word: $ => $.IDENT,

  conflicts: $ => [
    [$.control_flow_stmt, $.primary],
    [$.named_type],
    [$.result],
  ],

  rules: {
    // program//
    program: $ => repeat($.item),

    item: $ => choice(
      $.import_def,
      $.function,
      $.proc,
      $.struct_def,
      $.enum_def,
      $.extern_def,
      $.var_def,
      $.const_def
    ),

    import_def: $ => seq(
      'import',
      $.IDENT,
      repeat(seq('.', $.IDENT)),
      ';'
    ),

    type_params: $ => seq(
      '[',
      commaSep1($, $.type_param),
      ']'
    ),
    type_param: $ => $.IDENT,

    result: $ => seq(
      '->',
      choice(
        seq('?', $.type),
        seq($.type, optional(prec(10, '!')))
      )
    ),

    params: $ => commaSep1($, $.param),
    param: $ => seq(
      $.IDENT,
      ':',
      optional('?'),
      optional('const'),
      $.type
    ),

    block: $ => repeat1($.statement),

    // function and proc //
    function: $ => seq(
      optional($.pub),
      optional('inline'),
      'func',
      $.IDENT,
      optional($.type_params),
      '(',
      optional($.params),
      ')',
      optional($.result),
      optional($.block),
      'end'
    ),

    proc: $ => seq(
      optional($.pub),
      optional('inline'),
      'proc',
      $.IDENT,
      optional($.type_params),
      '(',
      optional($.params),
      ')',
      optional($.block),
      'end'
    ),

    // extern //
    extern_def: $ => seq(
      'extern',
      choice(
        seq('func', $.IDENT, '(', optional($.extern_params), ')', '->', $.type),
        seq('proc', $.IDENT, '(', optional($.extern_params), ')')
      )
    ),
    extern_params: $ => choice(
      seq(commaSep1($, $.extern_param), optional(seq(',', '...'))),
      '...'
    ),
    extern_param: $ => seq($.IDENT, ':', $.type),

    // Structs and Enums //

    struct_def: $ => seq(
      optional($.pub),
      'type',
      $.IDENT,
      optional($.type_params),
      '=',
      'struct',
      optional($.struct_members),
      'end'
    ),
    struct_members: $ => repeat1($.struct_member),
    struct_member: $ => choice(
      seq($.struct_field, ','),
      $.method_def
    ),

    struct_field: $ => seq(
      optional($.pub),
      $.IDENT,
      ':',
      optional('?'),
      $.type
    ),

    method_def: $ => choice(
      seq(
        optional($.pub),
        optional('inline'),
        'func',
        $.IDENT,
        optional($.type_params),
        '(',
        optional($.params),
        ')',
        optional($.result),
        optional($.block),
        'end'
      ),
      seq(
        optional($.pub),
        optional('inline'),
        'proc',
        $.IDENT,
        optional($.type_params),
        '(',
        optional($.params),
        ')',
        optional($.block),
        'end'
      )
    ),

    enum_def: $ => seq(
      optional($.pub),
      'type',
      $.IDENT,
      optional($.type_params),
      '=',
      'enum',
      optional($.enum_variants),
      'end'
    ),
    enum_variants: $ => commaSep1($, $.enum_variant),
    enum_variant: $ => $.IDENT,

    // var and const //
    var_def: $ => seq(
      optional($.pub),
      'var',
      $.IDENT,
      optional(seq(':', optional('?'), $.type)),
      '=',
      $.expression,
      ';'
    ),

    const_def: $ => seq(
      optional($.pub),
      'const',
      $.IDENT,
      optional(seq(':', optional('?'), $.type)),
      '=',
      $.expression,
      ';'
    ),

    // Statements //

    statement: $ => choice(
      $.var_stmt,
      $.const_stmt,
      $.local_static_var_stmt,
      $.assign_stmt,
      $.defer_stmt,
      // $.unsafe_stmt,
      // $.control_flow_stmt,
      // $.return_stmt,
      // $.expr_stmt
    ),

    var_stmt: $ => seq(
      'var',
      $.IDENT,
      optional(seq(':', optional('?'), $.type)),
      '=',
      $.expression,
      ';'
    ),

    const_stmt: $ => seq(
      'const',
      $.IDENT,
      optional(seq(':', optional('?'), $.type)),
      '=',
      $.expression,
      ';'
    ),

    local_static_var_stmt: $ => seq(
      'static',
      'var',
      $.IDENT,
      optional(seq(':', optional('?'), $.type)),
      '=',
      $.expression,
      ';'
    ),

    place_expr: $ => $.expression,
    assign_stmt: $ => seq(
      $.place_expr,
      choice(
        '=',
        '+=', '-=', '*=', '/=', '%=',
        '&=', '|=', '^=', '<<=', '>>='
      ),
      $.expression,
      ';'
    ),

    defer_stmt: $ => seq(
      'defer',
      choice(
        $.var_stmt,
        $.const_stmt,
        $.assign_stmt,
        $.control_flow_stmt,
        $.return_stmt,
        $.expr_stmt
      )
    ),

    control_flow_stmt: $ => "todo",
    return_stmt: $ => "todo",
    expr_stmt: $ => seq($.expression, ';'),

    // Types //
    type: $ => choice(
      'i8', 'i16', 'i32', 'i64',
      'u8', 'u16', 'u32', 'u64',
      'usize', 'isize',
      'f32', 'f64',
      'bool', 'char', 'str',
      seq('*', $.type),
      $.array_type,
      $.named_type,
      $.func_type,
      $.proc_type
    ),

    array_type: $ => seq(
      '[',
      choice($.INTEGER, '_'),
      ']',
      $.type
    ),

    named_type: $ => seq(
      $.IDENT,
      optional(seq('[', commaSep1($, $.type), ']'))
    ),

    type_list: $ => commaSep1($, $.type),

    func_type: $ => seq(
      'func',
      '(',
      optional($.type_list),
      ')',
      $.result
    ),

    proc_type: $ => seq(
      'proc',
      '(',
      optional($.type_list),
      ')'
    ),

    // expressions //
    expression: $ => 'todo',

    primary: $ => choice(
      $.INTEGER,
      $.FLOAT,
      $.CHAR,
      $.STRING,
      $.BOOL,
      $.IDENT,
      $.control_flow_expr,
      $.comptime_expr,
      $.array_literal,
      seq('(', $.expression, ')')
    ),

    control_flow_expr: $ => "todo",
    comptime_expr: $ => "todo",
    array_literal: $ => "todo",

    // lexical tokens //
    IDENT: $ => /[A-Za-z_][A-Za-z0-9_]*/,
    line_comment: $ => token(seq('//', /.*/)),
    pub: $ => 'pub',
    INTEGER: $ => token(choice(
      seq('0x', /[0-9a-fA-F_]+/),
      seq('0o', /[0-7_]+/),
      seq('0b', /[01_]+/),
      /[0-9_]+/
    )),
    FLOAT: $ => token(seq(
      /[0-9_]+/,
      '.',
      /[0-9_]+/
    )),
    CHAR: $ => token(seq(
      "'",
      choice(
        /[^'\\\n]/,
        seq('\\', choice('\\', '"', 'n', 't', 'r', '0'))
      ),
      "'"
    )),

    STRING: $ => token(seq(
      '"',
      repeat(choice(
        /[^"\\\n]/,
        seq('\\', choice('\\', '"', 'n', 't', 'r', '0'))
      )),
      '"'
    )),

    BOOL: $ => choice('true', 'false'),

    line_comment: $ => token(seq('//', /.*/)),

    pub: $ => 'pub',
  }
});

function commaSep1($, rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
