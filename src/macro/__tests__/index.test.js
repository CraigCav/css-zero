import pluginTester from 'babel-plugin-tester';
import plugin from 'babel-plugin-macros';

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: { filename: __filename, parserOpts: { plugins: ['jsx'] } },
  tests: [
    {
      title: 'simple macro',
      code: `
        import { css, styles } from '../../../macro';

        const blue = css\`
          color: blue;
        \`;
        
        const base = css\`
          color: red;
          font-size: 16px;
        \`;
        
        export default props => (
          <div className={styles(base, props.isBlue && blue)} />
        );
      `,
    },
  ],
});
