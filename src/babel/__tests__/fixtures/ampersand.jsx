import {css, styles} from 'css-zero';

const nested = css`
  &:hover {
    color: green;
  }

  /* implicit pseudo element  */
  :hover > span {
    color: yellow;
  }

  span & {
    color: orange;
  }

  @media screen and (min-width: 678px) {
    & {
      display: none;
    }

    &:hover {
      color: gold;
    }

    :hover > span {
      color: wheat;
    }

    span & {
      color: brown;
    }
  }
`;

export const Component = () => <div className={styles(nested)} />;
