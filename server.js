const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.env.TZ = "America/Sao_Paulo";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// rotas
const relatoriosRoutes = require('./routes/relatorios');
app.use('/api/relatorios', relatoriosRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const itensRoutes = require('./routes/items'); // ✅ NOVO
app.use('/api/itens', itensRoutes);            // ✅ NOVO

const comandasRoutes = require('./routes/comandas'); // ✅ AQUI
app.use('/api/comandas', comandasRoutes);  

app.use('/api/auth', require('./routes/auth'));

// conexão
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado ao MongoDB');
  app.listen(process.env.PORT || 5000, () => {  
  console.log('Servidor rodando na porta', process.env.PORT || 5000);
});
}).catch(err => {
  console.error('Erro ao conectar no MongoDB', err);
});
