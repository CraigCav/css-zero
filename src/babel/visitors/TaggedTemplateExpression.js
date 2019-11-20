const atomizer = require('../utils/atomizer');
const hasImport = require('../utils/hasImport');
const evaluate = require('../utils/evaluate');

function TaggedTemplateExpression(path, state, types) {
  const {quasi, tag} = path.node;

  let css;

  if (
    hasImport(types, path.scope, state.file.opts.filename, 'css', 'css-zero') ||
    hasImport(types, path.scope, state.file.opts.filename, 'css', 'css-zero/macro') ||
    hasImport(types, path.scope, state.file.opts.filename, 'css', '../../../macro')
  ) {
    css = types.isIdentifier(tag) && tag.name === 'css';
  }

  if (!css) {
    return;
  }

  const parent = path.findParent(
    p => types.isObjectProperty(p) || types.isJSXOpeningElement(p) || types.isVariableDeclarator(p)
  );

  // Check if the variable is referenced anywhere for basic dead code elimination
  // Only works when it's assigned to a variable
  if (parent && types.isVariableDeclarator(parent)) {
    const {referencePaths} = path.scope.getBinding(parent.node.id.name);

    if (referencePaths.length === 0) {
      path.remove();
      return;
    }
  }

  // Serialize the tagged template literal to a string
  let cssText = '';

  const expressions = path.get('quasi').get('expressions');

  quasi.quasis.forEach((el, i) => {
    cssText += el.value.cooked;

    const ex = expressions[i];

    if (!ex) return;

    const result = ex.evaluate();

    if (result.confident) {
      throwIfInvalid(result.value, ex);

      cssText += result.value;
    } else {
      // The value may be an imported variable, so try to preval the value
      if (types.isFunctionExpression(ex) || types.isArrowFunctionExpression(ex)) return;

      let evaluation;

      try {
        evaluation = evaluate(ex, types, state.file.opts.filename);
      } catch (e) {
        throw ex.buildCodeFrameError(
          `An error occurred when evaluating the expression: ${e.message}. Make sure you are not using a browser or Node specific API.`
        );
      }

      const {value} = evaluation;

      throwIfInvalid(value, ex);

      cssText += value;
    }
  });

  const rules = atomizer(cssText);

  rules.forEach(([className, {selector, cssText, media}]) => {
    state.styleSheet.addRule({
      className,
      selector,
      cssText,
      media,
    });
  });

  // replace initial template expression with
  path.replaceWith(
    types.objectExpression(
      rules.map(([className, {key}]) =>
        types.objectProperty(types.stringLiteral(key), types.stringLiteral(className))
      )
    )
  );
}

function throwIfInvalid(value, ex) {
  if (typeof value === 'string' || (typeof value === 'number' && Number.isFinite(value))) {
    return;
  }

  const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);

  throw ex.buildCodeFrameError(
    `The expression evaluated to '${stringified}', which is probably a mistake. If you want it to be inserted into CSS, explicitly cast or transform the value to a string, e.g. - 'String(${
      generator(ex.node).code
    })'.`
  );
}

module.exports = TaggedTemplateExpression;
