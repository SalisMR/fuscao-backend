const Comanda = require("../models/Comanda");
const Item = require("../models/Item");
const User = require("../models/User");
const Meta = require("../models/Meta");

const TIMEZONE = "America/Sao_Paulo";

exports.getDashboardData = async (req, res) => {
  try {
    const { periodo = "mes" } = req.query;

    // Datas de início/fim do período (em SP)
    const now = new Date();
    let dataInicio;

    switch (periodo) {
      case "hoje": {
        dataInicio = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      }
      case "semana": {
        // 0=domingo..6=sábado
        const diaSemana = now.getDay();
        dataInicio = new Date(now);
        dataInicio.setDate(now.getDate() - diaSemana);
        dataInicio.setHours(0, 0, 0, 0);
        break;
      }
      case "mes":
      default: {
        dataInicio = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      }
    }

    const dataFim = new Date(); // agora

    // 1) Comandas do período
    const comandasPeriodo = await Comanda.find({
      createdAt: { $gte: dataInicio, $lte: dataFim },
    });

    const totalComandas = comandasPeriodo.length;
    const faturamento = comandasPeriodo.reduce((acc, c) => acc + (c.valorFinal || 0), 0);
    const clientesUnicos = new Set(comandasPeriodo.map((c) => c.cliente)).size;

    // 2) Produtos com estoque baixo (seu model usa "quantidade")
    const estoqueCritico = await Item.find({
      tipo: "produto",
      quantidade: { $lte: 5 },
    });

    // 3) Gráfico — agrupamento por dia com TIMEZONE
    const comandasPorDia = await Comanda.aggregate([
      {
        $match: {
          createdAt: { $gte: dataInicio, $lte: dataFim },
        },
      },
      {
        $group: {
          _id: {
            dia: { $dayOfMonth: { date: "$createdAt", timezone: TIMEZONE } },
            mes: { $month: { date: "$createdAt", timezone: TIMEZONE } },
            ano: { $year: { date: "$createdAt", timezone: TIMEZONE } },
          },
          totalComandas: { $sum: 1 },
          totalFaturado: { $sum: "$valorFinal" },
        },
      },
      { $sort: { "_id.ano": 1, "_id.mes": 1, "_id.dia": 1 } },
    ]);

    // 4) Últimas comandas
    const ultimasComandas = await Comanda.find({
      createdAt: { $gte: dataInicio, $lte: dataFim },
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("funcionarioId", "nome");

    // 5) Tracking de funcionários
    const trackingFuncionarios = await Comanda.aggregate([
      {
        $match: {
          createdAt: { $gte: dataInicio, $lte: dataFim },
        },
      },
      {
        $group: {
          _id: "$funcionarioId",
          totalComandas: { $sum: 1 },
          faturamento: { $sum: "$valorFinal" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "funcionario",
        },
      },
      { $unwind: "$funcionario" },
      {
        $project: {
          nome: "$funcionario.nome",
          totalComandas: 1,
          faturamento: 1,
          ticketMedio: {
            $cond: [
              { $eq: ["$totalComandas", 0] },
              0,
              { $divide: ["$faturamento", "$totalComandas"] },
            ],
          },
        },
      },
      { $sort: { faturamento: -1 } },
    ]);

    // 6) Meta do mês (persiste; herda do mês anterior se não existir)
    const ano = now.getFullYear();
    const mes = now.getMonth();
    let metaDoc = await Meta.findOne({ ano, mes });
    if (!metaDoc) {
      let mesAnterior = mes - 1;
      let anoAnterior = ano;
      if (mesAnterior < 0) {
        mesAnterior = 11;
        anoAnterior -= 1;
      }
      const metaAnterior = await Meta.findOne({ ano: anoAnterior, mes: mesAnterior });
      metaDoc = await Meta.create({ ano, mes, valor: metaAnterior?.valor || 10000 });
    }
    const progressoMeta = metaDoc.valor > 0 ? (faturamento / metaDoc.valor) * 100 : 0;

    res.json({
      totalComandas,
      faturamento,
      clientesUnicos,
      estoqueCritico,
      comandasPorDia,
      ultimasComandas,
      trackingFuncionarios,
      meta: {
        valor: metaDoc.valor,
        progresso: progressoMeta,
      },
    });
  } catch (err) {
    console.error("Erro no dashboard:", err);
    res.status(500).json({ msg: "Erro ao carregar dados do dashboard." });
  }
};
