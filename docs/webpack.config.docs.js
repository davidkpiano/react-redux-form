'use strict';

var path = require('path');

var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  plugins: [
    new ExtractTextPlugin('main.css'),
  ],
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        loader: ExtractTextPlugin.extract(
          'css!' +
          'postcss!' +
          'sass?sourceMap'
        )
      },
    ]
  },
  output: {
    library: 'redux-simple-form',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js'],
    alias: {
      'redux-simple-form': path.resolve(__dirname, '../src/index')
    }
  },
  // devtool: 'inline-source-map'
};
