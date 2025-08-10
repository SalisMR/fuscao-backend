// Use esse código uma vez num arquivo `createAdmin.js`
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function criarAdmin() {
  await mongoose.connect(process.env.MONGO_URL);

  const senhaCriptografada = await bcrypt.hash('sales123', 10);

  const admin = new User({
    nome: 'salesadmin',
    email: 'admin@sales.com',
    senha: senhaCriptografada,
    tipo: 'admin',
    comissaoProduto: 0,
    comissaoServico: 0
  });

  await admin.save();
  console.log('Admin criado com sucesso!');
  process.exit();
}

criarAdmin();
