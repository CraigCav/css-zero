import jsx from '@babel/plugin-syntax-jsx';
import TaggedTemplateExpression from './visitors/TaggedTemplateExpression';
import isStyles from './utils/isStyles';
import StyleCache from './StyleCache';

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
        if (!isStyles(path)) return;

        const cache = new StyleCache();
        const args = path.get('arguments');

        args.forEach((arg, i) => {
          const result = arg.evaluate();
          const { confident, value } = result;

          if (confident && value) {
            Object.entries(value).forEach(([key, value]) =>
              cache.addStyle(key, value)
            );
            return;
          }

          switch (arg.type) {
            case 'LogicalExpression':
              if (arg.node.operator !== '&&')
                throw arg.buildCodeFrameError(
                  `Styles argument does not support the ${arg.node.operator} operator with dynamic values.`
                );

              const left = path.get(`arguments.${i}.left`);
              const right = path.get(`arguments.${i}.right`);

              const valueRight = right.evaluate();

              if (!valueRight.confident)
                throw arg.buildCodeFrameError(
                  `Styles argument only accepts boolean expressions in the form "{condition} && {css}".`
                );

              Object.entries(valueRight.value).forEach(([key, value]) =>
                cache.addConditionalStyle(key, value, left.node)
              );
              return;
            case 'BooleanLiteral':
            case 'NullLiteral': {
              return;
            }
            case 'ConditionalExpression':
            default:
              return;
          }
        });

        state.usage.push(...cache.getUsedClassNames());

        const expressions = cache.getConditionalStyles();
        const literals = cache.getStyles().join(' ');

        if (!expressions.length && !literals) {
          path.replaceWith(types.stringLiteral(''));
          return;
        }

        if (!expressions.length) {
          path.replaceWith(types.stringLiteral(literals));
          return;
        }

        const concat = (left, right) =>
          types.binaryExpression('+', left, right);

        path.replaceWith(
          expressions.reduce(
            (current: any, { test, consequent, alternate }) => {
              const node = types.conditionalExpression(
                test,
                types.stringLiteral(consequent),
                types.stringLiteral(alternate)
              );
              return current.type === 'NullLiteral'
                ? node
                : concat(concat(node, types.stringLiteral(' ')), current);
            },
            !literals ? types.nullLiteral() : types.stringLiteral(literals)
          )
        );
      },
    },
  };
}
