import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.headers['access-token'];

  if (!token) return next(new Error('You are not authenticated!'));

  jwt.verify(token, 'mysecret', async (err, payload) => {
    if (err) return next(new Error('Token is not valid!'));
    req.user_id = payload.user_id;
    next();
  });
};

export default verifyToken;
