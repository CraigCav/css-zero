const validate = require('../validate');

test('simple obj pass validation', () => {
  expect(() =>
    validate({
      color: 'red',
    })
  ).not.toThrow();
});

test('throws when using important', () => {
  expect(() =>
    validate({
      color: 'red !important',
    })
  ).toThrowError(/important/);
});

test('nested: throws when grouping selectors', () => {
  expect(() =>
    validate({
      'a, b': {
        color: 'red',
      },
    })
  ).toThrowError(/Selectors cannot be grouped/);
});

test('nested: pseudo elements work', () => {
  expect(() =>
    validate({
      ':before': {
        color: 'red',
      },
    })
  ).not.toThrow();

  expect(() =>
    validate({
      '::after': {
        color: 'red',
      },
    })
  ).not.toThrow();
});

test('nested: throws when using an unsupported pseudo-class', () => {
  expect(() =>
    validate({
      '&:matches(.foo)': {
        color: 'red',
      },
    })
  ).toThrowError(/Detected unsupported pseudo-class/);
});

test('nested: the left part of a combinator must be a pseudo-class', () => {
  expect(() =>
    validate({
      'foo > &': {
        color: 'red',
      },
    })
  ).toThrowError(/left part of a combinator selector must be a pseudo-class/);

  expect(() =>
    validate({
      ':hover > &': {
        color: 'red',
      },
    })
  ).not.toThrow();
});

test('nested: the right part of a combinator must be &', () => {
  expect(() =>
    validate({
      ':hover > foo': {
        color: 'red',
      },
    })
  ).toThrowError(/right part of a combinator selector must be `&`/);

  expect(() =>
    validate({
      ':hover > &': {
        color: 'red',
      },
    })
  ).not.toThrow();
});

test('nested: does not allow nested selectors', () => {
  expect(() =>
    validate({
      'foo bar': {
        color: 'red',
      },
    })
  ).toThrowError(/Complex selectors are not supported/);
});

test('nested: media queries work', () => {
  expect(() =>
    validate({
      '@media (min-width: 30px)': {
        color: 'red',
      },
    })
  ).not.toThrow();
});

test('nested: throws with invalid nested inside of media queries', () => {
  expect(() =>
    validate({
      '@media (min-width: 30px)': {
        ':hover > foo': {
          color: 'red',
        },
      },
    })
  ).toThrowError(/right part of a combinator selector must be `&`/);
});
