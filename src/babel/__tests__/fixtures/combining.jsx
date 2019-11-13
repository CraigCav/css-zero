import { css, styles } from 'css-zero';

const one = css`
  color: red;
`;

const another = css`
  font-size: 16px;
`;

export const Component = () => <div className={styles(one, another)} />;
