module.exports = process.env.NODE_ENV === 'test'
  ? require('./src/immutable')
  : require('./lib/immutable');
