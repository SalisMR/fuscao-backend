const isAdmin = (req, res, next) => {
  if (req.user.tipo !== 'admin') {
    return res.status(403).json({ msg: 'Acesso restrito ao administrador.' });
  }
  next();
};

module.exports = isAdmin;
