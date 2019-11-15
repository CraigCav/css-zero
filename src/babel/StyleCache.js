module.exports = class StyleCache {
  constructor() {
    this.styles = new Map();
    this.conditionalStyles = new Map();
    this.appliedClassNames = new Map();
  }
  addStyle(key, value) {
    this.styles.set(key, value);
    this.appliedClassNames.set(key, value);
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
    this.appliedClassNames.set(key, value);
  }
  getStyles() {
    return Array.from(this.styles.values());
  }
  getConditionalStyles() {
    return Array.from(this.conditionalStyles.values());
  }
  getUsedClassNames() {
    return Array.from(this.appliedClassNames.values());
  }
};
