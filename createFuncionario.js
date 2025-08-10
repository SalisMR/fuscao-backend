const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function criarFuncionario() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    const senhaCriptografada = await bcrypt.hash('123456', 10);

    const funcionario = new User({
      nome: 'sales',
      email: 'joao@sales.com',
      senha: senhaCriptografada,
      tipo: 'funcionario',
      comissaoProduto: 15,
      comissaoServico: 10
    });

    await funcionario.save();
    console.log('✅ Funcionário criado com sucesso!');
    process.exit();
  } catch (err) {
    console.error('Erro ao criar funcionário:', err);
    process.exit(1);
  }
}

criarFuncionario();
