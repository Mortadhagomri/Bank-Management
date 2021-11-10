const mongoose = require("mongoose");

const historySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client"
    }
  },
  { timestamps: true }
);

const History = mongoose.model("History", historySchema);

module.exports = History;
