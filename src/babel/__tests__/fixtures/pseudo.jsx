import {css, styles} from 'css-zero';

const one = css`
  color: red;

  &:hover {
    color: green;
  }
`;

export const Component = () => <div className={styles(one)} />;
