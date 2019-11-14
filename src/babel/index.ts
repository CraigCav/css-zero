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

        let merged = {};
        let usage = {};

        args.forEach((arg, i) => {
          const result = arg.evaluate();
          const { confident, value } = result;

          if (confident && value) {
            Object.assign(usage, value);
            Object.entries(value).forEach(([key, value]) => {
              merged[key] = types.templateElement(
                { raw: value, cooked: value },
                false
              );
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
                  merged[key] && types.templateLiteral([merged[key]], []);
                merged[key] = types.conditionalExpression(
                  left.node,
                  types.templateLiteral(
                    [
                      types.templateElement(
                        { raw: value, cooked: value },
                        false
                      ),
                    ],
                    []
                  ),
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

        // replace `styles(one, two)` with the corresponding className expressions
        const nodes: any[] = Object.values(merged);

        const templateLiteralArgs = nodes.reduce(
          ([quasis, expressions], node) => {
            if (node.type === 'ConditionalExpression') {
              expressions.push(node);
              // number of quasis must always be one more than expressions
              quasis.push(types.templateElement({ raw: '', cooked: '' }, true));
            } else {
              // append the current classname into the prior quasi
              const last = quasis.pop();
              const value =
                !expressions.length && last.value.raw === ''
                  ? node.value.raw
                  : [last.value.raw, node.value.raw].join(' ');

              quasis.push(
                types.templateElement({ raw: value, cooked: value }, true)
              );
            }

            return [quasis, expressions];
          },
          [[types.templateElement({ raw: '', cooked: '' }, false)], []]
        );

        path.replaceWith(types.templateLiteral(...templateLiteralArgs));
      },
    },
  };
}
