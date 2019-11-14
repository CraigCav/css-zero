import jsx from '@babel/plugin-syntax-jsx';
import TaggedTemplateExpression from './visitors/TaggedTemplateExpression';
import isStyles from './utils/isStyles';

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

        const args = path.get('arguments');

        let usage = {};

        let styles: any = {};
        let conditionalStyles: any = {};

        args.forEach((arg, i) => {
          const result = arg.evaluate();
          const { confident, value } = result;

          if (confident && value) {
            Object.assign(usage, value);
            Object.assign(styles, value);
            Object.entries(value).forEach(([key]) => {
              const { [key]: _ignore, ...updated } = conditionalStyles;
              conditionalStyles = updated;
            });
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

              Object.entries(valueRight.value).forEach(([key, value]) => {
                const current =
                  key in styles
                    ? types.stringLiteral(styles[key])
                    : key in conditionalStyles
                    ? conditionalStyles[key]
                    : types.nullLiteral();

                const { [key]: _ignore, ...updated } = styles;
                styles = updated;

                conditionalStyles[key] = types.conditionalExpression(
                  left.node,
                  types.stringLiteral(value),
                  current || types.nullLiteral()
                );
              });

              Object.assign(usage, valueRight.value);
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

        state.usage.push(...Object.values(usage));

        const expressions = Object.values(conditionalStyles);
        const literals = Object.values(styles).join(' ');

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
            (current: any, node) => {
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
