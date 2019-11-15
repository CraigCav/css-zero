import jsx from '@babel/plugin-syntax-jsx';
import TaggedTemplateExpression from './visitors/TaggedTemplateExpression';
import CallExpression from './visitors/CallExpression';

export default function cssZeroBabelPlugin(babel) {
  const { types } = babel;
  return {
    name: 'css-zero',
    inherits: jsx,
    visitor: {
      Program: {
        enter(path: any, state: any) {
          state.rules = {};
          state.dependencies = [];
          state.replacements = [];
          state.usage = [];
          // We need our transforms to run before anything else
          // So we traverse here instead of a in a visitor
          path.traverse({
            TaggedTemplateExpression: p =>
              TaggedTemplateExpression(p, state, types),
          });
        },
        exit(_path: any, state: any) {
          const { rules: allRules, usage } = state;

          // now clean up and rules that are unused due to merging
          const rules = Object.keys(allRules)
            .filter(key => !usage.includes(key.slice(1)))
            .reduce((prev, next) => {
              const { [next]: _ignore, ...res } = prev;
              return res;
            }, allRules);

          if (Object.keys(rules).length) {
            // Store the result as the file metadata
            state.file.metadata = {
              cssZero: {
                rules: rules,
                replacements: state.replacements,
                dependencies: state.dependencies,
              },
            };
          }
        },
      },
      CallExpression(path: any, state: any) {
        CallExpression(path, state, types);
      },
    },
  };
}
