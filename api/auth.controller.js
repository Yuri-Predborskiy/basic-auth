const jwt = require('jsonwebtoken');

// authentication middleware
function authenticateUser(req, res, next) {
    // todo: authenticate user with jwt
    // token is probably a part of request :)
    jwt.verify('token', process.env.AUTH_SECRET);
    next();
}

module.exports = {
    authenticateUser,
};