const Comanda = require('../models/Comanda');
const User = require('../models/User');
const Ciclo = require('../models/Ciclo');

exports.fecharCiclo = async (req, res) => {
  try {
    const { inicio, fim } = req.body;

    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);
    fimDate.setUTCHours(23, 59, 59, 999);

    const comandas = await Comanda.find({
      data: { $gte: inicioDate, $lte: fimDate }
    });

    const funcionarios = await User.find({ tipo: 'funcionario' });

    let totalProdutos = 0;
    let totalServicos = 0;
    let comissaoTotal = 0;

    const porFuncionario = [];

    for (const func of funcionarios) {
      let total = 0;
      let comissao = 0;

      const comandasFuncionario = comandas.filter(c => c.funcionarioId.toString() === func._id.toString());

      comandasFuncionario.forEach(c => {
        c.itens.forEach(item => {
          const valor = item.valorUnitario * item.quantidade;
          total += valor;

          if (item.tipo === 'produto') {
            totalProdutos += valor;
            comissao += (func.comissaoProduto / 100) * valor;
          }

          if (item.tipo === 'servico') {
            totalServicos += valor;
            comissao += (func.comissaoServico / 100) * valor;
          }
        });
      });

      comissaoTotal += comissao;

      porFuncionario.push({
        funcionarioId: func._id,
        nome: func.nome,
        totalVendido: total,
        comissao: parseFloat(comissao.toFixed(2))
      });
    }

    const ciclo = new Ciclo({
      mes: inicioDate.getMonth() + 1 + '',
      ano: inicioDate.getFullYear() + '',
      fechadoEm: new Date(),
      totalProdutos,
      totalServicos,
      comissaoTotal: parseFloat(comissaoTotal.toFixed(2)),
      porFuncionario
    });

    await ciclo.save();

    res.status(201).json({ msg: 'Ciclo encerrado com sucesso!', ciclo });
  } catch (err) {
    res.status(500).json({ msg: 'Erro ao fechar ciclo', erro: err.message });
  }
};
