// ✅ controllers/comandaController.js (corrigido para pegar ID do token)
const Comanda = require("../models/Comanda");
const Item = require("../models/Item");

exports.criarComanda = async (req, res) => {
  try {
    // Pega ID do funcionário/admin direto do token
    const funcionarioFromToken = req.user?.id || req.user?._id;
    if (!funcionarioFromToken) {
      return res.status(401).json({ msg: "Funcionário não identificado." });
    }

    const {
      cliente,
      whatzapp,
      veiculo,
      itens = [],
      total,
      desconto = 0,
      valorFinal,
      observacoes,
    } = req.body;

    if (!cliente || !whatzapp) {
      return res.status(400).json({ msg: "Cliente e WhatsApp são obrigatórios." });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ msg: "A comanda precisa ter pelo menos 1 item." });
    }

    // Valida estoque e itens
    for (let i of itens) {
      const item = await Item.findById(i.itemId);
      if (!item) {
        return res.status(400).json({ msg: `Item ${i.nome} não encontrado.` });
      }

      if (item.tipo === "produto") {
        if (item.quantidade < i.quantidade) {
          return res.status(400).json({ msg: `Estoque insuficiente para o item ${item.nome}.` });
        }
      }
    }

    // Debita estoque de produtos
    for (let i of itens) {
      const item = await Item.findById(i.itemId);
      if (item.tipo === "produto") {
        item.quantidade -= i.quantidade;
        await item.save();
      }
    }

    const comanda = new Comanda({
      cliente,
      whatzapp,
      veiculo,
      funcionarioId: funcionarioFromToken,
      itens: itens.map((i) => ({
        itemId: i.itemId,
        nome: i.nome,
        tipo: i.tipo,
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
      })),
      total,
      desconto,
      valorFinal,
      observacoes,
    });

    await comanda.save();
    return res.status(201).json({ comanda });
  } catch (err) {
    console.error("Erro ao salvar comanda:", err);
    return res.status(500).json({ msg: "Erro ao salvar comanda", erro: err.message });
  }
};

exports.deletarComanda = async (req, res) => {
  try {
    const comanda = await Comanda.findByIdAndDelete(req.params.id);
    if (!comanda) {
      return res.status(404).json({ msg: "Comanda não encontrada." });
    }
    res.json({ msg: "Comanda excluída com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir comanda:", err);
    res.status(500).json({ msg: "Erro ao excluir comanda." });
  }
};
