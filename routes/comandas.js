const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const { criarComanda } = require('../controllers/comandaController');
const { gerarPDF } = require('../controllers/comandaPdfController');
const Comanda = require('../models/Comanda'); 
const { deletarComanda } = require("../controllers/comandaController");




// 🔄 NOVA ROTA: listar todas as comandas
router.get("/", verifyToken, async (req, res) => {
  try {
    const comandas = await Comanda.find().populate("funcionarioId");
    res.json(comandas);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar comandas", erro: err.message });
  }
});

router.post('/', verifyToken, criarComanda);

// PDF individual da comanda
router.get('/:id/pdf', gerarPDF);

router.delete("/:id", verifyToken, deletarComanda);




module.exports = router;
