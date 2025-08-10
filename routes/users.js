const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { criarFuncionario, listarFuncionarios } = require('../controllers/userController');

router.post('/', verifyToken, isAdmin, criarFuncionario); // Criar funcionário
router.get('/', verifyToken, isAdmin, listarFuncionarios); // Listar funcionários

module.exports = router;
