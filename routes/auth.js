const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  criarFuncionario,
  listarFuncionarios,
  listarTodosUsuarios,
  editarUsuario,
  deletarUsuario,
  login
} = require("../controllers/userController");

router.post("/login", login); // ✅ aqui

router.get("/funcionarios", auth, listarFuncionarios);
router.get("/usuarios", auth, listarTodosUsuarios);
router.post("/register", auth, criarFuncionario);
router.put("/usuarios/:id", auth, editarUsuario);
router.delete("/usuarios/:id", auth, deletarUsuario);

module.exports = router;
