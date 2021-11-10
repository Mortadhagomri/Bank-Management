const express = require("express");
const Client = require("../entities/Client");
const auth = require("../middleware/auth");
const { sendEmail } = require("../Messages/email");
const router = new express.Router();

//login
router.post("/login", async (req, res) => {
	
  try {
    const user = await Client.findByCredentials(
      req.body.cin,
      req.body.password
    );
	
    if (!user)
      return res.status(400).send({ errors: "Please verify your information" });
    const token = await user.generateAuthToken();
    res.status(200).send({ token });
  } catch (e) {
    res.status(500).send(e);
  }
});



//Gets

//consulter tous les clients(admin)
router.get("/clients", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      errors: "Clients have no rights to access this api",
    });
  try {
    const clients = await Client.find({ role: "Client" });
    if (!clients)
      return res.status(400).send({ errors: "Something went wrong !" });
    res.status(200).send(clients);
  } catch (e) {
    res.status(500).send(e);
  }
});

//consulter un client(admin)
router.get("/clients/:id", auth, async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client)
      return res.status(400).send({ error: "Please verify your informations" });
    res.status(200).send(client);
  } catch (e) {
    res.status(500).send(e);
  }
});

//profile (admin/client)
router.get("/profil", auth, async (req, res) => {
  try {
    res.status(200).send(req.client);
  } catch (e) {
    res.status(500).send(e);
  }
});

//Posts(admin)
router.post("/clients", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: "Clients have no rights to access this api",
    });
  try {
    const exist1 = await Client.findOne({
      telephone: req.body.telephone,
    });
    const exist2 = await Client.findOne({
      email: req.body.email,
    });
    const exist3 = await Client.findOne({
      cin: req.body.cin,
    });

    if (exist1 || exist2 || exist3)
      return res.status(401).send({
        error: "User already exists, Check Cin, Email or Phone nmuber",
      });
    const client = await new Client(req.body).save();
    res.status(200).send(client);
  } catch (e) {
    res.status(500).send(e);
  }
});

//delete(admin)
router.delete("/clients/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: "Clients have no rights to access this api",
    });
  try {
    const client = await Client.findById({ _id: req.params.id });
    if (!client) return res.status(400).send();
    await client.remove();
    res.status(200).send(client);
  } catch (e) {
    res.status(500).send(e);
  }
});

//patch(admin)
router.patch("/clients/:id", auth, async (req, res) => {
  if (req.client.role === "Client")
    return res.status(400).send({
      error: "Clients have no rights to access this api",
    });
  const updates = Object.keys(req.body);

  try {
    const client = await Client.findById(req.params.id);
    if (!client)
      return res.status(400).send({ error: "Please Verify your informations" });

    updates.forEach((update) => {
      client[update] = req.body[update];
    });
    await client.save();
    res.status(200).send(client);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
