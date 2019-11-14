import { css, styles } from 'css-zero';

const blue = css`
  color: blue;
`;

const green = css`
  color: green;
`;

const base = css`
  color: red;
  font-size: 16px;
`;

export const LogicalAndExpression = props => (
  <div className={styles(base, props.isBlue && blue)} />
);

export const LogicalExpressionDeterministic = () => (
  <div className={styles(blue || green)} />
);

export const IgnoreFalsey = () => (
  <div className={styles(false, null, undefined)} />
);

export const SimpleTernaryExpression = props => (
  <div className={styles(base, props.isBlue ? blue : green)} />
);
