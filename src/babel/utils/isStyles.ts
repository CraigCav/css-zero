const isStyles = ({ node }) => {
  return node.callee.type === 'Identifier' && node.callee.name === 'styles';
};

export default isStyles;
