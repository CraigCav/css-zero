// Fork of https://github.com/callstack/linaria
// which is MIT (c) callstack
const generator = require('@babel/generator').default;
const babel = require('@babel/core');
const Module = require('./module');

const isAdded = (requirements, path) => {
  if (requirements.some(req => req.path === path)) {
    return true;
  }

  if (path.parentPath) {
    return isAdded(requirements, path.parentPath);
  }

  return false;
};

const resolve = (path, t, requirements) => {
  const binding = path.scope.getBinding(path.node.name);

  if (
    path.isReferenced() &&
    binding &&
    binding.kind !== 'param' &&
    !isAdded(requirements, binding.path)
  ) {
    let result;

    switch (binding.kind) {
      case 'module':
        if (t.isImportSpecifier(binding.path)) {
          result = t.importDeclaration([binding.path.node], binding.path.parentPath.node.source);
        } else {
          result = binding.path.parentPath.node;
        }
        break;
      case 'const':
      case 'let':
      case 'var': {
        let decl;

        // Replace SequenceExpressions (expr1, expr2, expr3, ...) with the last one
        if (t.isSequenceExpression(binding.path.node.init)) {
          const {node} = binding.path;

          decl = t.variableDeclarator(
            node.id,
            node.init.expressions[node.init.expressions.length - 1]
          );
        } else {
          decl = binding.path.node;
        }

        result = t.variableDeclaration(binding.kind, [decl]);
        break;
      }
      default:
        result = binding.path.node;
        break;
    }

    const {loc} = binding.path.node;

    requirements.push({
      result,
      path: binding.path,
      start: loc.start,
      end: loc.end,
    });

    binding.path.traverse({
      Identifier(p) {
        resolve(p, t, requirements);
      },
    });
  }
};

module.exports = function evaluate(path, t, filename, transformer, options) {
  if (t.isSequenceExpression(path)) {
    // We only need to evaluate the last item in a sequence expression, e.g. (a, b, c)
    // eslint-disable-next-line no-param-reassign
    path = path.get('expressions')[path.node.expressions.length - 1];
  }

  const requirements = [];

  if (t.isIdentifier(path)) {
    resolve(path, t, requirements);
  } else {
    path.traverse({
      Identifier(p) {
        resolve(p, t, requirements);
      },
    });
  }

  const expression = t.expressionStatement(
    t.assignmentExpression(
      '=',
      t.memberExpression(t.identifier('module'), t.identifier('exports')),
      path.node
    )
  );

  // Preserve source order
  requirements.sort((a, b) => {
    if (a.start.line === b.start.line) {
      return a.start.column - b.start.column;
    }

    return a.start.line - b.start.line;
  });

  // We'll wrap each code in a block to avoid collisions in variable names
  // We separate out the imports since they cannot be inside blocks
  const {imports, others} = requirements.reduce(
    (acc, curr) => {
      if (t.isImportDeclaration(curr.path.parentPath)) {
        acc.imports.push(curr.result);
      } else {
        // Add these in reverse because we'll need to wrap in block statements in reverse
        acc.others.unshift(curr.result);
      }

      return acc;
    },
    {imports: [], others: []}
  );

  const wrapped = others.reduce(
    (acc, curr) => t.blockStatement([curr, acc]),
    t.blockStatement([expression])
  );

  const m = new Module(filename);

  m.dependencies = [];
  m.transform =
    typeof transformer !== 'undefined'
      ? transformer
      : function transform(text) {
          if (options && options.ignore && options.ignore.test(this.filename)) {
            return {code: text};
          }

          const plugins = [
            // Include these plugins to avoid extra config when using { module: false } for webpack
            '@babel/plugin-transform-modules-commonjs',
            '@babel/plugin-proposal-export-namespace-from',
          ];

          const defaults = {
            caller: {name: 'css-zero', evaluate: true},
            filename: this.filename,
            plugins: [
              ...plugins.map(name => require.resolve(name)),
              // We don't support dynamic imports when evaluating, but don't wanna syntax error
              // This will replace dynamic imports with an object that does nothing
              require.resolve('./dynamic-import-noop'),
            ],
          };

          return babel.transformSync(text, defaults);
        };

  m.evaluate(
    [
      // Use String.raw to preserve escapes such as '\n' in the code
      // Flow doesn't understand template tags: https://github.com/facebook/flow/issues/2616
      /* $FlowFixMe */
      imports.map(node => String.raw`${generator(node).code}`).join('\n'),
      /* $FlowFixMe */
      String.raw`${generator(wrapped).code}`,
    ].join('\n')
  );

  return {
    value: m.exports,
    dependencies: m.dependencies,
  };
};
