const jwt = require("jsonwebtoken");
const Client = require("../entities/Client");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) throw new Error();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const client = await Client.findOne({
      _id: decoded._id,
    });

    if (!client) throw new Error();
    req.client = client;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate" });
  }
};

module.exports = auth;
