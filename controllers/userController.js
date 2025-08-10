// controllers/userController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const criarFuncionario = async (req, res) => {
  try {
    const { nome, email, senha, tipo, comissaoProduto, comissaoServico } = req.body;
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    const novo = new User({ nome, email, senha: senhaCriptografada, tipo, comissaoProduto, comissaoServico });
    await novo.save();
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ msg: "Erro ao criar funcionário." });
  }
};

const listarFuncionarios = async (req, res) => {
  const funcionarios = await User.find({ tipo: "funcionario" });
  res.json(funcionarios);
};

const listarTodosUsuarios = async (req, res) => {
  const usuarios = await User.find();
  res.json(usuarios);
};

const editarUsuario = async (req, res) => {
  try {
    const { nome, email, senha, tipo, comissaoProduto, comissaoServico } = req.body;
    const atualizacoes = { nome, email, tipo, comissaoProduto, comissaoServico };
    if (senha) atualizacoes.senha = await bcrypt.hash(senha, 10);
    await User.findByIdAndUpdate(req.params.id, atualizacoes);
    res.json({ msg: "Usuário atualizado." });
  } catch (err) {
    res.status(400).json({ msg: "Erro ao editar usuário." });
  }
};

const deletarUsuario = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: "Usuário excluído." });
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(404).json({ msg: "Usuário não encontrado." });
    }

    const senhaOk = await bcrypt.compare(senha, usuario.senha);
    if (!senhaOk) {
      return res.status(401).json({ msg: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: usuario._id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Erro no login." });
  }
};

module.exports = {
  criarFuncionario,
  listarFuncionarios,
  listarTodosUsuarios,
  editarUsuario,
  deletarUsuario,
  login,
};
