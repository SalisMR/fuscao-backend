const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) return res.status(401).json({ msg: 'Acesso negado. Sem token.' });

  try {
    const cleanedToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
    const verified = jwt.verify(cleanedToken, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Token inválido.' });
  }
};

module.exports = verifyToken;
