const express = require("express");
const Account = require("../entities/Account");
const History = require("../entities/History");
const auth = require("../middleware/auth");
const router = new express.Router();

//Posts(clients/admin)
router.post("/virAccs", auth, async (req, res) => {
  const { NumAcc1, NumAcc2, gain } = req.body;
  try {
    const looser = await Account.findOne({ account_num: NumAcc1 });
    const winner = await Account.findOne({ account_num: NumAcc2 });
    if (!looser || !winner || looser.solde < gain) {
      return res
        .status(400)
        .send({ error: "Please verify your informations " });
    }
    if (looser.blocked || winner.blocked)
      return res
        .status(400)
        .send({ error: "You cant transform with blocked accounts" });
    const olds = [looser.solde, winner.solde];

    looser.solde -= gain;
    await looser.save();
    winner.solde += gain;
    await winner.save();

    res.send("Your request has complished");
    if (!(looser.owner.toString() === winner.owner.toString())) {
      await History({
        action:
          "You lost Some money equals to " +
          gain +
          "DT in acc:" +
          looser.account_num +
          " old:" +
          olds[0] +
          "DT  new:" +
          looser.solde +
          "DT",
        owner: looser.owner,
      }).save();
      await new History({
        action:
          "You won Some money equals to " +
          gain +
          "DT in acc:" +
          winner.account_num +
          " old:" +
          olds[1] +
          "DT  new:" +
          winner.solde +
          "DT",
        owner: winner.owner,
      }).save();
    } else
      await History({
        action:
          "You have transformed " +
          gain +
          "DT from acc:" +
          looser.account_num +
          " to acc:" +
          winner.account_num,
        owner: looser.owner,
      }).save();
  } catch (e) {
    res.send(e);
  }
});

module.exports = router;
