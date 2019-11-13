import { css, styles } from 'css-zero';

const one = css`
  color: red;
`;

const another = css`
  color: green;
`;

export const Component = () => <div className={styles(one, another)} />;
