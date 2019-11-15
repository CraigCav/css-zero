function css(strings, ...exprs) {
  throw new Error(
    'Using the "css" tag in runtime is not supported. Make sure you have set up the Babel plugin correctly.'
  );
}

function styles(...classes) {
  throw new Error(
    'Using the "styles" tag in runtime is not supported. Make sure you have set up the Babel plugin correctly.'
  );
}

exports.styles = styles;
exports.css = css;
