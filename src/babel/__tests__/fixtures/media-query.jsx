import {css, styles} from 'css-zero';

const simple = css`
  color: red;

  @media screen and (min-width: 678px) {
    color: green;
  }
`;

const duplicate = css`
  color: black;

  @media screen and (min-width: 678px) {
    color: yellow;
  }

  @media screen and (min-width: 678px) {
    color: yellow;
  }
`;

const overridden = css`
  color: brown;

  @media screen and (min-width: 678px) {
    color: pink;
  }

  @media screen and (min-width: 678px) {
    color: salmon;
  }
`;

const pseudo = css`
  color: silver;

  @media screen and (min-width: 678px) {
    &:hover {
      color: gold;
    }
  }
`;

const pseudoParent = css`
  color: wheat;

  &:hover {
    @media screen and (min-width: 678px) {
      color: sandybrown;
    }
  }
`;

export const Component = () => <div className={styles(simple)} />;

export const ComponentWithDuplicateMediaStyle = () => <div className={styles(duplicate)} />;

export const ComponentWithOverriddenMediaStyle = () => <div className={styles(overridden)} />;

export const ComponentWithNestedPseudo = () => <div className={styles(pseudo)} />;

export const ComponentWithParentPseudo = () => <div className={styles(pseudoParent)} />;
