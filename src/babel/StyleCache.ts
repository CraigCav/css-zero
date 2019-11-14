export default class StyleCache {
  private styles = new Map<string, string>();
  private conditionalStyles = new Map<string, any>();
  private appliedClassNames = new Map<string, string>();

  private types: any;

  constructor(types: any) {
    this.types = types;
  }

  addStyle(key, value) {
    this.styles.set(key, value);
    this.appliedClassNames.set(key, value);
    this.conditionalStyles.delete(key);
  }

  addConditionalStyle(key, value, test) {
    const current = this.styles.has(key)
      ? this.types.stringLiteral(this.styles.get(key))
      : this.conditionalStyles.has(key)
      ? this.conditionalStyles.get(key)
      : this.types.nullLiteral();

    this.styles.delete(key);

    this.conditionalStyles.set(
      key,
      this.types.conditionalExpression(
        test,
        this.types.stringLiteral(value),
        current || this.types.nullLiteral()
      )
    );

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
}
