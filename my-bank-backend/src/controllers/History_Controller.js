const express = require("express");
const Client = require("../entities/Client");
const auth = require("../middleware/auth");
const router = new express.Router();

//get(admin)

router.get("/History/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res
      .status(400)
      .send({ error: "Clients have no rights to access this api" });
  try {
    const client = await Client.findById(req.params.id);
    if (!client)
      return res.status(400).send({ error: "Please verify your Id" });
    await client
      .populate({
        path: "historique",
        options: { sort: { createdAt: -1 } }
      })
      .execPopulate();
    res.status(200).send(client.historique);
  } catch (e) {
    res.status(200).send(e);
  }
});

//get (client)
router.get("/History", auth, async (req, res) => {
  try {
    await req.client
      .populate({
        path: "historique",
        options: { limit: 3, sort: { createdAt: -1 } }
      })
      .execPopulate();
    res.status(200).send(req.client.historique);
  } catch (e) {
    res.status(200).send(e);
  }
});

module.exports = router;
