
const mongoose = require('mongoose');

const ComandaSchema = new mongoose.Schema({
  cliente: { type: String, required: true },
  whatzapp: { type: String, required: true }, // ✅ NOVO CAMPO
  veiculo: { type: String },
  funcionarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Date, default: Date.now },
  itens: [
    {
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
      nome: String,
      tipo: String,
      quantidade: Number,
      valorUnitario: Number
    }
  ],
  total: Number,
  desconto: { type: Number, default: 0 },
  valorFinal: Number,
  observacoes: String
}, { timestamps: true });

module.exports = mongoose.model('Comanda', ComandaSchema);
