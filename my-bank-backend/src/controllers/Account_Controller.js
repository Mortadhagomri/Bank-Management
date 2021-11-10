const express = require("express");
const Account = require("../entities/Account");
const Client = require("../entities/Client");
const auth = require("../middleware/auth");
const router = new express.Router();

//Gets

//consulter tous les comptes(admin)
// id d'un clinet
router.get("/accounts/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: { message: "Clients have no rights to access this api" },
    });
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res
        .status(400)
        .send({ error: { message: "Please verify your Id" } });
    }
    await client.populate("accounts").execPopulate();
    res.status(200).send(client.accounts);
  } catch (e) {
    res.status(500).send(e);
  }
});

//consulter les comptes (clients)
router.get("/accounts", auth, async (req, res) => {
  try {
    await req.client.populate("accounts").execPopulate();
    res.status(200).send(req.client.accounts);
  } catch (e) {
    res.status(500).send(e);
  }
});

//consulter un compte(admin/client)
//account's id
router.get("/account/:Num", auth, async (req, res) => {
  const Num = parseInt(req.params.Num);
  try {
    const account = await Account.findOne({ account_num: Num });
    res.status(200).send(account);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Posts(admin)
router.post("/accounts", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: { message: "Clients have no rights to access this api" },
    });
  try {
    const compte = await new Account(req.body).save();
    res.status(200).send(compte);
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete(admin)
router.delete("/accounts/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: "Clients have no rights to access this api",
    });
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account)
      return res
        .status(400)
        .send({ error: { message: "Please verify your Id" } });
    res.status(200).send(account);
  } catch (e) {
    res.status(500).send(e);
  }
});

//patch(admin/client)
router.patch("/accounts/:id", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    let account = await Account.findById(req.params.id);
    if (!account)
      return res.status(400).send({ error: "Please verify your Id" });
    updates.forEach((update) => {
      account[update] = req.body[update];
    });
    await account.save();
    res.status(200).send(account);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
