const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const {
  gerarRelatorioDetalhado,
  exportarRelatorioPDF,
} = require('../controllers/relatorioController');

router.get('/comandas/relatorio/detalhado', verifyToken, isAdmin, gerarRelatorioDetalhado);
router.post('/exportar-pdf', verifyToken, isAdmin, exportarRelatorioPDF);

module.exports = router;
