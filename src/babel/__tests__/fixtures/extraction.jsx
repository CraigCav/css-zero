import {css, styles} from 'css-zero';
import {TEST} from './constants';

const marginTop = 10;

const staticMargin = css`
  margin-bottom: 2px;
`;

const constant = css`
  margin-top: ${marginTop}px;
`;

const constantImported = css`
  margin-bottom: ${TEST}px;
`;

export const ComponentStatic = () => <div className={styles(staticMargin)} />;
export const ComponentStaticInline = () => (
  <div
    className={styles(
      css`
        margin-bottom: 1px;
      `
    )}
  />
);

export const ComponentConstant = () => <div className={styles(constant)} />;
export const ComponentConstantImported = () => <div className={styles(constantImported)} />;
