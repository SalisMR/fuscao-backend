const PDFDocument = require('pdfkit');
const fs = require('fs');

function gerarCabecalho(doc) {
  try {
    doc.image('logo.png', 50, 45, { width: 50 })
      .fillColor('#2c3e50')
      .fontSize(20)
      .text('fuscao stop car', 110, 57)
      .fontSize(10)
      .moveDown();
  } catch (error) {
    doc.fillColor('#2c3e50')
      .fontSize(20)
      .text('fuscao stop car', 50, 45)
      .fontSize(10)
      .moveDown();
  }
}

function gerarTabela(doc, tabela, yInicial) {
  let y = yInicial;
  const xInicial = 50;
  const larguraTabela = 500;
  const posicoes = [xInicial, 200, 300, 400, 500];

  doc.fillColor('#1abc9c').fontSize(12).font('Helvetica-Bold').text(tabela.titulo, xInicial, y, { underline: true });
  y += 25;

  doc.rect(xInicial, y, larguraTabela, 20).fill('#2c3e50').stroke();
  doc.fillColor('#FFFFFF').font('Helvetica-Bold');

  tabela.headers.forEach((header, i) => {
    doc.text(header, posicoes[i] + 5, y + 6, { width: posicoes[i + 1] - posicoes[i] - 10, align: 'left' });
  });

  y += 20;
  doc.font('Helvetica');

  tabela.rows.forEach((linha, i) => {
    const corFundo = i % 2 === 0 ? '#f8f9fa' : '#ffffff';
    doc.rect(xInicial, y, larguraTabela, 20).fill(corFundo).stroke();
    linha.forEach((celula, j) => {
      const align = j > 1 ? 'right' : 'left';
      doc.fillColor('#34495e').text(celula.toString(), posicoes[j] + 5, y + 6, {
        width: posicoes[j + 1] - posicoes[j] - 10,
        align
      });
    });
    y += 20;
  });

  return y + 20;
}

function gerarRodape(doc) {
  const bottomY = doc.page.height - doc.page.margins.bottom - 50;
  doc.moveTo(50, bottomY).lineTo(550, bottomY).dash(1, { space: 2 }).stroke('#bdc3c7');
  doc.fontSize(10).fillColor('#34495e');

  const signatureY = bottomY - 60;
  doc.moveTo(150, signatureY).lineTo(450, signatureY).stroke('#34495e');
  doc.text('Assinatura do Funcionário', 150, signatureY + 5, { align: 'center', width: 300 });

  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 50, bottomY + 10);
  doc.text('Página 1 de 1', 0, bottomY + 10, { align: 'right', width: doc.page.width - 50 });
}

exports.gerarHoleritePDF = (res, relatorio) => {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=holerite-premium-${relatorio.funcionario}.pdf`);

  doc.pipe(res);

  gerarCabecalho(doc);
  doc.moveDown(2);

  const titulo = 'Holerite de Comissão';
  const larguraTitulo = doc.widthOfString(titulo);
  const larguraUtil = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const posicaoX = doc.page.margins.left + (larguraUtil - larguraTitulo) / 2;

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#34495e');
  doc.text(titulo, posicaoX, doc.y, { lineBreak: false });
  doc.moveDown();

  doc.font('Helvetica').fontSize(12);
  doc.text(`Funcionário: ${relatorio.funcionario}`);
  doc.text(`Período: ${relatorio.periodo.inicio} até ${relatorio.periodo.fim}`);
  doc.moveDown(2);

  const tabelaResumo = {
    titulo: 'Resumo de Comissão',
    headers: ['Categoria', 'Quantidade', 'Total (R$)', 'Comissão (R$)', ''],
    rows: [
      ['Serviços', relatorio.servicos.quantidade, relatorio.servicos.valorTotal.toFixed(2), relatorio.servicos.comissao.toFixed(2), ''],
      ['Produtos', relatorio.produtos.quantidade, relatorio.produtos.valorTotal.toFixed(2), relatorio.produtos.comissao.toFixed(2), '']
    ]
  };

  let ultimaPosicaoY = gerarTabela(doc, tabelaResumo, doc.y);
  doc.moveDown(2);

  doc.font('Helvetica-Bold').fontSize(14);
  doc.text(`Total de comissão a receber: R$ ${relatorio.comissaoTotal.toFixed(2)}`, 50, ultimaPosicaoY, { align: 'right', width: 500 });
  doc.moveDown(4);

  if (relatorio.itensVendidos.length > 0) {
    const tabelaItens = {
      titulo: 'Detalhamento de Itens Vendidos',
      headers: ['Item', 'Tipo', 'Qtd.', 'Valor Total (R$)', ''],
      rows: relatorio.itensVendidos.map(item => [
        item.nome,
        item.tipo,
        item.quantidade,
        item.valorTotal.toFixed(2),
        ''
      ])
    };
    ultimaPosicaoY = gerarTabela(doc, tabelaItens, doc.y);
  } else {
    doc.font('Helvetica-Oblique').fontSize(10).text("Nenhuma venda registrada para detalhamento neste período.", 50, doc.y, { align: 'center', width: 500 });
    ultimaPosicaoY = doc.y + 20;
  }

  // Ajuste para rodapé no final da página
  if (ultimaPosicaoY > doc.page.height - 150) {
    doc.addPage();
  }
  gerarRodape(doc);
  doc.end();
};