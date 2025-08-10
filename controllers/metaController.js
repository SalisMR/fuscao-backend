const Meta = require("../models/Meta");

exports.getMeta = async (req, res) => {
  try {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth();

    let meta = await Meta.findOne({ ano, mes });

    if (!meta) {
      // Buscar meta do mês anterior
      let mesAnterior = mes - 1;
      let anoAnterior = ano;

      if (mesAnterior < 0) {
        mesAnterior = 11;
        anoAnterior -= 1;
      }

      const metaAnterior = await Meta.findOne({
        ano: anoAnterior,
        mes: mesAnterior,
      });

      const valorMeta = metaAnterior?.valor || 10000;

      meta = await Meta.create({ ano, mes, valor: valorMeta });
    }

    res.json(meta);
  } catch (err) {
    console.error("Erro ao buscar meta:", err);
    res.status(500).json({ msg: "Erro ao buscar meta." });
  }
};

exports.atualizarMeta = async (req, res) => {
  try {
    const now = new Date();
    const ano = now.getFullYear();
    const mes = now.getMonth();
    const { valor } = req.body;

    if (typeof valor !== "number" || valor <= 0) {
      return res.status(400).json({ msg: "Valor inválido." });
    }

    const meta = await Meta.findOneAndUpdate(
      { ano, mes },
      { valor },
      { upsert: true, new: true }
    );

    res.json(meta);
  } catch (err) {
    console.error("Erro ao atualizar meta:", err);
    res.status(500).json({ msg: "Erro ao atualizar meta." });
  }
};
