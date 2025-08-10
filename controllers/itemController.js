const Item = require("../models/Item");

exports.criarItem = async (req, res) => {
  try {
    const { nome, tipo, quantidade, valor } = req.body;

    const novoItem = new Item({
      nome,
      tipo,
      quantidade: tipo === "produto" ? quantidade : 0,
      valor,
    });

    await novoItem.save();
    res.status(201).json(novoItem);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao criar item", erro: err.message });
  }
};

exports.listarItens = async (req, res) => {
  try {
    const itens = await Item.find();
    res.json(itens);
  } catch (err) {
    res.status(500).json({ msg: "Erro ao listar itens", erro: err.message });
  }
};
