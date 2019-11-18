import React from 'react';
import {css, styles} from 'css-zero/macro';
import logoUrl from './logo.svg';

const center = css`
  text-align: center;
`;

const logo = css`
  height: 40vmin;
`;

const header = css`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const link = css`
  color: #09d3ac;
`;

function App() {
  return (
    <div className={styles(center)}>
      <header className={styles(header)}>
        <img src={logoUrl} className={styles(logo)} alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className={styles(link)}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
