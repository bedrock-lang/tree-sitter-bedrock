module.exports = grammar({
  name: 'bedrock',

  extras: $ => [
    /\s/,
    $.line_comment,
  ],

  externals: $ => [],

  word: $ => $.IDENT,

  rules: {
    // program//
    program: $ => repeat($.item),

    item: $ => choice(
      $.import_def,
      $.function,
      // $.proc_def,
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
      // $.array_type,
      // $.named_type,
      // $.func_type,
      // $.proc_type
    ),

    // lexical tokens //
    IDENT: $ => /[A-Za-z_][A-Za-z0-9_]*/,
    line_comment: $ => token(seq('//', /.*/)),
    pub: $ => 'pub',
  }
});

function commaSep1($, rule) {
  return seq(rule, repeat(seq(',', rule)), optional(','));
}
