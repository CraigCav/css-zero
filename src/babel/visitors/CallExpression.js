const StyleCache = require('../StyleCache');
const isStyles = require('../utils/isStyles');

function CallExpression(path, state, types) {
  if (!isStyles(path)) return;

  const cache = new StyleCache();
  const args = path.get('arguments');

  args.forEach((arg, i) => {
    const result = arg.evaluate();
    const {confident, value} = result;

    if (confident && value) {
      Object.entries(value).forEach(([key, value]) => cache.addStyle(key, value));
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

  state.styleSheet.trackUsage(...cache.getUsedClassNames());

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

  const concat = (left, right) => types.binaryExpression('+', left, right);

  path.replaceWith(
    expressions.reduce(
      (current, {test, consequent, alternate}) => {
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
}

module.exports = CallExpression;
