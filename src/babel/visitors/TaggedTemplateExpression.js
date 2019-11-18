const css_to_object = require('css-to-object');
const atomizer = require('../utils/atomizer');
const hasImport = require('../utils/hasImport');
const throwIfInvalid = require('../utils/throwIfInvalid');
const isSerializable = require('../utils/isSerializable');
const stripLines = require('../utils/stripLines');
const toCSS = require('../utils/toCSS');

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
  // TODO: figure out if this is a better way to do this: https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md#check-if-an-identifier-is-referenced
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

  quasi.quasis.forEach(el => {
    // TODO: interpolation of static values
    cssText += el.value.cooked;
  });

  const rules = atomizer(css_to_object(cssText));

  rules.forEach(([className, {cssText}]) => {
    const selector = `.${className}`;
    state.rules[selector] = {
      cssText,
      className,
      start: path.parent && path.parent.loc ? path.parent.loc.start : null,
    };
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

module.exports = TaggedTemplateExpression;
