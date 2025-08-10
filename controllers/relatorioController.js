const Comanda = require("../models/Comanda");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const gerarRelatorioDetalhado = async (req, res) => {
  try {
    const { inicio, fim, funcionario, busca } = req.query;
    const filtros = {};

    if (inicio || fim) {
      filtros.createdAt = {};
      if (inicio) filtros.createdAt.$gte = new Date(inicio);
      if (fim) filtros.createdAt.$lte = new Date(fim + "T23:59:59");
    }

    if (funcionario) filtros.funcionarioId = funcionario;
    if (busca) {
      filtros.$or = [
        { cliente: { $regex: busca, $options: "i" } },
        { whatzapp: { $regex: busca, $options: "i" } },
      ];
    }

    const comandas = await Comanda.find(filtros).populate("funcionarioId");

    let faturamento = 0;
    let servicosRealizados = {};
    let produtosVendidos = {};

    comandas.forEach((comanda) => {
      faturamento += comanda.valorFinal;

      comanda.itens.forEach((item) => {
        const target = item.tipo === "produto" ? produtosVendidos : servicosRealizados;
        if (!target[item.nome]) {
          target[item.nome] = {
            quantidade: item.quantidade,
            total: item.quantidade * item.valorUnitario,
          };
        } else {
          target[item.nome].quantidade += item.quantidade;
          target[item.nome].total += item.quantidade * item.valorUnitario;
        }
      });
    });

    res.json({
      resumo: {
        comandas: comandas.length,
        faturamento,
        servicosRealizados,
        produtosVendidos,
      },
      comandas,
    });
  } catch (err) {
    console.error("Erro ao gerar relatório:", err);
    res.status(500).json({ msg: "Erro ao gerar relatório detalhado" });
  }
};

const exportarRelatorioPDF = async (req, res) => {
  try {
    const { filtros, opcoes } = req.body;
    const query = {};

    if (filtros.inicio || filtros.fim) {
      query.createdAt = {};
      if (filtros.inicio) query.createdAt.$gte = new Date(filtros.inicio);
      if (filtros.fim) query.createdAt.$lte = new Date(filtros.fim + "T23:59:59");
    }

    if (filtros.funcionario) query.funcionarioId = filtros.funcionario;
    if (filtros.busca) {
      query.$or = [
        { cliente: { $regex: filtros.busca, $options: "i" } },
        { whatzapp: { $regex: filtros.busca, $options: "i" } },
      ];
    }

    const comandas = await Comanda.find(query).populate("funcionarioId");

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const filename = "relatorio.pdf";

    res.setHeader("Content-disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-type", "application/pdf");
    doc.pipe(res);

    const logoPath = path.join(__dirname, "../public/img/fusca.png");

    doc.fontSize(12).fillColor("red").font("Helvetica-BoldOblique")
      .text("De uma agulha a um avião, FUSCÃO é a solução", { align: "center" })
      .moveDown(0.5);

    if (fs.existsSync(logoPath)) doc.image(logoPath, 40, 60, { width: 50 });

    doc
      .fontSize(20)
      .fillColor("black")
      .text("FUSCÃO STOP CAR", 100, 65, { align: "left" })
      .fontSize(12)
      .fillColor("gray")
      .text("Relatório Geral", { align: "right" })
      .moveDown();

    doc.moveTo(40, 110).lineTo(555, 110).strokeColor("#ccc").stroke();
    doc.moveDown();

    doc.fontSize(10).fillColor("black").text(`Período: ${filtros.inicio || "..."} até ${filtros.fim || "..."}`);
    if (comandas[0]?.funcionarioId?.nome) {
      doc.text(`Funcionário: ${comandas[0].funcionarioId.nome}`);
    }
    doc.moveDown();

    const drawTitle = (text) => {
      doc.moveDown(0.5);
      doc.fontSize(13).fillColor("red").text(text, { underline: true });
      doc.moveDown(0.5);
      doc.fillColor("black");
    };

    if (opcoes.resumo) {
      const faturamento = comandas.reduce((acc, c) => acc + c.valorFinal, 0);
      drawTitle("Resumo Geral");
      doc.fontSize(10).text(`Total de Comandas: ${comandas.length}`);
      doc.text(`Faturamento Total: R$ ${faturamento.toFixed(2)}`);
    }

    if (opcoes.produtos) {
      let produtos = {};
      comandas.forEach((c) =>
        c.itens.forEach((i) => {
          if (i.tipo === "produto") {
            if (!produtos[i.nome]) produtos[i.nome] = { q: 0, total: 0 };
            produtos[i.nome].q += i.quantidade;
            produtos[i.nome].total += i.valorUnitario * i.quantidade;
          }
        })
      );
      drawTitle("Produtos Vendidos");
      Object.entries(produtos).forEach(([nome, d]) => {
        doc.text(`${nome}: ${d.q}x - R$ ${d.total.toFixed(2)}`);
      });
    }

    if (opcoes.servicos) {
      let servicos = {};
      comandas.forEach((c) =>
        c.itens.forEach((i) => {
          if (i.tipo === "servico") {
            if (!servicos[i.nome]) servicos[i.nome] = { q: 0, total: 0 };
            servicos[i.nome].q += i.quantidade;
            servicos[i.nome].total += i.valorUnitario * i.quantidade;
          }
        })
      );
      drawTitle("Serviços Realizados");
      Object.entries(servicos).forEach(([nome, d]) => {
        doc.text(`${nome}: ${d.q}x - R$ ${d.total.toFixed(2)}`);
      });
    }

    if (opcoes.comandas) {
      drawTitle("Comandas Detalhadas");
      comandas.forEach((c) => {
        doc
          .font("Helvetica-Bold")
          .text(` ${new Date(c.createdAt).toLocaleDateString("pt-BR")} - ${c.cliente}`);
        doc.font("Helvetica").text(`WhatsApp: ${c.whatzapp} | Veículo: ${c.veiculo}`);
        doc.text(`Funcionário: ${c.funcionarioId?.nome || "-"}`);
        doc.text(`Desconto: R$ ${c.desconto.toFixed(2)} | Valor Final: R$ ${c.valorFinal.toFixed(2)}`);
        doc.text(`Itens:`);
        c.itens.forEach((i) => {
          doc.text(`   - ${i.nome} (${i.tipo}) - ${i.quantidade}x R$ ${i.valorUnitario}`);
        });
        if (c.observacoes) {
          doc.moveDown(0.2);
          doc.font("Helvetica-Oblique").fillColor("gray").text(` Observações: ${c.observacoes}`);
          doc.fillColor("black").font("Helvetica");
        }
        doc.moveDown(0.5);
        doc.moveTo(doc.x, doc.y).lineTo(555, doc.y).strokeColor("#ddd").stroke();
        doc.moveDown();
      });
    }

    doc.end();
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ msg: "Erro ao gerar PDF" });
  }
};

module.exports = {
  gerarRelatorioDetalhado,
  exportarRelatorioPDF,
};
