const prodConfig = require('./webpack.config.prod');

const config = Object.create(prodConfig);

// config.loaders = [
//   { test: 'react', loader: "expose?React" },
//   { test: 'react-dom', loader: "expose?ReactDOM" }
// ];

module.exports = config;
