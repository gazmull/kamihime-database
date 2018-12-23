const RULES = {
  'array-bracket-spacing': [ true, 'always' ],
  'arrow-parens': [ true, 'ban-single-arg-parens' ],
  'class-name': true,
  'comment-format': [ true, 'check-space' ],
  curly: [ true, 'as-needed' ],
  eofline: true,
  indent: [ true, 'spaces', 2 ],
  'member-ordering': [ true, {
    order: [ 'constructor', 'instance-field', 'instance-method', 'static-field', 'static-method' ]
  } ],
  'newline-before-return': true,
  'no-angle-bracket-type-assertion': false,
  'no-duplicate-variable': true,
  'no-eval': true,
  'no-trailing-whitespace': true,
  'no-unsafe-finally': true,
  'no-var-keyword': true,
  'object-curly-spacing': [ true, 'always' ],
  'object-literal-key-quotes': [ true, 'as-needed' ],
  'object-literal-shorthand': true,
  'object-literal-sort-keys': [ true, 'ignore-case', 'shorthand-first' ],
  'one-line': [ true, 'check-open-brace', 'check-whitespace' ],
  quotemark: [ true, 'single' ],
  radix: false,
  semicolon: [ true, 'always' ],
  'space-before-function-paren': [ true, 'always' ],
  'ter-arrow-spacing': [ true ],
  'ter-func-call-spacing': [ false ],
  'trailing-comma': [ true, { multiline: 'always', singleline: 'never' } ],
  'triple-equals': [ true, 'allow-null-check' ],
  'variable-name': [
    true,
    'check-format',
    'allow-pascal-case',
    'allow-leading-underscore',
    'allow-trailing-underscore'
  ],
  whitespace: [ true, 'check-branch', 'check-decl', 'check-operator', 'check-separator', 'check-type' ]
};

module.exports = {
  extends: [
    'tslint:recommended',
    'tslint-eslint-rules'
  ],
  jsRules: RULES,
  rules: {
    ...RULES,
    'no-internal-module': true,
    'typedef-whitespace': [ true, {
      'call-signature': 'nospace',
      'index-signature': 'nospace',
      parameter: 'nospace',
      'property-declaration': 'nospace',
      'variable-declaration': 'nospace'
    } ],
  }
};
