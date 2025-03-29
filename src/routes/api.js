const express = require("express");
const api = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

//  ROUTES
api.use("/", require("./root"));
api.use("/register", require("./register"));
api.use("/auth", require("./auth"));
api.use("/refresh", require("./refresh"));
api.use("/logout", require("./logout"));

api.use(verifyJWT);
api.use("/products", require("./API/products"));
api.use("/categories", require("./API/categories"));
api.use("/orders", require("./API/orders"));
api.use("/users", require("./API/users"));

module.exports = api;
