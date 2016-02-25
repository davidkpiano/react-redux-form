/* eslint strict:0 */
'use strict';
const fs = require('fs');
const path = require('path');

const babelConfigFile = path.resolve(process.cwd(), '.babelrc');
let babelConfig;
try {
  fs.accessSync(babelConfigFile, fs.R_OK);
} catch (error) {
  throw error;
}

try {
  babelConfig = JSON.parse(fs.readFileSync(babelConfigFile));
} catch (error) {
  throw error;
}

module.exports = wallaby => ({
  files: [
    { pattern: 'src/**/*.js', load: false },
    { pattern: 'test/*-spec.js', ignore: true },
    'test/spec-setup.js',
  ],

  tests: [
    'test/*-spec.js',
  ],

  compilers: {
    '**/*.js': wallaby.compilers.babel(babelConfig),
  },

  env: {
    type: 'node',
    runner: 'node',
  },

  /**
   * This might be slow. Alternative: http://wallabyjs.com/docs/integration/node.html
   * Search for 'resetting node modules cache'
   */
  workers: { recycle: true },

  bootstrap: function bootstrap() {
    require('./test/spec-setup.js');
  },
});
