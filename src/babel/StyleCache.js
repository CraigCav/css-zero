module.exports = class StyleCache {
  constructor() {
    this.styles = new Map();
    this.conditionalStyles = new Map();
    this.conditionallyAppliedClassNames = [];
  }
  addStyle(key, value) {
    this.styles.set(key, value);
    this.conditionalStyles.delete(key);
  }
  addConditionalStyle(key, value, test) {
    const current = this.styles.has(key)
      ? this.styles.get(key)
      : this.conditionalStyles.has(key)
      ? this.conditionalStyles.get(key)
      : '';
    this.styles.delete(key);
    this.conditionalStyles.set(key, {
      test,
      consequent: value,
      alternate: current,
    });
    this.conditionallyAppliedClassNames.push(value);
    if (typeof current === 'string') this.conditionallyAppliedClassNames.push(current);
  }
  getStyles() {
    return Array.from(this.styles.values());
  }
  getConditionalStyles() {
    return Array.from(this.conditionalStyles.values());
  }
  getUsedClassNames() {
    return [...this.styles.values(), ...this.conditionallyAppliedClassNames];
  }
};
