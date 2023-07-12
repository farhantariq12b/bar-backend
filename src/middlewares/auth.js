const jwt = require('jsonwebtoken');
const { TOKEN_KEY } = require('../helpers/constants');
const User = require('../../models/user');


/* global
errorResponse:readonly
newHttpError:readonly
logger:readonly
*/

const verifyToken = async (req, res, next) => {
  const token = req.headers['x-auth-token'];

  if (!token) {
    return res
      .status(403)
      .send(errorResponse('Unauthorized, token not provided', 403));
  }
  try {
    const user = jwt.verify(token, TOKEN_KEY);
    const dbUser = await User.findOne({ email: user.email, isActive: true });
    if (!dbUser) {
      throw newHttpError(401, 'Your account has been deactivated');
    }
    req.user = user;
  } catch (err) {
    logger.error(err);
    return res.status(401).send(errorResponse(err?.message ?? 'Unauthorized', 401));
  }
  return next();
};

module.exports = verifyToken;
