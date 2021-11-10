const express = require("express");
const Carte = require("../entities/Carte");
const auth = require("../middleware/auth");
const router = new express.Router();

//login(destri)
router.post("/distLogin", async (req, res) => {
  try {
    const user = await Carte.findByCredentials(
      req.body.Num_Carte,
      req.body.passCode
    );
    if (!user) res.status(400).send();
    const token = await user.generateAuthToken(user);
    res.status(200).send({ token });
  } catch (e) {
    res.status(500).send(e);
  }
});

//clients
router.get("/carte", auth, async (req, res) => {
  try {
    const carte = await Carte.findOne({ owner: req.client_id });
    if (!carte)
      return res.status(400).send({ errors: "Please verify your Id" });
    res.status(200).send(carte);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Admin
router.get("/carte/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      errors: "Clients have no rights to access this api",
    });
  try {
    const carte = await Carte.findOne({ owner: req.params.id });
    if (!carte)
      return res.status(400).send({ errors: "Please verify your Id" });
    res.status(200).send(carte);
  } catch (e) {
    res.status(500).send(e);
  }
});

//posts(admin)
router.post("/carte", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      errors: "Clients have no rights to access this api",
    });
  try {
    const carte = await new Carte(req.body).save();
    res.status(200).send(carte);
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete(admin)
router.delete("/carte/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      errors: "Clients have no rights to access this api",
    });
  try {
    const carte = await Carte.findOneAndRemove({ owner: req.params.id });
    if (!carte) return res.status(400).send();
    await carte.remove();
    res.status(200).send(carte);
  } catch (e) {
    res.status(500).send(e);
  }
});

//patch(admin)
router.patch("/carte/:id", auth, async (req, res) => {
  try {
    const carte = await Carte.findById(req.params.id);
    const updates = Object.keys(req.body);
    if (!carte)
      return res.status(400).send({ errors: "Please verify your Id" });
    updates.forEach((update) => {
      carte[update] = req.body[update];
    });
    await carte.save();
    res.status(200).send(carte);
  } catch (e) {
    res.status(500).send(e);
  }
});
module.exports = router;
