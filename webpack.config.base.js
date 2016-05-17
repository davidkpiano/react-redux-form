/* eslint strict:0 */
'use strict';

module.exports = {
  externals: {
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react',
    },
    redux: {
      root: 'Redux',
      commonjs2: 'redux',
      commonjs: 'redux',
      amd: 'redux',
    },
    'react-addons-shallow-compare': {
      root: 'react-addons-shallow-compare',
      commonjs2: 'react-addons-shallow-compare',
      commonjs: 'react-addons-shallow-compare',
      amd: 'react-addons-shallow-compare',
    },
    'react-redux': {
      root: 'ReactRedux',
      commonjs2: 'react-redux',
      commonjs: 'react-redux',
      amd: 'react-redux',
    },
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  output: {
    library: 'react-redux-form',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['', '.js'],
  },
  plugins: [],
  // devtool: 'inline-source-map'
};
