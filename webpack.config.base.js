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
    'react-dom': {
      root: 'ReactDOM',
      commonjs2: 'react-dom',
      commonjs: 'react-dom',
      amd: 'react-dom',
    },
    'react-redux': {
      root: 'ReactRedux',
      commonjs2: 'react-redux',
      commonjs: 'react-redux',
      amd: 'react-redux',
    },
    redux: {
      root: 'Redux',
      commonjs2: 'redux',
      commonjs: 'redux',
      amd: 'redux',
    },
    'react-native': {
      root: 'ReactNative',
      commonjs2: 'react-native',
      commonjs: 'react-native',
      amd: 'react-native',
    },
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
    ],
  },
  output: {
    library: 'ReactReduxForm',
    libraryTarget: 'umd',
  },
  resolve: {
    extensions: ['', '.js'],
  },
  plugins: [],
  // devtool: 'inline-source-map'
};
