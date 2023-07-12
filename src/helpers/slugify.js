/**
 * @param {string} key
 * @returns {string}
 */
exports.slugify = (key) => key.toLowerCase().split(' ').join('-');
