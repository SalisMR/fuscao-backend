// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
process.env.TZ = 'America/Sao_Paulo';

dotenv.config();

const app = express();

/** ✅ CORS: libera frontend local e Vercel (inclui previews *.vercel.app) */
const allowedOrigins = [
  'http://localhost:5173',
  'https://fuscao-frontend.vercel.app',
  process.env.FRONTEND_URL, // opcional se você usar domínio próprio
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // permite requisições sem origin (ex.: health checks) e permite *.vercel.app
    if (!origin || allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // estamos usando token em header, não cookies
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // responde preflight

app.use(express.json());

// rotas
const relatoriosRoutes = require('./routes/relatorios');
app.use('/api/relatorios', relatoriosRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const itensRoutes = require('./routes/items'); // se o arquivo for 'itens.js', troque aqui
app.use('/api/itens', itensRoutes);

const comandasRoutes = require('./routes/comandas');
app.use('/api/comandas', comandasRoutes);

app.use('/api/auth', require('./routes/auth'));

// conexão
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('Conectado ao MongoDB');
    app.listen(process.env.PORT || 5000, () => {
      console.log('Servidor rodando na porta', process.env.PORT || 5000);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar no MongoDB', err);
  });
