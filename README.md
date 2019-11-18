# CSS-Zero

## Features

- Write CSS-in-JS, with all of the benefits, but with **zero runtime code**
- Write your styles with familiar CSS Syntax, but benefit from optimized, generated atomic CSS with no duplicated style rules
- Style resolution based on order of application, rather than the cascade
- Server-side rendering support with no additional configuration
- Easy composition of styles, with property name collisions eliminated via static analysis
- Theme support via CSS variables, allowing the cost of theming to be proportional to the size of the color palette
- Fast parsing of styles, with no extra parsing needed for CSS.

These benefits are in addition to the more general benefits of using CSS-in-JS:

- Scoped selectors to avoid accidental collision of styles
- Styles co-located with your component reduces context switching
- Refactor with confidence when changing/removing styles
- Detect unused styles with EsLint, just like normal JS variables
- Declarative dynamic styling with React

## Installation

Since CSS-Zero has no runtime, it can be installed purely as a devDependency:

```
npm install css-zero --save-dev
```

## Setup

The simplest way to run CSS-Zero in a React application is using our Babel Macro:

```jsx
import {css, styled} from 'css-zero/macro';
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
```

## Demo

[![Edit CSS-Zero Demo](https://codesandbox.io/static/img/play-codesandbox.svg)](https://github.com/craigcav/css-zero/tree/master/example)

## Inspiration

- [emotion](https://emotion.sh/)
- [linaria](https://github.com/callstack/linaria)
- [style-sheet](https://github.com/giuseppeg/style-sheet)
- [Facebook stylex](https://www.youtube.com/watch?v=9JZHodNR184&list=PLPxbbTqCLbGHPxZpw4xj_Wwg8-fdNxJRh&index=3)
- [object-style](https://github.com/jxnblk/object-style)
