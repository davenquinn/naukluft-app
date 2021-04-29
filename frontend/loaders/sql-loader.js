
module.exports = function(content, map, meta) {
  if (this.target === 'web') {
    return `module.exports = null;`
  } else {
    return `module.exports = "${this.resourcePath}";`
  }
};
