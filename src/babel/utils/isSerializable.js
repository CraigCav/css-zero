function isSerializable(o) {
  return (
    (Array.isArray(o) && o.every(isSerializable)) ||
    (typeof o === 'object' && o != null && o.constructor.name === 'Object')
  );
}

module.exports = isSerializable;
