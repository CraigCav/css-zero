import jsx from '@babel/plugin-syntax-jsx';
import TaggedTemplateExpression from './visitors/TaggedTemplateExpression';
import isStyles from './utils/isStyles';
import throwIfInvalid from './utils/throwIfInvalid';

const merge = (...args): string[] => {
  const styles = args.reduce((prev, next) => ({ ...prev, ...next }));
  return Object.values(styles);
};

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
        // const cloneNode = types.cloneNode || types.cloneDeep;

        if (!isStyles(path)) return;

        const args = path.get('arguments');

        // if all arguments are simple object properties (i.e. { color: 'red })
        // then we can use `classNames` to merge them
        if (
          args.every(arg => arg.isIdentifier() || arg.isExpressionStatement())
        ) {
          const simpleObjArgs = args.map(arg => {
            const result = arg.evaluate();

            if (!result.confident)
              throw arg.buildCodeFrameError(
                `Styles argument cannot contain JavaScript expressions.`
              );

            throwIfInvalid(result.value, arg);

            return result.value;
          });

          const classNames = merge(...simpleObjArgs);

          state.usage.push(...classNames);

          // replace `styles(one, two)` with the corresponding classNames
          path.replaceWith(types.stringLiteral(classNames.join(' ')));

          return;
        }
      },
    },
  };
}
