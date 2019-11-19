const path = require('path');
const core = require('@babel/core');
const dce = require('babel-plugin-remove-unused-vars');
const plugin = require('../');

expect.addSnapshotSerializer({
  test: value => value && typeof value.cssZero === 'object',
  print: ({cssZero}) => cssZero.toString(),
});

const transpile = file =>
  core.transformFileSync(path.resolve(__dirname, file), {
    plugins: [plugin, dce],
    babelrc: false,
  });

it.each([
  ['simple.jsx'],
  ['combining.jsx'],
  ['merging.jsx'],
  ['conditional.jsx'],
  ['conditional-with-dce.jsx'],
  ['pseudo.jsx'],
  ['media-query.jsx'],
  ['nested.jsx'],
])('%s', file => {
  const {code, metadata} = transpile(`./fixtures/${file}`);
  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});
