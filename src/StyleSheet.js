module.exports = class StyleSheet {
  constructor() {
    this.rules = [];
    this.usage = [];
  }

  addRule(rule) {
    this.rules.push(rule);
  }

  trackUsage(...classNames) {
    this.usage.push(...classNames);
  }

  toString() {
    const usedRules = this.rules
      .filter(({className}) => this.usage.includes(className))
      .map(({selector, cssText}) => `${selector} {${cssText}}`);

    const dedupe = usedRules.filter((rule, i) => i === usedRules.indexOf(rule));

    return dedupe.join('\n');
  }
};
