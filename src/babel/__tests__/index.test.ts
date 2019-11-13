import path from 'path';
import { transformFileSync } from '@babel/core';
import dce from 'babel-plugin-remove-unused-vars';
import plugin from '../';

expect.addSnapshotSerializer({
  test: value => value && typeof value.cssZero === 'object',
  print: ({ cssZero: { rules } }) =>
    Object.entries(rules)
      .map(([key, value]: any) => `${key} {${value.cssText}}`)
      .join('\n'),
});

const transpile = (file: string) =>
  transformFileSync(path.resolve(__dirname, file), {
    plugins: [plugin, dce],
  });

it.each([['simple.jsx'], ['combining.jsx'], ['merging.jsx']])('%s', file => {
  const { code, metadata } = transpile(`./fixtures/${file}`)!;
  expect(code).toMatchSnapshot();
  expect(metadata).toMatchSnapshot();
});
