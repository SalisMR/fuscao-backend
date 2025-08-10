const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  senha: {
    type: String,
    required: true,
  },
  tipo: {
    type: String,
    enum: ['admin', 'funcionario', 'gerente', 'estoquista'],
    default: 'funcionario',
  },
  comissaoProduto: {
    type: Number,
    default: 0,
  },
  comissaoServico: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
