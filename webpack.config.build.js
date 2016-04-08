const prodConfig = require('./webpack.config.prod');

const config = Object.create(prodConfig);

config.loaders = [
  { test: require.resolve('react'), loader: "expose?React" },
  { test: require.resolve('react-dom'), loader: "expose?ReactDOM" }
];

module.exports = config;
