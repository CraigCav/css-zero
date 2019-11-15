const isSerializable = require('./isSerializable');
const units = require('../units');

const hyphenate = s =>
  s
    // Hyphenate CSS property names from camelCase version from JS string
    .replace(/([A-Z])/g, (_match, p1) => `-${p1.toLowerCase()}`)
    // Special case for `-ms` because in JS it starts with `ms` unlike `Webkit`
    .replace(/^ms-/, '-ms-');

// Some tools such as polished.js output JS objects
// To support them transparently, we convert JS objects to CSS strings
function toCSS(o) {
  if (Array.isArray(o)) {
    return o.map(toCSS).join('\n');
  }

  return Object.entries(o)
    .filter(
      ([, value]) =>
        // Ignore all falsy values except numbers
        typeof value === 'number' || value
    )
    .map(([key, value]) => {
      if (isSerializable(value)) {
        return `${key} { ${toCSS(value)} }`;
      }

      return `${hyphenate(key)}: ${
        typeof value === 'number' &&
        value !== 0 &&
        !units.unitless[
          // Strip vendor prefixes when checking if the value is unitless
          key.replace(
            /^(Webkit|Moz|O|ms)([A-Z])(.+)$/,
            (_match, _p1, p2, p3) => `${p2.toLowerCase()}${p3}`
          )
        ]
          ? `${value}px`
          : value
      };`;
    })
    .join(' ');
}

module.exports = toCSS;
