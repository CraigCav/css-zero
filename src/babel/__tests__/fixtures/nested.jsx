import {css, styles} from 'css-zero';

const nested = css`
  h1 {
    font-size: 32px;
  }

  section {
    font-size: 16px;

    h1 {
      font-size: 28px;
    }
  }

  @media screen and (min-width: 678px) {
    section {
      font-size: 18px;

      h1 {
        font-size: 42px;
      }
    }
  }
`;

export const Component = () => <div className={styles(nested)} />;
