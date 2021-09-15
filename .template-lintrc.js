'use strict';

module.exports = {
  plugins: ['ember-template-lint-typed-templates'],
  extends: [
    'octane', // this comes from ember-template-lint
    'ember-template-lint-typed-templates:recommended'
  ],
  rules: {
    'no-bare-strings': false,
  },
};
