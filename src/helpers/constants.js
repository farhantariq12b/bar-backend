exports.contactType = {
  contactUs: 'contact-us',
  customQuote: 'custom-quote'
};

exports.DEFAULT_SALT = 10;

exports.TOKEN_KEY = process.env.AUTH_TOKEN_KEY;
exports.TOKEN_EXPIRY = process.env.TOKEN_EXPIRY ?? '1d';