module.exports = grammar({
  name: 'bedrock',

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  externals: $ => [],

  word: $ => $.IDENT,

  conflicts: $ => [
    [$.result],
  ],

  rules: {
    // program//
    program: $ => repeat($.item),

    item: $ => choice(
      $.import_def,
      $.function,
      $.proc,
      // $.struct_def,
      // $.enum_def,
      // $.extern_def,
      // $.global_var_def,
      // $.const_def
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

    // Statements //
    statement: $ => choice(
      // $.var_stmt,
      // $.const_stmt,
      // $.local_static_var_stmt,
      // $.assign_stmt,
      // $.defer_stmt,
      // $.unsafe_stmt,
      // $.control_flow_stmt,
      // $.return_stmt,
      // $.expr_stmt
    ),

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
  }
});

function commaSep1($, rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
