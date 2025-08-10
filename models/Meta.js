const mongoose = require("mongoose");

const MetaSchema = new mongoose.Schema({
  ano: { type: Number, required: true },
  mes: { type: Number, required: true }, // 0 = Janeiro, 11 = Dezembro
  valor: { type: Number, required: true }
}, {
  timestamps: true
});

MetaSchema.index({ ano: 1, mes: 1 }, { unique: true }); // garante que só exista uma meta por mês

module.exports = mongoose.model("Meta", MetaSchema);
