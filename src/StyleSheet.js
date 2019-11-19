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
    // filter unused rules
    const filtered = this.rules.filter(({className}) => this.usage.includes(className));

    // group rules by media query
    const grouped = filtered.reduce((map, {selector, media, cssText}) => {
      // using a set to deduplicate rules within a given media query scope
      if (!map.has(media)) map.set(media, new Set());
      map.get(media).add(`${selector} {${cssText}}`);
      return map;
    }, new Map());

    // turn the rule objects into valid css rules
    return Array.from(grouped.entries())
      .map(([media, rules]) => {
        const cssText = [...rules.values()].join('\n');
        return media ? media + '{\n' + cssText + '\n}' : cssText;
      })
      .join('\n');
  }
};
