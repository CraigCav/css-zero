# CSS-Zero

## Features

- All of the benefits of writing CSS-in-JS, but with **zero runtime code**
- Write your styles with familiar CSS Syntax
- Generates optimized, atomic CSS with no duplicated style rules
- Style resolution based on order of application, rather than the cascade
- Zero config server-side rendering for applications that support CSS Modules
- Easy composition of styles, with property name collisions eliminated via static analysis
- Theme support via CSS variables, allowing the cost of theming to be proportional to the size of the color palette
- Fast parsing of styles, with CSS downloaded and parsed separately from JS.
- Works without JavaScript, as styles are extracted at build-time.

These benefits are in addition to the more general benefits of using CSS-in-JS:

- Scoped selectors to avoid accidental collision of styles
- Styles co-located with your component reduces context switching
- Refactor with confidence when changing/removing styles
- Detect unused styles with EsLint, just like normal JS variables
- Declarative dynamic styling with React

## Installation

Since CSS-Zero has no runtime, it can be installed purely as a devDependency:

```
npm install --save-dev css-zero 
```
or

```
yarn add --dev css-zero
```
## Setup

The simplest way to run CSS-Zero in a React application is using our Babel Macro:

```jsx
import {css, styles} from 'css-zero/macro';
```

For applications created using Create React App (which supports both Babel Macros and CSS Modules out-of-the-box), no further setup or configuration is needed.

For usage with other front-end frameworks, CSS-Zero can be set up with our babel-plugin.

## Syntax

The basic usage of CSS-Zero looks like this:

```jsx
import {css, styles} from 'css-zero';

// Write your styles using the `css` tag
const blue = css`
  color: blue;
`;

const base = css`
  color: red;
  font-size: 16px;
`;

// then use the `styles` helper to compose your styles and generate class names
export default props => <div className={styles(base, props.isBlue && blue)} />;

      ↓ ↓ ↓ ↓ ↓ ↓ Compiles to  ↓ ↓ ↓ ↓ ↓ ↓

export default props => <div className={(props.isBlue ? "x1vong5g" : "x1dqz7z3") + " " + "x1e4w2a9"} />

// along with a the following .zero.css file:
.x1vong5g {color:blue}
.x1dqz7z3 {color:red}
.x1e4w2a9 {font-size:16px}
```

## Demo

[![Edit CSS-Zero Create React App Example](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/hello-world-ogzzo?fontsize=14&hidenavigation=1&theme=dark)

## Inspiration

- [emotion](https://emotion.sh/)
- [linaria](https://github.com/callstack/linaria)
- [style-sheet](https://github.com/giuseppeg/style-sheet)
- [Facebook stylex](https://www.youtube.com/watch?v=9JZHodNR184&list=PLPxbbTqCLbGHPxZpw4xj_Wwg8-fdNxJRh&index=3)
- [object-style](https://github.com/jxnblk/object-style)
