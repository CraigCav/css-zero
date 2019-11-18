import {css, styles} from 'css-zero';

const simple = css`
  color: red;

  &:hover {
    color: green;
  }
`;

const duplicate = css`
  color: black;

  &:hover {
    color: yellow;
  }

  &:hover {
    color: yellow;
  }
`;

const overridden = css`
  color: brown;

  &:hover {
    color: pink;
  }

  &:hover {
    color: salmon;
  }
`;

export const Component = () => <div className={styles(simple)} />;

export const ComponentWithDuplicatePseudoStyle = () => <div className={styles(duplicate)} />;

export const ComponentWithOverriddenPseudoStyle = () => <div className={styles(overridden)} />;
