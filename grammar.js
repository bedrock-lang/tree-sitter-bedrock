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
      // $.function,
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

    // lexical tokens //
    IDENT: $ => /[A-Za-z_][A-Za-z0-9_]*/,
    line_comment: $ => token(seq('//', /.*/)),
  }
});
