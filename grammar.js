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
      $.unsafe_stmt,
      $.control_flow_stmt,
      $.return_stmt,
      $.expr_stmt
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

    control_flow_stmt: $ => prec.dynamic(1, $.control_flow_expr),
    return_stmt: $ => seq($.return_expr, ';'),
    expr_stmt: $ => seq($.expression, ';'),
    unsafe_stmt: $ => seq('unsafe', optional($.block), 'end'),

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
    expression: $ => $.orelse_expr,

    orelse_expr: $ => prec.left(1, seq(
      $.or_expr,
      repeat(seq('orelse', $.or_expr))
    )),

    or_expr: $ => prec.left(2, seq(
      $.and_expr,
      repeat(seq('||', $.and_expr))
    )),

    and_expr: $ => prec.left(3, seq(
      $.comparison,
      repeat(seq('&&', $.comparison))
    )),

    comparison: $ => prec.left(4, seq(
      $.bitor_expr,
      repeat(seq(
        choice('==', '!=', '<', '>', '<=', '>='),
        $.bitor_expr
      ))
    )),

    bitor_expr: $ => prec.left(5, seq(
      $.bitxor_expr,
      repeat(seq('|', $.bitxor_expr))
    )),

    bitxor_expr: $ => prec.left(6, seq(
      $.bitand_expr,
      repeat(seq('^', $.bitand_expr))
    )),

    bitand_expr: $ => prec.left(7, seq(
      $.shift_expr,
      repeat(seq('&', $.shift_expr))
    )),

    shift_expr: $ => prec.left(8, seq(
      $.range_expr,
      repeat(seq(choice('<<', '>>'), $.range_expr))
    )),

    range_expr: $ => prec.left(9, seq(
      $.additive,
      optional(seq('..', $.additive))
    )),

    additive: $ => prec.left(10, seq(
      $.multiplicative,
      repeat(seq(choice('+', '-'), $.multiplicative))
    )),

    multiplicative: $ => prec.left(11, seq(
      $.unary,
      repeat(seq(choice('*', '/', '%'), $.unary))
    )),

    unary: $ => choice(
      prec.right(12, seq(choice('-', '!', '~', '&', '*'), $.unary)),
      $.postfix
    ),

    postfix: $ => prec.left(13, seq(
      $.primary,
      repeat($.suffix)
    )),

    suffix: $ => choice(
      seq('.', $.IDENT),
      seq('(', optional($.call_args), ')'),
      seq('[', commaSep1($, $.expression), ']'),
      '?'
    ),

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

    control_flow_expr: $ => choice(
      $.if_expr,
      $.match_expr,
      $.while_expr,
      $.for_expr
    ),
    if_expr: $ => seq(
      'if',
      $.expression,
      optional($.block),
      repeat($.elif_clause),
      optional($.else_clause),
      'end'
    ),
    elif_clause: $ => seq('elif', $.expression, optional($.block)),
    else_clause: $ => seq('else', optional($.block)),

    while_expr: $ => seq('while', $.expression, optional($.block), 'end'),

    for_expr: $ => seq('for', $.IDENT, 'in', $.expression, optional($.block), 'end'),

    return_expr: $ => seq('return', optional($.expression)),

    comptime_expr: $ => seq('comptime', optional($.block), 'end'),

    match_expr: $ => seq(
      'match',
      $.expression,
      optional($.match_arms),
      'end'
    ),
    match_arms: $ => seq(
      repeat1($.match_arm),
      optional($.else_arm)
    ),
    match_arm: $ => seq('case', $.pattern, optional($.block)),
    else_arm: $ => seq('else', optional($.block)),
    pattern: $ => choice($.INTEGER, $.BOOL, $.IDENT),

    array_literal: $ => seq('[', optional($.array_elems), ']'),
    array_elems: $ => commaSep1($, $.expression),

    call_args: $ => commaSep1($, $.call_arg),
    call_arg: $ => seq(
      optional(seq($.IDENT, '=')),
      $.expression
    ),

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
