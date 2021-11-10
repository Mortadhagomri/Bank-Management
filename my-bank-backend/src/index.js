const express = require("express");
require("./db/mongoose");




const hisRouter = require("./controllers/History_Controller");
const clientRouter = require("./controllers/Client_Controller");
const accountRouter = require("./controllers/Account_Controller");
const carteRouter = require("./controllers/Carte_Controller");
const virRouter = require("./controllers/Virements_Controller");

const app = express();

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type,Authorization, Accept"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PATCH, PUT, POST, DELETE, OPTIONS"
  );
  next();
});

app.use(express.json());
app.use(clientRouter);
app.use(accountRouter);
app.use(carteRouter);
app.use(virRouter);
app.use(hisRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log("Server is up on port: " + port);
});
