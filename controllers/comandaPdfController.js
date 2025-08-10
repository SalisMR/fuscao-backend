const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Comanda = require("../models/Comanda");

exports.gerarPDF = async (req, res) => {
  try {
    const comanda = await Comanda.findById(req.params.id).populate("funcionarioId");

    if (!comanda) {
      return res.status(404).json({ msg: "Comanda não encontrada" });
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=comanda.pdf");

    doc.pipe(res);

    // Registrar fontes para melhor estilização
    doc.registerFont('Bold', 'Helvetica-Bold');
    doc.registerFont('Italic', 'Helvetica-Oblique');

    // Cabeçalho com logo e título
    const logoPath = path.join(__dirname, "../public/img/fusca.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 40, 30, { width: 80 });
    }

    doc
      .font('Bold')
      .fontSize(24)
      .fillColor("#cc0000")
      .text("Fuscão Stop Car", 130, 35, { align: "left" });

    doc
      .font('Helvetica')
      .fontSize(14)
      .fillColor("black")
      .text("Relatório de Comanda", 130, 65, { align: "left" });

    // Linha separadora decorativa
    doc.moveTo(40, 95).lineTo(555, 95).lineWidth(2).strokeColor("#cc0000").stroke();
    doc.moveTo(40, 97).lineTo(555, 97).lineWidth(1).strokeColor("#e0e0e0").stroke();

    doc.moveDown(1.5);

    // Informações gerais em duas colunas para melhor layout
    const leftColumnX = 40;
    const rightColumnX = 300;

    doc
      .font('Bold')
      .fontSize(12)
      .fillColor("#333333")
      .text("Data:", leftColumnX, doc.y)
      .font('Helvetica')
      .text(new Date(comanda.createdAt).toLocaleString(), rightColumnX, doc.y - 15);

    doc
      .font('Bold')
      .text("Cliente:", leftColumnX, doc.y + 5)
      .font('Helvetica')
      .text(comanda.cliente, rightColumnX, doc.y - 15);

    doc
      .font('Bold')
      .text("Funcionário:", leftColumnX, doc.y + 5)
      .font('Helvetica')
      .text(comanda.funcionarioId?.nome || "N/A", rightColumnX, doc.y - 15);

    doc
      .font('Bold')
      .text("Observações:", leftColumnX, doc.y + 5)
      .font('Helvetica')
      .text(comanda.observacoes || "—", rightColumnX, doc.y - 15, { width: 250, align: "left" });

    doc.moveDown(2);

    // Seção de Itens com tabela simulada
    doc
      .font('Bold')
      .fontSize(14)
      .fillColor("#cc0000")
      .text("Itens da Comanda:", 40, doc.y, { underline: true });

    doc.moveDown(0.5);

    // Cabeçalhos da tabela
    const tableTop = doc.y;
    const col1 = 40;  // Nº
    const col2 = 70;  // Nome
    const col3 = 250; // Tipo
    const col4 = 320; // Qtde
    const col5 = 390; // Valor Unit.
    const col6 = 480; // Subtotal

    doc
      .font('Bold')
      .fontSize(11)
      .fillColor("#333333")
      .text("Nº", col1, tableTop)
      .text("Nome", col2, tableTop)
      .text("Tipo", col3, tableTop)
      .text("Qtde", col4, tableTop)
      .text("Valor Unit.", col5, tableTop)
      .text("Subtotal", col6, tableTop);

    // Linha abaixo dos cabeçalhos
    doc.moveTo(40, tableTop + 20).lineTo(555, tableTop + 20).strokeColor("#cc0000").stroke();

    let itemY = tableTop + 25;
    comanda.itens.forEach((item, i) => {
      const subtotal = item.quantidade * item.valorUnitario;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor("black")
        .text(`${i + 1}`, col1, itemY)
        .text(item.nome, col2, itemY, { width: 170, align: "left" })
        .text(item.tipo, col3, itemY)
        .text(item.quantidade.toString(), col4, itemY)
        .text(`R$ ${item.valorUnitario.toFixed(2)}`, col5, itemY)
        .text(`R$ ${subtotal.toFixed(2)}`, col6, itemY);

      itemY += 20; // Espaçamento entre linhas
    });

    // Linha final da tabela
    doc.moveTo(40, itemY + 5).lineTo(555, itemY + 5).strokeColor("#e0e0e0").stroke();

    doc.y = itemY + 20;

    // Totais alinhados à direita com destaque
    const totalsX = 400;
    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor("black")
      .text(`Total: R$ ${comanda.total.toFixed(2)}`, totalsX, doc.y, { align: "left" });

    doc
      .text(`Desconto: R$ ${comanda.desconto.toFixed(2)}`, totalsX, doc.y + 5, { align: "left" });

    doc.moveDown(0.5);

    doc
      .font('Bold')
      .fontSize(14)
      .fillColor("green")
      .text(`Valor Final: R$ ${comanda.valorFinal.toFixed(2)}`, totalsX, doc.y, { align: "left", underline: true });

    // Rodapé
    const footerY = 760;
    doc.moveTo(40, footerY).lineTo(555, footerY).strokeColor("#e0e0e0").stroke();

    doc
      .font('Italic')
      .fontSize(10)
      .fillColor("gray")
      .text("Fuscão Stop Car • www.fuscaostopcar.com.br • (99) 99999-9999", 40, footerY + 10, {
        align: "center",
        width: 515
      });

    doc.end();
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    res.status(500).json({ msg: "Erro ao gerar PDF" });
  }
};


