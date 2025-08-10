const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { criarItem, listarItens } = require('../controllers/itemController');
const Item = require('../models/Item');

// Criar item
router.post('/', verifyToken, isAdmin, criarItem);

// Listar todos os itens
router.get('/', verifyToken, listarItens);

// Buscar item por nome (produtos e serviços)
router.get('/quantidade', verifyToken, async (req, res) => {
  const nome = req.query.nome;

  if (!nome) return res.status(400).json({ msg: 'Informe um nome para buscar' });

  const itens = await Item.find({
    nome: { $regex: nome, $options: 'i' }
  });

  res.json(itens.map(item => ({
    _id: item._id,
    nome: item.nome,
    tipo: item.tipo,
    valor: item.valor,
    quantidade: item.quantidade ?? 0, // retorna 0 se for serviço
  })));
});

// Atualizar item
router.put('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { nome, tipo, quantidade, valor } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado' });

    item.nome = nome;
    item.tipo = tipo;
    item.valor = valor;

    // aplica quantidade apenas para produtos
    if (tipo === 'produto') {
      item.quantidade = quantidade;
    } else {
      item.quantidade = undefined;
    }

    await item.save();
    res.json({ msg: 'Item atualizado com sucesso', item });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao atualizar item', erro: err.message });
  }
});

// Remover item
router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: 'Item não encontrado' });

    res.json({ msg: 'Item removido com sucesso' });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao remover item', erro: err.message });
  }
});

module.exports = router;
