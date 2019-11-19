// Fork of https://github.com/jxnblk/object-style
// which is MIT (c) jxnblk
const fnv1a = require('fnv1a');
const cssToObj = require('./cssToObj');

const AT_REG = /^@/;
const AMP = /&/g;

const id = seed => 'x' + fnv1a(seed).toString(36);
const hyphenate = s => s.replace(/[A-Z]|^ms/g, '-$&').toLowerCase();

const createRule = (propertyName, propertyValue, selector, children, media) => {
  return {
    // key is used for deduping styles.
    // Using the property name alone isn't sufficient:
    // pseudo elements and media queries can override the base style
    key: media + children + propertyName,
    selector,
    cssText: propertyName + ':' + propertyValue,
    media,
  };
};

const parse = (obj, children = '', media = '') => {
  const rules = [];

  for (const key in obj) {
    const value = obj[key];
    if (value === null || value === undefined) continue;
    switch (typeof value) {
      case 'object':
        if (AT_REG.test(key)) {
          rules.push(...parse(value, children, key));
        } else {
          const child = key.replace(AMP, '');
          rules.push(...parse(value, children + child, media));
        }
        continue;
      case 'number':
      case 'string':
        const hash = id(key + value + children.replace(/_ ?/, '') + media);
        const parentSelector = '.' + hash;
        const selector = children ? children.replace(/_/g, parentSelector) : parentSelector;
        const name = hyphenate(key);
        const rule = createRule(name, value, selector, children, media);
        rules.push([hash, rule]);
    }
  }

  return rules;
};

module.exports = css => parse(cssToObj(css));
