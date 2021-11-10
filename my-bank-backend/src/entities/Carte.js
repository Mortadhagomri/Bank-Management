const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const carteSchema = new mongoose.Schema(
  {
    Num_Carte: {
      type: Number,
      required: true,
      unique: true,
      validate(value) {
        if (value < 0) throw new Error("entez un budget psitive ");
      },
    },
    passCode: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (value.length < 6)
          throw new Error("Pass Code must at least 6 digits  length");
      },
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client",
    },
  },
  { timestamps: true }
);

carteSchema.virtual("own", {
  ref: "Client",
  localField: "owner",
  foreignField: "_id",
  justOne: true,
});

carteSchema.methods.toJSON = function () {
  const carte = this;
  const carteObject = carte.toObject();
  delete carteObject.passCode;
  delete carteObject.__v;
  return carteObject;
};

carteSchema.statics.findByCredentials = async (Num_Carte, passCode) => {
  const carte = await Carte.findOne({ Num_Carte });
  if (!carte || carte.blocked)
    throw new Error("Unable to find the carte , Verify your Carte Id");
  const isMatch = await bcrypt.compare(passCode, carte.passCode);
  if (!isMatch) throw new Error("Wrong Passcode, Please verify the passCode !");
  await carte.populate("own").execPopulate();
  return carte.own;
};

carteSchema.methods.generateAuthToken = async function (client) {
  const token = jwt.sign(
    {
      _id: client.id.toString(),
      cin: client.cin,
      role: client.role,
      prenom: client.prenom,
      sexe: client.sexe,
      role: client.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30 minutes",
    }
  );

  return token;
};

carteSchema.pre("save", async function (next) {
  const carte = this;
  if (carte.isModified("passCode"))
    carte.passCode = await bcrypt.hash(carte.passCode, 8);
  next();
});
const Carte = mongoose.model("Carte", carteSchema);

module.exports = Carte;
