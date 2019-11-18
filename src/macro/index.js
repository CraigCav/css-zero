const {readFileSync, writeFileSync} = require('fs');
const {dirname, basename, relative} = require('path');
const mkdirp = require('mkdirp');
const TaggedTemplateExpression = require('../babel/visitors/TaggedTemplateExpression');
const CallExpression = require('../babel/visitors/CallExpression');
const {createMacro} = require('babel-plugin-macros');
const {addSideEffect} = require('@babel/helper-module-imports');

const checkType = (path, type) => {
  if (path.parentPath.type !== type)
    throw new Error(
      `css-zero/macro/${path.node.name} can only be used as ${type}. You tried ${path.parentPath.type}.`
    );
};

exports.createCssZeroMacro = () =>
  createMacro(({references, state, babel}) => {
    const {types} = babel;

    const cssRefs = references.css || [];
    const stylesRefs = references.styles || [];

    const rules = [];
    const usage = [];

    Object.assign(state, {rules, usage});

    cssRefs.forEach(ref => {
      checkType(ref, 'TaggedTemplateExpression');
      TaggedTemplateExpression(ref.parentPath, state, types);
    });

    stylesRefs.forEach(ref => {
      checkType(ref, 'CallExpression');
      CallExpression(ref.parentPath, state, types);
    });

    // remove variable declarations of css``;
    cssRefs.forEach(ref => {
      ref.parentPath.parentPath.remove();
    });

    // if no styles have been used, there's no more work to do
    if (!Object.keys(usage).length) return;

    const filename = state.file.opts.filename;

    // choose a file to save the styles
    const outputFilename = relative(process.cwd(), filename.replace(/\.[^.]+$/, '.zero.css'));

    // include this file as an import to the referenced module, so that css-loader can pick it up at bundle-time
    addSideEffect(stylesRefs[0], './' + basename(outputFilename));

    // combine all the used styles
    const cssText = rules
      .filter(({className}) => usage.includes(className))
      .map(({selector, cssText}) => `${selector} {${cssText}}`)
      .join('');

    // Read the file first to compare the content
    // Write the new content only if it's changed
    // This will prevent unnecessary reloads
    let currentCssText;

    try {
      currentCssText = readFileSync(outputFilename, 'utf-8');
    } catch (e) {
      // Ignore error
    }

    // if the files hasn't changed, nothing more to do
    if (currentCssText === cssText) return;

    mkdirp.sync(dirname(outputFilename));
    writeFileSync(outputFilename, cssText);
  });
