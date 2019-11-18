import React from 'react';
import { css, styles } from 'css-zero/macro';

const blue = css`
  color: blue;
`;

const base = css`
  color: red;
  font-size: 16px;
`;

export default props => <div className={styles(base, props.isBlue && blue)}>{props.children}</div>;
