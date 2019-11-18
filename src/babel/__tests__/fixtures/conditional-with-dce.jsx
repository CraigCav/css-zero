import {css, styles} from 'css-zero';

const blue = css`
  color: blue;
`;

const base = css`
  color: red;
  font-size: 16px;
`;

export const LogicalAndExpression = props => <div className={styles(base, props.isBlue && blue)} />;
