const jsx = require('@babel/plugin-syntax-jsx');
const TaggedTemplateExpression = require('./visitors/TaggedTemplateExpression');
const CallExpression = require('./visitors/CallExpression');

function cssZeroBabelPlugin(babel) {
  const {types} = babel;
  return {
    name: 'css-zero',
    inherits: jsx.default,
    visitor: {
      Program: {
        enter(path, state) {
          state.rules = [];
          state.usage = [];
          // We need our transforms to run before anything else
          // So we traverse here instead of a in a visitor
          path.traverse({
            TaggedTemplateExpression: p => TaggedTemplateExpression(p, state, types),
          });
        },
        exit(_path, state) {
          const {rules: allRules, usage} = state;

          // now clean up and rules that are unused due to merging
          const rules = allRules.filter(({className}) => usage.includes(className));

          if (rules.length) {
            // Store the result as the file metadata
            state.file.metadata = {cssZero: {rules: rules}};
          }
        },
      },
      CallExpression(path, state) {
        CallExpression(path, state, types);
      },
    },
  };
}

module.exports = cssZeroBabelPlugin;
