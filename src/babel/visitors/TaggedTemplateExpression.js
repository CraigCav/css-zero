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

  if (hasImport(types, path.scope, state.file.opts.filename, 'css', 'css-zero')) {
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

  quasi.quasis.forEach((el, i, self) => {
    let appended = false;
    if (!appended) {
      cssText += el.value.cooked;
    }
    const ex = expressions[i];
    if (ex) {
      const {end} = ex.node.loc;
      const result = ex.evaluate();
      const beforeLength = cssText.length;

      // The location will be end of the current string to start of next string
      const next = self[i + 1];
      const loc = {
        // +1 because the expressions location always shows 1 column before
        start: {line: el.loc.end.line, column: el.loc.end.column + 1},
        end: next
          ? {line: next.loc.start.line, column: next.loc.start.column}
          : {line: end.line, column: end.column + 1},
      };

      if (result.confident) {
        throwIfInvalid(result.value, ex);

        if (isSerializable(result.value)) {
          // If it's a plain object, convert it to a CSS string
          cssText += stripLines(loc, toCSS(result.value));
        } else {
          cssText += stripLines(loc, result.value);
        }

        state.replacements.push({
          original: loc,
          length: cssText.length - beforeLength,
        });
      } else {
        // CSS custom properties can't be used outside components
        throw ex.buildCodeFrameError(
          `The CSS cannot contain JavaScript expressions when using the 'css' tag. To evaluate the expressions at build time, pass 'evaluate: true' to the babel plugin.`
        );
      }
    }
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
