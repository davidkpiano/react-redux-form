'use strict';

module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'redux-simple-form',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  }
};