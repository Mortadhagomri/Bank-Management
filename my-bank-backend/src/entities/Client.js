const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const Account = require("./Account");
const Carte = require("./Carte");
const History = require("./History");
const clientSchema = new mongoose.Schema(
  {
    cin: {
      type: String,
      trim: true,
      unique: true,
      required: true,
      validate(value) {
        if (value.length !== 8) throw new Error("CIN must have 8 digits");
      },
    },
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    sexe: {
      type: String,
      trim: true,
      default: "Homme",
    },
    etat_civil: {
      type: String,
      trim: true,
      default: "Célibataire",
    },
    adresse: {
      type: new mongoose.Schema({
        Rue: { type: String, trim: true },
        Ville: { type: String, trim: true, uppercase: true },
        Code_postale: { type: String, trim: true },
      }),
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },

    telephone: {
      type: String,
      validate(value) {
        if (value.length !== 8) throw new Error("Phone must have 8 digits");
      },
      required: true,
    },
    naissance: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },
    role: {
      type: String,
      default: "Client",
    },
  },
  {
    timestamps: true,
  }
);

clientSchema.virtual("accounts", {
  ref: "Account",
  localField: "_id",
  foreignField: "owner",
});

clientSchema.virtual("historique", {
  ref: "History",
  localField: "_id",
  foreignField: "owner",
});

clientSchema.methods.toJSON = function () {
  const client = this;
  const clientObject = client.toObject();
  delete clientObject.password;
  delete clientObject.role;
  delete clientObject.__v;
  return clientObject;
};

clientSchema.methods.generateAuthToken = async function () {
  const client = this;

  const token = jwt.sign(
    {
      _id: client.id.toString(),
      cin: client.cin,
      role: client.role,
      prenom: client.prenom,
      nom: client.nom,
      sexe: client.sexe,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2 days",
    }
  );

  return token;
};

clientSchema.statics.findByCredentials = async (cin, password) => {
  const user = await Client.findOne({ cin });
  if (!user) return;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return;
  return user;
};

clientSchema.statics.findByCIN = async (cin) => {
  const client = await Client.findOne({ cin });
  if (!client) throw new Error("Unable to log in");
  return ({ email, prenom } = client);
};

clientSchema.pre("save", async function (next) {
  const client = this;

  if (client.isModified("password")) {
    client.password = await bcrypt.hash(client.password, 8);
  }
  next();
});

clientSchema.pre("remove", async function (next) {
  const client = this;
  await Account.deleteMany({ owner: client._id });
  await Carte.deleteMany({ owner: client._id });
  await History.deleteMany({ owner: client._id });
  next();
});

//public

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
