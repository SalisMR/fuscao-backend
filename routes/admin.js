
const express = require("express");
const router = express.Router();
const { getDashboardData } = require("../controllers/adminDashboardController");
const verifyToken = require("../middleware/auth");
const { getMeta, atualizarMeta } = require("../controllers/metaController");


// Rota protegida para o painel do admin
router.get("/dashboard", verifyToken, getDashboardData);
router.get("/meta", verifyToken, getMeta);
router.put("/meta", verifyToken, atualizarMeta);

module.exports = router;
