const PDFDocument = require('pdfkit');

exports.gerarPDFCiclo = (res, ciclo) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=ciclo-${ciclo.mes}-${ciclo.ano}.pdf`);
  doc.pipe(res);

  // Título
  doc.fontSize(16).text(`Relatório do Ciclo Mensal`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Mês: ${ciclo.mes.padStart(2, '0')} / ${ciclo.ano}`);
  doc.text(`Fechado em: ${new Date(ciclo.fechadoEm).toLocaleDateString('pt-BR')}`);
  doc.moveDown(1.5);

  // Totais gerais
  doc.text(`Total em Produtos: R$ ${ciclo.totalProdutos.toFixed(2)}`);
  doc.text(`Total em Serviços: R$ ${ciclo.totalServicos.toFixed(2)}`);
  doc.font('Helvetica-Bold')
    .text(`Total de Comissão: R$ ${ciclo.comissaoTotal.toFixed(2)}`);
  doc.font('Helvetica');
  doc.moveDown(2);

  // Tabela de funcionários
  doc.fontSize(12).text(`Comissões por Funcionário`, { underline: true });
  doc.moveDown(0.5);

  const posX = {
    nome: 50,
    vendido: 200,
    comissao: 350,
  };

  const currentY = doc.y;
  doc.font('Helvetica-Bold')
    .text('Funcionário', posX.nome, currentY)
    .text('Total Vendido (R$)', posX.vendido, currentY)
    .text('Comissão (R$)', posX.comissao, currentY);

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  doc.font('Helvetica');
  ciclo.porFuncionario.forEach(func => {
    const rowY = doc.y;
    doc.text(func.nome, posX.nome, rowY)
      .text(func.totalVendido.toFixed(2), posX.vendido, rowY)
      .text(func.comissao.toFixed(2), posX.comissao, rowY);
    doc.moveDown(0.3);
  });

  // Rodapé
  doc.moveDown(3);
  const signatureY = doc.y;
  doc.moveTo(50, signatureY).lineTo(350, signatureY).stroke();
  doc.text('Assinatura do responsável pelo pagamento', 50, signatureY + 5);
  doc.moveDown(1);
  doc.text('Data de pagamento: ____ / ____ / ______', 50);

  doc.end();
};