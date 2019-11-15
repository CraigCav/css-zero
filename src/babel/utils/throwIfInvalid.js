const generator = require('@babel/generator');
const isSerializable = require('./isSerializable');

// Throw if we can't handle the interpolated value
function throwIfInvalid(value, ex) {
  if (
    typeof value === 'function' ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isFinite(value)) ||
    isSerializable(value)
  ) {
    return;
  }
  const stringified = typeof value === 'object' ? JSON.stringify(value) : String(value);
  throw ex.buildCodeFrameError(
    `The expression evaluated to '${stringified}', which is probably a mistake. If you want it to be inserted into CSS, explicitly cast or transform the value to a string, e.g. - 'String(${
      generator(ex.node).code
    })'.`
  );
}

module.exports = throwIfInvalid;
