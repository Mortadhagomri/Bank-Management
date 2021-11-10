const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    account_num: {
      type: Number,
      unique: true,
      required: true,
    },
    solde: {
      type: Number,
      default: 100,
      validate(value) {
        if (value < 0) throw new Error("entez un budget positive ");
      },
    },
    compte_type: {
      type: String,
      trim: true,
      default: "Working on it",
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    stats: {
      win: {
        percent: [],
        date: [],
      },
      loose: {
        percent: [],
        date: [],
      },
      date: { type: String },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Client",
    },
  },
  { timestamps: true }
);

accountSchema.methods.toJSON = function () {
  const account = this;
  const accountObject = account.toObject();
  delete accountObject.__v;
  return accountObject;
};

accountSchema.pre("save", async function (next) {
  const account = this;
  if (account.solde < 30) account.blocked = true;
  else if (account >= 30 && !account.blocked) account.blocked = false;
  else if (account >= 30 && account.blocked) account.blocked = true;

  if (account.isModified("solde")) {
    const oldaccount = await Account.findOne({
      account_num: account.account_num,
    });
    if (!oldaccount) return next();
    const now = new Date();
    if (account.stats.date !== now.getFullYear() + "/" + (now.getMonth() + 1)) {
      account.stats.win.percent = [];
      account.stats.win.date = [];
      account.stats.loose.percent = [];
      account.stats.loose.date = [];
      account.stats.date = now.getFullYear() + "/" + (now.getMonth() + 1);
    }

    const state = oldaccount.solde > account.solde ? "loose" : "win";
    const percentage =
      ((account.solde - oldaccount.solde) / oldaccount.solde) * 100;
    const length = account.stats[state].date.length;
    if (
      length !== 0 &&
      account.stats[state].date[length - 1] === now.getDate()
    ) {
      account.stats[state].percent[length - 1] +=
        percentage > 0 ? percentage : -percentage;
    } else {
      account.stats[state].percent.push(
        percentage > 0 ? percentage : -percentage
      );
      account.stats[state].date.push(now.getDate());
    }
  }
  next();
});

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
