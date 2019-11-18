const jsx = require('@babel/plugin-syntax-jsx');
const TaggedTemplateExpression = require('./visitors/TaggedTemplateExpression');
const CallExpression = require('./visitors/CallExpression');
const StyleSheet = require('../StyleSheet');

function cssZeroBabelPlugin(babel) {
  const {types} = babel;
  return {
    name: 'css-zero',
    inherits: jsx.default,
    visitor: {
      Program: {
        enter(path, state) {
          state.styleSheet = new StyleSheet();
          // We need our transforms to run before anything else
          // So we traverse here instead of a in a visitor
          path.traverse({
            TaggedTemplateExpression: p => TaggedTemplateExpression(p, state, types),
          });
        },
        exit(_path, state) {
          const {styleSheet} = state;

          // Store the result as the file metadata
          state.file.metadata = {cssZero: styleSheet};
        },
      },
      CallExpression(path, state) {
        CallExpression(path, state, types);
      },
    },
  };
}

module.exports = cssZeroBabelPlugin;
