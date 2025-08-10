const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const Item = require('../models/Item');

// 🔄 NOVA ROTA: listar todos os itens
router.get("/", verifyToken, async (req, res) => {
  try {
    const itens = await Item.find();
    res.json(itens);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao buscar estoque", erro: err.message });
  }
});

// Entrada manual de estoque
router.post('/entrada', verifyToken, isAdmin, async (req, res) => {
  try {
    const { itemId, quantidade } = req.body;

    if (!itemId || quantidade <= 0) {
      return res.status(400).json({ msg: 'Dados inválidos' });
    }

    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado' });
    if (item.tipo !== 'produto') return res.status(400).json({ msg: 'Serviços não possuem estoque' });

    item.estoque += quantidade;
    await item.save();

    res.json({ msg: 'Estoque atualizado com sucesso', item });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao atualizar estoque', erro: err.message });
  }
});

module.exports = router;
