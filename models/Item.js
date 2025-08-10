const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: ['produto', 'servico'],
    required: true,
  },
  valor: {
    type: Number,
    required: true,
  },
  descricao: String,
  quantidade: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.models.Item || mongoose.model('Item', ItemSchema);
